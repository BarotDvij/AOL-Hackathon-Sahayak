import { describe, expect, it } from "vitest";
import {
  alsoKnowsOf,
  buildGroups,
  connectionOf,
  deriveAssignments,
  draftGroupMessage,
  groupSuggestions,
  groupsNeedingAttention,
  quietProgram,
  unassignedViews,
  type Groupable,
} from "./groups";
import { VOLUNTEERS } from "./operations";
import type { EventType, History, Participant, StageId } from "./types";

/** A fictional person with just enough on record to be grouped. */
const person = (id: string, firstName: string, over: Partial<Participant> = {}): Participant => ({
  id, firstName, lastName: "Doe", age: 34, city: "Mississauga", language: "English",
  email: `${id}@example.com`, phone: "555-0100", preferredChannel: "whatsapp",
  doNotContact: false, sevaRole: null, interests: [], ...over,
});

const history = (
  courses: [string, string, (string | undefined)?][],
  events: [EventType, string, (string | undefined)?][] = [],
): History => ({
  courses: courses.map(([courseName, completedOn, volunteerId]) => ({ participantId: "p1", courseName, completedOn, ...(volunteerId ? { volunteerId } : {}) })),
  events: events.map(([eventType, date, volunteerId]) => ({ participantId: "p1", eventType, date, city: "Mississauga", online: false, ...(volunteerId ? { volunteerId } : {}) })),
  contacts: [],
});

const view = (p: Participant, h: History, stage: StageId, assignments: Record<string, string> = {}): Groupable => ({
  participant: p, history: h, stage, connection: connectionOf(p.id, h, assignments),
});

const SHIVAM = VOLUNTEERS.find((v) => v.id === "v4");

describe("volunteer grouping", () => {
  it("puts a person with the volunteer of their most recent course or gathering", () => {
    const h = history([["Art of Silence", "2026-07-10", "v4"]], [["satsang", "2026-10-05", "v1"]]);
    const c = connectionOf("p1", h, {});
    expect(c?.volunteerId).toBe("v1");
    expect(c?.program).toBe("satsang");
  });

  it("names the shared program and the month in the reason Sahayak gives", () => {
    const h = history([["Art of Silence", "2026-10-08", "v4"]]);
    expect(connectionOf("p1", h, {})?.reason).toBe("Did Art of Silence with Shivam Kapoor in October");
  });

  it("keeps a coordinator's move ahead of the records", () => {
    const h = history([["Art of Silence", "2026-10-08", "v4"]]);
    const c = connectionOf("p1", h, { p1: "v2" });
    expect(c?.volunteerId).toBe("v2");
    expect(c?.moved).toBe(true);
    expect(c?.reason).toBe("Moved to Alex Tremblay's group");
  });

  it("lists the other volunteers a person has done something with", () => {
    const h = history([["Sahaj Samadhi Meditation", "2026-09-01", "v1"], ["Art of Silence", "2026-10-08", "v4"]]);
    expect(alsoKnowsOf(h, "v4")).toEqual(["v1"]);
  });

  it("leaves people with no volunteer on record unassigned", () => {
    const p = person("p1", "Sofia");
    const h = history([["SKY Happiness Program", "2026-10-01"]], [["satsang", "2026-10-05"]]);
    expect(deriveAssignments([p], () => h)).toEqual({});
    expect(unassignedViews([view(p, h, "quiet")]).map((v) => v.participant.id)).toEqual(["p1"]);
  });

  it("counts the people drifting away in each group and ranks the riskiest first", () => {
    const quietOne = view(person("p1", "Ananya"), history([["Art of Silence", "2026-07-10", "v4"]]), "quiet");
    const quietTwo = view(person("p2", "Mateo"), history([["Art of Silence", "2026-07-12", "v4"]]), "quiet");
    const active = view(person("p3", "Tomás"), history([["SKY Happiness Program", "2026-10-02", "v1"]]), "active");
    const groups = buildGroups([quietOne, quietTwo, active]);
    const shivam = groups.find((g) => g.volunteer.id === "v4");
    expect(shivam?.goingQuiet).toBe(2);
    expect(groupsNeedingAttention(groups)[0]?.volunteer.id).toBe("v4");
  });

  it("marks a group over its volunteer's weekly capacity", () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      view(person(`p${i}`, `Person${i}`), history([["Art of Silence", "2026-07-10", "v4"]]), "active"),
    );
    const shivam = buildGroups(many).find((g) => g.volunteer.id === "v4");
    expect(shivam?.members.length).toBe(9);
    expect(shivam?.over).toBe(true);
  });

  it("names the program the drifting people share", () => {
    const group = buildGroups([
      view(person("p1", "Ananya"), history([["Art of Silence", "2026-07-10", "v4"]]), "quiet"),
      view(person("p2", "Mateo"), history([["Art of Silence", "2026-07-12", "v4"]]), "quiet"),
      view(person("p3", "Zara"), history([["satsang" as EventType, "2026-06-10", "v4"]]), "dormant"),
    ]).find((g) => g.volunteer.id === "v4");
    expect(quietProgram(group!)).toBe("Art of Silence");
  });

  it("drafts a group invite that names the volunteer and asks about a time", () => {
    const group = buildGroups([
      view(person("p1", "Ananya"), history([["Art of Silence", "2026-07-10", "v4"]]), "quiet"),
      view(person("p2", "Mateo"), history([["Art of Silence", "2026-07-12", "v4"]]), "quiet"),
    ]).find((g) => g.volunteer.id === "v4")!;
    const text = draftGroupMessage(group, "whatsapp", "Meera");
    expect(text).toContain("Shivam");
    expect(text).toMatch(/art of silence/i);
    expect(text).toContain("Would an evening or weekend satsang suit you?");
    // No invented dates: a group invite only ever asks when suits.
    expect(text).not.toMatch(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|20\d\d)/);
  });

  it("suggests the connected volunteer reach out, with the group's own numbers", () => {
    const group = buildGroups([
      view(person("p1", "Ananya"), history([["Art of Silence", "2026-07-10", "v4"]]), "quiet"),
      view(person("p2", "Mateo"), history([["Art of Silence", "2026-07-12", "v4"]]), "quiet"),
    ]).find((g) => g.volunteer.id === "v4")!;
    const text = groupSuggestions(group).map((s) => s.text).join(" ");
    expect(text).toContain("2 people in Shivam Kapoor's group have gone quiet. Shivam could reach out.");
    expect(text).toContain(`is at 2 of ${SHIVAM?.capacity}`);
  });
});
