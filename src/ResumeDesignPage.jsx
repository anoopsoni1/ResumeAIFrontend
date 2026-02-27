import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";
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

function ApiTemplatePreview({ template, onSelect }) {
  const { _id, name, image } = template;
  return (
    <div
      className="rounded-2xl border border-white/20 overflow-hidden bg-black shadow-xl cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all duration-300"
      onClick={() => onSelect?.(_id)}
    >
      <div className="flex h-[280px] sm:h-[320px] bg-zinc-900">
        <img src={image} alt={name} className="w-full h-full object-cover object-top" />
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-white font-medium text-sm truncate">{name}</p>
        <p className="text-zinc-400 text-xs mt-0.5">Resume template</p>
      </div>
    </div>
  );
}

export default function ResumeDesignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState(null);

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
        <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-indigo-400">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Resume templates</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Choose a resume design</h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Pick a layout for your resume. Each design is a template you can use.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumeLoading && (
              <div className="col-span-full flex justify-center py-8">
                <p className="text-zinc-400">Loading resume templates…</p>
              </div>
            )}
            {resumeError && (
              <div className="col-span-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                {resumeError}
              </div>
            )}
            {!resumeLoading &&
              resumeTemplates.map((template) => (
                <ApiTemplatePreview key={template._id} template={template} onSelect={handleSelectApiTemplate} />
              ))}
          </div>

          <div className="mt-12 flex justify-center gap-4">
            <Link to="/templates/design" className="text-sm text-zinc-400 hover:text-white transition">← Change type</Link>
            <Link to="/templates" className="text-sm text-zinc-400 hover:text-white transition">Back to templates</Link>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
