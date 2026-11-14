<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Journey stage, reason and suggestion rules enter through `src/lib/sahayak/core.ts` (thresholds stay in `src/lib/journey/config.ts`); coordinator UI, participant server functions and every MCP tool use that same entry point so their answers agree.
- Coordinator and public participant demo data stay in memory with dates relative to today; account-based participant onboarding, practice, goals, interests, messages and summaries persist in Lovable Cloud behind OAuth and RLS. No sending ever happens without a coordinator's Approve.
- Coordinator screens are one route per section (dashboard, review, activity) inside `AppShell`; add a section as a new route plus a `NAV` entry, not as a tab inside an existing page, so every section keeps its own URL.
- Public no-login participant screens live under `/me` and use the fixed fictional participant through `DemoParticipantContext`; internal stage names, reason codes, drafts and other people's records never enter those DTOs, and all demo changes reset on reload.
- ParticipantShell mirrors the coordinator desktop sidebar and shared design-system controls while retaining bottom navigation on smaller screens, so both views stay visually consistent without coupling their data.
- The participant MCP server uses `defineMcp` at `/mcp`, one tool per file under `src/lib/mcp/tools/`, verified OAuth with a required client claim, caller-scoped database clients and `recordSahayakCall`; never use admin clients or copied app-session tokens there.
- Sahayak's model call lives in a server function (`src/lib/sahayak.functions.ts`) that the browser reaches only through the RPC, and every screen keeps a locally computed, record-based answer as the fallback so inference is never required for the app to work.
