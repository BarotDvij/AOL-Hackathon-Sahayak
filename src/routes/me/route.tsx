import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ParticipantPicker } from "@/components/participant/ParticipantPicker";
import { ParticipantShell } from "@/components/participant/ParticipantShell";
import { getMyJourney } from "@/lib/participant.functions";

export const Route = createFileRoute("/me")({
  loader: () => getMyJourney(),
  component: ParticipantLayout,
});

function ParticipantLayout() {
  const data = Route.useLoaderData();
  if (!data.linked) return <ParticipantPicker options={data.options} />;
  return <ParticipantShell><Outlet /></ParticipantShell>;
}
