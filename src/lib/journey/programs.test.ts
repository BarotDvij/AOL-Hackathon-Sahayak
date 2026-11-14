import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog";
import { daysAgoIso } from "./dates";
import { ageEligible, PART_1, PART_2, prerequisitesMet, SAHAJ, timingMet, type Program, type ProgramPrerequisite } from "./programs";
import { recommendedSchedule } from "@/lib/sahayak/core";
import { scoreStep } from "./suggestions";
import type { History, Participant } from "./types";

const base: Participant = { id: "x", firstName: "Test", lastName: "P", age: 30, city: "Waterloo", language: "English", email: null, phone: "1", preferredChannel: null, doNotContact: false, sevaRole: null, interests: [] };
const makeProgram = (id: string, name: string, overrides: Partial<Program> = {}): Program => ({
  id, name, level: "entry", prerequisite_text: "None", ages: "18+", format: "Live course", where_offered_na: "Local centres",
  online_option: "yes", main_practices: "Practice names", home_practice: "Daily practice", suggested_timing: "Any time",
  journey_milestone: "SKY", unlocks_next_text: "—", varies_by_country: "no", source_url: null, needs_local_check: false, min_age: 18,
  ...overrides,
});
const part1 = makeProgram("1", PART_1);
const part2 = makeProgram("2", PART_2, { level: "graduate", suggested_timing: "Month 3+; then about twice a year", home_practice: "Keep SKY daily" });
const sahaj = makeProgram("3", SAHAJ, { suggested_timing: "Around month 3–6", home_practice: "20 min, twice a day" });
const course = (name: string, days: number) => ({ participantId: "x", courseName: name, completedOn: daysAgoIso(days) });
const history = (courses: History["courses"]): History => ({ courses, events: [], contacts: [] });
const byId = new Map([part1, part2, sahaj].map((program) => [program.id, program]));
const link = (program: Program, required: Program, min_count = 1, notes: string | null = null): ProgramPrerequisite => ({ program_id: program.id, requires_program_id: required.id, min_count, notes });

describe("database-driven program rules", () => {
  it("never offers youth programs to adults or adult programs to under-18s", () => {
    const kids = makeProgram("4", "SKY Kids", { level: "youth", ages: "8–12", min_age: 8 });
    expect(ageEligible(base, kids)).toBe(false);
    expect(ageEligible({ ...base, age: 17 }, part1)).toBe(false);
    expect(ageEligible({ ...base, age: 10 }, kids)).toBe(true);
    expect(ageEligible({ ...base, age: 13 }, kids)).toBe(false);
  });

  it("accepts either alternative for Sri Sri Yoga Deep Dive", () => {
    const foundation = makeProgram("4", "Sri Sri Yoga Foundation");
    const deep = makeProgram("5", "Sri Sri Yoga Deep Dive", { level: "graduate" });
    const note = "Alternative prerequisite: Sri Sri Yoga Foundation or Art of Living Part 1.";
    const links = [link(deep, foundation, 1, note), link(deep, part1, 1, note)];
    const programs = new Map(byId).set(foundation.id, foundation);
    expect(prerequisitesMet(history([course(PART_1, 200)]), links, programs)).toBe(true);
    expect(prerequisitesMet(history([course(foundation.name, 200)]), links, programs)).toBe(true);
    expect(prerequisitesMet(history([]), links, programs)).toBe(false);
  });

  it("requires every prerequisite and honors min_count 2", () => {
    const blessings = makeProgram("4", "Blessings Program", { level: "advanced" });
    const links = [link(blessings, part1), link(blessings, part2, 2)];
    expect(prerequisitesMet(history([course(PART_1, 700), course(PART_2, 100)]), links, byId)).toBe(false);
    expect(prerequisitesMet(history([course(PART_1, 700), course(PART_2, 100), course(PART_2, 200)]), links, byId)).toBe(true);
  });

  it("holds Part 2 until three months after Part 1", () => {
    expect(timingMet(history([course(PART_1, 89)]), part2)).toBe(false);
    expect(timingMet(history([course(PART_1, 90)]), part2)).toBe(true);
    expect(timingMet(history([course(PART_1, 89)]), sahaj)).toBe(false);
  });

  it("ranks online yes above no when the participant prefers online", () => {
    const online = makeProgram("4", "Online course", { online_option: "yes" });
    const inPerson = makeProgram("5", "In-person course", { online_option: "no" });
    const steps = buildCatalog([online, inPerson]);
    const h = history([course(PART_1, 100)]);
    const p = { ...base, prefersOnline: true };
    expect(scoreStep(steps[0]!, p, h, "building")).toBeGreaterThan(scoreStep(steps[1]!, p, h, "building"));
  });

  it("does not retain any placeholder course when the database catalog is empty", () => {
    expect(buildCatalog().some((step) => step.program || step.type === "course" || step.type === "retreat")).toBe(false);
  });

  it("uses the requested Part 1 and Sahaj default reminders", () => {
    const schedule = recommendedSchedule({}, "building", history([course(PART_1, 200), course(SAHAJ, 30)]), [part1, part2, sahaj]);
    expect(schedule.reminders).toEqual(["SKY once a day", "One weekly group follow-up", "Sahaj Samadhi for 20 minutes, twice a day"]);
  });

  it("uses exact home_practice text for the latest other completed program", () => {
    const schedule = recommendedSchedule({}, "active", history([course(PART_1, 200), course(PART_2, 30)]), [part1, part2, sahaj]);
    expect(schedule.reminders.at(-1)).toBe("Keep SKY daily");
  });
});
