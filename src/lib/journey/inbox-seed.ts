import { daysAgoIso } from "./dates";
import type { Channel } from "./types";

export type InboxStatus = "needs-reply" | "replied" | "no-action";

/** One message a participant sent the coordinator. */
export interface InboxMessage {
  id: string;
  /** The person in the sample data who wrote it, so Sahayak can use their history. */
  participantId: string;
  from: string;
  channel: Channel;
  subject: string;
  preview: string;
  /** ISO date the message arrived. */
  date: string;
  status: InboxStatus;
  /** What the coordinator sent back, once a drafted reply is approved. */
  replyText: string | null;
}

/** Twelve fictional messages, mixed channels and mixed statuses, dates relative to today. */
const ROWS: [id: string, participantId: string, from: string, channel: Channel, subject: string, preview: string, days: number, status: InboxStatus][] = [
  ["i01", "p05", "Priya Nair", "whatsapp", "Tuesday follow-up", "Hi! Is the follow-up session on Tuesday still on? I'd love to come.", 1, "needs-reply"],
  ["i02", "p14", "Neha Joshi", "whatsapp", "Next Sahaj Samadhi", "When is the next Sahaj Samadhi course? I'd like to do it this year.", 3, "needs-reply"],
  ["i03", "p03", "Sofia Rossi", "sms", "Bringing a friend", "Can I bring a friend to satsang? She's curious about breathing.", 2, "needs-reply"],
  ["i04", "p23", "Elena Petrova", "whatsapp", "Thank you for checking in", "Thanks for checking in. Work has been very busy — I'll try to come next month.", 5, "needs-reply"],
  ["i05", "p20", "Grace Kim", "email", "Welcome desk", "Happy to help at the welcome desk next month. Which Sundays suit you?", 4, "replied"],
  ["i06", "p15", "Oliver Grant", "email", "Art of Silence retreat", "I'd like to join the Art of Silence retreat. How do I register?", 6, "needs-reply"],
  ["i07", "p11", "Hannah Schultz", "email", "Yoga dates", "Could you send the Sri Sri Yoga dates again? I lost the email.", 8, "needs-reply"],
  ["i08", "p19", "Arjun Patel", "whatsapp", "Hosting the follow-up", "I can host the follow-up on the 12th if you still need someone.", 7, "replied"],
  ["i09", "p24", "James O'Connor", "email", "Not right now", "Not the right time for me just now, thank you for asking.", 9, "no-action"],
  ["i10", "p28", "Robert Lindqvist", "email", "Free intro session", "Do you still run the free intro session online? I'd like to try it.", 11, "needs-reply"],
  ["i11", "p26", "Mateo Silva", "whatsapp", "Sorry for going quiet", "Sorry for going quiet — life got heavy. Is the satsang still open to me?", 14, "needs-reply"],
  ["i12", "p25", "Ananya Rao", "sms", "A quiet period", "Please don't message me about courses for a while. I'll reach out when I'm ready.", 12, "no-action"],
];

export function buildInbox(): InboxMessage[] {
  return ROWS.map(([id, participantId, from, channel, subject, preview, days, status]) => ({
    id, participantId, from, channel, subject, preview,
    date: daysAgoIso(days), status, replyText: null,
  }));
}

/** Messages the coordinator still owes an answer to, newest first by how long they've waited. */
export const needsReply = (m: InboxMessage) => m.status === "needs-reply";
