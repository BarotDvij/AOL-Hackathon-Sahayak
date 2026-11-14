import type { Program, ProgramPrerequisite } from "./programs";

export type Channel = "whatsapp" | "email" | "sms";
export type EventType = "follow-up" | "satsang" | "retreat" | "online session" | "seva";
export type StageId = "paused" | "new" | "building" | "active" | "serving" | "quiet" | "dormant";

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  /** Fictional demo age, used to enforce youth/adult program eligibility. */
  age: number;
  city: string; // "Online" for online-only
  language: string;
  email: string | null;
  phone: string | null;
  preferredChannel: Channel | null;
  prefersOnline?: boolean | undefined;
  doNotContact: boolean;
  sevaRole: string | null;
  interests: string[];
}
export interface CourseCompletion { participantId: string; courseName: string; completedOn: string }
export interface EventAttendance { participantId: string; eventType: EventType; date: string; city: string; online: boolean }
export interface Contact {
  participantId: string;
  channel: Channel;
  direction: "out" | "in";
  date: string;
  outcome: "replied" | "no reply" | "declined" | "enrolled";
  nextStepId?: string;
}
export interface NextStep {
  id: string;
  type: "course" | "retreat" | "seva" | "check-in" | "event";
  title: string;
  shortTitle: string;
  startDate?: string;
  city: string; // city name or "Online"
  language: string;
  prerequisite?: string; // non-course demo events only
  completesCourse?: string;
  stageFit: StageId[];
  tags: string[];
  link: string;
  /** Present only for courses loaded from Lovable Cloud. */
  program?: Program;
  programPrerequisites?: ProgramPrerequisite[];
}
export interface Reason { code: string; days?: number | undefined; count?: number | undefined; text?: string | undefined }
export interface StageResult { stage: StageId; reasons: Reason[] }
export interface Suggestion {
  id: string;
  participantId: string;
  nextStepId: string;
  alternateNextStepId: string | null;
  channel: Channel;
  why: string;
  draftMessage: string;
  editedMessage: string | null;
  status: "pending" | "approved" | "skipped";
  skipReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  /** True when the participant has so little on record that only a check-in is honest. */
  lowData: boolean;
}
/** One line in the coordinator's activity history: what happened, to whom, when. */
export interface ActivityEntry {
  id: string;
  at: string;
  kind: "approved" | "edited" | "skipped" | "replied";
  participantId: string;
  detail: string;
}
export interface History {
  courses: CourseCompletion[];
  events: EventAttendance[];
  contacts: Contact[];
}
export interface PracticeLog { participantId: string; date: string; minutes: number | null }
export interface Message { id: string; participantId: string; suggestionId: string | null; coordinatorName: string; text: string; sentAt: string; reply: "join" | "not now" | null }
export interface ParticipantReply { id: string; participantId: string; kind: "interested" | "join" | "not now"; about: string; at: string }
