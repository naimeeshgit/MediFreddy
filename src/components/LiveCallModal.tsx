import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Mic,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  Sparkles,
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
        (v) => (v.lang.includes('IN') || v.lang.includes('en')) && (isAgent ? v.name.toLowerCase().includes('female') || v.name.includes('Google') : true)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 text-white rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[600px] relative">
        {/* Top Call Banner */}
        <div className="p-6 text-center bg-gradient-to-b from-zinc-900 to-transparent flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center relative mb-3">
            <Building2 className="w-9 h-9 text-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
            </span>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous MedPulse AI Calling Agent
          </span>
          <h2 className="text-xl font-bold mt-1 text-zinc-100">{session.targetName}</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{session.targetPhone}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {isCallFinished ? 'Call Completed' : `Connected: ${formatTimer(callDuration)}`}
            </span>
          </div>
        </div>

        {/* Live Audio Dialogue Box */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 font-sans text-xs">
          {session.dialogue.slice(0, activeStep + 1).map((line, idx) => {
            const isAgent = line.speaker === 'MedPulse AI Agent';
            const isCurrent = idx === activeStep;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  isAgent
                    ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-100 ml-4'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 mr-4'
                } ${isCurrent ? 'ring-2 ring-emerald-500/50 shadow-md' : 'opacity-85'}`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className={isAgent ? 'text-emerald-400' : 'text-zinc-400'}>
                    {line.speaker}
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-emerald-400 animate-pulse text-[9px]">
                      <Volume2 className="w-3 h-3" /> Speaking...
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-xs">{line.text}</p>
              </div>
            );
          })}
        </div>

        {/* Outcome Summary card if finished */}
        {isCallFinished && (
          <div className="mx-4 mb-2 p-3 rounded-2xl bg-emerald-900/40 border border-emerald-700/80 text-xs text-emerald-200 flex items-start gap-2.5 animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white text-xs">Call Objective Completed!</span>
              <p className="text-[11px] text-emerald-300 mt-0.5">{session.resultSummary}</p>
            </div>
          </div>
        )}

        {/* Call Controls Bottom Bar */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isMuted ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {isCallFinished ? (
            <button
              type="button"
              onClick={() => {
                onPostCallToGroup(session);
                onClose();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Share Summary in WhatsApp Group
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Call In Progress...
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
