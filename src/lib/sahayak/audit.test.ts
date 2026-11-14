import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { recordSahayakCall } from "./audit";

describe("Sahayak audit", () => {
  it("records the tool, role and participant without storing a credential", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const client = { from } as unknown as SupabaseClient<Database>;
    await recordSahayakCall(client, { userId: "user-1", role: "participant", tool: "get_my_practice" });
    expect(from).toHaveBeenCalledWith("sahayak_audit");
    expect(insert).toHaveBeenCalledWith({ user_id: "user-1", key_id: null, role: "participant", tool: "get_my_practice" });
    expect(JSON.stringify(insert.mock.calls[0])).not.toContain("token");
  });

  it("fails closed when the audit record cannot be written", async () => {
    const client = { from: () => ({ insert: async () => ({ error: new Error("denied") }) }) } as unknown as SupabaseClient<Database>;
    await expect(recordSahayakCall(client, { userId: "user-1", role: "participant", tool: "log_practice" })).rejects.toThrow("could not be recorded");
  });
});
