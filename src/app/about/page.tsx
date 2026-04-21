export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>
        About ScoutAI
      </h1>

      <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.6 }}>
        ScoutAI started from a simple observation: recruiting often rewards access
        as much as it rewards ability.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        Players with better coaching, training, and exposure tend to look more
        polished early on. Players without those advantages can fall behind on
        paper, even if their long-term potential is just as high.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        I built ScoutAI to explore whether that gap could be measured instead of
        ignored. The system uses data to estimate how players project to different
        levels of college football, while accounting for the environments they
        developed in.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        The goal is not to replace scouting, but to make it more complete. Instead
        of relying only on what is visible today, ScoutAI is designed to highlight
        players whose development may be constrained by their situation.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        This matters more now than ever. In the NIL era, recruiting decisions carry
        real financial implications. Identifying undervalued players is no longer
        just a competitive edge — it is a more efficient way to allocate resources.
      </p>

      <p style={{ marginTop: 20, lineHeight: 1.7, opacity: 0.75 }}>
        ScoutAI is an ongoing project. The next step is expanding the system to
        track what happens after players reach college, shifting the focus from
        access to long-term impact.
      </p>
    </div>
  );
}