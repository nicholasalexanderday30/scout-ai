"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) window.location.href = "/dashboard";
    }

    check();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setErr("Email and password required.");
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErr(error.message);
          return;
        }
        window.location.href = "/dashboard";
        return;
      }

      // signup
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErr(error.message);
        return;
      }

      setMsg("Account created. Check your email if confirmation is required, then log in.");
      setMode("login");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: 18 }}>
          <div style={brand}>ScoutAI</div>
          <div style={subtitle}>
            {mode === "login" ? "Sign in (optional — leaderboard is public)" : "Create an account (optional)"}
          </div>
        </div>

        <div style={tabs}>
          <button
            onClick={() => {
              setErr(null);
              setMsg(null);
              setMode("login");
            }}
            style={{ ...tabBtn, ...(mode === "login" ? tabActive : {}) }}
            type="button"
          >
            Login
          </button>
          <button
            onClick={() => {
              setErr(null);
              setMsg(null);
              setMode("signup");
            }}
            style={{ ...tabBtn, ...(mode === "signup" ? tabActive : {}) }}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={label}>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              style={input}
            />
          </label>

          <label style={label}>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={input}
            />
          </label>

          {err && <div style={{ ...notice, borderColor: "rgba(255,120,120,0.45)" }}>{err}</div>}
          {msg && <div style={{ ...notice, borderColor: "rgba(120,255,170,0.35)" }}>{msg}</div>}

          <button type="submit" style={btn} disabled={loading}>
            {loading ? "Working…" : mode === "login" ? "Login" : "Create account"}
          </button>

          <div style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.5, marginTop: 4 }}>
            By continuing, you agree this is a prototype scouting analytics system. Do not submit
            sensitive personal data.
          </div>
        </form>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "calc(100vh - 80px)",
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "min(460px, 100%)",
  padding: 22,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(16,22,40,0.75)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 16px 60px rgba(0,0,0,0.45)",
};

const brand: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 0.2,
};

const subtitle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  opacity: 0.7,
};

const tabs: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  padding: 6,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.20)",
  marginBottom: 14,
};

const tabBtn: React.CSSProperties = {
  border: "1px solid transparent",
  background: "transparent",
  color: "rgba(255,255,255,0.75)",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const tabActive: React.CSSProperties = {
  background: "rgba(120,180,255,0.14)",
  borderColor: "rgba(120,180,255,0.35)",
  color: "#fff",
};

const label: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
  display: "grid",
  gap: 6,
};

const input: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  outline: "none",
};

const btn: React.CSSProperties = {
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "linear-gradient(135deg, #4f7cff, #7a5cff)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const notice: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  fontSize: 12,
  opacity: 0.9,
};