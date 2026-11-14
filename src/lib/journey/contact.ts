import { daysSince } from "./dates";
import type { History } from "./types";

/** Days since the last message out to this person; null if we never wrote to them. */
export function daysSinceLastContact(h: History): number | null {
  const last = [...h.contacts].sort((a, b) => b.date.localeCompare(a.date))[0];
  return last ? daysSince(last.date) : null;
}

/** Plain words for how long it has been since we last wrote to someone. */
export function contactText(h: History): string {
  const d = daysSinceLastContact(h);
  if (d === null) return "never contacted";
  if (d === 0) return "contacted today";
  if (d === 1) return "contacted yesterday";
  return `last contact ${d} days ago`;
}

/** Days since the person last came to anything; null when they never have. */
export function daysSinceActivity(h: History): number | null {
  const dates = [...h.events.map((e) => e.date), ...h.courses.map((c) => c.completedOn)].sort();
  const last = dates[dates.length - 1];
  return last ? daysSince(last) : null;
}
