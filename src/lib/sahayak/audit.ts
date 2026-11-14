import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Shared audit writer for every Sahayak tool call. OAuth calls have no API-key id. */
export async function recordSahayakCall(supabase: SupabaseClient<Database>, input: { userId: string; keyId?: string | null; role: "participant" | "coordinator"; tool: string }) {
  const { error } = await supabase.from("sahayak_audit").insert({
    user_id: input.userId,
    key_id: input.keyId ?? null,
    role: input.role,
    tool: input.tool,
  });
  if (error) throw new Error("The tool call could not be recorded. No changes were confirmed.");
}
