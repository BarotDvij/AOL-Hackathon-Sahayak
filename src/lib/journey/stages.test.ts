import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog";
import { buildSampleData } from "./sample-data";
import { computeStage, explainReasons } from "./stages";
import { buildSuggestion } from "./suggestions";
import type { History, Participant } from "./types";
import { daysAgoIso } from "./dates";

const base: Participant = { id: "x", firstName: "Test", lastName: "P", age: 30, city: "Waterloo", language: "English", email: null, phone: "1", preferredChannel: null, doNotContact: false, sevaRole: null, interests: [] };
const sky = (d: number) => ({ participantId: "x", courseName: "SKY Happiness Program", completedOn: daysAgoIso(d) });
const fu = (d: number) => ({ participantId: "x", eventType: "follow-up" as const, date: daysAgoIso(d), city: "Waterloo", online: false });
const h = (x: Partial<History>): History => ({ courses: [], events: [], contacts: [], ...x });

describe("journey stages", () => {
  it("do-not-contact is paused even if SKY was recent", () => {
    expect(computeStage({ ...base, doNotContact: true }, h({ courses: [sky(5)] })).stage).toBe("paused");
  });
  it("contact 13 days ago is paused, 14 days is not", () => {
    const k = (d: number) => [{ participantId: "x", channel: "sms" as const, direction: "out" as const, date: daysAgoIso(d), outcome: "no reply" as const }];
    expect(computeStage(base, h({ courses: [sky(20)], contacts: k(13) })).stage).toBe("paused");
    expect(computeStage(base, h({ courses: [sky(20)], contacts: k(14) })).stage).toBe("new");
  });
  it("SKY 45 days ago is new; 46 days with a follow-up is building", () => {
    expect(computeStage(base, h({ courses: [sky(45)] })).stage).toBe("new");
    expect(computeStage(base, h({ courses: [sky(46)], events: [fu(40)] })).stage).toBe("building");
  });
  it("2 events in 60 days is actively engaged", () => {
    expect(computeStage(base, h({ courses: [sky(300)], events: [fu(50), fu(10)] })).stage).toBe("active");
  });
  it("last event 74 days ago is going quiet with a data-based why", () => {
    const r = computeStage(base, h({ courses: [sky(300)], events: [fu(100), fu(74)] }));
    expect(r.stage).toBe("quiet");
    expect(explainReasons(r.reasons)).toBe("Attended 2 follow-ups before, none in the last 74 days.");
  });
  it("no event in 180+ days is dormant", () => {
    expect(computeStage(base, h({ courses: [sky(400)], events: [fu(200)] })).stage).toBe("dormant");
  });
  it("sample data has 3–5 people in every stage and paused people get no suggestion", () => {
    const d = buildSampleData();
    const counts: Record<string, number> = {};
    for (const p of d.participants) {
      const hist = h({ courses: d.courses.filter((c) => c.participantId === p.id), events: d.events.filter((e) => e.participantId === p.id), contacts: d.contacts.filter((c) => c.participantId === p.id) });
      const { stage, reasons } = computeStage(p, hist);
      counts[stage] = (counts[stage] ?? 0) + 1;
      const s = buildSuggestion(p, hist, stage, explainReasons(reasons), buildCatalog());
      if (stage === "paused") expect(s).toBeNull(); else expect(s, p.firstName).not.toBeNull();
    }
    for (const st of ["paused", "new", "building", "active", "serving", "quiet", "dormant"]) {
      expect(counts[st], st).toBeGreaterThanOrEqual(3);
      expect(counts[st], st).toBeLessThanOrEqual(5);
    }
  });
});
