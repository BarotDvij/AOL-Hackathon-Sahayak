import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { daysAgoIso } from "./dates";
import { needsReply } from "./inbox-seed";
import {
  NUDGE_LIMIT,
  suggestedReply,
  waitingDays,
  WAITING_AFTER_DAYS,
  answerFromData,
} from "./sahayak";
import { JourneyProvider, useJourney } from "./store";

let latest: ReturnType<typeof useJourney> | null = null;
function Probe() { latest = useJourney(); return null; }
/** Mounts a fresh in-memory app and hands back a getter for its current state. */
function open() {
  render(<JourneyProvider><Probe /></JourneyProvider>);
  return () => latest!;
}
/** Same, but with Sahayak switched on the way the first-time question would. */
function openOn() {
  const get = open();
  act(() => get().setSahayakOn(true));
  return get;
}

describe("Sahayak", () => {
  beforeEach(() => { localStorage.clear(); });

  it("starts off and undecided, and shows nothing until it is turned on", () => {
    const get = open();
    expect(get().sahayak.decided).toBe(false);
    expect(get().sahayak.on).toBe(false);
    expect(get().brief).toEqual([]);
    expect(get().reminders).toEqual([]);

    act(() => get().setSahayakOn(true));
    expect(get().brief.length).toBeGreaterThan(0);
    expect(get().reminders.length).toBeGreaterThan(0);
  });

  it("shows nothing on the dashboard the moment it is switched off, but keeps the inbox readable", () => {
    const get = openOn();
    expect(get().brief.length).toBeGreaterThan(0);

    act(() => get().setSahayakOn(false));
    expect(get().brief).toEqual([]);
    expect(get().reminders).toEqual([]);
    expect(get().sahayak.decided).toBe(true);
    // The messages themselves are the coordinator's records, not a Sahayak feature.
    expect(get().inbox.some(needsReply)).toBe(true);
  });

  it("keeps each switch independent: a dismissed brief does not silence reminders", () => {
    const get = openOn();
    act(() => get().dismissBrief());
    expect(get().brief).toEqual([]);
    expect(get().reminders.length).toBeGreaterThan(0);

    act(() => get().setSahayakFeature("dailyBrief", false));
    expect(get().brief).toEqual([]);
    expect(get().reminders.length).toBeGreaterThan(0);
  });

  it("snoozing or dismissing takes away exactly the one reminder it was told to", () => {
    const get = openOn();
    const before = get().reminders.map((r) => r.id);
    expect(before.length).toBeGreaterThanOrEqual(2);
    const snoozed = before[0]!;
    const dropped = before[1]!;
    const rest = before.slice(2);

    act(() => { get().snoozeReminder(snoozed, 3); get().dismissReminder(dropped); });

    const after = get().reminders.map((r) => r.id);
    expect(after).not.toContain(snoozed);
    expect(after).not.toContain(dropped);
    expect(after).toEqual(expect.arrayContaining(rest));
    expect(after.length).toBeLessThanOrEqual(NUDGE_LIMIT[get().sahayak.nudge]);

    // Widening the frequency lets other things in, but never the two you set aside.
    act(() => get().setNudge("frequent"));
    const wide = get().reminders.map((r) => r.id);
    expect(wide).not.toContain(snoozed);
    expect(wide).not.toContain(dropped);
  });

  it("brings at most three things at once on Gentle and never more than the chosen frequency allows", () => {
    const get = openOn();
    act(() => get().setNudge("gentle"));
    const gentle = get().reminders.length;
    expect(gentle).toBeLessThanOrEqual(NUDGE_LIMIT.gentle);

    act(() => get().setNudge("normal"));
    expect(get().reminders.length).toBeLessThanOrEqual(NUDGE_LIMIT.normal);

    act(() => get().setNudge("frequent"));
    expect(get().reminders.length).toBeLessThanOrEqual(NUDGE_LIMIT.frequent);
    expect(get().reminders.length).toBeGreaterThanOrEqual(gentle);
  });

  it("never sends a reply until the coordinator approves it", () => {
    const get = openOn();
    const target = get().inbox.find((m) => needsReply(m))!;
    const person = get().views.find((v) => v.participant.id === target.participantId)!;
    const before = get().summary.sentThisWeek;

    // Reading and drafting change nothing at all.
    const draft = suggestedReply(target, person.participant, get().catalogList);
    expect(draft).toContain(person.participant.firstName);
    expect(get().inbox.find((m) => m.id === target.id)?.status).toBe("needs-reply");
    expect(get().activity.some((a) => a.kind === "replied")).toBe(false);
    expect(get().summary.sentThisWeek).toBe(before);

    act(() => get().replyInbox(target.id, "Yes, please save you a seat"));

    const after = get();
    const sent = after.inbox.find((m) => m.id === target.id)!;
    expect(sent.status).toBe("replied");
    expect(sent.replyText).toBe("Yes, please save you a seat");
    expect(after.activity[0]?.kind).toBe("replied");
    expect(after.summary.sentThisWeek).toBe(before + 1);
  });

  it("flags a message as waiting only once it has sat unanswered for two days or more", () => {
    const get = open();
    const base = get().inbox.find((m) => needsReply(m))!;
    const aged = { ...base, date: daysAgoIso(3) };
    const fresh = { ...base, date: daysAgoIso(1) };

    expect(waitingDays(aged)).toBe(3);
    expect(waitingDays(fresh)).toBe(1);
    expect(WAITING_AFTER_DAYS).toBe(2);
    expect(waitingDays(aged) ?? 0).toBeGreaterThanOrEqual(WAITING_AFTER_DAYS);
    expect(waitingDays(fresh) ?? 0).toBeLessThan(WAITING_AFTER_DAYS);
    // A message already answered is not waiting on anyone.
    expect(waitingDays({ ...base, status: "replied" })).toBeNull();
  });

  it("still answers questions from the records when Sahayak is off", () => {
    const get = open();
    act(() => get().setSahayakOn(false));
    const answer = answerFromData("who is going quiet", get().views, get().upcoming, get().inbox);
    expect(answer.rows.length).toBeGreaterThan(0);
    expect(answer.rows.every((r) => r.detail.length > 0)).toBe(true);
  });

  it("resetting the demo asks the first-time question again", () => {
    const get = openOn();
    act(() => get().decideSahayak(false));
    expect(get().sahayak.decided).toBe(true);
    expect(get().sahayak.on).toBe(false);

    act(() => get().resetSahayakDemo());
    expect(get().sahayak.decided).toBe(false);
    expect(get().sahayak.snoozed).toEqual({});
    expect(get().sahayak.dismissed).toEqual([]);

    act(() => get().setSahayakOn(true));
    expect(get().reminders.length).toBeGreaterThan(0);
  });

  it("remembers the answer so the first-time popup is not asked again after a reload", () => {
    const get = open();
    act(() => get().decideSahayak(true));
    expect(localStorage.getItem("journey-sahayak-choice")).toBe("on");

    // A fresh mount is what a reload does: it comes back already answered.
    const again = open();
    expect(again().sahayak.decided).toBe(true);
    expect(again().sahayak.on).toBe(true);

    act(() => again().resetSahayakDemo());
    expect(localStorage.getItem("journey-sahayak-choice")).toBeNull();
    expect(again().sahayak.decided).toBe(false);
  });
});
