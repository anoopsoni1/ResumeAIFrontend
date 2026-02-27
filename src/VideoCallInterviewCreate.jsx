import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { FiVideo } from "react-icons/fi";
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

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/api/v1/user/logout`, {}, { withCredentials: true, headers: getHeaders() });
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    } catch (e) {
      console.error(e);
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
      const actions = formEl?.querySelectorAll(".create-actions button, .create-actions a");
      if (title) gsap.from(title, { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" });
      if (back) gsap.from(back, { opacity: 0, duration: 0.35, delay: 0.05 });
      if (formEl) gsap.from(formEl, { y: 24, opacity: 0, duration: 0.5, delay: 0.1, ease: "power2.out" });
      if (fields?.length) gsap.fromTo(fields, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, delay: 0.25, ease: "power2.out" });
      if (actions?.length) gsap.from(actions, { y: 8, opacity: 0, duration: 0.35, delay: 0.5, stagger: 0.05, ease: "power2.out" });
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
        <AppHeader onLogout={handleLogout} />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-lg mx-auto">
            <h1 className="create-title text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <FiVideo className="w-7 h-7 text-indigo-400" />
              Create video interview
            </h1>
            <Link to="/dashboard/interviews" className="create-back text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-block">
              ← Back to interviews
            </Link>
            <form onSubmit={handleSubmit} className="create-form rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              {error && (
                <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <label className="create-field block">
                <span className="text-sm text-slate-400">Candidate email *</span>
                <input
                  type="email"
                  name="candidateEmail"
                  value={form.candidateEmail}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition"
                  required
                />
              </label>
              <label className="create-field block">
                <span className="text-sm text-slate-400">Role *</span>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition"
                  required
                />
              </label>
              <label className="create-field block">
                <span className="text-sm text-slate-400">Room ID (optional)</span>
                <input
                  type="text"
                  name="roomId"
                  value={form.roomId}
                  onChange={handleChange}
                  placeholder="e.g. room-abc-123"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition"
                />
              </label>
              <div className="create-actions flex gap-3 pt-2">
                <Link
                  to="/dashboard/interviews"
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold text-center hover:bg-white/15 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? "Creating…" : "Create interview"}
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
