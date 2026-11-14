/** Completion marks a single day in the current local calendar week. */
export function completionKey(day: string, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return JSON.stringify([monday.getFullYear(), monday.getMonth() + 1, monday.getDate(), day]);
}

export function markDayDone(completed: string[], day: string, now = new Date()) {
  const key = completionKey(day, now);
  return completed.includes(key) ? completed : [...completed, key];
}