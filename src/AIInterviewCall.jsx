import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiMic, FiMicOff, FiVideo, FiPhoneOff, FiUser } from "react-icons/fi";
import gsap from "gsap";
import { useToast } from "./context/ToastContext";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com"

const DURATION_MINUTES = 15; // max time; user can end anytime
const QUESTION_DURATION_SECONDS = 90; // 1.5 min per question, then auto-advance

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
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0); // 1.5 min per question, then next
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [advancingQuestion, setAdvancingQuestion] = useState(false);
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
  const localVideoRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const userWaveCanvasRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const waveRafRef = useRef(null);

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
        setQuestionTimeLeft(QUESTION_DURATION_SECONDS);
      } else {
        setQuestion("Thank you. Do you have any questions for us?");
        setQuestionTimeLeft(QUESTION_DURATION_SECONDS);
      }
    } catch {
      setQuestion("Tell me about yourself and your experience.");
      setQuestionTimeLeft(QUESTION_DURATION_SECONDS);
    } finally {
      setQuestionLoading(false);
      setAdvancingQuestion(false);
    }
  };

  const handleNextQuestion = () => {
    if (questionLoading || advancingQuestion) return;

    // If AI voice is enabled and supported, say "Okay" before the next question
    if (
      aiVoiceEnabled &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.SpeechSynthesisUtterance
    ) {
      const synth = window.speechSynthesis;
      const utterance = new window.SpeechSynthesisUtterance("Okay, let's move to the next question.");
      utterance.lang = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setAiSpeaking(true);
      const stopSpeaking = () => setAiSpeaking(false);
      utterance.onend = () => {
        stopSpeaking();
        setAdvancingQuestion(true);
        fetchNextQuestion();
      };
      utterance.onerror = () => {
        stopSpeaking();
        setAdvancingQuestion(true);
        fetchNextQuestion();
      };

      synth.cancel();
      synth.speak(utterance);
    } else {
      setAdvancingQuestion(true);
      fetchNextQuestion();
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
        let uploadedRecording = false;

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
              } else {
                uploadedRecording = true;
              }
            }
          }
        } catch (e) {
          console.error("Upload failed", e);
          uploadError = e?.message || "Upload failed.";
        }

        try {
          const payload = {
            endedAt: new Date().toISOString(),
          };
          // If we didn't successfully upload a recording, mark interview as ended (no processing)
          if (!uploadedRecording) {
            payload.status = "ended";
          }
          await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...getHeaders() },
            body: JSON.stringify(payload),
          });
        } catch (e) {
          console.error("Failed to finalize interview", e);
          if (!uploadError) {
            uploadError = e?.message || "Failed to finalize interview.";
          }
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

      // Request fullscreen on the interview container (user gesture from Start button)
      const el = fullscreenContainerRef.current;
      if (el && typeof el.requestFullscreen === "function") {
        try {
          el.requestFullscreen().catch(() => {});
        } catch (_) {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Keep interview in fullscreen until user exits or interview completes; re-enter if they leave fullscreen (e.g. Esc)
  useEffect(() => {
    if (!started || ended || uploading) return;
    const el = fullscreenContainerRef.current;
    if (!el || typeof el.requestFullscreen !== "function") return;

    let reenterTimeoutId = null;

    const handleFullscreenChange = () => {
      if (endedRef.current) return;
      if (document.fullscreenElement !== el) {
        reenterTimeoutId = setTimeout(() => {
          reenterTimeoutId = null;
          if (endedRef.current) return;
          if (document.fullscreenElement !== el) {
            el.requestFullscreen().catch(() => {});
          }
        }, 200);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (reenterTimeoutId) clearTimeout(reenterTimeoutId);
    };
  }, [started, ended, uploading]);

  // Exit fullscreen when interview ends or is uploading so next page isn't stuck in fullscreen
  useEffect(() => {
    if (!ended && !uploading) return;
    if (typeof document.exitFullscreen === "function" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [ended, uploading]);

  // Attach user stream to video element when call screen is mounted
  useEffect(() => {
    if (!started || !streamRef.current || !localVideoRef.current) return;
    localVideoRef.current.srcObject = streamRef.current;
    return () => {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    };
  }, [started]);

  // Nice smooth wave effect when user speaks – audio analyser + canvas overlay
  useEffect(() => {
    if (!started || ended || !streamRef.current) return;
    const stream = streamRef.current;
    const canvas = userWaveCanvasRef.current;
    const audioTrack = stream.getAudioTracks()[0];
    if (!canvas || !audioTrack) return;

    let ctx;
    try {
      ctx = canvas.getContext("2d");
    } catch (_) {
      return;
    }
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    audioAnalyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const wavePoints = 64;
    let rafId;
    let phase = 0;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      if (!audioAnalyserRef.current || !userWaveCanvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w <= 0 || h <= 0) return;

      analyser.getByteFrequencyData(dataArray);
      phase += 0.02;

      ctx.clearRect(0, 0, w, h);

      const bottom = h - 6;
      const maxAmp = h * 0.4;
      const step = w / (wavePoints - 1);

      // Build smooth wave Y values from frequency data + subtle motion
      const ys = [];
      for (let i = 0; i < wavePoints; i++) {
        const idx = Math.floor((i / (wavePoints - 1)) * (dataArray.length - 1));
        const raw = dataArray[Math.min(idx, dataArray.length - 1)] || 0;
        const norm = localMuted ? 0 : Math.min(1, raw / 200);
        const wave = Math.sin(i * 0.3 + phase) * 0.15 + Math.sin(i * 0.5 + phase * 1.3) * 0.1;
        const amp = (4 + norm * maxAmp) * (1 + wave);
        ys.push(bottom - amp);
      }

      // Draw soft glow layer (wider, more transparent)
      ctx.beginPath();
      ctx.moveTo(0, bottom);
      for (let i = 0; i < wavePoints - 1; i++) {
        const x0 = i * step;
        const x1 = (i + 1) * step;
        const cx = (x0 + x1) / 2;
        const y0 = ys[i];
        const y1 = ys[i + 1];
        const cy = (y0 + y1) / 2;
        ctx.quadraticCurveTo(x0, y0, cx, cy);
      }
      ctx.lineTo(w, ys[wavePoints - 1]);
      ctx.lineTo(w, bottom);
      ctx.closePath();
      const glowGrad = ctx.createLinearGradient(0, bottom, 0, 0);
      glowGrad.addColorStop(0, "rgba(34, 211, 238, 0.25)");
      glowGrad.addColorStop(0.6, "rgba(34, 211, 238, 0.08)");
      glowGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = glowGrad;
      ctx.shadowColor = "rgba(34, 211, 238, 0.8)";
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Main wave fill – smooth curve
      ctx.beginPath();
      ctx.moveTo(0, bottom);
      for (let i = 0; i < wavePoints - 1; i++) {
        const x0 = i * step;
        const x1 = (i + 1) * step;
        const cx = (x0 + x1) / 2;
        const y0 = ys[i];
        const y1 = ys[i + 1];
        const cy = (y0 + y1) / 2;
        ctx.quadraticCurveTo(x0, y0, cx, cy);
      }
      ctx.lineTo(w, ys[wavePoints - 1]);
      ctx.lineTo(w, bottom);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, bottom, 0, 0);
      fillGrad.addColorStop(0, "rgba(6, 182, 212, 0.6)");
      fillGrad.addColorStop(0.35, "rgba(34, 211, 238, 0.9)");
      fillGrad.addColorStop(0.7, "rgba(165, 243, 252, 0.95)");
      fillGrad.addColorStop(1, "rgba(255,255,255,0.85)");
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Wave outline for a crisp, shiny edge
      ctx.beginPath();
      ctx.moveTo(0, ys[0]);
      for (let i = 0; i < wavePoints - 1; i++) {
        const x0 = i * step;
        const cx = (x0 + (i + 1) * step) / 2;
        ctx.quadraticCurveTo(x0, ys[i], cx, (ys[i] + ys[i + 1]) / 2);
      }
      ctx.quadraticCurveTo((wavePoints - 1) * step, ys[wavePoints - 1], w, ys[wavePoints - 1]);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    draw();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      try {
        source.disconnect();
        if (audioContext.close) audioContext.close();
      } catch (_) {}
      audioContextRef.current = null;
      audioAnalyserRef.current = null;
    };
  }, [started, ended, localMuted]);

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

    utterance.onstart = () => setAiSpeaking(true);
    const stopSpeaking = () => setAiSpeaking(false);
    utterance.onend = stopSpeaking;
    utterance.onerror = stopSpeaking;

    synth.cancel();
    synth.speak(utterance);

    return () => {
      synth.cancel();
      setAiSpeaking(false);
    };
  }, [question, started, ended, aiVoiceEnabled, questionLoading]);

  useEffect(() => {
    if (!started || ended) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [started, ended]);

  // Per-question timer: 1.5 min then auto-advance to next question
  useEffect(() => {
    if (!started || ended) return;
    const t = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev > 0) return prev - 1;
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, ended]);

  // When per-question timer hits 0, advance to next question (unless it's the thank-you message)
  useEffect(() => {
    if (!started || ended || questionLoading || advancingQuestion) return;
    if (questionTimeLeft !== 0) return;
    const isThankYou = question && String(question).includes("Thank you");
    if (isThankYou) return;
    handleNextQuestion();
    setQuestionTimeLeft(-1); // prevent repeated triggers until next question loads
  }, [questionTimeLeft, started, ended, questionLoading, advancingQuestion, question]);

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
      if (prev) {
        setAiSpeaking(false);
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
    const tips = el.querySelector(".start-tips");
    if (!icon || !title) return;
    const ctx = gsap.context(() => {
      gsap.from(icon, { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(1.4)" });
      gsap.from(title, { y: 16, opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
      if (desc) gsap.from(desc, { y: 12, opacity: 0, duration: 0.4, delay: 0.2, ease: "power2.out" });
      if (tips) gsap.from(tips, { y: 12, opacity: 0, duration: 0.4, delay: 0.28, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [interview?._id, started === false]);

  useEffect(() => {
    if (!callScreenRef.current || !started) return;
    const el = callScreenRef.current;
    const header = el.querySelector(".call-header");
    const card = el.querySelector(".call-question-card");
    const ctx = gsap.context(() => {
      if (header) gsap.from(header, { y: -12, opacity: 0, duration: 0.35, ease: "power2.out" });
      if (card) gsap.from(card, { y: 16, opacity: 0, duration: 0.45, delay: 0.08, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [started]);

  useEffect(() => {
    if (!questionTextRef.current || questionLoading) return;
    gsap.fromTo(questionTextRef.current, { opacity: 0.3 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
  }, [question, questionLoading]);

  if (authChecking || loading) {
    return (
      <div ref={fullscreenContainerRef} className="fixed inset-0 w-screen h-screen min-h-dvh bg-black flex items-center justify-center">
        <p className="text-white">{authChecking ? "Checking session…" : "Loading…"}</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div ref={fullscreenContainerRef} className="fixed inset-0 w-screen h-screen min-h-dvh bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Interview not found.</p>
        <Link to="/dashboard/interviews" className="text-indigo-400">Back to interviews</Link>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // Single fullscreen wrapper so browser fullscreen persists when switching from start → call
  return (
    <div ref={fullscreenContainerRef} className="fixed inset-0 w-screen h-screen min-h-dvh overflow-hidden bg-black">
      {!started ? (
        <div ref={startScreenRef} className="w-full h-full flex flex-col items-center justify-center gap-6 px-4">
          <div className="start-icon rounded-full w-24 h-24 bg-indigo-600/30 flex items-center justify-center">
            <FiUser className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="start-title text-xl font-bold text-white text-center">AI Interview – {interview.role || "Interview"}</h1>
          <p className="start-desc text-slate-400 text-center max-w-sm">
            Up to {DURATION_MINUTES} minutes max; you can end anytime. The AI will ask you questions. Your video and audio will be recorded and analyzed.
          </p>
          <div className="start-tips w-full max-w-sm rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-left">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">Tips</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>• Answer clearly and concisely.</li>
              <li>• You have 1.5 minutes per question; use &quot;Next question&quot; when ready or wait for auto-advance.</li>
              <li>• End anytime with the red phone button.</li>
            </ul>
          </div>
          <button
            onClick={startInterview}
            className="start-btn rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start interview
          </button>
          <Link to={`/dashboard/interviews/${id}`} className="start-cancel text-slate-500 text-sm hover:text-slate-400">Cancel</Link>
        </div>
      ) : (
        <>
          <div ref={callScreenRef} className="relative z-10 w-full h-full min-h-0 flex flex-col">
      <div className="call-header flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-semibold">{interview.role || "AI Interview"}</span>
        <span className="text-amber-400 font-mono tabular-nums">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <Link to={`/dashboard/interviews/${id}`} className="text-sm text-slate-400 hover:text-white transition">Exit</Link>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 min-h-0 min-w-0 sm:min-h-0">
          {/* AI Interviewer – on mobile: prominent card with scroll; on desktop: equal half */}
          <div className="call-question-card flex flex-col rounded-2xl overflow-hidden bg-slate-900/80 border border-white/5 sm:flex-1 min-h-[280px] sm:min-h-0 shrink-0 sm:shrink overflow-y-auto">
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center w-full max-w-xl mx-auto flex-1 min-h-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 flex items-center justify-center shrink-0">
                {/* 360° ripple rings when AI is speaking */}
                {aiSpeaking && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60 animate-ripple" style={{ animationDelay: "0s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ripple" style={{ animationDelay: "0.2s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-sky-400/50 animate-ripple" style={{ animationDelay: "0.4s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ripple" style={{ animationDelay: "0.6s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ripple" style={{ animationDelay: "0.8s" }} />
                  </>
                )}
                {/* AI avatar – same size on mobile and desktop so AI is clearly visible */}
                <div
                  className={`relative w-24 h-24 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-indigo-500 via-slate-600 to-indigo-700 flex items-center justify-center shadow-xl transition-all duration-300 overflow-hidden ring-2 ring-white/20 ${
                    aiSpeaking ? "scale-105 ring-4 ring-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,0.5)]" : "scale-100"
                  }`}
                >
                  <FiUser className="w-12 h-12 text-white/95" strokeWidth={2} />
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-2">AI Interviewer</p>
              {questionLoading ? (
                <p className="text-slate-500">Loading question…</p>
              ) : (
                <p ref={questionTextRef} className="text-white text-base sm:text-lg mx-auto min-h-8 leading-snug">{question || "—"}</p>
              )}
              {question && !questionLoading && questionTimeLeft >= 0 && (
                <p className="mt-2 sm:mt-3 text-cyan-400 font-mono text-sm tabular-nums">
                  Time for this question: {Math.floor(questionTimeLeft / 60)}:{(questionTimeLeft % 60).toString().padStart(2, "0")}
                </p>
              )}
              <button
              onClick={handleNextQuestion}
              disabled={questionLoading || advancingQuestion}
                className="mt-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition hover:scale-[1.02] active:scale-[0.98] shrink-0 sm:bg-white/10 sm:hover:bg-white/20"
              >
                Next question
              </button>
            </div>
          </div>

          {/* User video – equal half on desktop; fixed min height on mobile */}
          <div className="flex-1 min-h-[180px] sm:min-h-0 rounded-2xl overflow-hidden bg-slate-900/80 border border-white/5 relative flex items-center justify-center shrink-0 sm:shrink">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              title="You"
            />
            {/* Shiny wave overlay when user speaks */}
            <canvas
              ref={userWaveCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: "scaleX(-1)" }}
              aria-hidden
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-sm font-medium">
              You
            </div>
          </div>
        </div>
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
        </>
      )}
    </div>
  );
}

export default AIInterviewCall;
