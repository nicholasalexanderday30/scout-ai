import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SCORE_API = "https://scout-ai-scoring.onrender.com/score";

export async function POST(req: Request) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body?.user_id;

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const scoringPayload = {
      season_grade_level: body.season_grade_level,
      school_classification: body.school_classification,
      competition_level: body.competition_level,
      games_played_pct: body.games_played_pct,
      height_in: body.height_in,
      weight_lb: body.weight_lb,
    };

    const res = await fetch(SCORE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scoringPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Python service error: ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();

    const { error: saveError } = await supabaseAdmin
      .from("player_scores")
      .upsert(
        {
          user_id: userId,
          p_eq6: data?.p_rungs?.eq6 ?? null,
          expected_college_level: data?.expected_college_level ?? null,
          p_rungs: data?.p_rungs ?? null,
          p_levels: data?.p_levels ?? null,
          scored_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      return NextResponse.json(
        { error: `Score computed but could not save: ${saveError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Could not reach scoring service: ${e.message}` },
      { status: 500 }
    );
  }
}