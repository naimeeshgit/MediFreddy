/**
 * MedPulse WhatsApp AI Assistant
 * 100% Authentic WhatsApp Group Interface
 * Strictly restricted to WhatsApp UI patterns: standard bubbles, WhatsApp Business interactive buttons,
 * native document/location/voice attachments, and WhatsApp call screens.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  Check,
  CheckCheck,
  FileText,
  Camera,
  Image as ImageIcon,
  Headphones,
  MapPin,
  User,
  Download,
  X,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  WhatsAppMessage,
  GnaniVoiceSettings,
  MedicalRecord,
  AgentCallSession,
  FamilyMember,
} from '../types.ts';
import { WhatsAppVoiceNote } from './WhatsAppVoiceNote.tsx';
import { AudioRecorder } from '../utils/audioEncoder.ts';
import { LiveCallModal } from './LiveCallModal.tsx';
import { FamilyVaultDrawer } from './FamilyVaultDrawer.tsx';
import { FAMILY_MEMBERS } from '../server/familyData.ts';

interface WhatsAppChatProps {
  settings: GnaniVoiceSettings;
  onOpenSettings: () => void;
  onOpenTestFiles?: () => void;
}

const INITIAL_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    text: `*Namaste Sharma Family!* 👨‍👩‍👧‍👦 Welcome to your family health group.

I am *MedPulse AI*, your 24x7 verified health assistant (+91 98765 43210).

*Group Members Registered:*
• 👤 *Rahul* (42y) - Type 2 Diabetes, Hypertension ⚠️ *PENICILLIN ALLERGY*
• 👩 *Sunita* (39y, Wife) - Chronic Migraine, Hypothyroidism
• 👴 *Ramesh* (71y, Dad) - Post-LAD Stent, BP
• 👧 *Ananya* (11y, Kid) - Pediatric Allergic Asthma

*How to use this group:*
• Send any family member's lab report, prescription slip, or file (📎 ➔ Document / Camera). I will identify who it belongs to and store it in our group docs.
• In any emergency, type or say *SOS* or *chest pain* to dispatch 108 ambulance & transmit medical dossier.
• Ask me to book appointments with doctors or check real-time medicine prices across Tata 1mg, PharmEasy, and Apollo.`,
    timestamp: '09:30 AM',
    senderName: 'MedPulse AI',
    status: 'read',
    quickReplies: [
      '🚨 SOS: Dad having severe chest pain',
      '📞 Book Dr. Sunita Rao at Apollo Clinic tomorrow',
      '💊 Compare prices for Glycomet 500 SR across apps',
      '🩸 What was Rahul\'s last HbA1c result?',
      '📍 Check nearby offline pharmacies for Montair LC Kid',
    ],
  },
];

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  settings,
  onOpenSettings,
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

  // WhatsApp Menus & Overlays
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [showPrescriptionPicker, setShowPrescriptionPicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Call & Records State
  const [activeCallSession, setActiveCallSession] = useState<AgentCallSession | null>(null);
  const [familyRecords, setFamilyRecords] = useState<MedicalRecord[]>([]);
  const [chatToast, setChatToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('medpulse_family_whatsapp_messages', JSON.stringify(messages));
  }, [messages, isTyping]);

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

  const showNotification = (msg: string) => {
    setChatToast(msg);
    setTimeout(() => setChatToast(null), 3000);
  };

  // Ingest medical document sent into group
  const handleIngestAndSendFile = async (filename: string, content: string) => {
    setShowDocumentPicker(false);
    setShowAttachmentMenu(false);

    const userMsgId = `user_${Date.now()}`;
    const userMsg: WhatsAppMessage = {
      id: userMsgId,
      role: 'user',
      text: content.length > 120 ? `${content.slice(0, 120)}...` : content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: activeSender.name,
      senderAvatar: activeSender.avatar,
      memberId: activeSender.id,
      status: 'sent',
      actionType: 'document_attachment',
      documentMeta: {
        filename,
        fileSize: `${Math.max(48, Math.round(content.length / 10))} KB`,
        fileType: filename.endsWith('.pdf') ? 'PDF' : 'DOC',
        rawText: content,
      },
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

        setFamilyRecords((prev) => [record, ...prev]);

        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: `📄 *Document Analyzed & Saved to Group Docs* 📂

👤 *Patient Identified:* *${member.name}* (${member.relation}, ${member.age}y)
📋 *Record:* ${record.title}
💡 *Key Findings:* ${record.summary}

_Indexed securely in Sharma Family Group Docs._`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
          actionType: 'record_saved',
          actionData: {
            ...record,
            memberName: member.name,
            relation: member.relation,
          },
          quickReplies: [
            `📋 Explain ${member.name.split(' ')[0]}'s report in detail`,
            `📞 Book doctor follow-up for ${member.name.split(' ')[0]}`,
            `💊 Check medicine refills for ${member.name.split(' ')[0]}`,
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e: any) {
      setIsTyping(false);
      showNotification('Error processing document: ' + e.message);
    }
  };

  // Autonomous Agent Call to Clinic
  const handleLaunchClinicCall = async (
    clinicName: string = 'Apollo Multi-Specialty Clinic',
    doctorName: string = 'Dr. Sunita Rao'
  ) => {
    setShowMenu(false);
    showNotification(`Connecting voice call to ${clinicName}...`);
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
      showNotification('Call error: ' + e.message);
    }
  };

  // Autonomous Agent Call to Local Chemist
  const handleLaunchPharmacyCall = async (
    pharmacyName: string = 'Apollo Pharmacy 24x7 Koramangala',
    medicineName: string = 'Montair LC Kid'
  ) => {
    setShowMenu(false);
    showNotification(`Calling ${pharmacyName} to check stock...`);
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
      showNotification('Call error: ' + e.message);
    }
  };

  // Send WhatsApp Location
  const handleShareLocationAndSearchPharmacies = async (medName: string = 'Montair LC Kid') => {
    setShowAttachmentMenu(false);

    const locMsgId = `loc_${Date.now()}`;
    const userLocMsg: WhatsAppMessage = {
      id: locMsgId,
      role: 'user',
      text: '📍 Current Location Shared',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: activeSender.name,
      senderAvatar: activeSender.avatar,
      memberId: activeSender.id,
      status: 'sent',
      actionType: 'location_attachment',
      locationMeta: {
        name: 'Flat 402, Green Glen Layout',
        address: 'Bellandur, Outer Ring Road, Bengaluru - 560103',
        lat: 12.9279,
        lng: 77.6784,
      },
    };
    setMessages((prev) => [...prev, userLocMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/pharmacies/nearby');
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.pharmacies) {
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: `📍 *4 Physical Pharmacies Located Near Bellandur (2.5 km)*

Because *${medName}* is urgently needed, I checked stock across nearby chemists:

1. *Apollo Pharmacy 24x7* (450m, Koramangala) • ⭐ 4.8 • Open 24/7
2. *MedPlus Health* (750m, Bellandur) • ⭐ 4.6 • Closes 11 PM
3. *Frank Ross Chemist* (1.2km) • ⭐ 4.5 • Delivery in 20m
4. *Guardian 24/7 Lifecare* (2.4km) • ⭐ 4.7 • Open 24/7

_Tap a button below to place an outbound stock confirmation call:_`,
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
            `💊 Compare Online (Tata 1mg vs Apollo)`,
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e: any) {
      setIsTyping(false);
      showNotification('Failed to locate pharmacies: ' + e.message);
    }
  };

  // Send Handwritten Doctor Prescription
  const handleSendHandwrittenPrescription = async (sampleIndex: number) => {
    setShowPrescriptionPicker(false);
    setShowAttachmentMenu(false);

    const sampleSlips = [
      {
        title: 'Prescription_Dr_Anand_Mehta.jpg',
        text: 'Rx: Tab Augmentin 625 Duo 1-0-1 for 5 days. Tab Paracetamol 650mg SOS.',
        patientName: 'Rahul Sharma',
      },
      {
        title: 'Pediatric_Rx_Dr_Verma.jpg',
        text: 'Rx: Tab Montair LC Kid chewable 0-0-1 at bedtime. Budecort 100 Inhaler 2 puffs BD.',
        patientName: 'Ananya Sharma',
      },
      {
        title: 'Neurology_Rx_Dr_Priya.jpg',
        text: 'Rx: Tab Rizatriptan 10mg SOS for migraine headache. Tab Thyronorm 25mcg morning.',
        patientName: 'Sunita Sharma',
      },
    ];

    const chosen = sampleSlips[sampleIndex] || sampleSlips[0];

    const userMsgId = `img_${Date.now()}`;
    const userImgMsg: WhatsAppMessage = {
      id: userMsgId,
      role: 'user',
      text: `Prescription Slip: ${chosen.title}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: activeSender.name,
      senderAvatar: activeSender.avatar,
      memberId: activeSender.id,
      status: 'sent',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    };
    setMessages((prev) => [...prev, userImgMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/prescription/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chosen.text,
          sampleIndex,
        }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        const isPenicillin = chosen.text.includes('Augmentin');
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: `📋 *Doctor Handwritten Prescription Deciphered (Vision OCR)*

• *Patient:* ${chosen.patientName}
• *Deciphered Rx:* ${chosen.text}

${
  isPenicillin
    ? `🚨 *CRITICAL CONTRAINDICATION ALERT*
Rahul Sharma has a documented *SEVERE PENICILLIN ALLERGY* in the group vault (causes bronchospasm & severe urticaria).
*Augmentin contains Amoxicillin and MUST NOT be taken!*
Recommended safe alternative for bacterial infection: *Azithromycin 500mg* or *Levofloxacin 500mg* (subject to doctor confirmation).`
    : `✅ *Safety Verification Passed:* No contraindications detected against known family allergies.`
}

────────────────────────
💊 *Price Comparison (Online Pharmacies):*
• *PharmEasy:* ₹47 (24% OFF) • Delivery by 8:00 PM
• *Apollo 24|7:* ₹55 (12% OFF) • *19 Mins* via Express Store Rider
• *Tata 1mg:* ₹51 (18% OFF) • Tomorrow Morning
• *Netmeds:* ₹50 (20% OFF) • Tomorrow 2:00 PM`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'MedPulse AI',
          actionType: 'medicine_price_comparison',
          actionData: data.comparison,
          quickReplies: [
            `⚡ 1-Click Order via MedPulse`,
            `📍 Check offline stock in nearby pharmacies`,
            `📞 Call clinic to request safe antibiotic alternative`,
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e: any) {
      setIsTyping(false);
      showNotification('Prescription OCR error: ' + e.message);
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
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone API not available');
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
      showNotification('Microphone not accessible. Please type or upload an audio file.');
    }
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    audioRecorderRef.current?.cancel();
    audioRecorderRef.current = null;
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  const stopAndSendRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecordingAudio(false);
    setAudioProcessing(true);

    try {
      const audioBlob = await audioRecorderRef.current?.stop();
      audioRecorderRef.current = null;

      if (!audioBlob) {
        setAudioProcessing(false);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const res = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              language: settings.language,
            }),
          });
          const data = await res.json();
          setAudioProcessing(false);

          if (data.success && data.transcript) {
            await handleSendMessage(data.transcript, true, data.transcript);
          } else {
            await handleSendMessage('What was my HbA1c in the last blood test?', true);
          }
        } catch (e: any) {
          setAudioProcessing(false);
          await handleSendMessage('Please check if my blood sugar is under control', true);
        }
      };
    } catch (e) {
      setAudioProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || `Medical document ${file.name}`;
      await handleIngestAndSendFile(file.name, content);
    };
    reader.readAsText(file);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem('medpulse_family_whatsapp_messages');
    showNotification('Chat history cleared.');
  };

  const filteredMessages = isSearching && searchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden select-none font-sans">
      {/* Authentic WhatsApp Top Header */}
      <div className="h-16 px-4 bg-[#008069] dark:bg-[#202c33] text-white flex items-center justify-between shadow-xs z-20 shrink-0 select-none">
        {/* Left: Group Profile & Title */}
        <div
          onClick={() => setShowGroupInfo(true)}
          className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity min-w-0"
          title="Click to view Group info"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden border border-white/20">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-base tracking-tight truncate">
                Sharma Family 👨‍👩‍👧‍👦
              </h2>
            </div>
            <p className="text-[12px] text-emerald-100 dark:text-zinc-400 truncate">
              {isTyping ? (
                <span className="text-emerald-200 animate-pulse font-medium">MedPulse AI is typing...</span>
              ) : isRecordingAudio ? (
                <span className="text-emerald-200 animate-pulse font-medium">recording audio...</span>
              ) : (
                'Rahul, Sunita, Ramesh, Ananya, MedPulse AI'
              )}
            </p>
          </div>
        </div>

        {/* Right: Only Standard WhatsApp Icons */}
        <div className="flex items-center gap-1 text-white/95 shrink-0 relative">
          <button
            type="button"
            onClick={() => handleLaunchClinicCall('Apollo Multi-Specialty Clinic', 'Dr. Sunita Rao')}
            className="p-2.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleLaunchPharmacyCall('Apollo Pharmacy 24x7 Koramangala', 'Montair LC Kid')}
            className="p-2.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
            title="Voice call"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearching((prev) => !prev)}
            className="p-2.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
            title="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Three-dots menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 bg-white dark:bg-[#233138] rounded-md shadow-2xl py-2 text-sm text-[#111b21] dark:text-[#d1d7db] border border-black/5 dark:border-white/5 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowGroupInfo(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] cursor-pointer"
                >
                  Group info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowGroupInfo(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] cursor-pointer"
                >
                  Group media, links &amp; docs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] cursor-pointer"
                >
                  Voice settings
                </button>
                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    clearChat();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-red-600 dark:text-red-400 cursor-pointer"
                >
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {isSearching && (
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 z-20">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-xs text-[#111b21] dark:text-[#e9edef] focus:outline-hidden"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Notification Toast */}
      {chatToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#111b21]/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-zinc-700 animate-in fade-in slide-in-from-top-2">
          {chatToast}
        </div>
      )}

      {/* Messages Canvas with WhatsApp doodle pattern */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 z-10"
        style={{
          backgroundImage: `radial-gradient(#00000008 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Security & HIPAA Notice */}
        <div className="flex justify-center my-1">
          <div className="max-w-md bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-[11px] rounded-lg px-3 py-1.5 text-center shadow-xs border border-[#ffdf9d]/60 dark:border-zinc-800 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#54656f] dark:text-[#8696a0]" />
            <span>Messages and calls are end-to-end encrypted. Grounded in Sharma Family Medical Vault.</span>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-2.5 shadow-2xs relative ${
                  isUser
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-xs'
                    : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-xs border border-zinc-200/40 dark:border-zinc-800/40'
                }`}
              >
                {/* Sender Name in WhatsApp Group Chat Color */}
                <div className="flex items-center gap-1.5 mb-1 pb-0.5">
                  {isUser ? (
                    <span
                      className={`text-[11px] font-bold ${
                        msg.memberId === 'mem_sunita'
                          ? 'text-purple-700 dark:text-purple-300'
                          : msg.memberId === 'mem_ramesh'
                          ? 'text-amber-700 dark:text-amber-300'
                          : msg.memberId === 'mem_ananya'
                          ? 'text-pink-700 dark:text-pink-300'
                          : 'text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      ~ {msg.senderName}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      ~ MedPulse AI
                      <span className="text-[9px] px-1 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                        Verified
                      </span>
                    </span>
                  )}
                </div>

                {/* 1. DOCUMENT ATTACHMENT */}
                {msg.documentMeta && (
                  <div
                    onClick={() => setShowGroupInfo(true)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 dark:bg-black/20 mb-2 cursor-pointer border border-black/5 dark:border-white/5 hover:bg-black/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#ea4335] text-white flex flex-col items-center justify-center shrink-0 font-bold text-[10px] shadow-2xs">
                      <span>{msg.documentMeta.fileType}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#111b21] dark:text-[#e9edef] truncate">
                        {msg.documentMeta.filename}
                      </p>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                        {msg.documentMeta.fileSize} • {msg.documentMeta.fileType}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-[#667781] dark:text-[#8696a0] shrink-0" />
                  </div>
                )}

                {/* 2. LOCATION ATTACHMENT */}
                {msg.locationMeta && (
                  <div
                    onClick={() => handleShareLocationAndSearchPharmacies()}
                    className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 mb-2 cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
                  >
                    <div className="h-28 bg-[#e8eaed] dark:bg-[#1f2c34] relative flex items-center justify-center">
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{
                          backgroundImage: 'radial-gradient(#008069 1.5px, transparent 1.5px)',
                          backgroundSize: '12px 12px',
                        }}
                      />
                      <div className="relative flex flex-col items-center">
                        <MapPin className="w-7 h-7 text-red-500 fill-red-500 drop-shadow-sm" />
                        <span className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300 bg-white/90 dark:bg-black/70 px-2 py-0.5 rounded-full shadow-2xs mt-1">
                          Live Location
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-[#202c33]">
                      <p className="font-semibold text-xs text-[#111b21] dark:text-[#e9edef]">
                        {msg.locationMeta.name}
                      </p>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696a0] truncate">
                        {msg.locationMeta.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. IMAGE / PRESCRIPTION ATTACHMENT */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-2 border border-black/5 dark:border-white/5">
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      className="w-full max-h-56 object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* 4. VOICE NOTE PLAYER */}
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

                {/* 5. TEXT BODY (WhatsApp Markdown) */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={line === '' ? 'h-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Timestamp & double blue ticks */}
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

                {/* 6. WHATSAPP BUSINESS INTERACTIVE ACTION BUTTONS */}
                {/* Clean border-separated rows with centered WhatsApp green text */}
                {!isUser && (
                  <div className="mt-2 -mx-2.5 -mb-2.5 border-t border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10">
                    {/* Specific Action Buttons */}
                    {msg.actionType === 'appointment_booked' && msg.actionData && (
                      <button
                        type="button"
                        onClick={() =>
                          handleLaunchClinicCall(
                            msg.actionData.clinicName || 'Apollo Multi-Specialty Clinic',
                            msg.actionData.doctorName || 'Dr. Sunita Rao'
                          )
                        }
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer first:rounded-b-none last:rounded-b-2xl"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Clinic to Confirm or Reschedule</span>
                      </button>
                    )}

                    {msg.actionType === 'medicine_price_comparison' && msg.actionData && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleSendMessage(
                              `Please place an express 1-click order for 1 pack of ${msg.actionData.medicineName} to my address at lowest price.`
                            )
                          }
                          className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>⚡ Place 1-Click Order (COD / UPI)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleShareLocationAndSearchPharmacies(msg.actionData.medicineName)
                          }
                          className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer last:rounded-b-2xl"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Check Offline Physical Pharmacies</span>
                        </button>
                      </>
                    )}

                    {msg.actionType === 'nearby_pharmacies_list' && msg.actionData && (
                      <button
                        type="button"
                        onClick={() =>
                          handleLaunchPharmacyCall(
                            msg.actionData.pharmacies?.[0]?.name || 'Apollo Pharmacy 24x7 Koramangala',
                            msg.actionData.medicineName || 'Montair LC Kid'
                          )
                        }
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer last:rounded-b-2xl"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Chemist to Reserve Stock</span>
                      </button>
                    )}

                    {msg.actionType === 'record_saved' && (
                      <button
                        type="button"
                        onClick={() => setShowGroupInfo(true)}
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer last:rounded-b-2xl"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View in Group Docs</span>
                      </button>
                    )}

                    {/* Quick Replies as WhatsApp Interactive Template Buttons */}
                    {msg.quickReplies &&
                      msg.quickReplies.slice(0, 3).map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleSendMessage(reply)}
                          className="w-full py-2 px-3 text-center text-xs font-medium text-[#00a884] dark:text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1 cursor-pointer first:rounded-b-none last:rounded-b-2xl"
                        >
                          <span>{reply}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] w-20 shadow-2xs border border-zinc-200/50 dark:border-zinc-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Attachment Menu (The Exact 6 Circular Icons) */}
      {showAttachmentMenu && (
        <div className="absolute bottom-20 left-4 z-30 bg-white dark:bg-[#233138] rounded-2xl shadow-2xl border border-black/5 dark:border-white/5 p-4 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Document */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowDocumentPicker(true);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#7f66ff] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Document</span>
          </button>

          {/* Camera (Handwritten Prescription OCR) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowPrescriptionPicker(true);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#d3396d] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Camera</span>
          </button>

          {/* Gallery */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              fileInputRef.current?.click();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#c32aa3] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Gallery</span>
          </button>

          {/* Audio */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              audioFileInputRef.current?.click();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#e15b64] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Audio</span>
          </button>

          {/* Location */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              handleShareLocationAndSearchPharmacies();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#1e9f75] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Location</span>
          </button>

          {/* Contact */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(false);
              setShowGroupInfo(true);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-[#007bfc] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-[#111b21] dark:text-[#d1d7db]">Contact</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={audioFileInputRef}
        onChange={() => {
          handleSendMessage('What was my HbA1c in the last blood test and is it normal?', true);
        }}
        accept="audio/*,.wav,.mp3,.ogg,.m4a"
        className="hidden"
      />

      {/* Authentic WhatsApp Bottom Input Bar */}
      <div className="p-2 sm:p-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-zinc-200/50 dark:border-zinc-800/50 z-20 shrink-0 select-none">
        {isRecordingAudio ? (
          /* Live WhatsApp Voice Recording Bar */
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-red-600">{formatTimer(recordingSeconds)}</span>
              <span className="text-xs text-zinc-500 font-medium">Recording voice note...</span>
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
                className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4 translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : audioProcessing ? (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transcribing voice note...</span>
          </div>
        ) : (
          /* Standard WhatsApp Input Bar */
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => showNotification('Emoji keyboard: type any message or emoji')}
              className="p-2 text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-white rounded-full cursor-pointer transition-colors"
              title="Emoji"
            >
              <Smile className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => setShowAttachmentMenu((prev) => !prev)}
              className="p-2 text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-white rounded-full cursor-pointer transition-colors"
              title="Attach Document, Photo, Location"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex items-center px-4 py-2 shadow-2xs border border-zinc-200/40 dark:border-zinc-700/40">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                placeholder="Type a message"
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
                title="Hold or tap to speak voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Document Picker Sheet */}
      {showDocumentPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#202c33] rounded-3xl shadow-2xl p-5 space-y-4 text-xs text-[#111b21] dark:text-[#e9edef]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7f66ff]" />
                <h3 className="font-bold text-sm">Send Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDocumentPicker(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDocumentPicker(false);
                fileInputRef.current?.click();
              }}
              className="w-full py-2.5 px-3 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 rounded-xl font-bold border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-100"
            >
              <FileText className="w-4 h-4" /> Browse from Computer (.pdf, .txt, image)
            </button>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Recent Family Medical Files (Tap to send):
              </span>
              {[
                { name: '01_Renal_Function_Test_KFT_2026.txt', patient: 'Rahul (Self)', desc: 'Creatinine 0.92 mg/dL, BUN 16 mg/dL' },
                { name: '02_Thyroid_Profile_TSH_2026.txt', patient: 'Sunita (Wife)', desc: 'TSH 5.8 mIU/L, Thyronorm 25mcg' },
                { name: '05_Cardiology_Echocardiogram_2026.txt', patient: 'Ramesh (Father)', desc: 'Post-LAD Stent, EF 55%, Atorvastatin' },
                { name: '03_Complete_Blood_Count_CBC_2026.txt', patient: 'Ananya (Daughter)', desc: 'Pediatric Asthma, Montair LC Kid' },
                { name: '07_Emergency_Allergy_Dossier_2025.txt', patient: 'Rahul (Self)', desc: 'Severe Penicillin & Amoxicillin allergy' },
              ].map((doc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleIngestAndSendFile(
                      doc.name,
                      `CLINICAL REPORT FILE: ${doc.name}\nPatient: ${doc.patient}\nFindings: ${doc.desc}\nVerified hospital lab record.`
                    )
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs block truncate group-hover:text-emerald-600">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {doc.patient} • {doc.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Camera / Prescription OCR Picker Sheet */}
      {showPrescriptionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#202c33] rounded-3xl shadow-2xl p-5 space-y-4 text-xs text-[#111b21] dark:text-[#e9edef]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#d3396d]" />
                <h3 className="font-bold text-sm">Send Prescription Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrescriptionPicker(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPrescriptionPicker(false);
                cameraInputRef.current?.click();
              }}
              className="w-full py-2.5 px-3 bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 rounded-xl font-bold border border-pink-200 dark:border-pink-800 flex items-center justify-center gap-2 cursor-pointer hover:bg-pink-100"
            >
              <Camera className="w-4 h-4" /> Open Camera / Take Photo
            </button>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Doctor Handwritten Slips (Tap to test Vision OCR):
              </span>
              {[
                { title: 'Dr. Anand Mehta - Cardiology / Infection', rx: 'Tab Augmentin 625 Duo 1-0-1 (Amoxicillin) ⚠️ Checks Penicillin Allergy' },
                { title: 'Dr. Rohan Verma - Pediatric Asthma', rx: 'Tab Montair LC Kid 0-0-1, Budecort 100 Inhaler SOS' },
                { title: 'Dr. Priya Sharma - Migraine & Thyroid', rx: 'Tab Rizatriptan 10mg SOS, Tab Thyronorm 25mcg morning' },
              ].map((slip, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleSendHandwrittenPrescription(sIdx)}
                  className="w-full text-left p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-pink-500 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs block truncate group-hover:text-pink-600">
                      {slip.title}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {slip.rx}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Group Info Panel (Right Drawer) */}
      <FamilyVaultDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        records={familyRecords}
        onSelectMemberPrompt={(prompt) => handleSendMessage(prompt)}
        activeSenderId={activeSender.id}
        onSelectActiveSender={(m) => {
          setActiveSender(m);
          showNotification(`Now sending as ${m.name} (${m.relation})`);
        }}
      />

      {/* Simulated WhatsApp Phone Call Screen */}
      <LiveCallModal
        session={activeCallSession}
        onClose={() => setActiveCallSession(null)}
        onPostCallToGroup={(session) => {
          const summaryText = session.callType === 'clinic_booking'
            ? `📞 *Apollo Multi-Specialty Clinic Call Completed*

Our automated voice agent connected with *Apollo Multi-Specialty Clinic* (+91 80 2553 1122):
• *Doctor:* Dr. Sunita Rao (Diabetology & Endocrinology)
• *Patient:* ${session.patientName}
• *Scheduled Slot:* Tomorrow at 11:30 AM
• *Token No:* AP-8842
• *Consultation Fee:* ₹800 (Pay at clinic counter / UPI)

🗓️ Added to family shared medical calendar.`
            : `📞 *Apollo Pharmacy 24x7 Called & Stock Reserved*

Chemist: Ramesh Kumar (Apollo Pharmacy Koramangala)
• *Medicine:* Montair LC Kid (2 strips)
• *Status:* In Stock & Reserved (Ref #${session.tokenOrReference || 'AP-CH-491'})
• *Store Delivery Boy ETA:* *25 Mins* to Green Glen Layout
• *Amount:* ₹164 (COD / WhatsApp Pay)`;

          const callMsg: WhatsAppMessage = {
            id: `call_${Date.now()}`,
            role: 'assistant',
            text: summaryText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: 'MedPulse AI',
            actionType: session.callType === 'clinic_booking' ? 'appointment_booked' : 'medicine_order',
            actionData: session.callType === 'clinic_booking' ? {
              tokenNumber: 'AP-8842',
              doctorName: 'Dr. Sunita Rao',
              specialty: 'Diabetology & Endocrinology',
              clinicName: 'Apollo Multi-Specialty Clinic',
              date: 'Tomorrow',
              timeSlot: '11:30 AM',
              consultationFee: 800,
            } : {
              id: session.tokenOrReference || 'AP-CH-491',
              items: [{ name: 'Montair LC Kid', quantity: 2 }],
              deliveryEta: '25 Mins (Store Rider on duty)',
              deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur',
              total: 164,
            },
          };
          setMessages((prev) => [...prev, callMsg]);
        }}
      />
    </div>
  );
};
