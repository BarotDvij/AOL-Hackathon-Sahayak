import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { normalizeOnboardingAnswers, participantEvents, prefersOnline } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";
import { fetchProgramCatalog } from "@/lib/program-catalog";
import { buildCatalog } from "@/lib/journey/catalog";

export default defineTool({
  name: "get_event",
  title: "Get event details",
  description: "Return one fitting event for the connected participant, including its .ics calendar link.",
  inputSchema: { eventId: z.string().trim().min(1).max(120) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ eventId }, ctx) => withParticipant("get_event", ctx, async ({ participantId, supabase, userId }) => {
    const [programCatalog, onboarding] = await Promise.all([
      fetchProgramCatalog(supabase),
      supabase.from("participant_onboarding").select("answers").eq("user_id", userId).maybeSingle(),
    ]);
    if (onboarding.error) throw new ToolError("Onboarding answers could not be loaded.");
    const answers = normalizeOnboardingAnswers(onboarding.data?.answers ?? {});
    const catalog = buildCatalog(programCatalog.programs, programCatalog.prerequisites);
    const event = participantEvents(participantId, getRequestUrl().origin, 50, catalog, { prefersOnline: prefersOnline(answers), location: answers.location, courseLevel: answers.course_level }).find((e) => e.id === eventId);
    if (!event) throw new ToolError("That event is not in your upcoming list.");
    return { event };
  }),
});
