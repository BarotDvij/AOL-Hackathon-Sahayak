import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { buildCatalog } from "./catalog";
import { JOURNEY_CONFIG } from "./config";
import { isoDaysFrom } from "./dates";
import { draftMessage } from "./messages";
import { buildSampleData } from "./sample-data";
import { computeStage, explainReasons } from "./stages";
import { buildSuggestion } from "./suggestions";
import type { Contact, History, NextStep, Participant, StageId, Suggestion } from "./types";

export interface ParticipantView {
  participant: Participant;
  history: History;
  stage: StageId;
  why: string;
  suggestion: Suggestion | null;
}

interface Store {
  views: ParticipantView[];
  catalog: Map<string, NextStep>;
  pending: Suggestion[];
  approve: (id: string, message: string) => void;
  skip: (id: string, reason: string) => void;
  useAlternate: (id: string) => void;
  editMessage: (id: string, message: string) => void;
}

const Ctx = createContext<Store | null>(null);

function initial() {
  const data = buildSampleData();
  const catalogList = buildCatalog();
  const suggestions: Suggestion[] = [];
  for (const p of data.participants) {
    const h = historyFor(p.id, data.courses, data.events, data.contacts);
    const { stage, reasons } = computeStage(p, h);
    const s = buildSuggestion(p, h, stage, explainReasons(reasons), catalogList);
    if (s) suggestions.push(s);
  }
  return { data, catalogList, suggestions };
}

function historyFor(id: string, courses: History["courses"], events: History["events"], contacts: Contact[]): History {
  return { courses: courses.filter((c) => c.participantId === id), events: events.filter((e) => e.participantId === id), contacts: contacts.filter((c) => c.participantId === id) };
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [{ data, catalogList, suggestions: initialSuggestions }] = useState(initial);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [contacts, setContacts] = useState(data.contacts);
  const catalog = useMemo(() => new Map(catalogList.map((s) => [s.id, s])), [catalogList]);

  const views = useMemo<ParticipantView[]>(() => data.participants.map((p) => {
    const history = historyFor(p.id, data.courses, data.events, contacts);
    const { stage, reasons } = computeStage(p, history);
    return { participant: p, history, stage, why: explainReasons(reasons), suggestion: suggestions.find((s) => s.participantId === p.id) ?? null };
  }), [data, contacts, suggestions]);

  const update = useCallback((id: string, fn: (s: Suggestion) => Suggestion) => setSuggestions((all) => all.map((s) => (s.id === id ? fn(s) : s))), []);

  const store: Store = {
    views, catalog,
    pending: suggestions.filter((s) => s.status === "pending"),
    editMessage: (id, message) => update(id, (s) => ({ ...s, editedMessage: message })),
    approve: (id, message) => {
      const s = suggestions.find((x) => x.id === id);
      if (!s) return;
      update(id, (x) => ({ ...x, editedMessage: message, status: "approved", reviewedBy: JOURNEY_CONFIG.coordinatorName, reviewedAt: new Date().toISOString() }));
      setContacts((c) => [...c, { participantId: s.participantId, channel: s.channel, direction: "out", date: isoDaysFrom(0), outcome: "no reply", nextStepId: s.nextStepId }]);
    },
    skip: (id, reason) => update(id, (s) => ({ ...s, status: "skipped", skipReason: reason, reviewedBy: JOURNEY_CONFIG.coordinatorName, reviewedAt: new Date().toISOString() })),
    useAlternate: (id) => update(id, (s) => {
      if (!s.alternateNextStepId) return s;
      const v = views.find((x) => x.participant.id === s.participantId)!;
      const alt = catalog.get(s.alternateNextStepId)!;
      return { ...s, nextStepId: alt.id, alternateNextStepId: s.nextStepId, editedMessage: null, draftMessage: draftMessage(v.participant, v.stage, alt, s.channel) };
    }),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useJourney must be used inside JourneyProvider");
  return s;
}
