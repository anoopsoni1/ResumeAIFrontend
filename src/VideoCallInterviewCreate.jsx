import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { FiVideo, FiArrowLeft, FiMail, FiUser, FiHash, FiX, FiCheck } from "react-icons/fi";
import gsap from "gsap";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com"

function VideoCallInterviewCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [authChecking, setAuthChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    candidateEmail: "",
    role: "",
    roomId: "",
  });
  const createPageRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getHeaders = () => {
    const t = localStorage.getItem("accessToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
          credentials: "include",
          headers: getHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || res.status === 401) {
          dispatch(clearUser());
          navigate("/login");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.candidateEmail?.trim()) {
      setError("Candidate email is required.");
      return;
    }
    if (!form.role?.trim()) {
      setError("Role is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/interviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({
          candidateEmail: form.candidateEmail.trim(),
          role: form.role.trim(),
          roomId: form.roomId?.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || data?.error || "Failed to create interview.");
        return;
      }
      const newId = data?.data?._id;
      if (newId) navigate(`/dashboard/interviews/${newId}`);
      else navigate("/dashboard/interviews");
    } catch (err) {
      setError(err?.message || "Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (authChecking || !createPageRef.current) return;
    const el = createPageRef.current;
    const ctx = gsap.context(() => {
      const title = el.querySelector(".create-title");
      const back = el.querySelector(".create-back");
      const formEl = el.querySelector(".create-form");
      const fields = formEl?.querySelectorAll(".create-field");
      if (title) gsap.from(title, { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" });
      if (back) gsap.from(back, { opacity: 0, duration: 0.35, delay: 0.05 });
      if (formEl) gsap.from(formEl, { y: 24, opacity: 0, duration: 0.5, delay: 0.1, ease: "power2.out" });
      if (fields?.length) gsap.fromTo(fields, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, delay: 0.25, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [authChecking]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Checking session…</p>
      </div>
    );
  }

  return (
    <div ref={createPageRef} className="relative min-h-screen overflow-hidden bg-black">
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
      <div className="absolute inset-0 z-1 bg-black/40" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-xl mx-auto">
            <Link
              to="/dashboard/interviews"
              className="create-back inline-flex items-center gap-2 text-xs sm:text-sm mb-3 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-indigo-200 hover:bg-indigo-500/20 hover:text-white hover:border-indigo-400/80 transition shadow-sm hover:shadow-indigo-500/20"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to interviews</span>
            </Link>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-400/30 px-3 py-1 text-[11px] sm:text-xs font-medium text-indigo-200 mb-3">
                <FiVideo className="w-3.5 h-3.5" />
                <span>AI-powered video interview</span>
              </div>
              <h1 className="create-title text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 mb-1">
                <span className="bg-linear-to-r from-indigo-300 via-sky-300 to-purple-300 bg-clip-text text-transparent">
                  Create video interview
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                Invite a candidate to a dedicated interview room. We&apos;ll record the call and let AI evaluate their performance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="create-form rounded-2xl border border-indigo-500/30 bg-black/60 backdrop-blur-xl p-6 sm:p-7 space-y-4 shadow-xl shadow-indigo-500/20">
              {error && (
                <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <label className="create-field block">
                <span className="text-sm text-slate-300 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-500" />
                  Candidate email <span className="text-rose-400">*</span>
                </span>
                <input
                  type="email"
                  name="candidateEmail"
                  value={form.candidateEmail}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5/5 bg-white/5 border border-white/15 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-400/90 focus:ring-2 focus:ring-indigo-500/40 transition"
                  required
                />
              </label>
              <label className="create-field block">
                <span className="text-sm text-slate-300 flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5 text-slate-500" />
                  Role <span className="text-rose-400">*</span>
                </span>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-400/90 focus:ring-2 focus:ring-indigo-500/40 transition"
                  required
                />
              </label>
              <label className="create-field block">
                <span className="text-sm text-slate-300 flex items-center gap-1.5">
                  <FiHash className="w-3.5 h-3.5 text-slate-500" />
                  Room ID <span className="text-slate-500 text-xs">(optional)</span>
                </span>
                <input
                  type="text"
                  name="roomId"
                  value={form.roomId}
                  onChange={handleChange}
                  placeholder="e.g. room-abc-123"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-400/90 focus:ring-2 focus:ring-indigo-500/40 transition"
                />
              </label>
              <div className="create-actions flex flex-wrap gap-3 pt-4 mt-2 border-t border-white/10">
                <Link
                  to="/dashboard/interviews"
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-slate-200 font-semibold text-center hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>Create interview</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default VideoCallInterviewCreate;
