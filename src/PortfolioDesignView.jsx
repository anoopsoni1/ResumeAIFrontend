import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, Mail, Phone, Download, ChevronRight, Linkedin, Lock, ArrowUpRight, Upload, FolderOpen } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import PortfolioHTMLDownload from "./Download";
import { getResumeContentForView } from "./utils/detailApi.js";
import { useToast } from "./context/ToastContext";

import { API_BASE } from "./config.js";

/** Placeholder data so logged-out users can still view portfolio template */
const PLACEHOLDER_PORTFOLIO_DATA = {
  name: "Your Name",
  role: "Your Role / Title",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: [],
  experience: [],
  education: "",
  projects: [],
  languageProficiency: "",
  email: "email@example.com",
  phone: "+1 234 567 8900",
  location: "",
  website: "",
  linkedin: "",
};

const NAV_LINKS = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#experience", label: "Experience" },
  { to: "#projects", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

const NAV_LINKS_P2 = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#portfolio", label: "Project" },
  { to: "#contact", label: "Contact" },
];

const NAV_LINKS_P3 = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#portfolio", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

function getLayoutType(template) {
  const n = (template?.name || "").toLowerCase();
  if (n.includes("portfolio 3") || n.includes("portfolio3")) return "portfolio3";
  if (n.includes("portfolio 2") || n.includes("portfolio2")) return "portfolio2";
  return "portfolio1";
}

/** Framer Motion variants for scroll & stagger */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
};
const fadeInView = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const cardHover = { scale: 1.02, y: -4 };
const buttonTap = { scale: 0.98 };

