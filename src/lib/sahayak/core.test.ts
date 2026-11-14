import { describe, expect, it } from "vitest";
import { friendlyStageFor, normalizeOnboardingAnswers, ONBOARDING_INSTRUCTIONS, ONBOARDING_QUESTIONS, participantBundle, participantEvents, recommendedSchedule, journeyPosition, weeklyPlan } from "./core";

describe("shared Sahayak core", () => {
  it("asks course level, practice adherence and month/quarter/year goals", () => {
    expect(ONBOARDING_QUESTIONS.map((q) => q.id)).toEqual(["location", "course_level", "practice_following", "practice_time", "join_format", "goal_month", "goal_quarter", "goal_year"]);
    expect(ONBOARDING_INSTRUCTIONS).toContain("one question at a time");
    expect(ONBOARDING_INSTRUCTIONS).toContain("skippable");
    expect(ONBOARDING_INSTRUCTIONS).toContain("confirmation before saving");
  });

  it("accepts only declared choices but lets goals be the person's own words", () => {
    expect(normalizeOnboardingAnswers({ course_level: "sahaj", practice_time: "invented", goal_year: "  Teach a yoga class  ", unknown: "x" })).toEqual({ course_level: "sahaj", goal_year: "Teach a yoga class" });
  });

  it("keeps a trimmed, editable city answer", () => {
    expect(normalizeOnboardingAnswers({ location: "  Montréal, Québec, Canada  " })).toEqual({ location: "Montréal, Québec, Canada" });
  });

  it("places the person on the ladder and points the goal at their next course", () => {
    const pos = journeyPosition({ course_level: "part1", goal_quarter: "next_course" }, "none");
    expect(pos.steps.map((s) => s.state)).toEqual(["done", "here", "goal", "later", "later"]);
  });

  it("plans Sahaj twice daily every day when practice is kept fully, plus a weekly follow-up", () => {
    const plan = weeklyPlan({ course_level: "sahaj", practice_following: "fully" }, "active", "none");
    expect(plan.every((d) => d.items.some((i) => i.text.includes("Sahaj Samadhi (20 min), second sitting")))).toBe(true);
    expect(plan.filter((d) => d.items.some((i) => i.text.startsWith("Weekly group follow-up")))).toHaveLength(1);
  });

  it("starts with three practice days when not practising right now", () => {
    const plan = weeklyPlan({ course_level: "part1", practice_following: "not_now" }, "quiet", "none");
    expect(plan.filter((d) => d.items.some((i) => i.kind === "practice"))).toHaveLength(3);
  });

  it("uses a friendly welcome-back label for quiet and dormant participants", () => {
    for (const id of ["p23", "p28"]) {
      const bundle = participantBundle(id)!;
      expect(["quiet", "dormant"]).toContain(bundle.stage);
      expect(friendlyStageFor(bundle).name).toBe("Welcome back");
      expect(JSON.stringify(friendlyStageFor(bundle))).not.toMatch(/quiet|dormant|NO_EVENT|DORMANT/);
    }
  });

  it("suggests ten gentle minutes for someone returning after a gap", () => {
    const bundle = participantBundle("p23")!;
    const schedule = recommendedSchedule({ practice_time: "evening" }, bundle.stage);
    expect(schedule.minutes).toBe(10);
    expect(schedule.time).toBe("7:00 PM");
    expect(schedule.days).toEqual(["Saturday"]);
  });

  it("keeps upcoming events participant-specific and includes an .ics URL", () => {
    const events = participantEvents("p05", "https://example.test", 20);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.city === "Online" || e.city === "Waterloo")).toBe(true);
    expect(events[0]?.calendarUrl).toMatch(/^https:\/\/example\.test\/api\/public\/calendar\/.+\.ics$|\/api\/public\/calendar\//);
  });
});
