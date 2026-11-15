# Responsive UX audit and fix plan

Branch: `ux/responsive-audit` · Audited 2026-11-15 at 390px (phone), 768px (tablet), 1440px (desktop) across all 17 coordinator and participant routes, with Playwright screenshots, a horizontal-overflow check and a tap-target check.

**Status (2026-11-15, branch `ux/responsive-fixes`):**
- #1, #2, #3 and the coordinator "Switch view" on phone (#5) were already fixed upstream (`origin/main`: card list, `min-w-0`, bottom nav).
- Done on this branch: #7 (the add-goal "+" moved into the Goals card header; the empty gap removed) and #4 (card list shown up to `lg`, because the sidebar appears at `md` and squeezed the table to about 500px; Stage column widened).
- Left as is: #6 (the floating Messages button overlaps content only while scrolling, and the last content clears it) and #8 (tap-target polish).

## Verdict

- **Desktop (1440px):** good on every route. No changes needed.
- **Phone and tablet:** most pages are fine (Impact, Sessions, Team, Programs, Review, Inbox, Activity, Settings, every `/me` page). **The participants table is broken on phone**, and it appears on the two most-used screens: Dashboard and Participants.
- **Architecture:** keep one responsive codebase. Do **not** build separate mobile and desktop apps (see the last section).

## Issues found (by priority)

### P0: broken on phone

1. **The Dashboard scrolls sideways by 273px.** In `src/routes/index.tsx:56`, the children of `grid lg:grid-cols-3` have no `min-w-0`. The `truncate` text in `GroupAttentionList` and `UpcomingList` pushes the grid track out to 663px, so "Volunteer groups needing attention" and "Upcoming opportunities" run off the screen.
   - Fix: add `min-w-0` to both grid children (or add `grid-cols-1` to the grid). One line.

2. **The participants table is unreadable on phone** (`ParticipantsTable.tsx`, used by Dashboard, Participants and the group pages). A 6-column `table-fixed` is squeezed into about 340px:
   - Names shrink to one letter ("P…", "R…").
   - Stage badges overlap the "Last contact" text.
   - The volunteer avatar overlaps the city.
   - The **Review** button is cut off ("Re"), so the main action cannot be reached.
   - Fix (recommended): below `md`, show each row as a stacked card in the same `<tr>`, using responsive classes. Line 1 is the name and city. Line 2 is the stage badge and next step. The Review button sits on the right. Hide "Last contact" and "Channel" below `md`, and hide `<thead>` below `md`. This is the same component and data with no second code path, only CSS. About 15 lines change.
   - Cheaper fallback: add `min-w-[720px]` to the `<table>`. It is already inside `overflow-x-auto`, so the table scrolls sideways. This takes one line, but the UX is worse.

3. **Group headers collapse on phone** (`ParticipantsTable.tsx:154`). "Open group" and "Message group" share a row with the name block, which shrinks until "Waterloo · English · 6 people" wraps one word per line and overlaps "Open group".
   - Fix: on phones, put the actions on their own row (`basis-full sm:basis-auto` on the action wrapper, or `min-w-[12rem]` on the name button).

### P1: rough edges

4. **Tablet (768–1023px):** stage badges such as "Building practice" and "Actively engaged" overflow the 15% Stage column into "Last contact".
   - Fix: give the badge `max-w-full truncate`, or widen the Stage column to 18% and make "Last contact" narrower. Fix #2 covers part of this if the card layout runs up to `md`.
5. **The coordinator phone header has no "Switch view".** It only appears in the desktop top bar (`AppShell.tsx`). The participant view has it on every size. Fix: add the link to the mobile Sheet menu.
6. **The participant floating message button covers content.** On phone it sits at `bottom-20 right-4` (`ParticipantMessageBox.tsx:12`), right above the bottom nav. It covers the edge of "Log today's practice", the "Your path" list and the Settings city input. Fix: add bottom padding to the participant `<main>` on phone so the last content clears the button, or move the button into the bottom nav as a 5th "Messages" item. The second option also makes Messages findable, because today Messages has no nav entry.
7. **My journey has a large empty gap** below the page header on phone and tablet, and the "+" (add goal) button floats on its own, detached from "Goals by timeframe". Fix: move "+" into the card header.

### P2: touch polish

8. **Tap targets under 32px on touch:** the Review buttons (`h-7`, 28px), the stage legend buttons (16px tall), the switches (36×20), "Add to calendar" and "Switch view" (16px tall). Fix: on coarse pointers only, use `pointer-coarse:` variants (Tailwind v4) or add `py-2` hit-area padding. Desktop density does not change.

## Architecture recommendation

**Keep a single responsive codebase. Do not split into separate mobile and desktop apps or views.**

- Both shells (`AppShell`, `ParticipantShell`) already handle both sizes correctly: a sidebar at `lg` and up, and a sheet menu or bottom nav below. Every page except one component already reflows.
- All the real defects above are CSS-level: one missing `min-w-0`, one table without a narrow layout, and flex-wrap tuning. None needs separate data flow or routing.
- A separate mobile app would duplicate the store, translations and the "nothing is sent without Approve" safeguards. AGENTS.md explicitly wants the views kept visually consistent "without coupling their data", which one responsive tree already does.

Small structural items worth doing:

- **Breakpoint consistency.** The shells switch at `lg` (1024px), but `useIsMobile` (`src/hooks/use-mobile.tsx`) uses 768px and is only used by the unused shadcn `sidebar.tsx`. Pick `lg` as the "mobile shell" boundary and leave it there. Do not add JS-based layout switching. CSS breakpoints are enough and avoid SSR hydration flicker.
- **Wide tables:** `ParticipantsTable` is the only data table that needs a narrow layout. Fix it in place (#2) rather than adding a separate `MobileParticipantList`.
- **Regression guard:** keep the overflow check as one Playwright smoke test. It visits each route at 390px and asserts `scrollWidth <= clientWidth`. This would have caught #1. Optional, and only if you want it in CI.

## Proposed implementation order

1. #1, #2, #3: the phone blockers. These touch `routes/index.tsx` and `ParticipantsTable.tsx` only.
2. #4, #5, #6, #7.
3. #8, if wanted.
4. Re-run the 3-width screenshot and overflow audit, and attach before and after images.

## Notes

- `main` had uncommitted local edits (`README.md`, `DailyBrief.tsx`, `sahayak.ts`, `routes/index.tsx`) and was 2 commits behind `origin/main` when this branch was cut. Those edits came along onto this branch untouched. Commit or stash them before implementation begins.
- This is a Lovable-synced repo. Nothing here touches DB, generated files or secrets.
