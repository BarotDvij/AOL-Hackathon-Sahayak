import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildCatalog } from "./catalog";
import { STAGE_PRIORITY } from "./config";
import { daysAgoIso, daysSince } from "./dates";
import { buildSampleData } from "./sample-data";
import { computeStage, explainReasons } from "./stages";
import { JourneyProvider, useJourney } from "./store";
import { buildSuggestion, hasEnoughInfo, LOW_DATA_WHY } from "./suggestions";
import type { History, Participant } from "./types";

const base: Participant = { id: "x", firstName: "Test", lastName: "P", city: "Waterloo", language: "English", email: null, phone: "1", preferredChannel: null, doNotContact: false, sevaRole: null, interests: [] };
const sky = (d: number) => ({ participantId: "x", courseName: "SKY Happiness Program", completedOn: daysAgoIso(d) });
const h = (x: Partial<History>): History => ({ courses: [], events: [], contacts: [], ...x });

let latest: ReturnType<typeof useJourney> | null = null;
function Probe() { latest = useJourney(); return null; }
/** Mounts a fresh in-memory app and hands back a getter for its current state. */
function open() {
  render(<JourneyProvider><Probe /></JourneyProvider>);
  return () => latest!;
}

describe("dashboard and review state", () => {
  it("gives a participant with one course and nothing else a check-in, not a confident pick", () => {
    const hist = h({ courses: [sky(30)] });
    const { stage, reasons } = computeStage(base, hist);
    const s = buildSuggestion(base, hist, stage, explainReasons(reasons), buildCatalog());
    expect(hasEnoughInfo(hist)).toBe(false);
    expect(s?.lowData).toBe(true);
    expect(s?.why).toBe(LOW_DATA_WHY);
    expect(buildCatalog().get(s!.nextStepId)?.type).toBe("check-in");
  });

  it("recommends with confidence once there is a second course on record", () => {
    const hist = h({ courses: [sky(30), sky(12)] });
    const { stage, reasons } = computeStage(base, hist);
    const s = buildSuggestion(base, hist, stage, explainReasons(reasons), buildCatalog());
    expect(hasEnoughInfo(hist)).toBe(true);
    expect(s?.lowData).toBe(false);
    expect(s?.why).not.toBe(LOW_DATA_WHY);
  });

  it("lists people going quiet before anyone else and never lists paused people", () => {
    const get = open();
    const stages = get().needsFollowUp.map((v) => v.stage);
    expect(stages).toContain("quiet");
    expect(stages).not.toContain("paused");
    expect(stages).toEqual([...stages].sort((a, b) => STAGE_PRIORITY.indexOf(a) - STAGE_PRIORITY.indexOf(b)));
    expect(get().needsFollowUp.every((v) => v.suggestion?.status === "pending")).toBe(true);
  });

  it("counts people, drafts waiting and messages out this week", () => {
    const get = open();
    const d = buildSampleData();
    expect(get().summary.total).toBe(d.participants.length);
    expect(get().summary.waiting).toBe(get().pending.length);
    expect(get().summary.sentThisWeek).toBe(d.contacts.filter((c) => c.direction === "out" && daysSince(c.date) < 7).length);
  });

  it("saves the reason when a draft is skipped", () => {
    const get = open();
    const target = get().pending[0]!;
    act(() => get().skip(target.id, "Not the right time"));
    expect(get().activity[0]?.kind).toBe("skipped");
    expect(get().activity[0]?.detail).toContain("Not the right time");
    expect(get().pending.some((s) => s.id === target.id)).toBe(false);
  });

  it("puts an approved message in that person's own messages and counts it as sent", () => {
    const get = open();
    const target = get().pending[0]!;
    const before = get().summary.sentThisWeek;
    act(() => get().setMeId(target.participantId));
    act(() => get().approve(target.id, "Hello there"));
    const after = get();
    expect(after.summary.sentThisWeek).toBe(before + 1);
    expect(after.me?.messages.some((m) => m.text === "Hello there")).toBe(true);
    expect(after.me?.messages.every((m) => m.participantId === target.participantId)).toBe(true);
  });
});
