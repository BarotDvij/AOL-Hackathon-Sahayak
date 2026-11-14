import { describe, expect, it } from "vitest";
import { completionKey, markActivityDone } from "./practice-plan";
const item = { kind: "practice" as const, text: "SKY, morning" };
describe("weekly completion", () => {
  it("marks only the completed day and activity", () => {
    const now = new Date(2026, 10, 14);
    const done = markActivityDone([], "Monday", item, now);
    expect(done).toContain(completionKey("Monday", item, now));
    expect(done).not.toContain(completionKey("Tuesday", item, now));
    expect(done).not.toContain(completionKey("Monday", { ...item, text: "Second sitting" }, now));
  });
  it("does not duplicate a completion", () => {
    const now = new Date(2026, 10, 14);
    expect(markActivityDone(markActivityDone([], "Monday", item, now), "Monday", item, now)).toHaveLength(1);
  });
  it("does not carry completion into another week", () => {
    expect(markActivityDone([], "Monday", item, new Date(2026, 10, 14))).not.toContain(completionKey("Monday", item, new Date(2026, 10, 16)));
  });
});