import { Link, useNavigate } from "react-router-dom";
import { FileText, Check, Eye, LayoutGrid, ArrowLeft, Layers, GitCompare, ChevronDown, ChevronUp } from "lucide-react";
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

/** Short comparison points for known resume templates (by name). */
function getTemplateHighlights(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("resume2") || n.includes("resume 2")) return ["Single-column layout", "Grey sidebar", "Clean & minimal", "Classic style"];
  if (n.includes("resume3") || n.includes("resume 3")) return ["Single-column centered", "Emerald accents", "Compact & readable", "Simple style"];
  return ["Different layout and style"];
}

function ApiTemplatePreview({ template, onSelect }) {
  const { _id, name, image } = template;
  return (
    <article className="group rounded-xl border border-white/15 overflow-hidden bg-zinc-900/80 backdrop-blur-sm shadow-lg shadow-black/20 hover:border-indigo-400/40 hover:shadow-indigo-500/15 transition-all duration-300 flex flex-col">
      <div
        role="button"
        tabIndex={0}
        className="flex flex-1 flex-col cursor-pointer"
        onClick={() => onSelect?.(_id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(_id)}
      >
        <div className="relative flex h-[160px] sm:h-[200px] md:h-[220px] bg-zinc-800 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="px-3 py-2.5 border-t border-white/10 bg-white/5 flex flex-col justify-center">
          <p className="text-white font-semibold text-xs truncate">{name}</p>
          <p className="text-zinc-500 text-[11px] mt-0.5 flex items-center gap-1">
            <LayoutGrid className="h-2.5 w-2.5" /> Resume template
          </p>
        </div>
      </div>
      <div className="px-2.5 py-2 border-t border-white/10 bg-white/5 flex gap-1.5">
        <button
          type="button"
          onClick={() => onSelect?.(_id)}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-2 text-xs font-medium text-white hover:bg-indigo-500 active:scale-[0.98] transition-all"
        >
          <Check className="h-3.5 w-3.5" /> Use this template
        </button>
        <Link
          to={`/templates/resumedesign/${_id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-indigo-400/50 hover:bg-white/5 transition-all"
        >
          <Eye className="h-3.5 w-3.5" /> View full
        </Link>
      </div>
    </article>
  );
}

export default function ResumeDesignPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchResumeTemplates = async () => {
      try {
        setResumeLoading(true);
        setResumeError(null);
        const { data } = await axios.get(`${API_BASE}/templates`, { params: { type: "resume" } });
        if (data?.success && Array.isArray(data?.data)) {
          setResumeTemplates(data.data.filter((t) => t.type !== "portfolio"));
        } else {
          setResumeTemplates([]);
        }
      } catch (err) {
        setResumeError(err?.response?.data?.message || err?.message || "Failed to load templates");
        setResumeTemplates([]);
      } finally {
        setResumeLoading(false);
      }
    };
    fetchResumeTemplates();
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

  const handleUseResume = (selectedId) => {
    if (selectedId) localStorage.setItem("selectedTemplate", selectedId);
    navigate("/upload");
  };

  const handleSelectApiTemplate = (templateId) => {
    handleUseResume(templateId);
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
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 min-h-[60vh]">
          <header className="mb-10 sm:mb-14 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-400/20 px-4 py-2 text-indigo-300">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Resume templates</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Choose a resume design
            </h1>
            <p className="mt-4 max-w-lg text-base sm:text-lg text-zinc-400 leading-relaxed">
              Pick a layout for your resume. Each design uses your saved details—add them first if you haven’t.
            </p>
            {!resumeLoading && resumeTemplates.length >= 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCompare((v) => !v);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-all"
              >
                <GitCompare className="h-4 w-4" />
                {showCompare ? "Hide differences" : "See differences"}
                {showCompare ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </header>

          {showCompare && resumeTemplates.length >= 1 && (
            <section className="mb-10 rounded-2xl border border-white/15 bg-zinc-900/60 backdrop-blur-sm p-6 sm:p-8" aria-label="Compare designs">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-indigo-400" /> Compare designs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeTemplates.slice(0, 3).map((t) => (
                  <div key={t._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="aspect-3/4 max-h-[200px] rounded-lg overflow-hidden bg-zinc-800 mb-4">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <p className="text-white font-semibold text-sm mb-2">{t.name}</p>
                    <ul className="text-zinc-400 text-xs space-y-1">
                      {getTemplateHighlights(t.name).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {resumeLoading && (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
            {resumeError && (
              <div className="col-span-full rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-5 py-4 text-amber-200 text-sm flex items-center gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">!</span>
                {resumeError}
              </div>
            )}
            {!resumeLoading && resumeTemplates.length === 0 && !resumeError && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Layers className="h-7 w-7 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm sm:text-base">No resume templates available yet.</p>
                <p className="text-zinc-500 text-sm mt-1">Check back later or try another category.</p>
              </div>
            )}
            {!resumeLoading &&
              resumeTemplates.map((template) => (
                <ApiTemplatePreview key={template._id} template={template} onSelect={handleSelectApiTemplate} />
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
