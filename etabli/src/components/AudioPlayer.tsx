"use client";
import { useState, useEffect, useRef } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useLang } from "@/lib/i18n";
import { Play, Pause, Square, Volume2 } from "lucide-react";

type Speed = "slow" | "normal" | "fast";

interface AudioPlayerProps {
  text: string;
  label?: string;
  speed?: Speed;
  onEnd?: () => void;
  variant?: "full" | "compact" | "inline";
  wordByWord?: boolean;
  className?: string;
}

export default function AudioPlayer({
  text,
  label,
  speed: initialSpeed = "normal",
  onEnd,
  variant = "full",
  wordByWord = false,
  className = "",
}: AudioPlayerProps) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { speak, stop, pause, resume, speakWordByWord, isSpeaking, isPaused } = useTTS();
  const [speed, setSpeed] = useState<Speed>(initialSpeed);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated progress bar
  useEffect(() => {
    if (isSpeaking && !isPaused) {
      const estimatedDuration = (text.split(/\s+/).length / (speed === "slow" ? 1.5 : speed === "fast" ? 3.5 : 2.5)) * 1000;
      const step = 100 / (estimatedDuration / 100);
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + step, 99));
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    if (!isSpeaking) setProgress(0);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpeaking, isPaused, text, speed]);

  const handlePlay = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      if (wordByWord) {
        speakWordByWord(text, speed, onEnd);
      } else {
        speak(text, speed, onEnd);
      }
    }
  };

  const handleStop = () => {
    stop();
    setProgress(0);
  };

  const speedLabel: Record<Speed, string> = {
    slow: fr ? "Lent" : "Slow",
    normal: "Normal",
    fast: fr ? "Rapide" : "Fast",
  };

  // Inline variant: just a small icon button
  if (variant === "inline") {
    return (
      <button
        onClick={handlePlay}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all ${
          isSpeaking
            ? "bg-[#1D9E75] text-white animate-pulse-ring"
            : "bg-[#E1F5EE] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
        } ${className}`}
        title={fr ? "Écouter" : "Listen"}
      >
        {isSpeaking && !isPaused ? <Pause size={12} /> : <Volume2 size={12} />}
      </button>
    );
  }

  // Compact variant: small horizontal bar
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handlePlay}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
            isSpeaking
              ? "bg-[#1D9E75] text-white"
              : "bg-[#E1F5EE] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
          }`}
        >
          {isSpeaking && !isPaused ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        {isSpeaking && (
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
            <div
              className="h-full bg-[#1D9E75] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {label && <span className="text-xs text-gray-500">{label}</span>}
      </div>
    );
  }

  // Full variant: card with all controls
  return (
    <div className={`bg-[#F0FAF5] border border-[#1D9E75]/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={handlePlay}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 ${
            isSpeaking
              ? "bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/25"
              : "bg-[#085041] text-white hover:bg-[#1D9E75] shadow-md"
          }`}
        >
          {isSpeaking && !isPaused ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Progress + Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#085041] truncate">
              {label || (fr ? "Écouter l'audio" : "Listen to audio")}
            </span>
            {isSpeaking && (
              <button onClick={handleStop} className="text-gray-400 hover:text-red-500 transition">
                <Square size={14} />
              </button>
            )}
          </div>
          <div className="h-1.5 bg-[#1D9E75]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D9E75] rounded-full transition-all duration-100"
              style={{ width: `${isSpeaking ? progress : 0}%` }}
            />
          </div>
        </div>

        {/* Speed selector */}
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
          {(["slow", "normal", "fast"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSpeed(s);
                if (isSpeaking) {
                  stop();
                  setTimeout(() => {
                    if (wordByWord) speakWordByWord(text, s, onEnd);
                    else speak(text, s, onEnd);
                  }, 100);
                }
              }}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                speed === s
                  ? "bg-[#085041] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {speedLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Word-by-word indicator */}
      {wordByWord && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#1D9E75]">
          <Volume2 size={10} />
          <span>{fr ? "Lecture mot par mot" : "Word by word"}</span>
        </div>
      )}
    </div>
  );
}

// Mini speaker button for inline use (e.g., next to vocabulary words)
export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const { speak, isSpeaking } = useTTS();
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); speak(text, "normal"); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); speak(text, "normal"); } }}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all cursor-pointer ${
        isSpeaking
          ? "bg-[#1D9E75] text-white"
          : "bg-[#E1F5EE] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
      } ${className}`}
      title="Listen"
    >
      <Volume2 size={11} />
    </span>
  );
}
