import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCode, FiZap, FiHome, FiAward } from "react-icons/fi";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import Particles from "./Lighting.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

const ROLES = [
  { id: "Frontend Developer", label: "Frontend Developer" },
  { id: "Backend Developer", label: "Backend Developer" },
  { id: "Full Stack Developer", label: "Full Stack Developer" },
  { id: "Data Scientist", label: "Data Scientist" },
  { id: "ML Engineer", label: "ML Engineer" },
  { id: "DevOps Engineer", label: "DevOps Engineer" },
  { id: "Mobile Developer", label: "Mobile Developer" },
  { id: "Security Engineer", label: "Security Engineer" },
  { id: "Cloud Engineer", label: "Cloud Engineer" },
  { id: "DSA", label: "DSA" },
  { id: "Game Developer", label: "Game Developer" },
];

const DIFFICULTIES = [
  { id: "Beginner", label: "Beginner" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
  { id: "FAANG Level", label: "FAANG Level" },
];

export default function InterviewStartPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Beginner");

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok) {
          if (res.status === 401 || !accessToken) {
            navigate("/login", { replace: true });
            return;
          }
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
        if (!cancelled) setAuthChecking(false);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleStart = () => {
    const params = new URLSearchParams({ role, difficulty });
    navigate(`/coding-interview?${params.toString()}`);
  };

  if (authChecking) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
          <p className="text-white font-semibold">Checking authorization…</p>
          <p className="mt-1 text-sm text-slate-400">Please wait.</p>
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
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiHome className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <FiAward className="w-4 h-4" />
                Leaderboard
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
                  <FiCode className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Coding Interview
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Choose role and difficulty · 15 questions · Full screen (switching tab saves & exits)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Interview type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                          role === r.id
                            ? "border-amber-500/50 bg-amber-500/20 text-amber-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/30"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Difficulty level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          difficulty === d.id
                            ? "border-amber-500/50 bg-amber-500/20 text-amber-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/30"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <FiZap className="w-5 h-5" />
                  Start Interview
                </button>
              </div>
            </motion.div>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
