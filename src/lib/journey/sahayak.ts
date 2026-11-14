import { JOURNEY_CONFIG as C } from "./config";
import { contactText, daysSinceActivity, daysSinceLastContact } from "./contact";
import { daysSince, isoDaysFrom, parseIso, today } from "./dates";
import { needsReply, type InboxMessage } from "./inbox-seed";
import { draftMessage } from "./messages";
import type { History, NextStep, Participant, StageId, Suggestion } from "./types";

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

export type Nudge = "gentle" | "normal" | "frequent";
export type SahayakFeature = "dailyBrief" | "replyReminders" | "followUpReminders" | "autoDraft";

export interface SahayakState {
  /** Has the coordinator answered the first-time question yet? */
  decided: boolean;
  on: boolean;
  features: Record<SahayakFeature, boolean>;
  nudge: Nudge;
  /** ISO date the daily brief was dismissed for, so it can come back tomorrow. */
  briefDismissedOn: string | null;
  /** reminder id -> ISO date it is allowed to appear again. */
  snoozed: Record<string, string>;
  dismissed: string[];
}

export const SAHAYAK_DEFAULTS: SahayakState = {
  decided: false,
  on: false,
  features: { dailyBrief: true, replyReminders: true, followUpReminders: true, autoDraft: true },
  nudge: "normal",
  briefDismissedOn: null,
  snoozed: {},
  dismissed: [],
};

/** How many reminders each nudge setting is willing to show. */
export const NUDGE_LIMIT: Record<Nudge, number> = { gentle: 3, normal: 6, frequent: 12 };
export const NUDGE_LABEL: Record<Nudge, string> = { gentle: "Gentle", normal: "Normal", frequent: "Frequent" };
export const NUDGE_HELP: Record<Nudge, string> = {
  gentle: "Only the few things that matter most today.",
  normal: "A balanced list — about six things at a time.",
  frequent: "Everything Sahayak notices, up to a dozen.",
};

export const FEATURE_LABEL: Record<SahayakFeature, string> = {
  dailyBrief: "Daily brief",
  replyReminders: "Reply reminders",
  followUpReminders: "Follow-up reminders",
  autoDraft: "Auto-draft messages",
};

export const FEATURE_HELP: Record<SahayakFeature, string> = {
  dailyBrief: "A short list at the top of your dashboard each morning.",
  replyReminders: "A nudge when someone has written and is still waiting for you.",
  followUpReminders: "A nudge when someone hasn't been in touch for a while.",
  autoDraft: "Writes a reply you can read and edit. Nothing goes out without your approval.",
};

/* ------------------------------------------------------------------ */
/*  Shared shapes                                                      */
/* ------------------------------------------------------------------ */

/** What Sahayak is allowed to look at: the same rows the coordinator sees. */
export interface SahayakPerson {
  participant: Participant;
  history: History;
  stage: StageId;
  suggestion: Suggestion | null;
}
export interface UpcomingItem { step: NextStep; suggestedFor: number }

/** Every page Sahayak is allowed to point the coordinator at. */
export type SahayakLinkTo = "/" | "/inbox" | "/review" | "/participants" | "/activity" | "/sahayak" | "/impact";

export interface BriefItem { id: string; text: string; why: string; to: SahayakLinkTo; actionLabel: string }

export type ReminderKind = "unanswered" | "new-sky" | "going-quiet" | "upcoming-event";
export interface Reminder {
  id: string;
  kind: ReminderKind;
  title: string;
  why: string;
  to: SahayakLinkTo;
  actionLabel: string;
  participantId?: string | undefined;
}

export interface SahayakRow { name: string; detail: string; to?: SahayakLinkTo | undefined }
export interface SahayakAnswer { text: string; rows: SahayakRow[]; action?: { label: string; to: SahayakLinkTo } | undefined }

