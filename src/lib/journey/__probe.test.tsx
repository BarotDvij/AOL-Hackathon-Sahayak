import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JourneyProvider, useJourney } from "@/lib/journey/store";

function Probe() {
  const { groups, unassigned } = useJourney();
  return (
    <div>
      <pre data-testid="probe">{JSON.stringify({
        groups: groups.map((g) => ({
          name: g.volunteer.name,
          members: g.members.length,
          quiet: g.goingQuiet,
          dormant: g.dormant,
          over: g.over,
          programs: g.programs.map((p) => `${p.name}(${p.people})`),
          people: g.members.map((m) => `${m.participant.firstName}:${m.stage}:${m.connection?.reason ?? "-"}`),
        })),
        unassigned: unassigned.map((v) => `${v.participant.firstName}:${v.stage}`),
      }, null, 1)}</pre>
    </div>
  );
}

describe("probe", () => {
  it("prints groups", () => {
    const { getByTestId } = render(<JourneyProvider><Probe /></JourneyProvider>);
    console.log(getByTestId("probe").textContent);
    expect(true).toBe(true);
  });
});
