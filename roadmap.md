# Roadmap

## In progress
- Move weekly plan to Weekly progress; add weekly/monthly/annual goals card left of the existing path and goals.

## Done
- Removed Practice, play controls and all activity guides. My journey now offers one Mark as done per day with weekly progress; verified independent days, navigation readback, phone layout and 12 tests. Demo marks reset on reload.

## Done
- Messages moved to bottom right; Practice has day-by-day play controls and step-by-step preparation guides. Marking an activity done updates both Practice and My journey immediately. Verified completion readback, desktop/phone layout and 12 tests. Demo progress resets on reload; guides do not teach course techniques and no verified instructional videos are available.

## Done
- Participant message box now shows clickable sender initials/name/latest-message previews and chronological chat bubbles with a typed reply composer. Verified reply readback, updated previews, page navigation, Enter-to-send and phone layout; six participant tests pass. Typed replies remain local demo state and reset on reload.

## Done
- Replaced participant Messages navigation with a bottom-left openable message box, keeping replies and the direct URL. Verified open/close, reply readback, page navigation, and desktop/phone layouts; five participant tests pass.

## Done
- Added editable location intake and Montréal official-source event listings checked November 14, 2026; graduate-only follow-ups respect intake, dated occurrences expire, and official calendar/details links stay available. This is a verified snapshot, not automatic live synchronization. Verified intake save → My journey → Home, calendar download and phone layout; 19 relevant tests pass.

## Done
- Participant Home: an "Upcoming events" card lists the person's own fitting events in date order — dated ones show a date chip and an "Add to calendar" link that downloads a real .ics, undated catalog options show a clock chip and their suggested timing, and anything needing local confirmation says "Confirm with your centre". Long lists collapse behind "Show all". Verified in the preview; 10 participant tests pass.

## Done
- Participant view: the "Use Sahayak with Muse" switch sits in the sidebar and Settings on one shared state. Switching it on opens a consent prompt headed "Your Sahayak lives in your Muse and can only use what you tick here", where each of the five access items has its own tick box and "Allow all" ticks every one; nothing turns on until at least one item is ticked, and the button says how many are allowed. While on, Settings lists what Muse may use with "Change what Muse may use" to re-tick, and switching off clears the list. Verified in the preview and by 10 participant tests.

## Done
- Participant view: the "Use Sahayak with Muse" switch now sits in the sidebar as well as Settings, both driven by one shared state, and switching it on opens a consent prompt listing exactly what Muse may use (practice log, goals and rhythm, upcoming events and calendar links, coordinator-approved messages, a participant-approved summary marked "via Muse") plus what it never does (sends nothing, shows nothing to others, can be turned off any time). Muse stays off until "Yes, allow and turn on"; "Not now" leaves it off, and switching off never asks. Verified in the preview and by 4 participant tests.

## Done
- Added Impact, session QR check-in and summaries, shared guest/attendance records, message outcome tracking and gentle second drafts, five volunteers with reviewed assignment proposals and capacity limits, and English/French interface controls and message templates. All 74 tests pass; live check-in, guest confirmation, assignment confirmation, French review approval and Impact verified.

## Done
- Journey dashboard: at-a-glance tiles, stage cards that filter, search, city + channel filters, follow-up list sorted with drifting people first.
- Participant profile sheet: journey timeline, suggested next step, plain-language reasons, "choose a different step", link into the review queue.
- Message review: one draft at a time, channel change, editable text, Approve / Edit / Skip with an optional saved reason.
- Review queue: "x of y reviewed" progress and an "All caught up!" empty state.
- Activity log: what was approved, edited or skipped, and when.
- Low-data rule: one course and nothing else → gentle check-in instead of a confident recommendation.
- Program catalog: 17 courses and 18 prerequisite links imported into Lovable Cloud; course suggestions check prerequisites, age, suggested timing and online preference, with local-confirmation notes and catalog-based practice reminders.
- Coordinator Programs list: all 17 imported courses, levels, online options, original prerequisite text, local-confirmation badges and source availability.
- Tests: 62 passing, including stage thresholds, program prerequisites and alternatives, age separation, timing, online ranking, reminders, participant demo and coordinator flows.

## Done
- Sahayak helper: first-time question, sidebar On/Off plus a settings page (four switches, nudge frequency, reset demo), daily brief on the dashboard, inbox with "waiting N days" flags and editable suggested replies, reminder bell with Do it now / snooze / dismiss, floating Ask Sahayak panel answering from the records, and a purple "Suggested by Sahayak" marker on everything it offers. 29 tests passing.
- Visual restyle to the hackathon palette (navy / purple / sun orange / sun yellow, brand gradient in the dashboard banner and sidebar logo area only) and typography (Lora titles, Poppins headings and numbers, Inter body). Layout unchanged.

## Done
- Participant Sahayak: no-login participant demo using Priya, with Home, My journey, Messages and Settings; shared journey core; six-question onboarding in-app and through MCP; local demo practice, interests, goals and replies; optional OAuth Muse connection remains available outside demo mode.
- Participant styling matches coordinator colours, typography, desktop sidebar, greeting banner, white cards and shared controls; mobile bottom navigation retained. Verified four pages on desktop and mobile, practice logging and onboarding choices, with 13 relevant tests passing.
- Participant MCP: eleven tools, stateless streamable HTTP at `/mcp`, OAuth client-claim enforcement, caller-scoped RLS, shared audit helper and a reserved hashed-key table for future machine access.
- Verified: 45 journey/participant tests plus audit tests, clean typecheck and builds, real participant flow after reload, RLS isolation, safe friendly wording, nine database-backed tool handlers with one audit row each, calendar downloads, coordinator summary display and approval persistence. External OAuth handshake remains a post-publish check.

## Open
- QR demo check-ins synchronize only between tabs in the same browser; cross-device live attendance needs shared session storage and a secure public check-in service. Demo attendance and assignments reset on reload.
- French messages use pre-written templates; English reference text does not translate coordinator edits, and record descriptions/catalog text remain in their original language.
- External MCP client connection needs one final check after publishing; the sandbox's hosted login bridge prevented completing that handshake locally.
- The floating "Ask Sahayak" button sits over the bottom-right of the participants table while scrolling (the spec asked for bottom right); move or shrink it if it gets in the way.
- Every CSV Source cell contains an organization or listing name rather than a URL, so program source links remain unavailable until real URLs are supplied.
- Coordinator and no-login participant demo state reset on reload; authenticated participant/MCP records remain protected in Lovable Cloud for later account-based use.
