"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle
        cx="14"
        cy="14"
        r="13"
        stroke={light ? "rgba(246, 241, 231, 0.7)" : "var(--green-800)"}
        strokeWidth="1.4"
      />
      <path
        d="M8 17c2-4 4-7 6-7s4 3 6 7"
        stroke={light ? "rgba(246, 241, 231, 0.7)" : "var(--green-800)"}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="10" r="1.5" fill="var(--terracotta)" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const schema = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";
      const { data: profile } = await supabase
        .schema(schema)
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role;
      if (role === "admin") window.location.href = "/admin";
      else if (role === "provider") window.location.href = "/provider";
      else setError("No access. Contact your administrator.");
    }

    setLoading(false);
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" 
      style={{ background: "var(--cream-50)" }}
    >
      {/* Background patterns similar to landing page */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.6,
          backgroundImage:
            "radial-gradient(circle at top right, rgba(232, 148, 100, 0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(27, 58, 45, 0.08) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(27, 58, 45, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(27, 58, 45, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <Link 
        href="/" 
        style={{ 
          position: "absolute", 
          top: 32, 
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none"
        }}
      >
        <Logo />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--green-900)",
            letterSpacing: "-0.01em",
          }}
        >
          {"Seeks "}
          <span style={{ color: "var(--terracotta)" }}>&amp;</span>
          {" Explore"}
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="mb-10 text-center">
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
            Provider Portal
          </div>
          <h1 
            className="display" 
            style={{ 
              fontSize: "clamp(32px, 4vw, 42px)", 
              margin: "0 0 12px",
            }}
          >
            Welcome <em>back</em>
          </h1>
          <p style={{ color: "var(--ink-sub)", fontSize: 15 }}>
            Sign in to manage your operations.
          </p>
        </div>

        <form 
          onSubmit={handleLogin} 
          style={{
            background: "var(--white)",
            borderRadius: 18,
            padding: "36px 32px",
            border: "1px solid var(--line)",
            boxShadow: "0 20px 40px rgba(15, 42, 31, 0.04), 0 1px 3px rgba(15, 42, 31, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div>
            <label 
              style={{ 
                display: "block", 
                fontSize: 13, 
                fontWeight: 500, 
                color: "var(--ink)", 
                marginBottom: 8 
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--cream-50)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
                transition: "border-color 200ms, box-shadow 200ms",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--terracotta)";
                e.target.style.boxShadow = "0 0 0 3px rgba(232, 148, 100, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--line)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label 
              style={{ 
                display: "block", 
                fontSize: 13, 
                fontWeight: 500, 
                color: "var(--ink)", 
                marginBottom: 8 
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--cream-50)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
                transition: "border-color 200ms, box-shadow 200ms",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--terracotta)";
                e.target.style.boxShadow = "0 0 0 3px rgba(232, 148, 100, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--line)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div 
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#FFD9D9",
                color: "#A33",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              width: "100%", 
              marginTop: 8,
              padding: "14px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
