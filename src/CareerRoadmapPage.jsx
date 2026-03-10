import React, { useState } from "react";
import { motion } from "framer-motion";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import CareerRoadmapForm from "./CareerRoadmapForm";
import RoadmapResult from "./RoadmapResult";
import Particles from "./Lighting.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function Topbar() {
  return <AppHeader />;
}

export default function CareerRoadmapPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const handleGenerate = async (payload) => {
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/generate-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Failed to generate roadmap");
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
