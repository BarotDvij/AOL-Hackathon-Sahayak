import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { normalizeOnboardingAnswers, participantEvents } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";
import { fetchProgramCatalog } from "@/lib/program-catalog";
import { buildCatalog } from "@/lib/journey/catalog";

export default defineTool({
  name: "get_event",
  title: "Get event details",
  description: "Return one fitting event for the connected participant, including its .ics calendar link.",
  inputSchema: { eventId: z.string().trim().min(1).max(120) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ eventId }, ctx) => withParticipant("get_event", ctx, async ({ participantId }) => {
    const event = participantEvents(participantId, getRequestUrl().origin, 50).find((e) => e.id === eventId);
    if (!event) throw new ToolError("That event is not in your upcoming list.");
    return { event };
  }),
});
