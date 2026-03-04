export default function LearnPage() {
  return (
    <div style={{ maxWidth: 980 }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Learn</h1>
      <p style={{ fontSize: 16, opacity: 0.78, lineHeight: 1.7 }}>
        This page explains what the scores mean, how the ladder works, and how to interpret
        uncertainty. The goal is usable scouting context, not math theater.
      </p>

      <div style={grid}>
        <section style={card}>
          <h2 style={h2}>What EQ6 means</h2>
          <p style={p}>
            <b>EQ6</b> is the model’s probability that a player reaches the highest rung (level 6).
            In your current setup, that’s the “FBS” outcome bucket.
          </p>
          <p style={p}>
            Example: EQ6 = 0.18 means “about an 18% chance of level-6 outcome,” not “top 18%.”
            Percentile and probability are different.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Ladder model (GE1–GE5 + EQ6)</h2>
          <p style={p}>
            The model predicts cumulative probabilities:
          </p>
          <ul style={ul}>
            <li>GE1 = P(Y ≥ 1)</li>
            <li>GE2 = P(Y ≥ 2)</li>
            <li>GE3 = P(Y ≥ 3)</li>
            <li>GE4 = P(Y ≥ 4)</li>
            <li>GE5 = P(Y ≥ 5)</li>
            <li>EQ6 = P(Y = 6)</li>
          </ul>
          <p style={p}>
            Monotonic enforcement ensures: GE1 ≥ GE2 ≥ GE3 ≥ GE4 ≥ GE5.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Exact level reconstruction</h2>
          <p style={p}>Convert cumulative rungs into exact probabilities:</p>
          <pre style={code}>
{`P0 = 1 - GE1
P1 = GE1 - GE2
P2 = GE2 - GE3
P3 = GE3 - GE4
P4 = GE4 - GE5
P5 = GE5 - EQ6
P6 = EQ6`}
          </pre>
          <p style={p}>
            These P0–P6 values sum to 1 and form the full outcome distribution.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Expected college level</h2>
          <p style={p}>
            Expected value is:
          </p>
          <pre style={code}>
{`E[Y] = Σ k * Pk  (k from 0 to 6)`}
          </pre>
          <p style={p}>
            It’s a single-number summary of the full probability distribution.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>How to interpret badges</h2>
          <ul style={ul}>
            <li><b>Elite</b>: EQ6 ≥ 0.47 (≈ 99th percentile threshold from cohort)</li>
            <li><b>Top 5%</b>: EQ6 ≥ 0.26 and &lt; 0.47 (≈ 95th percentile threshold)</li>
            <li><b>Above Base</b>: EQ6 &gt; 0.065 (above FBS base rate ≈ 6.5%)</li>
          </ul>
          <p style={p}>
            Base rate is a calibration anchor. Percentile is a ranking anchor. Don’t confuse them.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>What this is (and isn’t)</h2>
          <ul style={ul}>
            <li>It’s a scouting support tool, not an oracle.</li>
            <li>It’s strongest when combined with film, context, and coach eval.</li>
            <li>It can be wrong—so we use calibration + transparency to reduce harm.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
  marginTop: 18,
};

const card: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(16,22,40,0.65)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 16px 60px rgba(0,0,0,0.35)",
};

const h2: React.CSSProperties = {
  fontSize: 16,
  margin: 0,
  marginBottom: 10,
};

const p: React.CSSProperties = {
  margin: 0,
  marginTop: 10,
  opacity: 0.78,
  lineHeight: 1.7,
  fontSize: 14,
};

const ul: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  paddingLeft: 18,
  opacity: 0.78,
  lineHeight: 1.8,
  fontSize: 14,
};

const code: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.25)",
  overflowX: "auto",
  fontSize: 13,
  lineHeight: 1.6,
  opacity: 0.9,
};