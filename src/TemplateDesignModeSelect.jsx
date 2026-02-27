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
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 min-h-[60vh]">
          <div className="mb-8 sm:mb-10 text-center px-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">Choose template type</h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-md mx-auto">Use this design as a resume template or portfolio template.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              type="button"
              onClick={handleResume}
              className="group rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8 text-left transition hover:border-indigo-500/50 hover:bg-white/10 active:scale-[0.99] min-h-[180px] sm:min-h-0 w-full"
            >
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Resume template</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400">Use this design for your resume and continue to upload.</p>
              <span className="mt-3 sm:mt-4 inline-block text-xs sm:text-sm font-medium text-indigo-400 group-hover:underline">Open resume design →</span>
            </button>
            <button
              type="button"
              onClick={handlePortfolio}
              className="group rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8 text-left transition hover:border-emerald-500/50 hover:bg-white/10 active:scale-[0.99] min-h-[180px] sm:min-h-0 w-full"
            >
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <LayoutTemplate className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Portfolio template</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400">Use this design for your portfolio and pick a layout.</p>
              <span className="mt-3 sm:mt-4 inline-block text-xs sm:text-sm font-medium text-emerald-400 group-hover:underline">Open portfolio design →</span>
            </button>
          </div>
          <div className="mt-10 sm:mt-12 flex justify-center">
            <Link to="/templates" className="text-sm text-zinc-400 hover:text-white transition py-2 px-1 min-h-[44px] flex items-center justify-center">← Back to templates</Link>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
