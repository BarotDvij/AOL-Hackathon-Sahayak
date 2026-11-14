import { JOURNEY_CONFIG as C, SCORE_WEIGHTS as W } from "./config";
import { daysUntil, today } from "./dates";
import { draftMessage } from "./messages";
import type { Channel, History, NextStep, Participant, StageId, Suggestion } from "./types";

export function eligibleSteps(p: Participant, h: History, stage: StageId, catalog: NextStep[], now = today()) {
  const done = new Set(h.courses.map((c) => c.courseName));
  return catalog.filter((s) => {
    if (!s.stageFit.includes(stage)) return false;
    if (s.prerequisite && !done.has(s.prerequisite)) return false;
    if (s.completesCourse && done.has(s.completesCourse)) return false;
    if (s.startDate) { const d = daysUntil(s.startDate, now); if (d < 0 || d > C.suggestionWindowDays) return false; }
    if (s.city !== "Online" && s.city !== p.city) return false;
    if (s.language !== p.language && s.language !== "English") return false;
    return true;
  });
}

export function scoreStep(s: NextStep, p: Participant, h: History, stage: StageId, now = today()) {
  const stageFit = s.stageFit.includes(stage) ? 1 : 0;
  const interest = s.tags.some((t) => p.interests.includes(t)) || (s.language !== "English" && s.language === p.language) ? 1 : 0;
  const soon = s.startDate && daysUntil(s.startDate, now) <= C.startsSoonDays ? 1 : 0;
  const nearby = s.city === p.city ? 1 : 0;
  const declined = h.contacts.some((c) => c.outcome === "declined" && c.nextStepId === s.id) ? 1 : 0;
  return W.stageFit * stageFit + W.statedInterest * interest + W.startsSoon * soon + W.nearby * nearby + W.alreadyDeclined * declined;
}

export function pickChannel(p: Participant, h: History): Channel {
  if (p.preferredChannel) return p.preferredChannel;
  const lastReply = [...h.contacts].filter((c) => c.direction === "in" || c.outcome === "replied").sort((a, b) => b.date.localeCompare(a.date))[0];
  if (lastReply) return lastReply.channel;
  return p.phone ? "whatsapp" : "email";
}

/** Honest floor: with one course, nothing attended and no contact yet, a confident recommendation would be a guess. */
export const LOW_DATA_WHY = "Not enough info yet — a gentle check-in is the safest next step.";
export function hasEnoughInfo(h: History) {
  return h.courses.length > 1 || h.events.length > 0 || h.contacts.length > 0;
}

export function buildSuggestion(p: Participant, h: History, stage: StageId, why: string, catalog: NextStep[], now = today()): Suggestion | null {
  if (stage === "paused") return null;
  const channel = pickChannel(p, h);
  if (!hasEnoughInfo(h)) {
    const checkIn = catalog.find((s) => s.id === "gentle-checkin") ?? catalog.find((s) => s.type === "check-in");
    if (!checkIn) return null;
    return {
      id: `sug-${p.id}`, participantId: p.id, nextStepId: checkIn.id, alternateNextStepId: null,
      channel, why: LOW_DATA_WHY, draftMessage: draftMessage(p, stage, checkIn, channel), editedMessage: null,
      status: "pending", skipReason: null, reviewedBy: null, reviewedAt: null, lowData: true,
    };
  }
  const ranked = eligibleSteps(p, h, stage, catalog, now)
    .map((s) => ({ s, score: scoreStep(s, p, h, stage, now) }))
    .sort((a, b) => b.score - a.score || (a.s.startDate ?? "9").localeCompare(b.s.startDate ?? "9"));
  if (!ranked[0]) return null;
  return {
    id: `sug-${p.id}`, participantId: p.id, nextStepId: ranked[0].s.id, alternateNextStepId: ranked[1]?.s.id ?? null,
    channel, why, draftMessage: draftMessage(p, stage, ranked[0].s, channel), editedMessage: null,
    status: "pending", skipReason: null, reviewedBy: null, reviewedAt: null, lowData: false,
  };
}
