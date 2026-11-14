import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/integrations/supabase/types";
import type { Program, ProgramCatalog, ProgramPrerequisite } from "@/lib/journey/programs";

export function programFromRow(row: Tables<"programs">): Program {
  return { ...row, level: row.level as Program["level"], online_option: row.online_option as Program["online_option"], varies_by_country: row.varies_by_country as Program["varies_by_country"] };
}

/** Reads only the public catalog through the caller's client; no privileged data access. */
export async function fetchProgramCatalog(supabase: SupabaseClient<Database>): Promise<ProgramCatalog> {
  const [programResult, prerequisiteResult] = await Promise.all([
    supabase.from("programs").select("*").order("name"),
    supabase.from("program_prerequisites").select("program_id, requires_program_id, min_count, notes"),
  ]);
  if (programResult.error || prerequisiteResult.error) throw new Error("The program catalog could not be loaded.");
  return {
    programs: (programResult.data ?? []).map(programFromRow),
    prerequisites: (prerequisiteResult.data ?? []) as ProgramPrerequisite[],
  };
}
