import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { saveOnboarding } from "@/lib/sahayak/save-onboarding";
import { withParticipant } from "../participant";

export default defineTool({
  name: "save_onboarding",
  title: "Save onboarding",
  description: "Save confirmed onboarding answers through the shared journey core and return only the friendly stage name.",
  inputSchema: { answers: z.record(z.string(), z.string()).describe("Confirmed answers using question ids and option values from get_onboarding_questions.") },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ answers }, ctx) => withParticipant("save_onboarding", ctx, async ({ supabase, userId, participantId }) => {
    const saved = await saveOnboarding(supabase, userId, participantId, answers);
    return { saved: true, answers: saved.answers, stageName: saved.stageName, stageLine: saved.stageLine };
  }),
});
