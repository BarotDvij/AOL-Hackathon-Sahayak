import { JOURNEY_CONFIG as C } from "./config";
import { formatLong } from "./dates";
import type { Channel, NextStep, Participant, StageId } from "./types";

const OPENERS: Record<StageId, string> = {
  paused: "",
  new: "I hope your practice is settling in nicely since the Happiness Program.",
  building: "It's been lovely seeing you at the follow-ups.",
  active: "It's been a joy having you around so often lately.",
  serving: "Thank you for all the care you bring to the centre.",
  quiet: "We've missed you, and I hope you're keeping well.",
  dormant: "We were thinking of you and hope life is treating you kindly.",
};

export const MAX_SHORT_CHARS = 400;
export const MAX_EMAIL_WORDS = 120;

/** Draft a warm, simple message. Uses only the step's own title, date, place and link. */
export function draftMessage(p: Participant, stage: StageId, step: NextStep, channel: Channel): string {
  const me = C.coordinatorName;
  const centre = p.city === "Online" ? "Art of Living online community" : `${p.city} centre`;
  const hello = `Hi ${p.firstName}, it's ${me} from the ${centre}.`;
  let invite: string;
  if (step.type === "check-in") {
    invite = step.id === "thank-you"
      ? "I just wanted to say a heartfelt thank you for your seva. It truly makes a difference."
      : "Just checking in to see how your practice has been going. I'd love to hear from you whenever it suits.";
  } else if (step.type === "seva") {
    invite = `If it ever appeals, we'd love your help to ${step.title.charAt(0).toLowerCase()}${step.title.slice(1)}. Only if it feels right.`;
  } else {
    const when = step.startDate ? ` on ${formatLong(step.startDate)}` : "";
    invite = `There's a ${step.title}${when} if you'd like to join. No pressure at all.${step.link ? ` Here's the link if it suits: ${step.link}` : ""}`;
  }
  const body = `${OPENERS[stage]} ${invite}`.trim();
  if (channel === "email") {
    return `Subject: ${step.type === "check-in" ? "Thinking of you" : step.shortTitle}\n\n${hello}\n\n${body}\n\nWarmly,\n${me}`;
  }
  return `${hello} ${body} Warmly, ${me}`;
}

export function messageLimitNote(text: string, channel: Channel) {
  if (channel === "email") {
    const words = text.replace(/^Subject:.*\n/, "").trim().split(/\s+/).filter(Boolean).length;
    return { ok: words <= MAX_EMAIL_WORDS, label: `${words}/${MAX_EMAIL_WORDS} words` };
  }
  return { ok: text.length <= MAX_SHORT_CHARS, label: `${text.length}/${MAX_SHORT_CHARS} characters` };
}
