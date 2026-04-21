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
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");

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

  function validateNumeric(label: string, value: string, min: number, max: number | null) {
    if (value.trim() === "") return null;

    const n = Number(value);

    if (!Number.isFinite(n)) return `${label} must be a number`;

    if (n < min) return `${label} must be ≥ ${min}`;

    if (max !== null && n > max) return `${label} must be ≤ ${max}`;

    return null;
  }

  const save = async () => {
    setSaving(true);
    setStatus("");
    setScore(null);

    const errHeight = validateNumeric("Height", heightIn, 50, 90);
    const errWeight = validateNumeric("Weight", weightLb, 100, 350);
    const errGames = validateNumeric("Games pct", gamesPlayedPct, 0, 1);
    const errClass = validateNumeric("School classification", schoolClassification, 1, 10);

    if (errHeight || errWeight || errGames || errClass) {
      setStatus(errHeight || errWeight || errGames || errClass || "");
      setSaving(false);
      return;
    }

    const payload: PlayerProfile = {
      user_id: userId,
      full_name: fullName.trim() || null,
      position: position.trim() || null,
      school: school.trim() || null,
      grad_year: gradYear.trim() === "" ? null : Number(gradYear),
      season_grade_level: seasonGradeLevel === "" ? null : seasonGradeLevel,
      school_classification:
        schoolClassification.trim() === "" ? null : Number(schoolClassification),
      competition_level: competitionLevel === "" ? null : competitionLevel,
      games_played_pct: gamesPlayedPct.trim() === "" ? null : Number(gamesPlayedPct),
      height_in: heightIn.trim() === "" ? null : Number(heightIn),
      weight_lb: weightLb.trim() === "" ? null : Number(weightLb),
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

    const res = await fetch("/api/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        season_grade_level: seasonGradeLevel,
        school_classification: Number(schoolClassification),
        competition_level: competitionLevel,
        games_played_pct: Number(gamesPlayedPct),
        height_in: Number(heightIn),
        weight_lb: Number(weightLb),
      }),
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
          />

          <select
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">Position</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="OL">OL</option>
            <option value="DL">DL</option>
            <option value="LB">LB</option>
            <option value="CB">CB</option>
            <option value="S">S</option>
            <option value="ATH">ATH</option>
          </select>

          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="School"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none"
            placeholder="Graduation year"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
          />

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl border border-white/20 px-4 py-3 hover:bg-white/10"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>

          <button
            onClick={getScore}
            disabled={scoring}
            className="w-full rounded-xl border border-white/20 px-4 py-3 hover:bg-white/10"
          >
            {scoring ? "Scoring..." : "Get score"}
          </button>

          {status && <p className="text-white/80">{status}</p>}

        </div>
      </div>
    </main>
  );
}