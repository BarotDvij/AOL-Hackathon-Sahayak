import { daysAgoIso } from "./dates";
import type { Channel, Contact, CourseCompletion, EventAttendance, EventType, Participant } from "./types";

type Row = {
  n: [string, string]; age?: number; city: string; ch: Channel | null; lang?: string; dnc?: boolean; seva?: string; int?: string[];
  c: [string, number][]; e?: [EventType, number, boolean?][]; k?: [Channel, "out" | "in", number, Contact["outcome"]][];
};
const SKY = "SKY Happiness Program";

const ROWS: Row[] = [
  // Paused
  { n: ["Anjali", "Mehta"], city: "Waterloo", ch: "whatsapp", c: [[SKY, 200]], e: [["follow-up", 30], ["satsang", 20]], k: [["whatsapp", "out", 5, "replied"]] },
  { n: ["Daniel", "Okafor"], city: "Toronto", ch: "email", dnc: true, c: [[SKY, 150]], e: [["follow-up", 120]] },
  { n: ["Sofia", "Rossi"], city: "Kitchener", ch: "sms", c: [[SKY, 90]], e: [["follow-up", 70]], k: [["sms", "in", 9, "replied"]] },
  { n: ["Wei", "Chen"], city: "Mississauga", ch: "email", dnc: true, c: [[SKY, 400]] },
  // New after SKY
  { n: ["Priya", "Nair"], city: "Waterloo", ch: "whatsapp", int: ["community"], c: [[SKY, 18]] },
  { n: ["Marcus", "Bell"], city: "Toronto", ch: "sms", c: [[SKY, 10]], e: [["follow-up", 3]] },
  { n: ["Leila", "Haddad"], city: "Kitchener", ch: "email", int: ["practice"], c: [[SKY, 30]], k: [["email", "out", 25, "no reply"]] },
  { n: ["Tomás", "Herrera"], city: "Mississauga", ch: "whatsapp", c: [[SKY, 40]], e: [["follow-up", 33], ["follow-up", 26]] },
  { n: ["Aiko", "Tanaka"], city: "Online", ch: "email", int: ["online"], c: [[SKY, 25]] },
  // Building practice
  { n: ["Ravi", "Kapoor"], city: "Waterloo", ch: "whatsapp", int: ["meditation"], c: [[SKY, 70]], e: [["follow-up", 60], ["follow-up", 50], ["follow-up", 35]] },
  { n: ["Hannah", "Schultz"], city: "Kitchener", ch: "email", int: ["yoga"], c: [[SKY, 95]], e: [["follow-up", 80], ["follow-up", 70]] },
  { n: ["Kwame", "Mensah"], city: "Toronto", ch: "sms", c: [[SKY, 55]], e: [["follow-up", 40]], k: [["sms", "out", 30, "replied"]] },
  { n: ["Isabel", "Moreau"], city: "Mississauga", ch: "whatsapp", int: ["music"], c: [[SKY, 110]], e: [["follow-up", 100], ["satsang", 85]] },
  // Actively engaged
  { n: ["Neha", "Joshi"], city: "Waterloo", ch: "whatsapp", c: [[SKY, 300], ["Sahaj Samadhi Meditation", 40]], e: [["satsang", 25], ["satsang", 15], ["satsang", 20]] },
  { n: ["Oliver", "Grant"], city: "Toronto", ch: "email", int: ["retreat"], c: [[SKY, 400]], e: [["follow-up", 50], ["follow-up", 30], ["follow-up", 16]] },
  { n: ["Fatima", "Siddiqui"], city: "Mississauga", ch: "whatsapp", c: [[SKY, 200], ["Sri Sri Yoga", 60]], e: [["follow-up", 20]] },
  { n: ["Lucas", "Ferreira"], city: "Kitchener", ch: "sms", int: ["meditation"], c: [[SKY, 500], ["Sahaj Samadhi Meditation", 300]], e: [["satsang", 40], ["follow-up", 20]] },
  { n: ["Mei-Ling", "Wong"], city: "Online", ch: "email", c: [[SKY, 250]], e: [["online session", 30, true], ["online session", 18, true]] },
  // Serving
  { n: ["Arjun", "Patel"], city: "Waterloo", ch: "whatsapp", seva: "follow-up host", c: [[SKY, 700]], e: [["follow-up", 20]] },
  { n: ["Grace", "Kim"], city: "Toronto", ch: "email", seva: "welcome desk volunteer", int: ["teaching"], c: [[SKY, 600]], e: [["satsang", 45]] },
  { n: ["Samuel", "Adeyemi"], city: "Kitchener", ch: "sms", seva: "kitchen seva lead", c: [[SKY, 900]], e: [["seva", 100]] },
  { n: ["Ritu", "Sharma"], city: "Mississauga", ch: "whatsapp", seva: "course organizer", c: [[SKY, 800], ["Sahaj Samadhi Meditation", 400]], e: [["follow-up", 30]] },
  // Going quiet
  { n: ["Elena", "Petrova"], city: "Waterloo", ch: "whatsapp", c: [[SKY, 250]], e: [["follow-up", 150], ["follow-up", 140], ["follow-up", 130], ["follow-up", 120], ["follow-up", 100], ["follow-up", 74]] },
  { n: ["James", "O'Connor"], city: "Toronto", ch: "email", c: [[SKY, 300]], e: [["satsang", 120], ["satsang", 90]] },
  { n: ["Ananya", "Rao"], city: "Kitchener", ch: "sms", c: [[SKY, 200]], e: [["follow-up", 160], ["follow-up", 130]], k: [["sms", "out", 100, "no reply"]] },
  { n: ["Mateo", "Silva"], city: "Mississauga", ch: null, int: ["music"], c: [[SKY, 180]], e: [["follow-up", 170], ["satsang", 150]], k: [["email", "in", 160, "replied"]] },
  { n: ["Zara", "Ahmed"], city: "Online", ch: "whatsapp", c: [[SKY, 220]], e: [["online session", 65, true]] },
  // Dormant
  { n: ["Robert", "Lindqvist"], city: "Toronto", ch: "email", c: [[SKY, 400]], e: [["follow-up", 300]] },
  { n: ["Simran", "Kaur"], city: "Mississauga", ch: "whatsapp", lang: "Hindi", c: [[SKY, 500]], e: [["satsang", 250]] },
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
    r.c.forEach(([courseName, d]) => courses.push({ participantId: id, courseName, completedOn: daysAgoIso(d, base) }));
    (r.e ?? []).forEach(([eventType, d, online]) => events.push({ participantId: id, eventType, date: daysAgoIso(d, base), city: online ? "Online" : r.city, online: !!online }));
    (r.k ?? []).forEach(([channel, direction, d, outcome]) => contacts.push({ participantId: id, channel, direction, date: daysAgoIso(d, base), outcome }));
  });
  return { participants, courses, events, contacts };
}
