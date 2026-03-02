import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sparkles, Save, Loader2, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { setEditedResumeText } from "./slice/Resume.slice";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { buildResumeTextFromDetail, parsedToDetailPayload } from "./utils/detailApi.js";
import { parseResume } from "./utils/parseResume.js";

const API_BASE = "http://localhost:5000/api/v1/user" ;

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

export default function EditResumePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.userData);

  const [text, setText] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [optimizedDetail, setOptimizedDetail] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const token = () => localStorage.getItem("accessToken");

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = token();
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
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

  useEffect(() => {
    if (authChecking) return;
    let cancelled = false;

    async function loadInitialText() {
      const fromState = location.state?.extractedText;
      if (typeof fromState === "string" && fromState.trim()) {
        if (!cancelled) setText(fromState.trim());
        if (!cancelled) setInitialLoadDone(true);
        return;
      }
      const accessToken = token();
      if (!accessToken) {
        const local = localStorage.getItem("extractedtext") || localStorage.getItem("EditedResumeText") || "";
        if (!cancelled) setText(local);
        if (!cancelled) setInitialLoadDone(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/get-detail`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data) {
          const detail = json.data;
          if (!cancelled) setDetailId(detail._id);
          const built = buildResumeTextFromDetail(detail);
          if (built.trim()) {
            if (!cancelled) setText(built);
          } else {
            const local = localStorage.getItem("extractedtext") || localStorage.getItem("EditedResumeText") || "";
            if (!cancelled) setText(local);
          }
        } else {
          const fallbackRes = await fetch(`${API_BASE}/get-edited-resume`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const fallback = await fallbackRes.json().catch(() => ({}));
          if (fallbackRes.ok && typeof fallback?.data?.text === "string" && fallback.data.text.trim()) {
            if (!cancelled) setText(fallback.data.text);
          } else {
            const local = localStorage.getItem("extractedtext") || localStorage.getItem("EditedResumeText") || "";
            if (!cancelled) setText(local);
          }
        }
      } catch (_) {
        const local = localStorage.getItem("extractedtext") || localStorage.getItem("EditedResumeText") || "";
        if (!cancelled) setText(local);
      }
      if (!cancelled) setInitialLoadDone(true);
    }

    loadInitialText();
    return () => { cancelled = true; };
  }, [authChecking, location.state?.extractedText]);

  const handleAiImprove = async () => {
    const toImprove = text.trim() || localStorage.getItem("extractedtext") || "";
    if (!toImprove) {
      setError("Add or paste resume text first.");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/aiedit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: JSON.stringify({ resumeText: toImprove }),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(data?.message || "AI edit failed");
      const responseData = data?.data || {};
      const optimized = responseData.optimizedDetail || null;
      const edited = responseData.editedText || (optimized ? buildResumeTextFromDetail(optimized) : "");
      setOptimizedDetail(optimized);
      setText(edited);
      localStorage.setItem("EditedResumeText", edited);
      dispatch(setEditedResumeText({ ...data, data: { ...responseData, editedText: edited } }));
    } catch (err) {
      setError(err?.message || "AI improvement failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    const toSave = text.trim();
    if (!toSave && !optimizedDetail) {
      setError("Nothing to save. Add or paste resume text, or run Improve with AI first.");
      return;
    }
    if (!token()) {
      setError("Sign in to save to your account.");
      return;
    }
    setSaveLoading(true);
    setError("");
    setSaveSuccess(false);
    try {
      let payload = null;
      if (optimizedDetail) {
        payload = {
          name: optimizedDetail.name ?? "Your Name",
          role: optimizedDetail.role ?? "Your Role",
          summary: optimizedDetail.summary ?? "",
          skills: Array.isArray(optimizedDetail.skills) ? optimizedDetail.skills : [],
          experience: Array.isArray(optimizedDetail.experience) ? optimizedDetail.experience : [],
          projects: Array.isArray(optimizedDetail.projects) ? optimizedDetail.projects : [],
          education: optimizedDetail.education ?? "",
          languageProficiency: optimizedDetail.languageProficiency ?? "",
          email: optimizedDetail.email ?? "",
          phone: optimizedDetail.phone ?? "",
        };
      } else {
        const parsed = parseResume(toSave);
        payload = parsedToDetailPayload(parsed);
      }
      if (!payload) {
        setError("Could not parse resume text.");
        setSaveLoading(false);
        return;
      }
      const url = detailId
        ? `${API_BASE}/update-detail/${detailId}`
        : `${API_BASE}/create-detail`;
      const method = detailId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(data?.message || "Save failed");
      if (data?.data?._id) setDetailId(data.data._id);
      setSaveSuccess(true);
      localStorage.setItem("EditedResumeText", toSave);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE.replace("/api/v1/user", "")}/api/v1/user/logout`, {}, { withCredentials: true });
      dispatch(clearUser());
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <p className="text-zinc-400">Checking session…</p>
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
          <Particles particleColors={["#ffffff"]} particleCount={200} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover alphaParticles={false} disableRotation={false} pixelRatio={1} />
        </div>
      )}
      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <header className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-400/20 px-4 py-2 text-indigo-300 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Upload flow
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Edit your resume
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
                Edit the extracted text below, improve it with AI, and save. This text will be used for your resume and portfolio.
              </p>
            </header>

            <div className="rounded-xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm p-4 sm:p-6">
              <label className="block font-medium text-zinc-300 text-sm mb-2">Resume text (editable)</label>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setOptimizedDetail(null);
                }}
                placeholder="Paste or type your resume, or upload a file first to see extracted text here."
                className="w-full h-64 sm:h-80 resize-y rounded-lg border border-white/20 bg-white/5 p-4 text-sm text-slate-200 placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                disabled={!initialLoadDone}
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAiImprove}
                  disabled={aiLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiLoading ? "Improving…" : "Improve with AI"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading || (!text.trim() && !optimizedDetail)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saveLoading ? "Saving…" : "Save to account"}
                </button>
                {saveSuccess && (
                  <span className="inline-flex items-center text-emerald-400 text-sm font-medium">Saved</span>
                )}
              </div>

              {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
              <Link
                to="/templates/resumedesign"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Choose resume design <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/templates/portfoliodesign"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10"
              >
                Choose portfolio design <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <nav className="mt-8 flex justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Back to upload
              </Link>
            </nav>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
