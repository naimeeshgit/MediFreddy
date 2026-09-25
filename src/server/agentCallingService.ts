import { AgentCallSession, AgentCallDialogue } from '../types.ts';
import { synthesizeGnaniTTS } from './gnaniClient.ts';

export async function executeClinicBookingCall(params: {
  clinicName: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  desiredTime: string;
  symptoms?: string;
}): Promise<AgentCallSession> {
  const token = `${params.specialty.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const dialogue: AgentCallDialogue[] = [
    {
      speaker: 'MedPulse AI Agent',
      text: `Connecting to ${params.clinicName}... Ringing...`,
      delayMs: 1200,
    },
    {
      speaker: 'Clinic Receptionist',
      text: `Hello, ${params.clinicName} front desk, how may I direct your call?`,
      delayMs: 2500,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Hello! This is MedPulse AI Calling Agent on behalf of patient ${params.patientName}. We would like to confirm a consultation slot with ${params.doctorName} (${params.specialty}) for tomorrow at ${params.desiredTime}.`,
      delayMs: 3800,
    },
    {
      speaker: 'Clinic Receptionist',
      text: `Let me check Dr. ${params.doctorName.split(' ').pop()}'s calendar... Yes, the ${params.desiredTime} slot is available. Does the patient have a contact number and existing hospital registration?`,
      delayMs: 3200,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Yes, patient mobile is +91 98765 43210 and ABDM ID is 91-8842-1092. He is scheduled for follow-up review.`,
      delayMs: 2800,
    },
    {
      speaker: 'Clinic Receptionist',
      text: `Perfect. I have booked the slot for ${params.patientName}. Consultation Token is ${token}. Please arrive 10 minutes prior at Counter 3.`,
      delayMs: 3000,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Token ${token} confirmed for ${params.desiredTime}. Thank you for your assistance. Have a good day!`,
      delayMs: 2000,
    },
  ];

  // Synthesize agent audio via Gnani for the primary voice highlight
  let sampleAudio: string | undefined = undefined;
  try {
    const ttsRes = await synthesizeGnaniTTS({
      text: `Hello, this is MedPulse AI Calling Agent on behalf of patient ${params.patientName}. Appointment booked with ${params.doctorName} at ${params.clinicName} for ${params.desiredTime}. Token number is ${token}.`,
      voice: 'Deepak',
      language: 'en-IN',
    });
    if (ttsRes.success && ttsRes.audioBase64) {
      sampleAudio = ttsRes.audioBase64;
    }
  } catch (e) {
    console.warn('Agent call TTS synthesis skipped:', e);
  }

  return {
    callId: `call_cln_${Date.now()}`,
    callType: 'clinic_booking',
    targetName: params.clinicName,
    targetPhone: '+91 80 2553 1122',
    patientName: params.patientName,
    purpose: `Appointment Booking with ${params.doctorName}`,
    status: 'completed',
    dialogue,
    resultSummary: `Confirmed with ${params.clinicName} front desk for ${params.doctorName} at ${params.desiredTime}. Token: ${token}`,
    tokenOrReference: token,
    scheduledTime: params.desiredTime,
  };
}

export async function executeLocalPharmacyCall(params: {
  pharmacyName: string;
  medicineName: string;
  quantity: string;
  patientName: string;
  patientAddress: string;
}): Promise<AgentCallSession> {
  const refCode = `RX-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`;

  const dialogue: AgentCallDialogue[] = [
    {
      speaker: 'MedPulse AI Agent',
      text: `Dialing local store: ${params.pharmacyName}...`,
      delayMs: 1000,
    },
    {
      speaker: 'Local Pharmacy Chemist',
      text: `Namaste, ${params.pharmacyName}, how can I help you?`,
      delayMs: 2200,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Namaste! MedPulse Health Agent calling. We are looking for immediate stock for ${params.medicineName} (${params.quantity}) for patient ${params.patientName}. Do you have fresh stock available right now?`,
      delayMs: 3600,
    },
    {
      speaker: 'Local Pharmacy Chemist',
      text: `Yes, we have 4 strips of ${params.medicineName} in our temperature-controlled cabinet. Expiry is mid-2028.`,
      delayMs: 3000,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Excellent. Please reserve ${params.quantity} under reference ${refCode}. The patient is at ${params.patientAddress}. Can you send an express rider or should we dispatch courier pickup?`,
      delayMs: 3400,
    },
    {
      speaker: 'Local Pharmacy Chemist',
      text: `Our store delivery boy Ramesh is leaving in 5 minutes towards Bellandur. We will deliver directly within 25 minutes! Total is ₹165 with Cash on Delivery or UPI.`,
      delayMs: 3200,
    },
    {
      speaker: 'MedPulse AI Agent',
      text: `Confirmed! Thank you so much. Rider ETA 25 minutes accepted.`,
      delayMs: 2000,
    },
  ];

  return {
    callId: `call_ph_${Date.now()}`,
    callType: 'pharmacy_stock_inquiry',
    targetName: params.pharmacyName,
    targetPhone: '+91 80 4112 8899',
    patientName: params.patientName,
    purpose: `Stock Verification & Express Order for ${params.medicineName}`,
    status: 'completed',
    dialogue,
    resultSummary: `Stock verified at ${params.pharmacyName}. 2 strips reserved under Ref #${refCode}. Express store rider dispatched (ETA: 25 mins).`,
    tokenOrReference: refCode,
    deliveryEta: '25 mins (Local Chemist Rider)',
  };
}
