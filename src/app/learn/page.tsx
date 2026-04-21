export default function LearnPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight text-white">Learn</h1>
          <p className="mt-6 text-xl leading-9 text-white/75">
            ScoutAI is designed to help identify football players whose long-term
            potential may not be fully reflected by their current situation. This
            page explains the idea behind the system in plain English: what it
            measures, why it matters, and how to interpret the scores responsibly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              What ScoutAI does
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                ScoutAI is a data-driven system that evaluates high school football
                players by estimating their chances of reaching different levels of
                college football.
              </p>
              <p>
                Its goal is not just to reward the players who already look the most
                polished. It is built to surface players whose development may be
                limited by their environment, not by their talent.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              The problem it is trying to solve
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                Most recruiting evaluations focus almost entirely on current
                performance. That creates a bias toward players who already have
                access to stronger coaching, better training, more exposure, and more
                stable development conditions.
              </p>
              <p>
                As a result, some players appear less promising than they really are
                simply because they developed under weaker circumstances.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              What makes it different
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>ScoutAI separates two things that are usually blended together:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>what a player has done so far</li>
                <li>what that player had access to while doing it</li>
              </ul>
              <p>
                In other words, it tries to distinguish performance from opportunity.
                That makes it easier to identify players whose results may be held
                down by limited resources rather than limited ability.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              How to read EQ6
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                EQ6 is the model’s estimate of the probability that a player reaches
                the highest outcome tier in the current system.
              </p>
              <p>
                In the current version of ScoutAI, that highest tier is the FBS
                level.
              </p>
              <p>
                Example: an EQ6 of 0.18 means the model sees about an 18% chance of
                that outcome. It does <span className="font-semibold text-white">not</span> mean the player is
                in the top 18% overall. Probability and percentile are different.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              What the ladder means
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                Instead of forcing every player into one rigid prediction, the model
                estimates chances across a ladder of outcomes.
              </p>
              <p>
                That means ScoutAI does not just say where a player will end up. It
                shows the range of outcomes the model thinks are realistically on the
                table.
              </p>
              <p>
                This is useful because player development is uncertain. A single label
                hides that uncertainty. A ladder makes it visible.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Expected college level
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                Expected college level is a single summary number based on the full
                probability distribution.
              </p>
              <p>
                It should be read as a compact snapshot of the player’s overall
                projection, not as a guarantee of where that player will land.
              </p>
              <p>
                The value is most useful when combined with the rest of the profile,
                especially film, context, and the ladder itself.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Why this matters now
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                In the NIL era, recruiting is increasingly tied to financial
                decisions. Schools are not only evaluating talent; they are deciding
                where to invest scholarships, development time, and roster space.
              </p>
              <p>
                That makes undervaluation important. If a player’s current profile is
                being dragged down by limited opportunity, missing that player is both
                a scouting mistake and an inefficient use of resources.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.28),rgba(15,23,42,0.5))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              What ScoutAI is and isn’t
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-white/75">
              <p>
                ScoutAI is a decision-support tool. It is not a replacement for human
                judgment.
              </p>
              <p>
                Its purpose is to improve how people think about players, especially
                players who may be undervalued by traditional evaluation methods.
              </p>
              <p>
                The system can be wrong, which is why transparency, calibration, and
                context all matter.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}