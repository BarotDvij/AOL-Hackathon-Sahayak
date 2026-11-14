import { JOURNEY_CONFIG } from "./config";
import { daysAgoIso } from "./dates";
import type { Message, PracticeLog, StageId } from "./types";

/** Stages shown in the demo participant picker, one person each. */
export const PICKER_STAGES: StageId[] = ["new", "building", "active", "serving", "quiet"];
/** Fixed fictional identity for the current no-login participant demo. */
export const TEMP_PARTICIPANT_ID = "p05";

const PATTERNS = [[1, 2, 4, 6, 9, 10, 11], [0, 1, 2, 3, 5, 8], [1, 3, 4, 5, 6, 12, 13, 14], [2, 5, 7, 20, 21, 22], [30, 31, 32, 45]];

export function demoSeed(pickerIds: string[], firstNames: Record<string, string>) {
  const practice: PracticeLog[] = [];
  const messages: Message[] = [];
  pickerIds.forEach((id, i) => {
    (PATTERNS[i % PATTERNS.length] ?? []).forEach((d, j) => practice.push({ participantId: id, date: daysAgoIso(d), minutes: j % 2 ? 20 : null }));
    const name = firstNames[id] ?? "friend";
    messages.push({ id: `seed-${id}-1`, participantId: id, suggestionId: null, coordinatorName: JOURNEY_CONFIG.coordinatorName, sentAt: `${daysAgoIso(40 + i * 7)}T15:00:00.000Z`, reply: "join",
      text: `Hi ${name}, it was lovely to see you at the course. Our weekly follow-up is a gentle way to keep the practice going. You'd be very welcome.\n\nWarmly, ${JOURNEY_CONFIG.coordinatorName}` });
    if (i % 2 === 0) messages.push({ id: `seed-${id}-2`, participantId: id, suggestionId: null, coordinatorName: JOURNEY_CONFIG.coordinatorName, sentAt: `${daysAgoIso(20 + i * 3)}T14:00:00.000Z`, reply: null,
      text: `Hi ${name}, just thinking of you and hoping your practice is bringing you some ease this month. No need to reply. 🙏\n\n${JOURNEY_CONFIG.coordinatorName}` });
  });
  return { practice, messages };
}
