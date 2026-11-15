import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { JourneyProvider } from "@/lib/journey/store";
import { ParticipantsTable } from "./ParticipantsTable";

const noop = () => {};

/** The table links to group pages, so it needs a router around it. */
function renderTable(props: { stage?: "all" | "paused"; title?: string } = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/participants"] }),
    context: { queryClient: new QueryClient() },
  });
  return render(
    <JourneyProvider>
      <RouterProvider router={router}>
        <ParticipantsTable stage={props.stage ?? "all"} onStage={noop} onOpen={noop} title={props.title ?? "Participants"} />
      </RouterProvider>
    </JourneyProvider>,
  );
}

const section = (container: HTMLElement, name: string) => container.querySelector(`section[aria-label="${name}"]`);

describe("participants table", () => {
  it("groups people under the volunteer they did their most recent program with", () => {
    const { container } = renderTable();
    for (const name of ["Maya Desai", "Alex Tremblay", "Claire Roy", "Shivam Kapoor", "Camille Martin"]) {
      expect(section(container, name)).not.toBeNull();
    }
    expect(section(container, "Unassigned")).not.toBeNull();
  });

  it("shows how many people in a volunteer's group have gone quiet", () => {
    const { container } = renderTable();
    expect(section(container, "Shivam Kapoor")?.textContent).toContain("3 people going quiet");
  });

  it("moves a person to another volunteer's group when their row is dropped there", () => {
    const { container } = renderTable();
    const row = screen.getByText("Priya Nair").closest("tr");
    expect(row).not.toBeNull();
    fireEvent.dragStart(row!);
    fireEvent.drop(section(container, "Alex Tremblay")!);
    expect(section(container, "Alex Tremblay")?.textContent).toContain("Priya Nair");
    expect(section(container, "Maya Desai")?.textContent).not.toContain("Priya Nair");
  });

  it("records a group invite only once the coordinator approves it", () => {
    const { container } = renderTable();
    const shivam = section(container, "Shivam Kapoor")!;
    fireEvent.click(screen.getByRole("button", { name: "Message group" }));
    const approve = screen.getByRole("button", { name: /Approve and send to/ });
    expect(approve.textContent).toContain("7");
    fireEvent.click(approve);
    expect(screen.getByText("Group invite approved")).toBeInTheDocument();
    expect(shivam.querySelector("table")).not.toBeNull();
  });

  it("pages through everyone when grouping is turned off", () => {
    const { container } = renderTable();
    fireEvent.click(screen.getByRole("combobox", { name: "Group by" }));
    fireEvent.click(screen.getByRole("option", { name: "None" }));
    expect(container.querySelectorAll("tbody tr").length).toBe(10);
    expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–10 of 31")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();
  });

  it("marks paused people with a Paused badge instead of a next step", () => {
    const { container } = renderTable({ stage: "paused" });
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.textContent?.includes("Paused"))).toBe(true);
  });
});
