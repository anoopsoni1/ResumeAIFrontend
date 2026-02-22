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

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

/**
 * Design template: split-screen portfolio layout.
 * Rendered as a selectable template card preview (mini version).
 */
function SplitScreenDesignPreview({ onSelect }) {
  return (
    <div
      className="rounded-2xl border border-white/20 overflow-hidden bg-black shadow-xl cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all duration-300"
      onClick={() => onSelect?.("split-screen")}
    >
      <div className="flex h-[280px] sm:h-[320px]">
        {/* Left - light grey */}
        <div
          className="w-[58%] bg-[#e8e8e8] flex flex-col p-4"
          style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
        >
          <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <div className="flex-1 flex flex-col justify-center mt-2">
            <p className="text-[#4a4a4a] text-[10px]">Hi, I am</p>
            <p className="text-black font-bold text-sm">Anoop Soni</p>
            <p className="text-[#4a4a4a] text-[10px] mt-0.5">Front-end Developer / UI Designer</p>
          </div>
          <div className="flex gap-1.5">
            <div className="w-6 h-6 rounded bg-[#d4d4d4]" />
            <div className="w-6 h-6 rounded bg-[#d4d4d4]" />
            <div className="w-6 h-6 rounded bg-[#d4d4d4]" />
          </div>
        </div>
        {/* Right - black + nav + photo area */}
        <div className="flex-1 bg-black flex flex-col p-3">
          <div className="flex gap-2 justify-end text-white text-[8px]">
            <span>About</span>
            <span>Skills</span>
            <span>Portfolio</span>
            <span className="bg-white text-black px-1.5 py-0.5 rounded-full">Contact</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-zinc-800 rounded mt-2 min-h-0">
            <div className="w-16 h-20 rounded bg-zinc-700" />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-white font-medium text-sm">Split-screen portfolio</p>
        <p className="text-zinc-400 text-xs mt-0.5">Diagonal split, photo right, intro left</p>
      </div>
    </div>
  );
}

/**
 * Design template: Steve-style hero — light left, dark right, diamond photo, geometric shapes.
 */
