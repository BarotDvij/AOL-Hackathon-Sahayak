import { createContext, useEffect, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { buildSessions, seedOutcomes, messageOutcome, broughtBack, differentChannel, VOLUNTEERS, type SentRecord, type Session, type CheckIn, type AssignmentProposal } from "./operations";
import { useDemoSession, SHIVAM_ID } from './demo-session';
import { buildGroups, connectionOf, alsoKnowsOf, deriveAssignments, unassignedViews, type VolunteerGroup } from "./groups";
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
import type { ActivityEntry, Channel, Connection, Contact, GroupMessage, History, Message, NextStep, Participant, ParticipantReply, PracticeLog, StageId, Suggestion } from "./types";

export { contactText, daysSinceLastContact };

/** Where the coordinator's one-time Sahayak answer is remembered. */
const SAHAYAK_CHOICE_KEY = "journey-sahayak-choice";

export interface ParticipantView {
  participant: Participant;
  history: History;
  stage: StageId;
  why: string;
  suggestion: Suggestion | null;
  /** The volunteer this person is connected to, and why. */
  connection: Connection | null;
  /** Other volunteers they have done something with. */
  alsoKnows: string[];
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
  sentMessages: SentRecord[]; sessions: Session[]; checkIns: CheckIn[]; assignments: Record<string, string>;
  activeVolunteer: string; setActiveVolunteer: (id: string) => void; myFollowUps: boolean; setMyFollowUps: (on: boolean) => void;
  assign: (participantId: string, volunteerId: string) => void; confirmAssignments: (proposals: AssignmentProposal[]) => void;
  checkIn: (sessionId: string, identity: string) => { ok: boolean; name: string; message?: string };
  endSession: (id: string) => void; setParticipantLanguage: (id: string, language: string) => void;
  setMessageLanguage: (id: string, language: string) => void; secondFollowUp: (messageId: string) => void;
  views: ParticipantView[];
  /** One section per volunteer, with the people connected to them. */
  groups: VolunteerGroup[];
  /** People not yet connected to any volunteer. */
  unassigned: ParticipantView[];
  /** Group invites the coordinator has approved, newest first. */
  groupMessages: GroupMessage[];
  /** Approving a group invite is the only thing that records it as sent. */
  sendGroupMessage: (volunteerId: string, text: string, channel: Channel) => void;
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

function initial(programCatalog: ProgramCatalog) {
  const data = buildSampleData();
  for (const id of ["p23", "p24", "p28"]) { const p = data.participants.find(p=>p.id===id); if (p) data.events.push({participantId:id,eventType:"follow-up",date:isoDaysFrom(id === "p23" ? -2 : id === "p24" ? -4 : -6),city:p.city,online:false}); }
  // Fictional six-month cohorts make the demo's Sahayak activation trend reproducible.
  const cohortIds = ['p01','p03','p10','p11','p12','p13','p14','p15','p16','p17','p18','p19'];
  cohortIds.forEach((id,index) => {
    const month = Math.floor(index / 2); const date = new Date(today().getFullYear(), today().getMonth() - 5 + month, 2);
    const completion = isoDaysFrom(0,date); const course = data.courses.find(c=>c.participantId===id && c.courseName===C.skyCourseName);
    if (course) course.completedOn = completion;
    data.events = data.events.filter(e=>e.participantId!==id || e.eventType!== 'follow-up' || !(e.date>=completion && daysSince(completion,parseIso(e.date))<=30));
    if (month >= 4 || (month >= 2 && index % 2 === 0)) { const p=data.participants.find(p=>p.id===id); if(p) data.events.push({participantId:id,eventType:'follow-up',date:isoDaysFrom(3,date),city:p.city,online:p.city==='Online'}); }
  });
  const catalogList = buildCatalog(programCatalog.programs, programCatalog.prerequisites);
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

export function JourneyProvider({ children, programCatalog = EMPTY_PROGRAM_CATALOG }: { children: ReactNode; programCatalog?: ProgramCatalog }) {
  const [{ data, catalogList, suggestions: s0, pickerIds, seed }] = useState(() => initial(programCatalog));
  const [participants, setParticipants] = useState(data.participants);
  const [events, setEvents] = useState(data.events);
  const [courses, setCourses] = useState(data.courses);
  const [sessions, setSessions] = useState(buildSessions);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [assignments, setAssignments] = useState<Record<string,string>>(() => deriveAssignments(data.participants, (id) => historyFor(id, data.courses, data.events, data.contacts)));
  const [activeVolunteer, setActiveVolunteer] = useState("v1");
  const [myFollowUps, setMyFollowUps] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentRecord[]>(() => seedOutcomes([...data.participants.filter(p=>["p23","p24","p28"].includes(p.id)), ...data.participants.filter(p=>!["p23","p24","p28"].includes(p.id))], id => historyFor(id, data.courses, data.events, data.contacts), id => { const p = data.participants.find(x => x.id === id); return id === "p28" ? "dormant" : ["p23","p24"].includes(id) ? "quiet" : p ? computeStage(p, historyFor(id, data.courses, data.events, data.contacts)).stage : "new"; }));
  const [suggestions, setSuggestions] = useState(s0);
  const [contacts, setContacts] = useState(data.contacts);
  const [practice, setPractice] = useState(seed.practice);
  const [messages, setMessages] = useState<Message[]>(() => [...seed.messages, ...sentMessages]);
  const [replies, setReplies] = useState<ParticipantReply[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [city, setCity] = useState("all");
  const [meId, setMeId] = useState<string | null>(TEMP_PARTICIPANT_ID);
  const [sahayak, setSahayak] = useState<SahayakState>(SAHAYAK_DEFAULTS);
  const [inbox, setInbox] = useState<InboxMessage[]>(() => buildInbox());

  // The first-time question is asked once per browser: the answer is remembered,
  // so reloading the app never brings the popup back.
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(SAHAYAK_CHOICE_KEY); } catch { stored = null; }
    if (stored === "on" || stored === "off") {
      setSahayak((s) => ({ ...s, decided: true, on: stored === "on" }));
    }
  }, []);

  useEffect(() => {
    if (!sahayak.decided) return;
    try { localStorage.setItem(SAHAYAK_CHOICE_KEY, sahayak.on ? "on" : "off"); } catch { /* storage unavailable: the question just comes back */ }
  }, [sahayak.decided, sahayak.on]);
  const seq = useRef(0);
  const catalog = useMemo(() => new Map(catalogList.map((s) => [s.id, s])), [catalogList]);

  const views = useMemo<ParticipantView[]>(() => participants.map((p) => {
    const history = historyFor(p.id, courses, events, contacts);
    const { stage, reasons } = computeStage(p, history);
    const connection = connectionOf(p.id, history, assignments);
    return { participant: p, history, stage, why: explainReasons(reasons), suggestion: suggestions.find((s) => s.participantId === p.id) ?? null, connection, alsoKnows: alsoKnowsOf(history, connection?.volunteerId) };
  }), [participants, courses, events, contacts, suggestions, assignments]);

  /** Volunteer sections, straight from the same views the tables show. */
  const groups = useMemo<VolunteerGroup[]>(() => buildGroups(views), [views]);
  const unassigned = useMemo<ParticipantView[]>(() => unassignedViews(views), [views]);

  const me = useMemo(() => meId ? mySlice(meId, { participants: participants, history: (id) => historyFor(id, courses, events, contacts), practice, messages }) : null, [meId, participants, courses, events, contacts, practice, messages]);

  const needsFollowUp = useMemo<ParticipantView[]>(() => views
    .filter((v) => v.suggestion?.status === "pending")
    .sort((a, b) => priorityRank(a.stage) - priorityRank(b.stage) || daysSinceContact(b) - daysSinceContact(a)),
  [views]);

  const summary = useMemo<Summary>(() => {
    // "Needed a follow-up last week" is the same rule run against the date a week ago.
    const lastWeek = parseIso(isoDaysFrom(-7));
    const neededThen = participants.filter((p) => computeStage(p, historyFor(p.id, courses, events, contacts), lastWeek).stage !== "paused").length;
    const needNow = views.filter((v) => v.stage !== "paused").length;
    const out = contacts.filter((c) => c.direction === "out");
    const sentThisWeek = out.filter((c) => daysSince(c.date) < 7).length;
    const sentBefore = out.filter((c) => { const d = daysSince(c.date); return d >= 7 && d < 14; }).length;
    const joined = participants.filter((p) => {
      const first = courses.filter((c) => c.participantId === p.id).map((c) => c.completedOn).sort()[0];
      return first !== undefined && daysSince(first) < 7;
    }).length;
    const todayIso = today().toISOString().slice(0, 10);
    const reviewedToday = activity.filter((a) => a.kind !== "edited" && a.at.slice(0, 10) === todayIso).length;
    return {
      total: participants.length,
      totalNote: joined === 0 ? "no one new this week" : `${joined} joined this week`,
      needFollowUp: needNow,
      needTrend: weekTrend(needNow - neededThen),
      waiting: suggestions.filter((s) => s.status === "pending").length,
      waitingNote: reviewedToday === 0 ? "nothing reviewed yet today" : `${reviewedToday} reviewed today`,
      sentThisWeek,
      sentTrend: weekTrend(sentThisWeek - sentBefore),
    };
  }, [participants, courses, events, views, contacts, suggestions, activity]);

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
      ? [{id: "brief-impact", text: `Your messages brought back ${new Set(sentMessages.filter(m => broughtBack(m) && m.attendedAt && daysSince(m.attendedAt) < 7).map(m => m.participantId)).size} people this week`, why: "Visits recorded after an approved message to someone going quiet or dormant.", to: "/impact" as const, actionLabel: "Recent wins"}, ...briefItems({ views, upcoming, inbox, groups })]
      : []),
    [sahayak, views, upcoming, inbox, sentMessages, groups],
  );

  /** Live reminders, already trimmed to the chosen nudge frequency. */
  const reminders = useMemo<Reminder[]>(
    () => buildReminders({ views, upcoming, inbox, state: sahayak }).filter(r => !r.participantId || !checkIns.some(c => c.participantId === r.participantId)),
    [sahayak, views, upcoming, inbox, checkIns],
  );

  const update = useCallback((id: string, fn: (s: Suggestion) => Suggestion) => setSuggestions((all) => all.map((s) => (s.id === id ? fn(s) : s))), []);
  const nameOf = (participantId: string) => participants.find((x) => x.id === participantId)?.firstName ?? "participant";
  const log = useCallback((kind: ActivityEntry["kind"], participantId: string, detail: string) => {
    seq.current += 1;
    setActivity((a) => [{ id: `a${seq.current}`, at: new Date().toISOString(), kind, participantId, detail }, ...a]);
  }, []);
  const incoming = (participantId: string, kind: ParticipantReply["kind"], about: string, nextStepId?: string) => {
    const p = participants.find((x) => x.id === participantId);
    if (!p) return;
    setContacts((c) => [...c, { participantId, channel: p.preferredChannel ?? "email", direction: "in", date: isoDaysFrom(0), outcome: kind === "not now" ? "declined" : "replied", ...(nextStepId ? { nextStepId } : {}) }]);
    const latest = [...sentMessages].filter(m=>m.participantId===participantId).sort((a,b)=>b.sentAt.localeCompare(a.sentAt))[0];
    if (latest) setSentMessages(all=>all.map(m=>m.id===latest.id?{...m,reply:kind=== "not now"?"not now":"join"}:m));
    setReplies((r) => [{ id: `r${Date.now()}`, participantId, kind, about, at: new Date().toISOString() }, ...r]);
  };

  const store: Store = {
    views, programCatalog, catalog, catalogList, practice, replies, pickerIds, city, setCity, meId, setMeId, me,
    groups, unassigned, groupMessages,
    sentMessages, sessions, checkIns, assignments, activeVolunteer, setActiveVolunteer, myFollowUps, setMyFollowUps,
    assign: (id, volunteerId) => setAssignments(all => ({...all, [id]: volunteerId})),
    sendGroupMessage: (volunteerId, text, channel) => {
      const group = groups.find((g) => g.volunteer.id === volunteerId);
      if (!group || group.members.length === 0) return;
      const at = new Date().toISOString();
      const memberIds = group.members.map((m) => m.participant.id);
      const stageOf = (id: string) => views.find((v) => v.participant.id === id)?.stage ?? "new";
      setGroupMessages((all) => [{ id: `group-${volunteerId}-${at}`, volunteerId, text, channel, at, memberIds }, ...all]);
      setContacts((c) => [...c, ...memberIds.map((id) => ({ participantId: id, channel, direction: "out" as const, date: isoDaysFrom(0), outcome: "no reply" as const }))]);
      setSentMessages((all) => [...all, ...memberIds.map((id) => ({ id: `group-msg-${volunteerId}-${id}`, participantId: id, suggestionId: null, coordinatorName: C.coordinatorName, text, sentAt: at, reply: null, channel, stageBefore: stageOf(id), volunteerId }))]);
      setMessages((m) => [...m, ...memberIds.map((id) => ({ id: `group-msg-${volunteerId}-${id}`, participantId: id, suggestionId: null, coordinatorName: C.coordinatorName, text, sentAt: at, reply: null }))]);
      log("approved", memberIds[0] ?? "", `Approved a group invite for ${group.volunteer.name}'s group · ${memberIds.length} ${memberIds.length === 1 ? "person" : "people"} · ${channel}`);
    },
    confirmAssignments: proposals => setAssignments(all => ({...all, ...Object.fromEntries(proposals.map(p => [p.participantId, p.volunteerId]))})),
    endSession: id => setSessions(all => all.map(s => s.id === id ? {...s, ended: true} : s)),
    setParticipantLanguage: (id, language) => {
      setParticipants(all => all.map(p => p.id === id ? {...p, language} : p));
      const v = views.find(v => v.participant.id === id);
      if (v) setSuggestions(all => all.map(s => { const step = catalog.get(s.nextStepId); return s.participantId === id && step ? {...s, editedMessage: null, draftMessage: draftMessage({...v.participant, language}, v.stage, step, s.channel)} : s; }));
    },
    setMessageLanguage: (id, language) => { const s = suggestions.find(s => s.id === id); const v = views.find(v => v.participant.id === s?.participantId); const step = s ? catalog.get(s.nextStepId) : undefined; if (s && v && step) update(id, x => ({...x, messageLanguage: language, editedMessage: null, draftMessage: draftMessage({...v.participant, language}, v.stage, step, x.channel)})); },
    secondFollowUp: messageId => {
      const m = sentMessages.find(m => m.id === messageId); const v = views.find(v => v.participant.id === m?.participantId);
      if (!m || !v || v.participant.doNotContact || messageOutcome(m) !== "No response after 14 days") return;
      const step = catalogList.find(s => s.id === "gentle-checkin"); if (!step) return;
      const channel = differentChannel(m.channel, v.participant);
      const replacement: Suggestion = {id: `second-${m.id}`, participantId: m.participantId, nextStepId: step.id, alternateNextStepId: null, channel, why: "No response after 14 days. Try a gentle note through a different channel.", draftMessage: draftMessage(v.participant, v.stage, step, channel), editedMessage: null, status: "pending", skipReason: null, reviewedBy: null, reviewedAt: null, lowData: false};
      setSuggestions(all => [...all.filter(s => s.participantId !== m.participantId), replacement]);
    },
    checkIn: (sessionId, identity) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || session.ended || !identity.trim()) return {ok: false, name: "", message: "This check-in is closed or the name is missing."};
      const needle = identity.trim().toLowerCase();
      let person = participants.find(p => `${p.firstName} ${p.lastName}`.toLowerCase() === needle || p.firstName.toLowerCase() === needle || p.phone === identity.trim());
      const firstTimer = !person || !events.some(e => e.participantId === person?.id);
      if (!person) { const words = identity.trim().split(/\s+/); const isPhone = /^[+\d ()-]+$/.test(identity.trim()); person = {id: `guest-${Date.now()}`, firstName: isPhone ? "Guest" : words[0] ?? "Guest", lastName: isPhone ? "" : words.slice(1).join(" "), age: 30, city: session.city, language: "English", email: null, phone: isPhone ? identity.trim() : null, preferredChannel: isPhone ? "sms" : null, doNotContact: false, sevaRole: null, interests: []}; setParticipants(all => [...all, person as Participant]); }
      if (checkIns.some(c => c.sessionId === sessionId && c.participantId === person?.id)) return {ok: true, name: person.firstName, message: "Already checked in"};
      const id = person.id; const stageBefore = views.find(v => v.participant.id === id)?.stage ?? "new"; const at = isoDaysFrom(0);
      setCheckIns(all => [...all, {sessionId, participantId: id, at, firstTimer, stageBefore}]);
      setEvents(all => [...all, {participantId: id, eventType: session.eventType, date: at, city: session.city, online: session.city === "Online"}]);
      if (session.courseName) setCourses(all => [...all, {participantId: id, courseName: session.courseName ?? session.name, completedOn: at}]);
      setContacts(all => [...all, {participantId: id, channel: person?.preferredChannel ?? "email", direction: "in", date: at, outcome: "enrolled"}]);
      const latest = [...sentMessages].filter(m => m.participantId === id && !m.attendedAt && m.sentAt.slice(0,10) <= at).sort((a,b) => b.sentAt.localeCompare(a.sentAt))[0];
      if (latest) setSentMessages(all => all.map(m => m.id === latest.id ? {...m, attendedAt: at, attendedSession: session.name} : m));
      setSahayak(s => ({...s, dismissed: [...s.dismissed, ...reminders.filter(r => r.participantId === id).map(r => r.id)]}));
      setSuggestions(all=>all.map(s=>s.participantId===id && s.status=== "pending" ? {...s,status:"skipped",skipReason:"Attended a session; reminder resolved",reviewedAt:new Date().toISOString()} : s));
      log("attended", id, `Checked in to ${session.name}`);
      return {ok: true, name: person.firstName};
    },
    summary, stageCounts, priority, needsFollowUp, upcoming, activity,
    pending: suggestions.filter((s) => s.status === "pending"),
    sahayak, brief, reminders, inbox,
    setSahayakOn: (on) => setSahayak((s) => ({ ...s, on, decided: true })),
    setSahayakFeature: (key, on) => setSahayak((s) => ({ ...s, features: { ...s.features, [key]: on } })),
    setNudge: (n) => setSahayak((s) => ({ ...s, nudge: n })),
    decideSahayak: (on) => setSahayak((s) => ({ ...s, on, decided: true })),
    resetSahayakDemo: () => {
      try { localStorage.removeItem(SAHAYAK_CHOICE_KEY); } catch { /* storage unavailable */ }
      setSahayak({ ...SAHAYAK_DEFAULTS, features: { ...SAHAYAK_DEFAULTS.features }, snoozed: {}, dismissed: [] });
    },
    dismissBrief: () => setSahayak((s) => ({ ...s, briefDismissedOn: isoDaysFrom(0) })),
    snoozeReminder: (id, days) => setSahayak((s) => ({ ...s, snoozed: { ...s.snoozed, [id]: isoDaysFrom(days) } })),
    dismissReminder: (id) => setSahayak((s) => ({ ...s, dismissed: [...s.dismissed, id] })),
    replyInbox: (id, text) => {
      const m = inbox.find((x) => x.id === id);
      if (!m || m.status === "replied") return;
      setInbox((all) => all.map((x): InboxMessage => (x.id === id ? { ...x, status: "replied", replyText: text } : x)));
      setContacts((c) => [...c, { participantId: m.participantId, channel: m.channel, direction: "out", date: isoDaysFrom(0), outcome: "no reply" }]);
      setSentMessages(all => [...all, {id: `inbox-reply-${m.id}`, participantId: m.participantId, suggestionId: null, coordinatorName: C.coordinatorName, text, sentAt: new Date().toISOString(), reply: null, channel: m.channel, stageBefore: views.find(v=>v.participant.id===m.participantId)?.stage ?? "new", volunteerId: assignments[m.participantId]}]);
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
      if (s.status !== "pending") return;
      const now = new Date().toISOString();
      setSentMessages(all => [...all, {id: `msg-${s.id}`, participantId: s.participantId, suggestionId: s.id, coordinatorName: C.coordinatorName, text: message, sentAt: now, reply: null, channel: s.channel, stageBefore: views.find(v => v.participant.id === s.participantId)?.stage ?? "new", volunteerId: assignments[s.participantId]}]);
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
      const v = views.find((x) => x.participant.id === s.participantId);
      const alt = catalog.get(s.alternateNextStepId);
      if (!v || !alt) return s;
      return { ...s, nextStepId: alt.id, alternateNextStepId: s.nextStepId, editedMessage: null, lowData: false, draftMessage: draftMessage(v.participant, v.stage, alt, s.channel) };
    }),
    setChannel: (id, channel) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s || s.channel === channel) return;
      const v = views.find((x) => x.participant.id === s.participantId);
      update(id, (x) => {
        const step = catalog.get(x.nextStepId);
        if (!v || !step) return { ...x, channel };
        return { ...x, channel, draftMessage: draftMessage({...v.participant, language: x.messageLanguage ?? v.participant.language}, v.stage, step, channel) };
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
      setSentMessages(all => all.map(x => x.id === messageId ? {...x, reply} : x));
      incoming(m.participantId, reply, "your message");
    },
  };
  useEffect(() => {
    const channel = new BroadcastChannel('journey-check-in');
    channel.onmessage = event => { const value = event.data; if (typeof value?.sessionId === 'string' && typeof value?.identity === 'string') store.checkIn(value.sessionId, value.identity); };
    return () => channel.close();
  }, [sessions, checkIns, participants, events, sentMessages]);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const s = useContext(Ctx);
  const session = useDemoSession();
  if (!s) throw new Error("useJourney must be used inside JourneyProvider");
  if (session?.role === 'volunteer') {
    const views = s.views.filter(v => v.connection?.volunteerId === SHIVAM_ID);
    const ids = new Set(views.map(v => v.participant.id));
    const pending = s.pending.filter(v => ids.has(v.participantId));
    const sentMessages = s.sentMessages.filter(v => ids.has(v.participantId));
    const inbox = s.inbox.filter(v => ids.has(v.participantId));
    const groups = s.groups.filter(g => g.volunteer.id === SHIVAM_ID);
    return { ...s, views, groups, unassigned: [], pending, sentMessages, inbox,
      activeVolunteer: SHIVAM_ID, myFollowUps: true, setActiveVolunteer: (_id: string) => {}, setMyFollowUps: (_on: boolean) => {},
      activity: s.activity.filter(v => ids.has(v.participantId)), replies: s.replies.filter(v => ids.has(v.participantId)),
      practice: s.practice.filter(v => ids.has(v.participantId)), checkIns: s.checkIns.filter(v => !v.participantId || ids.has(v.participantId)),
      needsFollowUp: s.needsFollowUp.filter(v => ids.has(v.participant.id)), priority: s.priority.filter(v => ids.has(v.participant.id)),
      stageCounts: s.stageCounts.map(stage=>({...stage,count:views.filter(v=>v.stage===stage.id).length})),
      upcoming: s.upcoming.map(item=>({...item,suggestedFor:pending.filter(p=>p.nextStepId===item.step.id).length})),
      reminders: s.reminders.filter(v=>!v.participantId||ids.has(v.participantId)),
      brief: s.sahayak.on ? briefItems({views,groups,inbox,upcoming:s.upcoming}) : [],
      summary: {...s.summary,total:views.length,totalNote:'your group',needFollowUp:views.filter(v=>v.stage!=='paused').length,needTrend:'your group',waiting:pending.length,waitingNote:'your group',sentThisWeek:sentMessages.filter(m=>daysSince(m.sentAt)<7).length,sentTrend:'your group'},
    };
  }
  return s;
}

/** Participant screens use only this hook: it never returns other people's data or internal stage wording. */
export function useMe() {
  const { me, catalogList, logPractice, markInterested, replyToMessage } = useJourney();
  return { me, catalogList, logPractice, markInterested, replyToMessage };
}
export { participantStage };
