# Roadmap

## Done
- Journey dashboard: at-a-glance tiles, stage cards that filter, search, city + channel filters, follow-up list sorted with drifting people first.
- Participant profile sheet: journey timeline, suggested next step, plain-language reasons, "choose a different step", link into the review queue.
- Message review: one draft at a time, channel change, editable text, Approve / Edit / Skip with an optional saved reason.
- Review queue: "x of y reviewed" progress and an "All caught up!" empty state.
- Activity log: what was approved, edited or skipped, and when.
- Low-data rule: one course and nothing else → gentle check-in instead of a confident recommendation.
- Tests: 14 passing (stage thresholds, low-data check-in, follow-up priority, summary counts, skip reason, approved message lands with the right person).

## In progress
- Import the uploaded 17-row programs catalog into Lovable Cloud with exact source text and structured prerequisite alternatives; replace placeholder course recommendations with prerequisite-, age-, timing- and online-preference-aware program rules.
- Add local-confirmation notes, catalog-based practice reminders, and a read-only coordinator Programs route; verify imported row counts, unmapped columns/links, tests and the participant/coordinator flows.

## Done
- Sahayak helper: first-time question, sidebar On/Off plus a settings page (four switches, nudge frequency, reset demo), daily brief on the dashboard, inbox with "waiting N days" flags and editable suggested replies, reminder bell with Do it now / snooze / dismiss, floating Ask Sahayak panel answering from the records, and a purple "Suggested by Sahayak" marker on everything it offers. 29 tests passing.
- Visual restyle to the hackathon palette (navy / purple / sun orange / sun yellow, brand gradient in the dashboard banner and sidebar logo area only) and typography (Lora titles, Poppins headings and numbers, Inter body). Layout unchanged.

## Done
- Participant Sahayak: no-login participant demo using Priya, with Home, My journey, Messages and Settings; shared journey core; six-question onboarding in-app and through MCP; local demo practice, interests, goals and replies; optional OAuth Muse connection remains available outside demo mode.
- Participant styling matches coordinator colours, typography, desktop sidebar, greeting banner, white cards and shared controls; mobile bottom navigation retained. Verified four pages on desktop and mobile, practice logging and onboarding choices, with 13 relevant tests passing.
- Participant MCP: eleven tools, stateless streamable HTTP at `/mcp`, OAuth client-claim enforcement, caller-scoped RLS, shared audit helper and a reserved hashed-key table for future machine access.
- Verified: 45 journey/participant tests plus audit tests, clean typecheck and builds, real participant flow after reload, RLS isolation, safe friendly wording, nine database-backed tool handlers with one audit row each, calendar downloads, coordinator summary display and approval persistence. External OAuth handshake remains a post-publish check.

## Open
- External MCP client connection needs one final check after publishing; the sandbox's hosted login bridge prevented completing that handshake locally.
- The floating "Ask Sahayak" button sits over the bottom-right of the participants table while scrolling (the spec asked for bottom right); move or shrink it if it gets in the way.
- Catalog dates, course names and centre cities are placeholders; real ones needed before coordinators use it.
- Coordinator and no-login participant demo state reset on reload; authenticated participant/MCP records remain protected in Lovable Cloud for later account-based use.
