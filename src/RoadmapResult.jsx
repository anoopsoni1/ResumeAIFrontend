import React from "react";
import { motion } from "framer-motion";
import { FiLayers, FiCode, FiAlertCircle, FiBook, FiExternalLink, FiClock } from "react-icons/fi";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getDifficultyColor(diff) {
  const d = (diff || "").toLowerCase();
  if (d.includes("beginner") || d.includes("easy")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  if (d.includes("intermediate") || d.includes("medium")) return "bg-amber-500/20 text-amber-400 border-amber-500/40";
  if (d.includes("advanced") || d.includes("hard")) return "bg-rose-500/20 text-rose-400 border-rose-500/40";
  return "bg-slate-500/20 text-slate-400 border-slate-500/40";
}

export default function RoadmapResult({ data }) {
  if (!data) return null;

  const {
    phases = [],
    projects = [],
    missingSkills = [],
    learningResources = [],
  } = data;

  const sectionWrap = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-amber-500/30 transition-all duration-300";
  const sectionHeader = "flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5";
  const iconBox = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400";

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Learning Phases — Timeline */}
      {phases.length > 0 && (
        <motion.section variants={item} className={sectionWrap}>
          <div className={sectionHeader}>
            <div className={iconBox}>
              <FiLayers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Learning phases</h3>
              <p className="text-xs text-slate-400 mt-0.5">{phases.length} phases · Follow in order</p>
            </div>
          </div>
          <div className="p-6 pt-4">
            <ul className="relative space-y-0">
              {/* Timeline line */}
              <div
                className="absolute left-5 top-6 bottom-6 w-px bg-linear-to-b from-amber-500/50 via-amber-500/30 to-transparent"
                aria-hidden
              />
              {phases.map((phase, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border-2 border-amber-500/50 text-sm font-bold text-amber-300">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/20 p-4 hover:border-amber-500/20 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{phase.title}</h4>
                      {phase.duration && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-400">
                          <FiClock className="w-3 h-3" />
                          {phase.duration}
                        </span>
                      )}
                    </div>
                    {phase.description && (
                      <p className="text-slate-400 text-sm leading-relaxed mt-1">{phase.description}</p>
                    )}
                    {Array.isArray(phase.skills) && phase.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {phase.skills.map((skill, j) => (
                          <span
                            key={j}
                            className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300/90 border border-amber-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* Projects to build */}
      {projects.length > 0 && (
        <motion.section variants={item} className={sectionWrap}>
          <div className={sectionHeader}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
              <FiCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Projects to build</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hands-on projects for your portfolio</p>
            </div>
          </div>
          <div className="p-6 pt-4">
            <ul className="grid gap-4 sm:grid-cols-1">
              {projects.map((project, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-emerald-500/30 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-semibold text-white group-hover:text-emerald-50/90 transition-colors">
                      {project.title}
                    </h4>
                    {project.difficulty && (
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getDifficultyColor(
                          project.difficulty
                        )}`}
                      >
                        {project.difficulty}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{project.description}</p>
                  )}
                  {Array.isArray(project.skills) && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.skills.map((skill, j) => (
                        <span
                          key={j}
                          className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300/90 border border-emerald-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <motion.section variants={item} className={sectionWrap}>
          <div className={sectionHeader}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 text-rose-400">
              <FiAlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Skills to learn</h3>
              <p className="text-xs text-slate-400 mt-0.5">Focus on these to close the gap</p>
            </div>
          </div>
          <div className="p-6 pt-4">
            <ul className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 hover:border-rose-500/40 hover:bg-rose-500/15 transition-all duration-200"
                >
                  {skill}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* Learning resources */}
      {learningResources.length > 0 && (
        <motion.section variants={item} className={sectionWrap}>
          <div className={sectionHeader}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 text-indigo-400">
              <FiBook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Learning resources</h3>
              <p className="text-xs text-slate-400 mt-0.5">Curated links to level up</p>
            </div>
          </div>
          <div className="p-6 pt-4">
            <ul className="space-y-4">
              {learningResources.map((group, i) => (
                <motion.li key={i} variants={item} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {group.skill}
                  </h4>
                  {Array.isArray(group.resources) && group.resources.length > 0 ? (
                    <ul className="space-y-2">
                      {group.resources.map((r, j) => (
                        <li key={j}>
                          <a
                            href={r.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200 transition-all duration-200 group/link"
                          >
                            <FiExternalLink className="w-4 h-4 shrink-0 opacity-70 group-hover/link:opacity-100" />
                            <span className="truncate flex-1">{r.title || "Resource"}</span>
                            {r.type && (
                              <span className="shrink-0 text-xs text-slate-500">({r.type})</span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">No resources listed.</p>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
