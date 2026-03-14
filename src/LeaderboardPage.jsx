import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAward, FiCode, FiHome } from "react-icons/fi";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import Particles from "./Lighting.jsx";

import { API_BASE } from "./config.js";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [premiumChecked, setPremiumChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkPremium() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok && res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const user = data?.user ?? data;
          if (!user?.Premium) {
            navigate("/price", { replace: true });
            return;
          }
        }
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setPremiumChecked(true);
      }
    }
    checkPremium();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (!premiumChecked) return;
    let cancelled = false;
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_BASE}/leaderboard?limit=50`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.message || "Failed to load leaderboard");
          return;
        }
        setList(json?.data ?? json ?? []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { cancelled = true; };
  }, [premiumChecked]);

  if (!premiumChecked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
          <p className="text-white font-semibold">Checking access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="absolute inset-0 z-1 bg-black/30" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 py-8 sm:py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
                  <FiAward className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Coding Leaderboard</h1>
                  <p className="text-sm text-slate-400">Top scores from coding interviews</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FiHome className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/coding-interview/start"
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors"
                  >
                    <FiCode className="w-4 h-4" />
                    Start coding interview
                  </Link>
                </div>
                {loading && <p className="text-slate-400 py-8 text-center">Loading…</p>}
                {error && <p className="text-rose-400 py-4">{error}</p>}
                {!loading && !error && list.length === 0 && (
                  <p className="text-slate-500 py-8 text-center">No submissions yet.</p>
                )}
                {!loading && !error && list.length > 0 && (
                  <ul className="space-y-2">
                    {list.map((entry, i) => (
                      <motion.li
                        key={entry.rank ?? i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                          entry.rank === 1
                            ? "border-amber-500/40 bg-amber-500/10"
                            : entry.rank === 2
                            ? "border-slate-400/30 bg-slate-500/10"
                            : entry.rank === 3
                            ? "border-orange-600/30 bg-orange-600/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span className="w-8 text-center font-bold text-slate-400">
                          #{entry.rank}
                        </span>
                        <span className="flex-1 font-medium text-white">{entry.name}</span>
                        <span className="font-bold text-amber-400">{entry.score}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
