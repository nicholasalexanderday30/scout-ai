"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type PlayerResponse =
  | {
      source: "historical";
      player_key: string;
      display_name: string;
      position: string;
      season: number;
      scores: {
        p_eq6: number | null;
        expected_college_level: number | null;
        p_rungs: Record<string, number> | null;
        p_levels: Record<string, number> | null;
        scored_at: string | null;
      };
      stats: Record<string, any>;
    }
  | {
      source: "portal";
      player_key: string;
      display_name: string;
      position: string;
      season: number;
      profile: Record<string, any>;
      metrics: Record<string, any>[];
      constraints: Record<string, any>[];
    };

function fmtPct(x: number | null | undefined) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}

function fmtPctNum(x: number | null | undefined) {
  if (x == null || Number.isNaN(x)) return null;
  return x * 100;
}

function fmtNum(x: any) {
  if (x == null) return "—";
  if (typeof x === "number" && Number.isFinite(x)) return x.toString();
  return String(x);
}

function toEntries(obj: Record<string, any>) {
  return Object.entries(obj || {}).sort(([a], [b]) => a.localeCompare(b));
}

function normParam(v: any) {
  if (Array.isArray(v)) return String(v[0] ?? "").trim();
  return String(v ?? "").trim();
}

function classifyEq6(p: number | null) {
  if (p == null) return "neutral";
  if (p >= 0.25) return "high";
  if (p >= 0.10) return "mid";
  return "low";
}

function groupHistoricalStats(stats: Record<string, any>) {
  const physKeys = new Set(["height_in", "weight_lb"]);
  const oppKeys = new Set(["season_grade_level", "school_classification", "competition_level", "games_played_pct"]);
  const outKeys = new Set(["college_level", "FBS_Level"]);

  const physical: Record<string, any> = {};
  const opportunity: Record<string, any> = {};
  const outcome: Record<string, any> = {};
  const other: Record<string, any> = {};

  for (const [k, v] of Object.entries(stats || {})) {
    if (physKeys.has(k)) physical[k] = v;
    else if (oppKeys.has(k)) opportunity[k] = v;
    else if (outKeys.has(k)) outcome[k] = v;
    else other[k] = v;
  }

  return { physical, opportunity, outcome, other };
}

