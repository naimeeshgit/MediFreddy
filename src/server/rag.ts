import { MedicalRecord } from '../types.ts';

// Pre-seeded authentic medical history for Sharma Family
export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec_101',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Glycemic Control & HbA1c Panel',
    type: 'lab_report',
    date: '2026-08-15',
    doctorName: 'Dr. Sunita Rao (MD, Diabetology)',
    facilityName: 'Apollo Diagnostics Centre',
    summary: 'HbA1c at 6.8% showing fair glycemic control. Fasting blood sugar 126 mg/dL, Post-prandial 168 mg/dL.',
    rawText: `PATIENT: Rahul Sharma | AGE: 42 | GENDER: Male | REF BY: Dr. Sunita Rao
TEST: GLYCOSYLATED HEMOGLOBIN (HbA1c) & BLOOD GLUCOSE
- Glycated Hemoglobin (HbA1c): 6.8 % [Target for diabetic adults < 7.0%, Non-diabetic: < 5.7%]
- Estimated Average Glucose (eAG): 148 mg/dL
- Fasting Blood Sugar (FBS): 126 mg/dL [Normal: 70-99 mg/dL, Impaired: 100-125, Diabetic: >= 126]
- Post Prandial Blood Sugar (PPBS): 168 mg/dL [Target: < 180 mg/dL]
CLINICAL INTERPRETATION: Fair control of Type 2 Diabetes Mellitus. Continue Metformin 500mg SR twice daily with meals. Repeat HbA1c in 3 months. Dietary counseling: restrict refined carbohydrates.`,
    tags: ['diabetes', 'hba1c', 'sugar', 'glucose', 'fasting', 'metformin', 'apollo', 'rahul'],
    metrics: [
      { name: 'HbA1c', value: '6.8', unit: '%', status: 'elevated' },
      { name: 'Fasting Glucose', value: '126', unit: 'mg/dL', status: 'elevated' },
      { name: 'Post-Prandial Glucose', value: '168', unit: 'mg/dL', status: 'normal' },
    ],
    medications: [
      { name: 'Metformin 500mg SR', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: 'Ongoing' },
    ],
  },
  {
    id: 'rec_102',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Comprehensive Lipid Profile',
    type: 'lab_report',
    date: '2026-07-02',
    doctorName: 'Dr. Anand Mehta (DM, Cardiology)',
    facilityName: 'City Heart Institute & Diagnostics',
    summary: 'Borderline elevated Total Cholesterol (212 mg/dL) and LDL (138 mg/dL). HDL is 42 mg/dL, Triglycerides 178 mg/dL.',
    rawText: `PATIENT: Rahul Sharma | REF BY: Dr. Anand Mehta
TEST: LIPID PROFILE (SERUM)
- Total Cholesterol: 212 mg/dL [Desirable: < 200, Borderline: 200-239, High: >= 240]
- LDL Cholesterol (Calculated): 138 mg/dL [Optimal: < 100, Near optimal: 100-129, Borderline: 130-159]
- HDL Cholesterol: 42 mg/dL [Low: < 40, High: >= 60]
- Triglycerides: 178 mg/dL [Normal: < 150, Borderline High: 150-199]
- VLDL Cholesterol: 32 mg/dL [Normal: 5-40]
- Total Chol/HDL Ratio: 5.04
OPINION: Mild dyslipidemia secondary to metabolic syndrome. Recommended Rosuvastatin 10mg once daily at bedtime. 30 mins brisk walking 5 days/week.`,
    tags: ['cholesterol', 'lipid', 'ldl', 'hdl', 'triglycerides', 'heart', 'rosuvastatin', 'rahul'],
    metrics: [
      { name: 'Total Cholesterol', value: '212', unit: 'mg/dL', status: 'elevated' },
      { name: 'LDL Cholesterol', value: '138', unit: 'mg/dL', status: 'elevated' },
      { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', status: 'normal' },
      { name: 'Triglycerides', value: '178', unit: 'mg/dL', status: 'elevated' },
    ],
    medications: [
      { name: 'Rosuvastatin 10mg', dosage: '10mg', frequency: 'Once daily at bedtime (0-0-1)', duration: 'Ongoing' },
    ],
  },
  {
    id: 'rec_103',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Cardiology Consultation & Resting ECG',
    type: 'lab_report',
    date: '2026-05-20',
    doctorName: 'Dr. Anand Mehta (DM, Cardiology)',
    facilityName: 'City Heart & Vascular Hospital',
    summary: 'Resting BP 134/86 mmHg. 12-lead ECG normal sinus rhythm. Diagnosed with Mild Essential Hypertension.',
    rawText: `CONSULTATION NOTE - CARDIOLOGY
Patient: Rahul Sharma | Age: 42 | Gender: Male
Chief Complaints: Mild evening headache, routine cardiac fitness checkup.
Physical Examination:
- Blood Pressure: 134/86 mmHg (Sitting, Right arm)
- Heart Rate: 72 bpm, regular
- S1 S2 heard normal, no murmurs. Chest clear bilaterally.
ECG FINDINGS:
- Normal Sinus Rhythm, rate 74 bpm. Normal PR interval (160ms), QRS duration 88ms. No pathological Q waves, No ST segment depression or elevation. T waves normal.
DIAGNOSIS: Essential Hypertension (Stage 1), well-compensated.
PLAN:
1. Tab Telmisartan 40mg - 1 tab every morning after breakfast.
2. Low sodium diet (< 2g sodium/day). Avoid excess pickles and processed foods.
3. Review after 3 months with home BP diary.`,
    tags: ['blood pressure', 'bp', 'hypertension', 'ecg', 'heart', 'telmisartan', 'cardio', 'rahul'],
    metrics: [
      { name: 'Systolic BP', value: '134', unit: 'mmHg', status: 'normal' },
      { name: 'Diastolic BP', value: '86', unit: 'mmHg', status: 'normal' },
      { name: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' },
    ],
    medications: [
      { name: 'Telmisartan 40mg', dosage: '40mg', frequency: 'Once daily morning (1-0-0)', duration: 'Ongoing' },
    ],
  },
  {
    id: 'rec_104',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'CRITICAL ALERT: Documented Drug Allergies',
    type: 'allergy_note',
    date: '2025-11-10',
    doctorName: 'Dr. Rajesh Nair (MD, Internal Medicine)',
    facilityName: 'Apollo Hospital & Emergency',
    summary: 'DOCUMENTED SEVERE ALLERGY TO PENICILLIN AND AMOXICILLIN (Beta-lactams). Causes urticaria and bronchospasm.',
    rawText: `PATIENT ALLERGY DOSSIER - CRITICAL MEDICAL RECORD
Patient: Rahul Sharma | Blood Group: B Positive
DOCUMENTED ALLERGIES:
1. PENICILLIN & BETA-LACTAM ANTIBIOTICS:
   - Severity: High / Severe
   - Reaction: Diffuse erythematous urticarial rash, angioedema, wheezing/bronchospasm experienced in 2021 after Amoxicillin-Clavulanate administration.
   - CONTRAINDICATED DRUGS: Amoxicillin (Augmentin, Mox), Ampicillin, Penicillin G/V, Piperacillin-Tazobactam. Use Cephalosporins with extreme caution.
   - RECOMMENDED SAFE ALTERNATIVES FOR INFECTION: Azithromycin, Clarithromycin, Ciprofloxacin, Levofloxacin, Doxycycline.
2. SULFA DRUGS: Mild sensitivity noted (occasional skin flushing). Avoid high-dose Cotrimoxazole if alternatives exist.
3. FOOD ALLERGIES: None reported.`,
    tags: ['allergy', 'penicillin', 'amoxicillin', 'augmentin', 'reaction', 'contraindicated', 'safe antibiotics', 'azithromycin', 'rahul'],
    metrics: [],
  },
  {
    id: 'rec_105',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Active Master Prescription',
    type: 'prescription',
    date: '2026-08-15',
    doctorName: 'Dr. Sunita Rao & Dr. Anand Mehta',
    facilityName: 'Integrated Clinic Portal',
    summary: 'Current daily regimen: Metformin 500mg SR, Telmisartan 40mg, Rosuvastatin 10mg, Vitamin D3.',
    rawText: `CURRENT ACTIVE MEDICATIONS (Updated August 2026):
1. Tab Telmisartan 40mg (Brand: Telma 40)
   - Dose: 1 tablet daily in the morning after breakfast (1-0-0)
   - Indication: Essential Hypertension
2. Tab Metformin Hydrochloride 500mg SR (Brand: Glycomet 500 SR)
   - Dose: 1 tablet twice daily with breakfast and dinner (1-0-1)
   - Indication: Type 2 Diabetes Mellitus
3. Tab Rosuvastatin 10mg (Brand: Rozavel 10)
   - Dose: 1 tablet daily at bedtime (0-0-1)
   - Indication: Dyslipidemia / Cardiovascular prevention
4. Cap Vitamin D3 60,000 IU (Brand: Calcirol 60K)
   - Dose: 1 capsule once weekly on Sunday after milk for 8 weeks
   - Indication: Vitamin D deficiency maintenance
5. SOS (As needed): Tab Paracetamol 650mg (Dolo 650) for acute fever or body ache (Max 3/day).
NOTE: All Penicillin group antibiotics are strictly prohibited.`,
    tags: ['prescription', 'medicines', 'dosage', 'telmisartan', 'metformin', 'rosuvastatin', 'active medications', 'rahul'],
    medications: [
      { name: 'Telmisartan 40mg', dosage: '40mg', frequency: 'Morning 1-0-0', duration: 'Ongoing' },
      { name: 'Metformin 500mg SR', dosage: '500mg', frequency: 'Twice daily 1-0-1', duration: 'Ongoing' },
      { name: 'Rosuvastatin 10mg', dosage: '10mg', frequency: 'Night 0-0-1', duration: 'Ongoing' },
      { name: 'Vitamin D3 60K', dosage: '60000 IU', frequency: 'Weekly once', duration: '8 weeks' },
    ],
  },
  {
    id: 'rec_201',
    memberId: 'mem_ramesh',
    memberName: 'Ramesh Sharma',
    title: 'Post-Angioplasty Stent Follow-up & 2D Echo',
    type: 'lab_report',
    date: '2026-08-20',
    doctorName: 'Dr. Anand Mehta (DM, Cardiology)',
    facilityName: 'City Heart Institute',
    summary: 'Dad Ramesh (71y): Post-DES stent in LAD (2022). Good left ventricular systolic function (LVEF 55%). Patent stent, no wall motion abnormalities.',
    rawText: `CARDIOLOGY REPORT - POST-PCI REVIEW
Patient: Ramesh Sharma | Age: 71 | Gender: Male (Father)
Clinical Indication: Post-percutaneous coronary intervention (Drug-Eluting Stent in Mid LAD, 2022). Routine annual cardiology assessment.
2D ECHOCARDIOGRAPHY:
- Left Ventricular Ejection Fraction (LVEF): 55% (Good systolic function)
- Regional Wall Motion: Normal at rest
- Mitral Valve: Mild degenerative regurgitation
- Aortic Valve: Sclerotic, no significant gradient
- IVC: Collapsible > 50%
CURRENT MEDICATIONS FOR RAMESH SHARMA:
1. Tab Clopidogrel 75mg once daily after lunch (Antiplatelet)
2. Tab Atorvastatin 20mg once daily at night
3. Tab Amlodipine 5mg once daily in morning (BP control)
4. Tab Shelcal 500mg once daily
ADVICE: Strictly avoid Aspirin without proton pump inhibitor due to prior gastritis. Next review in 6 months.`,
    tags: ['ramesh', 'father', 'dad', 'stent', 'angioplasty', 'echo', 'heart', 'clopidogrel', 'atorvastatin', 'amlodipine', 'lvef'],
    metrics: [
      { name: 'LVEF', value: '55', unit: '%', status: 'normal' },
      { name: 'BP', value: '130/80', unit: 'mmHg', status: 'normal' },
    ],
    medications: [
      { name: 'Clopidogrel 75mg', dosage: '75mg', frequency: '1-0-0', duration: 'Ongoing' },
      { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1', duration: 'Ongoing' },
      { name: 'Amlodipine 5mg', dosage: '5mg', frequency: '1-0-0', duration: 'Ongoing' },
    ],
  },
  {
    id: 'rec_202',
    memberId: 'mem_sunita',
    memberName: 'Sunita Sharma',
    title: 'Thyroid Function Test & Migraine Profile',
    type: 'lab_report',
    date: '2026-09-02',
    doctorName: 'Dr. Priya Sharma (MD, Endocrinology)',
    facilityName: 'Manipal Health Diagnostics',
    summary: 'Sunita (39y, Wife): TSH at 5.8 mIU/L (Mild subclinical hypothyroidism). Managed with Thyronorm 25mcg. Migraine frequency reduced to 1 episode/month.',
    rawText: `ENDOCRINOLOGY & NEUROLOGY REPORT
Patient: Sunita Sharma | Age: 39 | Gender: Female (Wife)
TEST: THYROID PROFILE (TOTAL T3, T4, TSH)
- Serum TSH: 5.8 mIU/L [Reference: 0.45 - 4.5 mIU/L] (Borderline elevated)
- Free T4: 1.18 ng/dL [Reference: 0.82 - 1.77 ng/dL]
- Free T3: 2.8 pg/mL [Reference: 2.0 - 4.4 pg/mL]
MIGRAINE STATUS:
- Migraine without aura triggered by bright sunlight and skipped meals.
- Acute relief: Tab Rizatriptan 10mg SOS at onset of headache.
- Prophylaxis: Continue adequate hydration (2.5L/day) and regular sleep cycle.
ACTIVE MEDICINES FOR SUNITA SHARMA:
1. Tab Thyronorm 25mcg daily morning empty stomach (30 mins before tea)
2. Tab Rizatriptan 10mg (Max 2 tabs in 24 hours for acute migraine)
⚠️ ALLERGY: Sulfa drugs (developed allergic maculopapular rash to Cotrimoxazole).`,
    tags: ['sunita', 'wife', 'thyroid', 'tsh', 'thyronorm', 'migraine', 'rizatriptan', 'sulfa allergy'],
    metrics: [
      { name: 'TSH', value: '5.8', unit: 'mIU/L', status: 'elevated' },
      { name: 'Free T4', value: '1.18', unit: 'ng/dL', status: 'normal' },
    ],
    medications: [
      { name: 'Thyronorm 25mcg', dosage: '25mcg', frequency: 'Morning empty stomach', duration: 'Ongoing' },
      { name: 'Rizatriptan 10mg', dosage: '10mg', frequency: 'SOS for acute migraine', duration: 'As needed' },
    ],
  },
  {
    id: 'rec_203',
    memberId: 'mem_ananya',
    memberName: 'Ananya Sharma',
    title: 'Pediatric Pulmonary & Allergy Evaluation',
    type: 'lab_report',
    date: '2026-09-12',
    doctorName: 'Dr. Rohan Verma (MD, Pediatrics)',
    facilityName: 'Rainbow Children Hospital',
    summary: 'Ananya (11y, Daughter): Mild allergic bronchial asthma. Triggered by cold air and dust mites. Well-controlled with Montair LC Kid and Budecort inhaler SOS.',
    rawText: `PEDIATRIC PULMONOLOGY REPORT
Patient: Ananya Sharma | Age: 11 | Gender: Female (Daughter)
Diagnosis: Mild Persistent Allergic Asthma & Allergic Rhinitis
Peak Expiratory Flow Rate (PEFR): 240 L/min (88% of predicted for height 138cm).
Chest Examination: Bilateral vesicular breath sounds, no acute wheeze at rest.
KNOWN ALLERGENS:
- House dust mites, cat dander (3+ skin prick positive)
- Mild peanut sensitivity (urticaria)
ACTIVE PEDIATRIC MEDICATIONS FOR ANANYA SHARMA:
1. Tab Montair LC Kid (Montelukast 4mg + Levocetirizine 2.5mg) chewable tablet at bedtime
2. Budecort 100mcg Inhaler with spacer: 2 puffs twice daily during viral colds or SOS during cough/wheeze
3. Saline Nasal Spray 2 sprays each nostril BD.
INSTRUCTIONS FOR SCHOOL & HOME: Keep rescue inhaler in school bag. Rinse mouth after inhaler.`,
    tags: ['ananya', 'daughter', 'kid', 'pediatric', 'asthma', 'inhaler', 'budecort', 'montair', 'pefr', 'peanut allergy'],
    metrics: [
      { name: 'PEFR', value: '240', unit: 'L/min', status: 'normal' },
      { name: 'SpO2', value: '99', unit: '%', status: 'normal' },
    ],
    medications: [
      { name: 'Montair LC Kid', dosage: 'Kid Chewable', frequency: '0-0-1 Bedtime', duration: 'Ongoing' },
      { name: 'Budecort 100mcg Inhaler', dosage: '100mcg', frequency: '2 puffs SOS with spacer', duration: 'As needed' },
    ],
  },
  {
    id: 'rec_106',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Hospital Discharge Summary - Appendectomy',
    type: 'discharge_summary',
    date: '2024-03-12',
    doctorName: 'Dr. Vikram Sen (MS, General Surgery)',
    facilityName: 'Fortis Hospital',
    summary: 'Elective Laparoscopic Appendectomy for acute catarrhal appendicitis. Complete recovery.',
    rawText: `DISCHARGE SUMMARY - FORTIS HOSPITAL
Patient: Rahul Sharma | IPD No: FT-98210
Diagnosis: Acute Catarrhal Appendicitis
Procedure Done: Laparoscopic Appendectomy under General Anesthesia on 2024-03-10.
Operative Findings: Inflamed retrocecal appendix, non-perforated. Removed intact.
Hospital Course: Post-op recovery smooth. Tolerated soft diet on Day 1. Discharged on Day 2 in stable condition.
Surgical wounds healed with primary intention.`,
    tags: ['surgery', 'appendectomy', 'fortis', 'discharge', 'history', 'rahul'],
    metrics: [],
  },
  {
    id: 'rec_107',
    memberId: 'mem_rahul',
    memberName: 'Rahul Sharma',
    title: 'Vitals & Home Monitoring Log',
    type: 'vital_log',
    date: '2026-09-18',
    doctorName: 'Self Monitored (MedPulse IoT Sync)',
    facilityName: 'Home Health Log',
    summary: 'BP: 128/82 mmHg, Pulse: 72 bpm, SpO2: 98%, Weight: 76.2 kg, BMI: 25.1.',
    rawText: `HOME HEALTH VITALS LOG:
- Blood Pressure: 128/82 mmHg (Morning resting)
- Pulse Rate: 72 bpm (Regular)
- Oxygen Saturation (SpO2): 98% on room air
- Body Weight: 76.2 kg (Down 1.2 kg over last 2 months)
- BMI: 25.1 kg/m2 (Normal/Overweight transition)
- Blood Glucose (Fasting fingerstick): 118 mg/dL`,
    tags: ['vitals', 'bp', 'blood pressure', 'weight', 'spo2', 'home log', 'rahul'],
    metrics: [
      { name: 'Systolic BP', value: '128', unit: 'mmHg', status: 'normal' },
      { name: 'Diastolic BP', value: '82', unit: 'mmHg', status: 'normal' },
      { name: 'Pulse', value: '72', unit: 'bpm', status: 'normal' },
      { name: 'Weight', value: '76.2', unit: 'kg', status: 'normal' },
      { name: 'SpO2', value: '98', unit: '%', status: 'normal' },
    ],
  },
];

class MedicalRAGStore {
  private records: MedicalRecord[] = [...INITIAL_MEDICAL_RECORDS];

  public getAllRecords(): MedicalRecord[] {
    return [...this.records];
  }

  public getRecordById(id: string): MedicalRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  public addRecord(record: Omit<MedicalRecord, 'id'>): MedicalRecord {
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec_${Date.now()}`,
      memberId: record.memberId || 'mem_rahul',
      memberName: record.memberName || 'Rahul Sharma',
    };
    this.records.unshift(newRecord);
    return newRecord;
  }

  /**
   * Hybrid RAG Retrieval:
   * Combines token matching, medical synonym expansion, and entity weight
   */
  public searchRecords(query: string, topK: number = 3): { record: MedicalRecord; score: number; matchedKeywords: string[] }[] {
    const cleanQuery = query.toLowerCase();
    const queryTokens = cleanQuery
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Synonym map for medical domain
    const medicalSynonyms: Record<string, string[]> = {
      sugar: ['glucose', 'hba1c', 'diabetes', 'metformin'],
      diabetes: ['sugar', 'glucose', 'hba1c', 'glycemic', 'glycomet'],
      cholesterol: ['lipid', 'ldl', 'hdl', 'triglycerides', 'rosuvastatin', 'dyslipidemia'],
      bp: ['blood pressure', 'hypertension', 'systolic', 'diastolic', 'telmisartan'],
      pressure: ['bp', 'blood pressure', 'hypertension'],
      heart: ['cardiac', 'cardiology', 'ecg', 'hypertension', 'mehta'],
      allergy: ['allergic', 'penicillin', 'amoxicillin', 'augmentin', 'reaction', 'rash'],
      medicine: ['prescription', 'medication', 'tablet', 'dose', 'drug', 'dosage'],
      doctor: ['dr', 'rao', 'mehta', 'nair', 'sen', 'consultation'],
      operation: ['surgery', 'appendectomy', 'appendix', 'discharge'],
    };

    // Expand search terms with synonyms
    const expandedTokens = new Set<string>(queryTokens);
    for (const token of queryTokens) {
      if (medicalSynonyms[token]) {
        for (const syn of medicalSynonyms[token]) {
          expandedTokens.add(syn);
        }
      }
    }

    const scored = this.records.map((record) => {
      let score = 0;
      const matchedKeywords: string[] = [];

      const targetText = `${record.title} ${record.summary} ${record.rawText} ${record.tags.join(' ')} ${record.doctorName || ''} ${record.facilityName || ''}`.toLowerCase();

      // Check full query phrase exact match
      if (cleanQuery.length > 4 && targetText.includes(cleanQuery)) {
        score += 8;
        matchedKeywords.push(cleanQuery);
      }

      // Check tags boost
      for (const tag of record.tags) {
        if (expandedTokens.has(tag.toLowerCase())) {
          score += 4;
          matchedKeywords.push(tag);
        }
      }

      // Check title match boost
      for (const token of expandedTokens) {
        if (record.title.toLowerCase().includes(token)) {
          score += 3;
          matchedKeywords.push(token);
        }
      }

      // Check content tokens
      for (const token of expandedTokens) {
        if (targetText.includes(token)) {
          score += 1.5;
          if (!matchedKeywords.includes(token)) {
            matchedKeywords.push(token);
          }
        }
      }

      // Recency slight boost (newer records within 2026 get higher priority)
      const recYear = parseInt(record.date.slice(0, 4), 10) || 2024;
      if (recYear >= 2026) score += 0.8;

      return {
        record,
        score,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Formats retrieved records into prompt grounding context for Gemini
   */
  public buildRagContext(query: string): { contextText: string; citations: MedicalRecord[] } {
    const searchResults = this.searchRecords(query, 3);
    if (searchResults.length === 0) {
      // Fallback: provide master prescription & allergy dossier as base patient safety context
      const safetyRecords = this.records.filter((r) => r.type === 'allergy_note' || r.type === 'prescription');
      return {
        contextText: safetyRecords.map((r) => `[PATIENT RECORD - ${r.title} (${r.date})]:\n${r.summary}\n${r.rawText}`).join('\n\n'),
        citations: safetyRecords,
      };
    }

    const citations = searchResults.map((r) => r.record);
    const contextText = searchResults
      .map(
        ({ record, score }) =>
          `[RETRIEVED RECORD (Relevance: ${score.toFixed(1)}) - ${record.title} | Date: ${record.date} | Provider: ${record.doctorName || record.facilityName || 'N/A'}]:\n${record.summary}\nDetails:\n${record.rawText}`
      )
      .join('\n\n---\n\n');

    return { contextText, citations };
  }
}

export const medicalRagStore = new MedicalRAGStore();
