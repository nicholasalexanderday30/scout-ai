"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Row = {
  source: "portal" | "historical";
  player_key: string;
  display_name: string;
  position?: string;
  season?: number;
  p_eq6: number | null;
  expected_college_level: number | null;

  percentile: number | null; // 0..1
  above_base_rate: boolean;
  is_95th: boolean;
  is_99th: boolean;
};

type ApiResponse = {
  count: number;
  rows: Row[];
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function fmtPct(x: number | null) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}

function fmtPercentile(x: number | null) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}th`;
}


function fmtLevel(x: number | null) {
  if (x == null || Number.isNaN(x)) return "—";
  return String(Math.round(x));
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function sourceLabel(s: "portal" | "historical") {
  return s === "portal" ? "Portal" : "Historical";
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  // Filters
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "portal" | "historical">("all");
  const [minEq6Pct, setMinEq6Pct] = useState<number>(0); // 0..100
  const [sort, setSort] = useState<"eq6_desc" | "name_asc">("eq6_desc");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);

   

      const res = await fetch("/api/leaderboard", { method: "GET" });
      if (!res.ok) {
        const txt = await res.text();
        if (!cancelled) {
          setErr(`API error (${res.status}): ${txt}`);
          setLoading(false);
        }
        return;
      }

      const json = (await res.json()) as ApiResponse;
      if (!cancelled) {
        setData(json);
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => data?.rows ?? [], [data]);

  const filteredRows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const minEq6 = clamp(minEq6Pct, 0, 100) / 100;

    let out = rows;

    if (source !== "all") out = out.filter((r) => r.source === source);
    out = out.filter((r) => (r.p_eq6 ?? -1) >= minEq6);

    if (qq.length > 0) {
      out = out.filter((r) => {
        const name = (r.display_name ?? "").toLowerCase();
        const key = (r.player_key ?? "").toLowerCase();
        return name.includes(qq) || key.includes(qq);
      });
    }

    if (sort === "eq6_desc") {
      out = [...out].sort((a, b) => (b.p_eq6 ?? -1) - (a.p_eq6 ?? -1));
    } else {
      out = [...out].sort((a, b) =>
        (a.display_name ?? a.player_key).localeCompare(b.display_name ?? b.player_key)
      );
    }

    return out;
  }, [rows, q, source, minEq6Pct, sort]);

  return (
    <div style={wrap}>
      {/* Background */}
      <div style={bgGlow} />

      {/* Header */}
      <div style={header}>
        <div>
          <div style={h1}>Leaderboard</div>
          <div style={sub}>
            Ranked by <b>EQ6 (FBS probability)</b>
          </div>
        </div>

        <div style={meta}>
          {data ? (
            <>
              <div style={metaNum}>{filteredRows.length}</div>
              <div style={metaText}>shown</div>
              <div style={metaDivider} />
              <div style={metaNum}>{data.count}</div>
              <div style={metaText}>total</div>
            </>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <div style={filtersCard}>
        <div>
          <div style={label}>Search</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or key…"
            style={input}
          />
        </div>

        <div>
          <div style={label}>Source</div>
          <select value={source} onChange={(e) => setSource(e.target.value as any)} style={input}>
            <option value="all">All</option>
            <option value="historical">Historical</option>
            <option value="portal">Portal</option>
          </select>
        </div>

        <div>
          <div style={label}>Min EQ6</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={minEq6Pct}
              onChange={(e) => setMinEq6Pct(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ width: 64, textAlign: "right", opacity: 0.85 }}>{minEq6Pct}%</div>
          </div>
        </div>

        <div>
          <div style={label}>Sort</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={input}>
            <option value="eq6_desc">EQ6 ↓</option>
            <option value="name_asc">Name A→Z</option>
          </select>
        </div>
      </div>

      {loading && <div style={noticeCard}>Loading…</div>}
      {err && <div style={{ ...noticeCard, borderColor: "rgba(255,160,80,0.55)" }}>{err}</div>}

      {!loading && !err && (
        <div style={tableCard}>
          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 80 }}>Rank</th>
                  <th style={th}>Name</th>
                  <th style={{ ...th, width: 120 }}>Source</th>
                  <th style={{ ...th, width: 80 }}>Pos</th>
                  <th style={{ ...th, width: 90 }}>Season</th>
		  <th style={{ ...th, textAlign: "right", width: 120 }}>EQ6</th>
                  <th style={{ ...th, textAlign: "right", width: 120 }}>Percentile</th>
                  <th style={{ ...th, textAlign: "right", width: 140 }}>Expected</th>

                </tr>
              </thead>

              <tbody>
                {filteredRows.map((r, i) => {
                  const top = i < 5;
                  return (
                    <tr
                      key={r.player_key}
                      style={{
                        ...trBase,
                        ...(top ? trTop : null),
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as any).style.background =
                          "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as any).style.background = top
                          ? "rgba(120,200,255,0.06)"
                          : "rgba(255,255,255,0.00)";
                      }}
                    >
                      <td style={{ ...td, fontWeight: 800, opacity: 0.9 }}>
                        #{i + 1}
                      </td>

                      <td style={tdName}>
                        <a
                          href={`/player/${encodeURIComponent(
                            String(r.source).toLowerCase().trim()
                          )}/${encodeURIComponent(r.player_key)}`}
                          style={link}
                        >
                          {r.display_name?.trim() || r.player_key}
                        </a>
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            ...pill,
                            ...(r.source === "portal" ? pillPortal : pillHist),
                          }}
                        >
                          {sourceLabel(r.source)}
                        </span>
                      </td>

                      <td style={td}>{r.position ?? "—"}</td>
                      <td style={{ ...td, opacity: 0.75 }}>{r.season ?? "—"}</td>
		      <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
  		        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                         <span>{fmtPct(r.p_eq6)}</span>

    			 {r.is_99th && (
      			   <span style={{ ...pill, background: "rgba(255,80,80,0.18)", borderColor: "rgba(255,80,80,0.45)" }}>
        		     Elite
      			   </span>
    			 )}

    			 {!r.is_99th && r.is_95th && (
      			   <span style={{ ...pill, background: "rgba(120,180,255,0.18)", borderColor: "rgba(120,180,255,0.45)" }}>
        		     Top 5%
      			   </span>
    			)}

    			{!r.is_95th && r.above_base_rate && (
      			  <span style={{ ...pill, background: "rgba(120,255,170,0.14)", borderColor: "rgba(120,255,170,0.38)" }}>
        		    Above Base
      			 </span>
    			)}
  		     </div>
		   </td>
                      

		     <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
  		       {fmtPercentile(r.percentile)}
		     </td>

	   	    <td style={{ ...td, textAlign: "right", opacity: 0.85 }}>
  		      {fmtLevel(r.expected_college_level)}
		    </td>
                    </tr>
                  );
                })}

                {filteredRows.length === 0 && (
                  <tr>
                    <td style={{ padding: 14, opacity: 0.7 }} colSpan={7}>
                      No results match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={tableFooter}>
            Tip: Click a name to open the full player card.
          </div>
        </div>
      )}
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
  inset: -80,
  background:
    "radial-gradient(900px 400px at 20% 0%, rgba(90,140,255,0.20), transparent 60%), radial-gradient(800px 380px at 90% 10%, rgba(120,220,200,0.16), transparent 55%)",
  filter: "blur(12px)",
  pointerEvents: "none",
  zIndex: -1,
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
};

const h1: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: -0.4,
};

const sub: React.CSSProperties = {
  marginTop: 6,
  opacity: 0.7,
  fontSize: 13,
};

const meta: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(10px)",
};

const metaNum: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
};

const metaText: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
};

const metaDivider: React.CSSProperties = {
  width: 1,
  height: 18,
  background: "rgba(255,255,255,0.12)",
  margin: "0 2px",
};

const filtersCard: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
  display: "grid",
  gridTemplateColumns: "1.2fr 0.6fr 1fr 0.7fr",
  gap: 12,
};

const label: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.18)",
  color: "inherit",
  outline: "none",
};

const noticeCard: React.CSSProperties = {
  marginTop: 18,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
};

const tableCard: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(14px)",
  overflow: "hidden",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  textAlign: "left",
  padding: "12px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontWeight: 700,
  whiteSpace: "nowrap",
  background: "rgba(15,18,24,0.65)",
  backdropFilter: "blur(12px)",
};

const td: React.CSSProperties = {
  padding: "11px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  whiteSpace: "nowrap",
};

const tdName: React.CSSProperties = {
  ...td,
  fontWeight: 700,
  maxWidth: 360,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const trBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.00)",
  transition: "background 160ms ease",
};

const trTop: React.CSSProperties = {
  background: "rgba(120,200,255,0.06)",
};

const pill: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.10)",
  opacity: 0.95,
};

const pillPortal: React.CSSProperties = {
  background: "rgba(120,220,200,0.10)",
};

const pillHist: React.CSSProperties = {
  background: "rgba(90,140,255,0.10)",
  opacity: 0.85,
};

const link: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};

const tableFooter: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 12,
  opacity: 0.7,
};