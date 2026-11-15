import { daysAgoIso } from "./dates";
import type { Channel, Contact, CourseCompletion, EventAttendance, EventType, Participant } from "./types";

type Row = {
  n: [string, string]; age?: number; city: string; ch: Channel | null; lang?: string; dnc?: boolean; seva?: string; int?: string[];
  /** The volunteer who led this person's programs. Left out on purpose for people nobody has claimed yet. */
  v?: string;
  /** [course, days ago, volunteer who taught it] */
  c: [string, number, string?][];
  /** [event, days ago, online?, volunteer who led it] */
  e?: [EventType, number, boolean?, string?][];
  k?: [Channel, "out" | "in", number, Contact["outcome"]][];
};
const SKY = "SKY Happiness Program";
const SILENCE = "Art of Silence";

const ROWS: Row[] = [
  // Paused
  { n: ["Anjali", "Mehta"], city: "Waterloo", ch: "whatsapp", v: "v1", c: [[SKY, 200]], e: [["follow-up", 30], ["satsang", 20]], k: [["whatsapp", "out", 5, "replied"]] },
  { n: ["Daniel", "Okafor"], city: "Toronto", ch: "email", dnc: true, c: [[SKY, 150]], e: [["follow-up", 120]] },
  { n: ["Sofia", "Rossi"], city: "Kitchener", ch: "sms", c: [[SKY, 90]], e: [["follow-up", 70]], k: [["sms", "in", 9, "replied"]] },
  { n: ["Wei", "Chen"], city: "Mississauga", ch: "email", dnc: true, c: [[SKY, 400]] },
  // New after SKY
  { n: ["Priya", "Nair"], city: "Waterloo", ch: "whatsapp", v: "v1", int: ["community"], c: [[SKY, 18]] },
  { n: ["Marcus", "Bell"], city: "Toronto", ch: "sms", v: "v2", c: [[SKY, 10]], e: [["follow-up", 3]] },
  { n: ["Leila", "Haddad"], city: "Kitchener", ch: "email", v: "v3", int: ["practice"], c: [[SKY, 30]], k: [["email", "out", 25, "no reply"]] },
  { n: ["Tomás", "Herrera"], city: "Mississauga", ch: "whatsapp", v: "v4", c: [[SKY, 40]], e: [["follow-up", 33], ["follow-up", 26]] },
  { n: ["Aiko", "Tanaka"], city: "Online", ch: "email", v: "v5", int: ["online"], c: [[SKY, 25]] },
  // Building practice
  { n: ["Ravi", "Kapoor"], city: "Waterloo", ch: "whatsapp", v: "v1", int: ["meditation"], c: [[SKY, 70]], e: [["follow-up", 60], ["follow-up", 50], ["follow-up", 35]] },
  { n: ["Hannah", "Schultz"], city: "Kitchener", ch: "email", v: "v3", int: ["yoga"], c: [[SKY, 95]], e: [["follow-up", 80], ["follow-up", 70]] },
  { n: ["Kwame", "Mensah"], city: "Toronto", ch: "sms", v: "v2", c: [[SKY, 55]], e: [["follow-up", 40]], k: [["sms", "out", 30, "replied"]] },
  { n: ["Isabel", "Moreau"], city: "Mississauga", ch: "whatsapp", v: "v2", int: ["music"], c: [[SKY, 110]], e: [["follow-up", 100], ["satsang", 85]] },
  // Actively engaged — the October Art of Silence retreat with Shivam (v4) is the newest thing these three did.
  { n: ["Neha", "Joshi"], city: "Waterloo", ch: "whatsapp", v: "v1", c: [[SKY, 300], ["Sahaj Samadhi Meditation", 40], [SILENCE, 38, "v4"]], e: [["satsang", 25], ["satsang", 15], ["satsang", 20]] },
  { n: ["Oliver", "Grant"], city: "Toronto", ch: "email", v: "v2", int: ["retreat"], c: [[SKY, 400], [SILENCE, 38, "v4"]], e: [["follow-up", 50], ["follow-up", 30], ["follow-up", 16]] },
  { n: ["Fatima", "Siddiqui"], city: "Mississauga", ch: "whatsapp", v: "v4", c: [[SKY, 200], ["Sri Sri Yoga", 60, "v3"], [SILENCE, 38]], e: [["follow-up", 20]] },
  { n: ["Lucas", "Ferreira"], city: "Kitchener", ch: "sms", v: "v3", int: ["meditation"], c: [[SKY, 500], ["Sahaj Samadhi Meditation", 300, "v1"]], e: [["satsang", 40], ["follow-up", 20]] },
  { n: ["Mei-Ling", "Wong"], city: "Online", ch: "email", v: "v5", c: [[SKY, 250]], e: [["online session", 30, true], ["online session", 18, true]] },
  // Serving
  { n: ["Arjun", "Patel"], city: "Waterloo", ch: "whatsapp", v: "v1", seva: "follow-up host", c: [[SKY, 700]], e: [["follow-up", 20]] },
  { n: ["Grace", "Kim"], city: "Toronto", ch: "email", v: "v2", seva: "welcome desk volunteer", int: ["teaching"], c: [[SKY, 600]], e: [["satsang", 45]] },
  { n: ["Samuel", "Adeyemi"], city: "Kitchener", ch: "sms", seva: "kitchen seva lead", c: [[SKY, 900]], e: [["seva", 100]] },
  { n: ["Ritu", "Sharma"], city: "Mississauga", ch: "whatsapp", v: "v3", seva: "course organizer", c: [[SKY, 800], ["Sahaj Samadhi Meditation", 400]], e: [["follow-up", 30]] },
  // Going quiet — Shivam's earlier retreat group: nobody here has been back since.
  { n: ["Elena", "Petrova"], city: "Waterloo", ch: "whatsapp", v: "v1", c: [[SKY, 250]], e: [["follow-up", 150], ["follow-up", 140], ["follow-up", 130], ["follow-up", 120], ["follow-up", 100], ["follow-up", 74]] },
  { n: ["James", "O'Connor"], city: "Toronto", ch: "email", v: "v4", c: [[SKY, 300], [SILENCE, 100]], e: [["satsang", 120], ["satsang", 90]] },
  { n: ["Ananya", "Rao"], city: "Kitchener", ch: "sms", v: "v4", c: [[SKY, 200], [SILENCE, 120]], e: [["follow-up", 160], ["follow-up", 130]], k: [["sms", "out", 100, "no reply"]] },
  { n: ["Mateo", "Silva"], city: "Mississauga", ch: null, v: "v4", int: ["music"], c: [[SKY, 180], [SILENCE, 110]], e: [["follow-up", 170], ["satsang", 150]], k: [["email", "in", 160, "replied"]] },
  { n: ["Zara", "Ahmed"], city: "Online", ch: "whatsapp", v: "v5", c: [[SKY, 220]], e: [["online session", 65, true]] },
  // Dormant
  { n: ["Robert", "Lindqvist"], city: "Toronto", ch: "email", v: "v2", c: [[SKY, 400]], e: [["follow-up", 300]] },
  { n: ["Simran", "Kaur"], city: "Mississauga", ch: "whatsapp", v: "v4", lang: "Hindi", c: [[SKY, 500]], e: [["satsang", 250]] },
  { n: ["Noah", "Fischer"], city: "Waterloo", ch: "email", c: [[SKY, 700]] },
  { n: ["Chloé", "Dubois"], city: "Kitchener", ch: null, c: [[SKY, 365]], e: [["follow-up", 330]], k: [["email", "out", 200, "no reply"]] },
];

