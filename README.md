# MedSafe 💊

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![InsForge](https://img.shields.io/badge/Backend-InsForge-059669.svg)](https://insforge.dev)

**MedSafe** is a modern, responsive web application designed to help patients, caregivers, and healthcare professionals search medicines, manage active medicine regimens, and review pairwise drug-drug interactions documented from official FDA drug labels.

---

## ✨ Features

- **🔍 Smart Medicine Search:** Search across brand names and active pharmaceutical ingredients with instant suggestions and comprehensive drug profiles.
- **📋 Personal Medicine Regimen:** Add and organize medicines in a personalized list with secure cloud synchronization.
- **⚡ Pairwise Interaction Engine:** Automated combination checker that evaluates every pair in your active list against documented drug interactions with clinical severity levels (*Major*, *Moderate*, *Minor*).
- **📚 FDA Label Evidence & References:** Traceable interaction notes with documented pharmacological mechanisms, management strategies, and source citations.
- **🛡️ Secure Role-Based Administration:** Dedicated Admin dashboard restricted strictly to authorized clinical curators for adding new medicines and registering interaction pairs.
- **🎨 Modern Clinical UI:** Clean, accessible design system featuring a soothing health-tech green palette, glassmorphism header, and dynamic active navigation highlights.

---

## 🏗️ Architecture

```
                       ┌──────────────────────────────┐
                       │     MedSafe Web Client       │
                       │    (React 19 + Vite SPA)     │
                       └──────────────┬───────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │ HTTPS                                   │ HTTPS
                 ▼                                         ▼
    ┌─────────────────────────┐               ┌─────────────────────────┐
    │     FastAPI Backend     │               │   InsForge Cloud BaaS   │
    │ (Interaction Engine &   ├──────────────►│ (PostgreSQL, Auth &     │
    │  Admin Validation API)  │  Service Key  │  User Lists Storage)    │
    └─────────────────────────┘               └─────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Design System:** Custom CSS token architecture (responsive, accessible, dark/light contract)
- **Auth & Storage Client:** `@insforge/sdk`

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn
- **Validation:** Pydantic
- **HTTP Client:** Requests

### Database & Auth
- **BaaS Platform:** [InsForge](https://insforge.dev)
- **Database:** Cloud PostgreSQL
- **Security:** JWT Authentication, Row-Level Security (RLS)

---

## 📁 Project Structure

```text
medsafe-project/
├── backend/
│   ├── main.py              # FastAPI application & interaction checker logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Layout, Modal, etc.)
│   │   ├── pages/           # Application views (Home, Search, Regimen, Admin, etc.)
│   │   ├── styles/          # Design tokens and global CSS
│   │   ├── lib/             # InsForge SDK client initialization
│   │   ├── config.js        # API endpoints and application constants
│   │   ├── App.jsx          # Route configuration
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets and icons
│   ├── vercel.json          # Vercel SPA routing configuration
│   ├── package.json         # NPM dependencies & scripts
│   └── vite.config.js       # Vite build configuration
├── .env.example             # Backend environment template
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0 or later) & `npm`
- **Python** (v3.10 or later) & `pip`
- An active [InsForge](https://insforge.dev) project

---

### 1. Clone the Repository

```bash
git clone https://github.com/dti-tech-hub/medsafe-project.git
cd medsafe
```

---

### 2. Configure Environment Variables

#### Root / Backend Configuration
Create a `.env` file in the root directory:
Populate `.env` with your InsForge credentials:
```env
INSFORGE_BASE_URL=https://your-project.insforge.app
INSFORGE_ANON_KEY=your_insforge_anon_key
INSFORGE_API_KEY=your_insforge_api_key
```

#### Frontend Configuration
Create a `frontend/.env` file:
Populate `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_INSFORGE_URL=https://your-project.insforge.app
VITE_INSFORGE_ANON_KEY=your_insforge_anon_key
```

---

### 3. Run the Backend

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --port 8000
```
The API server will run at `http://127.0.0.1:8000`. You can inspect the auto-generated OpenAPI documentation at `http://127.0.0.1:8000/docs`.

---

### 4. Run the Frontend

Open a second terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The application will be live at `http://localhost:5173`.

---

## 🔐 Administrator Access

MedSafe features strict, multi-tiered authorization:
- Only the email specified in `ADMIN_EMAIL` (`admin@medsafe.org`) can view the `/admin` navigation link and access administrative routes.
- The FastAPI backend validates the caller's session token directly against InsForge on all administrative mutating endpoints (`/api/admin/*`).
- Non-admin users attempting to call admin endpoints receive `403 Forbidden`.

---

## 🌐 Deployment

### Backend on [Render](https://medsafe-project-0mzy.onrender.com)
### Frontend on [Vercel](https://medsafe-project.vercel.app/)

---

## ⚠️ Medical Disclaimer

> **IMPORTANT:** MedSafe is an informational and educational reference tool based on documented FDA drug label data. It is **not** a substitute for professional clinical judgment, diagnosis, or treatment. It does not evaluate patient-specific factors such as dosage, renal or hepatic clearance, pregnancy status, or genetic variations. Always consult a qualified physician or licensed pharmacist regarding medical concerns or prescription changes.

---

