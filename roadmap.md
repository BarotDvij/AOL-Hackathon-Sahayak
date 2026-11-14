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
(none)

## Done
- Sahayak helper: first-time question, sidebar On/Off plus a settings page (four switches, nudge frequency, reset demo), daily brief on the dashboard, inbox with "waiting N days" flags and editable suggested replies, reminder bell with Do it now / snooze / dismiss, floating Ask Sahayak panel answering from the records, and a purple "Suggested by Sahayak" marker on everything it offers. 29 tests passing.
- Visual restyle to the hackathon palette (navy / purple / sun orange / sun yellow, brand gradient in the dashboard banner and sidebar logo area only) and typography (Lora titles, Poppins headings and numbers, Inter body). Layout unchanged.

## Open
- Participant-facing screens (home, my journey, messages) from the earlier request are not in this build — the store already keeps each person's own messages and practice log, so they can be added on top. Waiting on a go-ahead.
- Catalog dates, course names and centre cities are placeholders; real ones needed before coordinators use it.
- State resets on a page reload (in-memory Phase 1); persistence is a later phase.
