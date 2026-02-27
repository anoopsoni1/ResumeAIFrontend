import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiVideo, FiPhoneOff, FiMic, FiMicOff, FiVideoOff, FiMessageCircle } from "react-icons/fi";
import LightPillar from "./LiquidEther.jsx";

// Socket.IO from CDN (index.html) as window.io – no npm package required
const getSocketIO = () => (typeof window !== "undefined" ? window.io : null);

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://resumeaibackend-oqcl.onrender.com");

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function LiveInterviewCall() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [authChecking, setAuthChecking] = useState(true);
  const [interview, setInterview] = useState(null);
  const [user, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callState, setCallState] = useState("joining"); // joining | connected | ended | error
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [localMuted, setLocalMuted] = useState(false);
  const [localVideoOff, setLocalVideoOff] = useState(false);
  const [socketMissing, setSocketMissing] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [aiTips, setAiTips] = useState([
    "Speak clearly and at a steady pace.",
    "Maintain eye contact with the camera.",
    "Structure answers: situation, action, result.",
  ]);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const getHeaders = () => {
    const t = localStorage.getItem("accessToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const endCall = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteSocketIdRef.current = null;
    setRemoteParticipant(null);
    setCallState("ended");
  }, []);

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
        if (currentUser) {
          dispatch(setUser(currentUser));
          setUserProfile(currentUser);
        }
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

  useEffect(() => {
    if (!interview || !user || loading) return;

    const roomId = interview.roomId || interview._id;
    const io = getSocketIO();
    if (!io) {
      setSocketMissing(true);
      setCallState("error");
      return;
    }
    let socket = io(API_BASE, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect_error", () => {
      setConnectionFailed(true);
      setCallState("error");
    });
    socket.io.on("reconnect_failed", () => {
      setConnectionFailed(true);
      setCallState("error");
    });

    socket.on("connect", async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getHeaders() },
          body: JSON.stringify({
            status: "in_progress",
            startedAt: new Date().toISOString(),
            roomId: roomId,
          }),
        }).catch(() => {});

        socket.emit("join-room", roomId, {
          name: `${user.FirstName || ""} ${user.LastName || ""}`.trim() || user.email,
          role: interview.role,
        });
      } catch (err) {
        console.error("getUserMedia failed", err);
        setCallState("error");
      }
    });

    socket.on("user-joined", async ({ socketId, userMeta }) => {
      if (socketId === socket.id) return;
      remoteSocketIdRef.current = socketId;
      setRemoteParticipant({ socketId, ...userMeta });

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerRef.current = pc;

      localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams?.[0]) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: socketId, candidate: e.candidate });
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: socketId, offer });
      } catch (err) {
        console.error("createOffer failed", err);
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      let pc = peerRef.current;
      if (!pc) {
        pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerRef.current = pc;
        localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams?.[0]) remoteVideoRef.current.srcObject = e.streams[0];
        };
        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit("ice-candidate", { to: from, candidate: e.candidate });
        };
      }
      remoteSocketIdRef.current = from;
      setRemoteParticipant((prev) => prev ? prev : { socketId: from, name: "Remote" });
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      } catch (err) {
        console.error("handle offer failed", err);
      }
    });

    socket.on("answer", async ({ from, answer }) => {
      const pc = peerRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("setRemoteDescription answer failed", err);
        }
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = peerRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("addIceCandidate failed", err);
        }
      }
    });

    socket.on("user-left", ({ socketId }) => {
      if (socketId === remoteSocketIdRef.current) {
        if (peerRef.current) {
          peerRef.current.close();
          peerRef.current = null;
        }
        remoteSocketIdRef.current = null;
        setRemoteParticipant(null);
      }
    });

    socket.on("error", (err) => {
      setCallState("error");
    });

    setCallState("connected");

    return () => {
      endCall();
    };
  }, [interview?._id, user, loading, id, endCall]);

  const handleEndCall = async () => {
    endCall();
    try {
      await fetch(`${API_BASE}/api/v1/user/interviews/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({ status: "ended", endedAt: new Date().toISOString() }),
      });
    } catch {}
    navigate(`/dashboard/interviews/${id}`);
  };

  const toggleMute = () => {
    const willBeMuted = !localMuted;
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !willBeMuted; });
    setLocalMuted(willBeMuted);
  };

  const toggleVideo = () => {
    const willBeOff = !localVideoOff;
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !willBeOff; });
    setLocalVideoOff(willBeOff);
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">{authChecking ? "Checking session…" : "Loading interview…"}</p>
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

  if (callState === "ended") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white">Call ended.</p>
        <Link to={`/dashboard/interviews/${id}`} className="text-indigo-400">Back to interview</Link>
      </div>
    );
  }

  if (callState === "error") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-amber-400">
          {connectionFailed
            ? "Cannot reach the call server. Start the backend (npm run dev in Backend folder) and run npm install socket.io in the Backend folder, then restart."
            : socketMissing
              ? "Socket.IO failed to load. Refresh the page or check your connection."
              : "Could not start video. Check camera/mic permissions."}
        </p>
        <Link to={`/dashboard/interviews/${id}`} className="text-indigo-400 hover:text-indigo-300">Back to interview</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
        </div>
      )}
      <div className="relative z-10 min-h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <FiVideo className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold">{interview.role || "Live Interview"}</span>
          {remoteParticipant && (
            <span className="text-slate-400 text-sm">• {remoteParticipant.name || "Connected"}</span>
          )}
        </div>
        <Link to={`/dashboard/interviews/${id}`} className="text-sm text-slate-400 hover:text-white">Leave & save</Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 relative min-h-[240px]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteParticipant && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <p className="text-slate-500">Waiting for the other participant…</p>
              </div>
            )}
            {remoteParticipant && (
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-sm">
                {remoteParticipant.name || "Remote"}
              </div>
            )}
          </div>
          <div className="w-full lg:w-64 rounded-2xl overflow-hidden bg-slate-900 relative shrink-0 h-48 lg:h-auto lg:min-h-[200px]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
              You
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2 mb-3">
            <FiMessageCircle className="w-4 h-4" />
            AI interview tips
          </h3>
          <ul className="flex-1 overflow-auto space-y-2 text-sm text-slate-300">
            {aiTips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-indigo-400 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition ${localMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"}`}
          title={localMuted ? "Unmute" : "Mute"}
        >
          {localMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition ${localVideoOff ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"}`}
          title={localVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {localVideoOff ? <FiVideoOff className="w-6 h-6" /> : <FiVideo className="w-6 h-6" />}
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition"
          title="End call"
        >
          <FiPhoneOff className="w-6 h-6" />
        </button>
      </div>
      </div>
    </div>
  );
}

export default LiveInterviewCall;
