"use client";
import { useState, useCallback, useRef, useEffect } from "react";

type Speed = "slow" | "normal" | "fast";

const RATES: Record<Speed, number> = {
  slow: 0.7,
  normal: 1.0,
  fast: 1.3,
};

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getFrenchVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer fr-CA, then fr-FR, then any fr
    return (
      voices.find((v) => v.lang === "fr-CA") ||
      voices.find((v) => v.lang === "fr-FR") ||
      voices.find((v) => v.lang.startsWith("fr")) ||
      null
    );
  }, []);

  const speak = useCallback(
    (text: string, speed: Speed = "normal", onEnd?: () => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      const voice = getFrenchVoice();
      if (voice) utter.voice = voice;
      utter.lang = "fr-FR";
      utter.rate = RATES[speed];
      utter.pitch = 1;

      utter.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utter.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };
      utter.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [getFrenchVoice]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const speakWordByWord = useCallback(
    (text: string, speed: Speed = "slow", onEnd?: () => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const words = text.split(/\s+/).filter(Boolean);
      let index = 0;

      const speakNext = () => {
        if (index >= words.length) {
          setIsSpeaking(false);
          onEnd?.();
          return;
        }
        const utter = new SpeechSynthesisUtterance(words[index]);
        const voice = getFrenchVoice();
        if (voice) utter.voice = voice;
        utter.lang = "fr-FR";
        utter.rate = RATES[speed];
        utter.onend = () => {
          index++;
          setTimeout(speakNext, 400); // pause between words
        };
        utter.onerror = () => {
          index++;
          speakNext();
        };
        utterRef.current = utter;
        window.speechSynthesis.speak(utter);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      speakNext();
    },
    [getFrenchVoice]
  );

  return { speak, stop, pause, resume, speakWordByWord, isSpeaking, isPaused };
}
