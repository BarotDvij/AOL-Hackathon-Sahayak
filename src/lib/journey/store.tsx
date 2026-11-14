import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { buildCatalog } from "./catalog";
import { JOURNEY_CONFIG as C, STAGE_PRIORITY } from "./config";
import { daysSince, isoDaysFrom } from "./dates";
import { PICKER_STAGES, demoSeed } from "./demo-seed";
import { draftMessage } from "./messages";
import { mySlice, participantStage, type MySlice } from "./participant";
import { buildSampleData } from "./sample-data";
import { computeStage, explainReasons } from "./stages";
import { buildSuggestion } from "./suggestions";
import type { ActivityEntry, Channel, Contact, History, Message, NextStep, Participant, ParticipantReply, PracticeLog, StageId, Suggestion } from "./types";

export interface ParticipantView {
  participant: Participant;
  history: History;
  stage: StageId;
  why: string;
  suggestion: Suggestion | null;
}

export interface Summary {
  total: number;
  waiting: number;
  sentThisWeek: number;
}

interface Store {
  views: ParticipantView[];
  catalog: Map<string, NextStep>;
  catalogList: NextStep[];
  pending: Suggestion[];
  practice: PracticeLog[];
  replies: ParticipantReply[];
  pickerIds: string[];
  /** Dashboard figures: how many people, how many drafts waiting, how many messages out this week. */
  summary: Summary;
  /** People who still need a follow-up, drifting-away first. */
  needsFollowUp: ParticipantView[];
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
  /** Participant-scoped data and actions. Only exposes the signed-in demo participant. */
  me: MySlice | null;
  logPractice: (minutes?: number | null) => void;
  markInterested: (stepId: string) => void;
  replyToMessage: (messageId: string, reply: "join" | "not now") => void;
}

const Ctx = createContext<Store | null>(null);

const historyFor = (id: string, courses: History["courses"], events: History["events"], contacts: Contact[]): History =>
  ({ courses: courses.filter((c) => c.participantId === id), events: events.filter((e) => e.participantId === id), contacts: contacts.filter((c) => c.participantId === id) });

/** Days since the last message out; people we never wrote to wait at the front of the queue. */
const daysSinceContact = (v: ParticipantView) => {
  const last = [...v.history.contacts].sort((a, b) => b.date.localeCompare(a.date))[0];
  return last ? daysSince(last.date) : 9999;
};
const priorityRank = (stage: StageId) => {
  const i = STAGE_PRIORITY.indexOf(stage);
  return i === -1 ? STAGE_PRIORITY.length : i;
};

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
  const [meId, setMeId] = useState<string | null>(null);
  const seq = useRef(0);
  const catalog = useMemo(() => new Map(catalogList.map((s) => [s.id, s])), [catalogList]);

  const views = useMemo<ParticipantView[]>(() => data.participants.map((p) => {
    const history = historyFor(p.id, data.courses, data.events, contacts);
    const { stage, reasons } = computeStage(p, history);
    return { participant: p, history, stage, why: explainReasons(reasons), suggestion: suggestions.find((s) => s.participantId === p.id) ?? null };
  }), [data, contacts, suggestions]);

  const me = useMemo(() => meId ? mySlice(meId, { participants: data.participants, history: (id) => historyFor(id, data.courses, data.events, contacts), practice, messages }) : null, [meId, data, contacts, practice, messages]);

  const summary = useMemo<Summary>(() => ({
    total: data.participants.length,
    waiting: suggestions.filter((s) => s.status === "pending").length,
    sentThisWeek: contacts.filter((c) => c.direction === "out" && daysSince(c.date) < C.sentThisWeekDays).length,
  }), [data, suggestions, contacts]);

  const needsFollowUp = useMemo<ParticipantView[]>(() => views
    .filter((v) => v.suggestion?.status === "pending")
    .sort((a, b) => priorityRank(a.stage) - priorityRank(b.stage) || daysSinceContact(b) - daysSinceContact(a)),
  [views]);

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
    summary, needsFollowUp, activity,
    pending: suggestions.filter((s) => s.status === "pending"),
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
