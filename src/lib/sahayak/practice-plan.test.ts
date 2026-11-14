import { describe, expect, it } from "vitest";
import { completionKey, markDayDone } from "./practice-plan";

describe("weekly day completion", () => {
  it("marks Monday done without marking Tuesday", () => {
    const now = new Date(2026, 10, 14);
    const done = markDayDone([], "Monday", now);
    expect(done).toContain(completionKey("Monday", now));
    expect(done).not.toContain(completionKey("Tuesday", now));
  });
  it("does not duplicate a completed day", () => {
    const now = new Date(2026, 10, 14);
    expect(markDayDone(markDayDone([], "Monday", now), "Monday", now)).toHaveLength(1);
  });
  it("does not carry completion into another week", () => {
    expect(markDayDone([], "Monday", new Date(2026, 10, 14))).not.toContain(completionKey("Monday", new Date(2026, 10, 16)));
  });
});