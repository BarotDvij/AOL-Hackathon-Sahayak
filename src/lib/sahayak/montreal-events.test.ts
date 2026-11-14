import { describe, expect, it } from "vitest";
import { isMontreal, montrealEvents } from "./montreal-events";
import { participantEvents } from "./core";

describe("official Montréal calendar snapshot", () => {
  it("recognizes Montréal and Montreal, but not other cities", () => {
    expect(isMontreal("Montréal, Québec, Canada")).toBe(true);
    expect(isMontreal("Montreal")).toBe(true);
    expect(isMontreal("Waterloo")).toBe(false);
  });
  it("uses only the published follow-up dates and correct Montréal times", () => {
    const rows = montrealEvents(true, "2026-11-14");
    expect(rows.filter((e) => e.startDate).map((e) => e.startDate)).toEqual(["2026-11-18", "2026-11-25", "2026-12-02"]);
    const ics = decodeURIComponent(rows[0]?.calendarUrl?.split(",")[1] ?? "");
    expect(ics).toContain("DTSTART:20261118T233000Z");
    expect(ics).toContain("DTEND:20261119T003000Z");
    expect(rows[0]?.link).toBe("https://www.artofliving.org/ca-en/program/10344");
  });
  it("hides graduate-only follow-ups for beginners", () => {
    expect(montrealEvents(false, "2026-11-14").map((e) => e.id)).toEqual(["montreal-puja-meditation"]);
    expect(participantEvents("p05", "https://example.test", 20, [], { location: "Montréal", courseLevel: "none" }).some((e) => e.id.startsWith("montreal-sky"))).toBe(false);
  });
  it("expires dated listings instead of inventing new occurrences", () => {
    expect(montrealEvents(true, "2026-12-03").filter((e) => e.startDate)).toEqual([]);
  });
  it("replaces Waterloo demo events when the saved location is Montréal", () => {
    const rows = participantEvents("p05", "https://example.test", 20, [], { location: "Montreal", courseLevel: "part1" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((e) => e.city === "Montréal · Saint-Laurent")).toBe(true);
  });
});