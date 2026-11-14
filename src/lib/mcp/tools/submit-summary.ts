import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { withParticipant } from "../participant";

export default defineTool({
  name: "submit_summary",
  title: "Submit an approved summary",
  description: "Save a summary for the coordinator only after the participant has read and explicitly approved its exact text.",
  inputSchema: { text: z.string().trim().min(1).max(4000).describe("The exact participant-approved summary.") },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ text }, ctx) => withParticipant("submit_summary", ctx, async ({ supabase, userId, participantId }) => {
    const { data, error } = await supabase.from("participant_summaries").insert({ user_id: userId, participant_id: participantId, text, source: "via Muse" }).select("id, created_at").single();
    if (error) throw new Error("The summary could not be saved.");
    return { saved: true, id: data.id, source: "via Muse", createdAt: data.created_at };
  }),
});
