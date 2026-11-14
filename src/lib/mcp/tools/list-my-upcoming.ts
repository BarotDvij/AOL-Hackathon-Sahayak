import { defineTool } from "@lovable.dev/mcp-js";
import { getRequestUrl } from "@tanstack/react-start/server";
import { participantEvents } from "@/lib/sahayak/core";
import { withParticipant } from "../participant";

export default defineTool({
  name: "list_my_upcoming",
  title: "List my upcoming events",
  description: "List fitting upcoming courses and events for the connected participant, including calendar links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_args, ctx) => withParticipant("list_my_upcoming", ctx, async ({ participantId }) => ({
    events: participantEvents(participantId, getRequestUrl().origin, 20),
  })),
});
