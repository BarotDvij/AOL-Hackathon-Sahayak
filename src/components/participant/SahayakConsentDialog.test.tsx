import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SahayakConsentDialog, SAHAYAK_ACCESS } from "@/components/participant/SahayakConsentDialog";

function openDialog() {
  const onAccept = vi.fn();
  const onDecline = vi.fn();
  render(<SahayakConsentDialog open selected={[]} onAccept={onAccept} onDecline={onDecline} />);
  return { onAccept, onDecline };
}

describe("Sahayak consent dialog", () => {
  it("asks for the Sahayak-lives-in-Muse wording and one tick box per access item", () => {
    openDialog();
    expect(screen.getByText(/Your Sahayak lives in your Muse and can only use what you tick here/i)).toBeTruthy();
    expect(screen.getAllByRole("checkbox")).toHaveLength(SAHAYAK_ACCESS.length + 1);
    SAHAYAK_ACCESS.forEach((item) => {
      expect(screen.getByRole("checkbox", { name: item.label })).toBeTruthy();
    });
  });

  it("will not turn anything on until at least one item is ticked", () => {
    openDialog();
    expect(screen.getByRole("button", { name: /turn on/i })).toBeDisabled?.() ??
      expect(screen.getByRole("button", { name: /turn on/i }).hasAttribute("disabled")).toBe(true);
  });

  it("ticks every item when Allow all is chosen and hands back all of them", () => {
    const { onAccept } = openDialog();
    fireEvent.click(screen.getByRole("checkbox", { name: "Allow all" }));
    SAHAYAK_ACCESS.forEach((item) => {
      expect(screen.getByRole("checkbox", { name: item.label }).getAttribute("data-state")).toBe("checked");
    });
    fireEvent.click(screen.getByRole("button", { name: /allow all and turn on/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept.mock.calls[0]?.[0]).toEqual(SAHAYAK_ACCESS.map((item) => item.id));
  });

  it("sends back only the single item ticked by hand", () => {
    const { onAccept } = openDialog();
    fireEvent.click(screen.getByRole("checkbox", { name: SAHAYAK_ACCESS[0]!.label }));
    fireEvent.click(screen.getByRole("button", { name: /turn on with 1 of/i }));
    expect(onAccept).toHaveBeenCalledWith([SAHAYAK_ACCESS[0]!.id]);
  });

  it("starts from what is already allowed and lets the participant tick it back off", () => {
    const onAccept = vi.fn();
    render(<SahayakConsentDialog open selected={["practice", "events"]} onAccept={onAccept} onDecline={vi.fn()} />);
    expect(screen.getByRole("checkbox", { name: SAHAYAK_ACCESS[0]!.label }).getAttribute("data-state")).toBe("checked");
    fireEvent.click(screen.getByRole("checkbox", { name: SAHAYAK_ACCESS[0]!.label }));
    fireEvent.click(screen.getByRole("button", { name: /turn on with 1 of/i }));
    expect(onAccept).toHaveBeenCalledWith(["events"]);
  });
});
