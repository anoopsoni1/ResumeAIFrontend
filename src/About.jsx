import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "./Lighting.jsx";
import { FiTarget, FiZap, FiGlobe } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";
import { ArrowRight, Sparkles, Award } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };

const FEATURES = [
  {
    icon: FiTarget,
    title: "ATS-Optimized",
    desc: "Resumes built to pass applicant tracking systems and get seen by recruiters.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: MdAutoAwesome,
    title: "AI-Powered",
    desc: "Smart suggestions and optimizations to highlight your best strengths.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: FiZap,
    title: "Fast & Simple",
    desc: "Create and update your resume in minutes, not hours.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: FiGlobe,
    title: "Project Ready",
    desc: "Build a professional online presence that complements your resume.",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
];

function Topbar() {
  return <AppHeader />;
}

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
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
      <div className="absolute inset-0 z-1 bg-linear-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 py-12 sm:py-16 px-4">
          <div className="w-full max-w-5xl mx-auto">
            {/* Hero */}
            <motion.div
              className="text-center mb-14 sm:mb-20"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-linear-to-r from-amber-500/10 to-transparent px-4 py-1.5 text-amber-400 text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Sparkles className="w-4 h-4" /> Built for job seekers
              </motion.span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                About <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Intervexa</span>
              </h1>
              <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                We help job seekers land more interviews with AI-optimized resumes
                that pass ATS filters and impress hiring managers.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl p-6 sm:p-8 lg:p-10 mb-12"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Award className="w-4 h-4" />
                </span>
                Our Mission
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
                Intervexa was built to level the playing field. Applicant tracking
                systems reject countless qualified candidates before a human ever
                sees their resume. We combine AI analysis, ATS scoring, and
                professional templates so you can create a resume that gets past
                the bots and into the hands of recruiters.
              </p>
            </motion.div>

            {/* Features grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-14"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
            >
              {FEATURES.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="group rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl p-6 sm:p-7 hover:border-white/20 hover:bg-white/8 transition-all duration-300"
                  whileHover={{ y: -6 }}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient} ${item.iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-slate-400 text-sm sm:text-base mb-6">
                Ready to build a resume that gets noticed?
              </p>
              <Link to="/upload">
                <motion.span
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-4 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
