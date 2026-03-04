"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // If Supabase recovery link lands on "/", forward to /reset-password
    // Example: /#access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 42, marginBottom: 16 }}>
        Opportunity-Adjusted Football Scouting
      </h1>

      <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.6 }}>
        ScoutAI predicts collegiate football outcomes using an ordinal ladder model,
        opportunity-adjusted features, and calibrated probability estimates.
      </p>

      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        <a href="/leaderboard" style={ctaPrimary}>
          View Leaderboard
        </a>

       <a href="/login" style={ctaSecondary}>
  	 Create Player Profile
       </a>
      </div>
    </div>
  );
}

const ctaPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f7cff, #7a5cff)",
  padding: "14px 22px",
  borderRadius: 10,
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
};

const ctaSecondary: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "14px 22px",
  borderRadius: 10,
  color: "#fff",
  textDecoration: "none",
  fontWeight: 500,
};