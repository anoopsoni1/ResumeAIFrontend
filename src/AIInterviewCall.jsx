import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiMic, FiMicOff, FiVideo, FiPhoneOff, FiMessageCircle } from "react-icons/fi";
import gsap from "gsap";
import { useToast } from "./context/ToastContext";
import LightPillar from "./LiquidEther.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com"

const DURATION_MINUTES = 15; // max time; user can end anytime

function AIInterviewCall() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [authChecking, setAuthChecking] = useState(true);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [timeLeft, setTimeLeft] = useState(DURATION_MINUTES * 60);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const endedRef = useRef(false);
  const startScreenRef = useRef(null);
  const callScreenRef = useRef(null);
  const questionTextRef = useRef(null);

  const toast = useToast();

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
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
    if (!id || authChecking) return;
    let cancelled = false;
    async function fetchInterview() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
          credentials: "include",
          headers: getHeaders(),
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data) setInterview(json.data);
        else setInterview(null);
      } catch {
        if (!cancelled) setInterview(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInterview();
    return () => { cancelled = true; };
  }, [id, authChecking]);

  const fetchNextQuestion = async () => {
    setQuestionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/interviews/${id}/ai-question`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({ previousQuestions: questionsAsked }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data?.question) {
        setQuestion(json.data.question);
        setQuestionsAsked((q) => [...q, json.data.question]);
      } else {
        setQuestion("Thank you. Do you have any questions for us?");
      }
    } catch {
      setQuestion("Tell me about yourself and your experience.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({ status: "in_progress", startedAt: new Date().toISOString() }),
      });

      // ~90 kbps total so 15 min stays under 10 MB for upload
      let recorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8,opus",
          videoBitsPerSecond: 70000,
          audioBitsPerSecond: 20000,
        });
      } catch {
        recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      }
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const chunks = chunksRef.current;
        setUploading(true);
        let uploadError = null;
        try {
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: "video/webm" });
            if (blob.size < 100) {
              uploadError = "Recording too short to upload.";
            } else {
              const file = new File([blob], "recording.webm", { type: "video/webm" });
              const formData = new FormData();
              formData.append("recording", file);
              // Do not set Content-Type: browser must set multipart/form-data with boundary
              const uploadRes = await fetch(`${API_BASE}/api/v1/user/interviews/${id}/upload-recording`, {
                method: "POST",
                credentials: "include",
                headers: { ...getHeaders() },
                body: formData,
              });
              const uploadJson = await uploadRes.json().catch(() => ({}));
              if (!uploadRes.ok) {
                uploadError = uploadJson?.message || `Upload failed (${uploadRes.status}).`;
              }
            }
          }
          await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...getHeaders() },
            body: JSON.stringify({ status: "ended", endedAt: new Date().toISOString() }),
          });
        } catch (e) {
          console.error("Upload failed", e);
          uploadError = e?.message || "Upload failed.";
        } finally {
          setUploading(false);
          if (uploadError) toast.error(uploadError);
          navigate(`/dashboard/interviews/${id}`);
        }
      };
      recorder.start(5000);
      mediaRecorderRef.current = recorder;

      setStarted(true);
      fetchNextQuestion();
    } catch (err) {
      console.error(err);
    }
  };

  // Read each question aloud using the browser's speech synthesis (if available)
  useEffect(() => {
    if (!started || ended) return;
    if (!aiVoiceEnabled) return;
    if (!question || questionLoading) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) return;

    const synth = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(question);
    utterance.lang = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    synth.cancel();
    synth.speak(utterance);

    return () => {
      synth.cancel();
    };
  }, [question, started, ended, aiVoiceEnabled, questionLoading]);

  useEffect(() => {
    if (!started || ended) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [started, ended]);

  useEffect(() => {
    if (started && !ended && timeLeft === 0) {
      handleEndCall();
    }
  }, [timeLeft, started, ended]);

  const handleEndCall = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    setEnded(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.requestData();
      } catch (_) {}
      setTimeout(() => {
        try {
          if (recorder.state !== "inactive") recorder.stop();
        } catch (_) {}
      }, 300);
    } else {
      setUploading(true);
      fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({ status: "ended", endedAt: new Date().toISOString() }),
      })
        .catch(() => {})
        .finally(() => {
          setUploading(false);
          navigate(`/dashboard/interviews/${id}`);
        });
    }
  };

  const toggleMute = () => {
    const willBeMuted = !localMuted;
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !willBeMuted; });
    setLocalMuted(willBeMuted);
  };

  const toggleAiVoice = () => {
    setAiVoiceEnabled((prev) => {
      if (prev && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!startScreenRef.current) return;
    const el = startScreenRef.current;
    const icon = el.querySelector(".start-icon");
    const title = el.querySelector(".start-title");
    const desc = el.querySelector(".start-desc");
    const btn = el.querySelector(".start-btn");
    const cancel = el.querySelector(".start-cancel");
    if (!icon || !title) return;
    const ctx = gsap.context(() => {
      gsap.from(icon, { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(1.4)" });
      gsap.from(title, { y: 16, opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
      if (desc) gsap.from(desc, { y: 12, opacity: 0, duration: 0.4, delay: 0.2, ease: "power2.out" });
      if (btn) gsap.from(btn, { y: 12, opacity: 0, duration: 0.4, delay: 0.3, ease: "power2.out" });
      if (cancel) gsap.from(cancel, { opacity: 0, duration: 0.35, delay: 0.4 });
    }, el);
    return () => ctx.revert();
  }, [interview?._id, started === false]);

  useEffect(() => {
    if (!callScreenRef.current || !started) return;
    const el = callScreenRef.current;
    const header = el.querySelector(".call-header");
    const card = el.querySelector(".call-question-card");
    const tips = el.querySelector(".call-tips");
    const ctx = gsap.context(() => {
      if (header) gsap.from(header, { y: -12, opacity: 0, duration: 0.35, ease: "power2.out" });
      if (card) gsap.from(card, { y: 16, opacity: 0, duration: 0.45, delay: 0.08, ease: "power2.out" });
      if (tips) gsap.from(tips, { x: 20, opacity: 0, duration: 0.4, delay: 0.15, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [started]);

  useEffect(() => {
    if (!questionTextRef.current || questionLoading) return;
    gsap.fromTo(questionTextRef.current, { opacity: 0.3 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
  }, [question, questionLoading]);

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">{authChecking ? "Checking session…" : "Loading…"}</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Interview not found.</p>
        <Link to="/dashboard/interviews" className="text-indigo-400">Back to interviews</Link>
      </div>
    );
  }

  if (!started) {
    return (
      <div ref={startScreenRef} className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-4">
        <div className="start-icon rounded-full w-24 h-24 bg-indigo-600/30 flex items-center justify-center">
          <FiMessageCircle className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="start-title text-xl font-bold text-white text-center">AI Interview – {interview.role || "Interview"}</h1>
        <p className="start-desc text-slate-400 text-center max-w-sm">
          Up to {DURATION_MINUTES} minutes max; you can end anytime. The AI will ask you questions. Your video and audio will be recorded and analyzed.
        </p>
        <button
          onClick={startInterview}
          className="start-btn rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Start interview
        </button>
        <Link to={`/dashboard/interviews/${id}`} className="start-cancel text-slate-500 text-sm hover:text-slate-400">Cancel</Link>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
        </div>
      )}
      <div ref={callScreenRef} className="relative z-10 min-h-screen bg-black flex flex-col">
      <div className="call-header flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-semibold">{interview.role || "AI Interview"}</span>
        <span className="text-amber-400 font-mono tabular-nums">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <Link to={`/dashboard/interviews/${id}`} className="text-sm text-slate-400 hover:text-white transition">Exit</Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          <div className="call-question-card flex-1 rounded-2xl overflow-hidden bg-slate-900/80 border border-white/5 relative min-h-[200px] flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-indigo-600/40 flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="w-10 h-10 text-indigo-300" />
              </div>
              <p className="text-slate-400 text-sm mb-2">AI Interviewer</p>
              {questionLoading ? (
                <p className="text-slate-500">Loading question…</p>
              ) : (
                <p ref={questionTextRef} className="text-white text-lg max-w-xl mx-auto min-h-8">{question || "—"}</p>
              )}
              <button
                onClick={fetchNextQuestion}
                disabled={questionLoading}
                className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Next question
              </button>
              <div className="mt-3 flex flex-col items-center gap-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={toggleAiVoice}
                  className="underline underline-offset-2"
                >
                  {aiVoiceEnabled ? "Mute AI voice" : "Enable AI voice"}
                </button>
                {aiVoiceEnabled && <span>AI will read each question aloud.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="call-tips w-full lg:w-72 shrink-0 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <h3 className="text-sm font-semibold text-indigo-300 mb-2">Tips</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Answer clearly and concisely.</li>
            <li>• Use the &quot;Next question&quot; button when ready.</li>
            <li>• End anytime with the red phone button; max {DURATION_MINUTES} min.</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${localMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"}`}
        >
          {localMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
        </button>
        <button
          onClick={handleEndCall}
          disabled={uploading}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <FiPhoneOff className="w-6 h-6" />
        </button>
      </div>

      {(ended || uploading) && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-3 backdrop-blur-sm">
          <p className="text-white font-medium">
            {uploading ? "Ending interview & analyzing your performance…" : "Interview ended."}
          </p>
          {uploading && (
            <p className="text-slate-400 text-sm">Your recording is being sent to AI for feedback. You’ll see your report on the next page.</p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default AIInterviewCall;
