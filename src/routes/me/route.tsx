import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DemoParticipantProvider } from "@/components/participant/DemoParticipantContext";
import { ParticipantShell } from "@/components/participant/ParticipantShell";

export const Route = createFileRoute("/me")({
  component: ParticipantLayout,
});

function ParticipantLayout() {
  return <DemoParticipantProvider><ParticipantShell><Outlet /></ParticipantShell></DemoParticipantProvider>;
}
