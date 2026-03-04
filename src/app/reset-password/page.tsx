"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // When user clicks recovery email link, Supabase returns tokens in the URL hash.
  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash) {
      setErr("Missing recovery token. Open this page using the link from your email.");
      setReady(true);
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setErr("Invalid recovery link. Request a new password reset email.");
      setReady(true);
      return;
    }

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) setErr(error.message);
        setReady(true);
      });
  }, []);

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (newPassword.length < 8) {
        setErr("Password must be at least 8 characters.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErr(error.message);
        return;
      }

      setMsg("Password updated. You can now log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Reset password</div>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
          Use the recovery link from your email to set a new password.
        </div>

        {!ready ? (
          <div style={{ marginTop: 16, opacity: 0.75 }}>Loading…</div>
        ) : (
          <form onSubmit={onUpdate} style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="New password (8+ chars)"
              style={input}
            />

            {err && <div style={{ ...notice, borderColor: "rgba(255,120,120,0.45)" }}>{err}</div>}
            {msg && <div style={{ ...notice, borderColor: "rgba(120,255,170,0.35)" }}>{msg}</div>}

            <button type="submit" disabled={loading} style={btn}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
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

const input: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  outline: "none",
};

const btn: React.CSSProperties = {
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