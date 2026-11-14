import { isoDaysFrom } from "./dates";
import { programStageFit, type Program, type ProgramPrerequisite } from "./programs";
import type { NextStep } from "./types";

function programStep(program: Program, prerequisites: ProgramPrerequisite[]): NextStep {
  const searchable = `${program.name} ${program.journey_milestone}`.toLowerCase();
  return {
    id: `program-${program.id}`,
    type: program.journey_milestone === "Art of Silence" ? "retreat" : "course",
    title: program.name,
    shortTitle: program.name,
    city: program.online_option === "yes" || program.online_option === "some_regions" ? "Online" : "Local centre",
    language: "English",
    completesCourse: program.name,
    stageFit: programStageFit(program),
    tags: [
      ...(searchable.includes("yoga") ? ["yoga"] : []),
      ...(searchable.includes("meditation") || searchable.includes("samadhi") || searchable.includes("silence") ? ["meditation"] : []),
      ...(searchable.includes("volunteer") || searchable.includes("seva") ? ["seva", "community"] : []),
      ...(program.online_option === "yes" ? ["online"] : []),
    ],
    link: program.source_url ?? "",
    program,
    programPrerequisites: prerequisites.filter((link) => link.program_id === program.id),
  };
}

/** Local non-course events remain demo records; every course comes from Lovable Cloud. */
export function buildCatalog(programs: Program[] = [], prerequisites: ProgramPrerequisite[] = []): NextStep[] {
  const sky = "SKY Happiness Program";
  const fu = (city: string, day: number): NextStep => ({
    id: `fu-${city.toLowerCase()}`, type: "event", title: `weekly follow-up in ${city}`, shortTitle: "Weekly follow-up",
    startDate: isoDaysFrom(day), city, language: "English", prerequisite: sky, stageFit: ["new", "building", "quiet"], tags: ["follow-up", "community"],
    link: `https://aol.example/followup/${city.toLowerCase()}`,
  });
  return [
    ...programs.map((program) => programStep(program, prerequisites)),
    fu("Waterloo", 5), fu("Toronto", 3), fu("Kitchener", 4), fu("Mississauga", 6),
    { id: "fu-online", type: "event", title: "online follow-up", shortTitle: "Online follow-up", startDate: isoDaysFrom(2), city: "Online", language: "English", prerequisite: sky, stageFit: ["new", "building", "quiet"], tags: ["follow-up", "online"], link: "https://aol.example/followup/online" },
    { id: "checkin-home", type: "check-in", title: "Home-practice check-in", shortTitle: "Practice check-in", city: "Online", language: "English", stageFit: ["new"], tags: ["practice"], link: "" },
    { id: "satsang-mississauga", type: "event", title: "Full-moon satsang in Mississauga", shortTitle: "Full-moon satsang", startDate: isoDaysFrom(9), city: "Mississauga", language: "English", stageFit: ["building", "quiet"], tags: ["satsang", "music", "community"], link: "https://aol.example/satsang/mississauga" },
    { id: "satsang-waterloo", type: "event", title: "Satsang evening in Waterloo", shortTitle: "Satsang evening", startDate: isoDaysFrom(11), city: "Waterloo", language: "English", stageFit: ["building", "quiet"], tags: ["satsang", "music", "community"], link: "https://aol.example/satsang/waterloo" },
    { id: "seva-welcome", type: "seva", title: "Join the welcome team at follow-ups", shortTitle: "Welcome team seva", city: "Online", language: "English", stageFit: ["active"], tags: ["seva", "community"], link: "" },
    { id: "seva-organize", type: "seva", title: "Help organize the next Happiness Program", shortTitle: "Course organizing seva", city: "Online", language: "English", stageFit: ["serving"], tags: ["seva"], link: "" },
    { id: "teacher-info", type: "event", title: "Teacher-training info session (online)", shortTitle: "Teacher-training info", startDate: isoDaysFrom(28), city: "Online", language: "English", prerequisite: sky, stageFit: ["serving"], tags: ["teaching"], link: "https://aol.example/teacher-info" },
    { id: "thank-you", type: "check-in", title: "A personal thank-you", shortTitle: "A thank-you", city: "Online", language: "English", stageFit: ["serving"], tags: [], link: "" },
    { id: "gentle-checkin", type: "check-in", title: "Gentle check-in", shortTitle: "Gentle check-in", city: "Online", language: "English", stageFit: ["quiet"], tags: [], link: "" },
    { id: "online-group", type: "event", title: "Sunday online group session", shortTitle: "Online group session", startDate: isoDaysFrom(1), city: "Online", language: "English", stageFit: ["quiet", "dormant"], tags: ["online", "community"], link: "https://aol.example/sunday-online" },
    { id: "intro-free", type: "event", title: "Free online intro to breath & meditation", shortTitle: "Free online intro", startDate: isoDaysFrom(10), city: "Online", language: "English", stageFit: ["dormant"], tags: ["online"], link: "https://aol.example/free-intro" },
    { id: "satsang-hindi", type: "event", title: "Hindi satsang in Mississauga", shortTitle: "Hindi satsang", startDate: isoDaysFrom(9), city: "Mississauga", language: "Hindi", stageFit: ["quiet", "dormant"], tags: ["satsang", "music"], link: "https://aol.example/satsang/hindi" },
  ];
}
