import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiVideo, FiCalendar, FiUser, FiAward } from "react-icons/fi";
import gsap from "gsap";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = import.meta.env.VITE_API_URL
  || (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://resumeaibackend-oqcl.onrender.com");

function VideoCallInterviewDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [authChecking, setAuthChecking] = useState(true);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef(null);

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

  const fetchInterview = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
        credentials: "include",
        headers: getHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data) setInterview(json.data);
      else setInterview(null);
    } catch {
      setInterview(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id || authChecking) return;
    setLoading(true);
    fetchInterview();
  }, [id, authChecking, fetchInterview]);

  // When status is "processing", poll so evaluation appears when ready
  useEffect(() => {
    if (!id || !interview || interview.status !== "processing") return;
    const interval = setInterval(fetchInterview, 4000);
    return () => clearInterval(interval);
  }, [id, interview?.status, fetchInterview]);

  useEffect(() => {
    if (!interview || !mainRef.current) return;
    const ctx = gsap.context(() => {
      const sections = mainRef.current.querySelectorAll(".detail-section");
      gsap.fromTo(sections, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.45, ease: "power2.out" });
      const scoreBoxes = mainRef.current.querySelectorAll(".score-box");
      if (scoreBoxes.length) {
        gsap.fromTo(scoreBoxes, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.08, duration: 0.4, delay: 0.2, ease: "back.out(1.2)" });
      }
    }, mainRef);
    return () => ctx.revert();
  }, [interview?._id, interview?.status]);

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
    return new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
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

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">{loading ? "Loading…" : "Interview not found."}</p>
        <Link to="/dashboard/interviews" className="text-indigo-400 hover:text-indigo-300">Back to interviews</Link>
      </div>
    );
  }

  const rec = interview.recruiterId;
  const cand = interview.candidateId;
  const report = interview.aiReport;

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
          <div ref={mainRef} className="max-w-4xl mx-auto">
            <Link to="/dashboard/interviews" className="detail-section text-sm text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
              ← Back to interviews
            </Link>
            <div className="detail-section flex flex-wrap items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiVideo className="w-7 h-7 text-indigo-400" />
                {interview.role || "Interview"}
              </h1>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(interview.status)}`}>
                {interview.status || "new"}
              </span>
            </div>

            <div className="detail-section rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiCalendar className="w-4 h-4 text-slate-500" />
                  <span>Created: {formatDate(interview.createdAt || interview.scheduledAt)}</span>
                </div>
                {interview.startedAt && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>Started: {formatDate(interview.startedAt)}</span>
                  </div>
                )}
                {interview.endedAt && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>Ended: {formatDate(interview.endedAt)}</span>
                  </div>
                )}
                {rec && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiUser className="w-4 h-4 text-slate-500" />
                    <span>Recruiter: {rec.FirstName} {rec.LastName} ({rec.email})</span>
                  </div>
                )}
                {cand && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiUser className="w-4 h-4 text-slate-500" />
                    <span>Candidate: {cand.FirstName} {cand.LastName} ({cand.email})</span>
                  </div>
                )}
                {interview.roomId && (
                  <div className="text-slate-400">Room: {interview.roomId}</div>
                )}
              </dl>
              {!interview.endedAt && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    to={`/dashboard/interviews/${interview._id}/ai-call`}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FiVideo className="w-5 h-5" />
                    Start AI Interview (15 min)
                  </Link>
                </div>
              )}
            </div>

            {interview.status === "processing" && (
              <div className="detail-section rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 mb-6">
                <p className="text-amber-200 font-medium">Generating your evaluation…</p>
                <p className="text-slate-400 text-sm mt-1">Scores and feedback will appear here in a moment. This page updates automatically.</p>
              </div>
            )}

            {["ended", "completed"].includes(interview.status) && !interview.recordingUrl && !report && (
              <div className="detail-section rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
                <p className="text-amber-200 font-medium">Recording or evaluation not available</p>
                <p className="text-slate-400 text-sm mt-1">
                  The recording was not saved or the upload failed. Try ending the interview after speaking for at least a few seconds, and ensure your connection is stable. You can start another AI interview from this page.
                </p>
              </div>
            )}

            {report && (report.technicalScore != null || report.communicationScore != null || report.confidenceScore != null || (report.strengths && report.strengths.length) || (report.weaknesses && report.weaknesses.length) || (report.improvementPlan && report.improvementPlan.length)) && (
              <div className="detail-section rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-amber-400" />
                  AI Report
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {report.technicalScore != null && (
                    <div className="score-box rounded-xl bg-white/5 p-3 border border-white/5">
                      <p className="text-xs text-slate-500">Technical</p>
                      <p className="text-xl font-bold text-white">{report.technicalScore}</p>
                    </div>
                  )}
                  {report.communicationScore != null && (
                    <div className="score-box rounded-xl bg-white/5 p-3 border border-white/5">
                      <p className="text-xs text-slate-500">Communication</p>
                      <p className="text-xl font-bold text-white">{report.communicationScore}</p>
                    </div>
                  )}
                  {report.confidenceScore != null && (
                    <div className="score-box rounded-xl bg-white/5 p-3 border border-white/5">
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="text-xl font-bold text-white">{report.confidenceScore}</p>
                    </div>
                  )}
                </div>
                {report.strengths && report.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-emerald-400 mb-1">Strengths</p>
                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-0.5">
                      {report.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.weaknesses && report.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-400 mb-1">Areas to improve</p>
                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-0.5">
                      {report.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.improvementPlan && report.improvementPlan.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-indigo-400 mb-1">Improvement plan</p>
                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-0.5">
                      {report.improvementPlan.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default VideoCallInterviewDetail;
