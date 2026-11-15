import { daysSince, isoDaysFrom, parseIso, today } from './dates';
import { JOURNEY_CONFIG } from './config';
import type { Channel, History, Message, Participant, StageId } from './types';

export type Outcome = 'Waiting' | 'Replied' | 'Attended' | 'No response after 14 days';
export interface SentRecord extends Message { channel: Channel; stageBefore: StageId; attendedAt?: string; attendedSession?: string; volunteerId?: string | undefined }
export interface Volunteer { id: string; name: string; city: string; languages: string[]; capacity: number }
export interface Session { id: string; name: string; city: string; date: string; eventType: History['events'][number]['eventType']; courseName?: string; ended: boolean }
export interface CheckIn { sessionId: string; participantId: string; at: string; firstTimer: boolean; stageBefore: StageId }
export const VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Maya Desai', city: 'Waterloo', languages: ['English'], capacity: 8 },
  { id: 'v2', name: 'Alex Tremblay', city: 'Toronto', languages: ['English', 'French'], capacity: 8 },
  { id: 'v3', name: 'Claire Roy', city: 'Kitchener', languages: ['English', 'French'], capacity: 7 },
  { id: 'v4', name: 'Shivam Kapoor', city: 'Mississauga', languages: ['English'], capacity: 8 },
  { id: 'v5', name: 'Camille Martin', city: 'Online', languages: ['English', 'French'], capacity: 6 },
];
export function buildSessions(): Session[] {
  return ['Weekly follow-up', 'Satsang', 'Sahaj Samadhi Meditation', 'Art of Silence', 'Sri Sri Yoga'].flatMap((name, i) => [-1, 1].map((direction) => ({
    id: `session-${i}-${direction}`, name, city: VOLUNTEERS[i]?.city ?? 'Waterloo', date: isoDaysFrom(direction * (i + 1)), ended: direction < 0,
    eventType: i === 0 ? 'follow-up' as const : i === 1 ? 'satsang' as const : 'retreat' as const,
    ...(i > 1 ? { courseName: name } : {}),
  })));
}
export function messageOutcome(m: SentRecord, now = today()): Outcome {
  if (m.attendedAt) return 'Attended';
  if (m.reply) return 'Replied';
  return daysSince(m.sentAt.slice(0, 10), now) >= 14 ? 'No response after 14 days' : 'Waiting';
}
export const broughtBack = (m: SentRecord) => !!m.attendedAt && (m.stageBefore === 'quiet' || m.stageBefore === 'dormant');
export const differentChannel = (channel: Channel, p: Participant): Channel => channel !== 'email' && p.email ? 'email' : channel !== 'sms' && p.phone ? 'sms' : 'whatsapp';
export function seedOutcomes(participants: Participant[], histories: (id: string) => History, stages: (id: string) => StageId): SentRecord[] {
  // Twenty approved demo messages: eight replies and five subsequent visits.
  const candidates = participants.filter(p => !p.doNotContact);
  const attendees = candidates.filter(p => histories(p.id).events.length > 0).slice(0, 5);
  const ordered = [...attendees, ...candidates.filter(p => !attendees.some(a => a.id === p.id))].slice(0,20);
  return ordered.map((p, i) => {
    const h = histories(p.id);
    const visit = [...h.events].sort((a,b) => b.date.localeCompare(a.date))[0];
    const sentDate = i < 5 && visit ? isoDaysFrom(-3, parseIso(visit.date)) : isoDaysFrom(i >= 13 && i < 16 ? -3 : -22);
    return { id: `outcome-${p.id}`, participantId: p.id, suggestionId: null, coordinatorName: JOURNEY_CONFIG.coordinatorName,
      text: p.language === 'French' ? `Bonjour ${p.firstName}, vous seriez bienvenue à notre prochaine rencontre. Sans aucune pression. Chaleureusement, ${JOURNEY_CONFIG.coordinatorName}` : `Hi ${p.firstName}, you would be very welcome at our next session. No pressure at all. Warmly, ${JOURNEY_CONFIG.coordinatorName}`,
      sentAt: `${sentDate}T15:00:00.000Z`, reply: i >= 5 && i < 13 ? 'join' : null, channel: p.preferredChannel ?? 'email', stageBefore: stages(p.id),
      ...(i < 5 && visit ? { attendedAt: visit.date, attendedSession: visit.eventType } : {}),
    };
  });
}
export interface AssignmentProposal { participantId: string; volunteerId: string; reason: string }
export function suggestAssignments(participants: Participant[], assignments: Record<string, string>, volunteers = VOLUNTEERS): AssignmentProposal[] {
  const load = Object.fromEntries(volunteers.map(v => [v.id, Object.values(assignments).filter(id => id === v.id).length]));
  const proposals: AssignmentProposal[] = [];
  for (const p of participants.filter(p => !assignments[p.id] && !p.doNotContact)) {
    const candidate = volunteers.filter(v => v.languages.includes(p.language) && (load[v.id] ?? 0) < v.capacity)
      .sort((a,b) => Number(b.city === p.city) - Number(a.city === p.city) || (load[a.id] ?? 0) - (load[b.id] ?? 0))[0];
    if (!candidate) continue;
    proposals.push({ participantId: p.id, volunteerId: candidate.id, reason: `${candidate.city === p.city ? 'Same city' : 'Can support remotely'}, speaks ${p.language}, has room this week` });
    load[candidate.id] = (load[candidate.id] ?? 0) + 1;
  }
  return proposals;
}
export function impactMetrics(people: { participant: Participant; history: History }[], messages: SentRecord[], range: number, now = today()) {
  const inRange = (date: string) => daysSince(date.slice(0,10), now) >= 0 && daysSince(date.slice(0,10), now) < range;
  const sky = (h: History) => h.courses.filter(c => c.courseName === JOURNEY_CONFIG.skyCourseName).sort((a,b) => a.completedOn.localeCompare(b.completedOn))[0];
  const cohort = people.filter(p => { const first = sky(p.history); return !!first && inRange(first.completedOn); });
  const followups = (h: History) => { const first = sky(h); return first ? h.events.filter(e => e.eventType === 'follow-up' && e.date >= first.completedOn && daysSince(e.date, now) >= 0) : []; };
  const early = (h: History) => { const first = sky(h); return !!first && followups(h).some(e => daysSince(first.completedOn, parseIso(e.date)) <= 30); };
  const regular = people.filter(p => followups(p.history).filter(e => inRange(e.date)).length >= 3);
  const deeper = people.filter(p => p.history.courses.some(c => c.courseName !== JOURNEY_CONFIG.skyCourseName && inRange(c.completedOn)) || p.history.events.some(e => e.eventType === 'seva' && inRange(e.date)));
  const scopedMessages = messages.filter(m => people.some(p => p.participant.id === m.participantId));
  const sent = scopedMessages.filter(m => inRange(m.sentAt));
  const wins = scopedMessages.filter(m => m.attendedAt && inRange(m.attendedAt)).sort((a,b) => (b.attendedAt ?? '').localeCompare(a.attendedAt ?? ''));
  const returned = wins.filter(broughtBack);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { cohort: cohort.length, early: cohort.filter(p => early(p.history)).length, earlyRate: cohort.length ? Math.round(cohort.filter(p => early(p.history)).length / cohort.length * 100) : 0,
    regular: regular.length, deeper: deeper.length, returned: new Set(returned.map(m => m.participantId)).size,
    returnedMonth: new Set(returned.filter(m => m.attendedAt && parseIso(m.attendedAt) >= monthStart).map(m => m.participantId)).size,
    visitRate: sent.length ? Math.round(sent.filter(m => !!m.attendedAt).length / sent.length * 100) : 0, wins,
    funnel: [people.filter(p => !!sky(p.history)).length, people.filter(p => followups(p.history).some(e => inRange(e.date))).length, regular.length, deeper.filter(p => followups(p.history).filter(e => inRange(e.date)).length >= 3).length],
  };
}
export function monthlyTrend(people: { history: History }[], now = today()) {
  return Array.from({length: 6}, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const cohort = people.map(p => p.history).filter(h => h.courses.some(c => c.courseName === JOURNEY_CONFIG.skyCourseName && parseIso(c.completedOn) >= month && parseIso(c.completedOn) < next));
    const early = cohort.filter(h => h.courses.some(c => c.courseName === JOURNEY_CONFIG.skyCourseName && parseIso(c.completedOn) >= month && parseIso(c.completedOn) < next && h.events.some(e => e.eventType === 'follow-up' && e.date >= c.completedOn && daysSince(c.completedOn, parseIso(e.date)) <= 30)));
    return { month: month.toLocaleDateString('en', {month:'short'}), rate: cohort.length ? Math.round(early.length / cohort.length * 100) : 0, graduates: cohort.length };
  });
}