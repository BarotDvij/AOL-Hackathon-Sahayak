import { createContext, useContext, useMemo, useState, type ReactNode, type SetStateAction, type Dispatch } from "react";
import { ALL_SAHAYAK_ACCESS_IDS, SahayakConsentDialog, type SahayakAccessId } from "@/components/participant/SahayakConsentDialog";
import { useDemoSession } from '@/lib/journey/demo-session';
import type { Program } from "@/lib/journey/programs";
import type { NextStep } from "@/lib/journey/types";
import { useJourney } from "@/lib/journey/store";
import { completionKey, markDayDone } from "@/lib/sahayak/practice-plan";
import { friendlyStageFor, journeyPosition, levelFromHistory, prefersOnline, weeklyPlan, JOURNEY_LADDER, milestones, normalizeOnboardingAnswers, participantEvents, practiceDto, recommendedSchedule, type OnboardingAnswers } from "@/lib/sahayak/core";

interface DemoGoal { id: string; period: "week" | "month" | "quarter" | "year"; text: string; createdAt: string }
export interface DemoChatReply { id: string; messageId: string; text: string; sentAt: string }

interface DemoParticipantValue {
  data: NonNullable<ReturnType<typeof useDemoData>>;
  logToday: () => void;
  isDayDone: (day: string) => boolean;
  completeDay: (day: string) => void;
  showInterest: (eventId: string) => void;
  saveGoal: (period: "week" | "month" | "quarter" | "year", text: string) => void;
  respond: (messageId: string, reply: "join" | "not now") => void;
  chatReplies: DemoChatReply[];
  sendChatReply: (messageId: string, text: string) => boolean;
  saveAnswers: (answers: OnboardingAnswers) => void;
  welcomeOpen: boolean;
  openWelcome: () => void;
  closeWelcome: () => void;
  sahayakOn: boolean;
  sahayakAccess: SahayakAccessId[];
  requestSahayak: (on: boolean) => void;
  sahayakConsentOpen: boolean;
  acceptSahayakConsent: (ids: SahayakAccessId[]) => void;
  declineSahayakConsent: () => void;
  openSahayakConsent: () => void;
}

const DemoParticipantContext = createContext<DemoParticipantValue | null>(null);

