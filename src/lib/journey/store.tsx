import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { buildCatalog } from "./catalog";
import { JOURNEY_CONFIG as C, STAGE_PRIORITY, STAGES } from "./config";
import { contactText, daysSinceLastContact } from "./contact";
import { daysSince, daysUntil, isoDaysFrom, parseIso, today } from "./dates";
import { PICKER_STAGES, TEMP_PARTICIPANT_ID, demoSeed } from "./demo-seed";
import { buildInbox, type InboxMessage } from "./inbox-seed";
import { draftMessage } from "./messages";
import { mySlice, type MySlice } from "./participant";
import { buildSampleData } from "./sample-data";
import { briefItems, buildReminders, SAHAYAK_DEFAULTS, type BriefItem, type Nudge, type Reminder, type SahayakFeature, type SahayakState } from "./sahayak";
import { buildSuggestion, computeStage, explainReasons, participantStage } from "@/lib/sahayak/core";
import { EMPTY_PROGRAM_CATALOG, type ProgramCatalog } from "@/lib/journey/programs";
import { supabase } from "@/integrations/supabase/client";
import { saveApprovedMessage } from "@/lib/participant.functions";
import type { ActivityEntry, Channel, Contact, History, Message, NextStep, Participant, ParticipantReply, PracticeLog, StageId, Suggestion } from "./types";

export { contactText, daysSinceLastContact };

export interface ParticipantView {
  participant: Participant;
  history: History;
  stage: StageId;
  why: string;
  suggestion: Suggestion | null;
}

export interface Summary {
  total: number; totalNote: string;
  needFollowUp: number; needTrend: string;
  waiting: number; waitingNote: string;
  sentThisWeek: number; sentTrend: string;
}

export interface StageCount { id: StageId; label: string; count: number }
export interface Opportunity { step: NextStep; suggestedFor: number }

interface Store {
  views: ParticipantView[];
  programCatalog: ProgramCatalog;
  catalog: Map<string, NextStep>;
  catalogList: NextStep[];
  pending: Suggestion[];
  practice: PracticeLog[];
  replies: ParticipantReply[];
  pickerIds: string[];
  /** Dashboard figures with the small line under each number. */
  summary: Summary;
  /** How many people sit in each stage, in display order. */
  stageCounts: StageCount[];
  /** The first five people to reach out to; drifting people first. */
  priority: ParticipantView[];
  /** People who still need a follow-up, drifting-away first. */
  needsFollowUp: ParticipantView[];
  /** Upcoming events and courses, soonest first, with how many people each is suggested for. */
  upcoming: Opportunity[];
  /** What the coordinator has approved, edited or skipped, newest first. */
  activity: ActivityEntry[];
  city: string; setCity: (c: string) => void;
  meId: string | null; setMeId: (id: string | null) => void;
  approve: (id: string, message: string) => void;
  skip: (id: string, reason: string) => void;
  useAlternate: (id: string) => void;
  editMessage: (id: string, message: string) => void;
  setChannel: (id: string, channel: Channel) => void;
  chooseStep: (participantId: string, stepId: string) => void;
  /** Sahayak: its settings, the morning brief, live reminders and the coordinator's inbox. */
  sahayak: SahayakState;
  brief: BriefItem[];
  reminders: Reminder[];
  inbox: InboxMessage[];
  setSahayakOn: (on: boolean) => void;
  setSahayakFeature: (key: SahayakFeature, on: boolean) => void;
  setNudge: (n: Nudge) => void;
  decideSahayak: (on: boolean) => void;
  resetSahayakDemo: () => void;
  dismissBrief: () => void;
  snoozeReminder: (id: string, days: number) => void;
  dismissReminder: (id: string) => void;
  /** Approving a drafted reply is the only thing that records it as sent. */
  replyInbox: (id: string, text: string) => void;
  /** Participant-scoped data and actions. Only exposes the signed-in demo participant. */
  me: MySlice | null;
  logPractice: (minutes?: number | null) => void;
  markInterested: (stepId: string) => void;
  replyToMessage: (messageId: string, reply: "join" | "not now") => void;
}

const Ctx = createContext<Store | null>(null);

const historyFor = (id: string, courses: History["courses"], events: History["events"], contacts: Contact[]): History =>
  ({ courses: courses.filter((c) => c.participantId === id), events: events.filter((e) => e.participantId === id), contacts: contacts.filter((c) => c.participantId === id) });

