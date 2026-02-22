import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Download, Loader2 } from "lucide-react";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { setEditedResumeText } from "./slice/Resume.slice";
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

function AiResumeEditor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const originalText = localStorage.getItem("extractedtext") || "";

  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth: validate session with profile endpoint, redirect if 401
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

  const handleAiEdit = async () => {
    if (!originalText) {
      setError("No resume text found. Please upload a resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const res = await fetch(`${API_BASE}/api/v1/user/aiedit`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ resumeText: originalText }),
      });

      const data = await res.json();

      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "AI edit failed");

      setEditedText(data.data?.editedText || "");
      localStorage.setItem("EditedResumeText", data.data?.editedText || "");
          dispatch(setEditedResumeText(data));
    } catch (err) {
      setError(err?.message || "AI editing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const textToExport = editedText || originalText;
    if (!textToExport) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const res = await fetch(`${API_BASE}/api/v1/user/docx`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ resumeText: textToExport }),
      });

      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AI_Resume.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || "Download failed");
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
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  AI Resume <span className="text-amber-500">Editor</span>
                </h1>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">
                  Improve your resume with AI and download as DOCX
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm">Extracted Resume</h3>
                  <textarea
                    readOnly
                    value={originalText}
                    className="w-full h-72 md:h-80 resize-none rounded-xl border border-slate-500/50 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    placeholder="Upload a resume to see extracted text"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm">AI Improved Resume</h3>
                  <textarea
                    readOnly
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    placeholder="Click 'Improve with AI' to generate"
                    className="w-full h-72 md:h-80 resize-none rounded-xl border border-slate-500/50 bg-white/5 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleAiEdit}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Improve with AI
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!editedText && !originalText}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} />
                  Download Resume
                </button>
              </div>

              {error && (
                <p className="text-center mt-4 text-red-400 text-sm font-medium">{error}</p>
              )}
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

export default AiResumeEditor;
