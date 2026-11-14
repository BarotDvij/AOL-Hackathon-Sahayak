import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { TEMP_PARTICIPANT_ID } from "@/lib/journey/demo-seed";
import { useJourney } from "@/lib/journey/store";
import { friendlyStageFor, milestones, normalizeOnboardingAnswers, participantEvents, practiceDto, recommendedSchedule, type OnboardingAnswers } from "@/lib/sahayak/core";

interface DemoGoal { id: string; period: "quarter" | "year"; text: string; createdAt: string }

/** Public sample events keep relative calendar links so SSR and the browser agree. */
const DEMO_UPCOMING = participantEvents(TEMP_PARTICIPANT_ID, "https://demo.invalid").map((event) => ({
  ...event,
  calendarUrl: event.calendarUrl ? new URL(event.calendarUrl).pathname : null,
}));

function makeContextValue() {
  return null as unknown as {
    data: NonNullable<ReturnType<typeof useDemoData>>;
    logToday: () => void;
    showInterest: (eventId: string) => void;
    saveGoal: (period: "quarter" | "year", text: string) => void;
    respond: (messageId: string, reply: "join" | "not now") => void;
    saveAnswers: (answers: OnboardingAnswers) => void;
  };
}

const DemoParticipantContext = createContext<ReturnType<typeof makeContextValue> | null>(null);

function useDemoData(
  me: ReturnType<typeof useJourney>["me"],
  answers: OnboardingAnswers,
  goals: DemoGoal[],
  interests: string[],
) {
  return useMemo(() => {
    if (!me) return null;
    const history = { ...me.history, contacts: [] };
    const rows = me.practice.map((entry) => ({ id: `${entry.participantId}-${entry.date}`, practiced_on: entry.date, minutes: entry.minutes }));
    return {
      participant: { id: me.participant.id, firstName: me.participant.firstName, lastName: me.participant.lastName, city: me.participant.city },
      stage: friendlyStageFor({ participant: me.participant, history, stage: me.stage }),
      answers,
      schedule: recommendedSchedule(answers, me.stage),
      practice: practiceDto(rows, me.participant.id),
      goals,
      messages: me.messages,
      upcoming: DEMO_UPCOMING,
      interests,
      milestones: milestones(me.participant, history, me.practice),
      timeline: [
        ...me.history.courses.map((course) => ({ date: course.completedOn, kind: "course", text: `Completed ${course.courseName}` })),
        ...me.history.events.map((event) => ({ date: event.date, kind: "event", text: `Attended a ${event.eventType}${event.online ? " (online)" : ""}` })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [me, answers, goals, interests]);
}

/** A fixed fictional participant for the no-login demo. Nothing here leaves the browser. */
export function DemoParticipantProvider({ children }: { children: ReactNode }) {
  const { me, logPractice, markInterested, replyToMessage } = useJourney();
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [goals, setGoals] = useState<DemoGoal[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const data = useDemoData(me, answers, goals, interests);

  if (!data) return <main className="p-8 text-sm text-muted-foreground">Loading the sample journey…</main>;

  const value: NonNullable<React.ContextType<typeof DemoParticipantContext>> = {
    data,
    logToday: () => logPractice(),
    showInterest: (eventId) => {
      setInterests((current) => current.includes(eventId) ? current : [...current, eventId]);
      markInterested(eventId);
    },
    saveGoal: (period, text) => setGoals((current) => [{ id: `goal-${Date.now()}`, period, text, createdAt: new Date().toISOString() }, ...current]),
    respond: replyToMessage,
    saveAnswers: (next) => setAnswers(normalizeOnboardingAnswers(next)),
  };

  return <DemoParticipantContext.Provider value={value}>{children}</DemoParticipantContext.Provider>;
}

export function useDemoParticipant() {
  const context = useContext(DemoParticipantContext);
  if (!context) throw new Error("useDemoParticipant must be used inside DemoParticipantProvider");
  return context;
}
