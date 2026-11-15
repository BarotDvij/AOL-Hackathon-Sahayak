import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { JourneyProvider, useJourney } from "@/lib/journey/store";
import { ParticipantsTable } from "./ParticipantsTable";

const noop = () => {};

/** Shows what the group invite actually recorded, so the test can read it back. */
function GroupRecord() {
  const { groupMessages } = useJourney();
  return <span data-testid="group-record">{`${groupMessages.length}:${groupMessages[0]?.memberIds.length ?? 0}`}</span>;
}

/** The table links to group pages, so it needs a router in context around it. */
function renderTable(props: { stage?: "all" | "paused" } = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/participants"] }),
    context: { queryClient: new QueryClient() },
  });
  return render(
    <JourneyProvider>
      <RouterContextProvider router={router}>
        <GroupRecord />
        <ParticipantsTable stage={props.stage ?? "all"} onStage={noop} onOpen={noop} />
      </RouterContextProvider>
    </JourneyProvider>,
  );
}

const section = (container: HTMLElement, name: string) => container.querySelector<HTMLElement>(`section[aria-label="${name}"]`);

describe("participants table", () => {
  it("groups people under the volunteer they did their most recent program with", async () => {
    const { container } = await renderTable();
    for (const name of ["Maya Desai", "Alex Tremblay", "Claire Roy", "Shivam Kapoor", "Camille Martin"]) {
      expect(section(container, name)).not.toBeNull();
    }
    expect(section(container, "Unassigned")).not.toBeNull();
  });

  it("shows how many people in a volunteer's group have gone quiet", async () => {
    const { container } = await renderTable();
    expect(section(container, "Shivam Kapoor")?.textContent).toContain("3 people going quiet");
  });

  it("moves a person to another volunteer's group when their row is dropped there", async () => {
    const { container } = await renderTable();
    const row = [...container.querySelectorAll("tbody tr")].find((r) => r.textContent?.includes("Priya Nair"));
    const target = section(container, "Alex Tremblay");
    expect(row).toBeDefined();
    expect(target).not.toBeNull();
    if (!row || !target) throw new Error("Missing source person or target volunteer");
    fireEvent.dragStart(row);
    const updatedTarget = section(container, "Alex Tremblay");
    if (!updatedTarget) throw new Error("Missing refreshed target volunteer");
    fireEvent.drop(updatedTarget);
    expect(section(container, "Alex Tremblay")?.textContent).toContain("Priya Nair");
    expect(section(container, "Maya Desai")?.textContent).not.toContain("Priya Nair");
  });

  it("records a group invite only once the coordinator approves it", async () => {
    const { container } = await renderTable();
    const shivam = section(container, "Shivam Kapoor");
    if (!shivam) throw new Error("Missing volunteer group");
    expect(screen.getByTestId("group-record").textContent).toBe("0:0");
    fireEvent.click(within(shivam).getByRole("button", { name: "Message group" }));
    const approve = screen.getByRole("button", { name: /Approve and send to/ });
    expect(approve.textContent).toContain("7");
    fireEvent.click(approve);
    expect(screen.getByTestId("group-record").textContent).toBe("1:7");
  });

  it("pages through everyone when grouping is turned off", async () => {
    const { container } = await renderTable();
    fireEvent.click(screen.getByRole("button", { name: "None" }));
    expect(container.querySelectorAll("tbody tr").length).toBe(10);
    expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–10 of 31")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();
  });

  it("marks paused people with a Paused badge instead of a next step", async () => {
    const { container } = await renderTable({ stage: "paused" });
    const rows = [...container.querySelectorAll("tbody tr")].filter((r) => !r.textContent?.includes("No one matches these filters"));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.textContent?.includes("Paused"))).toBe(true);
  });
});
