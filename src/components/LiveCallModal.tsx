import React, { useState, useEffect } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  Lock,
  ChevronDown,
  Building2,
  Truck,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { AgentCallSession } from '../types.ts';

interface LiveCallModalProps {
  session: AgentCallSession | null;
  onClose: () => void;
  onPostCallToGroup: (session: AgentCallSession) => void;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  session,
  onClose,
  onPostCallToGroup,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Play dialogue line with browser speech synthesis for live voice
  const speakLine = (text: string, speaker: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      const isAgent = speaker === 'MedPulse AI Agent';
      utterance.pitch = isAgent ? 1.05 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(
        (v) =>
          (v.lang.includes('IN') || v.lang.includes('en')) &&
          (isAgent
            ? v.name.toLowerCase().includes('female') || v.name.includes('Google')
            : true)
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      utterance.onstart = () => setAudioPlaying(true);
      utterance.onend = () => setAudioPlaying(false);
      utterance.onerror = () => setAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  useEffect(() => {
    if (!session) return;

    setActiveStep(0);
    setCallDuration(0);

    // Initial greeting line
    if (session.dialogue[0]) {
      speakLine(session.dialogue[0].text, session.dialogue[0].speaker);
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Dialogue stepper
    let accumulatedTime = 1000;
    const timeouts: any[] = [];

    session.dialogue.forEach((line, index) => {
      accumulatedTime += line.delayMs || 3000;
      const t = setTimeout(() => {
        setActiveStep(index);
        speakLine(line.text, line.speaker);
      }, accumulatedTime);
      timeouts.push(t);
    });

    return () => {
      clearInterval(timer);
      timeouts.forEach((t) => clearTimeout(t));
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [session, isMuted]);

  if (!session) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCallFinished = activeStep >= session.dialogue.length - 1;
  const currentLine = session.dialogue[activeStep];

  const handleEndCallAndShare = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onPostCallToGroup(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111b21] text-white rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[580px] relative">
        {/* WhatsApp Voice Call Header */}
        <div className="pt-5 px-6 pb-2 flex items-center justify-between text-zinc-400 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-zinc-300 cursor-pointer"
            title="Minimize"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="w-5" />
        </div>

        {/* Contact Info & Avatar */}
        <div className="px-6 pt-4 pb-2 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-emerald-900/60 border-2 border-emerald-500/80 flex items-center justify-center shadow-lg">
              {session.callType === 'clinic_booking' ? (
                <Building2 className="w-9 h-9 text-emerald-300" />
              ) : (
                <Truck className="w-9 h-9 text-blue-300" />
              )}
            </div>
            {audioPlaying && (
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
            )}
          </div>

          <h2 className="text-base font-bold text-white tracking-tight">
            {session.targetName}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">{session.targetPhone}</p>
          <p className="text-xs font-mono font-medium text-emerald-400 mt-1">
            {isCallFinished ? 'Call Completed' : formatTimer(callDuration)}
          </p>
        </div>

        {/* Live Call Subtitles (Spoken Dialogue) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 text-xs">
          {session.dialogue.slice(0, activeStep + 1).map((line, idx) => {
            const isAgent = line.speaker === 'MedPulse AI Agent';
            const isLatest = idx === activeStep;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl max-w-[92%] transition-all ${
                  isAgent
                    ? 'ml-auto bg-[#005c4b] text-[#e9edef] rounded-tr-xs'
                    : 'mr-auto bg-[#202c33] text-[#e9edef] rounded-tl-xs'
                } ${isLatest ? 'ring-1 ring-emerald-400/50' : 'opacity-85'}`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-80">
                  <span>{isAgent ? 'MedPulse AI Agent' : line.speaker}</span>
                  {isLatest && audioPlaying && (
                    <span className="flex items-center gap-1 text-emerald-300 animate-pulse">
                      <Volume2 className="w-3 h-3" /> Speaking...
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">{line.text}</p>
              </div>
            );
          })}
        </div>

        {/* Post Summary to WhatsApp Group Button if call finished */}
        {isCallFinished && (
          <div className="px-5 py-2">
            <button
              type="button"
              onClick={handleEndCallAndShare}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Drop Call Summary &amp; Audio into Group
            </button>
          </div>
        )}

        {/* WhatsApp Voice Call Control Bar */}
        <div className="p-4 bg-[#1f2c34] flex items-center justify-around shrink-0 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setIsSpeakerOn((prev) => !prev)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              isSpeakerOn ? 'bg-white/20 text-white' : 'bg-white/10 text-zinc-400'
            }`}
            title="Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              isMuted ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white'
            }`}
            title="Mute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="p-3 rounded-full bg-white/10 text-zinc-400 cursor-not-allowed"
            title="Video"
          >
            <Video className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleEndCallAndShare}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