export function buildSampleData(base?: Date) {
  const participants: Participant[] = [];
  const courses: CourseCompletion[] = [];
  const events: EventAttendance[] = [];
  const contacts: Contact[] = [];
  ROWS.forEach((r, i) => {
    const id = `p${String(i + 1).padStart(2, "0")}`;
    const slug = `${r.n[0]}.${r.n[1]}`.toLowerCase().replace(/[^a-z.]/g, "");
    participants.push({
      id, firstName: r.n[0], lastName: r.n[1], age: r.age ?? 30, city: r.city, language: [6, 12, 16, 23, 30].includes(i) ? "French" : "English",
      email: `${slug}@example.com`, phone: r.ch === "email" && i % 2 ? null : `555-01${String(i).padStart(2, "0")}`,
      preferredChannel: r.ch, prefersOnline: r.city === "Online" || !!r.int?.includes("online"), doNotContact: !!r.dnc, sevaRole: r.seva ?? null, interests: r.int ?? [],
    });
    r.c.forEach(([courseName, d, vol]) => courses.push({ participantId: id, courseName, completedOn: daysAgoIso(d, base), ...(vol ?? r.v ? { volunteerId: vol ?? r.v } : {}) }));
    (r.e ?? []).forEach(([eventType, d, online, vol]) => events.push({ participantId: id, eventType, date: daysAgoIso(d, base), city: online ? "Online" : r.city, online: !!online, ...(vol ?? r.v ? { volunteerId: vol ?? r.v } : {}) }));
    (r.k ?? []).forEach(([channel, direction, d, outcome]) => contacts.push({ participantId: id, channel, direction, date: daysAgoIso(d, base), outcome }));
  });
  return { participants, courses, events, contacts };
}
