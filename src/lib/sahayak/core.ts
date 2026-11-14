import { buildCatalog } from "@/lib/journey/catalog";
import { today } from "@/lib/journey/dates";
import { comingUpFor, friendlyStage, milestones, participantStage, practiceStreaks, weekDots } from "@/lib/journey/participant";
import { buildSampleData } from "@/lib/journey/sample-data";
import { computeStage, explainReasons } from "@/lib/journey/stages";
import { buildSuggestion, eligibleSteps, hasEnoughInfo, pickChannel, scoreStep } from "@/lib/journey/suggestions";
import { canonicalCourseName, PART_1, PART_2, SAHAJ, type Program } from "@/lib/journey/programs";
import type { History, NextStep, Participant, PracticeLog, StageId } from "@/lib/journey/types";

/** The single entry point for journey rules used by screens, server functions and MCP tools. */
export { computeStage, explainReasons, buildSuggestion, eligibleSteps, hasEnoughInfo, pickChannel, scoreStep, comingUpFor, friendlyStage, milestones, participantStage, practiceStreaks, weekDots };

export * from "./intake";
import { prefersOnline, type CourseLevel, type OnboardingAnswers } from "./intake";

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

/** Catalog-based reminders only; never instructions for performing a technique. */
export function practiceReminders(history: Pick<History, "courses"> | undefined, programs: Program[]) {
  if (!history) return [] as string[];
  const completed = new Set(history.courses.map((course) => canonicalCourseName(course.courseName)));
  const reminders: string[] = [];
  if (completed.has(PART_1)) reminders.push("SKY once a day", "One weekly group follow-up");
  if (completed.has(SAHAJ)) reminders.push("Sahaj Samadhi for 20 minutes, twice a day");
  const latestOther = [...history.courses]
    .sort((a, b) => b.completedOn.localeCompare(a.completedOn))
    .map((course) => programs.find((program) => program.name === canonicalCourseName(course.courseName)))
    .find((program) => program && program.name !== PART_1 && program.name !== SAHAJ && program.home_practice !== "Not stated");
  if (latestOther) reminders.push(latestOther.home_practice);
  return reminders;
}

/** A realistic, gentle schedule derived only from saved answers and the shared stage. */
export function recommendedSchedule(answers: OnboardingAnswers, stage: StageId, history?: Pick<History, "courses">, programs: Program[] = []) {
  const following = answers.practice_following;
  const rhythm = following === "fully" || following === "mostly" ? "daily" : following === "sometimes" ? "weekly" : following === "not_now" ? "paused" : stage === "new" ? "weekly" : "occasionally";
  let days = rhythm === "daily" ? [...WEEKDAYS, ...WEEKENDS] : rhythm === "weekly" ? ["Tuesday", "Thursday", "Saturday"] : ["Saturday"];
  if (!days.length) days = ["Saturday"];

  const time = answers.practice_time === "afternoon" ? "3:00 PM" : answers.practice_time === "evening" ? "7:00 PM" : answers.practice_time === "flexible" ? "Whenever your day allows" : "7:00 AM";
  const requested = 20;
  const minutes = stage === "quiet" || stage === "dormant" || rhythm === "paused" ? Math.min(requested, 10) : requested;
  return {
    days,
    time,
    minutes,
    reminders: practiceReminders(history, programs),
    safetyNote: "Reminders and encouragement only. Techniques are taught by certified teachers.",
    note: "Start gently. You can change this rhythm whenever you like.",
  };
}

export function participantEvents(participantId: string, origin: string, max = 3, catalog = buildCatalog(), options: { prefersOnline?: boolean } = {}) {
  const bundle = participantBundle(participantId);
  if (!bundle) return [];
  return comingUpFor(bundle.participant, bundle.history, catalog, max, today(), options).map((step) => eventDto(step, origin));
}

export function eventDto(step: NextStep, origin: string) {
  const online = step.program ? step.program.online_option === "yes" || step.program.online_option === "some_regions" : step.city === "Online";
  return {
    id: step.id,
    title: step.shortTitle,
    description: step.title,
    startDate: step.startDate ?? null,
    suggestedTiming: step.program?.suggested_timing ?? null,
    needsLocalCheck: step.program?.needs_local_check ?? false,
    level: step.program?.level ?? null,
    city: step.program ? (online ? "Online availability" : "Local centre") : step.city,
    online,
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

/** Best guess of course level from records, used when the person skips that question. */
export function levelFromHistory(history: Pick<History, "courses"> | undefined): CourseLevel {
  const done = new Set((history?.courses ?? []).map((c) => canonicalCourseName(c.courseName)));
  if ([...done].some((n) => /Dive Deep|Sanyam|Blessings|Intensive|Shakti|DSN/i.test(n))) return "advanced";
  if (done.has(PART_2)) return "part2";
  if (done.has(SAHAJ)) return "sahaj";
  if (done.has(PART_1)) return "part1";
  return "none";
}
