import { isoDaysFrom } from "./dates";
import type { NextStep } from "./types";

/** Placeholder catalog. Dates are relative to today so the demo stays current. */
export function buildCatalog(): NextStep[] {
  const sky = "SKY Happiness Program";
  const fu = (city: string, day: number, weekday: string): NextStep => ({
    id: `fu-${city.toLowerCase()}`, type: "event", title: `${weekday} follow-up in ${city}`, shortTitle: "Weekly follow-up",
    startDate: isoDaysFrom(day), city, language: "English", prerequisite: sky, stageFit: ["new", "building", "quiet"], tags: ["follow-up", "community"],
    link: `https://aol.example/followup/${city.toLowerCase()}`,
  });
  return [
    fu("Waterloo", 5, "Thursday"), fu("Toronto", 3, "Tuesday"), fu("Kitchener", 4, "Wednesday"), fu("Mississauga", 6, "Friday"),
    { id: "fu-online", type: "event", title: "Online follow-up", shortTitle: "Online follow-up", startDate: isoDaysFrom(2), city: "Online", language: "English", prerequisite: sky, stageFit: ["new", "building", "quiet"], tags: ["follow-up", "online"], link: "https://aol.example/followup/online" },
    { id: "checkin-home", type: "check-in", title: "Home-practice check-in", shortTitle: "Practice check-in", city: "Online", language: "English", stageFit: ["new"], tags: ["practice"], link: "" },
    { id: "sahaj-waterloo", type: "course", title: "Sahaj Samadhi Meditation in Waterloo", shortTitle: "Sahaj Samadhi", startDate: isoDaysFrom(22), city: "Waterloo", language: "English", prerequisite: sky, completesCourse: "Sahaj Samadhi Meditation", stageFit: ["building", "active"], tags: ["meditation"], link: "https://aol.example/sahaj/waterloo" },
    { id: "sahaj-toronto", type: "course", title: "Sahaj Samadhi Meditation in Toronto", shortTitle: "Sahaj Samadhi", startDate: isoDaysFrom(30), city: "Toronto", language: "English", prerequisite: sky, completesCourse: "Sahaj Samadhi Meditation", stageFit: ["building", "active"], tags: ["meditation"], link: "https://aol.example/sahaj/toronto" },
    { id: "yoga-kitchener", type: "course", title: "Sri Sri Yoga in Kitchener", shortTitle: "Sri Sri Yoga", startDate: isoDaysFrom(15), city: "Kitchener", language: "English", prerequisite: sky, completesCourse: "Sri Sri Yoga", stageFit: ["building", "active"], tags: ["yoga"], link: "https://aol.example/yoga/kitchener" },
    { id: "yoga-online", type: "course", title: "Sri Sri Yoga (online)", shortTitle: "Sri Sri Yoga", startDate: isoDaysFrom(12), city: "Online", language: "English", prerequisite: sky, completesCourse: "Sri Sri Yoga", stageFit: ["building"], tags: ["yoga", "online"], link: "https://aol.example/yoga/online" },
    { id: "satsang-mississauga", type: "event", title: "Full-moon satsang in Mississauga", shortTitle: "Full-moon satsang", startDate: isoDaysFrom(9), city: "Mississauga", language: "English", stageFit: ["building", "quiet"], tags: ["satsang", "music", "community"], link: "https://aol.example/satsang/mississauga" },
    { id: "satsang-waterloo", type: "event", title: "Satsang evening in Waterloo", shortTitle: "Satsang evening", startDate: isoDaysFrom(11), city: "Waterloo", language: "English", stageFit: ["building", "quiet"], tags: ["satsang", "music", "community"], link: "https://aol.example/satsang/waterloo" },
    { id: "silence-kitchener", type: "retreat", title: "Art of Silence retreat in Kitchener", shortTitle: "Art of Silence", startDate: isoDaysFrom(38), city: "Kitchener", language: "English", prerequisite: sky, completesCourse: "Art of Silence", stageFit: ["active"], tags: ["retreat", "meditation"], link: "https://aol.example/silence/kitchener" },
    { id: "silence-toronto", type: "retreat", title: "Art of Silence retreat in Toronto", shortTitle: "Art of Silence", startDate: isoDaysFrom(26), city: "Toronto", language: "English", prerequisite: sky, completesCourse: "Art of Silence", stageFit: ["active"], tags: ["retreat", "meditation"], link: "https://aol.example/silence/toronto" },
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
