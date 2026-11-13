import os
from datetime import date, datetime, timezone
from itertools import combinations

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

INSFORGE_BASE_URL = os.getenv("INSFORGE_BASE_URL", "").rstrip("/")
INSFORGE_ANON_KEY = os.getenv("INSFORGE_ANON_KEY", "")
INSFORGE_API_KEY = os.getenv("INSFORGE_API_KEY", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@medsafe.org").strip().lower()
RECORDS_URL = f"{INSFORGE_BASE_URL}/api/database/records"
CURRENT_SESSION_URL = f"{INSFORGE_BASE_URL}/api/auth/sessions/current"

DISCLAIMER = "Always consult a pharmacist or doctor."
NO_INTERACTION_MESSAGE = "No documented interaction found in this source"

app = FastAPI(title="MedSafe Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SavedListRequest(BaseModel):
    medicine_ids: list[int] = Field(default_factory=list)


class InteractionCheckRequest(BaseModel):
    medicine_ids: list[int] = Field(default_factory=list)


class MedicineCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    active_ingredient: str | None = None
    uses: str | None = None
    warnings: str | None = None
    side_effects: str | None = None
    allergy_notes: str | None = None
    source_name: str | None = None
    source_date: date | None = None


class InteractionCreateRequest(BaseModel):
    medicine_a_id: int
    medicine_b_id: int
    severity: str = Field(..., pattern="^(Major|Moderate|Minor)$")
    description: str = Field(..., min_length=5)
    source_name: str | None = "FDA Drug Labels"
    source_date: date | None = None


def _headers(extra=None, api_key=None):
    key = INSFORGE_ANON_KEY if api_key is None else api_key
    if not INSFORGE_BASE_URL or not key:
        raise HTTPException(
            status_code=500,
            detail="INSFORGE_BASE_URL and the required InsForge key must be set in .env",
        )
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def _error_detail(response):
    try:
        return response.json()
    except ValueError:
        return response.text or f"InsForge returned HTTP {response.status_code}"


def _request(method, table, *, params=None, json=None, extra_headers=None, api_key=None):
    try:
        response = requests.request(
            method,
            f"{RECORDS_URL}/{table}",
            headers=_headers(extra_headers, api_key=api_key),
            params=params,
            json=json,
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"InsForge request failed: {exc}")

    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail=_error_detail(response))

    if not response.content:
        return []

    try:
        return response.json()
    except ValueError:
        return []


def _current_user(request):
    authorization = request.headers.get("authorization", "")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    if not INSFORGE_BASE_URL:
        raise HTTPException(status_code=500, detail="INSFORGE_BASE_URL must be set in .env")

    try:
        response = requests.get(
            CURRENT_SESSION_URL,
            headers={"Authorization": authorization, "Accept": "application/json"},
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"InsForge auth request failed: {exc}")

    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    if not response.ok:
        raise HTTPException(status_code=502, detail=_error_detail(response))

    try:
        payload = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid auth response")

    user = payload.get("user") if isinstance(payload, dict) else None
    if not user and isinstance(payload, dict) and payload.get("id"):
        user = payload

    if not user or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return user


def _require_admin(request):
    user = _current_user(request)
    email = (user.get("email") or "").strip().lower()
    if not ADMIN_EMAIL or email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Admin privileges required. Only the authorized administrator can access this resource.",
        )
    return user


def _search_medicines(query):
    pattern = f"*{query}*"
    return _request(
        "GET",
        "medicines",
        params={
            "select": "*",
            "or": f"(name.ilike.{pattern},active_ingredient.ilike.{pattern})",
            "limit": "50",
        },
    )


def _find_interaction(first_id, second_id):
    for a_id, b_id in ((first_id, second_id), (second_id, first_id)):
        rows = _request(
            "GET",
            "interactions",
            params={
                "select": "*",
                "medicine_a_id": f"eq.{a_id}",
                "medicine_b_id": f"eq.{b_id}",
                "limit": "1",
            },
        )
        if rows:
            return rows[0]
    return None


def _medicines_by_ids(medicine_ids):
    ids = [int(medicine_id) for medicine_id in medicine_ids]
    if not ids:
        return []

    rows = _request(
        "GET",
        "medicines",
        params={
            "select": "*",
            "id": f"in.({','.join(str(medicine_id) for medicine_id in ids)})",
        },
    )
    order = {medicine_id: index for index, medicine_id in enumerate(ids)}
    return sorted(rows, key=lambda row: order.get(row.get("id"), len(order)))


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"disclaimer": DISCLAIMER, "detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"disclaimer": DISCLAIMER, "detail": exc.errors()},
    )


@app.get("/")
def root():
    return {
        "service": "MedSafe Checker API",
        "disclaimer": DISCLAIMER,
        "endpoints": [
            "GET /api/medicines",
            "GET /api/medicines/{id}",
            "GET /api/medicines/search?q={query}",
            "GET /api/sources/summary",
            "POST /api/lists/save",
            "GET /api/lists/me",
            "POST /api/interactions/check",
            "POST /api/admin/medicines",
            "POST /api/admin/interactions",
            "GET /api/admin/interactions",
        ],
    }


@app.get("/api/medicines/search")
def search_medicines(q: str = Query(..., min_length=1)):
    results = _search_medicines(q.strip())
    return {"disclaimer": DISCLAIMER, "query": q, "results": results}


