import type { PlanDay, PlanItem } from "./intake";

export function planActivities(plan: PlanDay[]) {
  return plan.flatMap((day) => day.items.map((item, index) => ({ id: `${day.day.toLowerCase()}-${index}`, day: day.day, item })));
}

export function completionKey(day: string, item: PlanItem, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const week = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
  return JSON.stringify([week, day, item.kind, item.text]);
}

export function markActivityDone(completed: string[], day: string, item: PlanItem, now = new Date()) {
  const key = completionKey(day, item, now);
  return completed.includes(key) ? completed : [...completed, key];
}

/** Preparation and reflection only; certified course techniques are never reproduced. */
export function activityGuide(item: PlanItem): string[] {
  if (item.kind === "rest") return ["Choose a comfortable place to pause.", "Take a little time for yourself, without needing to achieve anything.", "When you feel ready, return to your day."];
  if (item.kind === "group") return ["Check the event details with your centre. Your weekly plan is a suggestion, not a confirmed booking.", "Confirm the time, location or online link and course prerequisites before joining.", "Join the session and follow the certified teacher’s guidance. Mark this activity done after attending."];
  if (item.kind === "practice" && /SKY|Sahaj/.test(item.text)) return ["Set aside an undisturbed space and the time recommended in your course.", "Use only the practice and instructions you learned from your certified teacher. This app does not teach SKY or Sahaj Samadhi techniques. If you have not learned a practice listed here, ask your teacher before trying it.", "Complete your taught practice at your own pace. If you feel unwell or uncomfortable, stop and contact your teacher or a healthcare professional.", "When you finish, take a moment to notice how you feel, then mark this planned activity done."];
  if (item.kind === "practice") return ["Find a quiet, comfortable place to sit.", "Spend a few minutes resting quietly. Let your breathing stay natural; no special technique is needed.", "When you are ready, notice how you feel and return to your day."];
  if (/seva/i.test(item.text)) return ["Choose a small way to help that fits your time and energy.", "Contact your centre or the organiser to agree on a suitable task before taking part.", "Carry out your agreed task, then reflect on the experience."];
  if (/course/i.test(item.text)) return ["Look at the upcoming course options on Home.", "Check prerequisites, suggested timing and local availability with your centre.", "Choose an option to ask about. Completing this activity does not mean you have completed or enrolled in a course."];
  return ["Look back at the activities you completed this week.", "Notice what supported you and what was difficult, without judging yourself.", "Review your goals on My journey and choose one small intention for next week."];
}