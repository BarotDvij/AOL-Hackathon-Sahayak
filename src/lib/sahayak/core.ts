import { buildCatalog } from "@/lib/journey/catalog";
import { today } from "@/lib/journey/dates";
import { comingUpFor, friendlyStage, milestones, participantStage, practiceStreaks, weekDots } from "@/lib/journey/participant";
import { buildSampleData } from "@/lib/journey/sample-data";
import { computeStage, explainReasons } from "@/lib/journey/stages";
import { buildSuggestion, eligibleSteps, hasEnoughInfo, pickChannel, scoreStep } from "@/lib/journey/suggestions";
import { canonicalCourseName, PART_1, SAHAJ, type Program } from "@/lib/journey/programs";
import type { History, NextStep, Participant, PracticeLog, StageId } from "@/lib/journey/types";

/** The single entry point for journey rules used by screens, server functions and MCP tools. */
export { computeStage, explainReasons, buildSuggestion, eligibleSteps, hasEnoughInfo, pickChannel, scoreStep, comingUpFor, friendlyStage, milestones, participantStage, practiceStreaks, weekDots };

export const ONBOARDING_INSTRUCTIONS = "Ask one question at a time. Every question is skippable. Keep a warm, unhurried tone. Read the answers back and ask for confirmation before saving.";

export const ONBOARDING_QUESTIONS = [
  { id: "practice_rhythm", text: "How is your home practice feeling right now?", options: [
    { value: "daily", label: "Most days" }, { value: "weekly", label: "A few times a week" }, { value: "occasionally", label: "Occasionally" }, { value: "paused", label: "Not practising right now" },
  ] },
  { id: "practice_days", text: "Which days usually suit you best?", options: [
    { value: "weekdays", label: "Weekdays" }, { value: "weekends", label: "Weekends" }, { value: "both", label: "Both weekdays and weekends" }, { value: "unsure", label: "I'm not sure yet" },
  ] },
  { id: "practice_time", text: "What time of day feels most natural?", options: [
    { value: "morning", label: "Morning" }, { value: "afternoon", label: "Afternoon" }, { value: "evening", label: "Evening" }, { value: "flexible", label: "It changes from day to day" },
  ] },
  { id: "session_minutes", text: "How much time would you like to set aside?", options: [
    { value: "10", label: "10 minutes" }, { value: "20", label: "20 minutes" }, { value: "30", label: "30 minutes" }, { value: "45", label: "45 minutes or more" },
  ] },
  { id: "focus", text: "What would you most like to nurture?", options: [
    { value: "meditation", label: "Meditation" }, { value: "yoga", label: "Yoga" }, { value: "community", label: "Community connection" }, { value: "seva", label: "Seva" },
  ] },
  { id: "support", text: "What kind of support would feel helpful?", options: [
    { value: "reminders", label: "Gentle practice reminders" }, { value: "local", label: "Local follow-up sessions" }, { value: "online", label: "Online sessions" }, { value: "none", label: "No reminders for now" },
  ] },
] as const;

export type OnboardingQuestionId = typeof ONBOARDING_QUESTIONS[number]["id"];
export type OnboardingAnswers = Partial<Record<OnboardingQuestionId, string>>;

/** Drops unknown questions and options instead of allowing arbitrary data into a participant record. */
export function normalizeOnboardingAnswers(input: unknown): OnboardingAnswers {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const raw = input as Record<string, unknown>;
  const clean: OnboardingAnswers = {};
  for (const q of ONBOARDING_QUESTIONS) {
    const value = raw[q.id];
    if (typeof value === "string" && q.options.some((o) => o.value === value)) clean[q.id] = value;
  }
  return clean;
}

export interface ParticipantBundle {
  participant: Participant;
  history: History;
  stage: StageId;
}

/** Sample journey history is shared by the coordinator app, participant app and tools. */
export function participantBundle(participantId: string, now = today()): ParticipantBundle | null {
  const data = buildSampleData(now);
  const participant = data.participants.find((p) => p.id === participantId);
  if (!participant) return null;
  const history: History = {
    courses: data.courses.filter((c) => c.participantId === participantId),
    events: data.events.filter((e) => e.participantId === participantId),
    contacts: data.contacts.filter((c) => c.participantId === participantId),
  };
  return { participant, history, stage: participantStage(participant, history) };
}

export const SAMPLE_PICKER_IDS = ["p05", "p10", "p14", "p19", "p23"] as const;

export function sampleParticipantOptions() {
  return SAMPLE_PICKER_IDS.map((id) => {
    const bundle = participantBundle(id)!;
    return { id, firstName: bundle.participant.firstName, lastName: bundle.participant.lastName, city: bundle.participant.city };
  });
}

export function friendlyStageFor(bundle: ParticipantBundle) {
  const friendly = friendlyStage(bundle.stage);
  return { name: friendly.name ?? "Welcome back", line: friendly.line };
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKENDS = ["Saturday", "Sunday"];

/** A realistic, gentle schedule derived only from saved answers and the shared stage. */
export function recommendedSchedule(answers: OnboardingAnswers, stage: StageId) {
  const rhythm = answers.practice_rhythm ?? (stage === "new" ? "weekly" : "occasionally");
  let days = rhythm === "daily" ? [...WEEKDAYS, ...WEEKENDS] : rhythm === "weekly" ? ["Tuesday", "Thursday", "Saturday"] : ["Saturday"];
  if (answers.practice_days === "weekdays") days = days.filter((d) => WEEKDAYS.includes(d));
  if (answers.practice_days === "weekends") days = days.filter((d) => WEEKENDS.includes(d));
  if (answers.practice_days === "weekdays" && !days.length) days = ["Wednesday"];
  if (answers.practice_days === "weekends" && !days.length) days = ["Saturday"];
  if (!days.length) days = ["Saturday"];

  const time = answers.practice_time === "afternoon" ? "3:00 PM" : answers.practice_time === "evening" ? "7:00 PM" : answers.practice_time === "flexible" ? "Whenever your day allows" : "7:00 AM";
  const requested = Number(answers.session_minutes ?? "20");
  const minutes = stage === "quiet" || stage === "dormant" || answers.practice_rhythm === "paused" ? Math.min(requested, 10) : requested;
  return {
    days,
    time,
    minutes,
    note: answers.support === "none" ? "A suggestion to keep for yourself — no reminders." : "Start gently. You can change this rhythm whenever you like.",
  };
}

export function participantEvents(participantId: string, origin: string, max = 3) {
  const bundle = participantBundle(participantId);
  if (!bundle) return [];
  return comingUpFor(bundle.participant, bundle.history, buildCatalog(), max).map((step) => eventDto(step, origin));
}

export function eventDto(step: NextStep, origin: string) {
  return {
    id: step.id,
    title: step.shortTitle,
    description: step.title,
    startDate: step.startDate ?? null,
    city: step.city,
    online: step.city === "Online",
    link: step.link || null,
    calendarUrl: step.startDate ? new URL(`/api/public/calendar/${encodeURIComponent(step.id)}`, origin).toString() : null,
  };
}

export function practiceDto(rows: { id: string; practiced_on: string; minutes: number | null }[], participantId: string) {
  const logs: PracticeLog[] = rows.map((r) => ({ participantId, date: r.practiced_on, minutes: r.minutes }));
  return {
    entries: rows.map((r) => ({ id: r.id, date: r.practiced_on, minutes: r.minutes })),
    week: weekDots(logs),
    streaks: practiceStreaks(logs),
  };
}
