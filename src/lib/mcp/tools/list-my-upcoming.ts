import { defineTool } from "@lovable.dev/mcp-js";
import { getRequestUrl } from "@tanstack/react-start/server";
import { normalizeOnboardingAnswers, participantEvents, prefersOnline } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";
import { fetchProgramCatalog } from "@/lib/program-catalog";
import { buildCatalog } from "@/lib/journey/catalog";

export default defineTool({
  name: "list_my_upcoming",
  title: "List my upcoming events",
  description: "List fitting upcoming courses and events for the connected participant, including calendar links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("list_my_upcoming", ctx, async ({ participantId, supabase, userId }) => {
    const [programCatalog, onboarding] = await Promise.all([
      fetchProgramCatalog(supabase),
      supabase.from("participant_onboarding").select("answers").eq("user_id", userId).maybeSingle(),
    ]);
    if (onboarding.error) throw new Error("Onboarding answers could not be loaded.");
    const answers = normalizeOnboardingAnswers(onboarding.data?.answers ?? {});
    const catalog = buildCatalog(programCatalog.programs, programCatalog.prerequisites);
    return { events: participantEvents(participantId, getRequestUrl().origin, 20, catalog, { prefersOnline: prefersOnline(answers), location: answers.location, courseLevel: answers.course_level }) };
  }),
});
