import { defineTool } from "@lovable.dev/mcp-js";
import { withParticipant } from "../participant";

export default defineTool({
  name: "get_my_messages",
  title: "Get my messages",
  description: "Read coordinator-approved messages for the connected participant only. Never includes drafts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("get_my_messages", ctx, async ({ supabase, participantId }) => {
    const { data, error } = await supabase.from("participant_messages").select("id, coordinator_name, text, sent_at, reply").eq("participant_id", participantId).order("sent_at", { ascending: false }).limit(50);
    if (error) throw new Error("Messages could not be loaded.");
    return { messages: (data ?? []).map((m) => ({ id: m.id, coordinatorName: m.coordinator_name, text: m.text, sentAt: m.sent_at, reply: m.reply })) };
  }),
});
