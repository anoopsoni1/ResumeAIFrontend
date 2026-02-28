import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, FileText, Briefcase, Target, Sparkles } from "lucide-react";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-300">Verifying authentication.</p>
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

        <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm shadow-xl shadow-black/20 p-6 sm:p-8">
              <header className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/25 px-4 py-2 text-amber-300 text-sm font-medium mb-4">
                  <Target className="h-4 w-4" /> ATS analysis
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                  ATS Resume <span className="text-amber-400">Score Checker</span>
                </h1>
                <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                  Compare your resume with a job description and see matched and missing keywords.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="mb-2 flex items-center gap-2 font-medium text-slate-300 text-sm">
                    <FileText className="h-4 w-4 text-amber-400/80" />
                    Resume Text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here or use text from your upload"
                    className="min-h-[280px] w-full resize-y rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 overflow-y-auto leading-relaxed"
                    disabled
                  />
                  <p className="mt-1.5 text-xs text-slate-500">From your last upload. Edit in Optimize with AI.</p>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 flex items-center gap-2 font-medium text-slate-300 text-sm">
                    <Briefcase className="h-4 w-4 text-amber-400/80" />
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here"
                    className="min-h-[280px] w-full resize-y rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 overflow-y-auto leading-relaxed"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-2 text-red-300 text-sm">
                  <XCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {result && (
                <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
                  <div className="flex flex-col items-center mb-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">ATS Match Score</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-bold text-emerald-400 tabular-nums">{result.score}</span>
                      <span className="text-2xl text-slate-500">%</span>
                    </div>
                    <div className="mt-3 h-2 w-48 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, result.score || 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-200 text-sm">
                        <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                        Matched Keywords
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {(result.matchedKeywords && result.matchedKeywords.length > 0)
                          ? result.matchedKeywords.map((k, i) => (
                              <li key={i} className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-200">
                                {k}
                              </li>
                            ))
                          : <li className="text-slate-500 text-sm">None</li>}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-200 text-sm">
                        <XCircle size={18} className="text-red-400 shrink-0" />
                        Missing Keywords
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {(result.missingKeywords && result.missingKeywords.length > 0)
                          ? result.missingKeywords.map((k, i) => (
                              <li key={i} className="rounded-md bg-red-500/20 px-2.5 py-1 text-xs text-red-200">
                                {k}
                              </li>
                            ))
                          : <li className="text-slate-500 text-sm">None</li>}
                      </ul>
                    </div>
                  </div>

                  {result.summary && (
                    <p className="mt-6 text-center text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">{result.summary}</p>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={handleCheckATS}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 sm:px-8 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/25 bg-white/5 px-6 sm:px-8 font-semibold text-slate-200 transition hover:bg-indigo-600 hover:border-indigo-500 hover:text-white active:scale-[0.98]"
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
