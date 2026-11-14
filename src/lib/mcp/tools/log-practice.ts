import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { withParticipant } from "../participant";

export default defineTool({
  name: "log_practice",
  title: "Log practice",
  description: "Log today's practice for the connected participant, with an optional duration in minutes.",
  inputSchema: { minutes: z.number().int().min(1).max(600).optional().describe("Optional practice duration in minutes.") },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ minutes }, ctx) => withParticipant("log_practice", ctx, async ({ supabase, userId }) => {
    const date = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("practice_logs").upsert({ user_id: userId, practiced_on: date, minutes: minutes ?? null }, { onConflict: "user_id,practiced_on" });
    if (error) throw new Error("Practice could not be logged.");
    return { logged: true, date, minutes: minutes ?? null };
  }),
});