export default function PlayerPage() {
  const params = useParams<{ source?: string; key?: string }>();
  const source = normParam(params?.source).toLowerCase();
  const key = normParam(params?.key);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PlayerResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);

      if (!source || !key) {
        if (!cancelled) {
          setErr(`Missing route params. source='${source}' key='${key}'`);
          setLoading(false);
        }
        return;
      }

      if (source !== "historical" && source !== "portal") {
        if (!cancelled) {
          setErr(`Bad route params. source='${source}' key='${key}'`);
          setLoading(false);
        }
        return;
      }

      const url = `/api/player?source=${encodeURIComponent(source)}&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);

      if (!res.ok) {
        const txt = await res.text();
        if (!cancelled) {
          setErr(`API error (${res.status}): ${txt}`);
          setLoading(false);
        }
        return;
      }

      const json = (await res.json()) as PlayerResponse;
      if (!cancelled) {
        setData(json);
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [source, key]);

  const title = useMemo(() => {
    if (!data) return "Player";
    return data.display_name?.trim() || data.player_key;
  }, [data]);

  const subtitle = useMemo(() => {
    if (!data) return "";
    const s = data.source === "portal" ? "Portal" : "Historical";
    return `${s} • ${data.position ?? "—"} • Season ${data.season ?? "—"}`;
  }, [data]);

  const eq6 = useMemo(() => {
    if (!data) return null;
    if (data.source === "historical") return data.scores?.p_eq6 ?? null;
    return null;
  }, [data]);

  const eq6Class = classifyEq6(eq6);

  const histGroups = useMemo(() => {
    if (!data || data.source !== "historical") return null;
    return groupHistoricalStats(data.stats || {});
  }, [data]);

  return (
    <div style={wrap}>
      <div style={bgGlow} />

      {/* Top nav */}
      <div style={topbar}>
        <Link href="/leaderboard" style={backLink}>
          ← Leaderboard
        </Link>
        {data ? <div style={keyChip}>{data.player_key}</div> : null}
      </div>

      {/* Header */}
      <div style={header}>
        <div>
          <div style={h1}>{title}</div>
          <div style={sub}>{subtitle}</div>
        </div>

        {data?.source === "historical" && (
          <div style={heroScore}>
            <div style={{ ...badge, ...(eq6Class === "high" ? badgeHigh : eq6Class === "mid" ? badgeMid : badgeLow) }}>
              EQ6
            </div>
            <div style={heroVal}>{fmtPct(eq6)}</div>
            <div style={heroHint}>FBS probability</div>
          </div>
        )}
      </div>

      {loading && <div style={noticeCard}>Loading…</div>}
      {err && <div style={{ ...noticeCard, borderColor: "rgba(255,160,80,0.55)" }}>{err}</div>}

      {!loading && !err && data && (
        <>
          {/* Score cards */}
          {data.source === "historical" && (
            <div style={cardsRow}>
              <div style={card}>
                <div style={cardTitle}>Topline</div>
                <div style={kvRow}>
                  <div style={k}>EQ6 (FBS prob)</div>
                  <div style={vStrong}>{fmtPct(data.scores?.p_eq6)}</div>
                </div>
                <div style={kvRow}>
                  <div style={k}>Expected college level</div>
                  <div style={v}>{fmtNum(data.scores?.expected_college_level)}</div>
                </div>
                <div style={kvRow}>
                  <div style={k}>Scored at</div>
                  <div style={v}>{data.scores?.scored_at ?? "—"}</div>
                </div>
              </div>

              <div style={card}>
                <div style={cardTitle}>Ladder probabilities</div>
                <div style={{ marginTop: 10 }}>
                  {toEntries(data.scores?.p_rungs || {}).map(([kk, vv]) => {
                    const pct = fmtPctNum(Number(vv));
                    return (
                      <div key={kk} style={barRow}>
                        <div style={barLabel}>{kk.toUpperCase()}</div>
                        <div style={barTrack}>
                          <div
                            style={{
                              ...barFill,
                              width: pct == null ? "0%" : `${Math.max(0, Math.min(100, pct))}%`,
                            }}
                          />
                        </div>
                        <div style={barVal}>{fmtPct(Number(vv))}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Historical: grouped stats */}
          {data.source === "historical" && histGroups && (
            <>
              <div style={sectionTitle}>Profile</div>
              <div style={grid3}>
                <div style={card}>
                  <div style={cardTitle}>Physical</div>
                  <StatGrid obj={histGroups.physical} />
                </div>
                <div style={card}>
                  <div style={cardTitle}>Opportunity</div>
                  <StatGrid obj={histGroups.opportunity} />
                </div>
                <div style={card}>
                  <div style={cardTitle}>Outcome</div>
                  <StatGrid obj={histGroups.outcome} />
                </div>
              </div>

              <div style={sectionTitle}>All stats</div>
              <div style={card}>
                <StatGrid obj={data.stats || {}} columns={3} />
              </div>
            </>
          )}

          {/* Portal: keep clean, not raw dumps */}
          {data.source === "portal" && (
            <>
              <div style={sectionTitle}>Profile</div>
              <div style={card}>
                <StatGrid obj={(data as any).profile || {}} columns={3} />
              </div>

              <div style={sectionTitle}>Metrics</div>
              <div style={card}>
                <PrettyList rows={(data as any).metrics || []} emptyText="No metrics rows." />
              </div>

              <div style={sectionTitle}>Opportunity constraints</div>
              <div style={card}>
                <PrettyList rows={(data as any).constraints || []} emptyText="No constraints rows." />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatGrid({ obj, columns = 2 }: { obj: Record<string, any>; columns?: 2 | 3 }) {
  const entries = useMemo(() => toEntries(obj || {}), [obj]);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns === 3 ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      {entries.map(([kk, vv]) => (
        <div key={kk} style={gridItem}>
          <div style={gridK}>{kk}</div>
          <div style={gridV}>{fmtNum(vv)}</div>
        </div>
      ))}
      {entries.length === 0 && <div style={{ opacity: 0.7 }}>—</div>}
    </div>
  );
}

function PrettyList({ rows, emptyText }: { rows: Record<string, any>[]; emptyText: string }) {
  if (!rows || rows.length === 0) return <div style={{ opacity: 0.7 }}>{emptyText}</div>;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r, idx) => (
        <div key={idx} style={{ ...gridItem, padding: 12 }}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 8 }}>Row {idx + 1}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            {toEntries(r).map(([kk, vv]) => (
              <div key={kk} style={miniItem}>
                <div style={miniK}>{kk}</div>
                <div style={miniV}>{fmtNum(vv)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------- styles -------------------- */

const wrap: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 24,
  position: "relative",
};

const bgGlow: React.CSSProperties = {
  position: "absolute",
  inset: -90,
  background:
    "radial-gradient(900px 420px at 18% 0%, rgba(90,140,255,0.22), transparent 60%), radial-gradient(900px 420px at 92% 8%, rgba(120,220,200,0.18), transparent 55%)",
  filter: "blur(12px)",
  pointerEvents: "none",
  zIndex: -1,
};

const topbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const backLink: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  opacity: 0.8,
  fontSize: 14,
};

const keyChip: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(10px)",
  fontSize: 12,
  opacity: 0.85,
  fontVariantNumeric: "tabular-nums",
};

const header: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
};

const h1: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 900,
  letterSpacing: -0.6,
  margin: 0,
};

const sub: React.CSSProperties = {
  marginTop: 8,
  opacity: 0.7,
  fontSize: 13,
};

const heroScore: React.CSSProperties = {
  display: "grid",
  justifyItems: "end",
  gap: 6,
  padding: "12px 14px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.5,
};

const badgeHigh: React.CSSProperties = { background: "rgba(120,220,200,0.14)" };
const badgeMid: React.CSSProperties = { background: "rgba(255,220,130,0.14)" };
const badgeLow: React.CSSProperties = { background: "rgba(255,140,120,0.14)" };

const heroVal: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
};

const heroHint: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
};

const noticeCard: React.CSSProperties = {
  marginTop: 18,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
};

const cardsRow: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(14px)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 10,
  letterSpacing: 0.2,
};

const kvRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "9px 0",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const k: React.CSSProperties = { opacity: 0.7 };
const v: React.CSSProperties = {};
const vStrong: React.CSSProperties = { fontWeight: 900 };

const barRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "72px 1fr 70px",
  gap: 10,
  alignItems: "center",
  padding: "8px 0",
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const barLabel: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
  fontWeight: 700,
  letterSpacing: 0.4,
};

const barTrack: React.CSSProperties = {
  height: 10,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
  overflow: "hidden",
};

const barFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background:
    "linear-gradient(90deg, rgba(90,140,255,0.75), rgba(120,220,200,0.75))",
};

const barVal: React.CSSProperties = {
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  opacity: 0.85,
};

const sectionTitle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
  fontSize: 13,
  opacity: 0.75,
  letterSpacing: 0.25,
  fontWeight: 700,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 14,
};

const gridItem: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: 10,
  background: "rgba(0,0,0,0.16)",
  overflow: "hidden",
};

const gridK: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const gridV: React.CSSProperties = {
  marginTop: 6,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontVariantNumeric: "tabular-nums",
};

const miniItem: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 10,
  background: "rgba(0,0,0,0.14)",
};

const miniK: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const miniV: React.CSSProperties = {
  marginTop: 6,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontVariantNumeric: "tabular-nums",
};