import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { Sparkles, Check, Eye, LayoutGrid, ArrowLeft, Layers, Lock } from "lucide-react";
import LightPillar from "./LiquidEther.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useState, useEffect } from "react";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm animate-pulse">
      <div className="h-[160px] sm:h-[200px] md:h-[220px] bg-white/10" />
      <div className="p-3 space-y-2 border-t border-white/10">
        <div className="h-3.5 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
      <div className="p-2.5 flex gap-2 border-t border-white/10">
        <div className="h-8 flex-1 rounded-lg bg-white/10" />
        <div className="h-8 flex-1 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

/**
 * Design template: API portfolio image — shows template from backend (name + image).
 */
function ApiTemplatePreview({ template, onSelect, index = 0 }) {
  const { _id, name, image } = template;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="group rounded-xl border border-white/15 overflow-hidden bg-zinc-900/80 backdrop-blur-sm shadow-lg shadow-black/20 hover:border-emerald-400/40 hover:shadow-emerald-500/15 transition-all duration-300 flex flex-col"
    >
      <div
        role="button"
        tabIndex={0}
        className="flex flex-1 flex-col cursor-pointer"
        onClick={() => onSelect?.(_id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(_id)}
      >
        <div className="relative flex h-[160px] sm:h-[200px] md:h-[220px] bg-zinc-800 shrink-0 overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="px-3 py-2.5 border-t border-white/10 bg-white/5 flex flex-col justify-center">
          <p className="text-white font-semibold text-xs truncate">{name}</p>
          <p className="text-zinc-500 text-[11px] mt-0.5 flex items-center gap-1">
            <LayoutGrid className="h-2.5 w-2.5" /> Portfolio template
          </p>
        </div>
      </div>
      <div className="px-2.5 py-2 border-t border-white/10 bg-white/5 flex gap-1.5">
        <button
          type="button"
          onClick={() => onSelect?.(_id)}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-medium text-white hover:bg-emerald-500 active:scale-[0.98] transition-all"
        >
          <Check className="h-3.5 w-3.5" /> Use this template
        </button>
        <Link
          to={`/templates/portfoliodesign/${_id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-emerald-400/50 hover:bg-white/5 transition-all"
        >
          <Eye className="h-3.5 w-3.5" /> View full
        </Link>
      </div>
    </motion.article>
  );
}

export default function TemplatesDesignPage() {
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

  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);

  useEffect(() => {
    const fetchPortfolioImages = async () => {
      try {
        setPortfolioLoading(true);
        setPortfolioError(null);
        const { data } = await axios.get(`${API_BASE}/templates`, { params: { type: "portfolio" } });
        if (data?.success && Array.isArray(data?.data)) {
          setPortfolioImages(data.data.filter((t) => t.type === "portfolio"));
        } else {
          setPortfolioImages([]);
        }
      } catch (err) {
        setPortfolioError(err?.response?.data?.message || err?.message || "Failed to load templates");
        setPortfolioImages([]);
      } finally {
        setPortfolioLoading(false);
      }
    };
    fetchPortfolioImages();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSelectDesign = (designId) => {
    localStorage.setItem("selectedDesignTemplate", designId);
    navigate("/upload");
  };
  const handleSelectApiTemplate = (templateId) => {
    localStorage.setItem("selectedDesignTemplate", templateId);
    navigate("/upload");
  };

  if (!isPremium) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-black/40" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Topbar onLogout={async () => {
            try {
              await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
              dispatch(clearUser());
              navigate("/login");
            } catch (e) { console.error(e); }
          }} />
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/80 backdrop-blur-sm p-8 sm:p-10 max-w-md text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Portfolio designs are premium</h1>
              <p className="text-zinc-400 text-sm sm:text-base mb-6">
                Upgrade to access portfolio templates and all premium features.
              </p>
              <Link
                to="/price"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-500 transition-all"
              >
                <Lock className="h-4 w-4" /> Upgrade to unlock
              </Link>
            </div>
            <Link to="/templates/design" className="mt-6 text-zinc-400 hover:text-white text-sm">
              <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to template type
            </Link>
          </main>
          <AppFooter />
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

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
      <div className="relative z-10">
        <Topbar onLogout={handleLogout} />

        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 min-h-[60vh]">
          <header className="mb-10 sm:mb-14 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/20 px-4 py-2 text-emerald-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Design templates</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Choose a design
            </h1>
            <p className="mt-4 max-w-lg text-base sm:text-lg text-zinc-400 leading-relaxed">
              Pick a layout for your portfolio. Each design uses your saved details—add them first if you haven’t.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {portfolioLoading && (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
            {portfolioError && (
              <div className="col-span-full rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-5 py-4 text-amber-200 text-sm flex items-center gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">!</span>
                {portfolioError}
              </div>
            )}
            {!portfolioLoading && portfolioImages.length === 0 && !portfolioError && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Layers className="h-7 w-7 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm sm:text-base">No portfolio templates available yet.</p>
                <p className="text-zinc-500 text-sm mt-1">Check back later or try another category.</p>
              </div>
            )}
            {!portfolioLoading &&
              portfolioImages.map((template, index) => (
                <ApiTemplatePreview
                  key={template._id}
                  template={template}
                  onSelect={handleSelectApiTemplate}
                  index={index}
                />
              ))}
          </div>

          <nav className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <Link
              to="/templates/design"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Change type
            </Link>
            <span className="hidden sm:inline w-px h-4 bg-white/20" aria-hidden />
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              Back to templates
            </Link>
          </nav>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
