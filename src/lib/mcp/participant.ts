import { ToolError, type JsonValue, type ToolContext, type ToolHandlerResult } from "@lovable.dev/mcp-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { participantBundle, type ParticipantBundle } from "@/lib/sahayak/core";
import { recordSahayakCall } from "@/lib/sahayak/audit";
import { supabaseForUser } from "./supabase";

export interface ParticipantToolContext extends ParticipantBundle {
  supabase: SupabaseClient<Database>;
  userId: string;
  participantId: string;
}

/** Resolves identity only from verified OAuth, then audits success or failure. */
export async function withParticipant(tool: string, ctx: ToolContext, work: (input: ParticipantToolContext) => Promise<Record<string, JsonValue>>): Promise<ToolHandlerResult> {
  const userId = ctx.getUserId();
  if (!userId || !ctx.isAuthenticated()) throw new ToolError("Please connect with participant OAuth.");
  const supabase = supabaseForUser(ctx);
  let audited = false;
  try {
    const { data: account, error } = await supabase.from("participant_accounts").select("participant_id").eq("user_id", userId).maybeSingle();
    if (error) throw new ToolError("Your participant link could not be loaded.");
    if (!account) throw new ToolError("Open Journey Companion and choose your sample participant first.");
    const bundle = participantBundle(account.participant_id);
    if (!bundle) throw new ToolError("Your participant record is unavailable.");
    await recordSahayakCall(supabase, { userId, role: "participant", tool });
    audited = true;
    const result = await work({ ...bundle, supabase, userId, participantId: account.participant_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
  } catch (error) {
    if (!audited) await recordSahayakCall(supabase, { userId, role: "participant", tool });
    throw error;
  }
}
