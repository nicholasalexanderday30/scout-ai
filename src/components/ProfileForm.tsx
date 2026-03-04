"use client";

import { useEffect, useState } from "react";
import type { PlayerProfile, CompetitionLevel, SeasonGradeLevel } from "@/lib/types";
import { fetchPlayerProfile, upsertPlayerProfile } from "@/lib/profile";

type Props = {
  userId: string;
  onSignOut: () => Promise<void>;
};

type ScoreResponse = {
  p_rungs: { ge1: number; ge2: number; ge3: number; ge4: number; ge5: number; eq6: number };
  p_levels: {
    level_0: number;
    level_1: number;
    level_2: number;
    level_3: number;
    level_4: number;
    level_5: number;
    level_6: number;
  };
  expected_college_level: number;
  note?: string;
  error?: string;
};

export default function ProfileForm({ userId, onSignOut }: Props) {
  // basic
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");

  // model-parity
  const [seasonGradeLevel, setSeasonGradeLevel] = useState<SeasonGradeLevel | "">("");
  const [schoolClassification, setSchoolClassification] = useState("");
  const [competitionLevel, setCompetitionLevel] = useState<CompetitionLevel | "">("");
  const [gamesPlayedPct, setGamesPlayedPct] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [scoring, setScoring] = useState(false);
  const [score, setScore] = useState<ScoreResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setStatus("");
      setScore(null);

      const { data, error } = await fetchPlayerProfile(userId);
      if (error) {
        setStatus(`Load error: ${error}`);
        setLoading(false);
        return;
      }

      if (data) {
        setFullName(data.full_name ?? "");
        setPosition(data.position ?? "");
        setSchool(data.school ?? "");
        setGradYear(data.grad_year != null ? String(data.grad_year) : "");

        setSeasonGradeLevel(data.season_grade_level ?? "");
        setSchoolClassification(data.school_classification != null ? String(data.school_classification) : "");
        setCompetitionLevel(data.competition_level ?? "");
        setGamesPlayedPct(data.games_played_pct != null ? String(data.games_played_pct) : "");
        setHeightIn(data.height_in != null ? String(data.height_in) : "");
        setWeightLb(data.weight_lb != null ? String(data.weight_lb) : "");

        setStatus("Loaded");
      } else {
        setStatus("No profile yet");
      }

      setLoading(false);
    };

    run();
  }, [userId]);

  const save = async () => {
    setSaving(true);
    setStatus("");
    setScore(null);

    const gradYearNum = gradYear.trim() === "" ? null : Number(gradYear);
    const schoolClassNum = schoolClassification.trim() === "" ? null : Number(schoolClassification);
    const gamesPctNum = gamesPlayedPct.trim() === "" ? null : Number(gamesPlayedPct);
    const heightNum = heightIn.trim() === "" ? null : Number(heightIn);
    const weightNum = weightLb.trim() === "" ? null : Number(weightLb);

    if (gamesPctNum !== null && (!Number.isFinite(gamesPctNum) || gamesPctNum < 0 || gamesPctNum > 1)) {
      setStatus("games_played_pct must be between 0 and 1");
      setSaving(false);
      return;
    }

    const payload: PlayerProfile = {
      user_id: userId,

      full_name: fullName.trim() || null,
      position: position.trim() || null,
      school: school.trim() || null,
      grad_year: gradYearNum,

      season_grade_level: seasonGradeLevel === "" ? null : (seasonGradeLevel as SeasonGradeLevel),
      school_classification: schoolClassNum,
      competition_level: competitionLevel === "" ? null : (competitionLevel as CompetitionLevel),
      games_played_pct: gamesPctNum,
      height_in: heightNum,
      weight_lb: weightNum,
    };

    const { error } = await upsertPlayerProfile(payload);
    if (error) {
      setStatus(`Save error: ${error}`);
      setSaving(false);
      return;
    }

    setStatus("Saved");
    setSaving(false);
  };

  const getScore = async () => {
    setScoring(true);
    setScore(null);
    setStatus("");

    // require fields for scoring
    if (
      seasonGradeLevel === "" ||
      competitionLevel === "" ||
      schoolClassification.trim() === "" ||
      gamesPlayedPct.trim() === "" ||
      heightIn.trim() === "" ||
      weightLb.trim() === ""
    ) {
      setStatus("Fill in season grade, competition, classification, games pct, height, weight to score.");
      setScoring(false);
      return;
    }

    const body = {
      season_grade_level: seasonGradeLevel,
      school_classification: Number(schoolClassification),
      competition_level: competitionLevel,
      games_played_pct: Number(gamesPlayedPct),
      height_in: Number(heightIn),
      weight_lb: Number(weightLb),
    };

    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as ScoreResponse;

    if (!res.ok) {
      setStatus(json.error ?? "Score error");
      setScoring(false);
      return;
    }

    setScore(json);
    setScoring(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/40 p-8 backdrop-blur">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold">Player Profile</h1>
          <button onClick={onSignOut} className="text-sm text-white/70 hover:text-white">
            Sign out
          </button>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading || saving || scoring}
          />
          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={loading || saving || scoring}
          />
          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="School"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            disabled={loading || saving || scoring}
          />
          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="Graduation year"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            disabled={loading || saving || scoring}
            inputMode="numeric"
          />

          <hr className="border-white/10 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              value={seasonGradeLevel}
              onChange={(e) => setSeasonGradeLevel(e.target.value as SeasonGradeLevel | "")}
              disabled={loading || saving || scoring}
            >
              <option value="">Season grade level</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>

            <input
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              placeholder="School classification (e.g. 6)"
              value={schoolClassification}
              onChange={(e) => setSchoolClassification(e.target.value)}
              disabled={loading || saving || scoring}
              inputMode="numeric"
            />

            <select
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              value={competitionLevel}
              onChange={(e) => setCompetitionLevel(e.target.value as CompetitionLevel | "")}
              disabled={loading || saving || scoring}
            >
              <option value="">Competition level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <input
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              placeholder="Games played pct (0–1)"
              value={gamesPlayedPct}
              onChange={(e) => setGamesPlayedPct(e.target.value)}
              disabled={loading || saving || scoring}
              inputMode="decimal"
            />

            <input
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              placeholder="Height (inches)"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              disabled={loading || saving || scoring}
              inputMode="decimal"
            />

            <input
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
              placeholder="Weight (lb)"
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              disabled={loading || saving || scoring}
              inputMode="decimal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={save}
              disabled={loading || saving || scoring}
              className="w-full rounded-xl border border-white/20 px-4 py-3 hover:bg-white/10 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>

            <button
              onClick={getScore}
              disabled={loading || saving || scoring}
              className="w-full rounded-xl border border-white/20 px-4 py-3 hover:bg-white/10 disabled:opacity-50"
            >
              {scoring ? "Scoring..." : "Get score"}
            </button>
          </div>

          {status && <p className="text-white/80">{status}</p>}

          {score ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">Score (stub)</h2>
                <p className="text-white/70">Expected level: {score.expected_college_level.toFixed(2)}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-white/70 mb-2">Rungs</p>
                  <ul className="space-y-1">
                    <li>ge1: {score.p_rungs.ge1.toFixed(3)}</li>
                    <li>ge2: {score.p_rungs.ge2.toFixed(3)}</li>
                    <li>ge3: {score.p_rungs.ge3.toFixed(3)}</li>
                    <li>ge4: {score.p_rungs.ge4.toFixed(3)}</li>
                    <li>ge5: {score.p_rungs.ge5.toFixed(3)}</li>
                    <li>eq6: {score.p_rungs.eq6.toFixed(3)}</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-white/70 mb-2">Levels</p>
                  <ul className="space-y-1">
                    <li>0: {score.p_levels.level_0.toFixed(3)}</li>
                    <li>1: {score.p_levels.level_1.toFixed(3)}</li>
                    <li>2: {score.p_levels.level_2.toFixed(3)}</li>
                    <li>3: {score.p_levels.level_3.toFixed(3)}</li>
                    <li>4: {score.p_levels.level_4.toFixed(3)}</li>
                    <li>5: {score.p_levels.level_5.toFixed(3)}</li>
                    <li>6: {score.p_levels.level_6.toFixed(3)}</li>
                  </ul>
                </div>
              </div>

              {score.note ? <p className="text-white/60 mt-3 text-xs">{score.note}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
