/**
 * Who belongs to which volunteer, and the plain-language reason for it.
 *
 * A person sits in the group of the volunteer they did their most recent course,
 * retreat or session with. Anyone can be moved by hand, and the move is remembered
 * separately so the records that made the link are never rewritten.
 */
import { STAGES } from './config';
import { parseIso } from './dates';
import { VOLUNTEERS, type Volunteer } from './operations';
import type { Connection, EventType, History, Participant, StageId } from './types';

/** How a shared gathering is named inside a sentence. */
const ARTICLE_LABEL: Record<EventType, string> = {
  'follow-up': 'a weekly follow-up',
  satsang: 'a satsang',
  retreat: 'a retreat',
  'online session': 'an online session',
  seva: 'seva',
};
/** How the same gathering is named in a list. */
const PLAIN_LABEL: Record<EventType, string> = {
  'follow-up': 'weekly follow-up',
  satsang: 'satsang',
  retreat: 'retreat',
  'online session': 'online session',
  seva: 'seva',
};

const monthOf = (iso: string) => parseIso(iso).toLocaleDateString('en', { month: 'long' });
const nameOf = (id: string) => VOLUNTEERS.find((v) => v.id === id)?.name ?? 'the volunteer';

export interface SharedRecord {
  volunteerId: string;
  program: string;
  date: string;
  kind: 'course' | 'event';
}

/** Every course or gathering on record that names a volunteer, newest first. */
export function sharedRecords(history: History): SharedRecord[] {
  const rows: SharedRecord[] = [
    ...history.courses
      .filter((c): c is typeof c & { volunteerId: string } => !!c.volunteerId)
      .map((c) => ({ volunteerId: c.volunteerId, program: c.courseName, date: c.completedOn, kind: 'course' as const })),
    ...history.events
      .filter((e): e is typeof e & { volunteerId: string } => !!e.volunteerId)
      .map((e) => ({ volunteerId: e.volunteerId, program: PLAIN_LABEL[e.eventType], date: e.date, kind: 'event' as const })),
  ];
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function reasonFor(row: SharedRecord, volunteerName: string) {
  const what = row.kind === 'course' ? `Did ${row.program}` : `Came to ${ARTICLE_LABEL[row.program as EventType] ?? row.program}`;
  return `${what} with ${volunteerName} in ${monthOf(row.date)}`;
}

/**
 * The volunteer this person is connected to. A coordinator's move wins over the
 * records, but the shared program is still shown when there is one.
 */
export function connectionOf(participantId: string, history: History, assignments: Record<string, string>): Connection | null {
  const rows = sharedRecords(history);
  const override = assignments[participantId] || undefined;
  const volunteerId = override ?? rows[0]?.volunteerId;
  if (!volunteerId) return null;
  const volunteerName = nameOf(volunteerId);
  const shared = rows.find((r) => r.volunteerId === volunteerId);
  if (!shared) {
    return { volunteerId, volunteerName, program: null, date: null, reason: `Moved to ${volunteerName}'s group`, moved: true };
  }
  return {
    volunteerId,
    volunteerName,
    program: shared.program,
    date: shared.date,
    reason: reasonFor(shared, volunteerName),
    moved: !!override && override !== rows[0]?.volunteerId,
  };
}

/** Other volunteers this person has done something with, newest first. */
export function alsoKnowsOf(history: History, currentId: string | undefined): string[] {
  const seen: string[] = [];
  for (const row of sharedRecords(history)) {
    if (row.volunteerId !== currentId && !seen.includes(row.volunteerId)) seen.push(row.volunteerId);
  }
  return seen;
}

/** Who is whose, straight from the records — the starting point before any hand moves. */
export function deriveAssignments(participants: Participant[], histories: (id: string) => History): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of participants) {
    const top = sharedRecords(histories(p.id))[0];
    if (top) out[p.id] = top.volunteerId;
  }
  return out;
}

/** The shape buildGroups needs; ParticipantView satisfies it without importing the store. */
export interface Groupable {
  participant: Participant;
  history: History;
  stage: StageId;
  connection: Connection | null;
}

export interface GroupProgram {
  name: string;
  kind: 'course' | 'event';
  people: number;
}

export interface VolunteerGroup {
  volunteer: Volunteer;
  members: Groupable[];
  /** People in this group who have gone quiet (60 to 180 days with nothing on record). */
  goingQuiet: number;
  /** People in this group who have been away for even longer. */
  dormant: number;
  stageCounts: { id: StageId; label: string; count: number }[];
  /** Programs this volunteer shared with at least one member, most shared first. */
  programs: GroupProgram[];
  /** Members over this volunteer's weekly capacity. */
  over: boolean;
}

/** One group per volunteer, in the order the volunteers are listed. */
export function buildGroups(views: Groupable[]): VolunteerGroup[] {
  return VOLUNTEERS.map((volunteer) => {
    const members = views.filter((v) => v.connection?.volunteerId === volunteer.id);
    const counts = new Map<string, GroupProgram>();
    for (const m of members) {
      for (const row of sharedRecords(m.history).filter((r) => r.volunteerId === volunteer.id)) {
        const key = `${row.kind}:${row.program}`;
        const hit = counts.get(key);
        if (hit) hit.people += 1;
        else counts.set(key, { name: row.program, kind: row.kind, people: 1 });
      }
    }
    return {
      volunteer,
      members,
      goingQuiet: members.filter((m) => m.stage === 'quiet').length,
      dormant: members.filter((m) => m.stage === 'dormant').length,
      stageCounts: STAGES.map((s) => ({ id: s.id, label: s.label, count: members.filter((m) => m.stage === s.id).length })),
      programs: [...counts.values()].sort((a, b) => b.people - a.people || a.name.localeCompare(b.name)),
      over: members.length > volunteer.capacity,
    };
  });
}

