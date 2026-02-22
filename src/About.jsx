import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import { FiTarget, FiZap, FiGlobe } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <AppHeader onLogout={handleLogout} />;
}

export default function About() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const features = [
    {
      icon: <FiTarget className="text-2xl text-amber-500" />,
      title: "ATS-Optimized",
      desc: "Resumes built to pass applicant tracking systems and get seen by recruiters.",
    },
    {
      icon: <MdAutoAwesome className="text-2xl text-amber-500" />,
      title: "AI-Powered",
      desc: "Smart suggestions and optimizations to highlight your best strengths.",
    },
    {
      icon: <FiZap className="text-2xl text-amber-500" />,
      title: "Fast & Simple",
      desc: "Create and update your resume in minutes, not hours.",
    },
    {
      icon: <FiGlobe className="text-2xl text-amber-500" />,
      title: "Portfolio Ready",
      desc: "Build a professional online presence that complements your resume.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background — same as Dashboard / Contact */}
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
            interactive={true}
            parallax={true}
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 py-8 px-4">
          <div className="mx-auto ">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                About <span className="text-amber-500">Resume AI</span>
              </h1>
              <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
                We help job seekers land more interviews with AI-optimized resumes
                that pass ATS filters and impress hiring managers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Resume AI was built to level the playing field. Applicant tracking
                systems reject countless qualified candidates before a human ever
                sees their resume. We combine AI analysis, ATS scoring, and
                professional templates so you can create a resume that gets past
                the bots and into the hands of recruiters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/50 bg-black/60 p-5 hover:border-amber-500/50 transition"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
