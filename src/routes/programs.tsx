import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/journey/AppShell";
import { useJourney } from "@/lib/journey/store";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Programs · Journey" },
    { name: "description", content: "The Art of Living program catalog, prerequisites, online availability and local-confirmation notes." },
    { property: "og:title", content: "Programs · Journey" },
    { property: "og:description", content: "The Art of Living program catalog, prerequisites, online availability and local-confirmation notes." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ProgramsPage,
});

const label = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

function ProgramsPage() {
  const {t} = useLanguage();
  const { programCatalog } = useJourney();
  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-[32px] font-normal text-primary">{t('Programs')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{programCatalog.programs.length} programs from the uploaded catalog. Course suggestions use these records.</p>
      </header>
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card shadow-soft md:block">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr><th className="px-5 py-3 font-medium">{t('Name')}</th><th className="px-4 py-3 font-medium">{t('Level')}</th><th className="px-4 py-3 font-medium">{t('Online option')}</th><th className="px-4 py-3 font-medium">{t('Prerequisites')}</th><th className="px-4 py-3 font-medium">{t('Local availability')}</th><th className="px-5 py-3 font-medium">{t('Source')}</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {programCatalog.programs.map((program) => (
              <tr key={program.id} className="align-top">
                <td className="px-5 py-4 font-medium text-primary">{program.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{label(program.level)}</td>
                <td className="px-4 py-4 text-muted-foreground">{label(program.online_option)}</td>
                <td className="max-w-[330px] px-4 py-4 text-muted-foreground">{program.prerequisite_text}</td>
                <td className="px-4 py-4">{program.needs_local_check ? <span className="inline-flex rounded-full bg-sun-orange px-2.5 py-1 text-xs font-semibold text-primary">{t('Confirm locally')}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                <td className="px-5 py-4">{program.source_url ? <a href={program.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-purple hover:underline">{t('Source page')}<ExternalLink className="size-3" aria-hidden /></a> : <span className="text-xs text-muted-foreground">{t('Not provided in CSV')}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">{programCatalog.programs.map((program) => <article key={program.id} className="rounded-lg border border-border bg-card p-4 shadow-soft">
        <h2 className="font-heading text-base font-semibold text-primary">{program.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{label(program.level)} · {t("Online option")}: {label(program.online_option)}</p>
        <p className="mt-3 text-sm"><span className="font-semibold">{t("Prerequisites")}: </span>{program.prerequisite_text}</p>
        {program.needs_local_check && <p className="mt-3 w-fit rounded-full bg-sun-orange px-2 py-1 text-sm font-semibold text-primary">{t("Confirm locally")}</p>}
        {program.source_url ? <a href={program.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-purple">{t("Source page")}<ExternalLink className="size-4" /></a> : <p className="mt-3 text-sm text-muted-foreground">{t("Not provided in CSV")}</p>}
      </article>)}</div>
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">Recommendations check age, prerequisites and suggested timing. The app offers reminders and encouragement only; techniques are taught by certified teachers.</p>
    </AppShell>
  );
}