function useDemoData(
  me: ReturnType<typeof useJourney>["me"],
  answers: OnboardingAnswers,
  goals: DemoGoal[],
  interests: string[],
  catalogList: NextStep[],
  programs: Program[],
) {
  return useMemo(() => {
    if (!me) return null;
    const history = { ...me.history, contacts: [] };
    const rows = me.practice.map((entry) => ({ id: `${entry.participantId}-${entry.date}`, practiced_on: entry.date, minutes: entry.minutes }));
    const upcoming = participantEvents(me.participant.id, "https://demo.invalid", 20, catalogList, { prefersOnline: prefersOnline(answers), location: answers.location, courseLevel: answers.course_level }).map((event) => ({
      ...event,
      calendarUrl: event.calendarUrl?.startsWith("data:") ? event.calendarUrl : event.calendarUrl ? new URL(event.calendarUrl).pathname : null,
    }));
    return {
      participant: { id: me.participant.id, firstName: me.participant.firstName, lastName: me.participant.lastName, city: answers.location || me.participant.city },
      stage: friendlyStageFor({ participant: me.participant, history, stage: me.stage }),
      answers,
      position: journeyPosition(answers, levelFromHistory(history)),
      plan: weeklyPlan(answers, me.stage, levelFromHistory(history)),
      guideline: JOURNEY_LADDER[journeyPosition(answers, levelFromHistory(history)).current]?.practice ?? "",
      schedule: recommendedSchedule(answers, me.stage, history, programs),
      practice: practiceDto(rows, me.participant.id),
      goals,
      messages: me.messages,
      upcoming,
      interests,
      milestones: milestones(me.participant, history, me.practice),
      timeline: [
        ...me.history.courses.map((course) => ({ date: course.completedOn, kind: "course", text: `Completed ${course.courseName}` })),
        ...me.history.events.map((event) => ({ date: event.date, kind: "event", text: `Attended a ${event.eventType}${event.online ? " (online)" : ""}` })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [me, answers, goals, interests, catalogList, programs]);
}

/** Each selected participant retains separate browser-memory answers and progress. */
function useParticipantState<T>(initial:T):[T,Dispatch<SetStateAction<T>>] {
 const id=useDemoSession()?.participantId ?? 'p05';
 const [values,setValues]=useState<Record<string,T>>({});
 const value=values[id] ?? initial;
 const setValue:Dispatch<SetStateAction<T>>=next=>setValues(all=>({...all,[id]:typeof next==='function'?(next as (old:T)=>T)(all[id] ?? initial):next}));
 return [value,setValue];
}
/** Selected fictional participant for the browser-local demo. */
export function DemoParticipantProvider({ children }: { children: ReactNode }) {
  const { me, catalogList, programCatalog, logPractice, markInterested, replyToMessage } = useJourney();
  const [answers, setAnswers] = useParticipantState<OnboardingAnswers>({});
  const [goals, setGoals] = useParticipantState<DemoGoal[]>([]);
  const [interests, setInterests] = useParticipantState<string[]>([]);
  // The intake overlay never opens by itself: the participant asks for it from Home.
  const [welcomeOpen, setWelcomeOpen] = useParticipantState(false);
  const [sahayakOn, setSahayakOn] = useParticipantState(false);
  const [sahayakAccess, setSahayakAccess] = useParticipantState<SahayakAccessId[]>([]);
  const [consentOpen, setConsentOpen] = useParticipantState(false);
  const [chatReplies, setChatReplies] = useParticipantState<DemoChatReply[]>([]);
  const [completedDays, setCompletedDays] = useParticipantState<string[]>([]);
  const data = useDemoData(me, answers, goals, interests, catalogList, programCatalog.programs);

  if (!data) return <main className="p-8 text-sm text-muted-foreground">Loading the sample journey…</main>;

  const requestSahayak = (on: boolean) => {
    if (on) setConsentOpen(true);
    else { setSahayakOn(false); setSahayakAccess([]); }
  };
  const acceptSahayakConsent = (ids: SahayakAccessId[]) => {
    const granted = ids.filter((id) => ALL_SAHAYAK_ACCESS_IDS.includes(id));
    if (granted.length === 0) return;
    setSahayakAccess(granted);
    setSahayakOn(true);
    setConsentOpen(false);
  };
  const declineSahayakConsent = () => setConsentOpen(false);
  const openSahayakConsent = () => setConsentOpen(true);

  const value: NonNullable<React.ContextType<typeof DemoParticipantContext>> = {
    data,
    logToday: () => logPractice(),
    isDayDone: (day) => completedDays.includes(completionKey(day)),
    completeDay: (day) => {
      if (!data.plan.some((entry) => entry.day === day)) return;
      setCompletedDays((current) => markDayDone(current, day));
    },
    showInterest: (eventId) => {
      setInterests((current) => current.includes(eventId) ? current : [...current, eventId]);
      markInterested(eventId);
    },
    saveGoal: (period, text) => setGoals((current) => [{ id: `goal-${Date.now()}`, period, text, createdAt: new Date().toISOString() }, ...current]),
    respond: replyToMessage,
    chatReplies,
    sendChatReply: (messageId, text) => {
      const clean = text.trim();
      if (!clean || clean.length > 2000 || !data.messages.some((message) => message.id === messageId)) return false;
      setChatReplies((current) => [...current, { id: crypto.randomUUID(), messageId, text: clean, sentAt: new Date().toISOString() }]);
      return true;
    },
    saveAnswers: (next) => setAnswers(normalizeOnboardingAnswers(next)),
    welcomeOpen,
    openWelcome: () => setWelcomeOpen(true),
    closeWelcome: () => setWelcomeOpen(false),
    sahayakOn,
    sahayakAccess,
    requestSahayak,
    sahayakConsentOpen: consentOpen,
    acceptSahayakConsent,
    declineSahayakConsent,
    openSahayakConsent,
  };

  return (
    <DemoParticipantContext.Provider value={value}>
      {children}
      <SahayakConsentDialog open={consentOpen} selected={sahayakAccess} onAccept={acceptSahayakConsent} onDecline={() => setConsentOpen(false)} />
    </DemoParticipantContext.Provider>
  );
}

export function useDemoParticipant() {
  const context = useContext(DemoParticipantContext);
  if (!context) throw new Error("useDemoParticipant must be used inside DemoParticipantProvider");
  return context;
}
