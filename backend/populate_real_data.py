import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

INSFORGE_BASE_URL = os.getenv("INSFORGE_BASE_URL", "").rstrip("/")
INSFORGE_API_KEY = os.getenv("INSFORGE_API_KEY", "")
RECORDS_URL = f"{INSFORGE_BASE_URL}/api/database/records"

HEADERS = {
    "Authorization": f"Bearer {INSFORGE_API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

REAL_MEDICINES = [
    {
        "name": "Warfarin",
        "active_ingredient": "Warfarin sodium",
        "uses": "Prevention and treatment of blood clots, including deep vein thrombosis, pulmonary embolism, and thromboembolism with atrial fibrillation.",
        "warnings": "Narrow therapeutic index. Requires regular INR monitoring. Major bleeding risk. Many foods and drugs interact.",
        "side_effects": "Bleeding, unusual bruising, hematuria, melena, fatigue.",
        "allergy_notes": "Contraindicated in patients with active hemorrhage or known warfarin hypersensitivity.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Aspirin",
        "active_ingredient": "Acetylsalicylic acid",
        "uses": "Relief of mild to moderate pain, fever, inflammation; secondary prevention of myocardial infarction and ischemic stroke.",
        "warnings": "Risk of serious gastrointestinal ulceration and bleeding. Avoid in children and teenagers due to Reye's syndrome risk.",
        "side_effects": "Dyspepsia, epigastric distress, occult bleeding, tinnitus.",
        "allergy_notes": "Contraindicated in aspirin triad (asthma, rhinitis, nasal polyps) or severe salicylate allergy.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Ibuprofen",
        "active_ingredient": "Ibuprofen",
        "uses": "Treatment of mild to moderate pain, inflammation, rheumatoid arthritis, osteoarthritis, and reduction of fever.",
        "warnings": "Boxed warning for cardiovascular thrombotic events and gastrointestinal bleeding. Use with caution in kidney impairment.",
        "side_effects": "Nausea, epigastric pain, heartburn, fluid retention, dizziness.",
        "allergy_notes": "Contraindicated in patients with previous asthma or urticaria triggered by aspirin or other NSAIDs.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Acetaminophen",
        "active_ingredient": "Acetaminophen (Paracetamol)",
        "uses": "Treatment of mild to moderate pain (headache, muscle ache, toothache) and temporary reduction of fever.",
        "warnings": "Severe liver damage may occur if exceeding 4,000 mg in 24 hours, taken with other acetaminophen products, or with 3+ alcoholic drinks daily.",
        "side_effects": "Rare at therapeutic doses; nausea, rash, elevated transaminases.",
        "allergy_notes": "May cause severe skin reactions (Stevens-Johnson syndrome, toxic epidermal necrolysis); discontinue if rash occurs.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Metformin",
        "active_ingredient": "Metformin hydrochloride",
        "uses": "First-line oral treatment for glycemic control in adults with type 2 diabetes mellitus.",
        "warnings": "Boxed warning for lactic acidosis. Avoid in severe renal impairment (eGFR < 30 mL/min/1.73m2) or during acute metabolic acidosis.",
        "side_effects": "Diarrhea, nausea, vomiting, abdominal flatulence, metallic taste, vitamin B12 deficiency.",
        "allergy_notes": "Contraindicated in patients with hypersensitivity to metformin hydrochloride.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Lisinopril",
        "active_ingredient": "Lisinopril",
        "uses": "Treatment of hypertension, adjunctive therapy in heart failure, and improvement of survival post-myocardial infarction.",
        "warnings": "Boxed warning for fetal toxicity; discontinue immediately if pregnancy is detected. Risk of hyperkalemia and renal impairment.",
        "side_effects": "Persistent dry cough, dizziness, headache, hypotension, fatigue.",
        "allergy_notes": "Contraindicated in patients with a history of angioedema related to previous ACE inhibitor treatment.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Atorvastatin",
        "active_ingredient": "Atorvastatin calcium",
        "uses": "Primary and secondary prevention of cardiovascular events, reduction of elevated total-C, LDL-C, and triglycerides.",
        "warnings": "Risk of myopathy and rhabdomyolysis. Immune-mediated necrotizing myopathy (IMNM) reported rarely. Monitor liver function.",
        "side_effects": "Myalgia, arthralgia, diarrhea, nasopharyngitis, dyspepsia.",
        "allergy_notes": "Contraindicated in hypersensitivity to atorvastatin or in active liver disease.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Omeprazole",
        "active_ingredient": "Omeprazole magnesium",
        "uses": "Treatment of gastroesophageal reflux disease (GERD), erosive esophagitis, duodenal ulcers, and Zollinger-Ellison syndrome.",
        "warnings": "Long-term therapy associated with hypomagnesemia, bone fractures, Clostridioides difficile-associated diarrhea, and fundic gland polyps.",
        "side_effects": "Headache, abdominal pain, diarrhea, flatulence, nausea, vomiting.",
        "allergy_notes": "Contraindicated with known hypersensitivity to substituted benzimidazoles.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Amoxicillin",
        "active_ingredient": "Amoxicillin trihydrate",
        "uses": "Treatment of bacterial infections of the ear, nose, throat, respiratory tract, and skin caused by susceptible strains.",
        "warnings": "Serious and occasionally fatal anaphylactic reactions reported. Clostridioides difficile-associated diarrhea may occur.",
        "side_effects": "Nausea, vomiting, diarrhea, skin rash, pruritus.",
        "allergy_notes": "Contraindicated in individuals with a history of serious hypersensitivity to beta-lactam antibiotics (e.g. penicillins, cephalosporins).",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Ciprofloxacin",
        "active_ingredient": "Ciprofloxacin hydrochloride",
        "uses": "Treatment of designated bacterial infections including urinary tract infections, prostatitis, and bone/joint infections.",
        "warnings": "Boxed warnings for tendinitis, tendon rupture, peripheral neuropathy, CNS effects, and exacerbation of myasthenia gravis.",
        "side_effects": "Nausea, diarrhea, elevated transaminases, vomiting, rash.",
        "allergy_notes": "Contraindicated in patients with hypersensitivity to ciprofloxacin or other quinolones.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Sertraline",
        "active_ingredient": "Sertraline hydrochloride",
        "uses": "Treatment of major depressive disorder, obsessive-compulsive disorder, panic disorder, PTSD, and social anxiety disorder.",
        "warnings": "Boxed warning for suicidal thoughts in children, adolescents, and young adults. Risk of serotonin syndrome and bleeding.",
        "side_effects": "Nausea, diarrhea, tremor, insomnia, somnolence, sexual dysfunction.",
        "allergy_notes": "Contraindicated in patients taking MAOIs or pimozide, or with hypersensitivity to sertraline.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Digoxin",
        "active_ingredient": "Digoxin",
        "uses": "Treatment of mild to moderate heart failure in adults and control of ventricular response rate in chronic atrial fibrillation.",
        "warnings": "Very narrow therapeutic index. Hypokalemia, hypomagnesemia, and hypercalcemia predispose to digoxin toxicity.",
        "side_effects": "Nausea, vomiting, visual halos or yellow-green vision, cardiac dysrhythmias, dizziness.",
        "allergy_notes": "Contraindicated in ventricular fibrillation or known digitalis hypersensitivity.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Clopidogrel",
        "active_ingredient": "Clopidogrel bisulfate",
        "uses": "Reduction of atherothrombotic events in acute coronary syndrome (ACS), recent MI, recent stroke, or peripheral arterial disease.",
        "warnings": "Boxed warning: diminished antiplatelet effect in CYP2C19 poor metabolizers. Significant bleeding risk.",
        "side_effects": "Bleeding, epistaxis, hematoma, bruising, dyspepsia.",
        "allergy_notes": "Contraindicated in active pathological bleeding (e.g. peptic ulcer) or hypersensitivity to clopidogrel.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Methotrexate",
        "active_ingredient": "Methotrexate",
        "uses": "Management of severe rheumatoid arthritis, severe psoriasis, and various neoplastic conditions.",
        "warnings": "Boxed warnings for bone marrow suppression, hepatotoxicity, pulmonary toxicity, and opportunistic infections. Teratogenic.",
        "side_effects": "Ulcerative stomatitis, leukopenia, nausea, abdominal distress, elevated liver enzymes.",
        "allergy_notes": "Contraindicated in pregnancy for non-oncology conditions, severe renal/hepatic impairment, or methotrexate hypersensitivity.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Sildenafil",
        "active_ingredient": "Sildenafil citrate",
        "uses": "Treatment of erectile dysfunction; also used under separate formulation for pulmonary arterial hypertension.",
        "warnings": "Concomitant organic nitrates cause life-threatening hypotension. Risk of non-arteritic anterior ischemic optic neuropathy (NAION) and priapism.",
        "side_effects": "Headache, flushing, dyspepsia, nasal congestion, altered vision (blue tint).",
        "allergy_notes": "Contraindicated in patients with hypersensitivity to sildenafil or any component.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Nitroglycerin",
        "active_ingredient": "Nitroglycerin",
        "uses": "Acute relief and prophylaxis of angina pectoris due to coronary artery disease.",
        "warnings": "Severe hypotension and syncope may occur. Headache is common and a sign of vascular activity.",
        "side_effects": "Throbbing headache, lightheadedness, hypotension, tachycardia, dizziness.",
        "allergy_notes": "Contraindicated in patients with severe anemia, increased intracranial pressure, or hypersensitivity to nitrates.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Levothyroxine",
        "active_ingredient": "Levothyroxine sodium",
        "uses": "Replacement therapy in primary, secondary, and tertiary congenital or acquired hypothyroidism.",
        "warnings": "Boxed warning: not to be used for the treatment of obesity or weight loss. Overtreatment may cause adverse cardiovascular effects.",
        "side_effects": "Palpitations, tremor, insomnia, weight loss, heat intolerance (signs of excessive dose).",
        "allergy_notes": "Contraindicated in uncorrected adrenal cortical insufficiency or untreated thyrotoxicosis.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Simvastatin",
        "active_ingredient": "Simvastatin",
        "uses": "Reduction of elevated total cholesterol, LDL-C, and risk of cardiovascular death in coronary heart disease.",
        "warnings": "Risk of myopathy/rhabdomyolysis, particularly at 80 mg dose. Many CYP3A4-mediated drug interactions.",
        "side_effects": "Upper respiratory infection, headache, abdominal pain, constipation, nausea.",
        "allergy_notes": "Contraindicated in active liver disease or hypersensitivity to simvastatin.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Amlodipine",
        "active_ingredient": "Amlodipine besylate",
        "uses": "Treatment of hypertension, chronic stable angina, and vasospastic (Prinzmetal's) angina.",
        "warnings": "Symptomatic hypotension possible, particularly in patients with severe aortic stenosis. Peripheral edema.",
        "side_effects": "Peripheral edema, dizziness, flushing, palpitations, fatigue.",
        "allergy_notes": "Contraindicated in known sensitivity to dihydropyridine calcium channel blockers.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Spironolactone",
        "active_ingredient": "Spironolactone",
        "uses": "Management of primary hyperaldosteronism, edematous conditions (heart failure, cirrhosis), and resistant hypertension.",
        "warnings": "Boxed warning for tumorigenicity in animal studies. Hyperkalemia is a serious and potentially fatal risk.",
        "side_effects": "Gynecomastia, hyperkalemia, dizziness, leg cramps, menstrual irregularities.",
        "allergy_notes": "Contraindicated in acute renal insufficiency, anuria, or progressive renal disease.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "name": "Potassium Chloride",
        "active_ingredient": "Potassium chloride",
        "uses": "Treatment and prophylaxis of hypokalemia with or without metabolic alkalosis.",
        "warnings": "Gastrointestinal ulceration and stenosis from solid oral dosage forms. Risk of fatal hyperkalemia.",
        "side_effects": "Nausea, vomiting, flatulence, abdominal discomfort, diarrhea.",
        "allergy_notes": "Contraindicated in hyperkalemia, severe renal impairment, or untreated Addison's disease.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
]

REAL_INTERACTIONS = [
    {
        "med_a": "Warfarin",
        "med_b": "Aspirin",
        "severity": "Major",
        "description": "Concomitant use markedly increases the risk of severe gastrointestinal and other major bleeding due to additive anticoagulant and antiplatelet actions.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Warfarin",
        "med_b": "Ibuprofen",
        "severity": "Major",
        "description": "NSAIDs inhibit platelet function and can cause mucosal injury, significantly enhancing the anticoagulant risk and severe hemorrhage with warfarin.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Warfarin",
        "med_b": "Ciprofloxacin",
        "severity": "Major",
        "description": "Ciprofloxacin inhibits CYP1A2 and alters gut flora, significantly potentiating warfarin anticoagulant effects and causing marked elevation in INR.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Sildenafil",
        "med_b": "Nitroglycerin",
        "severity": "Major",
        "description": "Concomitant administration of organic nitrates and PDE5 inhibitors causes severe and life-threatening systemic vasodilation and profound hypotension.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Lisinopril",
        "med_b": "Spironolactone",
        "severity": "Major",
        "description": "Concurrent use of ACE inhibitors and potassium-sparing diuretics substantially increases the risk of life-threatening hyperkalemia. Strict serum potassium monitoring required.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Lisinopril",
        "med_b": "Potassium Chloride",
        "severity": "Major",
        "description": "ACE inhibitors reduce aldosterone secretion, impairing potassium excretion. Supplementing potassium concurrently carries high risk of dangerous hyperkalemia.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Lisinopril",
        "med_b": "Ibuprofen",
        "severity": "Moderate",
        "description": "NSAIDs can attenuate the antihypertensive efficacy of ACE inhibitors and increase the risk of deterioration of renal function, including acute renal failure.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Clopidogrel",
        "med_b": "Omeprazole",
        "severity": "Major",
        "description": "Omeprazole significantly inhibits CYP2C19, decreasing plasma levels of the active metabolite of clopidogrel and reducing its antiplatelet protection against cardiac events.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Methotrexate",
        "med_b": "Ibuprofen",
        "severity": "Major",
        "description": "NSAIDs reduce renal perfusion and compete for renal tubular secretion of methotrexate, leading to elevated methotrexate serum levels and severe bone marrow and GI toxicity.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Methotrexate",
        "med_b": "Aspirin",
        "severity": "Major",
        "description": "Salicylates displace methotrexate from albumin binding and impair its renal clearance, causing significant methotrexate toxicity.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Simvastatin",
        "med_b": "Amlodipine",
        "severity": "Moderate",
        "description": "Amlodipine increases systemic exposure to simvastatin via CYP3A4 competition; simvastatin dose should be limited to a maximum of 20 mg daily to prevent myopathy.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Digoxin",
        "med_b": "Ciprofloxacin",
        "severity": "Moderate",
        "description": "Ciprofloxacin can alter renal clearance or P-glycoprotein transport of digoxin, leading to elevated serum digoxin levels and risk of toxic arrhythmias.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Sertraline",
        "med_b": "Aspirin",
        "severity": "Moderate",
        "description": "Combined use of SSRIs and aspirin impairs platelet aggregation through dual mechanisms, increasing the risk of upper gastrointestinal bleeding.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Sertraline",
        "med_b": "Ibuprofen",
        "severity": "Moderate",
        "description": "Coadministration of SSRIs with NSAIDs is associated with a significantly elevated incidence of gastrointestinal ulceration and bleeding events.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Levothyroxine",
        "med_b": "Omeprazole",
        "severity": "Moderate",
        "description": "Proton pump inhibitors elevate intragastric pH, decreasing the absorption of levothyroxine sodium and requiring increased levothyroxine monitoring or dosage adjustments.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
    {
        "med_a": "Atorvastatin",
        "med_b": "Clopidogrel",
        "severity": "Minor",
        "description": "Mild interaction; monitor lipid therapy and clinical antiplatelet effectiveness as clinically indicated.",
        "source_name": "FDA Drug Labels",
        "source_date": "2025-01-15",
    },
]


def request(method, table, *, params=None, json=None, prefer=None):
    headers = dict(HEADERS)
    if prefer:
        headers["Prefer"] = prefer

    response = requests.request(
        method,
        f"{RECORDS_URL}/{table}",
        headers=headers,
        params=params,
        json=json,
        timeout=25,
    )
    if not response.ok:
        raise RuntimeError(
            f"{method} {table} failed with HTTP {response.status_code}: {response.text}"
        )
    if not response.content:
        return []
    return response.json()


def populate():
    print("Checking existing medicines...")
    existing_meds = request("GET", "medicines", params={"select": "id,name"})
    med_map = {m["name"].lower(): m["id"] for m in existing_meds}
    print(f"Found {len(med_map)} existing medicines in database.")

    # Insert or update real medicines
    for med in REAL_MEDICINES:
        name_lower = med["name"].lower()
        if name_lower in med_map:
            # Update existing record
            med_id = med_map[name_lower]
            request(
                "PATCH",
                "medicines",
                params={"id": f"eq.{med_id}"},
                json=med,
                prefer="return=representation",
            )
            print(f"Updated medicine: {med['name']} (id={med_id})")
        else:
            inserted = request(
                "POST",
                "medicines",
                json=[med],
                prefer="return=representation",
            )
            if inserted:
                new_id = inserted[0]["id"]
                med_map[name_lower] = new_id
                print(f"Inserted new medicine: {med['name']} (id={new_id})")

    # Refresh map
    existing_meds = request("GET", "medicines", params={"select": "id,name"})
    med_map = {m["name"].lower(): m["id"] for m in existing_meds}

    print(f"\nPopulating interactions...")
    existing_interactions = request("GET", "interactions", params={"select": "id,medicine_a_id,medicine_b_id"})
    pair_set = set()
    for row in existing_interactions:
        pair_set.add((row["medicine_a_id"], row["medicine_b_id"]))
        pair_set.add((row["medicine_b_id"], row["medicine_a_id"]))

    added_interactions = 0
    for item in REAL_INTERACTIONS:
        id_a = med_map.get(item["med_a"].lower())
        id_b = med_map.get(item["med_b"].lower())
        if not id_a or not id_b:
            print(f"Skipping interaction {item['med_a']} + {item['med_b']}: medicine missing")
            continue

        if (id_a, id_b) in pair_set:
            print(f"Interaction {item['med_a']} + {item['med_b']} already exists.")
            continue

        record = {
            "medicine_a_id": id_a,
            "medicine_b_id": id_b,
            "severity": item["severity"],
            "description": item["description"],
            "source_name": item["source_name"],
            "source_date": item["source_date"],
        }
        request("POST", "interactions", json=[record], prefer="return=representation")
        pair_set.add((id_a, id_b))
        pair_set.add((id_b, id_a))
        added_interactions += 1
        print(f"Added interaction: {item['med_a']} + {item['med_b']} [{item['severity']}]")

    print(f"\nPopulation complete! Total medicines: {len(med_map)}, Total added interactions: {added_interactions}")


if __name__ == "__main__":
    populate()
