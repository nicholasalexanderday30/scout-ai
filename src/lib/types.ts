export type CompetitionLevel = "Low" | "Medium" | "High";
export type SeasonGradeLevel = "Freshman" | "Sophomore" | "Junior" | "Senior";

export type PlayerProfile = {
  user_id: string;

  // basic identity
  full_name: string | null;
  position: string | null;
  school: string | null;
  grad_year: number | null;

  // model-parity inputs (CB 2022)
  season_grade_level: SeasonGradeLevel | null;
  school_classification: number | null;
  competition_level: CompetitionLevel | null;
  games_played_pct: number | null;
  height_in: number | null;
  weight_lb: number | null;
};
