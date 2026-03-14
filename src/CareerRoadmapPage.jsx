import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import CareerRoadmapForm from "./CareerRoadmapForm";
import RoadmapResult from "./RoadmapResult";
import Particles from "./Lighting.jsx";

import { API_BASE } from "./config.js";
import { useToast } from "./context/ToastContext";

function Topbar() {
  return <AppHeader />;
}

function safeReturnPath(path) {
  if (!path || typeof path !== "string") return null;
  const p = path.trim();
  if (p.startsWith("//") || p.startsWith("http")) return null;
  return p.startsWith("/") ? p : `/${p}`;
}

export default function CareerRoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [premiumChecked, setPremiumChecked] = useState(false);

  const returnPath = safeReturnPath(location.pathname) || "/career-roadmap";

  useEffect(() => {
    let cancelled = false;
    async function checkPremium() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok && res.status === 401) {
          navigate(`/login?from=${encodeURIComponent(returnPath)}`, { replace: true });
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const user = data?.user ?? data;
          if (!user?.Premium) {
            navigate("/price", { replace: true });
            return;
          }
        }
      } catch {
        if (!cancelled) navigate(`/login?from=${encodeURIComponent(returnPath)}`, { replace: true });
      } finally {
        if (!cancelled) setPremiumChecked(true);
      }
    }
    checkPremium();
    return () => { cancelled = true; };
  }, [navigate, returnPath]);

  const handleGenerate = async (payload) => {
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };
      const res = await fetch(`${API_BASE}/generate-roadmap`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        const message =
          res.status === 429
            ? json?.message || json?.error || "Daily limit reached (15 suggestions per day). Try again tomorrow."
            : json?.message || "Failed to generate roadmap";
        setError(message);
        if (res.status === 429) toast.error(message);
        return;
      }

      const data = json?.data ?? json;
      setRoadmap(data);
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!premiumChecked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
          <p className="text-white font-semibold">Checking access…</p>
        </div>
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
      <div className="absolute inset-0 z-1 bg-black/30" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 py-6 sm:py-8 pb-10 sm:pb-12">
          <div className="mx-auto px-3 sm:px-4 max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8 mb-6"
            >
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                AI Career Roadmap Generator
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Enter your goal and current skills to get a personalized learning roadmap.
                Premium: up to 15 suggestions per day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-8"
            >
              <CareerRoadmapForm onSubmit={handleGenerate} loading={loading} />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 px-4 py-3 mb-6 border-l-4 border-l-rose-500/60"
              >
                {error}
              </motion.div>
            )}

            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <RoadmapResult data={roadmap} />
              </motion.div>
            )}
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
