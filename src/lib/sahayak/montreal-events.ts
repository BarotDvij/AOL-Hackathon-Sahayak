/** Official listings verified 2026-11-14. A sourced snapshot, not a live feed. */
export const MONTREAL_CALENDAR = "https://www.artofliving.org/ca-en/center/montreal-saint-laurent#search-course";
export const isMontreal = (location: string) => /\bmontreal\b/i.test(location.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

export function montrealEvents(hasSky: boolean, now: string) {
  const common = { city: "Montréal · Saint-Laurent", suggestedTiming: null, needsLocalCheck: false, level: null, sourceCheckedOn: "2026-11-14" };
  const followups = hasSky ? ["2026-11-18", "2026-11-25", "2026-12-02"].filter((date) => date >= now).map((date) => {
    const compact = date.replaceAll("-", "");
    const end = new Date(new Date(`${date}T23:30:00Z`).getTime() + 3600000).toISOString().replaceAll("-", "").replaceAll(":", "").replace(".000", "");
    const link = "https://www.artofliving.org/ca-en/program/10344";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Journey Companion//Official event snapshot//EN", "BEGIN:VEVENT", `UID:montreal-sky-${date}@journey-companion`, "DTSTAMP:20261114T212000Z", `DTSTART:${compact}T233000Z`, `DTEND:${end}`, "SUMMARY:Long Kriya Follow-Up (SKY graduates only)", "LOCATION:Vibrations Om (Saint-Laurent)\\, 2075 Rue de l'Eglise\\, Montreal", `URL:${link}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return { ...common, id: `montreal-sky-${date}`, title: "Long Kriya Follow-Up (SKY graduates only)", description: "Weekly teacher-led follow-up at Vibrations Om (Saint-Laurent), 2075 Rue de l'Église.", startDate: date, scheduleLabel: "Wednesday · 6:30–7:30 PM · Montréal time", online: false, link, calendarUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
  }) : [];
  // The official page gives a weekly time, but no dated occurrence or online joining link.
  return [...followups, { ...common, id: "montreal-puja-meditation", title: "Online Puja & Meditation", description: "The official listing names this online but also lists the centre address. Confirm how to join with the centre.", startDate: null, scheduleLabel: "Every Thursday · noon–12:30 PM · Montréal time · confirm how to join", online: true, link: "https://www.artofliving.org/ca-en/program/10352", calendarUrl: null, needsLocalCheck: true }];
}