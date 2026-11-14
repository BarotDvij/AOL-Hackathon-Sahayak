import type { StageId } from "@/lib/journey/types";

/** The intake: where someone is on the course path, whether they keep that course's home practice, and their goals. */
export const ONBOARDING_INSTRUCTIONS = "Ask one question at a time. Every question is skippable. Keep a warm, unhurried tone. Goal questions accept a quick pick or the person's own words. Read the answers back and ask for confirmation before saving.";

export const JOURNEY_LADDER = [
  { value: "none", label: "I haven't taken a course yet", milestone: "Getting started", practice: "No set practice yet — a free intro session or the Art of Living Part 1 is a gentle first step." },
  { value: "part1", label: "Art of Living Part 1 (SKY / Happiness Program)", milestone: "Art of Living Part 1", practice: "SKY once a day, plus one weekly group follow-up." },
  { value: "sahaj", label: "Sahaj Samadhi Meditation", milestone: "Sahaj Samadhi Meditation", practice: "SKY once a day, Sahaj Samadhi for 20 minutes twice a day, and a weekly group follow-up." },
  { value: "part2", label: "Art of Living Part 2 (Art of Silence)", milestone: "Art of Living Part 2", practice: "Daily SKY and Sahaj Samadhi, weekly follow-up, and keeping a little silence from the course in your week." },
  { value: "advanced", label: "Advanced programs (Dive Deep, Sanyam, Blessings…)", milestone: "Advanced programs", practice: "Your full daily practice, weekly satsang or follow-up, and regular seva." },
] as const;
export type CourseLevel = typeof JOURNEY_LADDER[number]["value"];

const GOAL_OPTIONS = [
  { value: "regular_practice", label: "Practise regularly" },
  { value: "next_course", label: "Take my next course" },
  { value: "community", label: "Join group sessions or satsang" },
  { value: "seva", label: "Start or grow my seva" },
] as const;

export const ONBOARDING_QUESTIONS = [
  { id: "course_level", kind: "choice", text: "Which is the furthest Art of Living course you've completed?", options: JOURNEY_LADDER.map(({ value, label }) => ({ value, label })) },
  { id: "practice_following", kind: "choice", text: "How closely are you keeping the home practice for that course?", options: [
    { value: "fully", label: "Fully — every day" }, { value: "mostly", label: "Most days" }, { value: "sometimes", label: "Now and then" }, { value: "not_now", label: "Not practising right now" },
  ] },
  { id: "practice_time", kind: "choice", text: "What time of day suits your practice?", options: [
    { value: "morning", label: "Morning" }, { value: "afternoon", label: "Afternoon" }, { value: "evening", label: "Evening" }, { value: "flexible", label: "It changes day to day" },
  ] },
  { id: "join_format", kind: "choice", text: "How do you like to join group sessions?", options: [
    { value: "in_person", label: "In person" }, { value: "online", label: "Online" }, { value: "either", label: "Either is fine" },
  ] },
  { id: "goal_month", kind: "goal", text: "What would you like to achieve this month?", options: GOAL_OPTIONS },
  { id: "goal_quarter", kind: "goal", text: "And over the next three months?", options: GOAL_OPTIONS },
  { id: "goal_year", kind: "goal", text: "Where would you like to be a year from now?", options: GOAL_OPTIONS },
] as const;

export type OnboardingQuestionId = typeof ONBOARDING_QUESTIONS[number]["id"];
export type OnboardingAnswers = Partial<Record<OnboardingQuestionId, string>>;
export type GoalPeriod = "month" | "quarter" | "year";
export const GOAL_QUESTION: Record<GoalPeriod, OnboardingQuestionId> = { month: "goal_month", quarter: "goal_quarter", year: "goal_year" };

/** Choice answers must match a declared option; goal answers may also be the person's own words (max 200 chars). */
export function normalizeOnboardingAnswers(input: unknown): OnboardingAnswers {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const raw = input as Record<string, unknown>;
  const clean: OnboardingAnswers = {};
  for (const q of ONBOARDING_QUESTIONS) {
    const value = raw[q.id];
    if (typeof value !== "string") continue;
    if (q.options.some((o) => o.value === value)) clean[q.id] = value;
    else if (q.kind === "goal" && value.trim()) clean[q.id] = value.trim().slice(0, 200);
  }
  return clean;
}

