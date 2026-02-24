import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { FileText, Sparkles } from "lucide-react";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
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
function ApiTemplatePreview({ template, onSelect }) {
  const { _id, name, image } = template;
  return (
    <div
      className="rounded-2xl border border-white/20 overflow-hidden bg-black shadow-xl cursor-pointer hover:border-emerald-500/50 hover:shadow-emerald-500/20 transition-all duration-300"
      onClick={() => onSelect?.(_id)}
    >
      <div className="flex h-[280px] sm:h-[320px] bg-zinc-900">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-white font-medium text-sm truncate">{name}</p>
        <p className="text-zinc-400 text-xs mt-0.5">Portfolio template</p>
      </div>
    </div>
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
        const { data } = await axios.get(`${API_BASE}/templates`);
        if (data?.success && Array.isArray(data?.data)) {
          setPortfolioImages(data.data);
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

        <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Design templates</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose a design
            </h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Pick a layout for your portfolio or resume. Each design is a template you can use.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioLoading && (
              <div className="col-span-full flex justify-center py-8">
                <p className="text-zinc-400">Loading portfolio templates…</p>
              </div>
            )}
            {portfolioError && (
              <div className="col-span-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                {portfolioError}
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

          <div className="mt-12 flex justify-center gap-4">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              <FileText className="h-5 w-5" />
              Back to templates
            </Link>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
