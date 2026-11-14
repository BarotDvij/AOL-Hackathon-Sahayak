import type { StageId } from "./types";

/** All journey thresholds live here so they are easy to change. */
export const JOURNEY_CONFIG = {
  pausedRecentContactDays: 14,
  newAfterSkyDays: 45,
  buildingMaxDays: 120,
  buildingMinFollowUps: 1,
  activeWindowDays: 60,
  activeMinEvents: 2,
  activeRecentCourseDays: 90,
  servingVolunteerDays: 90,
  quietMinDays: 60,
  quietMaxDays: 180,
  dormantDays: 180,
  suggestionWindowDays: 45,
  startsSoonDays: 14,
  sentThisWeekDays: 7,
  coordinatorName: "Meera",
  skyCourseName: "SKY Happiness Program",
} as const;

/** Follow-up priority: people drifting away first, then everyone else. Paused people are never listed. */
export const STAGE_PRIORITY: StageId[] = ["quiet", "dormant", "new", "building", "active", "serving"];

export const SCORE_WEIGHTS = { stageFit: 3, statedInterest: 2, startsSoon: 1.5, nearby: 1, alreadyDeclined: -2 } as const;

export const STAGES: { id: StageId; label: string }[] = [
  { id: "paused", label: "Paused" },
  { id: "new", label: "New after SKY" },
  { id: "building", label: "Building practice" },
  { id: "active", label: "Actively engaged" },
  { id: "serving", label: "Serving" },
  { id: "quiet", label: "Going quiet" },
  { id: "dormant", label: "Dormant" },
];
export const stageLabel = (id: StageId) => STAGES.find((s) => s.id === id)!.label;

export const SKIP_REASONS = ["Not the right time", "Already in touch", "Wrong suggestion", "Other"];