function SteveDesignPreview({ onSelect }) {
  return (
    <div
      className="rounded-2xl border border-white/20 overflow-hidden bg-black shadow-xl cursor-pointer hover:border-pink-500/50 hover:shadow-pink-500/20 transition-all duration-300"
      onClick={() => onSelect?.("steve-hero")}
    >
      <div className="flex flex-col h-[280px] sm:h-[320px]">
        {/* Top nav - full width */}
        <div className="flex items-center justify-between px-3 py-2 bg-linear-to-r from-white to-[#f5f3f8] border-b border-[#2C294F]/20">
          <div className="w-5 h-5 rounded-full border-2 border-[#2C294F] flex items-center justify-center text-[#2C294F] text-[8px] font-bold">
            S
          </div>
          <div className="flex gap-1.5 text-[#2C294F] text-[7px] font-medium">
            <span>Home</span>
            <span>About</span>
            <span>Portfolio</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="flex flex-1 min-h-0">
          {/* Left - light gradient + hero text */}
          <div className="w-[55%] bg-linear-to-br from-white to-[#f0eef5] flex flex-col p-3 relative overflow-hidden">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#e8e4f0] text-[8px] font-bold -rotate-90 origin-center whitespace-nowrap select-none">
              DESIGNER
            </span>
            <div className="flex-1 flex flex-col justify-center pl-5">
              <p className="text-[#9b8fb8] text-[8px] font-bold tracking-wider">HELLO!</p>
              <p className="text-[#2C294F] font-bold text-sm leading-tight">I&apos;M STEVE</p>
              <p className="text-[#5a5568] text-[7px] mt-1 leading-tight">
                Freelance Motion and Graphics Designer...
              </p>
              <div className="mt-2 w-12 h-4 rounded bg-[#ec4899] flex items-center justify-center text-white text-[6px] font-semibold">
                Hire me
              </div>
            </div>
          </div>
          {/* Right - dark blue-purple + geometric + diamond */}
          <div className="flex-1 bg-[#2C294F] relative overflow-hidden flex items-center justify-center p-2">
            {/* Geometric shapes (simplified) */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1 right-2 w-3 h-3 border border-dashed border-white/60 rounded-sm" />
              <div className="absolute top-4 right-1 w-2 h-2 border border-pink-400/80" />
              <div className="absolute bottom-6 left-2 w-4 h-0.5 bg-white/50 rotate-45" />
              <div className="absolute bottom-2 right-4 w-2 h-2 border border-sky-300/70" />
            </div>
            {/* Diamond photo area */}
            <div
              className="w-24 h-28 shrink-0 bg-[#ec4899] flex items-center justify-center"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            >
              <div
                className="w-16 h-20 bg-[#3d3962] flex items-center justify-center"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-white font-medium text-sm">Steve-style hero</p>
        <p className="text-zinc-400 text-xs mt-0.5">Light + dark split, diamond photo, geometric accents</p>
      </div>
    </div>
  );
}

/**
 * Design template: Mahmood-style — dark theme, orange/gold accents, circular photo, stats bar.
 */
function MahmoodDesignPreview({ onSelect }) {
  return (
    <div
      className="rounded-2xl border border-white/20 overflow-hidden bg-[#1a1a1a] shadow-xl cursor-pointer hover:border-amber-500/50 hover:shadow-amber-500/20 transition-all duration-300"
      onClick={() => onSelect?.("mahmood-dark")}
    >
      <div className="flex flex-col h-[280px] sm:h-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border-b border-white/10">
          <span className="text-amber-500 text-[8px] font-bold tracking-wider">LOGO</span>
          <div className="flex gap-1.5 text-white/80 text-[6px]">
            <span className="text-amber-500">Home</span>
            <span>Services</span>
            <span>About me</span>
            <span>Portfolio</span>
            <span>Contact me</span>
          </div>
          <div className="w-10 h-4 rounded bg-amber-500 flex items-center justify-center text-white text-[6px] font-semibold">
            Hire Me
          </div>
        </div>
        {/* Hero + photo row */}
        <div className="flex flex-1 min-h-0">
          <div className="w-[55%] flex flex-col justify-center p-3">
            <p className="text-white/90 text-[8px]">Hi I am</p>
            <p className="text-white font-semibold text-xs">Mahmood Fazile</p>
            <p className="text-amber-500 font-bold text-sm">UI/UX designer</p>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full border border-white/50" />
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <div className="h-4 px-2 rounded bg-amber-500 text-white text-[6px] flex items-center font-semibold">
                Hire Me
              </div>
              <div className="h-4 px-2 rounded border border-white/50 text-white/80 text-[6px] flex items-center">
                Download CV
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end pr-2 relative">
            <div className="w-20 h-20 rounded-full bg-[#2a2a2a] border-2 border-white/10 flex items-center justify-center overflow-hidden">
              <div className="w-12 h-14 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="flex border-t border-white/10">
          <div className="flex-1 px-2 py-2 text-center">
            <p className="text-amber-500 font-bold text-xs">5+</p>
            <p className="text-white/70 text-[7px]">Experiences</p>
          </div>
          <div className="flex-1 px-2 py-2 text-center border-x border-white/10">
            <p className="text-amber-500 font-bold text-xs">20+</p>
            <p className="text-white/70 text-[7px]">Project done</p>
          </div>
          <div className="flex-1 px-2 py-2 text-center">
            <p className="text-amber-500 font-bold text-xs">80+</p>
            <p className="text-white/70 text-[7px]">Happy Clients</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <p className="text-white font-medium text-sm">Mahmood-style dark</p>
        <p className="text-zinc-400 text-xs mt-0.5">Dark theme, orange accents, circular photo, stats bar</p>
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

  const handleSelectDesign = (designId) => {
    localStorage.setItem("selectedDesignTemplate", designId);
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
            lineCount={10}
            lineDistance={5}
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
            <SplitScreenDesignPreview onSelect={handleSelectDesign} />
            <SteveDesignPreview onSelect={handleSelectDesign} />
            <MahmoodDesignPreview onSelect={handleSelectDesign} />
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
