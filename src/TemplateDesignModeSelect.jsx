import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, LayoutTemplate } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

export default function TemplateDesignModeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const templateId = location.state?.templateId || null;

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleResume = () => {
    navigate("/templates/resumedesign", { state: { templateId } });
  };

  const handlePortfolio = () => {
    navigate("/templates/portfoliodesign", { state: { templateId } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
          <Particles particleColors={["#ffffff"]} particleCount={200} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover alphaParticles={false} disableRotation={false} pixelRatio={1} />
        </div>
      )}
      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10">
        <Topbar onLogout={handleLogout} />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Choose template type</h1>
            <p className="mt-2 text-zinc-400">Use this design as a resume template or portfolio template.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleResume}
              className="group rounded-2xl border border-white/20 bg-white/5 p-8 text-left transition hover:border-indigo-500/50 hover:bg-white/10"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Resume template</h2>
              <p className="mt-2 text-sm text-zinc-400">Use this design for your resume and continue to upload.</p>
              <span className="mt-4 inline-block text-sm font-medium text-indigo-400 group-hover:underline">Open resume design →</span>
            </button>
            <button
              type="button"
              onClick={handlePortfolio}
              className="group rounded-2xl border border-white/20 bg-white/5 p-8 text-left transition hover:border-emerald-500/50 hover:bg-white/10"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <LayoutTemplate className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Portfolio template</h2>
              <p className="mt-2 text-sm text-zinc-400">Use this design for your portfolio and pick a layout.</p>
              <span className="mt-4 inline-block text-sm font-medium text-emerald-400 group-hover:underline">Open portfolio design →</span>
            </button>
          </div>
          <div className="mt-12 flex justify-center gap-4">
            <Link to="/templates" className="text-sm text-zinc-400 hover:text-white transition">← Back to templates</Link>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
