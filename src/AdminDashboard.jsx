import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "./slice/user.slice";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { Users, Sparkles, FileText, TrendingUp } from "lucide-react";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

// Build registration counts by day (last 10 days)
function useRegistrationsByDay(users) {
  return useMemo(() => {
    if (!users?.length) return [];
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = 10;
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = { date: d.toISOString().slice(0, 10), count: 0, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    }
    users.forEach((u) => {
      if (u.createdAt) {
        const key = new Date(u.createdAt).toISOString().slice(0, 10);
        if (buckets[key]) buckets[key].count += 1;
      }
    });
    return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
  }, [users]);
}

// Top users by AI optimize count (for bar chart)
function useOptimizeChartData(users) {
  return useMemo(() => {
    if (!users?.length) return [];
    return users
      .filter((u) => (u.optimizeCount ?? 0) > 0)
      .map((u) => ({ name: u.FirstName ? `${u.FirstName} ${u.LastName || ""}`.trim() || u.email : u.email, count: u.optimizeCount ?? 0, email: u.email }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [users]);
}

// Top users by resume count
function useResumeChartData(users) {
  return useMemo(() => {
    if (!users?.length) return [];
    return users
      .filter((u) => (u.resumeCount ?? 0) > 0)
      .map((u) => ({ name: u.FirstName ? `${u.FirstName} ${u.LastName || ""}`.trim() || u.email : u.email, count: u.resumeCount ?? 0, email: u.email }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [users]);
}

function AdminDashboard() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const registrationsByDay = useRegistrationsByDay(users);
  const optimizeChartData = useOptimizeChartData(users);
  const resumeChartData = useResumeChartData(users);
  const totalOptimizes = useMemo(() => users.reduce((s, u) => s + (u.optimizeCount ?? 0), 0), [users]);
  const totalResumes = useMemo(() => users.reduce((s, u) => s + (u.resumeCount ?? 0), 0), [users]);
  const usersWhoUsedAi = useMemo(() => users.filter((u) => (u.optimizeCount ?? 0) > 0).length, [users]);

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    if (!userData.isAdmin) {
      setError("Access denied. Admin only.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/api/v1/user/get-all-users`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || "Failed to fetch users");
        }
        setUsers(json?.data ?? []);
      } catch (err) {
        setError(err.message || "Failed to load users");
        if (err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("admin")) {
          dispatch(clearUser());
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userData, navigate, dispatch]);

  if (!userData) return null;
  const layout = (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
        </div>
      ) : (
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
      )}
      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <AppHeader />
        <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-8xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 sm:px-4 py-2.5 text-sm font-medium text-white hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all w-full sm:w-auto"
          >
            <span className="text-indigo-400">←</span> Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-white px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="rounded-xl border border-violet-500/30 bg-linear-to-br from-violet-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Total Users</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{users.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Registered</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">AI Optimizes</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalOptimizes}</p>
                    <p className="text-xs text-slate-500 mt-1">{usersWhoUsedAi} users used AI</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Resumes Created</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalResumes}</p>
                    <p className="text-xs text-slate-500 mt-1">From your site</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Registrations</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{registrationsByDay.slice(-7).reduce((s, d) => s + d.count, 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Registrations over time */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden min-w-0">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50">
                  <h2 className="text-base sm:text-lg font-semibold text-white">Registrations Over Time</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">New user sign-ups (last 10 days)</p>
                </div>
                <div className="p-3 sm:p-5 overflow-x-auto">
                  <div className="flex items-end justify-between gap-0.5 sm:gap-1 min-h-[140px] min-w-[280px]">
                    {registrationsByDay.length ? (
                      registrationsByDay.map((d) => {
                        const max = Math.max(1, ...registrationsByDay.map((x) => x.count));
                        const barHeightPx = max > 0 ? Math.round((d.count / max) * 100) : 0;
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex justify-center items-end" style={{ height: "100px" }}>
                              <div
                                className="w-full max-w-[20px] rounded-t-md bg-linear-to-t from-violet-600 to-violet-400 transition-all hover:from-violet-500 hover:to-violet-300"
                                style={{ height: `${Math.max(barHeightPx, 4)}px` }}
                                title={`${d.label}: ${d.count}`}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 truncate max-w-full">{d.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-slate-500 text-sm">No registration data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Optimize usage */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden min-w-0">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50">
                  <h2 className="text-base sm:text-lg font-semibold text-white">AI Resume Optimize Usage</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Times each user used AI to optimize resume (top 10)</p>
                </div>
                <div className="p-3 sm:p-5">
                  {optimizeChartData.length ? (
                    <div className="space-y-3">
                      {optimizeChartData.map((u, i) => {
                        const max = Math.max(1, ...optimizeChartData.map((x) => x.count));
                        const w = (u.count / max) * 100;
                        return (
                          <div key={u.email + i} className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className="text-slate-300 text-xs sm:text-sm w-16 sm:w-24 min-w-0 truncate shrink-0" title={u.email}>{u.name}</span>
                            <div className="flex-1 min-w-0 h-5 sm:h-6 rounded-full bg-slate-700/50 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                                style={{ width: `${w}%`, minWidth: "8px" }}
                              />
                            </div>
                            <span className="text-cyan-400 font-medium text-xs sm:text-sm w-6 sm:w-8 text-right shrink-0">{u.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No AI optimize usage yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumes per user */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden mb-6 sm:mb-8 min-w-0">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50">
                <h2 className="text-base sm:text-lg font-semibold text-white">Resumes Created per User</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">How many times each user created/saved a resume (top 10)</p>
              </div>
              <div className="p-3 sm:p-5">
                {resumeChartData.length ? (
                  <div className="space-y-3">
                    {resumeChartData.map((u, i) => {
                      const max = Math.max(1, ...resumeChartData.map((x) => x.count));
                      const w = (u.count / max) * 100;
                      return (
                        <div key={u.email + i} className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <span className="text-slate-300 text-xs sm:text-sm w-16 sm:w-24 min-w-0 truncate shrink-0" title={u.email}>{u.name}</span>
                          <div className="flex-1 min-w-0 h-5 sm:h-6 rounded-full bg-slate-700/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-amber-600 to-amber-400 transition-all duration-500"
                              style={{ width: `${w}%`, minWidth: "8px" }}
                            />
                          </div>
                          <span className="text-amber-400 font-medium text-xs sm:text-sm w-6 sm:w-8 text-right shrink-0">{u.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No resume data yet</div>
                )}
              </div>
            </div>
          </>
        )}
        </main>
        <AppFooter />
      </div>
    </div>
  );

  if (!userData.isAdmin) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {size.width >= 768 ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
          </div>
        ) : (
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
        )}
        <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
        <div className="relative z-10 flex flex-col min-h-screen text-white">
          <AppHeader />
          <main className="flex-1 flex items-center justify-center px-3 sm:px-4">
            <div className="text-center max-w-md">
              <h1 className="text-xl sm:text-2xl font-bold text-amber-500">Access Denied</h1>
              <p className="mt-2 text-slate-400">This page is for administrators only.</p>
              <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all">
                <span className="text-indigo-400">←</span> Back to Dashboard
              </Link>
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    );
  }

  return layout;
}

export default AdminDashboard;
