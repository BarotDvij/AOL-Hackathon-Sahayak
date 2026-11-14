import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JourneyProvider } from "@/lib/journey/store";
import { ParticipantsTable } from "./ParticipantsTable";

const noop = () => {};

describe("participants table", () => {
  it("shows ten rows a page and pages through everyone", () => {
    const { container } = render(<JourneyProvider><ParticipantsTable stage="all" onStage={noop} onOpen={noop} /></JourneyProvider>);
    const rows = () => container.querySelectorAll("tbody tr");
    expect(rows().length).toBe(10);
    expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–10 of 31")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();
    expect(rows().length).toBe(10);
  });

  it("marks paused people with a Paused badge instead of a next step", () => {
    const { container } = render(<JourneyProvider><ParticipantsTable stage="paused" onStage={noop} onOpen={noop} /></JourneyProvider>);
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.textContent?.includes("Paused"))).toBe(true);
  });
});
