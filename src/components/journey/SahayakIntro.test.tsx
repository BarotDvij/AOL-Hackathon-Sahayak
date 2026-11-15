import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/journey/i18n";
import { JourneyProvider } from "@/lib/journey/store";
import { SahayakIntro } from "./SahayakIntro";

function wrap(ui: ReactNode) {
  return render(<LanguageProvider><JourneyProvider>{ui}</JourneyProvider></LanguageProvider>);
}

describe("Sahayak intro", () => {
  it("stays closed until the coordinator asks for it", () => {
    wrap(<SahayakIntro open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Meet Sahayak, your follow-up helper")).toBeNull();
  });

  it("explains what Sahayak does and offers both choices when opened", () => {
    wrap(<SahayakIntro open onOpenChange={() => {}} />);
    expect(screen.getByText("Meet Sahayak, your follow-up helper")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Yes, turn on Sahayak" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "I will do it manually" })).toBeTruthy();
  });
});
