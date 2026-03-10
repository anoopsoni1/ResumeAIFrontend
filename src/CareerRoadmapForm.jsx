import React, { useState } from "react";

const EXPERIENCE_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function CareerRoadmapForm({ onSubmit, loading }) {
  const [careerGoal, setCareerGoal] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [months, setMonths] = useState(6);

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      careerGoal: careerGoal.trim(),
      skills,
      experience,
      months: Number(months) || 6,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-6 hover:border-amber-500/30 transition-colors duration-200"
    >
      <h2 className="text-lg font-semibold text-white mb-4">
        Your career inputs
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="careerGoal"
            className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-1"
          >
            Career goal
          </label>
          <input
            id="careerGoal"
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. AI Engineer, Data Scientist"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-1"
          >
            Current skills (comma separated)
          </label>
          <input
            id="skills"
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Python, HTML, JavaScript"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-1"
          >
            Experience level
          </label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className={inputClass}
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="months"
            className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-1"
          >
            Time available (months)
          </label>
          <input
            id="months"
            type="number"
            min={1}
            max={24}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) || 6)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !careerGoal.trim()}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? "Generating roadmap…" : "Generate Roadmap"}
      </button>
    </form>
  );
}
