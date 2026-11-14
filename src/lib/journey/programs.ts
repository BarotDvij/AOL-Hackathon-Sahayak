import { daysSince, today } from "./dates";
import type { History, Participant, StageId } from "./types";

export type ProgramLevel = "entry" | "youth" | "graduate" | "advanced";
export type OnlineOption = "yes" | "some_regions" | "no" | "unconfirmed";
export type CountryVariation = "no" | "somewhat" | "yes" | "unconfirmed";

/** Exact catalog text is retained; recommendation rules add structure separately. */
export interface Program {
  id: string;
  name: string;
  level: ProgramLevel;
  prerequisite_text: string;
  ages: string;
  format: string;
  where_offered_na: string;
  online_option: OnlineOption;
  main_practices: string;
  home_practice: string;
  suggested_timing: string;
  journey_milestone: string;
  unlocks_next_text: string;
  varies_by_country: CountryVariation;
  source_url: string | null;
  needs_local_check: boolean;
  min_age: number;
}

export interface ProgramPrerequisite {
  program_id: string;
  requires_program_id: string;
  min_count: number;
  notes: string | null;
}

export interface ProgramCatalog {
  programs: Program[];
  prerequisites: ProgramPrerequisite[];
}

export const EMPTY_PROGRAM_CATALOG: ProgramCatalog = { programs: [], prerequisites: [] };

export const PART_1 = "Art of Living Part 1";
export const PART_2 = "Art of Living Part 2 (Art of Silence)";
export const SAHAJ = "Sahaj Samadhi Meditation";

const COURSE_ALIASES: Record<string, string> = {
  "Art of Living Part 1": PART_1,
  "SKY Happiness Program": PART_1,
  "Happiness Program": PART_1,
  "SKY Breath Meditation": PART_1,
  "YES+": PART_1,
  "Art of Living Part 2 (Art of Silence)": PART_2,
  "Art of Silence": PART_2,
  "Sahaj Samadhi Meditation": SAHAJ,
  "Sahaj Samadhi": SAHAJ,
  "Sri Sri Yoga Foundation": "Sri Sri Yoga Foundation",
  "Sri Sri Yoga": "Sri Sri Yoga Foundation",
};

export function canonicalCourseName(name: string) {
  return COURSE_ALIASES[name] ?? name;
}

export function completedCourseCount(history: Pick<History, "courses">, programName: string) {
  return history.courses.filter((course) => canonicalCourseName(course.courseName) === programName).length;
}

export function prerequisitesMet(history: Pick<History, "courses">, links: ProgramPrerequisite[], programsById: Map<string, Program>) {
  if (!links.length) return true;
  const count = (link: ProgramPrerequisite) => {
    const required = programsById.get(link.requires_program_id);
    return required ? completedCourseCount(history, required.name) >= link.min_count : false;
  };
  // The two Deep Dive rows are explicitly alternatives; other multiple rows are cumulative.
  if (links.every((link) => link.notes?.startsWith("Alternative prerequisite:"))) return links.some(count);
  return links.every(count);
}

/** Month 3+, Around month 3–6 and After year 1 all delay a suggestion from Part 1. */
export function minimumMonthsAfterPart1(program: Program) {
  const timing = program.suggested_timing.toLowerCase();
  const month = timing.match(/month\s+(\d+)/);
  if (month) return Number(month[1]);
  if (/after year\s+1/.test(timing)) return 12;
  return 0;
}

export function timingMet(history: Pick<History, "courses">, program: Program, now = today()) {
  const months = minimumMonthsAfterPart1(program);
  if (!months) return true;
  const latestPart1 = history.courses
    .filter((course) => canonicalCourseName(course.courseName) === PART_1)
    .map((course) => course.completedOn)
    .sort()
    .at(-1);
  return !!latestPart1 && daysSince(latestPart1, now) >= months * 30;
}

export function ageEligible(participant: Participant, program: Program) {
  if (participant.age < program.min_age) return false;
  if (program.level === "youth") {
    if (participant.age >= 18) return false;
    const ages = program.ages.match(/\d+/g)?.map(Number) ?? [];
    return !ages.length || participant.age <= Math.max(...ages);
  }
  return participant.age >= 18;
}

export function programStageFit(program: Program): StageId[] {
  if (program.level === "youth") return ["new", "building", "active", "serving", "quiet", "dormant"];
  if (program.level === "entry") return ["new", "building", "active", "serving"];
  return ["building", "active", "serving"];
}

export function programEligible(
  participant: Participant,
  history: History,
  stage: StageId,
  program: Program,
  links: ProgramPrerequisite[],
  programsById: Map<string, Program>,
  now = today(),
) {
  if (!programStageFit(program).includes(stage) || !ageEligible(participant, program)) return false;
  if (completedCourseCount(history, program.name) > 0) return false;
  if (!prerequisitesMet(history, links, programsById) || !timingMet(history, program, now)) return false;
  if (program.name === "DSN (Do Something Now)") {
    const regularPractice = history.events.some((event) =>
      (event.eventType === "follow-up" || event.eventType === "online session") && daysSince(event.date, now) <= 60);
    if (!regularPractice) return false;
  }
  return true;
}
