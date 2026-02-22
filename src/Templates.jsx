import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { FileText, Layout, Lock, Sparkles } from "lucide-react";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean layout with strong typography. Best for tech and creative roles.",
    accent: "indigo",
    preview: "Modern",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Timeless, professional design. Ideal for corporate and traditional industries.",
    accent: "slate",
    preview: "Classic",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and scannable. Great for ATS and minimalist aesthetics.",
    accent: "gray",
    preview: "Minimal",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Bold accents and clear sections. Stand out with orange highlights.",
    accent: "orange",
    preview: "Premium",
  },
];

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

function TemplateCard({ template, onSelect, isLocked }) {
  const accentColors = {
    indigo: "border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20",
    slate: "border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20",
    gray: "border-gray-500/50 bg-gray-500/10 hover:bg-gray-500/20",
    orange: "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20",
  };
  const btnColors = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    slate: "bg-slate-600 hover:bg-slate-700",
    gray: "bg-gray-800 hover:bg-gray-700",
    orange: "bg-orange-600 hover:bg-orange-700",
  };
  const accent = accentColors[template.accent] || accentColors.indigo;
  const btn = btnColors[template.accent] || btnColors.indigo;

  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 ${accent} backdrop-blur-sm flex flex-col relative ${isLocked ? "opacity-90" : ""}`}
    >
      {isLocked && (
        <div className="absolute top-4 right-4 rounded-full bg-amber-500/20 p-1.5 border border-amber-400/40" title="Premium template">
          <Lock className="h-4 w-4 text-amber-400" />
        </div>
      )}
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-white/10 p-2">
          <Layout className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">{template.name}</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-6 flex-1">{template.description}</p>
      <div className="rounded-lg bg-black/30 p-4 mb-6 min-h-[80px] flex items-center justify-center border border-white/10">
        <span className="text-sm font-medium text-white/80">{template.preview}</span>
      </div>
      {isLocked ? (
        <Link
          to="/price"
          className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition text-center flex items-center justify-center gap-2 ${btn}`}
        >
          <Lock className="h-4 w-4" />
          Upgrade to unlock
        </Link>
      ) : (
        <button
          onClick={() => onSelect(template.id)}
          className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition ${btn}`}
        >
          Use this template
        </button>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;
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
      await axios.post(
        "https://resumeaibackend-oqcl.onrender.com/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSelectTemplate = (templateId) => {
    localStorage.setItem("selectedTemplate", templateId);
    navigate("/upload");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LiquidEther
            colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
            mouseForce={50}
            cursorSize={100}
            isViscous
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            color0="#5227FF"
            color1="#FF9FFC"
            color2="#B19EEF"
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
          <FloatingLines
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={5}
            lineDistance={10}
            bendRadius={5}
            bendStrength={-0.5}
            interactive
            parallax
            mixBlendMode="screen"
            topWavePosition={0}
            middleWavePosition={0}
            bottomWavePosition={-2}
            animationSpeed={2}
            mouseDamping={0.05}
          />
        </div>
      )}

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10">
        <Topbar onLogout={handleLogout} />

        <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-1.5 text-orange-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">ATS-friendly</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose a template
            </h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Professional layouts designed to pass ATS and impress recruiters. Pick one and start building.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
                isLocked={!isPremium && index > 0}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
            >
              <FileText className="h-5 w-5" />
              Upload & edit your resume
            </Link>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
