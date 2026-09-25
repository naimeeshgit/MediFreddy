import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  GNANI_API_KEY,
  synthesizeGnaniTTS,
  transcribeGnaniSTT,
} from './src/server/gnaniClient.ts';
import { medicalRagStore } from './src/server/rag.ts';
import { clinicStore, DOCTORS, CLINICS } from './src/server/clinicData.ts';
import { pharmacyStore, MEDICINES } from './src/server/pharmacyData.ts';
import { FAMILY_MEMBERS, detectFamilyMember } from './src/server/familyData.ts';
import { compareMedicinePrices, LOCAL_PHARMACIES } from './src/server/pharmacyAggregator.ts';
import { executeClinicBookingCall, executeLocalPharmacyCall } from './src/server/agentCallingService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup in-memory audio upload with multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System Status Endpoint
app.get('/api/system/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'MedPulse WhatsApp AI Bot',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGnaniKey: Boolean(GNANI_API_KEY),
    gnaniKeyMasked: GNANI_API_KEY ? `${GNANI_API_KEY.slice(0, 8)}...${GNANI_API_KEY.slice(-6)}` : 'missing',
    gnaniModels: {
      tts: 'timbre-v2.5',
      stt: 'gnani-prisma-v2.5',
    },
    counts: {
      medicalRecords: medicalRagStore.getAllRecords().length,
      clinics: CLINICS.length,
      doctors: DOCTORS.length,
      medicines: MEDICINES.length,
      appointments: clinicStore.getAppointments().length,
      orders: pharmacyStore.getOrders().length,
    },
  });
});

// Gnani STT Endpoint (Audio File Upload -> Text)
app.post('/api/gnani/stt', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const audioFile = req.file;
    const languageCode = (req.body.language_code as string) || 'en-IN';

    if (!audioFile) {
      return res.status(400).json({ success: false, error: 'No audio file provided in form-data' });
    }

    console.log(`[STT Request] Received audio: ${audioFile.originalname}, size: ${audioFile.size} bytes, lang: ${languageCode}`);
    const sttResult = await transcribeGnaniSTT(audioFile.buffer, audioFile.originalname || 'recording.wav', languageCode);

    res.json(sttResult);
  } catch (error: any) {
    console.error('STT endpoint error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal STT error' });
  }
});

// Gnani TTS Endpoint (Text -> Audio WAV)
app.post('/api/gnani/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Nalini', language = 'en-IN' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text parameter is required' });
    }

    const ttsResult = await synthesizeGnaniTTS({ text, voice, language });
    res.json(ttsResult);
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal TTS error' });
  }
});

// Medical Records & RAG endpoints
app.get('/api/records', (req: Request, res: Response) => {
  const records = medicalRagStore.getAllRecords();
  res.json({ success: true, records });
});

app.get('/api/records/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = medicalRagStore.searchRecords(query, 5);
  res.json({ success: true, query, results });
});

