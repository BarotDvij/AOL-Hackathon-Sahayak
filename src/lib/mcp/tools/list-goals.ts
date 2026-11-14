import { defineTool } from "@lovable.dev/mcp-js";
import { withParticipant } from "../participant";

export default defineTool({
  name: "list_goals",
  title: "List goals",
  description: "List only the connected participant's quarter and year goals.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("list_goals", ctx, async ({ supabase, userId }) => {
    const { data, error } = await supabase.from("participant_goals").select("id, period, text, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error("Goals could not be loaded.");
    return { goals: (data ?? []).map((g) => ({ id: g.id, period: g.period, text: g.text, createdAt: g.created_at })) };
  }),
});
