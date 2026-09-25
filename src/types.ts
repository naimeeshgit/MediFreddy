export type MessageRole = 'user' | 'assistant' | 'system';

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Self' | 'Wife' | 'Father' | 'Mother' | 'Daughter' | 'Son';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatar: string;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  activeMeds: string[];
  lastCheckup?: string;
}

export interface PlatformPriceOption {
  platform: 'Tata 1mg' | 'PharmEasy' | 'Apollo 24|7' | 'Netmeds';
  price: number;
  mrp: number;
  discountPercent: number;
  deliveryTime: string;
  deliveryBadge: string;
  isFastest?: boolean;
  isCheapest?: boolean;
  purchaseUrl: string;
  inStock: boolean;
}

export interface MedicinePriceComparison {
  medicineName: string;
  genericName: string;
  dosage: string;
  packSize: string;
  bestCheapestPlatform: string;
  bestFastestPlatform: string;
  options: PlatformPriceOption[];
}

export interface AgentCallDialogue {
  speaker: 'MedPulse AI Agent' | 'Clinic Receptionist' | 'Local Pharmacy Chemist';
  text: string;
  delayMs: number;
  audioBase64?: string;
}

export interface AgentCallSession {
  callId: string;
  callType: 'clinic_booking' | 'pharmacy_stock_inquiry';
  targetName: string;
  targetPhone: string;
  patientName: string;
  purpose: string;
  status: 'dialing' | 'connected' | 'completed' | 'failed';
  dialogue: AgentCallDialogue[];
  resultSummary: string;
  tokenOrReference?: string;
  scheduledTime?: string;
  deliveryEta?: string;
}

export interface EmergencySOSAlert {
  id: string;
  patientName: string;
  relation: string;
  age: number;
  timestamp: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    googleMapsUrl: string;
  };
  triggerReason: string;
  criticalDossier: {
    bloodGroup: string;
    knownAllergies: string[];
    chronicConditions: string[];
    emergencyContact: string;
  };
  hospitalDispatched: {
    name: string;
    distance: string;
    ambulanceETA: string;
    emergencyHotline: string;
  };
  status: 'dispatched' | 'en_route' | 'arrived';
}

export interface WhatsAppMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  senderName: string;
  senderAvatar?: string;
  memberId?: string;
  status?: 'sent' | 'delivered' | 'read';
  audioUrl?: string; // base64 WAV from Gnani TTS
  audioDuration?: number; // in seconds
  isVoiceNote?: boolean;
  transcription?: string; // If user sent voice note via Gnani STT
  actionType?:
    | 'appointment_booked'
    | 'medicine_order'
    | 'record_saved'
    | 'rag_citation'
    | 'allergy_warning'
    | 'quick_options'
    | 'emergency_sos'
    | 'agent_call_completed'
    | 'medicine_price_comparison'
    | 'local_pharmacy_call'
    | 'handwriting_ocr_result'
    | 'nearby_pharmacies_list';
  actionData?: any;
  quickReplies?: string[];
  imageUrl?: string;
}

export interface MedicalRecord {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  type: 'lab_report' | 'prescription' | 'discharge_summary' | 'vaccination' | 'vital_log' | 'allergy_note' | 'handwritten_rx';
  date: string;
  doctorName?: string;
  facilityName?: string;
  summary: string;
  rawText: string;
  tags: string[];
  metrics?: {
    name: string;
    value: string;
    unit?: string;
    status: 'normal' | 'elevated' | 'low' | 'critical';
  }[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
  }[];
  fileUrl?: string;
}

export interface Clinic {
  id: string;
  name: string;
  type: 'Hospital' | 'Multi-Specialty Clinic' | 'Diagnostic Center';
  address: string;
  distance: string;
  rating: number;
  phone: string;
  image: string;
}

export interface Doctor {
  id: string;
  clinicId: string;
  clinicName: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  consultationFee: number;
  availableDays: string[];
  availableSlots: string[];
  avatar: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  timeSlot: string;
  tokenNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  consultationFee: number;
  symptomsNotes?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Diabetes' | 'Cardiology' | 'Antibiotics' | 'Pain Relief' | 'Gastro' | 'Respiratory' | 'Vitamins';
  dosage: string;
  packSize: string;
  price: number;
  requiresPrescription: boolean;
  inStock: boolean;
  stockCount: number;
  description: string;
  manufacturer: string;
}

export interface OrderItem {
  medicineId: string;
  name: string;
  dosage: string;
  price: number;
  quantity: number;
}

export interface MedicineOrder {
  id: string;
  patientName: string;
  patientPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryEta: string;
  status: 'received' | 'packed' | 'out_for_delivery' | 'delivered';
  paymentMethod: 'Cash on Delivery (WhatsApp Pay)' | 'UPI' | 'Card';
  createdAt: string;
}

export interface GnaniVoiceSettings {
  model: string;
  voice: 'Nalini' | 'Deepak' | 'Bhavna' | 'Roopesh' | 'Vikrant' | 'Yashvi';
  language: string;
  autoSpeak: boolean;
  speed: number;
}
