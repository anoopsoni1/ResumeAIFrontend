import React, { useState, useEffect } from "react";
import { FiGlobe, FiZap, FiTarget, FiUsers, FiUserPlus, FiVideo } from "react-icons/fi";
import { MdAutoAwesome, MdWbSunny } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { clearUser, setUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
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

function StatCards({ atsScore, optimizeCount }) {
  const atsDisplay = atsScore != null && typeof atsScore === "number" ? `${atsScore}%` : "—";
  const optimizeDisplay = optimizeCount != null && typeof optimizeCount === "number" ? String(optimizeCount) : "—";
  return (
    <div className="mt-6 px-4">
      <div className="mx-auto  grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <FiTarget />, label: "ATS Score", value: atsDisplay },
            { icon: <AiOutlineFileText />, label: "Resume Status", value: "Optimized" },
            { icon: <FiZap />, label: "AI Optimizes", value: optimizeDisplay },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-black p-4 hover:border-amber-500 transition"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {item.icon}
                </div>
                <span className="text-xs">{item.label}</span>
              </div>
              <div className="mt-3 text-xl font-bold text-white">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <AiOutlineFileText />,
              title: "Upload New Resume",
              desc: "Start fresh with a new resume upload.",
            },
            {
              icon: <MdAutoAwesome />,
              title: "Optimize Resume",
              desc: "Improve your ATS score and keywords.",
              link: "/aiedit",
            },
            {
              icon: <FiGlobe />,
              title: "Update Portfolio",
              desc: "Customize your online presence.",
              link: "/upload",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-black p-5 hover:border-amber-500 hover:shadow-md transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                {item.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-amber-500">{item.desc}</p>
              {item.link ? (
                <Link to={item.link} className="mt-3 inline-block text-xs font-semibold text-indigo-600">
                  Get Started →
                </Link>
              ) : (
                <button className="mt-3 text-xs font-semibold text-indigo-600">
                  Get Started →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [authChecking, setAuthChecking] = useState(true);
  const [atsScore, setAtsScore] = useState(null);
  const [optimizeCount, setOptimizeCount] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication + authorization: validate session with protected endpoint.
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
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  // Fetch ATS score for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setAtsScore(null);
      return;
    }
    let cancelled = false;
    async function fetchAtsScore() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/api/v1/user/get-atsscore`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null) {
          const score = json.data?.score;
          setAtsScore(typeof score === "number" ? score : null);
        } else {
          setAtsScore(null);
        }
      } catch {
        if (!cancelled) setAtsScore(null);
      }
    }
    fetchAtsScore();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch optimize count for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setOptimizeCount(null);
      return;
    }
    let cancelled = false;
    async function fetchOptimize() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/api/v1/user/get-optimize`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null && typeof json.data.number === "number") {
          setOptimizeCount(json.data.number);
        } else {
          setOptimizeCount(null);
        }
      } catch {
        if (!cancelled) setOptimizeCount(null);
      }
    }
    fetchOptimize();
    return () => { cancelled = true; };
  }, [user]);

  const [theme ] = useState("dark");

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-300">
            Verifying authentication with the server.
          </p>
        </div>
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

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? 'bg-black/40' : 'bg-black/30'}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />
        {user ? (
          <main className="flex-1 py-6">
            <div className="mx-auto px-4">
              <div className="rounded-2xl border border-yellow-100 p-6">
                <h2 className="text-lg sm:text-xl font-bold">
                  <span className="text-amber-500">
                    {user?.FirstName} {user?.LastName}
                  </span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Your resume is performing well. Here are your latest stats and
                  quick actions.
                </p>
              </div>

              {user?.Premium ? (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-300">
                        Premium active
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-300">
                        You have access to all premium features.
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-300">
                        Premium not active
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-300">
                        Upgrade to unlock premium templates, AI optimizations,
                        and more.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/price"
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        Upgrade
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Up page link - for all logged-in users */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-black/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Extra tools</p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300">
                      Templates and more.
                    </p>
                  </div>
                  <Link
                    to="/up"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Open Up page →
                  </Link>
                </div>
              </div>

              {/* Video call interviews */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-black/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <FiVideo className="w-4 h-4 text-indigo-400" />
                      Video call interviews
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300">
                      Schedule and view interview recordings and AI reports.
                    </p>
                  </div>
                  <Link
                    to="/dashboard/interviews"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Open interviews →
                  </Link>
                </div>
              </div>

              {/* Admin-only: All Users & Make Admin */}
              {user?.isAdmin && (
                <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">
                  <p className="text-sm font-semibold text-indigo-300">Admin</p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 mb-4">
                    Manage users and admins.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/admin-dashboard"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <FiUsers className="w-4 h-4" />
                      All Users
                    </Link>
                    <Link
                      to="/make-admin"
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 border border-indigo-400/50"
                    >
                      <FiUserPlus className="w-4 h-4" />
                      Make Admin
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <StatCards atsScore={atsScore} optimizeCount={optimizeCount} />
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 text-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Welcome to ResumeAI Dashboard
              </h1>
              <p className="mt-4 text-sm sm:text-lg text-amber-500">
                Please log in to access your dashboard.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
        <AppFooter />
      </div>
    </div>
  );
}
