import { defineTool } from "@lovable.dev/mcp-js";
import { JOURNEY_LADDER, ONBOARDING_INSTRUCTIONS, ONBOARDING_QUESTIONS } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";

export default defineTool({
  name: "get_onboarding_questions",
  title: "Get onboarding questions",
  description: "Return the intake questions: furthest course completed, how closely they keep that course's home practice, practice time, group format, and goals for the month, quarter and year. Includes options and facilitation instructions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => withParticipant("get_onboarding_questions", ctx, async () => ({
    instructions: ONBOARDING_INSTRUCTIONS,
    practiceGuidelines: JOURNEY_LADDER.map((l) => ({ course: l.value, guideline: l.practice })),
    questions: ONBOARDING_QUESTIONS.map((q) => ({ id: q.id, text: q.text, skippable: true, acceptsOwnWords: q.kind === "goal", options: q.options.map((o) => ({ value: o.value, label: o.label })) })),
  })),
});