/** Portfolio 2: Dark teal/cyan theme — hero with glowing avatar, full sections, GSAP + motion. */
function Portfolio2Layout({ data }) {
  const rootRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroAvatarRef = useRef(null);
  const name = data?.name || "Your Name";
  const role = data?.role || "Frontend Developer";
  const summary = data?.summary || "Passionate about creating beautiful, responsive websites and exceptional user experiences. Specialized in modern web technologies including React, Vue.js, and advanced CSS frameworks.";
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const email = data?.email || "";
  const phone = data?.phone || "";
  const linkedin = data?.linkedin || "";
  const website = data?.website || "";
  const firstName = name.split(/\s+/)[0] || name;
  const displayName = name.trim() || "Your Name";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "Y";
  const contactHref = email ? `mailto:${email}` : "#contact";

  const socials = [
    { href: linkedin || "#", icon: Linkedin, label: "LinkedIn" },
    { href: website ? (website.startsWith("http") ? website : `https://${website}`) : "#", icon: ArrowUpRight, label: "Website" },
    { href: email ? `mailto:${email}` : "#", icon: Mail, label: "Email" },
    { href: phone ? `tel:${phone}` : "#", icon: Phone, label: "Phone" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroLeftRef.current) {
        const els = heroLeftRef.current.querySelectorAll(".p2-hero-item");
        gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", delay: 0.2 });
      }
      if (heroAvatarRef.current) {
        gsap.fromTo(heroAvatarRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.2)", delay: 0.3 });
        gsap.to(heroAvatarRef.current, { scale: 1.03, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
      gsap.utils.toArray(".p2-section").forEach((section) => {
        gsap.fromTo(section, { opacity: 0, y: 70 }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
        });
        const cards = section.querySelectorAll(".p2-skill-card, .p2-project-card");
        if (cards.length) {
          gsap.fromTo(cards, { opacity: 0, y: 30 }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
          });
        }
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Portfolio 2 background: grid + cyan orbs + noise */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(34,211,238,0.12)_0%,transparent_50%)]" />
        <motion.div className="deploy-bg-orb absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px]" animate={{ x: [0, 30, 0], opacity: [0.12, 0.2, 0.12] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="deploy-bg-orb absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px]" animate={{ y: [0, -20, 0], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.a href="#home" className="text-lg font-semibold text-white" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {displayName}
          </motion.a>
          <ul className="hidden sm:flex items-center gap-8">
            {NAV_LINKS_P2.map((item, i) => (
              <li key={item.label}>
                <motion.a
                  href={item.to}
                  className={`relative py-2 text-sm font-medium transition-colors hover:text-cyan-400 ${
                    item.to === "#home" ? "text-cyan-400" : "text-white/90"
                  }`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                >
                  {item.label}
                  {item.to === "#home" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" style={{ boxShadow: "0 0 12px rgba(34,211,238,0.6)" }} />
                  )}
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div ref={heroLeftRef} className="flex-1 order-2 lg:order-1">
          <p className="p2-hero-item text-cyan-400 text-sm font-medium tracking-wide mb-2">HI, Myself</p>
          <h1 className="p2-hero-item text-4xl sm:text-5xl md:text-6xl font-bold text-cyan-400 mb-2">{firstName}</h1>
          <p className="p2-hero-item text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">And I&apos;m a {role}</p>
          <p className="p2-hero-item text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mb-8">{summary}</p>
          <div className="p2-hero-item flex gap-4 mb-8">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cyan-400/80 text-white/90 transition-colors duration-300 hover:border-cyan-400 hover:text-cyan-400"
                style={{ boxShadow: "0 0 20px rgba(34,211,238,0.2)" }}
                aria-label={s.label}
                whileHover={{ scale: 1.15, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
                whileTap={buttonTap}
              >
                <s.icon size={20} />
              </motion.a>
            ))}
          </div>
          <motion.a
            href="#about"
            className="p2-hero-item inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonTap}
          >
            Read more
          </motion.a>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2">
          <div
            ref={heroAvatarRef}
            className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-cyan-400/90"
            style={{ boxShadow: "0 0 40px rgba(34,211,238,0.4), 0 0 80px rgba(34,211,238,0.2)" }}
          >
            {data?.avatar || data?.profileImage ? (
              <img src={data.avatar || data.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-5xl sm:text-6xl font-bold text-white/40">
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="p2-section relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            About <span className="text-cyan-400">me</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">{summary}</p>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="p2-section relative py-20 sm:py-28 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
            Skil<span className="text-cyan-400">ls</span>
          </h2>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {(skills.length ? skills : ["Web Development", "UI/UX Design", "Responsive Design"]).slice(0, 6).map((skill, i) => (
              <motion.div
                key={i}
                className="p2-skill-card rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-400/50 transition-colors duration-300 overflow-hidden"
                variants={fadeInView}
                whileHover={cardHover}
                whileTap={buttonTap}
              >
                <p className="text-white font-medium">{typeof skill === "string" ? skill : String(skill)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project (projects) */}
      <section id="portfolio" className="p2-section relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <FolderOpen size={28} className="shrink-0 text-cyan-400" />
            Proj<span className="text-cyan-400">ect</span>
          </h2>
          <motion.div className="grid sm:grid-cols-2 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {(projects.length ? projects : ["Project One", "Project Two", "Project Three"]).slice(0, 4).map((project, i) => (
              <motion.div
                key={i}
                className="p2-project-card rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-400/50 transition-colors duration-300 overflow-hidden"
                variants={fadeInView}
                whileHover={cardHover}
                whileTap={buttonTap}
              >
                <p className="text-white/80 text-sm sm:text-base line-clamp-3">{typeof project === "string" ? project : String(project)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="p2-section relative py-20 sm:py-28 bg-white/2 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Cont<span className="text-cyan-400">act</span>
          </h2>
          <p className="text-white/70 mb-10 max-w-xl">
            Have a project in mind or want to connect? Reach out via email or phone.
          </p>
          <motion.div className="flex flex-wrap gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {email && (
              <motion.a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-white hover:bg-cyan-400 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Mail size={18} /> {email}
              </motion.a>
            )}
            {phone && (
              <motion.a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-400/60 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Phone size={18} /> {phone}
              </motion.a>
            )}
            {linkedin && (
              <motion.a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-400/60 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Linkedin size={18} /> LinkedIn
              </motion.a>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <div className="flex gap-6">
            {NAV_LINKS_P2.map(({ to, label }) => (
              <a key={label} href={to} className="hover:text-cyan-400 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Shining first letter of name with circle — hero focal; no 3D model. */
function Portfolio3HeroLetter({ letter }) {
  const letterRef = useRef(null);
  const glowRef = useRef(null);
  const circleRef = useRef(null);
  useEffect(() => {
    if (!letterRef.current || !glowRef.current || !circleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(letterRef.current, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.5)", delay: 0.25 });
      gsap.fromTo(circleRef.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.1, ease: "back.out(1.4)", delay: 0.35 });
      gsap.fromTo(glowRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out", delay: 0.4 });
      gsap.to(glowRef.current, {
        opacity: 0.7,
        scale: 1.15,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, [letter]);
  const firstChar = (letter || "Y").toString().toUpperCase().slice(0, 1);
  return (
    <motion.div className="relative flex items-center justify-center w-full h-full min-h-[320px] lg:min-h-[540px] select-none overflow-hidden" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <div
        ref={glowRef}
        className="absolute w-64 h-64 sm:w-80 sm:h-80 lg:w-md lg:h-112 rounded-full opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />
      <div
        ref={circleRef}
        className="relative flex items-center justify-center w-56 h-56 sm:w-md sm:h-md lg:w-md lg:h-md rounded-full border-[3px] sm:border-4 border-violet-500/80"
        style={{
          boxShadow: "0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.2), inset 0 0 60px rgba(139,92,246,0.08)",
        }}
      >
        <span
          ref={letterRef}
          className="relative text-[8rem] sm:text-[9rem] lg:text-[12rem] xl:text-[14rem] font-black leading-none tracking-tighter"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: "rgba(255,255,255,0.98)",
            textShadow: "0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.5), 0 0 100px rgba(139,92,246,0.3), 0 0 160px rgba(139,92,246,0.15)",
            WebkitTextStroke: "1px rgba(139,92,246,0.3)",
          }}
        >
          {firstChar}
        </span>
      </div>
    </motion.div>
  );
}

function Portfolio3Layout({ data }) {
  const rootRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroSceneContainerRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "Add a short summary. Sign in and add your details to see your own content here.";
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const email = data?.email || "";
  const phone = data?.phone || "";
  const linkedin = data?.linkedin || "";
  const website = data?.website || "";
  const firstName = name.split(/\s+/)[0] || name;
  const displayName = name.trim() || "Your Name";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "Y";
  const contactHref = email ? `mailto:${email}` : "#contact";

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroLeftRef.current) {
        const els = heroLeftRef.current.querySelectorAll(".p3-hero-item");
        gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.2 });
      }
      if (heroSceneContainerRef.current) {
        gsap.fromTo(heroSceneContainerRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.4 });
      }
      gsap.utils.toArray(".p3-section").forEach((section) => {
        gsap.fromTo(section, { opacity: 0, y: 60 }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
        });
        const cards = section.querySelectorAll(".p3-card");
        if (cards.length) {
          gsap.fromTo(cards, { opacity: 0, y: 28 }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
          });
        }
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Portfolio 3 background: mesh gradient + grid + violet orbs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.15)_0%,transparent_50%),radial-gradient(ellipse_80%_50%_at_80%_50%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <motion.div className="deploy-bg-orb absolute top-0 left-1/2 w-[800px] h-[600px] rounded-full bg-violet-600/20 blur-[150px] -translate-x-1/2" animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="deploy-bg-orb absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[120px]" animate={{ x: [0, -40, 0], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.a
            href="#home"
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-violet-500/60 bg-violet-600 text-white text-sm font-bold shadow-lg shadow-violet-600/30" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {(firstName[0] || "Y").toUpperCase()}
            </span>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="text-violet-500">{displayName}</span>
            </span>
          </motion.a>
          <ul className={`absolute sm:relative top-full left-0 right-0 sm:flex items-center gap-6 sm:gap-8 py-4 sm:py-0 bg-black sm:bg-transparent border-b sm:border-0 border-white/10 ${navOpen ? "flex flex-col" : "hidden"}`}>
            {NAV_LINKS_P3.map((item, i) => (
              <li key={item.label}>
                <motion.a
                  href={item.to}
                  onClick={() => setNavOpen(false)}
                  className="block py-2 text-sm font-medium text-white/90 hover:text-violet-500 transition-colors"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
                >
                  {item.label}
                </motion.a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <motion.a
              href={contactHref}
              className="hidden sm:inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-violet-500 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact now
            </motion.a>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              className="sm:hidden flex flex-col gap-1.5 w-9 h-9 justify-center items-center rounded border border-white/20 text-white"
              aria-label="Toggle menu"
            >
              <span className={`w-4 h-0.5 bg-current transition-transform ${navOpen ? "rotate-45 translate-y-1" : ""}`} />
              <span className={`w-4 h-0.5 bg-current transition-opacity ${navOpen ? "opacity-0" : ""}`} />
              <span className={`w-4 h-0.5 bg-current transition-transform ${navOpen ? "-rotate-45 -translate-y-1" : ""}`} />
            </button>
          </div>
        </nav>
      </header>

      <section id="home" className="relative min-h-screen flex flex-col lg:flex-row items-center pt-20 lg:pt-0">
        <div ref={heroLeftRef} className="flex-1 order-2 lg:order-1 max-w-xl mx-auto lg:mx-0 px-4 sm:px-6 lg:pl-14 xl:pl-24 py-14 lg:py-28">
          <p className="p3-hero-item text-violet-500 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3">— {role}</p>
          <h1 className="p3-hero-item text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-5 tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {displayName}
          </h1>
          <p className="p3-hero-item text-white/80 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
            {summary.slice(0, 80)}{summary.length > 80 ? "…" : ""}
          </p>
          <motion.a
            href="#about"
            className="p3-hero-item inline-flex items-center justify-center rounded-lg bg-violet-600 px-7 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 hover:shadow-violet-500/40 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            View portfolio
          </motion.a>
          <div className="absolute bottom-8 left-6 sm:left-14 w-28 h-28 sm:w-36 sm:h-36 bg-violet-500/10 rounded-full blur-3xl" aria-hidden />
        </div>
        <div
          ref={heroSceneContainerRef}
          className="flex-1 order-1 lg:order-2 relative w-full min-h-[50vh] lg:min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-violet-950/20"
        >
          <Portfolio3HeroLetter letter={firstName[0] || name[0]} />
        </div>
      </section>

      <section id="about" className="p3-section relative py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            About <span className="text-violet-500">me</span>
          </h2>
          <p className="text-white/80 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl">{summary}</p>
        </div>
      </section>

      <section id="skills" className="p3-section relative py-20 sm:py-28 bg-white/[0.03] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-10 tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Skil<span className="text-violet-500">ls</span>
          </h2>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
            {(skills.length ? skills : ["Web Development", "UI/UX Design", "Responsive Design"]).map((skill, i) => (
              <motion.div key={i} className="p3-card rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-violet-500/50 hover:bg-white/10 transition-colors duration-300" variants={fadeInView} whileHover={cardHover} whileTap={buttonTap}>
                <p className="text-white font-medium">{typeof skill === "string" ? skill : String(skill)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="portfolio" className="p3-section relative py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight flex items-center gap-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <FolderOpen size={32} className="shrink-0 text-violet-500" />
            Proj<span className="text-violet-500">ects</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base uppercase tracking-widest mb-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What I&apos;ve built
          </p>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            {(projects.length ? projects : ["Project One", "Project Two", "Project Three"]).slice(0, 6).map((project, i) => (
              <motion.div
                key={i}
                className="p3-card group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 hover:border-violet-500/60 hover:bg-white/10 transition-colors duration-300 overflow-hidden"
                variants={fadeInView}
                whileHover={{ ...cardHover, transition: { duration: 0.2 } }}
                whileTap={buttonTap}
              >
                <span
                  className="absolute top-5 right-5 sm:top-6 sm:right-6 text-4xl sm:text-5xl font-black text-white/10 group-hover:text-violet-500/30 transition-colors"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <span className="inline-block text-violet-500 text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Project {i + 1}
                  </span>
                  <p className="text-white/95 text-base sm:text-lg leading-relaxed line-clamp-5 font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {typeof project === "string" ? project : String(project)}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="contact" className="p3-section relative py-20 sm:py-28 bg-white/[0.03] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Cont<span className="text-violet-500">act</span>
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-10 max-w-xl">Have a project in mind or want to connect? Reach out via email or phone.</p>
          <motion.div className="flex flex-wrap gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {email && (
              <motion.a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 hover:shadow-violet-500/30 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Mail size={18} /> {email}
              </motion.a>
            )}
            {phone && (
              <motion.a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-500/60 px-6 py-3.5 text-sm font-medium text-violet-400 hover:bg-violet-500/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Phone size={18} /> {phone}
              </motion.a>
            )}
            {linkedin && (
              <motion.a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-500/60 px-6 py-3.5 text-sm font-medium text-violet-400 hover:bg-violet-500/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Linkedin size={18} /> LinkedIn
              </motion.a>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <div className="flex gap-6">
            {NAV_LINKS_P3.map(({ to, label }) => (
              <a key={label} href={to} className="hover:text-violet-500 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Portfolio 1: Static HTML + Tailwind — semantic sections, clean typography, emerald accent, GSAP. */
function Portfolio1StaticLayout({ data }) {
  const rootRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroRightRef = useRef(null);
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const education = data?.education || "";
  const email = data?.email || "";
  const phone = data?.phone || "";
  const linkedin = data?.linkedin || "";
  const website = data?.website || "";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";
  const firstName = name.split(/\s+/)[0] || "Portfolio";

  const expItems = experience.map((e) => {
    if (typeof e === "string") return { role: e, bullets: [] };
    return { role: e?.role || "", bullets: Array.isArray(e?.bullets) ? e.bullets : [] };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroLeftRef.current) {
        const els = heroLeftRef.current.querySelectorAll(".p1-hero-item");
        gsap.fromTo(els, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.15 });
      }
      if (heroRightRef.current) {
        gsap.fromTo(heroRightRef.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.25 });
      }
      gsap.utils.toArray(".p1-section").forEach((section) => {
        gsap.fromTo(section, { opacity: 0, y: 60 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" },
        });
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-white text-neutral-900 overflow-x-hidden" id="home">
      {/* Portfolio 1 background: soft grid + emerald gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
        <motion.div className="deploy-bg-orb absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-[120px]" animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="deploy-bg-orb absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-teal-400/15 blur-[100px]" animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.a href="#home" className="flex items-center gap-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <motion.span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold" whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
              {firstName[0]?.toUpperCase() || "P"}
            </motion.span>
            <span className="text-lg font-semibold text-black">{firstName}</span>
          </motion.a>
          <nav className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map((item, i) => (
              <motion.a key={item.label} href={item.to} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}>
                {item.label}
              </motion.a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section id="home" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div ref={heroLeftRef}>
              <p className="p1-hero-item inline-block rounded-lg border-2 border-emerald-500 bg-black text-white px-4 py-2 mb-6 text-sm font-medium">
                Hi, I&apos;m {name}
              </p>
              <h1 className="p1-hero-item text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-black tracking-tight leading-tight">
                {role}
              </h1>
              {summary && (
                <p className="p1-hero-item mt-5 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  {summary}
                </p>
              )}
              <div className="p1-hero-item mt-8 flex flex-wrap items-center gap-4">
                <motion.a
                  href={email ? `mailto:${email}` : "#contact"}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-500 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={buttonTap}
                >
                  Get in touch
                  <ChevronRight size={18} className="text-emerald-400" />
                </motion.a>
                <motion.a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-black font-medium hover:underline"
                  whileHover={{ x: 4 }}
                  whileTap={buttonTap}
                >
                  Download CV
                  <Download size={18} />
                </motion.a>
              </div>
              <div className="p1-hero-item mt-10">
                <p className="text-sm text-neutral-500 mb-3">Find me on</p>
                <div className="flex items-center gap-3">
                  {email && (
                    <a href={`mailto:${email}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors" aria-label="Email">
                      <Mail size={18} />
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors" aria-label="Phone">
                      <Phone size={18} />
                    </a>
                  )}
                  <a href={linkedin || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:opacity-90 transition-opacity" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
            <div ref={heroRightRef} className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-14 h-16 border-l-2 border-t-2 border-black rounded-tl-lg" aria-hidden />
                <div className="relative w-56 h-72 sm:w-72 sm:h-96 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {data?.avatar || data?.profileImage ? (
                    <img src={data.avatar || data.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl sm:text-7xl font-bold text-neutral-400 select-none">{initials}</span>
                  )}
                </div>
                <div className="absolute -bottom-6 -right-6 w-40 h-40 sm:w-52 sm:h-52 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-emerald-500/90 -z-10" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="p1-section bg-neutral-50/80 border-y border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>About</motion.h2>
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {summary || "Professional with a focus on delivering results and continuous growth."}
            </p>
            {education && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">Education</h3>
                <p className="text-neutral-700">{education}</p>
              </div>
            )}
          </div>
        </section>

        {skills.length > 0 && (
          <section id="skills" className="p1-section max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }}>Skills</motion.h2>
            <motion.ul className="flex flex-wrap gap-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}>
              {skills.map((skill, i) => (
                <motion.li key={i} variants={fadeUp}>
                  <motion.span className="inline-block rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(16,185,129,0.25)" }} whileTap={buttonTap}>
                    {typeof skill === "string" ? skill : String(skill)}
                  </motion.span>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}

        {expItems.length > 0 && (
          <section id="experience" className="p1-section bg-neutral-50/80 border-y border-neutral-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>Experience</motion.h2>
              <motion.ul className="space-y-10" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
                {expItems.map((item, i) => (
                  <motion.li key={i} className="border-l-2 border-emerald-500 pl-6" variants={fadeInView}>
                    <h3 className="text-lg font-semibold text-black">{item.role}</h3>
                    {item.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-neutral-600 text-sm sm:text-base">
                        {item.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{typeof b === "string" ? b : String(b)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section id="projects" className="p1-section max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-10 flex items-center gap-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <FolderOpen size={28} className="shrink-0 text-emerald-500" /> Projects
            </motion.h2>
            <motion.ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
              {projects.map((project, i) => (
                <motion.li key={i} variants={fadeInView}>
                  <motion.div className="rounded-xl border-2 border-neutral-200 bg-white p-6 hover:border-emerald-500 transition-colors h-full" whileHover={cardHover} whileTap={buttonTap}>
                    <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                      {typeof project === "string" ? project : String(project)}
                    </p>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}

        <section id="contact" className="p1-section bg-neutral-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <motion.h2 className="text-2xl sm:text-3xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>Let&apos;s work together</motion.h2>
            <motion.p className="text-neutral-300 max-w-xl mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}>
              Have a project in mind or want to connect? Reach out via email or phone.
            </motion.p>
            <motion.div className="flex flex-wrap gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {email && (
                <motion.a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-600 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <Mail size={18} />
                  {email}
                </motion.a>
              )}
              {phone && (
                <motion.a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <Phone size={18} />
                  {phone}
                </motion.a>
              )}
              {website && (
                <motion.a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <ArrowUpRight size={18} />
                  Website
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <a key={label} href={to} className="hover:text-black transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const FULL_HTML_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:system-ui,sans-serif;}
    .p2-skill-card,.p2-project-card,.p3-card,.p1-section .rounded-xl{transition:transform 0.25s ease,box-shadow 0.25s ease;}
    .p2-skill-card:hover,.p2-project-card:hover,.p3-card:hover,.p1-section .rounded-xl:hover{transform:translateY(-4px);box-shadow:0 12px 24px -8px rgba(0,0,0,0.12);}
    a[href^="mailto:"],a[href^="https"],button{transition:transform 0.2s ease,opacity 0.2s ease;}
    a[href^="mailto:"]:hover,a[href^="https"]:hover,button:hover{transform:scale(1.02);opacity:0.95;}
  </style> 
</head>
<body class="bg-white text-neutral-900">
  <div class="min-h-screen">`;

const FULL_HTML_TAIL = `</div>
  <script>
    (function() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);
      var heroItems = document.querySelectorAll(".p1-hero-item, .p2-hero-item, .p3-hero-item");
      gsap.fromTo(heroItems, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.2 });
      var sections = document.querySelectorAll(".p1-section, .p2-section, .p3-section");
      sections.forEach(function(section) {
        gsap.fromTo(section, { opacity: 0, y: 50 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" }
        });
        var cards = section.querySelectorAll(".p2-skill-card, .p2-project-card, .p3-card");
        if (cards.length) {
          gsap.fromTo(cards, { opacity: 0, y: 24 }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" }
          });
        }
      });
      var avatar = document.querySelector("[class*='rounded-full'][class*='border-']");
      if (avatar && (avatar.classList.contains("border-cyan") || avatar.classList.contains("border-violet"))) {
        gsap.fromTo(avatar, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.2)", delay: 0.3 });
      }
      var orbs = document.querySelectorAll(".deploy-bg-orb");
      orbs.forEach(function(orb, i) {
        var d = 8 + (i % 5);
        gsap.fromTo(orb, { opacity: 0.1, scale: 1, x: 0, y: 0 }, {
          opacity: 0.22,
          scale: 1.08,
          x: i % 2 === 0 ? 25 : -20,
          y: i % 3 === 0 ? -15 : 12,
          duration: d,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%"
        });
      });
    })();
  </script>
</body></html>`;

export default function PortfolioDesignView() {
  const { id } = useParams();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const portfolioContentRef = useRef(null);
  const toast = useToast();

  const handleDeploy = async () => {
    if (!portfolioContentRef.current) return;
    setDeploying(true);
    try {
      const content = portfolioContentRef.current.innerHTML;
      const htmlContent = FULL_HTML_HEAD + content + FULL_HTML_TAIL;
      const accessToken = localStorage.getItem("accessToken");
      const { data: res } = await axios.post(
        `${API_BASE}/deploy-portfolio`,
        { htmlContent },
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      const message = res?.message || "Portfolio deployed. View link on Dashboard.";
      toast.success(message);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No template ID");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await axios.get(`${API_BASE}/templates/${id}`);
        if (!cancelled && res?.success && res?.data) setTemplate(res.data);
        else if (!cancelled) setError("Template not found");
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "Failed to load template");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      const content = await getResumeContentForView();
      if (!cancelled) {
        setData(content);
        setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displayData = data || PLACEHOLDER_PORTFOLIO_DATA;
  const isPlaceholder = !data;

  if (loading || detailLoading) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-neutral-500">Loading…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 sm:p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Project is premium</h1>
            <p className="text-neutral-600 text-sm sm:text-base mb-6">
              Upgrade to view and use project templates.
            </p>
            <Link
              to="/price"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-500 transition-all"
            >
              <Lock className="h-4 w-4" /> Upgrade to unlock
            </Link>
          </div>
          <Link to="/templates/design" className="mt-6 text-neutral-500 hover:text-neutral-700 text-sm">
            <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to template type
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-amber-600">{error || "Template not found"}</p>
          <Link
            to="/templates/portfoliodesign"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft size={18} /> Back to project designs
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  const layout = getLayoutType(template);
  const isPortfolio2 = layout === "portfolio2";
  const isPortfolio3 = layout === "portfolio3";

  return (
    <div className={`min-h-screen flex flex-col ${isPortfolio3 ? "bg-black text-white" : isPortfolio2 ? "bg-[#050508] text-white" : "bg-white text-neutral-900"}`} id="home">
      {isPlaceholder && (
        <div className="print:hidden bg-amber-500/20 border-b border-amber-400/30 px-3 sm:px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-800">
              Viewing with sample data. Sign in to use your own details and save your project.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg border border-amber-600/50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="print:hidden fixed top-4 right-4 z-30 flex items-center gap-2">
        <Link
          to="/templates/portfoliodesign"
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            isPortfolio3 ? "text-white/80 hover:text-violet-400" : isPortfolio2 ? "text-white/80 hover:text-cyan-400" : "text-neutral-600 hover:text-black"
          }`}
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <button
          type="button"
          onClick={handleDeploy}
          disabled={deploying}
          className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
            isPortfolio3
              ? "border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
              : isPortfolio2
                ? "border-cyan-400 bg-cyan-600 text-white hover:bg-cyan-500"
                : "border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
          }`}
        >
          <Upload size={14} /> {deploying ? "Deploying…" : "Deploy to Vercel"}
        </button>
      </div>

      <PortfolioHTMLDownload showDownloadHeader={false} portfolioRef={portfolioContentRef}>
        {isPortfolio3 ? (
          <Portfolio3Layout data={displayData} />
        ) : isPortfolio2 ? (
          <Portfolio2Layout data={displayData} />
        ) : (
          <Portfolio1StaticLayout data={displayData} />
        )}
      </PortfolioHTMLDownload>
    </div>
  );
}
