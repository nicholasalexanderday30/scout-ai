import { supabase } from "@/lib/supabase";
import type { PlayerProfile } from "@/lib/types";

const PROFILE_SELECT = [
  "user_id",
  "full_name",
  "position",
  "school",
  "grad_year",
  "season_grade_level",
  "school_classification",
  "competition_level",
  "games_played_pct",
  "height_in",
  "weight_lb",
].join(",");

export async function loadPlayerProfile(userId: string): Promise<{
  data: PlayerProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as PlayerProfile) ?? null, error: null };
}

export async function upsertPlayerProfile(profile: PlayerProfile): Promise<{
  error: string | null;
}> {
  const { error } = await supabase.from("player_profiles").upsert(profile);
  if (error) return { error: error.message };
  return { error: null };
}
