import { defineTool } from "@lovable.dev/mcp-js";
import { ONBOARDING_INSTRUCTIONS, ONBOARDING_QUESTIONS } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";

export default defineTool({
  name: "get_onboarding_questions",
  title: "Get onboarding questions",
  description: "Return the six participant onboarding questions, fixed options and facilitation instructions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => withParticipant("get_onboarding_questions", ctx, async () => ({
    instructions: ONBOARDING_INSTRUCTIONS,
    questions: ONBOARDING_QUESTIONS.map((q) => ({ id: q.id, text: q.text, skippable: true, options: q.options.map((o) => ({ value: o.value, label: o.label })) })),
  })),
});
