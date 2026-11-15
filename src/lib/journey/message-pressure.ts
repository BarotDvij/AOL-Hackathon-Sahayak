const PHRASES = [
  { label: 'last chance', pattern: /\blast\s+chance\b/i },
  { label: "don't miss out", pattern: /\bdon['’]?t\s+miss\s+out\b/i },
  { label: 'act now', pattern: /\bact\s+now\b/i },
  { label: 'hurry', pattern: /\bhurry\b/i },
  { label: 'before it’s too late', pattern: /\bbefore\s+it['’]?s\s+too\s+late\b/i },
];
export function pressurePhrases(text: string): string[] {
  return PHRASES.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}