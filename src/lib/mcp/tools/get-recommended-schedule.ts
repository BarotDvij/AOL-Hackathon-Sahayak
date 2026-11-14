import { defineTool } from "@lovable.dev/mcp-js";
import { normalizeOnboardingAnswers, recommendedSchedule } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";
import { fetchProgramCatalog } from "@/lib/program-catalog";

export default defineTool({
  name: "get_recommended_schedule",
  title: "Get recommended schedule",
  description: "Suggest gentle practice days, a time and session length from the participant's answers and journey.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("get_recommended_schedule", ctx, async ({ supabase, userId, stage }) => {
    const { data, error } = await supabase.from("participant_onboarding").select("answers").eq("user_id", userId).maybeSingle();
    if (error) throw new Error("Onboarding answers could not be loaded.");
    const answers = normalizeOnboardingAnswers(data?.answers ?? {});
    return { schedule: recommendedSchedule(answers, stage), basedOnAnswers: Object.keys(answers).length > 0 };
  }),
});
