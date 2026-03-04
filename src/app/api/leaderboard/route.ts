import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FASTAPI_SCORE_URL =
  process.env.FASTAPI_SCORE_URL || "http://127.0.0.1:8000/score";

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

  // Added context
  percentile: number | null; // 0..1 (higher is better)
  above_base_rate: boolean;
  is_95th: boolean;
  is_99th: boolean;
};

async function scorePortalRow(row: any) {
  const payload = {
    season_grade_level: String(row.season_grade_level ?? "").trim(),
    school_classification: row.school_classification,
    competition_level: String(row.competition_level ?? "").trim(),
    games_played_pct: row.games_played_pct,
    height_in: row.height_in,
    weight_lb: row.weight_lb,
  };

  const r = await fetch(FASTAPI_SCORE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) return { p_eq6: null, expected_college_level: null };

  const score = await r.json();
  return {
    p_eq6: score?.p_rungs?.eq6 ?? null,
    expected_college_level: score?.expected_college_level ?? null,
  };
}

export async function GET() {
  // ---------- HISTORICAL ----------
  const { data: historical } = await supabaseAdmin
    .from("historical_cb_2022")
    .select(
      "player_key, display_name, position, season, p_eq6, expected_college_level"
    );

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
  const { data: portal } = await supabaseAdmin
    .from("player_profiles")
    .select(
      `
      id,
      full_name,
      position,
      season_grade_level,
      school_classification,
      competition_level,
      games_played_pct,
      height_in,
      weight_lb
    `
    );

  const portalRows: LeaderboardRow[] = [];

  for (const r of portal ?? []) {
    const scored = await scorePortalRow(r);
    const eq6 = scored.p_eq6 ?? null;

    portalRows.push({
      source: "portal",
      player_key: String(r.id),
      display_name: r.full_name,
      position: r.position,
      season: 2022,
      p_eq6: eq6,
      expected_college_level: scored.expected_college_level ?? null,

      percentile: null,
      above_base_rate: (eq6 ?? -1) > FBS_BASE_RATE_EQ6,
      is_95th: (eq6 ?? -1) >= EQ6_P95,
      is_99th: (eq6 ?? -1) >= EQ6_P99,
    });
  }

  // Merge + sort
  const merged = [...portalRows, ...historicalRows].sort((a, b) => {
    const av = a.p_eq6 ?? -1;
    const bv = b.p_eq6 ?? -1;
    return bv - av;
  });

  // Percentile rank (0..1). Null if p_eq6 is null.
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