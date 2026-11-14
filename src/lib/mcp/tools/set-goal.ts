import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { withParticipant } from "../participant";

export default defineTool({
  name: "set_goal",
  title: "Set a goal",
  description: "Save a participant-approved quarter or year goal.",
  inputSchema: { period: z.enum(["quarter", "year"]), text: z.string().trim().min(1).max(500) },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ period, text }, ctx) => withParticipant("set_goal", ctx, async ({ supabase, userId }) => {
    const { data, error } = await supabase.from("participant_goals").insert({ user_id: userId, period, text }).select("id, created_at").single();
    if (error) throw new Error("The goal could not be saved.");
    return { saved: true, goal: { id: data.id, period, text, createdAt: data.created_at } };
  }),
});
