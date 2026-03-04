import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/player?source=historical&key=...   (key = historical_cb_2022.player_key)
// GET /api/player?source=portal&key=...       (key = player_profiles.id)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sourceRaw = searchParams.get("source");
  const key = searchParams.get("key");

  const source = (sourceRaw ?? "").toLowerCase().trim();

  if (!source || !key) {
    return NextResponse.json(
      { error: "Missing required query params: source, key" },
      { status: 400 }
    );
  }

  if (source !== "historical" && source !== "portal") {
    return NextResponse.json(
      { error: "Invalid source. Must be 'historical' or 'portal'." },
      { status: 400 }
    );
  }

  // ---------- HISTORICAL ----------
  if (source === "historical") {
    const { data, error } = await supabaseAdmin
      .from("historical_cb_2022")
      .select("*")
      .eq("player_key", key)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Historical lookup failed: ${error.message}` },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      source: "historical",
      player_key: data.player_key,
      display_name: data.display_name,
      position: data.position,
      season: data.season,
      scores: {
        p_eq6: data.p_eq6,
        expected_college_level: data.expected_college_level,
        p_rungs: data.p_rungs,
        p_levels: data.p_levels,
        scored_at: data.scored_at,
      },
      stats: data.raw,
    });
  }

  // ---------- PORTAL ----------
  const { data: profile, error: profErr } = await supabaseAdmin
    .from("player_profiles")
    .select("*")
    .eq("id", key)
    .maybeSingle();

  if (profErr) {
    return NextResponse.json(
      { error: `Portal profile lookup failed: ${profErr.message}` },
      { status: 500 }
    );
  }
  if (!profile) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { data: metrics } = await supabaseAdmin
    .from("player_metrics")
    .select("*")
    .eq("player_profile_id", key);

  const { data: constraints } = await supabaseAdmin
    .from("opportunity_constraints")
    .select("*")
    .eq("player_profile_id", key);

  return NextResponse.json({
    source: "portal",
    player_key: profile.id,
    display_name: profile.full_name,
    position: profile.position,
    season: 2022,
    profile,
    metrics: metrics ?? [],
    constraints: constraints ?? [],
  });
}