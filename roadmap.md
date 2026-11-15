# Roadmap

## Done
- Added the latest three-card Participant/Volunteer/Admin demo sign-in without personal names, removed old switchers and identity selectors, fixed Volunteer to Shivam and Participant to Priya, and retained existing participant features through personal-page links. Verified all roles, volunteer-only group, hidden sections, blocked-page redirects, reload, Admin Impact, sign-out and stacked mobile cards; 27 focused tests pass with no browser errors.

## Done
- Renamed the visible app and page titles to Journey.
- Polished phone and tablet layouts with five-tab coordinator navigation, a More sheet, compact region header, participant/program cards, filter sheets, full-screen profile and chat, bottom-sheet dialogs, stacked review actions, larger tap targets, responsive charts and QR check-in. All 19 public content pages checked at 375px without overflow; key pages checked at 430px, 768px and 1280px. Verified filter → profile, edited approval, and check-in readback; 114 tests pass.


## Done
- Grouping by volunteer is now the main way to see people. The People table opens as collapsible sections per volunteer (avatar, city, count, stage bar, "N people going quiet" badge, "Open group" and "Message group") above an Unassigned section with Auto-assign, plus Volunteer / City / None controls and Expand/Collapse all. Membership comes from the most recent program a person did with a volunteer; profiles show the connected volunteer and the reason ("Did Art of Silence with Shivam in October") plus "Also knows", and rows can be dragged to another volunteer. Every volunteer has a group page with what they led, weekly capacity, stage breakdown, members and Sahayak's group suggestions. Group invites are drafted, editable and approved by the coordinator before anything is recorded, and the dashboard card and Sahayak's daily brief lead with the groups that are drifting. Verified in the preview: card copy, group page, approve → activity log entry, auto-assign proposals and the brief line; 114 tests pass.

## Done
- Nothing opens by itself any more. The coordinator's "Meet Sahayak" introduction sits behind a sidebar link (desktop and phone menu) and the participant's intake questions sit behind a "Set up your journey" card on Home; both open only when clicked and close on dismiss. Verified no dialog on load, open on request, and still closed after reload; 100 tests pass.

## Done
- Renamed the page My Progress, added a full month calendar left of the weekly plan with completed-day highlights and month navigation, and moved Your goals into a plus-triggered overlay above Your path. Verified overlay save/readback, calendar completion, desktop/phone layout; the existing URL and demo reset behavior remain unchanged.

## Done
- Weekly progress now owns the weekly plan and daily completion controls. My journey shows weekly/monthly/annual goals left of Your path and Your goals, with weekly goals available in the goal selector and existing quarterly goals preserved. Verified saved goal readback, completion across navigation, desktop/phone layouts and 10 tests; demo state resets on reload.

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

## Done
- Added a browser-local Admin/Volunteer demo sign-in screen and sign-out, with no passwords, authentication or database changes. Admin retains the existing pages; volunteer automatically uses Shivam’s group and My follow-ups, with participant counts/review/inbox records scoped by existing connection membership, a signed-in banner and hidden Impact/Team/Settings navigation. Verified first entry, volunteer group, reload, sign-out, Admin navigation and 614px layout; 12 focused tests passed.
