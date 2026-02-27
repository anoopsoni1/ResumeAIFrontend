import React, { useMemo, useState, useEffect } from "react";
import { useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Phone, Download, Sparkles } from "lucide-react";
import { clearUser } from "./slice/user.slice";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import PortfolioHTMLDownload from "./Download";
import LightPillar from "./LiquidEther.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";



function parseResume(text = "") {
  if (!text.trim()) return null;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const name = lines[0] || "Your Name";
  const role = lines[1] || "Your Role";

  const summary = text.match(/SUMMARY([\s\S]*?)SKILLS/i)?.[1] || "";
  const skills = text.match(/SKILLS([\s\S]*?)(?=WORK\s+EXPERIENCE|EXPERIENCE|PROJECTS|EDUCATION|$)/i)?.[1] || "";
  // Match "EXPERIENCE", "WORK EXPERIENCE", or "PROFESSIONAL EXPERIENCE" and capture content until PROJECTS/EDUCATION
  let experienceRaw =
    text.match(/(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE)\s*:?\s*([\s\S]*?)(?=PROJECTS|EDUCATION|$)/i)?.[1]?.trim() || "";
  // Fallback: when resume has no EXPERIENCE header, use content between SKILLS and PROJECTS as experience
  if (!experienceRaw && !/EXPERIENCE/i.test(text) && /PROJECTS/i.test(text)) {
    const between = text.match(/SKILLS[\s\S]*?\n\n?([\s\S]*?)\n\s*PROJECTS/i)?.[1]?.trim();
    if (between && between.length > 20) experienceRaw = between;
  }
  const projectsRaw = text.match(/PROJECTS([\s\S]*?)EDUCATION/i)?.[1] || "";
  // Education: content until end or until Language section
  const education = text.match(
    /EDUCATION([\s\S]*?)(?=LANGUAGE\s*PROFICIENCY|LANGUAGES|LANGUAGE\s*SKILLS|$)/i
  )?.[1] || "";
  // Language proficiency: separate section (LANGUAGES / LANGUAGE PROFICIENCY / LANGUAGE SKILLS)
  const languageProficiency =
    text.match(/(?:LANGUAGE\s*PROFICIENCY|LANGUAGES|LANGUAGE\s*SKILLS)\s*:?\s*([\s\S]*)$/i)?.[1]?.trim() || "";

  const email = text.match(/[\w.+-]+@[\w-]+\.\w+/)?.[0] || "";
  const phone = text.match(/\b\d{10}\b/)?.[0] || "";

  const stripAsterisks = (s) => (s || "").replace(/\*/g, "").trim();

  // Parse into list of experience entries (blocks separated by blank lines; keep role + bullets as one entry)
  const experience = experienceRaw
    .split(/\n\s*\n+/)
    .map((block) => stripAsterisks(block))
    .filter(Boolean);

  // Parse into list of projects only (blocks separated by blank lines); exclude SKILLS and EXPERIENCE blocks
  const isSkillsOrExperienceBlock = (block) => {
    const firstLine = block.split("\n")[0]?.trim().replace(/\*/g, "").toUpperCase() || "";
    return (
      firstLine === "SKILLS" ||
      firstLine.startsWith("EXPERIENCE") ||
      firstLine === "WORK EXPERIENCE" ||
      firstLine === "PROFESSIONAL EXPERIENCE"
    );
  };
  // Remove leading dots/bullets (•, -, *, .) from each line in project blocks
  const stripProjectDots = (block) =>
    block
      .split("\n")
      .map((line) => line.replace(/^\s*[•\-*.]\s*/, "").trim())
      .join("\n");

  const projects = projectsRaw
    .split(/\n\s*\n/)
    .map((block) => stripAsterisks(block))
    .map(stripProjectDots)
    .filter(Boolean)
    .filter((block) => !isSkillsOrExperienceBlock(block));

  // If language is embedded inside education (e.g. "Language Proficiency: ..."), split it out
  let educationOnly = stripAsterisks(education);
  let languageOnly = languageProficiency ? stripAsterisks(languageProficiency) : "";
  const langInEducation = educationOnly.match(
    /\n\s*(?:Language\s*Proficiency|Languages?|LANGUAGE\s*PROFICIENCY|LANGUAGES?)\s*:?\s*([\s\S]*)/i
  );
  if (langInEducation) {
    languageOnly = stripAsterisks(langInEducation[1]) || languageOnly;
    educationOnly = educationOnly.replace(
      /\n\s*(?:Language\s*Proficiency|Languages?|LANGUAGE\s*PROFICIENCY|LANGUAGES?)\s*:?\s*[\s\S]*/i,
      ""
    ).trim();
  }

  return {
    name: stripAsterisks(name),
    role: stripAsterisks(role),
    summary: stripAsterisks(summary),
    skills: skills
      .split(/\n|,/)
      .map((s) => s.replace(/[-•*]/g, "").trim())
      .filter(Boolean)
      .filter((s) => s.toLowerCase() !== "frontend"),
    experience,
    projects,
    education: educationOnly,
    languageProficiency: languageOnly,
    email,
    phone,
    raw: text,
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  hidden: {},
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.4, type: "spring", stiffness: 200 },
  }),
};

