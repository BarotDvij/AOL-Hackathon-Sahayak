import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { friendlyStageFor, milestones, normalizeOnboardingAnswers, participantBundle, participantEvents, practiceDto, recommendedSchedule, sampleParticipantOptions } from "@/lib/sahayak/core";
import { saveOnboarding } from "@/lib/sahayak/save-onboarding";
import { fetchProgramCatalog } from "@/lib/program-catalog";
import { buildCatalog } from "@/lib/journey/catalog";

const participantIdSchema = z.string().regex(/^p\d{2}$/);

export const getMyJourney = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: account, error: accountError } = await supabase.from("participant_accounts").select("participant_id").eq("user_id", userId).maybeSingle();
    if (accountError) throw new Error("Your participant link could not be loaded.");
    if (!account) return { linked: false as const, options: sampleParticipantOptions() };

    const bundle = participantBundle(account.participant_id);
    if (!bundle) throw new Error("Your participant record is unavailable.");
    const programCatalog = await fetchProgramCatalog(supabase);
    const catalog = buildCatalog(programCatalog.programs, programCatalog.prerequisites);
    const [onboardingResult, practiceResult, goalsResult, messagesResult, interestsResult] = await Promise.all([
      supabase.from("participant_onboarding").select("answers").eq("user_id", userId).maybeSingle(),
      supabase.from("practice_logs").select("id, practiced_on, minutes").eq("user_id", userId).order("practiced_on", { ascending: false }).limit(120),
      supabase.from("participant_goals").select("id, period, text, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("participant_messages").select("id, coordinator_name, text, sent_at, reply").eq("participant_id", account.participant_id).order("sent_at", { ascending: false }).limit(50),
      supabase.from("participant_interests").select("event_id").eq("user_id", userId).limit(50),
    ]);
    for (const result of [onboardingResult, practiceResult, goalsResult, messagesResult, interestsResult]) if (result.error) throw new Error("Some of your journey data could not be loaded.");

    const answers = normalizeOnboardingAnswers(onboardingResult.data?.answers ?? {});
    const friendly = friendlyStageFor(bundle);
    const practice = practiceDto(practiceResult.data ?? [], account.participant_id);
    const logs = (practiceResult.data ?? []).map((r) => ({ participantId: account.participant_id, date: r.practiced_on, minutes: r.minutes }));
    const timeline = [
      ...bundle.history.courses.map((c) => ({ date: c.completedOn, kind: "course", text: `Completed ${c.courseName}` })),
      ...bundle.history.events.map((e) => ({ date: e.date, kind: "event", text: `Attended a ${e.eventType}${e.online ? " (online)" : ""}` })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return {
      linked: true as const,
      participant: { id: bundle.participant.id, firstName: bundle.participant.firstName, lastName: bundle.participant.lastName, city: bundle.participant.city },
      stage: friendly,
      answers,
      schedule: recommendedSchedule(answers, bundle.stage, bundle.history, programCatalog.programs),
      practice,
      goals: (goalsResult.data ?? []).map((g) => ({ id: g.id, period: g.period, text: g.text, createdAt: g.created_at })),
      messages: (messagesResult.data ?? []).map((m) => ({ id: m.id, coordinatorName: m.coordinator_name, text: m.text, sentAt: m.sent_at, reply: m.reply })),
      upcoming: participantEvents(account.participant_id, getRequestUrl().origin, 20, catalog, { prefersOnline: answers.support === "online" }),
      interests: (interestsResult.data ?? []).map((i) => i.event_id),
      milestones: milestones(bundle.participant, bundle.history, logs),
      timeline,
    };
  });

export const claimMyParticipant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ participantId: participantIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    if (!participantBundle(data.participantId)) throw new Error("Choose one of the sample participants.");
    const { supabase, userId } = context;
    const { error } = await supabase.from("participant_accounts").insert({ user_id: userId, participant_id: data.participantId });
    if (error) throw new Error("This sample participant is already linked to an account. Please choose another.");
    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: "participant" });
    if (roleError) throw new Error("Your participant role could not be saved. Please try again.");
    return { ok: true };
  });

export const saveMyOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ answers: z.record(z.string(), z.string()) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: account } = await supabase.from("participant_accounts").select("participant_id").eq("user_id", userId).single();
    if (!account) throw new Error("Choose your sample participant first.");
    return saveOnboarding(supabase, userId, account.participant_id, data.answers);
  });

export const logMyPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ minutes: z.number().int().min(1).max(600).nullable().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const date = new Date().toISOString().slice(0, 10);
    const { error } = await context.supabase.from("practice_logs").upsert({ user_id: context.userId, practiced_on: date, minutes: data.minutes ?? null }, { onConflict: "user_id,practiced_on" });
    if (error) throw new Error("Today's practice could not be saved.");
    return { ok: true, date };
  });

export const setMyGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ period: z.enum(["quarter", "year"]), text: z.string().trim().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("participant_goals").insert({ user_id: context.userId, period: data.period, text: data.text });
    if (error) throw new Error("Your goal could not be saved.");
    return { ok: true };
  });

export const markMyInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ eventId: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: account } = await context.supabase.from("participant_accounts").select("participant_id").eq("user_id", context.userId).single();
    if (!account || !participantEvents(account.participant_id, "https://events.invalid", 50).some((e) => e.id === data.eventId)) throw new Error("That event is not in your upcoming list.");
    const { error } = await context.supabase.from("participant_interests").upsert({ user_id: context.userId, event_id: data.eventId }, { onConflict: "user_id,event_id" });
    if (error) throw new Error("Your interest could not be saved.");
    return { ok: true };
  });

export const replyToMyMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ messageId: z.string().uuid(), reply: z.enum(["join", "not now"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("participant_messages").update({ reply: data.reply }).eq("id", data.messageId);
    if (error) throw new Error("Your reply could not be saved.");
    return { ok: true };
  });

/** Coordinator approvals persist only for a verified coordinator role; demo mode remains local. */
export const saveApprovedMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ participantId: participantIdSchema, suggestionId: z.string().max(100).nullable(), coordinatorName: z.string().trim().min(1).max(100), text: z.string().trim().min(1).max(4000), sentAt: z.string().datetime() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coordinator" });
    if (roleError || !allowed) throw new Error("Coordinator permission required.");
    const { error } = await context.supabase.from("participant_messages").insert({ participant_id: data.participantId, suggestion_id: data.suggestionId, coordinator_name: data.coordinatorName, text: data.text, sent_at: data.sentAt });
    if (error) throw new Error("The approved message could not be saved.");
    return { ok: true };
  });

export const getCoordinatorSummaries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ participantId: participantIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coordinator" });
    if (!allowed) return { summaries: [] };
    const { data: rows, error } = await context.supabase.from("participant_summaries").select("id, text, source, created_at").eq("participant_id", data.participantId).order("created_at", { ascending: false }).limit(10);
    if (error) throw new Error("Participant summaries could not be loaded.");
    return { summaries: (rows ?? []).map((r) => ({ id: r.id, text: r.text, source: r.source, createdAt: r.created_at })) };
  });
