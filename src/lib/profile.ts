import { supabase } from "@/lib/supabase";
import type { PlayerProfile } from "@/lib/types";

export async function fetchPlayerProfile(userId: string): Promise<{
  data: PlayerProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };

  return { data: (data as unknown as PlayerProfile) ?? null, error: null };
}

export async function upsertPlayerProfile(profile: PlayerProfile): Promise<{
  data: PlayerProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("player_profiles")
    .upsert(profile, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  return { data: (data as unknown as PlayerProfile) ?? null, error: null };
}