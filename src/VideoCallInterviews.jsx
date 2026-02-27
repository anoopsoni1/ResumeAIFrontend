import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { FiVideo, FiPlus, FiCalendar, FiUser } from "react-icons/fi";
import gsap from "gsap";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = import.meta.env.VITE_API_URL
  || (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://resumeaibackend-oqcl.onrender.com");

function VideoCallInterviews() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [authChecking, setAuthChecking] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const listRef = useRef(null);
  const emptyRef = useRef(null);

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
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!user) {
      setInterviews([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchInterviews() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/interviews`, {
          credentials: "include",
          headers: getHeaders(),
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && Array.isArray(json?.data)) setInterviews(json.data);
        else setInterviews([]);
      } catch {
        if (!cancelled) setInterviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInterviews();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: 24, opacity: 0, duration: 0.5, ease: "power2.out" });
      if (interviews.length > 0 && listRef.current) {
        const cards = listRef.current.querySelectorAll(".interview-card");
        gsap.fromTo(cards, { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out", delay: 0.15 });
      }
      if (interviews.length === 0 && emptyRef.current) {
        gsap.from(emptyRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
      }
    });
    return () => ctx.revert();
  }, [loading, interviews.length]);

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

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  };

  const statusColor = (s) => {
    if (s === "completed") return "text-emerald-400 bg-emerald-500/20";
    if (s === "processing") return "text-amber-400 bg-amber-500/20";
    if (s === "in_progress" || s === "started") return "text-blue-400 bg-blue-500/20";
    return "text-slate-400 bg-slate-500/20";
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Checking session…</p>
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
      <div className="absolute inset-0 z-1 bg-black/40" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader onLogout={handleLogout} />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiVideo className="w-7 h-7 text-indigo-400" />
                Video Call Interviews
              </h1>
              <Link
                to="/dashboard/interviews/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiPlus className="w-5 h-5" />
                New interview
              </Link>
            </div>
            <Link to="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            {loading ? (
              <p className="text-slate-400">Loading interviews…</p>
            ) : interviews.length === 0 ? (
              <div ref={emptyRef} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <FiVideo className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No interviews yet.</p>
                <Link to="/dashboard/interviews/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
                  Create your first interview →
                </Link>
              </div>
            ) : (
              <ul ref={listRef} className="space-y-4">
                {interviews.map((iv) => (
                  <li key={iv._id}>
                    <div className="interview-card rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/10">
                      <Link to={`/dashboard/interviews/${iv._id}`} className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-white">{iv.role || "Interview"}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(iv.status)}`}>
                            {iv.status || "new"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(iv.createdAt || iv.scheduledAt)}
                          </span>
                          {iv.recruiterId && (
                            <span className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              {iv.recruiterId.FirstName} {iv.recruiterId.LastName}
                            </span>
                          )}
                        </div>
                      </Link>
                      {!iv.endedAt && (
                        <Link
                          to={`/dashboard/interviews/${iv._id}/ai-call`}
                          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition hover:scale-105 active:scale-95"
                        >
                          AI Interview
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default VideoCallInterviews;
