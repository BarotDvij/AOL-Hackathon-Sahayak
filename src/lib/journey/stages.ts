import { JOURNEY_CONFIG as C } from "./config";
import { daysSince, today } from "./dates";
import type { History, Participant, Reason, StageResult } from "./types";

/** Rules checked top to bottom; first match wins. */
export function computeStage(p: Participant, h: History, now = today()): StageResult {
  const contacts = [...h.contacts].sort((a, b) => b.date.localeCompare(a.date));
  const events = [...h.events].sort((a, b) => b.date.localeCompare(a.date));
  const lastContactDays = contacts[0] ? daysSince(contacts[0].date, now) : null;

  if (p.doNotContact) return { stage: "paused", reasons: [{ code: "DO_NOT_CONTACT" }] };
  if (lastContactDays !== null && lastContactDays < C.pausedRecentContactDays)
    return { stage: "paused", reasons: [{ code: "CONTACTED_RECENTLY", days: lastContactDays }] };

  const sky = h.courses.filter((c) => c.courseName === C.skyCourseName).sort((a, b) => b.completedOn.localeCompare(a.completedOn))[0];
  const skyDays = sky ? daysSince(sky.completedOn, now) : null;
  const followUpsAfterSky = sky ? events.filter((e) => e.eventType === "follow-up" && e.date >= sky.completedOn).length : 0;

  if (skyDays !== null && skyDays <= C.newAfterSkyDays)
    return { stage: "new", reasons: [{ code: "SKY_RECENT", days: skyDays }, { code: "FOLLOW_UPS", count: followUpsAfterSky }] };

  if (skyDays !== null && skyDays <= C.buildingMaxDays && followUpsAfterSky >= C.buildingMinFollowUps)
    return { stage: "building", reasons: [{ code: "SKY_DAYS", days: skyDays }, { code: "FOLLOW_UPS", count: followUpsAfterSky }] };

  const recentEvents = events.filter((e) => e.eventType !== "seva" && daysSince(e.date, now) <= C.activeWindowDays);
  const recentCourse = h.courses
    .filter((c) => c.courseName !== C.skyCourseName && daysSince(c.completedOn, now) <= C.activeRecentCourseDays)
    .sort((a, b) => b.completedOn.localeCompare(a.completedOn))[0];
  if (recentEvents.length >= C.activeMinEvents || recentCourse) {
    const reasons: Reason[] = [];
    if (recentEvents.length >= C.activeMinEvents) reasons.push({ code: "EVENTS_60D", count: recentEvents.length, text: dominantType(recentEvents.map((e) => e.eventType)) });
    if (recentCourse) reasons.push({ code: "RECENT_COURSE", days: daysSince(recentCourse.completedOn, now), text: recentCourse.courseName });
    return { stage: "active", reasons };
  }

  const lastSeva = events.find((e) => e.eventType === "seva");
  if (p.sevaRole || (lastSeva && daysSince(lastSeva.date, now) <= C.servingVolunteerDays))
    return { stage: "serving", reasons: [{ code: "SEVA", text: p.sevaRole ?? "volunteer", days: lastSeva ? daysSince(lastSeva.date, now) : undefined }] };

  const lastEventDays = events[0] ? daysSince(events[0].date, now) : null;
  if (lastEventDays !== null && lastEventDays >= C.quietMinDays && lastEventDays < C.quietMaxDays)
    return { stage: "quiet", reasons: [{ code: "NO_EVENT_60D", days: lastEventDays, count: events.length, text: dominantType(events.map((e) => e.eventType)) }] };

  const lastReply = contacts.find((c) => c.direction === "in" || c.outcome === "replied");
  const quietSince = Math.min(lastEventDays ?? Infinity, lastReply ? daysSince(lastReply.date, now) : Infinity, skyDays ?? Infinity);
  return { stage: "dormant", reasons: [{ code: "DORMANT", days: Number.isFinite(quietSince) ? quietSince : undefined }] };
}

function dominantType(types: string[]) {
  const counts = new Map<string, number>();
  types.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  const [[top]] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return counts.size === 1 ? top : "event";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Turns reason codes into one plain sentence, built only from the data. */
export function explainReasons(reasons: Reason[]): string {
  const r = (code: string) => reasons.find((x) => x.code === code);
  const dnc = r("DO_NOT_CONTACT"); if (dnc) return "Asked not to be contacted.";
  const recent = r("CONTACTED_RECENTLY"); if (recent) return `Contacted recently (${recent.days === 0 ? "today" : plural(recent.days!, "day") + " ago"}).`;
  const skyR = r("SKY_RECENT");
  if (skyR) {
    const fu = r("FOLLOW_UPS")!.count!;
    return `Finished SKY ${plural(skyR.days!, "day")} ago; ${fu === 0 ? "hasn't joined a follow-up yet" : `has come to ${plural(fu, "follow-up")} since`}.`;
  }
  const skyD = r("SKY_DAYS"); if (skyD) return `Finished SKY ${skyD.days} days ago and has come to ${plural(r("FOLLOW_UPS")!.count!, "follow-up")} since.`;
  const ev = r("EVENTS_60D"); const course = r("RECENT_COURSE");
  if (ev || course) {
    const parts: string[] = [];
    if (ev) parts.push(`Came to ${plural(ev.count!, ev.text!)} in the last 60 days`);
    if (course) parts.push(`${ev ? "finished" : "Finished"} ${course.text} ${plural(course.days!, "day")} ago`);
    return parts.join(" and ") + ".";
  }
  const seva = r("SEVA"); if (seva) return `Serves as ${seva.text}${seva.days !== undefined ? `; last helped out ${seva.days} days ago` : ""}.`;
  const quiet = r("NO_EVENT_60D"); if (quiet) return `Attended ${plural(quiet.count!, quiet.text!)} before, none in the last ${quiet.days} days.`;
  const d = r("DORMANT"); if (d) return d.days !== undefined ? `No event or reply in ${d.days} days.` : "No event or reply on record.";
  return "";
}
