# Journey Companion — Product Spec for Lovable

Read this whole file before building. It is the source of truth for this project. If a prompt and this file disagree, follow the prompt and tell me about the conflict.

## 1. What we are building

A mobile-first app with **two separate dashboards** that share the same data:

1. **Participant app:** each participant sees and tracks their own journey: where they are, what they've done, what could come next, and messages from their coordinator.
2. **Coordinator app:** coordinators see everyone at a higher level, filtered by city, and send each person a personal follow-up that fits where they are.

- **Core loop:** participant history → journey stage → one suggested next step → drafted message → coordinator edits, approves or skips → message appears in the participant's app → logged.
- **Most important rule:** nothing reaches a participant without a coordinator pressing Approve. There is no automatic sending anywhere in the app.
- **Privacy rule:** a participant only ever sees their own data. They never see other participants, internal stage names like "Going quiet" or "Dormant", reason codes, or draft messages.

Art of Living is a meditation and well-being organization founded by Gurudev Sri Sri Ravi Shankar. The tone of everything in the app must be warm, calm and respectful. It must never feel like a sales or marketing tool.

## 2. Build in phases

Only build the phase I ask for. Do not jump ahead.

| Phase | What to build | Data |
| --- | --- | --- |
| 1 (now) | Both dashboards, fully clickable, with a demo role switcher instead of real logins | Made-up sample data stored inside the app. No database, no AI |
| 2 (later) | Save data and actions; real sign-in with two roles (participant, coordinator) | Lovable Cloud database and authentication |
| 3 (later) | AI drafts the messages | Lovable Cloud built-in AI, or a Claude API key in Cloud Secrets |
| 4 (later) | Polish, README | — |

Write the stage and suggestion logic as separate, plain functions (not mixed into UI components), so they can move to the database later without changing the screens.

## 3. Glossary

- **SKY / Happiness Program:** the introductory course most participants start with. Teaches Sudarshan Kriya breathing.
- **Follow-up:** a weekly group practice session for people who have done SKY.
- **Satsang:** a community gathering with music and meditation.
- **Seva:** volunteer service.
- **Sahaj Samadhi Meditation, Sri Sri Yoga, Art of Silence:** follow-on courses. Art of Silence is a silent retreat course.
- **Coordinator:** the person using this app.

Course names are placeholders until the organizers confirm their list.

## 4. Journey stages

Every participant is in exactly one stage. Check the rules from top to bottom; the first one that matches wins. Use today's date for all "days ago" calculations.

| Order | Stage | Rule | Typical next step |
| --- | --- | --- | --- |
| 0 | Paused | `doNotContact` is true, OR last contact was under 14 days ago | None. Show the card greyed out with "Contacted recently" or "Do not contact" |
| 1 | New after SKY | Finished SKY within the last 45 days | Join a weekly follow-up; home-practice check-in |
| 2 | Building practice | SKY 45–120 days ago AND attended at least 1 follow-up | Sahaj Samadhi or Sri Sri Yoga; a satsang |
| 3 | Actively engaged | 2+ events in the last 60 days, OR a course completed in the last 90 days | Art of Silence retreat; a seva role |
| 4 | Serving | Has a seva role, OR volunteered in the last 90 days | A deeper seva role; teacher-training info; a thank-you |
| 5 | Going quiet | Has attended events before, but none in the last 60–180 days | Gentle check-in; an online group session |
| 6 | Dormant | No event or reply in 180+ days | Low-pressure invite to a free intro or online session |

Keep all thresholds (45, 120, 60, 90, 180, 14 days and the event counts) in one config object so they are easy to change.

### Reason codes and the "why" line

Each rule that fires produces a reason with the number behind it, for example `{ code: "NO_EVENT_60D", days: 74 }`. Turn the reasons into one short, plain sentence shown on the card:

- "Finished SKY 18 days ago; hasn't joined a follow-up yet."
- "Attended 6 follow-ups this spring, none in the last 74 days."
- "Came to 3 satsangs in the last month and finished Sahaj Samadhi in October."

The "why" must always be built from the data, never invented.

## 5. Picking the next step

1. Start from the **next-steps catalog** (section 6).
2. Keep only steps that fit the person's stage, whose prerequisites they have met (for example SKY before Sahaj Samadhi), whose date is in the next 45 days (or that have no date, like a check-in), that are in their city or online, and in their language.
3. Score each remaining step:
   `score = 3 × stageFit + 2 × statedInterest + 1.5 × startsSoon + 1 × nearby − 2 × alreadyDeclined`