@app.post("/api/lists/save")
def save_list(payload: SavedListRequest, request: Request):
    user = _current_user(request)
    record = {
        "user_id": user["id"],
        "medicine_ids": payload.medicine_ids,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    saved = _request(
        "POST",
        "saved_lists",
        params={"on_conflict": "user_id", "select": "*"},
        json=[record],
        extra_headers={"Prefer": "resolution=merge-duplicates,return=representation"},
        api_key=INSFORGE_API_KEY,
    )
    return {
        "disclaimer": DISCLAIMER,
        "saved_list": saved[0] if isinstance(saved, list) and saved else saved,
    }


@app.get("/api/lists/me")
def get_my_saved_list(request: Request):
    user = _current_user(request)
    rows = _request(
        "GET",
        "saved_lists",
        params={"select": "*", "user_id": f"eq.{user['id']}", "limit": "1"},
        api_key=INSFORGE_API_KEY,
    )
    saved_list = rows[0] if rows else None
    medicines = _medicines_by_ids(saved_list.get("medicine_ids", [])) if saved_list else []
    return {
        "disclaimer": DISCLAIMER,
        "saved_list": saved_list,
        "medicines": medicines,
    }


@app.post("/api/interactions/check")
def check_interactions(payload: InteractionCheckRequest):
    unique_ids = list(dict.fromkeys(payload.medicine_ids))
    results = []

    for first_id, second_id in combinations(unique_ids, 2):
        interaction = _find_interaction(first_id, second_id)
        if interaction:
            results.append(
                {
                    "medicine_a_id": first_id,
                    "medicine_b_id": second_id,
                    "found": True,
                    "severity": interaction.get("severity"),
                    "description": interaction.get("description"),
                    "source": interaction.get("source_name"),
                    "source_date": interaction.get("source_date"),
                }
            )
        else:
            results.append(
                {
                    "medicine_a_id": first_id,
                    "medicine_b_id": second_id,
                    "found": False,
                    "message": NO_INTERACTION_MESSAGE,
                }
            )

    return {
        "disclaimer": DISCLAIMER,
        "interactions": results,
        "has_interactions": any(result["found"] for result in results),
    }


@app.get("/api/medicines")
def list_medicines(limit: int = 100):
    rows = _request(
        "GET",
        "medicines",
        params={"select": "*", "order": "name.asc", "limit": str(limit)},
    )
    return {"disclaimer": DISCLAIMER, "medicines": rows}


@app.get("/api/medicines/{medicine_id}")
def get_medicine(medicine_id: int):
    rows = _request(
        "GET",
        "medicines",
        params={"select": "*", "id": f"eq.{medicine_id}", "limit": "1"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Medicine not found in reference records")
    return {"disclaimer": DISCLAIMER, "medicine": rows[0]}


@app.get("/api/sources/summary")
def get_sources_summary():
    meds = _request("GET", "medicines", params={"select": "id,source_name,source_date"})
    interactions = _request("GET", "interactions", params={"select": "id,source_name,source_date"})

    dates = [m.get("source_date") for m in meds if m.get("source_date")] + [
        i.get("source_date") for i in interactions if i.get("source_date")
    ]
    latest_date = max(dates) if dates else "2025-01-15"

    sources = list(
        {m.get("source_name") for m in meds if m.get("source_name")}
        | {i.get("source_name") for i in interactions if i.get("source_name")}
    )
    if not sources:
        sources = ["FDA Drug Labels"]

    return {
        "disclaimer": DISCLAIMER,
        "total_medicines": len(meds),
        "total_interactions": len(interactions),
        "primary_source": sources[0] if sources else "FDA Drug Labels",
        "sources": sorted(sources),
        "last_updated": latest_date,
        "version": f"v1.0 ({len(meds)} active catalogue entries)",
    }


@app.post("/api/admin/medicines", status_code=201)
def create_medicine(payload: MedicineCreateRequest, request: Request):
    _require_admin(request)
    record = payload.model_dump(mode="json", exclude_none=True)
    record["name"] = record["name"].strip()

    created = _request(
        "POST",
        "medicines",
        params={"select": "*"},
        json=[record],
        extra_headers={"Prefer": "return=representation"},
        api_key=INSFORGE_API_KEY,
    )
    return {
        "disclaimer": DISCLAIMER,
        "medicine": created[0] if isinstance(created, list) and created else created,
    }


@app.post("/api/admin/interactions", status_code=201)
def create_interaction(payload: InteractionCreateRequest, request: Request):
    _require_admin(request)
    if payload.medicine_a_id == payload.medicine_b_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot create an interaction between the same medicine",
        )

    existing = _find_interaction(payload.medicine_a_id, payload.medicine_b_id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An interaction record between these medicines already exists",
        )

    record = payload.model_dump(mode="json", exclude_none=True)
    created = _request(
        "POST",
        "interactions",
        params={"select": "*"},
        json=[record],
        extra_headers={"Prefer": "return=representation"},
        api_key=INSFORGE_API_KEY,
    )
    return {
        "disclaimer": DISCLAIMER,
        "interaction": created[0] if isinstance(created, list) and created else created,
    }


@app.get("/api/admin/interactions")
def list_interactions(request: Request, limit: int = 100):
    _require_admin(request)
    rows = _request(
        "GET",
        "interactions",
        params={"select": "*", "order": "id.desc", "limit": str(limit)},
    )
    return {"disclaimer": DISCLAIMER, "interactions": rows}
