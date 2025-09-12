"use client";

import { useEffect, useRef } from "react";
import { detectDistress, type Locale } from "@/lib/distress-detector";

// Hotword listener using Web Speech API (if available). Falls back to no-op.
// Listens for panic words across supported locales and an optional custom safe word.
export const useSpeechHotword = (opts: {
  onHotword: () => void;
  locale?: Locale;
  safeWord?: string; // user-defined secret phrase
  continuous?: boolean;
}): { supported: boolean } => {
  const { onHotword, locale = "en", safeWord, continuous = true } = opts;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR: any = (typeof window !== "undefined" && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition));
    if (!SR) return;

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "te-IN";
    recognition.continuous = continuous;
    recognition.interimResults = true;

    const handleResult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const text = transcript.toLowerCase();
      if (safeWord && text.includes(safeWord.toLowerCase())) {
        onHotword();
        return;
      }
      if (detectDistress(text, locale) === "distress") {
        onHotword();
      }
    };

    recognition.onresult = handleResult;
    recognition.onerror = () => {
      // silently ignore to avoid drawing attention
    };
    recognition.onend = () => {
      if (continuous) {
        try { recognition.start(); } catch {}
      }
    };

    try { recognition.start(); } catch {}

    return () => {
      try { recognition.onresult = null; recognition.onend = null; recognition.onerror = null; recognition.stop(); } catch {}
    };
  }, [onHotword, locale, safeWord, continuous]);

  const supported = typeof window !== "undefined" && (!!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition);
  return { supported };
};