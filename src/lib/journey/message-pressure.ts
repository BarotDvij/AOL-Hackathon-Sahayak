export const TONE_DEMO_DRAFT = "Hi Priya, this is your last chance — don't miss out on the follow-up!";
export function pressurePhrases(text: string): string[] {
  return [
    { label: 'last chance', pattern: /\blast\s+chance\b/i },
    { label: "don't miss out", pattern: /\bdon['’]?t\s+miss\s+out\b/i },
  ].filter(item => item.pattern.test(text)).map(item => item.label);
}