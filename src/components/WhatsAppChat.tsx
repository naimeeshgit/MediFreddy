import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Calendar,
  Pill,
  FileText,
  AlertTriangle,
  Sparkles,
  Volume2,
  Settings,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  Trash2,
  FolderOpen,
  Siren,
  PhoneCall,
  Camera,
  Users,
  Building2,
  Truck,
  Heart,
} from 'lucide-react';
import {
  WhatsAppMessage,
  GnaniVoiceSettings,
  MedicalRecord,
  AgentCallSession,
  EmergencySOSAlert,
  MedicinePriceComparison,
  FamilyMember,
} from '../types.ts';
import { WhatsAppVoiceNote } from './WhatsAppVoiceNote.tsx';
import { AudioRecorder } from '../utils/audioEncoder.ts';
import { LiveCallModal } from './LiveCallModal.tsx';
import { EmergencySOSModal } from './EmergencySOSModal.tsx';
import { PrescriptionReaderModal } from './PrescriptionReaderModal.tsx';
import { FamilyVaultDrawer } from './FamilyVaultDrawer.tsx';
import { FAMILY_MEMBERS } from '../server/familyData.ts';

interface WhatsAppChatProps {
  settings: GnaniVoiceSettings;
  onOpenSettings: () => void;
  onOpenTestFiles?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

// Initial family conversation to give an immediate authentic group experience
const INITIAL_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    text: `*Namaste Sharma Family!* 👨‍👩‍👧‍👦 Welcome to your verified *Family Health Hub*.

I am your 24x7 AI Health Companion powered by *Gemini AI* & *Gnani.ai Speech*.

*Active Family Members in this Group:*
• 👤 *Rahul* (42y) - Hypertension, Type 2 Diabetes ⚠️ *PENICILLIN ALLERGY*
• 👩 *Sunita* (39y, Wife) - Chronic Migraine, Thyroid (Thyronorm 25mcg)
• 👴 *Ramesh* (71y, Dad) - Post-Angioplasty Stent, BP (Amlodipine, Clopidogrel)
• 👧 *Ananya* (11y, Kid) - Pediatric Asthma (Montair LC Kid, Budecort SOS)

*Specialized Features Active:*
🚨 *Emergency SOS:* 1-tap / voice dispatch of ambulance & critical dossier
📞 *Autonomous Agent Calling:* I can call clinics to book appointments or call local pharmacies
💊 *Multi-Store Price Aggregator:* Lowest price & fastest delivery on Tata 1mg, PharmEasy, and Apollo 24|7
📸 *Doctor Handwriting OCR:* Send any handwritten prescription slip to decipher and compare prices!

Drop any family member's report, or use the quick buttons above to test!`,
    timestamp: '09:30 AM',
    senderName: 'MedPulse Care',
    status: 'read',
    quickReplies: [
      '🚨 SOS: Dad having severe chest pain',
      '📞 Call Apollo Clinic to book Dr. Sunita Rao',
      '💊 Compare prices for Glycomet 500 SR across apps',
      '📸 Read doctor handwritten prescription',
      '🩸 What was Rahul\'s last HbA1c result?',
      '📍 Call nearby pharmacy for Montair LC Kid',
    ],
  },
];

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  settings,
  onOpenSettings,
  onOpenTestFiles,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(() => {
    const saved = localStorage.getItem('medpulse_family_whatsapp_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [activeSender, setActiveSender] = useState<FamilyMember>(FAMILY_MEMBERS[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCallsMenu, setShowCallsMenu] = useState(false);
  const [micErrorBanner, setMicErrorBanner] = useState<string | null>(null);
  const [chatToast, setChatToast] = useState<string | null>(null);
  const [showVoiceSimulationModal, setShowVoiceSimulationModal] = useState(false);

  // Modals for requested features
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showFamilyDrawer, setShowFamilyDrawer] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<AgentCallSession | null>(null);
  const [familyRecords, setFamilyRecords] = useState<MedicalRecord[]>([]);

  // Location access state
  const [isLocating, setIsLocating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('medpulse_family_whatsapp_messages', JSON.stringify(messages));
  }, [messages, isTyping]);

  useEffect(() => {
    const handleInjectedPrompt = (e: any) => {
      const prompt = e.detail?.prompt;
      if (prompt) {
        handleSendMessage(prompt);
      }
    };

    const handleTestFile = async (e: any) => {
      const { filename, content } = e.detail || {};
      if (filename && content) {
        await handleIngestAndSendFile(filename, content);
      }
    };

    window.addEventListener('medpulse_inject_prompt', handleInjectedPrompt);
    window.addEventListener('medpulse_send_test_file', handleTestFile);
    return () => {
      window.removeEventListener('medpulse_inject_prompt', handleInjectedPrompt);
      window.removeEventListener('medpulse_send_test_file', handleTestFile);
    };
  }, [messages, settings, activeSender]);

  // Ingest any file sent into the WhatsApp group and detect which family member it belongs to
  const handleIngestAndSendFile = async (filename: string, content: string) => {
    const userMsgId = `user_${Date.now()}`;
    const userMsg: WhatsAppMessage = {
      id: userMsgId,
      role: 'user',
      text: `📎 *Sent Medical File:* ${filename}\n\`${content.slice(0, 110).replace(/\n/g, ' ')}...\``,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: activeSender.name,
      senderAvatar: activeSender.avatar,
      memberId: activeSender.id,
      status: 'sent',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/family/ingest-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content,
          senderName: activeSender.name,
        }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        const member = data.member;
        const record = data.record;
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: `✅ *Medical File Ingested & Analyzed!*

👤 *Identified Family Member:* *${member.name}* (${member.relation}, ${member.age}y)
📋 *Document:* ${record.title}
💡 *Clinical Finding:* ${record.summary}

📂 *Stored at Group Level:* Sharma Family Vault ➔ ${member.name}'s Dossier`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
          actionType: 'record_saved',
          actionData: {
            ...record,
            memberName: member.name,
            relation: member.relation,
          },
          quickReplies: [
            `📋 Analyze ${member.name.split(' ')[0]}'s report in detail`,
            `📞 Book doctor follow-up for ${member.name.split(' ')[0]}`,
            `💊 Compare medicine prices for ${member.name.split(' ')[0]}`,
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e: any) {
      setIsTyping(false);
      setChatToast('Failed to ingest file: ' + e.message);
    }
  };

  // Launch Autonomous Agent Outbound Call to Clinic
  const handleLaunchClinicCall = async (clinicName: string = 'Apollo Multi-Specialty Clinic', doctorName: string = 'Dr. Sunita Rao') => {
    setShowCallsMenu(false);
    setChatToast(`Initiating autonomous AI phone call to ${clinicName}...`);
    try {
      const res = await fetch('/api/agent/call-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName,
          doctorName,
          specialty: 'Diabetology & General Medicine',
          patientName: activeSender.name,
          desiredTime: '11:30 AM',
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setActiveCallSession(data.session);
      }
    } catch (e: any) {
      setChatToast('Call error: ' + e.message);
    }
  };

  // Launch Autonomous Agent Outbound Call to Local Chemist
  const handleLaunchPharmacyCall = async (pharmacyName: string = 'Apollo Pharmacy 24x7 Koramangala', medicineName: string = 'Montair LC Kid') => {
    setShowCallsMenu(false);
    setChatToast(`Calling ${pharmacyName} to check stock for ${medicineName}...`);
    try {
      const res = await fetch('/api/agent/call-pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyName,
          medicineName,
          quantity: '2 strips',
          patientName: activeSender.name,
          patientAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setActiveCallSession(data.session);
      }
    } catch (e: any) {
      setChatToast('Call error: ' + e.message);
    }
  };

  // Location Access: Search Nearby Pharmacies
  const handleShareLocationAndSearchPharmacies = async (medName: string = 'Montair LC Kid') => {
    setIsLocating(true);
    setChatToast('Acquiring location for Bellandur / Koramangala...');
    try {
      const res = await fetch('/api/pharmacies/nearby');
      const data = await res.json();
      setIsLocating(false);
      if (data.success && data.pharmacies) {
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: `📍 *Location Verified: Bellandur & Koramangala, Bengaluru (560103)*

I found *4 physical pharmacies within 2.5km*. Because *${medName}* is needed right away, you can tap below to let MedPulse AI place an automated outbound phone call to verify stock, reserve 2 strips, and dispatch an express local courier!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
          actionType: 'nearby_pharmacies_list',
          actionData: {
            medicineName: medName,
            pharmacies: data.pharmacies,
          },
          quickReplies: [
            `📞 Call Apollo Pharmacy 24x7 for ${medName}`,
            `📞 Call MedPlus Chemist for ${medName}`,
            `💊 Compare Online (Tata 1mg vs PharmEasy)`,
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e: any) {
      setIsLocating(false);
      setChatToast('Failed to locate pharmacies: ' + e.message);
    }
  };

  const handleSendMessage = async (textToSend: string, isVoice: boolean = false, transcribedText?: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: WhatsAppMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: activeSender.name,
      senderAvatar: activeSender.avatar,
      memberId: activeSender.id,
      status: 'sent',
      isVoiceNote: isVoice,
      transcription: transcribedText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Update status to delivered/read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'read' } : m))
      );
    }, 600);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5),
          language: settings.language,
          voice: settings.voice,
          generateAudio: true,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
          audioUrl: data.audioUrl,
          audioDuration: data.audioDuration,
          actionType: data.actionType,
          actionData: data.actionData,
          quickReplies: data.quickReplies,
        };

        setMessages((prev) => [...prev, botMsg]);

        // Auto play if enabled in settings
        if (settings.autoSpeak && data.audioUrl) {
          const autoAudio = new Audio(data.audioUrl);
          autoAudio.play().catch((err) => console.log('Auto-play prevented:', err));
        }
      } else {
        const errorMsg: WhatsAppMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `⚠️ *Error:* ${data.error || 'Unable to connect to healthcare assistant'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error: any) {
      setIsTyping(false);
      const errorMsg: WhatsAppMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: `⚠️ *Connection Error:* ${error?.message || 'Could not reach server'}. Please check internet connectivity.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: 'MedPulse AI',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Push-to-Talk Mic Recording
  const startRecording = async () => {
    setMicErrorBanner(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone API is not supported in this browser environment');
      }
      const recorder = new AudioRecorder();
      await recorder.start();
      audioRecorderRef.current = recorder;
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access blocked or unavailable:', err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.toLowerCase().includes('denied') ||
        err?.message?.toLowerCase().includes('permission');

      setMicErrorBanner(
        isDenied
          ? 'Microphone access is blocked in this browser/iframe. Tap "Simulate Voice Note" or "Upload Audio" below to test Gnani AI voice processing!'
          : `Microphone unavailable (${err?.message || 'Device error'}). You can use the Voice Simulation or text input.`
      );
      // Auto open voice simulation options so user has immediate working voice experience
      setShowVoiceSimulationModal(true);
    }
  };

  const stopAndSendRecording = async () => {
    if (!audioRecorderRef.current || !isRecordingAudio) return;

    clearInterval(timerIntervalRef.current);
    setIsRecordingAudio(false);
    setAudioProcessing(true);

    try {
      const wavBlob = await audioRecorderRef.current.stop();
      console.log(`[Voice Note] Recorded WAV Blob: ${wavBlob.size} bytes`);

      // Send to Gnani STT API
      const formData = new FormData();
      formData.append('audio', wavBlob, 'voicenote.wav');
      formData.append('language_code', settings.language);

      const sttRes = await fetch('/api/gnani/stt', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttRes.json();
      setAudioProcessing(false);

      if (sttData.success && sttData.transcript) {
        console.log(`[Gnani STT Transcript]: "${sttData.transcript}"`);
        await handleSendMessage(sttData.transcript, true, sttData.transcript);
      } else {
        setChatToast('Gnani STT did not detect clear speech. Please try speaking again or use Voice Simulation.');
        setTimeout(() => setChatToast(null), 4000);
      }
    } catch (err: any) {
      setAudioProcessing(false);
      console.error('Audio processing error:', err);
      setChatToast('Failed to process voice note: ' + err.message);
      setTimeout(() => setChatToast(null), 4000);
    }
  };

  const cancelRecording = async () => {
    if (audioRecorderRef.current) {
      try {
        await audioRecorderRef.current.stop();
      } catch (e) {}
    }
    clearInterval(timerIntervalRef.current);
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  // Upload an audio file directly to Gnani STT
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioProcessing(true);
    setMicErrorBanner(null);

    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);
      formData.append('language_code', settings.language);

      const sttRes = await fetch('/api/gnani/stt', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttRes.json();
      setAudioProcessing(false);

      if (sttData.success && sttData.transcript) {
        await handleSendMessage(sttData.transcript, true, sttData.transcript);
      } else {
        setChatToast('Gnani STT could not transcribe this audio file. Please try another recording.');
        setTimeout(() => setChatToast(null), 4000);
      }
    } catch (err: any) {
      setAudioProcessing(false);
      setChatToast('Audio upload error: ' + err.message);
      setTimeout(() => setChatToast(null), 4000);
    }
  };

  // Simulate a spoken voice query with Gnani TTS voice note for both user and bot
  const handleSimulateVoiceQuery = async (speechText: string) => {
    setShowVoiceSimulationModal(false);
    setMicErrorBanner(null);
    setAudioProcessing(true);

    try {
      // Synthesize user voice note via Gnani TTS (Voice: Deepak)
      const userTTS = await fetch('/api/gnani/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechText,
          voice: 'Deepak',
          language: settings.language,
        }),
      }).then((r) => r.json()).catch(() => null);

      setAudioProcessing(false);

      const userMsgId = `user_${Date.now()}`;
      const userMsg: WhatsAppMessage = {
        id: userMsgId,
        role: 'user',
        text: speechText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: 'Rahul Sharma',
        status: 'sent',
        isVoiceNote: true,
        transcription: speechText,
        audioUrl: userTTS?.success ? userTTS.audioBase64 : undefined,
        audioDuration: userTTS?.durationEstimate || 3,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, status: 'read' } : m))
        );
      }, 500);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: speechText,
          history: messages.slice(-5),
          language: settings.language,
          voice: settings.voice,
          generateAudio: true,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse Care',
          audioUrl: data.audioUrl,
          audioDuration: data.audioDuration,
          actionType: data.actionType,
          actionData: data.actionData,
          quickReplies: data.quickReplies,
        };

        setMessages((prev) => [...prev, botMsg]);

        if (settings.autoSpeak && data.audioUrl) {
          const autoAudio = new Audio(data.audioUrl);
          autoAudio.play().catch(() => {});
        }
      }
    } catch (e: any) {
      setIsTyping(false);
      setAudioProcessing(false);
      setChatToast('Connection error: ' + e.message);
      setTimeout(() => setChatToast(null), 4000);
    }
  };

  // Upload report file handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachmentMenu(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || `Medical report file: ${file.name} uploaded by ${activeSender.name}`;
      await handleIngestAndSendFile(file.name, content);
    };
    reader.readAsText(file);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    fetch('/api/records')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.records) {
          setFamilyRecords(data.records);
        }
      })
      .catch((e) => console.warn('Failed to fetch records:', e));
  }, []);

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem('medpulse_family_whatsapp_messages');
    setChatToast('Chat history cleared and reset.');
    setTimeout(() => setChatToast(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden">
      {/* WhatsApp Official Top App Bar - Family Group Chat */}
      <div className="h-16 px-3 sm:px-4 bg-[#008069] dark:bg-[#1f2c34] text-white flex items-center justify-between shadow-md z-20 shrink-0 select-none">
        <div
          onClick={() => setShowFamilyDrawer(true)}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:opacity-95 transition-opacity min-w-0"
          title="Click to view Family Members & Medical Records"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden border-2 border-emerald-400">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#1f2c34] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm tracking-tight truncate">
                Sharma Family Health Hub 👨‍👩‍👧‍👦
              </h2>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-500/40 text-emerald-100 font-medium shrink-0">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 dark:text-zinc-400 font-medium truncate">
              {isTyping ? (
                <span className="text-emerald-200 animate-pulse font-bold">MedPulse AI is typing...</span>
              ) : isRecordingAudio ? (
                <span className="text-emerald-200 animate-pulse font-bold">recording audio...</span>
              ) : (
                'Rahul (You), Sunita, Ramesh, Ananya • MedPulse AI'
              )}
            </p>
          </div>
        </div>

        {/* Quick Trigger Header Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative">
          {/* 🚨 Emergency SOS Trigger Button */}
          <button
            type="button"
            onClick={() => setShowSOSModal(true)}
            className="px-2.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-md animate-pulse active:scale-95 transition-all"
            title="Emergency SOS Dispatch (Ambulance, Hospital & Family Dossier)"
          >
            <Siren className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* 📞 Call Simulator Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCallsMenu((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              title="Demonstrate Autonomous AI Phone Calls (Clinic or Chemist)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Agent Calls</span>
            </button>

            {showCallsMenu && (
              <div className="absolute right-0 top-10 z-40 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-2 space-y-1 text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Autonomous Voice Call Simulator
                </div>
                <button
                  type="button"
                  onClick={() => handleLaunchClinicCall('Apollo Multi-Specialty Clinic', 'Dr. Sunita Rao')}
                  className="w-full text-left p-2 rounded-xl text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-start gap-2 cursor-pointer font-medium"
                >
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Call Clinic for Appointment</span>
                    <span className="text-[10px] text-zinc-500">Apollo Clinic • Dr. Sunita Rao (11:30 AM)</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchPharmacyCall('Apollo Pharmacy 24x7 Koramangala', 'Montair LC Kid')}
                  className="w-full text-left p-2 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-start gap-2 cursor-pointer font-medium"
                >
                  <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Call Local Chemist for Stock</span>
                    <span className="text-[10px] text-zinc-500">Reserve Montair LC Kid • 25m delivery</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 📸 Prescription OCR Button */}
          <button
            type="button"
            onClick={() => setShowPrescriptionModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            title="Read Doctor Handwritten Prescription & Compare Prices"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden lg:inline">Prescription OCR</span>
          </button>

          {/* 👥 Members Drawer Pill */}
          <button
            type="button"
            onClick={() => setShowFamilyDrawer(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-700/60 dark:bg-zinc-800 text-xs text-white hover:bg-emerald-700 cursor-pointer transition-all"
            title="Open Family Members & Group Records"
          >
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-[11px] hidden sm:inline">Family Vault (4)</span>
          </button>

          {/* Test Medical Files Button */}
          <button
            type="button"
            onClick={onOpenTestFiles}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-700/50 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all"
            title="Pick & Send Pre-Made Test Files (7)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xl:inline">Test Files (7)</span>
          </button>

          {/* Voice Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-black/10 text-white cursor-pointer transition-colors"
            title="Gnani Speech Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-black/10 text-white cursor-pointer transition-colors"
            title="Reset Group Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Warning Banner if Microphone is Blocked in Browser/iFrame */}
      {micErrorBanner && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs z-30 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{micErrorBanner}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowVoiceSimulationModal(true)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-xs transition-all active:scale-95"
            >
              🎙️ Simulate Voice Note
            </button>
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 rounded-lg font-semibold text-[11px] cursor-pointer hover:bg-amber-300"
            >
              Upload Audio
            </button>
            <button
              type="button"
              onClick={() => setMicErrorBanner(null)}
              className="p-1 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-md text-amber-700 dark:text-amber-300 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Toast */}
      {chatToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 text-white text-xs px-4 py-2 rounded-xl shadow-lg border border-zinc-700 animate-in fade-in slide-in-from-top-2">
          {chatToast}
        </div>
      )}

      {/* Messages Canvas with WhatsApp pattern */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 z-10"
        style={{
          backgroundImage: `radial-gradient(#00000008 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Security & HIPAA Notice */}
        <div className="flex justify-center">
          <div className="max-w-md bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-[11px] rounded-lg px-3 py-1.5 text-center shadow-xs border border-[#ffdf9d]/60 dark:border-zinc-800">
            🔒 Messages with MedPulse AI are encrypted &amp; HIPAA-compliant. Grounded in patient Rahul Sharma&apos;s medical records.
          </div>
        </div>

        {/* Date Stamp */}
        <div className="flex justify-center my-2">
          <span className="bg-white/80 dark:bg-[#182229]/80 backdrop-blur-xs text-[#54656f] dark:text-[#8696a0] text-[11px] font-semibold px-3 py-1 rounded-lg shadow-xs uppercase tracking-wider">
            Today
          </span>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                  isUser
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-xs'
                    : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-xs border border-zinc-200/50 dark:border-zinc-800/50'
                }`}
              >
                {/* Family Group Sender Tag */}
                {isUser ? (
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-black/5 dark:border-white/10">
                    <span
                      className={`text-[11px] font-black ${
                        msg.memberId === 'mem_sunita'
                          ? 'text-purple-700 dark:text-purple-300'
                          : msg.memberId === 'mem_ramesh'
                          ? 'text-amber-700 dark:text-amber-300'
                          : msg.memberId === 'mem_ananya'
                          ? 'text-pink-700 dark:text-pink-300'
                          : 'text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-bold">
                      {msg.memberId === 'mem_sunita'
                        ? 'Wife (39y)'
                        : msg.memberId === 'mem_ramesh'
                        ? 'Dad (71y)'
                        : msg.memberId === 'mem_ananya'
                        ? 'Daughter (11y)'
                        : 'Self (42y)'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> MedPulse AI Companion
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      Verified Health Bot
                    </span>
                  </div>
                )}

                {/* Voice Note Player if audio is available */}
                {msg.audioUrl && (
                  <div className="mb-2">
                    <WhatsAppVoiceNote
                      audioUrl={msg.audioUrl}
                      duration={msg.audioDuration || 4}
                      isUser={isUser}
                      timestamp={msg.timestamp}
                    />
                  </div>
                )}

                {/* Voice Note badge for user's recorded audio */}
                {msg.isVoiceNote && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Note (Gnani Prisma STT)</span>
                  </div>
                )}

                {/* Message Text with WhatsApp markdown format */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Quick styling for bolding and emojis
                    let formattedLine = line;
                    return (
                      <p key={lIdx} className={line === '' ? 'h-2' : ''}>
                        {formattedLine}
                      </p>
                    );
                  })}
                </div>

                {/* ACTION CARDS (Appointments, Orders, Allergies, RAG Citations) */}
                {msg.actionType === 'appointment_booked' && msg.actionData && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> APPOINTMENT CONFIRMED
                      </span>
                      <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                        Token: {msg.actionData.tokenNumber}
                      </span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{msg.actionData.doctorName}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">{msg.actionData.specialty}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {msg.actionData.clinicName}
                      </p>
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 pt-1">
                        🗓️ {msg.actionData.date} at {msg.actionData.timeSlot} (Consultation Fee: ₹{msg.actionData.consultationFee})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onNavigateToTab?.('clinics')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 cursor-pointer shadow-xs"
                      >
                        View in Clinic Directory
                      </button>
                    </div>
                  </div>
                )}

                {msg.actionType === 'medicine_order' && msg.actionData && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                        <Pill className="w-3 h-3" /> ORDER DISPATCHED
                      </span>
                      <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                        #{msg.actionData.id}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Items: {msg.actionData.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-bold">
                        ⚡ {msg.actionData.deliveryEta}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Delivery to: {msg.actionData.deliveryAddress}
                      </p>
                      <div className="flex justify-between items-center pt-1 font-bold text-xs text-zinc-900 dark:text-zinc-100 border-t border-blue-200 dark:border-blue-900">
                        <span>Total Paid (COD/WhatsApp Pay):</span>
                        <span>₹{msg.actionData.total}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToTab?.('pharmacy')}
                      className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 cursor-pointer text-center"
                    >
                      Track Order in Pharmacy
                    </button>
                  </div>
                )}

                {msg.actionType === 'allergy_warning' && msg.actionData && (
                  <div className="mt-3 p-3 rounded-xl bg-red-100/90 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      PATIENT ALLERGY CONTRAINDICATION
                    </div>
                    <p className="leading-relaxed text-[11px]">{msg.actionData.warning}</p>
                  </div>
                )}

                {msg.actionType === 'record_saved' && msg.actionData && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      NEW RECORD INDEXED IN PATIENT VAULT
                    </div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{msg.actionData.title}</p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{msg.actionData.summary}</p>
                    <button
                      onClick={() => setShowFamilyDrawer(true)}
                      className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[11px] cursor-pointer"
                    >
                      Open Family Medical Vault →
                    </button>
                  </div>
                )}

                {/* EMERGENCY SOS CARD */}
                {msg.actionType === 'emergency_sos' && msg.actionData && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-red-950/90 to-red-900/90 border-2 border-red-500 text-white space-y-2.5 shadow-xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1.5 tracking-wider uppercase animate-pulse">
                        <Siren className="w-4 h-4" /> EMERGENCY SOS ACTIVE
                      </span>
                      <span className="text-[11px] font-bold text-red-200">
                        {msg.actionData.timestamp}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span>Patient in Distress:</span>
                        <span className="text-white">{msg.actionData.patientName} ({msg.actionData.age}y, {msg.actionData.relation})</span>
                      </div>
                      <p className="text-[11px] text-red-200 font-semibold">
                        Symptom: {msg.actionData.triggerReason}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-red-700/60 space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-emerald-300 font-bold">
                        <span>🚑 Ambulance ETA:</span>
                        <span>{msg.actionData.hospitalDispatched?.ambulanceETA || '7 - 9 Mins'}</span>
                      </div>
                      <p className="text-zinc-300">
                        Hospital: <strong>{msg.actionData.hospitalDispatched?.name}</strong> ({msg.actionData.hospitalDispatched?.distance})
                      </p>
                      <p className="text-zinc-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{msg.actionData.location?.address}</span>
                      </p>
                    </div>

                    {msg.actionData.criticalDossier && (
                      <div className="p-2 rounded-xl bg-red-900/40 border border-red-800 text-[10px] space-y-0.5 text-red-200">
                        <p><strong>Blood Group:</strong> {msg.actionData.criticalDossier.bloodGroup} • <strong>Allergies:</strong> {msg.actionData.criticalDossier.knownAllergies?.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AUTONOMOUS AGENT CLINIC CALL CARD */}
                {msg.actionType === 'agent_call_completed' && msg.actionData && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/80 text-emerald-100 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> CLINIC CALL CONFIRMED
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        Token: {msg.actionData.tokenOrReference || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white text-sm">
                        {msg.actionData.targetName}
                      </p>
                      <p className="text-emerald-300 text-xs">
                        {msg.actionData.resultSummary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveCallSession(msg.actionData)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> View Call Transcript &amp; Dialogue
                    </button>
                  </div>
                )}

                {/* AUTONOMOUS LOCAL PHARMACY CALL CARD */}
                {msg.actionType === 'local_pharmacy_call' && msg.actionData && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-600/80 text-blue-100 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                        <Truck className="w-3 h-3" /> LOCAL CHEMIST STOCK RESERVED
                      </span>
                      <span className="text-xs font-bold text-blue-300">
                        Ref: {msg.actionData.tokenOrReference}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white text-sm">
                        {msg.actionData.targetName}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {msg.actionData.resultSummary}
                      </p>
                      <p className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Store Rider ETA: {msg.actionData.deliveryEta || '25 Mins'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveCallSession(msg.actionData)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> View Chemist Call Transcript
                    </button>
                  </div>
                )}

                {/* MULTI-PLATFORM MEDICINE PRICE COMPARISON */}
                {msg.actionType === 'medicine_price_comparison' && msg.actionData && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Multi-Store Comparison
                        </span>
                        <h4 className="font-bold text-sm">
                          {msg.actionData.medicineName} ({msg.actionData.dosage})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {msg.actionData.packSize}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      Cheapest: <strong className="text-emerald-600">{msg.actionData.bestCheapestPlatform}</strong> • Fastest: <strong className="text-blue-600">{msg.actionData.bestFastestPlatform}</strong>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {msg.actionData.options?.map((opt: any, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-center flex flex-col justify-between ${
                            opt.isCheapest
                              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                              : opt.isFastest
                              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-850'
                          }`}
                        >
                          <span className="font-bold text-xs">{opt.platform}</span>
                          <div className="my-1">
                            <span className="text-base font-black">₹{opt.price}</span>
                            <span className="text-[10px] text-zinc-400 line-through ml-1">₹{opt.mrp}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600">{opt.deliveryTime}</span>
                          <a
                            href={opt.purchaseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 py-1 px-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-[10px] flex items-center justify-center gap-1 hover:opacity-90"
                          >
                            Buy <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendMessage(`Please order 1 pack of ${msg.actionData.medicineName} to my address at lowest price.`)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 text-center flex items-center justify-center gap-1"
                      >
                        ⚡ Order 1-Click via MedPulse (COD / UPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareLocationAndSearchPharmacies(msg.actionData.medicineName)}
                        className="py-1.5 px-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer flex items-center gap-1"
                        title="Check physical pharmacies nearby"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> Nearby Stores
                      </button>
                    </div>
                  </div>
                )}

                {/* NEARBY PHARMACIES LIST & CALL CHEMIST DISPATCH */}
                {msg.actionType === 'nearby_pharmacies_list' && msg.actionData && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> 4 LOCAL PHARMACIES WITHIN 2.5KM
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Bellandur / Koramangala</span>
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      Looking for: <strong className="text-zinc-900 dark:text-white">{msg.actionData.medicineName}</strong>. Tap below to have MedPulse AI place an automated outbound phone call to reserve stock:
                    </p>

                    <div className="space-y-2">
                      {msg.actionData.pharmacies?.map((ph: any, phIdx: number) => (
                        <div
                          key={phIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate text-zinc-900 dark:text-white">{ph.name}</span>
                              <span className="text-[10px] px-1 rounded-sm bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                ★ {ph.rating}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate">{ph.distance} • {ph.address}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold">{ph.isOpen24Hours ? 'Open 24/7' : 'Open till 11 PM'}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLaunchPharmacyCall(ph.name, msg.actionData.medicineName)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Call Chemist
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp & Status ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781] dark:text-[#8696a0]">
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Reply Pills */}
              {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-1 max-w-[90%]">
                  {msg.quickReplies.map((reply, rIdx) => (
                    <button
                      key={rIdx}
                      type="button"
                      onClick={() => handleSendMessage(reply)}
                      className="text-xs bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full px-3 py-1 font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Bubble */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] w-20 shadow-xs border border-zinc-200/50 dark:border-zinc-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu Popup */}
      {showAttachmentMenu && (
        <div className="absolute bottom-20 left-4 z-30 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-2.5 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="w-4 h-4" />
            </span>
            Upload Prescription / Lab Report (RAG Ingest)
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              audioFileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Volume2 className="w-4 h-4" />
            </span>
            Upload Audio File (Gnani STT Transcribe)
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowVoiceSimulationModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            Simulate Spoken WhatsApp Voice Query
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              onOpenTestFiles?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <FolderOpen className="w-4 h-4" />
            </span>
            📁 Choose from Test Medical Files (7 Pre-made)
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowPrescriptionModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Camera className="w-4 h-4" />
            </span>
            📸 Decipher Doctor Handwritten Prescription (OCR)
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              handleLaunchClinicCall();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <PhoneCall className="w-4 h-4" />
            </span>
            📞 Let Agent Call Clinic to Book Appointment
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              handleShareLocationAndSearchPharmacies();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <MapPin className="w-4 h-4" />
            </span>
            📍 Check Nearby Pharmacies &amp; Call Chemist
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowSOSModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-950">
              <Siren className="w-4 h-4" />
            </span>
            🚨 Emergency SOS Protocol
          </button>
        </div>
      )}

      {/* Hidden file input for report uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        className="hidden"
      />

      {/* Hidden file input for audio note uploads */}
      <input
        type="file"
        ref={audioFileInputRef}
        onChange={handleAudioFileUpload}
        accept="audio/*,.wav,.mp3,.ogg,.m4a"
        className="hidden"
      />

      {/* Family Member Switcher Pill Bar (Choose who is typing or sending files in group) */}
      <div className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto z-20 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
          Sender:
        </span>
        {FAMILY_MEMBERS.map((m) => {
          const isActive = activeSender.id === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveSender(m)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-white border border-zinc-200 dark:border-zinc-700'
              }`}
              title={`Switch sender to ${m.name} (${m.relation})`}
            >
              <img src={m.avatar} alt={m.name} className="w-3.5 h-3.5 rounded-full object-cover" />
              <span>{m.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">({m.relation})</span>
            </button>
          );
        })}
      </div>

      {/* Bottom WhatsApp Input Bar */}
      <div className="p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-zinc-200/50 dark:border-zinc-800/50 z-20 shrink-0">
        {isRecordingAudio ? (
          /* Live Voice Recording Bar */
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-800 rounded-full px-4 py-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-red-600">{formatTimer(recordingSeconds)}</span>
              <span className="text-xs text-zinc-500 font-medium">Recording WhatsApp voice note for Gnani STT...</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="text-xs text-zinc-500 hover:text-red-600 font-semibold px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4 translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : audioProcessing ? (
          /* Processing Speech Bar */
          <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gnani Prisma v2.5 transcribing your voice note...</span>
          </div>
        ) : (
          /* Standard Input Bar */
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu((prev) => !prev)}
              className="p-2 text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-white rounded-full cursor-pointer transition-colors"
              title="Attach Prescription or Audio Note"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            <button
              type="button"
              onClick={() => setShowVoiceSimulationModal(true)}
              className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
              title="Speak with Gnani AI or choose a voice prompt"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Voice Note</span>
            </button>

            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex items-center px-3 py-1.5 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                placeholder="Type a health question or tap mic..."
                className="flex-1 text-xs sm:text-sm bg-transparent text-[#111b21] dark:text-[#e9edef] focus:outline-hidden placeholder:text-[#8696a0]"
              />
            </div>

            {inputText.trim() ? (
              <button
                type="button"
                onClick={() => handleSendMessage(inputText)}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4 translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
                title="Tap to speak with Gnani STT (or tap Voice Note)"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Simulation Modal */}
      {showVoiceSimulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Voice Note Assistant (Gnani Speech AI)
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Select a voice prompt to test Gnani TTS &amp; STT directly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceSimulationModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Spoken Voice Queries (Processed by Gnani.ai):
              </p>

              {[
                {
                  title: '🩸 Lab Records & HbA1c Query',
                  speech: 'What was my HbA1c in the last blood test and is my blood sugar under control?',
                  desc: 'Queries RAG patient vault for August 2026 HbA1c report.',
                },
                {
                  title: '⚠️ Penicillin Allergy Safety Check',
                  speech: 'Can I take Augmentin 625 for my severe throat infection?',
                  desc: 'Triggers critical clinical allergy contraindication warning.',
                },
                {
                  title: '📅 Doctor Appointment Booking',
                  speech: 'I want to book an appointment with Dr. Anand Mehta tomorrow at 11:30 AM',
                  desc: 'Checks cardiology slots & generates WhatsApp consultation token.',
                },
                {
                  title: '💊 Pharmacy Medicine Refill',
                  speech: 'Please order 2 strips of Glycomet 500 SR and 1 strip of Telma 40 to my address',
                  desc: 'Creates express delivery order and calculates total price.',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSimulateVoiceQuery(item.speech)}
                  className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Speak
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 italic">&quot;{item.speech}&quot;</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{item.desc}</p>
                </button>
              ))}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceSimulationModal(false);
                    audioFileInputRef.current?.click();
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Or Upload Pre-Recorded Audio File (.wav, .mp3)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
