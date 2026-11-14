import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return paths", () => {
  it("preserves a complete local consent URL", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#approve")).toBe("/.lovable/oauth/consent?authorization_id=abc#approve");
  });

  it.each(["https://outside.example", "//outside.example", "/\\outside.example", "/\noutside.example"])("rejects unsafe return path %s", (value) => {
    expect(oauthReturnPath(value)).toBe("/me");
  });
});