/** Groups with the most people drifting away first — the order the dashboard card uses. */
export function groupsNeedingAttention(groups: VolunteerGroup[]): VolunteerGroup[] {
  return [...groups].sort(
    (a, b) => b.goingQuiet - a.goingQuiet || b.dormant - a.dormant || a.volunteer.name.localeCompare(b.volunteer.name),
  );
}

/** People nobody has connected to a volunteer yet. */
export function unassignedViews(views: Groupable[]): Groupable[] {
  return views.filter((v) => !v.connection);
}

export interface GroupSuggestion {
  id: string;
  text: string;
  why: string;
}

/**
 * What Sahayak would do for this group next. Every line comes from the group's own
 * records — it never invents a date, a program or a person.
 */
export function groupSuggestions(group: VolunteerGroup): GroupSuggestion[] {
  const { volunteer, members } = group;
  const out: GroupSuggestion[] = [];
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

  if (group.goingQuiet > 0) {
    out.push({
      id: `quiet-${volunteer.id}`,
      text: `${plural(group.goingQuiet, 'person')} in ${volunteer.name}'s group ${group.goingQuiet === 1 ? 'has' : 'have'} gone quiet. ${volunteer.name.split(' ')[0]} could reach out.`,
      why: `${group.goingQuiet === 1 ? 'They have' : 'They all have'} been away for 60 days or more, and ${volunteer.name.split(' ')[0]} is the one they last did something with.`,
    });
  }

  const recent = group.programs.filter((p) => p.kind === 'course' && p.people >= 2);
  const newest = members
    .map((m) => sharedRecords(m.history).find((r) => r.volunteerId === volunteer.id && r.kind === 'course'))
    .filter((r): r is SharedRecord => !!r)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (recent.length && newest) {
    const onProgram = members.filter((m) =>
      sharedRecords(m.history).some((r) => r.volunteerId === volunteer.id && r.program === newest.program),
    ).length;
    out.push({
      id: `reunion-${volunteer.id}`,
      text: `${plural(onProgram, 'person')} did ${newest.program} with ${volunteer.name} in ${monthOf(newest.date)}. A reunion satsang would bring them back together.`,
      why: `They share one course and one teacher, so a gathering in ${volunteer.name.split(' ')[0]}'s name lands warmer than a note from the centre.`,
    });
  }

  if (group.dormant > 0) {
    out.push({
      id: `dormant-${volunteer.id}`,
      text: `${plural(group.dormant, 'person')} in ${volunteer.name}'s group have been away a long time.`,
      why: 'A warm, low-pressure note from the person they know is usually enough to reopen the conversation.',
    });
  }

  const room = volunteer.capacity - members.length;
  out.push({
    id: `capacity-${volunteer.id}`,
    text: room > 0 ? `${volunteer.name}'s group is at ${members.length} of ${volunteer.capacity} — room for ${plural(room, 'more person', 'more people')}.` : `${volunteer.name}'s group is full at ${volunteer.capacity}.`,
    why: room > 0 ? 'Unassigned people can be added here, same city and language first.' : 'New people will need another volunteer with room.',
  });

  return out;
}

/**
 * A warm invite for the whole group. It names the volunteer and the program they
 * share, and asks about a time instead of inventing one.
 */
export function draftGroupMessage(group: VolunteerGroup, channel: 'whatsapp' | 'email' | 'sms', coordinatorName: string): string {
  const { volunteer, members } = group;
  const first = volunteer.name.split(' ')[0];
  const shared = group.programs[0]?.name ?? 'the programs they shared';
  const french = members.filter((m) => m.participant.language === 'French').length > members.filter((m) => m.participant.language === 'English').length;
  const names = members.slice(0, 3).map((m) => m.participant.firstName).join(', ');
  const more = members.length > 3 ? ` and ${members.length - 3} others` : '';

  if (french) {
    return `Bonjour à toutes et à tous, c'est ${coordinatorName}. ${first} a réuni ${members.length} personnes autour de ${shared.toLowerCase()} — ${names}${more}. Nous pensons à vous et aimerions vous revoir. Une rencontre en groupe, le soir ou le week-end, vous conviendrait-elle ? Dites-nous simplement ce qui vous arrange. Sans aucune pression.\n\nChaleureusement,\n${coordinatorName}`;
  }
  const body = `Hi everyone, it's ${coordinatorName}. ${first} brought ${members.length} of you together around ${shared.toLowerCase()} — ${names}${more}. We've been thinking of you and would love to see the group in one room again. Would an evening or weekend satsang suit you? Just tell us what works, and we'll set it around that. No pressure at all.`;
  if (channel === 'email') {
    return `Subject: A satsang for ${first}'s group\n\n${body}\n\nWarmly,\n${coordinatorName}`;
  }
  return `${body} Warmly, ${coordinatorName}`;
}