4. The top score is the **suggestion**; the second is the **alternate**.
5. **Channel:** use the participant's preferred channel; otherwise the channel they last replied on; otherwise WhatsApp if they have a phone number, then email.

## 6. Data

### Participant
`id, firstName, lastName, city, language, email, phone, preferredChannel ("whatsapp" | "email" | "sms"), doNotContact (boolean), sevaRole (string or null), interests (string[])`

### History
- **CourseCompletion:** `participantId, courseName, completedOn`
- **EventAttendance:** `participantId, eventType ("follow-up" | "satsang" | "retreat" | "online session"), date, city, online`
- **Contact:** `participantId, channel, direction ("out" | "in"), date, outcome ("replied" | "no reply" | "declined" | "enrolled")`

### NextStep (catalog of 15–20 items)
`id, type ("course" | "retreat" | "seva" | "check-in" | "event"), title, startDate (optional), city or "Online", language, prerequisite (optional), stageFit (stage names), link`

### PracticeLog
`participantId, date, minutes (optional)`

### Message (what the participant sees)
`id, participantId, suggestionId, coordinatorName, text, sentAt, reply ("join" | "not now" | null)`

### Suggestion
`id, participantId, nextStepId, alternateNextStepId, channel, why, draftMessage, editedMessage, status ("pending" | "approved" | "skipped"), skipReason, reviewedBy, reviewedAt`

### Sample data for Phase 1
- About 30 participants, with 3–5 in every stage including Paused.
- Cities: Kitchener, Waterloo, Toronto, Mississauga, plus a few online-only.
- Diverse, realistic but obviously fictional names.
- Dates relative to today so stages stay correct whenever the app is opened.
- Every non-paused participant has one pending suggestion with a draft message already written (no AI yet).
- Each demo participant in the role-switcher picker has 1–2 past approved messages and a few practice logs, so their app doesn't look empty.

## 7. Pages

### 7.1 General layout

- **Mobile-first.** Design every screen for a phone (about 390px wide) first. On a laptop, show the same layout centred in a phone-width column (max 480px). The one exception is the coordinator Overview, which may use two columns on screens wider than 900px.
- Make it installable to the phone's home screen (PWA: app name "Journey Companion", saffron theme colour, simple icon).
- **Two separate apps in one project**, each with its own bottom tab bar:
  - Participant app at `/me`: tabs **Home**, **My journey**, **Messages**
  - Coordinator app at `/coordinator`: tabs **Overview**, **People**, **Review** (pending count as a badge on Review)
- **Demo role switcher (Phase 1 only):** a simple start screen with two buttons, "I'm a participant" and "I'm a coordinator". The participant button opens a short picker of 4–5 sample participants (one per stage) so we can demo different journeys. Also add a small "Switch view" link in each app's top bar. In Phase 2 this becomes real sign-in with two roles.

### 7.2 Participant app

Participants must never see internal stage names. Use these friendly names instead:

| Internal stage | What the participant sees |
| --- | --- |
| New after SKY | "Just getting started" |
| Building practice | "Building your practice" |
| Actively engaged | "Going deeper" |
| Serving | "Serving the community" |
| Going quiet, Dormant, Paused | No stage label. Show "Welcome back" wording instead |

**Home tab**
- Greeting with first name ("Good morning, Priya").
- Their friendly stage name and one encouraging line.
- A simple practice tracker: "Log today's practice" button (one tap, optional minutes), and a small 7-day row of dots showing days practised. Never show guilt for missed days.
- **Coming up for you:** up to 3 items from the next-steps catalog that fit their stage, city and language (same filtering as section 5, steps 1–2). Each shows title, date, place or "Online", and an **"I'm interested"** button. Tapping it shows "Thanks, your coordinator will be in touch" and creates an incoming contact the coordinator can see. It does not enrol them in anything.

**My journey tab**
- A visual path of milestones: SKY → Follow-ups → Sahaj Samadhi / Sri Sri Yoga → Art of Silence → Seva. Completed milestones are filled in with their date; the next likely one is highlighted; later ones are faint.
- Below the path, a timeline of what they've done, newest first: courses, events and practice streaks.

**Messages tab**
- Only messages a coordinator has **approved** appear here, newest first, with the coordinator's name and date.
- Each message has two quick replies: "I'd like to join" and "Not right now". Replies show up on the coordinator side as an incoming contact.
- Empty state: "No messages yet. Your coordinator will reach out when something fits."

### 7.3 Coordinator app

A **city selector** sits in the top bar of every coordinator tab: "All cities" or one city. Every number and list on the coordinator side follows it.

