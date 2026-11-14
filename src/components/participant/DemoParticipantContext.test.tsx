import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DemoParticipantProvider, useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { TEMP_PARTICIPANT_ID } from "@/lib/journey/demo-seed";
import { isoDaysFrom } from "@/lib/journey/dates";
import { JourneyProvider } from "@/lib/journey/store";

function wrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider><DemoParticipantProvider>{children}</DemoParticipantProvider></JourneyProvider>;
}

describe("No-login participant demo", () => {
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

  it("keeps Sahayak with Muse off until it is switched on, and off again in a fresh demo", () => {
    const { result, unmount } = renderHook(() => useDemoParticipant(), { wrapper });

    expect(result.current.sahayakOn).toBe(false);

    act(() => result.current.setSahayakOn(true));
    expect(result.current.sahayakOn).toBe(true);

    unmount();
    const fresh = renderHook(() => useDemoParticipant(), { wrapper });
    expect(fresh.result.current.sahayakOn).toBe(false);
    fresh.unmount();
  });
});
