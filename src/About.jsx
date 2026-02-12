import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaFileMedical } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaHome, FaSignInAlt, FaUser } from "react-icons/fa";
import { GrDocumentUpload } from "react-icons/gr";
import { IoMdContacts } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { FiTarget, FiZap, FiGlobe } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

function Topbar() {
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-black">
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
            <FaFileMedical className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">RESUME AI</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-white">
          {[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/price", label: "Price" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                isActive ? "text-orange-500 font-semibold" : "hover:text-orange-500"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {size.width < 768 ? (
          <>
            {open && (
              <div className="absolute right-0 top-0 w-full bg-black rounded-2xl shadow-xl z-10">
                <ul className="py-2 text-white">
                  <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-700 h-9 w-9 place-items-center p-3 rounded-full flex text-white">
                        <FaFileMedical />
                      </div>
                      <span className="text-white text-lg font-semibold">RESUME AI</span>
                    </div>
                    <div onClick={() => setOpen(false)} className="text-2xl cursor-pointer">
                      <RxCross2 color="red" size={30} />
                    </div>
                  </li>
                  <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition">
                    <FaHome /> Home
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition">
                    <FaUser /> Dashboard
                  </Link>
                  <Link to="/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition">
                    <GrDocumentUpload /> Upload Resume
                  </Link>
                  <Link to="/contact" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition">
                    <IoMdContacts /> Contact Us
                  </Link>
                  <Link to="/about" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition">
                    <FaBook /> About Us
                  </Link>
                  {user ? (
                    <Link onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 cursor-pointer transition">
                      <FaSignInAlt /> Logout
                    </Link>
                  ) : (
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-blue-400 cursor-pointer transition">
                      <FaSignInAlt /> Login
                    </Link>
                  )}
                </ul>
              </div>
            )}
            <div className="flex gap-3 text-zinc-200" onClick={() => setOpen(!open)}>
              <IoReorderThreeOutline size={40} />
            </div>
          </>
        ) : (
          <>
            {user ? (
              <Link onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 cursor-pointer transition">
                <FaSignInAlt /> Logout
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-blue-400 cursor-pointer transition">
                <FaSignInAlt /> Login
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
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
            lineCount={10}
            lineDistance={5}
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
          <div className="mx-auto max-w-4xl">
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

        <footer className="bg-black/70 text-white py-5 mt-auto">
          <div className="mx-auto px-4 text-center text-sm">
            © 2025 ResumeAI. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
