import { defineTool } from "@lovable.dev/mcp-js";
import { practiceDto } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";

export default defineTool({
  name: "get_my_practice",
  title: "Get my practice",
  description: "Read only the connected participant's practice entries, current week and streaks.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("get_my_practice", ctx, async ({ supabase, userId, participantId }) => {
    const { data, error } = await supabase.from("practice_logs").select("id, practiced_on, minutes").eq("user_id", userId).order("practiced_on", { ascending: false }).limit(120);
    if (error) throw new Error("Practice history could not be loaded.");
    return { practice: practiceDto(data ?? [], participantId) };
  }),
});
