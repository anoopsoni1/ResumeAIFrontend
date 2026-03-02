import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, FileText, Briefcase, Target, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function getScoreTier(score) {
  if (score >= 80) return { label: "Excellent", color: "emerald", bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400/50" };
  if (score >= 60) return { label: "Good", color: "lime", bg: "bg-lime-500/20", text: "text-lime-400", ring: "ring-lime-400/50" };
  if (score >= 40) return { label: "Fair", color: "amber", bg: "bg-amber-500/20", text: "text-amber-400", ring: "ring-amber-400/50" };
  return { label: "Needs work", color: "rose", bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400/50" };
}

function getScoreGradient(score) {
  if (score >= 80) return "from-emerald-400 to-teal-400";
  if (score >= 60) return "from-lime-400 to-emerald-400";
  if (score >= 40) return "from-amber-400 to-orange-400";
  return "from-rose-400 to-amber-400";
}

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <AppHeader onLogout={handleLogout} />;
}

function AtsChecker() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resumeTextFromRedux = useSelector((state) => state.resume.resumeText);

  const [resumeText, setResumeText] = useState(
    localStorage.getItem("extractedtext") || resumeTextFromRedux || ""
  );
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    setResumeText(localStorage.getItem("extractedtext") || resumeTextFromRedux || "");
  }, [resumeTextFromRedux]);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth: validate session, redirect if 401
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
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  const handleCheckATS = async () => {
    if (!resumeText || !jobDescription) {
      setError("Resume text and job description are required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const res = await fetch(`${API_BASE}/api/v1/user/atscheck`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();

      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to calculate ATS score");

      const resultData = data.data || data;
      setResult(resultData);

      // Save or update ATS score in backend (upsert: create on first time, update on retry)
      const score = resultData?.score;
      if (typeof score === "number") {
        const saveRes = await fetch(`${API_BASE}/api/v1/user/create-atsscore`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ score }),
        });
        if (!saveRes.ok) {
          const saveJson = await saveRes.json().catch(() => ({}));
          console.warn("ATS score save failed:", saveJson?.message || saveRes.status);
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to calculate ATS score");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm shadow-xl p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
          </div>
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-400">Verifying authentication.</p>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
          <div className="mx-auto ">
            {/* Hero */}
            <header className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-4 py-2 text-amber-300 text-sm font-medium mb-5 shadow-lg shadow-amber-500/10">
                <TrendingUp className="h-4 w-4" /> ATS analysis
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                ATS Resume{" "}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  Score Checker
                </span>
              </h1>
              <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Compare your resume with a job description. See matched and missing keywords and get a clear match score.
              </p>
            </header>

            {/* Input cards */}
            <div className="rounded-2xl border border-white/15 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30">
                      <FileText className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <label className="font-semibold text-white text-sm">Resume text</label>
                      <p className="text-xs text-slate-500">From your last upload</p>
                    </div>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text or use text from your upload"
                    className="min-h-[260px] w-full resize-y rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all overflow-y-auto leading-relaxed"
                    disabled
                  />
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Edit in Optimize with AI to change resume text.
                  </p>
                </div>

                <div className="flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                      <Briefcase className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <label className="font-semibold text-white text-sm">Job description</label>
                      <p className="text-xs text-slate-500">Paste the full posting</p>
                    </div>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here…"
                    className="min-h-[260px] w-full resize-y rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all overflow-y-auto leading-relaxed"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-center gap-3 text-rose-200 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                    <XCircle className="h-4 w-4" />
                  </div>
                  {error}
                </div>
              )}

              {/* Result: circular score + keywords */}
              {result && (
                <div className="mt-10 pt-10 border-t border-white/10">
                  <div className="flex flex-col items-center">
                    {/* Circular score gauge */}
                    <div className="relative">
                      <svg className="w-44 h-44 sm:w-52 sm:h-52 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="url(#atsScoreGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={339.292}
                          strokeDashoffset={339.292 - (339.292 * Math.min(100, result.score || 0)) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="atsScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={result.score >= 80 ? "#34d399" : result.score >= 60 ? "#a3e635" : result.score >= 40 ? "#fbbf24" : "#fb7185"} />
                            <stop offset="100%" stopColor={result.score >= 80 ? "#2dd4bf" : result.score >= 60 ? "#34d399" : result.score >= 40 ? "#f97316" : "#fbbf24"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl sm:text-4xl font-bold tabular-nums bg-gradient-to-br ${getScoreGradient(result.score)} bg-clip-text text-transparent`}>
                          {result.score}
                        </span>
                        <span className="text-slate-500 text-lg font-medium">%</span>
                        <span className={`mt-1 text-xs font-semibold uppercase tracking-wider ${getScoreTier(result.score).text}`}>
                          {getScoreTier(result.score).label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm font-medium">ATS match score</p>
                  </div>

                  {/* Keywords grid */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 shadow-lg shadow-emerald-500/5">
                      <h4 className="mb-3 flex items-center gap-2 font-semibold text-white text-sm">
                        <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                        Matched keywords
                        <span className="ml-auto rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                          {result.matchedKeywords?.length ?? 0}
                        </span>
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {(result.matchedKeywords && result.matchedKeywords.length > 0)
                          ? result.matchedKeywords.map((k, i) => (
                              <li key={i} className="rounded-lg bg-emerald-500/25 px-3 py-1.5 text-xs font-medium text-emerald-100 border border-emerald-400/20">
                                {k}
                              </li>
                            ))
                          : <li className="text-slate-500 text-sm">None found</li>}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-5 shadow-lg shadow-rose-500/5">
                      <h4 className="mb-3 flex items-center gap-2 font-semibold text-white text-sm">
                        <XCircle size={20} className="text-rose-400 shrink-0" />
                        Missing keywords
                        <span className="ml-auto rounded-full bg-rose-500/30 px-2.5 py-0.5 text-xs font-medium text-rose-200">
                          {result.missingKeywords?.length ?? 0}
                        </span>
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {(result.missingKeywords && result.missingKeywords.length > 0)
                          ? result.missingKeywords.map((k, i) => (
                              <li key={i} className="rounded-lg bg-rose-500/25 px-3 py-1.5 text-xs font-medium text-rose-100 border border-rose-400/20">
                                {k}
                              </li>
                            ))
                          : <li className="text-slate-500 text-sm">None — great match!</li>}
                      </ul>
                    </div>
                  </div>

                  {result.summary && (
                    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                      <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">{result.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={handleCheckATS}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 sm:px-8 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Target size={20} />
                      Check ATS Score
                    </>
                  )}
                </button>

                {resumeText.trim() ? (
                  <Link
                    to="/edit-resume"
                    state={{ extractedText: resumeText }}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-6 sm:px-8 font-semibold text-slate-200 transition hover:bg-indigo-600 hover:border-indigo-500 hover:text-white active:scale-[0.98] hover:shadow-lg hover:shadow-indigo-500/20"
                  >
                    <Sparkles size={20} />
                    Optimize with AI
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 sm:px-8 font-semibold text-slate-500 cursor-not-allowed"
                  >
                    <Sparkles size={20} />
                    Optimize with AI
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

export default AtsChecker;
