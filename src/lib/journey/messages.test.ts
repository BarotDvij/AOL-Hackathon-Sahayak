import { describe, expect, it } from "vitest";
import { toneNote } from "./messages";

describe("toneNote", () => {
  it("flags pressure, urgency and outcome promises", () => {
    expect(toneNote("Last chance to join, don’t miss it!")).toEqual(["last chance", "don't miss"]);
    expect(toneNote("This is guaranteed to cure stress.")).toEqual(["guarantee", "cure"]);
    expect(toneNote("Dernière chance pour vous inscrire.")).toEqual(["dernière chance"]);
  });
  it("leaves gentle wording alone", () => {
    expect(toneNote("No pressure at all. Your place is secure whenever it suits. Warmly, Meera")).toEqual([]);
  });
});
