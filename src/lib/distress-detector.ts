"use client";

export type Locale = "en" | "hi" | "te";

const LEXICON: Record<Locale, string[]> = {
  en: [
    "help", "help me", "sos", "save me", "police", "call police", "emergency",
    "i am scared", "danger", "unsafe", "stalker", "attack", "assault",
  ],
  hi: [
    "बचाओ", "मदद", "मदद करो", "पुलिस", "इमरजेंसी", "खतरा", "डर लग रहा है",
    "बचाईए", "आक्रमण", "हमला", "सुरक्षित नहीं",
  ],
  te: [
    "సహాయం", "సేవ్ మీ", "పోలీస్", "ఎమర్జెన్సీ", "ప్రమాదం", "భయం గా ఉంది",
    "సురక్షితం కాదు", "దాడి", "రక్షించండి",
  ],
};

const ALL_LOCALES: Locale[] = ["en", "hi", "te"];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[_*~`^]|[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function locales(): Locale[] {
  return ALL_LOCALES;
}

export function getSamplePhrases(locale: Locale): string[] {
  return LEXICON[locale].slice(0, 8);
}

export function detectDistress(input: string, primary?: Locale): "distress" | null {
  const text = normalize(input);
  if (!text) return null;

  const candidates: Locale[] = primary ? [primary, ...ALL_LOCALES.filter(l => l !== primary)] : ALL_LOCALES;

  // Keyword match across locales (primary first)
  for (const loc of candidates) {
    const hits = LEXICON[loc].some((kw) => {
      const k = normalize(kw);
      // whole word or phrase containment
      return text.includes(k);
    });
    if (hits) return "distress";
  }

  // Heuristics: repeated exclamations, all caps words length >= 2, words like "help" without space/punct
  const exclamations = (input.match(/!|\?{2,}/g) || []).length;
  const capsWords = (input.match(/\b[A-Z]{2,}\b/g) || []).length;
  if (exclamations >= 2 || capsWords >= 2) return "distress";

  return null;
}