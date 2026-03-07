import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Calibration anchors
const FBS_BASE_RATE_EQ6 = 0.065;
const EQ6_P95 = 0.26;
const EQ6_P99 = 0.47;

type LeaderboardRow = {
  source: "portal" | "historical";
  player_key: string;
  display_name: string;
  position?: string;
  season?: number;
  p_eq6: number | null;
  expected_college_level: number | null;

  percentile: number | null;
  above_base_rate: boolean;
  is_95th: boolean;
  is_99th: boolean;
};

export async function GET() {
  // ---------- HISTORICAL ----------
  const { data: historical, error: histErr } = await supabaseAdmin
    .from("historical_cb_2022")
    .select(
      "player_key, display_name, position, season, p_eq6, expected_college_level"
    );

  if (histErr) {
    return NextResponse.json(
      { error: `historical_cb_2022 query failed: ${histErr.message}` },
      { status: 500 }
    );
  }

  const historicalRows: LeaderboardRow[] = (historical ?? []).map((r: any) => {
    const eq6 = r.p_eq6 ?? null;

    return {
      source: "historical",
      player_key: r.player_key,
      display_name: r.display_name,
      position: r.position,
      season: r.season,
      p_eq6: eq6,
      expected_college_level: r.expected_college_level ?? null,

      percentile: null,
      above_base_rate: (eq6 ?? -1) > FBS_BASE_RATE_EQ6,
      is_95th: (eq6 ?? -1) >= EQ6_P95,
      is_99th: (eq6 ?? -1) >= EQ6_P99,
    };
  });

  // ---------- PORTAL ----------
  const { data: portalProfiles, error: portalErr } = await supabaseAdmin
    .from("player_profiles")
    .select(
      `
      id,
      full_name,
      position
    `
    );

  if (portalErr) {
    return NextResponse.json(
      { error: `player_profiles query failed: ${portalErr.message}` },
      { status: 500 }
    );
  }

  const { data: portalScores, error: scoreErr } = await supabaseAdmin
    .from("player_scores")
    .select(
      `
      user_id,
      p_eq6,
      expected_college_level
    `
    );

  if (scoreErr) {
    return NextResponse.json(
      { error: `player_scores query failed: ${scoreErr.message}` },
      { status: 500 }
    );
  }

  const scoreMap = new Map<string, any>();
  for (const s of portalScores ?? []) {
    scoreMap.set(String(s.user_id), s);
  }

  const portalRows: LeaderboardRow[] = (portalProfiles ?? []).map((r: any) => {
    const savedScore = scoreMap.get(String(r.id));
    const eq6 = savedScore?.p_eq6 ?? null;

    return {
      source: "portal",
      player_key: String(r.id),
      display_name: r.full_name,
      position: r.position,
      season: 2022,
      p_eq6: eq6,
      expected_college_level: savedScore?.expected_college_level ?? null,

      percentile: null,
      above_base_rate: (eq6 ?? -1) > FBS_BASE_RATE_EQ6,
      is_95th: (eq6 ?? -1) >= EQ6_P95,
      is_99th: (eq6 ?? -1) >= EQ6_P99,
    };
  });

  const merged = [...portalRows, ...historicalRows].sort((a, b) => {
    const av = a.p_eq6 ?? -1;
    const bv = b.p_eq6 ?? -1;
    return bv - av;
  });

  const total = merged.length;
  for (let i = 0; i < total; i++) {
    const row = merged[i];
    if (row.p_eq6 == null) {
      row.percentile = null;
      continue;
    }
    row.percentile = total > 1 ? 1 - i / (total - 1) : 1;
  }

  return NextResponse.json({
    count: merged.length,
    rows: merged,
  });
}