/** People we never wrote to wait at the front of the queue. */
const daysSinceContact = (v: ParticipantView) => daysSinceLastContact(v.history) ?? 9999;
const priorityRank = (stage: StageId) => {
  const i = STAGE_PRIORITY.indexOf(stage);
  return i === -1 ? STAGE_PRIORITY.length : i;
};
/** "+3 from last week", "−2 from last week" or "no change from last week". */
const weekTrend = (delta: number) => (delta === 0 ? "no change from last week" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)} from last week`);

function initial() {
  const data = buildSampleData();
  const catalogList = buildCatalog();
  const suggestions: Suggestion[] = [];
  const pickerIds: string[] = [];
  for (const p of data.participants) {
    const h = historyFor(p.id, data.courses, data.events, data.contacts);
    const { stage, reasons } = computeStage(p, h);
    const s = buildSuggestion(p, h, stage, explainReasons(reasons), catalogList);
    if (s) suggestions.push(s);
  }
  for (const st of PICKER_STAGES) {
    const p = data.participants.find((x) => !x.doNotContact && computeStage(x, historyFor(x.id, data.courses, data.events, data.contacts)).stage === st);
    if (p) pickerIds.push(p.id);
  }
  const seed = demoSeed(pickerIds, Object.fromEntries(data.participants.map((p) => [p.id, p.firstName])));
  return { data, catalogList, suggestions, pickerIds, seed };
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [{ data, catalogList, suggestions: s0, pickerIds, seed }] = useState(initial);
  const [suggestions, setSuggestions] = useState(s0);
  const [contacts, setContacts] = useState(data.contacts);
  const [practice, setPractice] = useState(seed.practice);
  const [messages, setMessages] = useState<Message[]>(seed.messages);
  const [replies, setReplies] = useState<ParticipantReply[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [city, setCity] = useState("all");
  const [meId, setMeId] = useState<string | null>(TEMP_PARTICIPANT_ID);
  const [sahayak, setSahayak] = useState<SahayakState>(SAHAYAK_DEFAULTS);
  const [inbox, setInbox] = useState<InboxMessage[]>(() => buildInbox());
  const seq = useRef(0);
  const catalog = useMemo(() => new Map(catalogList.map((s) => [s.id, s])), [catalogList]);

  const views = useMemo<ParticipantView[]>(() => data.participants.map((p) => {
    const history = historyFor(p.id, data.courses, data.events, contacts);
    const { stage, reasons } = computeStage(p, history);
    return { participant: p, history, stage, why: explainReasons(reasons), suggestion: suggestions.find((s) => s.participantId === p.id) ?? null };
  }), [data, contacts, suggestions]);

  const me = useMemo(() => meId ? mySlice(meId, { participants: data.participants, history: (id) => historyFor(id, data.courses, data.events, contacts), practice, messages }) : null, [meId, data, contacts, practice, messages]);

  const needsFollowUp = useMemo<ParticipantView[]>(() => views
    .filter((v) => v.suggestion?.status === "pending")
    .sort((a, b) => priorityRank(a.stage) - priorityRank(b.stage) || daysSinceContact(b) - daysSinceContact(a)),
  [views]);

  const summary = useMemo<Summary>(() => {
    // "Needed a follow-up last week" is the same rule run against the date a week ago.
    const lastWeek = parseIso(isoDaysFrom(-7));
    const neededThen = data.participants.filter((p) => computeStage(p, historyFor(p.id, data.courses, data.events, contacts), lastWeek).stage !== "paused").length;
    const needNow = views.filter((v) => v.stage !== "paused").length;
    const out = contacts.filter((c) => c.direction === "out");
    const sentThisWeek = out.filter((c) => daysSince(c.date) < 7).length;
    const sentBefore = out.filter((c) => { const d = daysSince(c.date); return d >= 7 && d < 14; }).length;
    const joined = data.participants.filter((p) => {
      const first = data.courses.filter((c) => c.participantId === p.id).map((c) => c.completedOn).sort()[0];
      return first !== undefined && daysSince(first) < 7;
    }).length;
    const todayIso = today().toISOString().slice(0, 10);
    const reviewedToday = activity.filter((a) => a.kind !== "edited" && a.at.slice(0, 10) === todayIso).length;
    return {
      total: data.participants.length,
      totalNote: joined === 0 ? "no one new this week" : `${joined} joined this week`,
      needFollowUp: needNow,
      needTrend: weekTrend(needNow - neededThen),
      waiting: suggestions.filter((s) => s.status === "pending").length,
      waitingNote: reviewedToday === 0 ? "nothing reviewed yet today" : `${reviewedToday} reviewed today`,
      sentThisWeek,
      sentTrend: weekTrend(sentThisWeek - sentBefore),
    };
  }, [data, views, contacts, suggestions, activity]);

  const stageCounts = useMemo<StageCount[]>(() => STAGES.map((st) => ({ id: st.id, label: st.label, count: views.filter((v) => v.stage === st.id).length })), [views]);

  const priority = useMemo<ParticipantView[]>(() => needsFollowUp.slice(0, 5), [needsFollowUp]);

  const upcoming = useMemo<Opportunity[]>(() => catalogList
    .filter((s) => s.startDate && daysUntil(s.startDate) >= 0)
    .map((s) => ({ step: s, suggestedFor: suggestions.filter((x) => x.status === "pending" && x.nextStepId === s.id).length }))
    .sort((a, b) => (a.step.startDate ?? "9").localeCompare(b.step.startDate ?? "9"))
    .slice(0, 6),
  [catalogList, suggestions]);

  /** The morning brief: nothing at all while Sahayak is off, or once it has been dismissed for today. */
  const brief = useMemo<BriefItem[]>(
    () => (sahayak.on && sahayak.features.dailyBrief && sahayak.briefDismissedOn !== isoDaysFrom(0)
      ? briefItems({ views, upcoming, inbox })
      : []),
    [sahayak, views, upcoming, inbox],
  );

  /** Live reminders, already trimmed to the chosen nudge frequency. */
  const reminders = useMemo<Reminder[]>(
    () => buildReminders({ views, upcoming, inbox, state: sahayak }),
    [sahayak, views, upcoming, inbox],
  );

  const update = useCallback((id: string, fn: (s: Suggestion) => Suggestion) => setSuggestions((all) => all.map((s) => (s.id === id ? fn(s) : s))), []);
  const nameOf = (participantId: string) => data.participants.find((x) => x.id === participantId)?.firstName ?? "participant";
  const log = useCallback((kind: ActivityEntry["kind"], participantId: string, detail: string) => {
    seq.current += 1;
    setActivity((a) => [{ id: `a${seq.current}`, at: new Date().toISOString(), kind, participantId, detail }, ...a]);
  }, []);
  const incoming = (participantId: string, kind: ParticipantReply["kind"], about: string, nextStepId?: string) => {
    const p = data.participants.find((x) => x.id === participantId)!;
    setContacts((c) => [...c, { participantId, channel: p.preferredChannel ?? "email", direction: "in", date: isoDaysFrom(0), outcome: kind === "not now" ? "declined" : "replied", ...(nextStepId ? { nextStepId } : {}) }]);
    setReplies((r) => [{ id: `r${Date.now()}`, participantId, kind, about, at: new Date().toISOString() }, ...r]);
  };

  const store: Store = {
    views, catalog, catalogList, practice, replies, pickerIds, city, setCity, meId, setMeId, me,
    summary, stageCounts, priority, needsFollowUp, upcoming, activity,
    pending: suggestions.filter((s) => s.status === "pending"),
    sahayak, brief, reminders, inbox,
    setSahayakOn: (on) => setSahayak((s) => ({ ...s, on, decided: true })),
    setSahayakFeature: (key, on) => setSahayak((s) => ({ ...s, features: { ...s.features, [key]: on } })),
    setNudge: (n) => setSahayak((s) => ({ ...s, nudge: n })),
    decideSahayak: (on) => setSahayak((s) => ({ ...s, on, decided: true })),
    resetSahayakDemo: () => setSahayak({ ...SAHAYAK_DEFAULTS, features: { ...SAHAYAK_DEFAULTS.features }, snoozed: {}, dismissed: [] }),
    dismissBrief: () => setSahayak((s) => ({ ...s, briefDismissedOn: isoDaysFrom(0) })),
    snoozeReminder: (id, days) => setSahayak((s) => ({ ...s, snoozed: { ...s.snoozed, [id]: isoDaysFrom(days) } })),
    dismissReminder: (id) => setSahayak((s) => ({ ...s, dismissed: [...s.dismissed, id] })),
    replyInbox: (id, text) => {
      const m = inbox.find((x) => x.id === id);
      if (!m || m.status === "replied") return;
      setInbox((all) => all.map((x): InboxMessage => (x.id === id ? { ...x, status: "replied", replyText: text } : x)));
      setContacts((c) => [...c, { participantId: m.participantId, channel: m.channel, direction: "out", date: isoDaysFrom(0), outcome: "no reply" }]);
      log("replied", m.participantId, `Replied to ${m.from} on ${m.channel}`);
    },
    editMessage: (id, message) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s) return;
      update(id, (x) => ({ ...x, editedMessage: message }));
      log("edited", s.participantId, `Edited the message for ${nameOf(s.participantId)}`);
    },
    approve: (id, message) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s) return;
      const now = new Date().toISOString();
      const step = catalog.get(s.nextStepId);
      update(id, (x) => ({ ...x, editedMessage: message, status: "approved", reviewedBy: C.coordinatorName, reviewedAt: now }));
      setContacts((c) => [...c, { participantId: s.participantId, channel: s.channel, direction: "out", date: isoDaysFrom(0), outcome: "no reply", nextStepId: s.nextStepId }]);
      setMessages((m) => [...m, { id: `msg-${s.id}`, participantId: s.participantId, suggestionId: s.id, coordinatorName: C.coordinatorName, text: message, sentAt: now, reply: null }]);
      log("approved", s.participantId, `Approved ${step?.shortTitle ?? "a next step"} for ${nameOf(s.participantId)} · ${s.channel}`);
      // Signed-in coordinators also persist the approval for the participant app and Muse.
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session) return;
        return saveApprovedMessage({ data: { participantId: s.participantId, suggestionId: s.id, coordinatorName: C.coordinatorName, text: message, sentAt: now } });
      }).catch(() => { /* The existing local demo approval remains available without a coordinator session. */ });
    },
    skip: (id, reason) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s) return;
      update(id, (x) => ({ ...x, status: "skipped", skipReason: reason, reviewedBy: C.coordinatorName, reviewedAt: new Date().toISOString() }));
      log("skipped", s.participantId, `Skipped ${nameOf(s.participantId)}: ${reason}`);
    },
    useAlternate: (id) => update(id, (s) => {
      if (!s.alternateNextStepId) return s;
      const v = views.find((x) => x.participant.id === s.participantId)!;
      const alt = catalog.get(s.alternateNextStepId)!;
      return { ...s, nextStepId: alt.id, alternateNextStepId: s.nextStepId, editedMessage: null, lowData: false, draftMessage: draftMessage(v.participant, v.stage, alt, s.channel) };
    }),
    setChannel: (id, channel) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s || s.channel === channel) return;
      const v = views.find((x) => x.participant.id === s.participantId);
      update(id, (x) => {
        const step = catalog.get(x.nextStepId);
        if (!v || !step) return { ...x, channel };
        return { ...x, channel, draftMessage: draftMessage(v.participant, v.stage, step, channel) };
      });
    },
    chooseStep: (participantId, stepId) => {
      const v = views.find((x) => x.participant.id === participantId);
      const s = suggestions.find((x) => x.participantId === participantId);
      const step = catalog.get(stepId);
      if (!v || !s || !step) return;
      setSuggestions((all) => all.map((x) => (x.participantId === participantId
        ? { ...x, nextStepId: stepId, alternateNextStepId: x.nextStepId === stepId ? x.alternateNextStepId : x.nextStepId, editedMessage: null, lowData: false, draftMessage: draftMessage(v.participant, v.stage, step, x.channel) }
        : x)));
    },
    logPractice: (minutes = null) => {
      if (!meId) return;
      const d = isoDaysFrom(0);
      setPractice((l) => [...l.filter((x) => !(x.participantId === meId && x.date === d)), { participantId: meId, date: d, minutes }]);
    },
    markInterested: (stepId) => { if (meId) incoming(meId, "interested", catalog.get(stepId)?.title ?? "a next step", stepId); },
    replyToMessage: (messageId, reply) => {
      const m = messages.find((x) => x.id === messageId);
      if (!m || m.participantId !== meId) return;
      setMessages((all) => all.map((x) => (x.id === messageId ? { ...x, reply } : x)));
      incoming(m.participantId, reply, "your message");
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useJourney must be used inside JourneyProvider");
  return s;
}

/** Participant screens use only this hook: it never returns other people's data or internal stage wording. */
export function useMe() {
  const { me, catalogList, logPractice, markInterested, replyToMessage } = useJourney();
  return { me, catalogList, logPractice, markInterested, replyToMessage };
}
export { participantStage };
