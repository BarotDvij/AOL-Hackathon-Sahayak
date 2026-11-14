import { JOURNEY_CONFIG } from "./config";
import { daysSince, isoDaysFrom, today } from "./dates";
import { computeStage } from "./stages";
import { eligibleSteps, scoreStep } from "./suggestions";
import type { History, Message, NextStep, Participant, PracticeLog, StageId } from "./types";

/** Friendly, participant-facing wording. Internal stage names never leave this module. */
const FRIENDLY: Partial<Record<StageId, { name: string; line: string }>> = {
  new: { name: "Just getting started", line: "Every breath you take with awareness is a gift to yourself." },
  building: { name: "Building your practice", line: "A little each day goes a long way. You're doing beautifully." },
  active: { name: "Going deeper", line: "Your practice is growing roots. Enjoy the journey inward." },
  serving: { name: "Serving the community", line: "Thank you for the care you bring to others." },
};
const WELCOME_BACK = { name: null, line: "Welcome back. Your practice is always here for you, whenever you're ready." };

/** Stage as the participant experiences it: a recent coordinator contact doesn't change their own journey. */
export function participantStage(p: Participant, h: History): StageId {
  return computeStage(p, { ...h, contacts: [] }).stage;
}
export function friendlyStage(stage: StageId): { name: string | null; line: string } {
  return FRIENDLY[stage] ?? WELCOME_BACK;
}

export function comingUpFor(p: Participant, h: History, catalog: NextStep[], max = 3, now = today()) {
  const stage = participantStage(p, h);
  return eligibleSteps(p, h, stage, catalog, now)
    .filter((s) => s.type !== "check-in")
    .map((s) => ({ s, score: scoreStep(s, p, h, stage, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.s);
}

export interface Milestone { id: string; label: string; doneOn: string | null; state: "done" | "next" | "later" }
export function milestones(p: Participant, h: History, logs: PracticeLog[] = []): Milestone[] {
  void logs;
  const course = (...names: string[]) => h.courses.filter((c) => names.includes(c.courseName)).map((c) => c.completedOn).sort()[0] ?? null;
  const event = (t: string) => h.events.filter((e) => e.eventType === t).map((e) => e.date).sort()[0] ?? null;
  const raw = [
    { id: "sky", label: "SKY Happiness Program", doneOn: course(JOURNEY_CONFIG.skyCourseName) },
    { id: "followups", label: "Follow-ups", doneOn: event("follow-up") ?? event("online session") },
    { id: "deepen", label: "Sahaj Samadhi / Sri Sri Yoga", doneOn: course("Sahaj Samadhi Meditation", "Sri Sri Yoga") },
    { id: "silence", label: "Art of Silence", doneOn: course("Art of Silence") },
    { id: "seva", label: "Seva", doneOn: event("seva") ?? (p.sevaRole ? "" : null) },
  ];
  let nextGiven = false;
  return raw.map((m) => {
    const done = m.doneOn !== null;
    const state: Milestone["state"] = done ? "done" : nextGiven ? "later" : ((nextGiven = true), "next");
    return { ...m, doneOn: m.doneOn || null, state: done ? "done" : state };
  });
}

/** Last 7 days, oldest first, with whether they practised. */
export function weekDots(logs: PracticeLog[], now = today()) {
  const days = new Set(logs.map((l) => l.date));
  return Array.from({ length: 7 }, (_, i) => { const date = isoDaysFrom(i - 6, now); return { date, done: days.has(date) }; });
}

/** Runs of 3+ consecutive practice days, newest first. */
export function practiceStreaks(logs: PracticeLog[]) {
  const dates = [...new Set(logs.map((l) => l.date))].sort();
  const runs: { end: string; length: number }[] = [];
  let len = 0;
  dates.forEach((d, i) => {
    len = i > 0 && daysSince(dates[i - 1]!, new Date(d + "T00:00:00")) === 1 ? len + 1 : 1;
    const nextIsConsecutive = dates[i + 1] && daysSince(d, new Date(dates[i + 1] + "T00:00:00")) === 1;
    if (!nextIsConsecutive && len >= 3) runs.push({ end: d, length: len });
  });
  return runs.reverse();
}

/** Everything one participant may see — and nothing else. */
export interface MySlice {
  participant: Participant;
  history: Pick<History, "courses" | "events">;
  stage: StageId;
  practice: PracticeLog[];
  messages: Message[];
}
export function mySlice(id: string, all: { participants: Participant[]; history: (id: string) => History; practice: PracticeLog[]; messages: Message[] }): MySlice | null {
  const participant = all.participants.find((p) => p.id === id);
  if (!participant) return null;
  const h = all.history(id);
  return {
    participant,
    history: { courses: h.courses, events: h.events },
    stage: participantStage(participant, h),
    practice: all.practice.filter((l) => l.participantId === id),
    messages: all.messages.filter((m) => m.participantId === id).sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
  };
}
