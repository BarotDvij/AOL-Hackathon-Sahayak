const DAY = 86_400_000;
export function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function today() { return startOfDay(new Date()); }
export function isoDaysFrom(offset: number, base = today()) {
  const d = new Date(base.getTime() + offset * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const daysAgoIso = (n: number, base?: Date) => isoDaysFrom(-n, base);
export function parseIso(iso: string) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
export function daysSince(iso: string, now = today()) { return Math.round((now.getTime() - parseIso(iso).getTime()) / DAY); }
export function daysUntil(iso: string, now = today()) { return -daysSince(iso, now); }
export function formatShort(iso: string) { return parseIso(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" }); }
export function formatLong(iso: string) { return parseIso(iso).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }); }
export function formatFull(iso: string) { return parseIso(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }); }
