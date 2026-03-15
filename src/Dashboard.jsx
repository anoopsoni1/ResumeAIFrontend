import React, { useState, useEffect } from "react";
import { FiGlobe, FiZap, FiTarget, FiUsers, FiVideo, FiTrash2, FiMap, FiCode, FiAward, FiLock } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUser, setUser } from "./slice/user.slice";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useToast } from "./context/ToastContext";

import { API_BASE } from "./config.js";

function Topbar() {
  return <AppHeader />;
}

function StatCards({ atsScore, optimizeCount, user }) {
  const hasAts = atsScore != null && typeof atsScore === "number";
  const atsDisplay = hasAts ? `${atsScore}%` : "—";
  const optimizeDisplay = optimizeCount != null && typeof optimizeCount === "number" ? String(optimizeCount) : "—";
  const atsColor = hasAts
    ? atsScore >= 70
      ? "text-emerald-400"
      : atsScore >= 50
        ? "text-amber-400"
        : "text-rose-400"
    : "text-slate-400";

  const stats = [
    {
      icon: <FiTarget className="w-5 h-5" />,
      label: "ATS Score",
      value: atsDisplay,
      sub: hasAts ? "Last check" : "Check your score",
      link: "/atsscore",
      valueClass: atsColor,
    },
    {
      icon: <AiOutlineFileText className="w-5 h-5" />,
      label: "Resume Status",
      value: "Optimized",
      sub: "Ready for applications",
      link: "/templates/resumedesign",
      valueClass: "text-emerald-400",
    },
    {
      icon: <FiZap className="w-5 h-5" />,
      label: "AI Optimizes",
      value: optimizeDisplay,
      sub: optimizeDisplay !== "—" ? "Times used" : "Not used yet",
      link: "/edit-resume",
      valueClass: "text-white",
    },
  ];

  const actions = [
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Check ATS Score",
      desc: "Analyze your resume and get an ATS score with keyword insights.",
      link: "/atsscore",
    },
    {
      icon: <AiOutlineFileText className="w-6 h-6" />,
      title: "Upload & edit resume",
      desc: "Upload a PDF/DOCX, then edit and improve with AI.",
      link: "/upload",
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Add details for resume or project",
      desc: "Build your resume or project by filling in your details.",
      link: "/add-details",
    },
    {
      icon: <MdAutoAwesome className="w-6 h-6" />,
      title: "Edit or optimize resume",
      desc: "Edit your saved text and improve with AI.",
      link: "/edit-resume",
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: "Choose project design",
      desc: user?.Premium ? "Pick a template and view your project." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/templates/portfoliodesign" : "/price",
      premiumOnly: true,
    },
    {
      icon: <FiMap className="w-6 h-6" />,
      title: "AI Career Roadmap",
      desc: user?.Premium ? "Get a personalized learning roadmap for your career goal." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/career-roadmap" : "/price",
      premiumOnly: true,
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "Coding Interview",
      desc: user?.Premium ? "Solve coding questions with live editor and AI feedback." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/coding-interview/start" : "/price",
      premiumOnly: true,
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Leaderboard",
      desc: user?.Premium ? "Top coders by interview score." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/leaderboard" : "/price",
      premiumOnly: true,
    },
  ];

  return (
    <div className="mt-6 sm:mt-8 px-3 sm:px-4 max-w-8xl mx-auto w-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">
        Your stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((item, i) => {
          const Card = item.link ? Link : "div";
          const cardProps = item.link ? { to: item.link } : {};
          return (
            <Card
              key={i}
              {...cardProps}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-amber-500/50 hover:bg-white/8 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-400 group-hover:border-amber-500/30 group-hover:text-amber-400/90 transition-colors">
                  {item.icon}
                </div>
                {item.link && (
                  <span className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${item.valueClass}`}>
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
            </Card>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-8 sm:mt-10 mb-4 px-1">
        Quick actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((item, i) => (
          <Link
            key={i}
            to={item.link}
            className="group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 hover:border-amber-500/50 hover:bg-white/8 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 relative"
          >
            {item.premiumOnly && !user?.Premium && (
              <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-semibold text-amber-400">
                <FiLock className="w-3.5 h-3.5" />
                Premium
              </span>
            )}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-400 group-hover:border-amber-500/30 group-hover:text-amber-400/90 transition-colors">
              {item.premiumOnly && !user?.Premium ? <FiLock className="w-6 h-6" /> : item.icon}
            </div>
            <h4 className="mt-4 text-base font-semibold text-white group-hover:text-amber-50/90 transition-colors">
              {item.title}
            </h4>
            <p className="mt-2 text-sm text-slate-400 leading-snug">
              {item.desc}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 group-hover:text-amber-400 group-hover:gap-2.5 transition-all">
              {item.premiumOnly && !user?.Premium ? "Upgrade to unlock" : "Get Started"}
              <span className="text-lg leading-none">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [authChecking, setAuthChecking] = useState(true);
  const [atsScore, setAtsScore] = useState(null);
  const [optimizeCount, setOptimizeCount] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication + authorization: validate session with protected endpoint.
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            dispatch(clearUser());
            if (!cancelled) navigate("/login");
          }
          return;
        }

        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  // Fetch ATS score for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setAtsScore(null);
      return;
    }
    let cancelled = false;
    async function fetchAtsScore() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-atsscore`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null) {
          const score = json.data?.score;
          setAtsScore(typeof score === "number" ? score : null);
        } else {
          setAtsScore(null);
        }
      } catch {
        if (!cancelled) setAtsScore(null);
      }
    }
    fetchAtsScore();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch optimize count for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setOptimizeCount(null);
      return;
    }
    let cancelled = false;
    async function fetchOptimize() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-optimize`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null && typeof json.data.number === "number") {
          setOptimizeCount(json.data.number);
        } else {
          setOptimizeCount(null);
        }
      } catch {
        if (!cancelled) setOptimizeCount(null);
      }
    }
    fetchOptimize();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch deployments (portfolio URLs) for dashboard
  useEffect(() => {
    if (!user) {
      setDeployments([]);
      return;
    }
    let cancelled = false;
    async function fetchDeployments() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-deployments`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const list = json?.data;
        if (res.ok && Array.isArray(list)) {
          setDeployments(list);
        } else {
          setDeployments([]);
        }
      } catch {
        if (!cancelled) setDeployments([]);
      }
    }
    fetchDeployments();
    return () => { cancelled = true; };
  }, [user]);

  const latestDeployment = deployments.length > 0 ? deployments[0] : null;
  const formatDeployDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDeleteDeployment = async (dep) => {
    if (!dep._id) return;
    if (!window.confirm("Remove this project from the list and delete it from Vercel? This cannot be undone.")) return;
    const accessToken = localStorage.getItem("accessToken");
    setDeletingId(dep._id);
    try {
      const res = await fetch(`${API_BASE}/delete-deployment/${dep._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDeployments((prev) => prev.filter((d) => d._id !== dep._id));
        toast.success("Project deleted and removed from Vercel.");
      } else {
        toast.error(data?.message || "Failed to delete project.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-300">
            Verifying authentication with the server.
          </p>
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
        <Topbar />
        {user ? (
          <main className="flex-1 py-6 sm:py-8 pb-10 sm:pb-12">
            <div className="mx-auto px-3 sm:px-4 max-w-8xl w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Welcome back,{" "}
                  <span className="text-amber-400">
                    {user?.FirstName} {user?.LastName}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-slate-400 max-w-xl">
                  Your resume is performing well. Here are your latest stats and quick actions.
                </p>
              </div>

              {user?.Premium ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-emerald-500/60 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">
                        Premium active
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        You have access to all premium features.
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-amber-500/60 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-400">
                        Premium not active
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Upgrade to unlock premium templates, AI optimizations, and more.
                      </p>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
                      <Link
                        to="/price"
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                      >
                        Upgrade
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Up page link - only for admins (extra tools) */}
              {user?.isAdmin && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Extra tools</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Templates and more.
                      </p>
                    </div>
                    <Link
                      to="/up"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                    >
                      Open Up page →
                    </Link>
                  </div>
                </div>
              )}

              {/* Video call interviews - premium only */}
              {user?.Premium ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 hover:border-amber-500/30 transition-colors">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-400">
                        <FiVideo className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">
                          Video call interviews
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Schedule and view interview recordings and AI reports.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard/interviews"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto shrink-0"
                    >
                      Open interviews →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-amber-500/60 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-400/80">
                        <FiVideo className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-400">
                          Video call interviews
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Unlock AI-powered video interviews and reports with Premium.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/price"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                    >
                      Upgrade to unlock →
                    </Link>
                  </div>
                </div>
              )}

              {/* Deployed project URLs from database – same card style as Admin */}
              {user?.Premium ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-emerald-500/60 p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-400">
                          <FiGlobe className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-emerald-400">
                            Live projects
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            {deployments.length > 0
                              ? `${deployments.length} deployment${deployments.length === 1 ? "" : "s"} · Your live links`
                              : "Deploy from a project template to get a live link."}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/templates/portfoliodesign"
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shrink-0"
                      >
                        {deployments.length > 0 ? "Deploy another" : "Deploy project"}
                      </Link>
                    </div>
                    {deployments.length > 0 ? (
                      <ul className="space-y-3 border-t border-white/10 pt-4 mt-1">
                        {deployments.map((dep, index) => (
                          <li
                            key={dep._id || dep.portfolioUrl || index}
                            className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-4"
                          >
                            <div className="min-w-0 flex-1 flex items-start sm:items-center gap-3">
                              <span className="mt-1.5 sm:mt-0 shrink-0 w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden />
                              <div className="min-w-0 flex-1">
                                <a
                                  href={dep.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300 break-all transition-colors duration-150"
                                  title={dep.portfolioUrl}
                                >
                                  {dep.portfolioUrl}
                                </a>
                                {dep.deployedAt && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    Deployed {formatDeployDate(dep.deployedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 pl-5 sm:pl-0">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(dep.portfolioUrl).then(() => {
                                    setCopiedUrl(dep.portfolioUrl);
                                    setTimeout(() => setCopiedUrl(null), 2000);
                                  });
                                }}
                                className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 min-w-16 ${
                                  copiedUrl === dep.portfolioUrl
                                    ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
                                    : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30"
                                }`}
                                title="Copy URL"
                              >
                                {copiedUrl === dep.portfolioUrl ? "Copied" : "Copy"}
                              </button>
                              <a
                                href={dep.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/70 transition-all duration-200"
                              >
                                Open →
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDeployment(dep)}
                                disabled={deletingId === dep._id}
                                className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/60 disabled:opacity-50 transition-all duration-200"
                                title="Delete project and remove from Vercel"
                              >
                                {deletingId === dep._id ? "…" : <FiTrash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Admin-only: All Users */}
              {user?.isAdmin && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-indigo-500/60 p-4 sm:p-5">
                  <p className="text-sm font-semibold text-indigo-400">Admin</p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 mb-4">
                    Manage users.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/admin-dashboard"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <FiUsers className="w-4 h-4" />
                      All Users
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <StatCards atsScore={atsScore} optimizeCount={optimizeCount} user={user} />
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 text-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Welcome to Intervexa Dashboard
              </h1>
              <p className="mt-4 text-sm sm:text-lg text-amber-500">
                Please log in to access your dashboard.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
        <AppFooter />
      </div>
    </div>
  );
}
