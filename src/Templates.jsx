import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { FileText, Layout, Lock, Sparkles } from "lucide-react";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
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

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function TemplateCard({ template, onSelect, isLocked, index = 0 }) {
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
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${accent} backdrop-blur-sm flex flex-col relative min-h-[200px] ${isLocked ? "opacity-90" : ""}`}
    >
      {isLocked && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full bg-amber-500/20 p-1.5 border border-amber-400/40" title="Premium template">
          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
        </div>
      )}
      <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="rounded-lg bg-white/10 p-1.5 sm:p-2 shrink-0">
          <Layout className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{template.name}</h3>
      </div>
      <p className="text-xs sm:text-sm text-zinc-400 mb-4 sm:mb-6 flex-1 line-clamp-3">{template.description}</p>
      <div className="rounded-lg bg-black/30 p-3 sm:p-4 mb-4 sm:mb-6 min-h-[64px] sm:min-h-[80px] flex items-center justify-center border border-white/10">
        <span className="text-xs sm:text-sm font-medium text-white/80">{template.preview}</span>
      </div>
      {isLocked ? (
        <Link to="/price">
          <motion.span
            className={`w-full inline-flex items-center justify-center rounded-lg py-2.5 text-xs sm:text-sm font-semibold text-white gap-2 min-h-[44px] ${btn}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Upgrade to unlock
          </motion.span>
        </Link>
      ) : (
        <motion.button
          onClick={() => onSelect(template.id)}
          className={`w-full rounded-lg py-2.5 text-xs sm:text-sm font-semibold text-white min-h-[44px] ${btn}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Use this template
        </motion.button>
      )}
    </motion.div>
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
    navigate("/templates/design", { state: { templateId } });
  };

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

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10">
        <Topbar onLogout={handleLogout} />

        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10 flex flex-col items-center text-center px-1"
          >
            <div className="mb-2 sm:mb-3 flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1.5 sm:px-4 text-orange-400">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">ATS-friendly</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Choose a template
            </h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base md:text-lg text-zinc-400">
              Professional layouts designed to pass ATS and impress recruiters. Pick one and start building.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TEMPLATES.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
                isLocked={!isPremium && index > 0}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 sm:mt-12 flex justify-center"
          >
            <Link to="/upload">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 sm:px-6 text-white font-semibold shadow-lg shadow-indigo-500/30 text-sm sm:text-base min-h-[44px] justify-center w-full sm:w-auto max-w-xs sm:max-w-none"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <FileText className="h-5 w-5 shrink-0" />
                Upload & edit your resume
              </motion.span>
            </Link>
          </motion.div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
