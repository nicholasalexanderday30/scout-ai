export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>
        About ScoutAI
      </h1>

      <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.6 }}>
        ScoutAI is an AI-driven football evaluation system designed to identify
        collegiate-level potential and long-term development upside.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        Unlike traditional scouting systems that rely solely on current
        performance, ScoutAI incorporates:
      </p>

      <ul style={{ marginTop: 16, lineHeight: 1.8, opacity: 0.75 }}>
        <li>Ordinal ladder modeling (GE1–GE6)</li>
        <li>Calibrated probability projections</li>
        <li>Opportunity-aware feature adjustments</li>
        <li>Percentile benchmarking against historical cohorts</li>
        <li>Transparent probability reconstruction</li>
      </ul>

      <p style={{ marginTop: 24, opacity: 0.75 }}>
        The goal is not to replace human intuition — but to enhance it with
        calibrated, explainable analytics.
      </p>
    </div>
  );
}