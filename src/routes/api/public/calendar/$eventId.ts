import { createFileRoute } from "@tanstack/react-router";
import { buildCatalog } from "@/lib/journey/catalog";
import { parseIso } from "@/lib/journey/dates";

const escapeIcs = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export const Route = createFileRoute("/api/public/calendar/$eventId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const event = buildCatalog().find((e) => e.id === params.eventId && e.startDate);
        if (!event?.startDate) return Response.json({ error: "Event not found" }, { status: 404 });
        const start = parseIso(event.startDate);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const ics = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Journey Companion//Sahayak//EN", "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT", `UID:${escapeIcs(event.id)}@journey-companion`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
          `SUMMARY:${escapeIcs(event.shortTitle)}`, `DESCRIPTION:${escapeIcs(event.title)}`, `LOCATION:${escapeIcs(event.city)}`,
          event.link ? `URL:${escapeIcs(event.link)}` : "", "END:VEVENT", "END:VCALENDAR", "",
        ].filter(Boolean).join("\r\n");
        return new Response(ics, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${event.id}.ics"`, "cache-control": "public, max-age=300" } });
      },
    },
  },
});
