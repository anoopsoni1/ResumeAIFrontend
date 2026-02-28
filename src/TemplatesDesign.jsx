import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { Sparkles } from "lucide-react";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useState, useEffect } from "react";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}


/**
 * Design template: API portfolio image — shows template from backend (name + image).
 */
function ApiTemplatePreview({ template, onSelect, index = 0 }) {
  const { _id, name, image } = template;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl sm:rounded-2xl border border-white/20 overflow-hidden bg-black shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/20 transition-all duration-300 min-h-[200px] flex flex-col"
    >
      <div
        role="button"
        tabIndex={0}
        className="flex flex-1 flex-col cursor-pointer"
        onClick={() => onSelect?.(_id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(_id)}
      >
        <div className="flex h-[220px] sm:h-[280px] md:h-[320px] bg-zinc-900 shrink-0 overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="px-3 py-3 sm:px-4 sm:py-3 border-t border-white/10 bg-white/5 flex-1 flex flex-col justify-center">
          <p className="text-white font-medium text-sm truncate">{name}</p>
          <p className="text-zinc-400 text-xs mt-0.5">Portfolio template</p>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/10 bg-white/5 flex gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(_id)}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
        >
          Use this template
        </button>
        <Link
          to={`/templates/portfoliodesign/${_id}`}
          className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-center text-zinc-300 hover:text-white hover:border-emerald-500/50"
        >
          View full portfolio
        </Link>
      </div>
    </motion.div>
  );
}

export default function TemplatesDesignPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

        <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 min-h-[60vh]">
          <div className="mb-8 sm:mb-10 flex flex-col items-center text-center px-1">
            <div className="mb-2 sm:mb-3 flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1.5 sm:px-4 text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Design templates</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Choose a design
            </h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base md:text-lg text-zinc-400">
              Pick a layout for your portfolio or resume. Each design is a template you can use.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {portfolioLoading && (
              <div className="col-span-full flex justify-center py-12 sm:py-16">
                <p className="text-zinc-400 text-sm sm:text-base">Loading portfolio templates…</p>
              </div>
            )}
            {portfolioError && (
              <div className="col-span-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                {portfolioError}
              </div>
            )}
            {!portfolioLoading && portfolioImages.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-400 text-sm sm:text-base">
                No portfolio templates yet.
              </div>
            )}
            {!portfolioLoading &&
              portfolioImages.map((template) => (
                <ApiTemplatePreview
                  key={template._id}
                  template={template}
                  onSelect={handleSelectApiTemplate}
                />
              ))}
          </div>
          <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/templates/design" className="text-sm text-zinc-400 hover:text-white transition py-2 px-1 min-h-[44px] flex items-center justify-center">← Change type</Link>
            <Link to="/templates" className="text-sm text-zinc-400 hover:text-white transition py-2 px-1 min-h-[44px] flex items-center justify-center">Back to templates</Link>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