/** Compact, plain-language picture of the whole centre, handed to the model. */
export interface SahayakSnapshotRow { name: string; city: string; stage: string; lastContact: string; nextStep: string }

export const SAHAYAK_CHIPS = [
  "Who needs a follow-up this week?",
  "Draft messages for everyone going quiet",
  "Who in Kitchener has not come in 2 months?",
  "Summarize my week",
];

/** A message is "waiting" once it has sat unanswered for two days or more. */
export const WAITING_AFTER_DAYS = 2;
export const waitingDays = (m: InboxMessage, now = today()) => (needsReply(m) ? daysSince(m.date, now) : null);

const weekdayOf = (iso: string) => parseIso(iso).toLocaleDateString("en-CA", { weekday: "long" });
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------ */
/*  Daily brief                                                        */
/* ------------------------------------------------------------------ */

export interface BriefInput {
  views: SahayakPerson[];
  upcoming: UpcomingItem[];
  inbox: InboxMessage[];
  now?: Date | undefined;
}

/** Three to five short, honest lines drawn straight from the data. */
export function briefItems({ views, upcoming, inbox, now = today() }: BriefInput): BriefItem[] {
  const items: BriefItem[] = [];

  const waiting = inbox.filter(needsReply).sort((a, b) => a.date.localeCompare(b.date));
  const oldest = waiting[0];
  if (oldest && daysSince(oldest.date, now) >= WAITING_AFTER_DAYS) {
    items.push({
      id: "brief-waiting",
      text: `You have not replied to ${oldest.from} in ${plural(daysSince(oldest.date, now), "day")}.`,
      why: `Their message arrived on ${oldest.date} and is still marked "needs reply".`,
      to: "/inbox", actionLabel: "Reply",
    });
  }

  const quiet = views.filter((v) => v.stage === "quiet");
  if (quiet.length) {
    items.push({
      id: "brief-quiet",
      text: `${plural(quiet.length, "person")} ${quiet.length === 1 ? "is" : "are"} going quiet and could use a check-in.`,
      why: `No one in this group has come to anything for ${C.quietMinDays} to ${C.quietMaxDays} days.`,
      to: "/review", actionLabel: "Review",
    });
  }

  const answered = views.filter((v) => v.history.contacts.some((c) => c.direction === "in" && c.outcome === "replied" && daysSince(c.date, now) < 7));
  if (answered.length) {
    items.push({
      id: "brief-replies",
      text: `${plural(answered.length, "participant")} ${answered.length === 1 ? "has" : "have"} replied to your messages this week.`,
      why: "They wrote back after we reached out — a quick reply keeps the door open.",
      to: "/inbox", actionLabel: "Reply",
    });
  }

  const newSky = views.filter((v) => {
    const first = v.history.courses.map((c) => c.completedOn).sort()[0];
    return first !== undefined && daysSince(first, now) <= 14 && daysSinceLastContact(v.history) === null;
  });
  if (newSky.length) {
    items.push({
      id: "brief-newsky",
      text: `${plural(newSky.length, "person")} finished ${C.skyCourseName} in the last two weeks and hasn't heard from us yet.`,
      why: "The first fortnight after a course is when a welcome message matters most.",
      to: "/review", actionLabel: "Review",
    });
  }

  const soon = upcoming.filter((u) => u.suggestedFor > 0).sort((a, b) => (a.step.startDate ?? "9").localeCompare(b.step.startDate ?? "9"))[0];
  if (soon?.step.startDate) {
    items.push({
      id: "brief-event",
      text: `${soon.step.shortTitle} is on ${weekdayOf(soon.step.startDate)}. ${plural(soon.suggestedFor, "person")} ${soon.suggestedFor === 1 ? "is" : "are"} suggested.`,
      why: "These people were picked for this one because it fits where they are.",
      to: "/review", actionLabel: "Review",
    });
  }

  const dormant = views.filter((v) => v.stage === "dormant");
  if (dormant.length) {
    items.push({
      id: "brief-dormant",
      text: `${plural(dormant.length, "person")} ${dormant.length === 1 ? "has" : "have"} not been in touch for ${C.dormantDays} days or more.`,
      why: "A warm, low-pressure note is usually enough to reopen the conversation.",
      to: "/review", actionLabel: "Review",
    });
  }

  return items.slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Reminders                                                          */
/* ------------------------------------------------------------------ */

export interface ReminderInput extends BriefInput { state: SahayakState }

/**
 * Everything Sahayak thinks the coordinator might forget, oldest and most urgent first.
 * A reminder only ever points at work — it never sends, approves or changes anyone's record.
 */
export function buildReminders({ views, upcoming, inbox, state, now = today() }: ReminderInput): Reminder[] {
  if (!state.on) return [];
  const out: Reminder[] = [];

  if (state.features.replyReminders) {
    for (const m of inbox.filter(needsReply).sort((a, b) => a.date.localeCompare(b.date))) {
      const d = daysSince(m.date, now);
      if (d < WAITING_AFTER_DAYS) continue;
      out.push({
        id: `rem-in-${m.id}`, kind: "unanswered",
        title: `${m.from} has been waiting ${plural(d, "day")} for a reply`,
        why: `"${m.subject}" arrived ${d} ${d === 1 ? "day" : "days"} ago and is still unanswered.`,
        to: "/inbox", actionLabel: "Reply now", participantId: m.participantId,
      });
    }
  }

  if (state.features.followUpReminders) {
    for (const v of views.filter((x) => x.stage === "quiet" || x.stage === "dormant")) {
      out.push({
        id: `rem-quiet-${v.participant.id}`, kind: "going-quiet",
        title: `${v.participant.firstName} ${v.participant.lastName} has gone quiet`,
        why: contactText(v.history),
        to: "/review", actionLabel: "Review message", participantId: v.participant.id,
      });
    }

    for (const v of views) {
      const first = v.history.courses.map((c) => c.completedOn).sort()[0];
      if (first === undefined || daysSince(first, now) > 14) continue;
      if (daysSinceLastContact(v.history) !== null) continue;
      out.push({
        id: `rem-sky-${v.participant.id}`, kind: "new-sky",
        title: `${v.participant.firstName} finished ${C.skyCourseName} ${plural(daysSince(first, now), "day")} ago`,
        why: "They haven't heard from us since the course — a short welcome keeps the practice alive.",
        to: "/review", actionLabel: "Review message", participantId: v.participant.id,
      });
    }

    for (const u of upcoming.filter((x) => x.suggestedFor > 0).sort((a, b) => (a.step.startDate ?? "9").localeCompare(b.step.startDate ?? "9"))) {
      out.push({
        id: `rem-event-${u.step.id}`, kind: "upcoming-event",
        title: `${u.step.shortTitle} ${u.step.startDate ? `is on ${weekdayOf(u.step.startDate)}` : "is open"}`,
        why: `${plural(u.suggestedFor, "person")} ${u.suggestedFor === 1 ? "is" : "are"} suggested for it and haven't been invited yet.`,
        to: "/review", actionLabel: "Review message",
      });
    }
  }

  const visible = out.filter((r) => {
    if (state.dismissed.includes(r.id)) return false;
    const until = state.snoozed[r.id];
    return !until || daysSince(until, now) >= 0;
  });

  return visible.slice(0, NUDGE_LIMIT[state.nudge]);
}

/* ------------------------------------------------------------------ */
/*  Suggested replies                                                  */
/* ------------------------------------------------------------------ */

const STEP_KEYWORDS: [RegExp, string[]][] = [
  [/sahaj/i, ["sahaj"]],
  [/satsang|bring a friend|friend/i, ["satsang"]],
  [/yoga/i, ["yoga"]],
  [/silence|retreat/i, ["retreat", "silence"]],
  [/intro|free/i, ["intro"]],
  [/follow-?up/i, ["follow-up"]],
];

/** The next thing in the catalogue that answers this message, if any. */
function stepFor(message: InboxMessage, p: Participant, catalog: NextStep[]): NextStep | undefined {
  const text = `${message.subject} ${message.preview}`;
  for (const [re, tags] of STEP_KEYWORDS) {
    if (!re.test(text)) continue;
    const hit = catalog
      .filter((s) => s.tags.some((t) => tags.includes(t)) || tags.some((t) => s.shortTitle.toLowerCase().includes(t)))
      .filter((s) => s.city === "Online" || s.city === p.city)
      .sort((a, b) => (a.startDate ?? "9").localeCompare(b.startDate ?? "9"))[0];
    if (hit) return hit;
  }
  return undefined;
}

/** A warm reply the coordinator can read, edit and approve. Never sent on its own. */
export function suggestedReply(message: InboxMessage, p: Participant, catalog: NextStep[]): string {
  const step = stepFor(message, p, catalog);
  if (p.language === "French") return `Bonjour ${p.firstName}, merci pour votre message. ${step ? `Vous seriez bienvenue à ${step.shortTitle}. ${step.link ? `Voici le lien : ${step.link}` : ""}` : "J’ai bien noté votre demande et je reviendrai vers vous avec les détails."} Sans aucune pression.\n\nChaleureusement, ${C.coordinatorName}`;
  const hello = `Hi ${p.firstName}, thanks for writing.`;
  if (!step) {
    return `${hello} I've made a note and I'll come back to you with the details shortly. If anything changes on your side, just tell me.\n\nWarmly, ${C.coordinatorName}`;
  }
  const when = step.startDate ? ` on ${parseIso(step.startDate).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}` : "";
  const where = step.city === "Online" ? "online" : `in ${step.city}`;
  const link = step.link ? ` Here's the link: ${step.link}` : "";
  return `${hello} The next ${step.shortTitle} is${when} ${where} — you'd be very welcome${step.tags.includes("satsang") ? ", and yes, bringing a friend is lovely" : ""}.${link}\n\nWarmly, ${C.coordinatorName}`;
}

/* ------------------------------------------------------------------ */
/*  Chat answers                                                       */
/* ------------------------------------------------------------------ */

const CITIES = ["Waterloo", "Toronto", "Kitchener", "Mississauga", "Online"];

/** A short, honest picture of the centre for the model to reason over. */
export function snapshotRows(views: SahayakPerson[], catalog: Map<string, NextStep>): SahayakSnapshotRow[] {
  return views.map((v) => ({
    name: `${v.participant.firstName} ${v.participant.lastName}`,
    city: v.participant.city,
    stage: v.stage,
    lastContact: contactText(v.history),
    nextStep: v.suggestion ? catalog.get(v.suggestion.nextStepId)?.shortTitle ?? "—" : "none",
  }));
}

/** The plain-language answer Sahayak gives when there is no model to ask. */
export function answerFromData(question: string, views: SahayakPerson[], upcoming: UpcomingItem[], inbox: InboxMessage[], now = today()): SahayakAnswer {
  const q = question.toLowerCase();
  const name = (v: SahayakPerson) => `${v.participant.firstName} ${v.participant.lastName}`;
  const detail = (v: SahayakPerson) => `${v.participant.city} · ${contactText(v.history)}`;

  if (/summar|my week|how.*(going|am i)/.test(q)) {
    const quiet = views.filter((v) => v.stage === "quiet").length;
    const waiting = inbox.filter(needsReply).length;
    const drafts = views.filter((v) => v.suggestion?.status === "pending").length;
    return {
      text: `A quiet week overall: ${plural(drafts, "draft")} waiting for you, ${plural(quiet, "person")} going quiet and ${plural(waiting, "message")} still needing a reply.`,
      rows: [
        { name: "Drafts waiting for review", detail: String(drafts) },
        { name: "People going quiet", detail: String(quiet) },
        { name: "Messages needing a reply", detail: String(waiting) },
        { name: "Upcoming things on the calendar", detail: String(upcoming.length) },
      ],
      action: { label: "View activity", to: "/activity" },
    };
  }

  const city = CITIES.find((c) => q.includes(c.toLowerCase()));
  if (city && /not come|no.?t come|absen|missing|hasn|haven|2 month|two month|60 day/.test(q)) {
    const picked = views.filter((v) => v.participant.city === city && (daysSinceActivity(v.history) ?? 999) >= 60);
    return {
      text: picked.length
        ? `${plural(picked.length, "person")} in ${city} ${picked.length === 1 ? "hasn't" : "haven't"} come to anything in two months or more.`
        : `No one in ${city} has been away that long — everyone has come to something recently.`,
      rows: picked.map((v) => ({ name: name(v), detail: detail(v), to: "/participants" })),
      action: picked.length ? { label: "View participants", to: "/participants" } : undefined,
    };
  }

  if (/quiet|drift|check-?in/.test(q)) {
    const picked = views.filter((v) => v.stage === "quiet" || v.stage === "dormant");
    return {
      text: picked.length
        ? `${plural(picked.length, "person")} ${picked.length === 1 ? "is" : "are"} drifting away. A draft is already written for each of them.`
        : "No one is drifting away right now — everyone has been in touch lately.",
      rows: picked.map((v) => ({ name: name(v), detail: `${v.participant.city} · ${contactText(v.history)}`, to: "/review" })),
      action: picked.length ? { label: "Open in review queue", to: "/review" } : undefined,
    };
  }

  if (/follow-?up|this week|who needs|next step/.test(q)) {
    const picked = views
      .filter((v) => v.suggestion?.status === "pending")
      .sort((a, b) => (daysSinceLastContact(b.history) ?? 9999) - (daysSinceLastContact(a.history) ?? 9999))
      .slice(0, 6);
    return {
      text: picked.length
        ? `${plural(picked.length, "person")} ${picked.length === 1 ? "needs" : "need"} a follow-up this week, the people who have waited longest first.`
        : "Nothing is waiting — you're all caught up.",
      rows: picked.map((v) => ({ name: name(v), detail: detail(v), to: "/review" })),
      action: picked.length ? { label: "Open in review queue", to: "/review" } : undefined,
    };
  }

  const byName = views.find((v) => q.includes(v.participant.firstName.toLowerCase()));
  if (byName) {
    return {
      text: `Here's where ${byName.participant.firstName} stands.`,
      rows: [{ name: name(byName), detail: `${byName.participant.city} · ${contactText(byName.history)}`, to: "/participants" }],
      action: { label: "View participants", to: "/participants" },
    };
  }

  const oldest = inbox.filter(needsReply).sort((a, b) => a.date.localeCompare(b.date))[0];
  return {
    text: "I couldn't find a clear answer in your records. The most useful thing in front of you is the oldest message still waiting for a reply.",
    rows: oldest ? [{ name: oldest.from, detail: `${oldest.subject} · waiting ${plural(daysSince(oldest.date, now), "day")}`, to: "/inbox" }] : [],
    action: { label: "View inbox", to: "/inbox" },
  };
}

/** A draft for every person going quiet, in the tone the review queue already uses. */
export function draftsForQuiet(views: SahayakPerson[], catalog: Map<string, NextStep>): { person: SahayakPerson; text: string }[] {
  return views
    .filter((v) => (v.stage === "quiet" || v.stage === "dormant") && v.suggestion)
    .map((v) => {
      const s = v.suggestion!;
      const step = catalog.get(s.nextStepId);
      const text = s.editedMessage ?? s.draftMessage ?? (step ? draftMessage(v.participant, v.stage, step, s.channel) : "");
      return { person: v, text };
    })
    .filter((x) => x.text.length > 0);
}
