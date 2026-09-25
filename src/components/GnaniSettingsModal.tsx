import React, { useState } from 'react';
import { X, Mic, Volume2, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { GnaniVoiceSettings } from '../types.ts';

interface GnaniSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GnaniVoiceSettings;
  onSaveSettings: (settings: GnaniVoiceSettings) => void;
}

export const GnaniSettingsModal: React.FC<GnaniSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [current, setCurrent] = useState<GnaniVoiceSettings>({ ...settings });
  const [testingVoice, setTestingVoice] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  if (!isOpen) return null;

  const voices: { id: GnaniVoiceSettings['voice']; name: string; gender: string; desc: string }[] = [
    { id: 'Nalini', name: 'Nalini', gender: 'Female', desc: 'Warm, clear Indian English & Hindi accent' },
    { id: 'Deepak', name: 'Deepak', gender: 'Male', desc: 'Articulate, calm medical practitioner tone' },
    { id: 'Bhavna', name: 'Bhavna', gender: 'Female', desc: 'Soft, conversational, reassuring voice' },
    { id: 'Roopesh', name: 'Roopesh', gender: 'Male', desc: 'Deep, authoritative hospital consultation voice' },
    { id: 'Vikrant', name: 'Vikrant', gender: 'Male', desc: 'Crisp, energetic professional voice' },
    { id: 'Yashvi', name: 'Yashvi', gender: 'Female', desc: 'Friendly, bright clinical guide' },
  ];

  const languages = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  ];

  const handleTestVoice = async () => {
    setTestingVoice(true);
    setTestSuccess(false);
    setTestError(null);
    try {
      const res = await fetch('/api/gnani/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Namaste! This is ${current.voice} speaking via Gnani Timbre speech engine for MedPulse healthcare.`,
          voice: current.voice,
          language: current.language,
        }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(data.audioBase64);
        await audio.play();
        setTestSuccess(true);
      } else {
        setTestError('Gnani TTS test failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      setTestError('Error testing voice: ' + e.message);
    } finally {
      setTestingVoice(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Gnani.ai Speech &amp; Voice Engine</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Timbre v2.5 TTS &amp; Prisma v2.5 STT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Active Key Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-xs">Gnani Vachana API Key Connected</p>
                <p className="font-mono text-[11px] opacity-80">vach_1ytE2CY5...38a03b6</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
              Active
            </span>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              Gnani TTS Timbre Voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {voices.map((v) => {
                const isSelected = current.voice === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, voice: v.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{v.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {v.gender}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{v.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-emerald-600" />
              Language Code (STT &amp; TTS)
            </label>
            <select
              value={current.language}
              onChange={(e) => setCurrent({ ...current, language: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-emerald-600 font-medium"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">Auto-Play Voice Notes</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Automatically play Gnani voice notes when bot responds</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={current.autoSpeak}
                onChange={(e) => setCurrent({ ...current, autoSpeak: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Test Voice Audio Button */}
          <div className="pt-2 space-y-2">
            {testError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                {testError}
              </p>
            )}
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={testingVoice}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {testingVoice ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Gnani Audio Sample...
                </>
              ) : testSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Voice Verified! Click to Replay
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Test Voice &quot;{current.voice}&quot; with Gnani AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
