import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { friendlyStageFor, normalizeOnboardingAnswers, participantBundle, type OnboardingAnswers } from "./core";

/** The one save path used by both the participant form and save_onboarding. */
export async function saveOnboarding(supabase: SupabaseClient<Database>, userId: string, participantId: string, input: unknown): Promise<{ answers: OnboardingAnswers; stageName: string; stageLine: string }> {
  const answers = normalizeOnboardingAnswers(input);
  const { error } = await supabase.from("participant_onboarding").upsert({ user_id: userId, answers, updated_at: new Date().toISOString() });
  if (error) throw new Error("Your answers could not be saved. Please try again.");
  const bundle = participantBundle(participantId);
  if (!bundle) throw new Error("This participant record is unavailable.");
  const friendly = friendlyStageFor(bundle);
  return { answers, stageName: friendly.name, stageLine: friendly.line };
}
