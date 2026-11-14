import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/journey/AppShell";
import { useJourney } from "@/lib/journey/store";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Programs · Journey Companion" },
    { name: "description", content: "The Art of Living program catalog, prerequisites, online availability and local-confirmation notes." },
    { property: "og:title", content: "Programs · Journey Companion" },
    { property: "og:description", content: "The Art of Living program catalog, prerequisites, online availability and local-confirmation notes." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ProgramsPage,
});

const label = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

function ProgramsPage() {
  const { programCatalog } = useJourney();
  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-[32px] font-normal text-primary">Programs</h1>
        <p className="mt-1 text-sm text-muted-foreground">{programCatalog.programs.length} programs from the uploaded catalog. Course suggestions use these records.</p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Level</th><th className="px-4 py-3 font-medium">Online option</th><th className="px-4 py-3 font-medium">Prerequisites</th><th className="px-4 py-3 font-medium">Local availability</th><th className="px-5 py-3 font-medium">Source</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {programCatalog.programs.map((program) => (
              <tr key={program.id} className="align-top">
                <td className="px-5 py-4 font-medium text-primary">{program.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{label(program.level)}</td>
                <td className="px-4 py-4 text-muted-foreground">{label(program.online_option)}</td>
                <td className="max-w-[330px] px-4 py-4 text-muted-foreground">{program.prerequisite_text}</td>
                <td className="px-4 py-4">{program.needs_local_check ? <span className="inline-flex rounded-full bg-sun-orange px-2.5 py-1 text-xs font-semibold text-primary">Confirm locally</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                <td className="px-5 py-4">{program.source_url ? <a href={program.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-purple hover:underline">Source page<ExternalLink className="size-3" aria-hidden /></a> : <span className="text-xs text-muted-foreground">Not provided in CSV</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">Recommendations check age, prerequisites and suggested timing. The app offers reminders and encouragement only; techniques are taught by certified teachers.</p>
    </AppShell>
  );
}