export default function DynamicPortfolio() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resumeText =
    localStorage.getItem("EditedResumeText") ||
    localStorage.getItem("extractedtext") ||
    "";

  const data = useMemo(() => parseResume(resumeText), [resumeText]);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  if (!data) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07070c]">
        {size.width >= 768 && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
          </div>
        )}
      <div className="relative z-10 min-h-screen bg-[#07070c] text-white flex flex-col">
        <AppHeader onLogout={handleLogout} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center px-6"
        >
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 mb-5">
              <Sparkles className="text-indigo-400" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">No portfolio yet</h2>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-slate-500 text-sm"
            >
              Upload a resume to generate your portfolio
            </motion.p>
          </div>
        </motion.div>
        <AppFooter />
      </div>
      </div>
    );
  }

  return (
    <PortfolioHTMLDownload>
      <div className="min-h-screen bg-[#07070c] text-white overflow-hidden relative">
        {size.width >= 768 && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
          </div>
        )}
        {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(34,211,238,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_0%_70%,rgba(139,92,246,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        <motion.div
          className="absolute w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[100px] -top-32 -left-32"
          animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[320px] h-[320px] rounded-full bg-cyan-500/5 blur-[80px] top-1/2 -right-20"
          animate={{ x: [0, -30, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AppHeader onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* HERO */}
        <motion.div
          className="relative text-center mb-20 sm:mb-28"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="relative rounded-3xl border border-white/8 bg-linear-to-b from-white/6 to-transparent backdrop-blur-sm px-6 sm:px-10 py-12 sm:py-16">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles size={12} className="text-amber-400" />
              Portfolio
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-slate-100 to-slate-400">
                {data.name}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-2 text-lg sm:text-xl text-indigo-300 font-medium"
            >
              {data.role}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex justify-center gap-3 sm:gap-4 flex-wrap"
            >
              {data.phone && (
                <motion.a
                  href={`tel:${data.phone}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-400/40 hover:bg-white/8 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone size={17} className="text-indigo-400" /> {data.phone}
                </motion.a>
              )}
              {data.email && (
                <motion.a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-400/40 hover:bg-white/8 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail size={17} className="text-indigo-400" /> {data.email}
                </motion.a>
              )}
            </motion.div>

         
          </div>
        </motion.div>

        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-16" aria-hidden />

        {/* SUMMARY */}
        {data.summary && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Summary
            </h2>
            <motion.div
                    className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 sm:p-8 text-slate-300 leading-relaxed text-[15px] border-l-4 border-l-indigo-500/70 shadow-lg shadow-black/20 hover:border-white/12 transition-colors"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {data.summary}
            </motion.div>
          </motion.section>
        )}

        {/* SKILLS */}
        {data.skills.length > 0 && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Skills
            </h2>
            <motion.div
              className="flex flex-wrap gap-2.5"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {data.skills.map((skill, i) => (
                <motion.span
                  key={i}
                  variants={scaleIn}
                  custom={i}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/8 hover:border-indigo-400/50 hover:bg-indigo-500/10 cursor-default select-none transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* EXPERIENCE */}
        {data.experience?.length > 0 && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Experience
            </h2>
            <div className="flex flex-col gap-4">
              {data.experience.map((entry, i) => {
                const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                const roleTitle = lines[0] || "Role";
                const bullets = lines.slice(1);
                return (
                  <motion.div
                    key={i}
                    className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 sm:p-6 overflow-hidden border-l-4 border-l-indigo-500/70 shadow-lg shadow-black/20 hover:border-white/12 transition-colors"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.04 * i, duration: 0.4 }}
                  >
                    <h3 className="text-base font-semibold text-white mb-3">{roleTitle}</h3>
                    {bullets.length > 0 ? (
                      <ul className="text-slate-300 text-[15px] leading-relaxed space-y-2.5 list-none m-0">
                        {bullets.map((bullet, j) => (
                          <li key={j} className="flex gap-2.5">
                            <span className="text-indigo-400 mt-1 shrink-0">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-slate-300 whitespace-pre-wrap font-sans text-[15px] leading-relaxed m-0">
                        {entry}
                      </pre>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* PROJECTS */}
        {data.projects?.length > 0 && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Projects
            </h2>
            <div className="flex flex-col gap-4">
              {data.projects.map((project, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 sm:p-6 overflow-hidden border-l-4 border-l-indigo-500/70 shadow-lg shadow-black/20 hover:border-white/12 transition-colors"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.04 * i, duration: 0.4 }}
                >
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-[15px] leading-relaxed m-0">
                    {project}
                  </pre>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* EDUCATION */}
        {data.education && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Education
            </h2>
            <motion.div
              className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 sm:p-6 border-l-4 border-l-indigo-500/70 shadow-lg shadow-black/20 hover:border-white/12 transition-colors"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                {data.education}
              </p>
            </motion.div>
          </motion.section>
        )}

        {/* LANGUAGE PROFICIENCY */}
        {data.languageProficiency && (
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-5">
              <span className="h-px w-8 bg-indigo-500/70 rounded-full" />
              Language Proficiency
            </h2>
            <motion.div
                className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 sm:p-6 border-l-4 border-l-indigo-500/70 shadow-lg shadow-black/20 hover:border-white/12 transition-colors"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                {data.languageProficiency}
              </p>
            </motion.div>
          </motion.section>
        )}
      </div>

      <AppFooter />
      </div>
    </PortfolioHTMLDownload>
  );
}
