import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { FiVideo, FiPlus, FiCalendar, FiUser } from "react-icons/fi";
import gsap from "gsap";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

import { API_BASE } from "./config.js";

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
        const res = await fetch(`${API_BASE}/profile`, {
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
        const res = await fetch(`${API_BASE}/interviews`, {
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
      if (interviews.length > 0 && listRef.current) {
        const cards = listRef.current.querySelectorAll(".interview-card");
        gsap.fromTo(cards, { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out", delay: 0.15 });
      }
    });
    return () => ctx.revert();
  }, [loading, interviews.length]);

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
      <div className="absolute inset-0 z-1 bg-black/40" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 py-6 sm:py-8 px-3 sm:px-4">
          <div className="max-w-8xl mx-auto w-full">
            <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FiVideo className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
                <span className="wrap-break-word">Video Call Interviews</span>
              </h1>
              <Link
                to="/dashboard/interviews/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98] shrink-0 w-full sm:w-auto"
              >
                <FiPlus className="w-5 h-5" />
                New interview
              </Link>
            </div>
            <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 sm:px-4 py-2.5 text-sm font-medium text-white hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all w-fit">
              <span className="text-indigo-400">←</span> Back to Dashboard
            </Link>
            {loading ? (
              <p className="text-slate-400">Loading interviews…</p>
            ) : interviews.length === 0 ? (
              <div ref={emptyRef} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center">
                <FiVideo className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm sm:text-base">No interviews yet.</p>
                <Link to="/dashboard/interviews/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
                  Create your first interview →
                </Link>
              </div>
            ) : (
              <ul ref={listRef} className="space-y-4">
                {interviews.map((iv) => (
                  <li key={iv._id}>
                    <div className="interview-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/10">
                      <Link to={`/dashboard/interviews/${iv._id}`} className="flex-1 min-w-0 order-2 sm:order-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-semibold text-white text-sm sm:text-base wrap-break-word">{iv.role || "Interview"}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusColor(iv.status)}`}>
                            {iv.status || "new"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400">
                          <span className="flex items-center gap-1 min-w-0">
                            <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{formatDate(iv.createdAt || iv.scheduledAt)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            Recruiter: ResumeAI
                          </span>
                          {(iv.candidateId && (iv.candidateId.FirstName || iv.candidateId.email)) && (
                            <span className="flex items-center gap-1 min-w-0">
                              <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">User: {iv.candidateId.FirstName} {iv.candidateId.LastName}
                              {iv.candidateId.email && ` (${iv.candidateId.email})`}</span>
                            </span>
                          )}
                        </div>
                      </Link>
                      {!iv.endedAt && (
                        <Link
                          to={`/dashboard/interviews/${iv._id}/ai-call`}
                          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap w-full sm:w-auto order-1 sm:order-2"
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
