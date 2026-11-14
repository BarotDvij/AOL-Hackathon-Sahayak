import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getOnboardingQuestions from "./tools/get-onboarding-questions";
import saveOnboarding from "./tools/save-onboarding";
import getRecommendedSchedule from "./tools/get-recommended-schedule";
import getMyPractice from "./tools/get-my-practice";
import logPractice from "./tools/log-practice";
import setGoal from "./tools/set-goal";
import listGoals from "./tools/list-goals";
import listMyUpcoming from "./tools/list-my-upcoming";
import getEvent from "./tools/get-event";
import getMyMessages from "./tools/get-my-messages";
import submitSummary from "./tools/submit-summary";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-screenshot-exact",
  title: "Remix of Screenshot Exact",
  version: "0.1.0",
  instructions: "Sahayak participant tools for Journey Companion. Act only for the OAuth-connected participant. Onboarding is conversational: ask one question at a time, allow skips, read answers back and confirm before saving. Never expose internal stage names, reason codes or drafts. No tool sends messages. Submit a summary only after the participant approves its exact text.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
  }),
  tools: [getOnboardingQuestions, saveOnboarding, getRecommendedSchedule, getMyPractice, logPractice, setGoal, listGoals, listMyUpcoming, getEvent, getMyMessages, submitSummary],
});