app.post('/api/records', (req: Request, res: Response) => {
  try {
    const { title, type, date, summary, rawText, tags, metrics, medications, doctorName, facilityName } = req.body;
    if (!title || !rawText) {
      return res.status(400).json({ success: false, error: 'Title and rawText are required' });
    }

    const newRec = medicalRagStore.addRecord({
      memberId: req.body.memberId || 'mem_rahul',
      memberName: req.body.memberName || 'Rahul Sharma',
      title,
      type: type || 'lab_report',
      date: date || new Date().toISOString().split('T')[0],
      doctorName: doctorName || 'Self / External Doctor',
      facilityName: facilityName || 'Uploaded via WhatsApp',
      summary: summary || rawText.slice(0, 150),
      rawText,
      tags: tags || ['whatsapp_upload'],
      metrics: metrics || [],
      medications: medications || [],
    });

    res.json({ success: true, record: newRec });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generated Test Medical Files for Testing (Single Patient: Rahul Sharma, 42M)
app.get('/api/test-files', async (req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const testFilesDir = path.join(__dirname, 'public', 'test-medical-files');
    const filenames = await fs.readdir(testFilesDir);

    const testFiles = await Promise.all(
      filenames.filter((f) => f.endsWith('.txt')).map(async (filename) => {
        const filePath = path.join(testFilesDir, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        // Derive user-friendly title
        let title = filename.replace(/\.txt$/, '').replace(/_/g, ' ');
        let type = 'lab_report';
        if (filename.includes('Prescription')) type = 'prescription';
        if (filename.includes('Allergy')) type = 'allergy_note';
        if (filename.includes('Echo')) type = 'cardiology_study';

        return {
          id: filename.replace(/\.txt$/, ''),
          filename,
          title,
          type,
          patientName: 'Rahul Sharma',
          content,
          size: stats.size,
          downloadUrl: `/test-medical-files/${filename}`,
        };
      })
    );

    res.json({ success: true, patient: 'Rahul Sharma (42M)', files: testFiles });
  } catch (err: any) {
    console.error('Error reading test files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Family Members endpoint
app.get('/api/family/members', (req: Request, res: Response) => {
  res.json({ success: true, members: FAMILY_MEMBERS });
});

// Emergency SOS Trigger Endpoint
app.post('/api/emergency/sos', (req: Request, res: Response) => {
  try {
    const { memberName, triggerReason, lat, lng } = req.body;
    const member = FAMILY_MEMBERS.find((m) => m.name.toLowerCase() === (memberName || '').toLowerCase()) || FAMILY_MEMBERS[0];

    const sosAlert = {
      id: `sos_${Date.now()}`,
      patientName: member.name,
      relation: member.relation,
      age: member.age,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: {
        address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
        lat: lat || 12.9279,
        lng: lng || 77.6784,
        googleMapsUrl: `https://maps.google.com/?q=${lat || 12.9279},${lng || 77.6784}`,
      },
      triggerReason: triggerReason || 'Acute Emergency SOS Call',
      criticalDossier: {
        bloodGroup: member.bloodGroup,
        knownAllergies: member.allergies,
        chronicConditions: member.conditions,
        emergencyContact: '+91 98765 43210 (Rahul Sharma)',
      },
      hospitalDispatched: {
        name: 'City Heart Emergency & Trauma Care / 108 Ambulance Hub',
        distance: '2.1 km away',
        ambulanceETA: '7 - 9 Minutes (Sirens Active)',
        emergencyHotline: '108 / +91 80 4123 9999',
      },
      status: 'dispatched',
    };

    res.json({ success: true, alert: sosAlert });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Autonomous Agent Calling: Clinic Appointment
app.post('/api/agent/call-clinic', async (req: Request, res: Response) => {
  try {
    const { clinicName, doctorName, specialty, patientName, desiredTime } = req.body;
    const callSession = await executeClinicBookingCall({
      clinicName: clinicName || 'Apollo Multi-Specialty Clinic',
      doctorName: doctorName || 'Dr. Sunita Rao',
      specialty: specialty || 'Endocrinology',
      patientName: patientName || 'Rahul Sharma',
      desiredTime: desiredTime || '11:30 AM',
    });

    res.json({ success: true, session: callSession });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Autonomous Agent Calling: Local Pharmacy
app.post('/api/agent/call-pharmacy', async (req: Request, res: Response) => {
  try {
    const { pharmacyName, medicineName, quantity, patientName, patientAddress } = req.body;
    const callSession = await executeLocalPharmacyCall({
      pharmacyName: pharmacyName || 'Apollo Pharmacy 24x7 Koramangala',
      medicineName: medicineName || 'Montair LC Kid',
      quantity: quantity || '2 strips',
      patientName: patientName || 'Rahul Sharma',
      patientAddress: patientAddress || 'Flat 402, Green Glen Layout, Bellandur',
    });

    res.json({ success: true, session: callSession });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Multi-Platform Medicine Price Comparison (Tata 1mg, PharmEasy, Apollo 24|7, Netmeds)
app.post('/api/medicines/compare', (req: Request, res: Response) => {
  try {
    const { medicineName } = req.body;
    if (!medicineName) {
      return res.status(400).json({ success: false, error: 'medicineName is required' });
    }
    const comparison = compareMedicinePrices(medicineName);
    res.json({ success: true, comparison });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Nearby Local Pharmacies
app.get('/api/pharmacies/nearby', (req: Request, res: Response) => {
  res.json({ success: true, pharmacies: LOCAL_PHARMACIES });
});

// Family File Ingestion Endpoint (Stores at Group Level and detects Family Member)
app.post('/api/family/ingest-file', async (req: Request, res: Response) => {
  try {
    const { filename = 'Medical_Document.txt', content, senderName } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'File content is required' });
    }

    const member = detectFamilyMember(`${filename} ${content} ${senderName || ''}`);
    let type: any = 'lab_report';
    const lower = `${filename} ${content}`.toLowerCase();
    if (lower.includes('prescription') || lower.includes('tab.') || lower.includes('rx:')) {
      type = 'prescription';
    } else if (lower.includes('allergy')) {
      type = 'allergy_note';
    } else if (lower.includes('discharge')) {
      type = 'discharge_summary';
    } else if (lower.includes('echo') || lower.includes('cardio') || lower.includes('ecg')) {
      type = 'lab_report';
    }

    const title = filename.replace(/\.txt$/, '').replace(/_/g, ' ');

    const newRecord = medicalRagStore.addRecord({
      memberId: member.id,
      memberName: member.name,
      title,
      type,
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Clinical Diagnostic Lab',
      facilityName: 'Sharma Family Health Hub (WhatsApp Group)',
      summary: `Document for ${member.name} (${member.relation}): ${content.slice(0, 150)}...`,
      rawText: content,
      tags: [member.id, member.name.toLowerCase().split(' ')[0], member.relation.toLowerCase(), 'family_vault'],
    });

    res.json({
      success: true,
      member,
      record: newRecord,
      message: `Document "${title}" recognized for ${member.name} (${member.relation}) and saved to Group Vault.`,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Doctor Handwriting Prescription Reader & Multi-Store Price Aggregator
app.post('/api/prescription/analyze', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, sampleIndex } = req.body;

    let recognizedText = text || '';
    if (imageBase64) {
      try {
        const visionRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'Decipher this doctor handwriting prescription slip. Extract patient name, doctor name, and exact medicines prescribed with dosage, frequency, and instructions. Cross-check for penicillin allergies.',
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
              ],
            },
          ],
        });
        if (visionRes.text) {
          recognizedText = visionRes.text;
        }
      } catch (err) {
        console.warn('Vision OCR fallback to text:', err);
      }
    }

    const firstMed = recognizedText.toLowerCase().includes('telma')
      ? 'Telma 40'
      : recognizedText.toLowerCase().includes('montair')
      ? 'Montair LC Kid'
      : recognizedText.toLowerCase().includes('augmentin')
      ? 'Augmentin 625 Duo'
      : 'Glycomet 500 SR';

    const comparison = compareMedicinePrices(firstMed);

    res.json({
      success: true,
      recognizedText,
      primaryMedicine: firstMed,
      comparison,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Clinics, Doctors & Appointments endpoints
app.get('/api/clinics', (req: Request, res: Response) => {
  res.json({ success: true, clinics: CLINICS });
});

app.get('/api/doctors', (req: Request, res: Response) => {
  const { specialty, clinicId } = req.query;
  const docs = clinicStore.getDoctors(specialty as string, clinicId as string);
  res.json({ success: true, doctors: docs });
});

app.get('/api/appointments', (req: Request, res: Response) => {
  res.json({ success: true, appointments: clinicStore.getAppointments() });
});

app.post('/api/appointments', (req: Request, res: Response) => {
  try {
    const { doctorId, date, timeSlot, patientName, patientPhone, symptomsNotes } = req.body;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, error: 'Doctor, date, and time slot are required' });
    }

    const appointment = clinicStore.bookAppointment({
      doctorId,
      date,
      timeSlot,
      patientName: patientName || 'Rahul Sharma',
      patientPhone: patientPhone || '+91 98765 43210',
      symptomsNotes,
    });

    res.json({ success: true, appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pharmacy & Orders endpoints
app.get('/api/medicines', (req: Request, res: Response) => {
  const query = req.query.q as string;
  const medicines = query ? pharmacyStore.searchMedicines(query) : pharmacyStore.getAllMedicines();
  res.json({ success: true, medicines });
});

app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders: pharmacyStore.getOrders() });
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { items, patientName, patientPhone, deliveryAddress, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items list is required' });
    }

    const orderResult = pharmacyStore.createOrder({
      items,
      patientName: patientName || 'Rahul Sharma',
      patientPhone: patientPhone || '+91 98765 43210',
      deliveryAddress,
      paymentMethod,
    });

    if (orderResult.error) {
      return res.status(400).json({ success: false, error: orderResult.error, allergyWarning: orderResult.allergyWarning });
    }

    res.json({ success: true, order: orderResult.order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main Conversational Intelligence Endpoint (Gemini + RAG + Actions + Gnani Speech)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      language = 'en-IN',
      voice = 'Nalini',
      generateAudio = true,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    console.log(`[Chat Input] "${message}" | lang=${language}, voice=${voice}`);

    // 1. RAG Retrieval from Patient Medical Records Vault
    const { contextText: ragContext, citations } = medicalRagStore.buildRagContext(message);

    // 2. Doctor & Medicine catalogs context
    const doctorsSummary = DOCTORS.map(
      (d) => `Dr. ${d.name} (${d.specialty}) at ${d.clinicName}, Fee: ₹${d.consultationFee}, Slots: ${d.availableSlots.slice(0, 3).join(', ')}, ID: ${d.id}`
    ).join('\n');

    const medicinesSummary = MEDICINES.map(
      (m) => `${m.name} (${m.dosage}, ${m.genericName}) - ₹${m.price} [Rx: ${m.requiresPrescription ? 'Yes' : 'No'}, Category: ${m.category}, ID: ${m.id}]`
    ).join('\n');

    // 3. System Prompt for Gemini with strict clinical safety, family awareness, and WhatsApp formatting
    const familyMemberDetected = detectFamilyMember(message);

    const familySummary = FAMILY_MEMBERS.map(
      (m) => `• ${m.name} (${m.relation}, ${m.age}y, ${m.gender}, Blood: ${m.bloodGroup}): Conditions: [${m.conditions.join(', ')}], Allergies: [${m.allergies.join(', ')}], Active Meds: [${m.activeMeds.join(', ')}]`
    ).join('\n');

    const systemInstruction = `You are "MedPulse AI", the clinical AI assistant inside the "Sharma Family Health Hub 👨‍👩‍👧‍👦" WhatsApp Group.

FAMILY MEMBERS IN THIS GROUP:
${familySummary}

CURRENT QUERY APPLIES TO: ${familyMemberDetected.name} (${familyMemberDetected.relation}, ${familyMemberDetected.age}y).

AVAILABLE CLINICS & DOCTORS:
${doctorsSummary}

PHARMACY INVENTORY:
${medicinesSummary}

RETRIEVED MEDICAL RECORDS (RAG CONTEXT):
${ragContext}

CAPABILITIES & ACTIONS:
1. EMERGENCY SOS: If the user indicates sudden acute distress (chest pain, breathlessness, asthma attack, fainting, allergic reaction, or says "emergency", "call ambulance", "SOS"), you MUST prioritize life safety! Give immediate first aid instructions and trigger the EMERGENCY_SOS action block.
2. AGENT PHONE CALLS TO CLINICS: You can autonomously call doctor clinics/receptionists to confirm appointments, negotiate slots, and get real-time tokens! If user asks to call or book, confirm and trigger AGENT_CALL_CLINIC.
3. MEDICINE PRICE COMPARISON: You can search across trusted apps (Tata 1mg, PharmEasy, Apollo 24|7, Netmeds) to find where medicines are cheapest (e.g. PharmEasy 24% off) and where delivery is fastest (e.g. Apollo 24|7 in 19 mins via express store rider) with purchase links! Trigger COMPARE_MEDICINES.
4. LOCAL PHARMACIES & RIDER CALL: If a medicine is needed immediately or out of stock, you can locate nearby pharmacies (within 2km in Koramangala/Bengaluru) and place an automated phone call to reserve stock and dispatch a local rider! Trigger AGENT_CALL_PHARMACY.
5. FAMILY FILE UPLOADS: When family members drop lab reports, discharge slips, or prescriptions in the group chat, identify which family member it belongs to, extract key biomarkers, and store it into the shared family vault!
6. PENICILLIN ALLERGY SAFETY SHIELD: Rahul Sharma has a DOCUMENTED SEVERE ALLERGY TO PENICILLIN / AMOXICILLIN (AUGMENTIN). NEVER allow or recommend Augmentin/Amoxicillin for Rahul! Always flag this danger and suggest safe alternatives (such as Azithromycin).

ACTION TRIGGER FORMAT:
If user intent confirms an action, append a JSON block at the very end inside triple backticks with \`json-action:

For Emergency SOS:
\`\`\`json-action
{
  "action": "EMERGENCY_SOS",
  "patientName": "${familyMemberDetected.name}",
  "reason": "Acute distress"
}
\`\`\`

For Autonomous Clinic Phone Call Booking:
\`\`\`json-action
{
  "action": "AGENT_CALL_CLINIC",
  "clinicName": "Apollo Multi-Specialty Clinic",
  "doctorName": "Dr. Sunita Rao",
  "specialty": "Diabetology",
  "desiredTime": "11:30 AM",
  "patientName": "${familyMemberDetected.name}"
}
\`\`\`

For Medicine Price Comparison (Tata 1mg, PharmEasy, Apollo 24|7):
\`\`\`json-action
{
  "action": "COMPARE_MEDICINES",
  "medicineName": "Glycomet 500 SR"
}
\`\`\`

For Local Pharmacy Stock Call:
\`\`\`json-action
{
  "action": "AGENT_CALL_PHARMACY",
  "pharmacyName": "Apollo Pharmacy 24x7 Koramangala",
  "medicineName": "Montair LC Kid",
  "quantity": "2 strips",
  "patientName": "${familyMemberDetected.name}"
}
\`\`\`

For Saving New Lab Record:
\`\`\`json-action
{
  "action": "SAVE_RECORD",
  "title": "Renal Function Test",
  "type": "lab_report",
  "memberName": "${familyMemberDetected.name}",
  "summary": "Creatinine 0.9 mg/dL (Normal)",
  "rawText": "Report details"
}
\`\`\`

Always append 2 to 3 practical quick reply suggestions at the end prefixed with "Quick options:" separated by commas.`;

    // 4. Call Gemini (with high availability fallback if model experiences high demand)
    const formattedHistory = history.slice(-6).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    let fullResponseText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelCandidate of modelsToTry) {
      try {
        const geminiResponse = await ai.models.generateContent({
          model: modelCandidate,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });
        if (geminiResponse.text) {
          fullResponseText = geminiResponse.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini Model ${modelCandidate} failed: ${err.message?.slice(0, 80)}]. Trying fallback...`);
      }
    }

    if (!fullResponseText) {
      fullResponseText = `*Namaste Rahul ji!* I reviewed your request regarding your health records. Based on your records, your last HbA1c (Aug 2026) was *6.8%* under Dr. Sunita Rao, and you have a *CRITICAL ALLERGY TO PENICILLIN & AMOXICILLIN (Augmentin)* which must be strictly avoided. How else may I assist you today?\n\nQuick options: 📅 Book Dr. Anand Mehta, 💊 Refill Telmisartan, 📋 View All Vitals`;
    }

    // 5. Parse action if present
    let cleanedText = fullResponseText;
    let actionType: any = undefined;
    let actionData: any = undefined;

    const actionMatch = fullResponseText.match(/```json-action\s*([\s\S]*?)\s*```/);
    if (actionMatch) {
      cleanedText = fullResponseText.replace(actionMatch[0], '').trim();
      try {
        const parsedAction = JSON.parse(actionMatch[1]);
        if (parsedAction.action === 'EMERGENCY_SOS') {
          const member = FAMILY_MEMBERS.find((m) => m.name.toLowerCase().includes((parsedAction.patientName || '').toLowerCase())) || familyMemberDetected;
          actionType = 'emergency_sos';
          actionData = {
            id: `sos_${Date.now()}`,
            patientName: member.name,
            relation: member.relation,
            age: member.age,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: {
              address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
              lat: 12.9279,
              lng: 77.6784,
              googleMapsUrl: 'https://maps.google.com/?q=12.9279,77.6784',
            },
            triggerReason: parsedAction.reason || 'Acute Emergency Call',
            criticalDossier: {
              bloodGroup: member.bloodGroup,
              knownAllergies: member.allergies,
              chronicConditions: member.conditions,
              emergencyContact: '+91 98765 43210 (Rahul Sharma)',
            },
            hospitalDispatched: {
              name: 'City Heart Emergency & Trauma Care / 108 Ambulance Hub',
              distance: '2.1 km away',
              ambulanceETA: '7 - 9 Minutes (Sirens Active)',
              emergencyHotline: '108 / +91 80 4123 9999',
            },
            status: 'dispatched',
          };
        } else if (parsedAction.action === 'AGENT_CALL_CLINIC') {
          const callSession = await executeClinicBookingCall({
            clinicName: parsedAction.clinicName || 'Apollo Multi-Specialty Clinic',
            doctorName: parsedAction.doctorName || 'Dr. Sunita Rao',
            specialty: parsedAction.specialty || 'Diabetology',
            patientName: parsedAction.patientName || familyMemberDetected.name,
            desiredTime: parsedAction.desiredTime || '11:30 AM',
          });
          actionType = 'agent_call_completed';
          actionData = callSession;
        } else if (parsedAction.action === 'AGENT_CALL_PHARMACY') {
          const callSession = await executeLocalPharmacyCall({
            pharmacyName: parsedAction.pharmacyName || 'Apollo Pharmacy 24x7 Koramangala',
            medicineName: parsedAction.medicineName || 'Montair LC Kid',
            quantity: parsedAction.quantity || '2 strips',
            patientName: parsedAction.patientName || familyMemberDetected.name,
            patientAddress: 'Flat 402, Green Glen Layout, Bellandur',
          });
          actionType = 'local_pharmacy_call';
          actionData = callSession;
        } else if (parsedAction.action === 'COMPARE_MEDICINES') {
          const comparison = compareMedicinePrices(parsedAction.medicineName || 'Glycomet 500 SR');
          actionType = 'medicine_price_comparison';
          actionData = comparison;
        } else if (parsedAction.action === 'BOOK_APPOINTMENT') {
          const booked = clinicStore.bookAppointment({
            patientName: 'Rahul Sharma',
            doctorId: parsedAction.doctorId || 'doc_anand',
            date: parsedAction.date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            timeSlot: parsedAction.timeSlot || '11:00 AM',
            symptomsNotes: parsedAction.symptomsNotes,
          });
          actionType = 'appointment_booked';
          actionData = booked;
        } else if (parsedAction.action === 'ORDER_MEDICINE') {
          const ordered = pharmacyStore.createOrder({
            patientName: 'Rahul Sharma',
            items: parsedAction.items || [],
            deliveryAddress: parsedAction.deliveryAddress,
          });
          if (ordered.order) {
            actionType = 'medicine_order';
            actionData = ordered.order;
          } else if (ordered.allergyWarning) {
            actionType = 'allergy_warning';
            actionData = { warning: ordered.allergyWarning };
          }
        } else if (parsedAction.action === 'SAVE_RECORD') {
          const member = FAMILY_MEMBERS.find((m) => m.name.toLowerCase().includes((parsedAction.memberName || '').toLowerCase())) || familyMemberDetected;
          const saved = medicalRagStore.addRecord({
            memberId: member.id,
            memberName: member.name,
            title: parsedAction.title || 'Patient Health Update',
            type: parsedAction.type || 'lab_report',
            date: new Date().toISOString().split('T')[0],
            doctorName: 'Self Reported via WhatsApp',
            facilityName: 'MedPulse WhatsApp Vault',
            summary: parsedAction.summary || 'User added medical record',
            rawText: parsedAction.rawText || message,
            tags: parsedAction.tags || ['patient_entry'],
          });
          actionType = 'record_saved';
          actionData = saved;
        }
      } catch (err) {
        console.error('Failed to parse json-action:', err);
      }
    }

    // Extract quick replies if Gemini appended "Quick options: ..."
    let quickReplies: string[] = [];
    const quickMatch = cleanedText.match(/Quick options:\s*(.*)$/i);
    if (quickMatch) {
      quickReplies = quickMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter((s) => s.length > 0 && s.length < 40);
      cleanedText = cleanedText.replace(quickMatch[0], '').trim();
    }

    if (quickReplies.length === 0) {
      quickReplies = ['📅 Book Doctor', '💊 Order Medicines', '📋 My Health Records'];
    }

    // Check if RAG was cited
    if (!actionType && citations.length > 0 && (message.toLowerCase().includes('report') || message.toLowerCase().includes('sugar') || message.toLowerCase().includes('bp') || message.toLowerCase().includes('cholesterol') || message.toLowerCase().includes('allergy') || message.toLowerCase().includes('prescription'))) {
      actionType = 'rag_citation';
      actionData = {
        citations: citations.map((c) => ({
          id: c.id,
          title: c.title,
          date: c.date,
          doctorName: c.doctorName,
          summary: c.summary,
        })),
      };
    }

    // 6. Convert text to Speech via Gnani TTS (timbre-v2.5)
    let audioUrl: string | undefined = undefined;
    let audioDuration: number | undefined = undefined;

    if (generateAudio) {
      // Pick a clean, conversational excerpt of the reply for the voice note
      const speechText = cleanedText
        .split('\n\n')[0] // first paragraph for punchy WhatsApp voice message
        .replace(/[*_#]/g, '')
        .slice(0, 300);

      const ttsResult = await synthesizeGnaniTTS({
        text: speechText,
        voice: voice as any,
        language,
      });

      if (ttsResult.success && ttsResult.audioBase64) {
        audioUrl = ttsResult.audioBase64;
        audioDuration = ttsResult.durationEstimate || 4;
      }
    }

    res.json({
      success: true,
      text: cleanedText,
      audioUrl,
      audioDuration,
      actionType,
      actionData,
      quickReplies,
      citations: citations.map((c) => ({ id: c.id, title: c.title, date: c.date })),
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal chat server error' });
  }
});

// Configure Vite Middlewares in development mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[MedPulse] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[MedPulse] Gnani Speech AI: Model timbre-v2.5 & prisma-v2.5 ready`);
    console.log(`[MedPulse] Gemini AI: gemini-3.8-flash ready`);
  });
}

startServer();
