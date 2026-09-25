import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface WhatsAppVoiceNoteProps {
  audioUrl?: string;
  duration?: number;
  isUser?: boolean;
  timestamp?: string;
}

export const WhatsAppVoiceNote: React.FC<WhatsAppVoiceNoteProps> = ({
  audioUrl,
  duration = 4,
  isUser = false,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Random static wave heights for realistic WhatsApp waveform
  const waveformBars = useRef<number[]>(
    [40, 65, 30, 80, 50, 95, 60, 45, 85, 70, 55, 90, 75, 60, 85, 40, 65, 95, 50, 80, 45, 70, 60, 90, 50, 35]
  ).current;

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio playback error:', err);
      });
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeDuration = isPlaying ? currentTime : duration;
  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div className={`flex items-center gap-3 p-2 rounded-2xl w-full max-w-[280px] sm:max-w-[320px] select-none ${
      isUser ? 'bg-[#005c4b]/80 text-white' : 'bg-white/80 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-100 shadow-sm border border-emerald-100 dark:border-zinc-700/50'
    }`}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!audioUrl}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm ${
          isUser
            ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        } ${!audioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
      </button>

      {/* Waveform and Progress Bar */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div className="flex items-center gap-0.5 h-6 overflow-hidden px-0.5">
          {waveformBars.map((height, i) => {
            const barRatio = i / waveformBars.length;
            const isFilled = isPlaying && barRatio <= progressRatio;
            return (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-colors duration-150 ${
                  isUser
                    ? isFilled
                      ? 'bg-emerald-300'
                      : 'bg-emerald-700/60'
                    : isFilled
                    ? 'bg-emerald-600 dark:bg-emerald-400'
                    : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              />
            );
          })}
        </div>

        {/* Time & Gnani Badge */}
        <div className="flex items-center justify-between text-[11px] opacity-80 font-mono">
          <span>{formatSeconds(activeDuration)}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] tracking-tight text-emerald-500 font-sans font-medium flex items-center gap-0.5">
              <Volume2 className="w-2.5 h-2.5" /> Gnani AI
            </span>
          </div>
        </div>
      </div>

      {/* Playback speed toggle */}
      <button
        type="button"
        onClick={cycleSpeed}
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-all cursor-pointer ${
          isUser
            ? 'border-emerald-400/50 text-emerald-300 hover:bg-emerald-700/50'
            : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
        }`}
        title="Change playback speed"
      >
        {playbackRate}x
      </button>
    </div>
  );
};
