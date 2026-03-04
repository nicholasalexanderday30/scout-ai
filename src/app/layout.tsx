import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AuthNav from "./ui/AuthNav";

export const metadata: Metadata = {
  title: "ScoutAI",
  description: "AI-driven football scouting and development platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0b0f18",
          color: "#fff",
        }}
      >
        <nav style={nav}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>ScoutAI</div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" style={linkStyle}>
              Home
            </Link>
            <Link href="/leaderboard" style={linkStyle}>
              Leaderboard
            </Link>
            <Link href="/about" style={linkStyle}>
              About
            </Link>
            <Link href="/learn" style={linkStyle}>
              Learn
            </Link>
            <Link href="/dashboard" style={linkStyle}>
              Create Profile
            </Link>

            <AuthNav />
          </div>
        </nav>

        <main style={{ padding: "40px 32px" }}>{children}</main>
      </body>
    </html>
  );
}

const nav: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 32px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10,14,24,0.95)",
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 50,
};

const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  textDecoration: "none",
  fontWeight: 500,
};