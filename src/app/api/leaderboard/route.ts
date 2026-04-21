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

  position: string | null;
  season: number | null;

  grad_year: number | null;
  height_in: number | null;
  weight_lb: number | null;
  competition_level: string | null;
  school_classification: string | null;
  games_played_pct: number | null;

  p_eq6: number | null;
  expected_college_level: number | null;

  percentile: number | null;
  above_base_rate: boolean;
  is_95th: boolean;
  is_99th: boolean;
};

function num(v: any) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: any) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export async function GET() {
  try {
    // ---------- HISTORICAL ----------
    const { data: historical, error: histErr } = await supabaseAdmin
      .from("historical_cb_2022")
      .select(
        `
        player_key,
        display_name,
        position,
        season,
        raw,
        p_eq6,
        expected_college_level
        `
      );

    if (histErr) {
      console.error("historical_cb_2022 query failed:", histErr);
      return NextResponse.json(
        { error: `historical_cb_2022 query failed: ${histErr.message}` },
        { status: 500 }
      );
    }

    const historicalRows: LeaderboardRow[] = (historical ?? []).map((r: any) => {
      const eq6 = num(r.p_eq6);
      const raw = r.raw || {};

      return {
        source: "historical",
        player_key: String(r.player_key),
        display_name:
          str(r.display_name) ??
          str(raw.player_name) ??
          String(r.player_key),

        position: str(r.position),
        season: num(r.season),

        grad_year: null,
        height_in: num(raw.height_in),
        weight_lb: num(raw.weight_lb),
        competition_level: str(raw.competition_level),
        school_classification: str(raw.school_classification),
        games_played_pct: num(raw.games_played_pct),

        p_eq6: eq6,
        expected_college_level: num(r.expected_college_level),

        percentile: null,
        above_base_rate: (eq6 ?? -1) > FBS_BASE_RATE_EQ6,
        is_95th: (eq6 ?? -1) >= EQ6_P95,
        is_99th: (eq6 ?? -1) >= EQ6_P99,
      };
    });

    // ---------- PORTAL PROFILES ----------
    const { data: portalProfiles, error: portalErr } = await supabaseAdmin
      .from("player_profiles")
      .select(
        `
        user_id,
        full_name,
        position,
        grad_year,
        height_in,
        weight_lb,
        competition_level,
        school_classification,
        games_played_pct
        `
      );

    if (portalErr) {
      console.error("player_profiles query failed:", portalErr);
      return NextResponse.json(
        { error: `player_profiles query failed: ${portalErr.message}` },
        { status: 500 }
      );
    }

    // ---------- PORTAL SCORES ----------
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
      console.error("player_scores query failed:", scoreErr);
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
      const savedScore = scoreMap.get(String(r.user_id));
      const eq6 = num(savedScore?.p_eq6);

      return {
        source: "portal",
        player_key: String(r.user_id),
        display_name: str(r.full_name) ?? String(r.user_id),

        position: str(r.position),
        season: 2022,

        grad_year: num(r.grad_year),
        height_in: num(r.height_in),
        weight_lb: num(r.weight_lb),
        competition_level: str(r.competition_level),
        school_classification: str(r.school_classification),
        games_played_pct: num(r.games_played_pct),

        p_eq6: eq6,
        expected_college_level: num(savedScore?.expected_college_level),

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
  } catch (error) {
    console.error("Unhandled /api/leaderboard error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}