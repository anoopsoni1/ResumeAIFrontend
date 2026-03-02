import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, LayoutTemplate, ChevronRight, ArrowLeft, Layers, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;
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
    if (!isPremium) return;
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
        <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 md:py-20 min-h-[60vh] flex flex-col items-center justify-center">
          <header className="mb-8 sm:mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-zinc-300 text-sm font-medium">
                <Layers className="h-4 w-4" /> Template type
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              Choose template type
            </h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-zinc-400">
              Use this design as a resume or portfolio. Both use your saved details.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            <button
              type="button"
              onClick={handleResume}
              className="group rounded-xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] w-full"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Resume template</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 leading-snug">
                Use this design for your resume. Pick a layout and view or download.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Open resume design <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
            {isPremium ? (
              <button
                type="button"
                onClick={handlePortfolio}
                className="group rounded-xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] w-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mb-3">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio template</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 leading-snug">
                  Use this design for your portfolio. Pick a layout and view or download.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Open portfolio design <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ) : (
              <Link
                to="/price"
                className="group rounded-xl border border-amber-500/30 bg-zinc-900/80 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-amber-400/50 w-full relative block"
              >
                <div className="absolute top-3 right-3 rounded-full bg-amber-500/20 p-1.5 border border-amber-400/40" title="Premium feature">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mb-3">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio template</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 leading-snug">
                  Use this design for your portfolio. Pick a layout and view or download.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-amber-400">
                  <Lock className="h-3.5 w-3.5" /> Upgrade to unlock
                </span>
              </Link>
            )}
          </div>

          <nav className="mt-10 sm:mt-12">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to templates
            </Link>
          </nav>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