export function answerLabel(id: OnboardingQuestionId, value: string | undefined) {
  if (!value) return undefined;
  const q = ONBOARDING_QUESTIONS.find((item) => item.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}

export const prefersOnline = (answers: OnboardingAnswers) => answers.join_format === "online";

export function levelIndex(level: string | undefined) {
  const i = JOURNEY_LADDER.findIndex((step) => step.value === level);
  return i < 0 ? 0 : i;
}

/** Where they are and where their goals point on the course ladder. */
export function journeyPosition(answers: OnboardingAnswers, fallbackLevel: CourseLevel) {
  const current = answers.course_level ? levelIndex(answers.course_level) : levelIndex(fallbackLevel);
  const wantsCourse = (["goal_month", "goal_quarter", "goal_year"] as const).some((id) => answers[id] === "next_course");
  const target = Math.min(current + (answers.goal_year === "next_course" && current + 2 < JOURNEY_LADDER.length ? 2 : wantsCourse ? 1 : 0), JOURNEY_LADDER.length - 1);
  return { current, target, steps: JOURNEY_LADDER.map((step, index) => ({ ...step, state: index < current ? "done" : index === current ? "here" : index <= target ? "goal" : "later" as "done" | "here" | "goal" | "later" })) };
}

export interface PlanItem { kind: "practice" | "group" | "goal" | "rest"; text: string }
export interface PlanDay { day: string; items: PlanItem[] }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** A gentle week built from the course guideline, how closely they follow it, and their goals. Reminders only — never technique instructions. */
export function weeklyPlan(answers: OnboardingAnswers, stage: StageId, fallbackLevel: CourseLevel): PlanDay[] {
  const level = JOURNEY_LADDER[journeyPosition(answers, fallbackLevel).current].value;
  const following = answers.practice_following ?? (stage === "quiet" || stage === "dormant" ? "not_now" : "sometimes");
  const practiceDays = following === "fully" || following === "mostly" ? 7 : following === "sometimes" ? 5 : 3;
  const activeDays = practiceDays === 7 ? DAYS : practiceDays === 5 ? ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"] : ["Monday", "Wednesday", "Saturday"];
  const when = answers.practice_time === "afternoon" ? "afternoon" : answers.practice_time === "evening" ? "evening" : answers.practice_time === "flexible" ? "whenever suits" : "morning";
  const groupDay = "Wednesday";
  const online = answers.join_format === "online" ? " (online)" : "";
  const goals = [answers.goal_month, answers.goal_quarter, answers.goal_year];

  return DAYS.map((day) => {
    const items: PlanItem[] = [];
    if (activeDays.includes(day)) {
      if (level === "none") items.push({ kind: "practice", text: `A few quiet minutes, ${when}` });
      else if (level === "part1") items.push({ kind: "practice", text: `SKY, ${when}` });
      else items.push({ kind: "practice", text: `SKY and Sahaj Samadhi (20 min), ${when}` }, { kind: "practice", text: "Sahaj Samadhi (20 min), second sitting" });
    }
    if (day === groupDay && level !== "none") items.push({ kind: "group", text: `Weekly group follow-up${online}` });
    if (day === "Sunday" && (goals.includes("community") || level === "advanced")) items.push({ kind: "group", text: `Satsang${online}` });
    if (day === "Saturday" && goals.includes("seva")) items.push({ kind: "goal", text: "An hour of seva" });
    if (day === "Thursday" && goals.includes("next_course")) items.push({ kind: "goal", text: "Look at upcoming dates for your next course" });
    if (day === "Sunday") items.push({ kind: "goal", text: "Look back on the week and log your practice" });
    if (!items.length) items.push({ kind: "rest", text: "Rest day — a few deep breaths is plenty" });
    return { day, items };
  });
}
