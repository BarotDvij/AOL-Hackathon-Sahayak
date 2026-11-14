import { describe, expect, it } from "vitest";
import { friendlyStageFor, normalizeOnboardingAnswers, ONBOARDING_INSTRUCTIONS, ONBOARDING_QUESTIONS, participantBundle, participantEvents, recommendedSchedule } from "./core";

describe("shared Sahayak core", () => {
  it("provides exactly six skippable onboarding questions with fixed options", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(6);
    expect(ONBOARDING_QUESTIONS.map((q) => q.id)).toEqual(["practice_rhythm", "practice_days", "practice_time", "session_minutes", "focus", "support"]);
    for (const question of ONBOARDING_QUESTIONS) expect(question.options.length).toBeGreaterThanOrEqual(4);
    expect(ONBOARDING_INSTRUCTIONS).toContain("one question at a time");
    expect(ONBOARDING_INSTRUCTIONS).toContain("skippable");
    expect(ONBOARDING_INSTRUCTIONS).toContain("confirmation before saving");
  });

  it("accepts only declared answers and drops unknown or invalid values", () => {
    expect(normalizeOnboardingAnswers({ practice_time: "evening", session_minutes: "20", focus: "invented", unknown: "daily" })).toEqual({ practice_time: "evening", session_minutes: "20" });
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
    const schedule = recommendedSchedule({ session_minutes: "45", practice_time: "evening", practice_days: "weekends" }, bundle.stage);
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
