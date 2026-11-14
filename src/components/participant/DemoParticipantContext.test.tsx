import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DemoParticipantProvider, useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ALL_SAHAYAK_ACCESS_IDS } from "@/components/participant/SahayakConsentDialog";
import { TEMP_PARTICIPANT_ID } from "@/lib/journey/demo-seed";
import { isoDaysFrom } from "@/lib/journey/dates";
import { JourneyProvider } from "@/lib/journey/store";

function wrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider><DemoParticipantProvider>{children}</DemoParticipantProvider></JourneyProvider>;
}

describe("No-login participant demo", () => {
  it("keeps weekly, monthly and annual goals under their chosen periods", () => {
    const { result } = renderHook(() => useDemoParticipant(), { wrapper });
    act(() => {
      result.current.saveGoal("week", "Practise three days");
      result.current.saveGoal("month", "Join a group");
      result.current.saveGoal("year", "Explore my next course");
    });
    expect(result.current.data.goals.filter((goal) => goal.period === "week").map((goal) => goal.text)).toEqual(["Practise three days"]);
    expect(result.current.data.goals.filter((goal) => goal.period === "month").map((goal) => goal.text)).toEqual(["Join a group"]);
    expect(result.current.data.goals.filter((goal) => goal.period === "year").map((goal) => goal.text)).toEqual(["Explore my next course"]);
  });
  it("keeps typed chat replies participant-scoped and rejects blank replies", () => {
    const { result, unmount } = renderHook(() => useDemoParticipant(), { wrapper });
    const message = result.current.data.messages[0];
    if (!message) throw new Error("Expected Priya's approved demo message");
    act(() => {
      expect(result.current.sendChatReply("another-persons-message", "Hello")).toBe(false);
      expect(result.current.sendChatReply(message.id, "  ")).toBe(false);
      expect(result.current.sendChatReply(message.id, "  Can I join on Wednesday?  ")).toBe(true);
    });
    expect(result.current.chatReplies).toHaveLength(1);
    expect(result.current.chatReplies[0]?.text).toBe("Can I join on Wednesday?");
    expect(result.current.chatReplies[0]?.messageId).toBe(message.id);
    unmount();
    const fresh = renderHook(() => useDemoParticipant(), { wrapper });
    expect(fresh.result.current.chatReplies).toEqual([]);
    fresh.unmount();
  });
  it("uses only Priya's fictional records and friendly journey wording", () => {
    const { result } = renderHook(() => useDemoParticipant(), { wrapper });

    expect(result.current.data.participant.id).toBe(TEMP_PARTICIPANT_ID);
    expect(result.current.data.participant.firstName).toBe("Priya");
    expect(result.current.data.messages.every((message) => message.participantId === TEMP_PARTICIPANT_ID)).toBe(true);
    expect(result.current.data.stage.name).toBe("Just getting started");
  });

  it("keeps actions local and resets them with a fresh demo", () => {
    const first = renderHook(() => useDemoParticipant(), { wrapper });
    const eventId = first.result.current.data.upcoming[0]!.id;

    act(() => {
      first.result.current.logToday();
      first.result.current.showInterest(eventId);
      first.result.current.saveGoal("quarter", "A gentle daily practice");
      first.result.current.saveAnswers({ practice_time: "evening" });
    });

    expect(first.result.current.data.practice.entries.some((entry) => entry.date === isoDaysFrom(0))).toBe(true);
    expect(first.result.current.data.interests).toEqual([eventId]);
    expect(first.result.current.data.goals[0]?.text).toBe("A gentle daily practice");
    expect(first.result.current.data.schedule.time).toBe("7:00 PM");

    first.unmount();
    const fresh = renderHook(() => useDemoParticipant(), { wrapper });
    expect(fresh.result.current.data.goals).toEqual([]);
    expect(fresh.result.current.data.interests).toEqual([]);
    expect(fresh.result.current.data.answers).toEqual({});
  });

  it("keeps Sahayak with Muse off until consent is given, and grants only what was ticked", () => {
    const { result, unmount } = renderHook(() => useDemoParticipant(), { wrapper });

    expect(result.current.sahayakOn).toBe(false);
    expect(result.current.sahayakAccess).toEqual([]);

    act(() => result.current.requestSahayak(true));
    expect(result.current.sahayakConsentOpen).toBe(true);
    expect(result.current.sahayakOn).toBe(false);

    act(() => result.current.acceptSahayakConsent(["practice", "events"]));
    expect(result.current.sahayakOn).toBe(true);
    expect(result.current.sahayakAccess).toEqual(["practice", "events"]);
    expect(result.current.sahayakConsentOpen).toBe(false);

    act(() => result.current.requestSahayak(false));
    expect(result.current.sahayakOn).toBe(false);
    expect(result.current.sahayakAccess).toEqual([]);

    unmount();
    const fresh = renderHook(() => useDemoParticipant(), { wrapper });
    expect(fresh.result.current.sahayakOn).toBe(false);
    expect(fresh.result.current.sahayakAccess).toEqual([]);
    fresh.unmount();
  });

  it("grants everything when all five items are ticked, and nothing when the list is empty", () => {
    const { result, unmount } = renderHook(() => useDemoParticipant(), { wrapper });

    act(() => result.current.requestSahayak(true));
    act(() => result.current.acceptSahayakConsent([]));
    expect(result.current.sahayakOn).toBe(false);
    expect(result.current.sahayakConsentOpen).toBe(true);

    act(() => result.current.acceptSahayakConsent(ALL_SAHAYAK_ACCESS_IDS));
    expect(result.current.sahayakOn).toBe(true);
    expect(result.current.sahayakAccess).toEqual(ALL_SAHAYAK_ACCESS_IDS);
    unmount();
  });

  it("leaves Sahayak off when the participant declines the consent prompt", () => {
    const { result, unmount } = renderHook(() => useDemoParticipant(), { wrapper });

    act(() => result.current.requestSahayak(true));
    act(() => result.current.declineSahayakConsent());

    expect(result.current.sahayakOn).toBe(false);
    expect(result.current.sahayakConsentOpen).toBe(false);
    unmount();
  });
});
