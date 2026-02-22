import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
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

      setResult(data.data);
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
      {/* Background — same as Dashboard */}
      {size.width >= 768 ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LiquidEther
            colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
            mouseForce={50}
            cursorSize={100}
            isViscous
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            color0="#5227FF"
            color1="#FF9FFC"
            color2="#B19EEF"
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
          <FloatingLines
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={5}
            lineDistance={10}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            mixBlendMode="screen"
            topWavePosition={0}
            middleWavePosition={0}
            bottomWavePosition={-2}
            animationSpeed={2}
            mouseDamping={0.05}
          />
        </div>
      )}

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 py-8 px-4">
          <div className="mx-auto ">
            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8">
              <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  ATS Resume <span className="text-amber-500">Score Checker</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-400">
                  Compare your resume with a job description
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2 font-semibold text-slate-300 text-sm">Resume Text</h3>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here"
                    className="h-72 w-full resize-none rounded-xl border border-slate-500/50 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                     disabled={true}
                    
                  />
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-slate-300 text-sm">Job Description</h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here"
                    className="h-72 w-full resize-none rounded-xl border border-slate-500/50 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center font-medium text-red-400 text-sm">{error}</p>
              )}

              {result && (
                <div className="mt-10 rounded-xl border border-slate-200/50 bg-black/40 p-6">
                  <div className="mb-6 text-center">
                    <p className="text-slate-400 text-sm">ATS Match Score</p>
                    <p className="text-5xl font-bold text-emerald-400">{result.score}%</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-300 text-sm">
                        <CheckCircle size={18} className="text-emerald-400" />
                        Matched Keywords
                      </h4>
                      <ul className="list-disc list-inside text-sm text-slate-400">
                        {(result.matchedKeywords && result.matchedKeywords.length > 0)
                          ? result.matchedKeywords.map((k, i) => <li key={i}>{k}</li>)
                          : <li>No data</li>}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-300 text-sm">
                        <XCircle size={18} className="text-red-400" />
                        Missing Keywords
                      </h4>
                      <ul className="list-disc list-inside text-sm text-slate-400">
                        {(result.missingKeywords && result.missingKeywords.length > 0)
                          ? result.missingKeywords.map((k, i) => <li key={i}>{k}</li>)
                          : <li>No data</li>}
                      </ul>
                    </div>
                  </div>

                  {result.summary && (
                    <p className="mt-6 text-center text-sm text-slate-400">{result.summary}</p>
                  )}
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleCheckATS}
                  disabled={loading}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Check ATS Score"
                  )}
                </button>

                {result ? (
                  <Link
                    to="/aiedit"
                    className="flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Optimize with AI
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex h-12 items-center justify-center rounded-xl bg-slate-600 px-8 font-semibold text-slate-400 cursor-not-allowed"
                  >
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