**Overview tab** (the higher-level dashboard)
- Four number tiles: People in my cities · Active this month · Going quiet · Waiting for review.
- **Journey funnel:** count of people in each stage, as a simple horizontal bar per stage.
- **By city:** a compact table with one row per city and a column per stage (counts), so coordinators can compare cities. Tapping a city sets the city selector.
- **Needs attention:** the 5 people most worth a follow-up this week (Going quiet first, then New after SKY with no follow-up yet), each with a "Review" button.
- **Recent replies:** the latest "I'm interested" taps and message replies from participants.

**People tab** (individual journeys)
- A row of **stage chips** at the top that scrolls sideways (e.g. "New after SKY · 4", "Going quiet · 5"). Default "All", grouped under stage headings. Internal stage names are fine here.
- A single **vertical list of full-width cards** below. Each card shows:
  - Name and city
  - A highlighted "Next step" line, e.g. "Next step: Sahaj Samadhi · Dec 6"
  - The "why" line in small grey text
  - A small channel icon (WhatsApp, email or SMS)
  - A small profile icon in the top-right corner
- A filter icon opens a bottom sheet with a channel filter (city comes from the top-bar selector).
- Tapping a card or its profile icon opens the **profile sheet**: a bottom sheet with name, stage badge, city, channel, a timeline (courses, events, practice, contacts with outcome), the current suggestion with its why, and a "Review this message" button. Closes by swiping down, tapping X or tapping outside.

**Review tab**
- **One suggestion at a time** as a full-screen card, with "2 of 14" at the top. Swipe or use arrows to move between them.
- Each card shows: name, stage badge, next step, the "why", channel, and the draft message in an editable text box that expands when tapped.
- A **sticky action bar** at the bottom, always visible above the keyboard:
  - **Approve & Send:** marks it approved, records who and when, removes it from the queue, shows "Sent", and puts the message in that participant's Messages tab. (In the demo it is not sent by WhatsApp, SMS or email.)
  - **Use alternate:** swaps in the alternate next step and its draft.
  - **Skip:** asks for a short reason (dropdown: "Not the right time", "Already in touch", "Wrong suggestion", "Other"), then removes it from the queue.
  - **Regenerate:** only in Phase 3. Hide it until then.
- When the queue is empty: "All caught up. No follow-ups waiting."
- After approval, that person moves to the Paused stage ("Contacted recently").

## 8. Message rules (drafts now, AI in Phase 3)

- Address the person by first name. Sign off with the coordinator's first name.
- One clear, gentle invitation. No pressure, guilt or urgency ("last chance", "don't miss out").
- No health or outcome promises.
- Only mention the dates, places and links from the chosen next step. Never invent them.
- WhatsApp and SMS: 400 characters max. Email: 120 words max, plus a short subject line.
- When the AI is added, send it only the first name, stage, why, next step and channel. Never send email addresses, phone numbers or other personal details.

Example (WhatsApp, Going quiet):
> Hi Priya, it's Meera from the Waterloo centre. We've missed you at the Thursday follow-ups! There's a relaxed online group session this Sunday at 7 pm if you'd like to reconnect with your practice. No pressure at all. Here's the link if it suits: [link]. Warmly, Meera

## 9. Design

- **Feel:** calm, warm, uncluttered. Caring, not corporate.
- **Colours:** off-white background `#FAF7F2`, text `#2B2B2B`, muted text `#6B6B6B`, accent saffron `#E8892B` (buttons, highlights, the "Next step" line), soft accent background `#FDF1E4`, borders `#ECE6DD`.
- **Stage badges:** one soft colour per stage; Paused is grey, Going quiet is a soft amber, Dormant a soft blue-grey.
- **Type:** a clean sans-serif (e.g. Inter), 16px body, generous line height.
- **Shapes:** rounded cards (12px radius), light shadows, plenty of white space.
- **Accessibility:** good colour contrast, visible focus states, icons have labels.
- **Mobile:** tap targets at least 44px, body text at least 16px (so phones don't zoom on input), respect the phone's safe areas (notch and home bar), thumb-reachable main buttons at the bottom of the screen, no hover-only actions.
- Test at 390px wide first; laptop shows the same phone-width layout centred.

## 10. Out of scope (do not build)

- Real logins in Phase 1 (use the demo role switcher; assume one coordinator, "Meera", who covers all cities).
- Real sending of email, SMS or WhatsApp. Approved messages only appear in the participant app.
- Participants seeing anyone else's data, or messaging other participants.
- Payments, course registration or calendars.
- Any tabs other than the ones listed in section 7.
- A database or AI before I ask for Phase 2 or 3.
