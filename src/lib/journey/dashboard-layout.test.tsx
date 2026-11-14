import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STAGES } from "./config";
import { daysUntil } from "./dates";
import { buildSampleData } from "./sample-data";
import { JourneyProvider, useJourney } from "./store";

let latest: ReturnType<typeof useJourney> | null = null;
function Probe() { latest = useJourney(); return null; }
function open() {
  render(<JourneyProvider><Probe /></JourneyProvider>);
  return () => latest!;
}

describe("dashboard layout rules", () => {
  it("shows at most five priority people, drifting first and never the paused ones", () => {
    const get = open();
    const p = get().priority;
    expect(p.length).toBeGreaterThan(0);
    expect(p.length).toBeLessThanOrEqual(5);
    expect(p.some((v) => v.stage === "paused")).toBe(false);
    expect(p.every((v) => v.suggestion?.status === "pending")).toBe(true);
    const drift = new Set(["quiet", "dormant"]);
    const stages = p.map((v) => v.stage);
    const firstOther = stages.findIndex((s) => !drift.has(s));
    const lastDrift = stages.map((s) => drift.has(s)).lastIndexOf(true);
    if (firstOther >= 0 && lastDrift >= 0) expect(lastDrift).toBeLessThan(firstOther);
  });

  it("counts every person into exactly one stage, in display order", () => {
    const get = open();
    const counts = get().stageCounts;
    expect(counts.map((c) => c.id)).toEqual(STAGES.map((s) => s.id));
    expect(counts.reduce((n, c) => n + c.count, 0)).toBe(buildSampleData().participants.length);
  });

  it("lists upcoming opportunities soonest first with the right suggestion counts", () => {
    const get = open();
    const u = get().upcoming;
    expect(u.length).toBeGreaterThan(0);
    expect(u.every((o) => o.step.startDate !== undefined && daysUntil(o.step.startDate!) >= 0)).toBe(true);
    const dates = u.map((o) => o.step.startDate!);
    expect(dates).toEqual([...dates].sort());
    const first = u[0]!;
    expect(first.suggestedFor).toBe(get().pending.filter((s) => s.nextStepId === first.step.id).length);
  });

  it("keeps paused people out of the need-follow-up count", () => {
    const get = open();
    expect(get().views.some((v) => v.stage === "paused")).toBe(true);
    expect(get().summary.needFollowUp).toBe(get().views.filter((v) => v.stage !== "paused").length);
    expect(get().summary.waiting).toBe(get().pending.length);
    expect(get().summary.total).toBe(buildSampleData().participants.length);
  });
});
