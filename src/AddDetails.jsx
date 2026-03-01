import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useToast } from "./context/ToastContext";


const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

function buildResumeText(form) {
  const lines = [];

  lines.push(form.name.trim() || "Your Name");
  lines.push(form.role.trim() || "Your Role");
  lines.push("");

  if (form.summary?.trim()) {
    lines.push("SUMMARY");
    lines.push(form.summary.trim());
    lines.push("");
  }

  if (form.skills?.length) {
    const skillList = form.skills.filter((s) => s?.trim()).join("\n");
    if (skillList) {
      lines.push("SKILLS");
      lines.push(skillList);
      lines.push("");
    }
  }

  if (form.experience?.length) {
    lines.push("EXPERIENCE");
    form.experience.forEach((exp) => {
      if (exp?.role?.trim()) lines.push(exp.role.trim());
      (exp.bullets || []).filter(Boolean).forEach((b) => lines.push(`• ${b.trim()}`));
      lines.push("");
    });
  }

  if (form.projects?.length) {
    const projectTexts = form.projects.filter((p) => p?.trim());
    if (projectTexts.length) {
      lines.push("PROJECTS");
      projectTexts.forEach((p) => {
        lines.push(p.trim());
        lines.push("");
      });
    }
  }

  if (form.education?.trim()) {
    lines.push("EDUCATION");
    lines.push(form.education.trim());
    lines.push("");
  }

  if (form.languageProficiency?.trim()) {
    lines.push("LANGUAGE PROFICIENCY");
    lines.push(form.languageProficiency.trim());
  }

  const text = lines.join("\n");
  const contact = [form.email?.trim(), form.phone?.trim()].filter(Boolean).join(" | ");
  if (contact) {
    return text + (text ? "\n\n" : "") + contact;
  }
  return text;
}

const initialForm = {
  name: "",
  role: "",
  email: "",
  phone: "",
  summary: "",
  skills: [""],
  experience: [{ role: "", bullets: [""] }],
  projects: [""],
  education: "",
  languageProficiency: "",
};

/** Map backend detail (experience as string[]) to form shape */
function detailToForm(d) {
  if (!d) return initialForm;
  const experience = (d.experience && d.experience.length > 0)
    ? d.experience.map((str) => {
        const lines = (str || "").split("\n").map((l) => l.replace(/^\s*[•\-]\s*/, "").trim()).filter(Boolean);
        const role = lines[0] || "";
        const bullets = lines.slice(1).length ? lines.slice(1) : [""];
        return { role, bullets };
      })
    : [{ role: "", bullets: [""] }];
  const skills = Array.isArray(d.skills) && d.skills.length > 0 ? d.skills : [""];
  const projects = Array.isArray(d.projects) && d.projects.length > 0 ? d.projects : [""];
  return {
    name: d.name || "",
    role: d.role || "",
    email: d.email || "",
    phone: d.phone || "",
    summary: d.summary || "",
    skills,
    experience,
    projects,
    education: d.education || "",
    languageProficiency: d.languageProficiency || "",
  };
}

/** Map form to API payload (experience as string[]) */
function formToPayload(form) {
  const experience = (form.experience || [])
    .filter((exp) => (exp?.role || "").trim() || (exp?.bullets || []).some((b) => (b || "").trim()))
    .map((exp) => {
      const role = (exp?.role || "").trim();
      const bullets = (exp?.bullets || []).map((b) => (b || "").trim()).filter(Boolean);
      return role ? [role, ...bullets].join("\n") : bullets.join("\n");
    });
  return {
    name: (form.name || "").trim() || "Your Name",
    role: (form.role || "").trim() || "Your Role",
    email: (form.email || "").trim() || "",
    phone: (form.phone || "").trim() || "",
    summary: (form.summary || "").trim() || "",
    skills: (form.skills || []).map((s) => (s || "").trim()).filter(Boolean),
    experience: experience.length ? experience : [""],
    projects: (form.projects || []).map((p) => (p || "").trim()).filter(Boolean).length
      ? (form.projects || []).map((p) => (p || "").trim())
      : [""],
    education: (form.education || "").trim() || "",
    languageProficiency: (form.languageProficiency || "").trim() || "",
  };
}

export default function AddDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      try {
        const raw = localStorage.getItem("addDetailsForm");
        if (raw) setForm({ ...initialForm, ...JSON.parse(raw) });
      } catch (_) {}
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/get-detail`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data) {
          setForm(detailToForm(json.data));
          setDetailId(json.data._id);
        } else {
          try {
            const raw = localStorage.getItem("addDetailsForm");
            if (raw) setForm({ ...initialForm, ...JSON.parse(raw) });
          } catch (_) {}
        }
      } catch (_) {
        if (!cancelled) {
          try {
            const raw = localStorage.getItem("addDetailsForm");
            if (raw) setForm({ ...initialForm, ...JSON.parse(raw) });
          } catch (_) {}
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => setForm((prev) => ({ ...prev, skills: [...(prev.skills || [""]), ""] }));
  const setSkill = (i, v) =>
    setForm((prev) => {
      const s = [...(prev.skills || [""])];
      s[i] = v;
      return { ...prev, skills: s };
    });
  const removeSkill = (i) =>
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || [""]).filter((_, idx) => idx !== i),
    }));

  const addExperience = () =>
    setForm((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), { role: "", bullets: [""] }],
    }));
  const setExperience = (i, field, value) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      ex[i] = { ...ex[i], [field]: value };
      return { ...prev, experience: ex };
    });
  const setExperienceBullet = (ei, bi, value) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      const bullets = [...(ex[ei]?.bullets || [""])];
      bullets[bi] = value;
      ex[ei] = { ...ex[ei], bullets };
      return { ...prev, experience: ex };
    });
  const addExperienceBullet = (ei) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      ex[ei] = { ...ex[ei], bullets: [...(ex[ei]?.bullets || [""]), ""] };
      return { ...prev, experience: ex };
    });
  const removeExperience = (i) =>
    setForm((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, idx) => idx !== i),
    }));

  const addProject = () =>
    setForm((prev) => ({ ...prev, projects: [...(prev.projects || [""]), ""] }));
  const setProject = (i, v) =>
    setForm((prev) => {
      const p = [...(prev.projects || [""])];
      p[i] = v;
      return { ...prev, projects: p };
    });
  const removeProject = (i) =>
    setForm((prev) => ({
      ...prev,
      projects: (prev.projects || [""]).filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    setApiError(null);
    localStorage.setItem("addDetailsForm", JSON.stringify(form));
    setSaved(true);

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setSaveLoading(true);
    try {
      const payload = formToPayload(form);
      const url = detailId ? `${API_BASE}/update-detail/${detailId}` : `${API_BASE}/create-detail`;
      const method = detailId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data) {
        setDetailId(json.data._id);
        setApiError(null);
      } else {
        setApiError(json?.message || "Failed to save to server");
      }
    } catch (_) {
      setApiError("Failed to save to server");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSave();
    navigate("/templates/design");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/v1/user/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <p className="text-slate-400">Loading your details…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppHeader  onLogout={handleLogout} />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6  mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium"
            >
              <ArrowLeft size={18} /> Back
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Add details for resume or portfolio
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {saveLoading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={saveLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saveLoading ? "Saving…" : "Save & choose template →"}
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Details saved. Use "Save & choose template" to build your resume or portfolio.
          </div>
        )}
        {apiError && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {apiError}
          </div>
        )}

        <div className="space-y-8">
          {/* Personal */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <User size={20} className="text-indigo-400" />
              Personal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Full name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role / Title
                </span>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="Software Engineer"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
            </div>
          </section>

          {/* Summary */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <FileText size={20} className="text-indigo-400" />
              Summary
            </h2>
            <label className="block">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Short professional summary
              </span>
              <textarea
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="A few sentences about your experience and goals..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[100px]"
              />
            </label>
          </section>

          {/* Skills */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Briefcase size={20} className="text-indigo-400" />
                Skills
              </h2>
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add skill
              </button>
            </div>
            <div className="space-y-3">
              {(form.skills || [""]).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => setSkill(i, e.target.value)}
                    placeholder="e.g. JavaScript, React"
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {(form.skills?.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Briefcase size={20} className="text-indigo-400" />
                Experience
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add experience
              </button>
            </div>
            <div className="space-y-6">
              {(form.experience || []).map((exp, ei) => (
                <div
                  key={ei}
                  className="rounded-xl border border-white/5 bg-black/30 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exp.role || ""}
                      onChange={(e) => setExperience(ei, "role", e.target.value)}
                      placeholder="Job title, Company · Period"
                      className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {(form.experience?.length > 1) && (
                      <button
                        type="button"
                        onClick={() => removeExperience(ei)}
                        className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400"
                        aria-label="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 pl-0 sm:pl-2">
                    {(exp.bullets || [""]).map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => setExperienceBullet(ei, bi, e.target.value)}
                          placeholder="• Achievement or responsibility"
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {(exp.bullets?.length > 1) && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => {
                                const ex = [...(prev.experience || [])];
                                ex[ei] = {
                                  ...ex[ei],
                                  bullets: (ex[ei]?.bullets || []).filter((_, i) => i !== bi),
                                };
                                return { ...prev, experience: ex };
                              })
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 shrink-0"
                            aria-label="Remove bullet"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(ei)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Globe size={20} className="text-indigo-400" />
                Projects
              </h2>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add project
              </button>
            </div>
            <div className="space-y-3">
              {(form.projects || [""]).map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => setProject(i, e.target.value)}
                    placeholder="Project name and description..."
                    rows={2}
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[60px]"
                  />
                  {(form.projects?.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeProject(i)}
                      className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 shrink-0 self-start"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Education & Languages */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <GraduationCap size={20} className="text-indigo-400" />
              Education & languages
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Education
                </span>
                <textarea
                  value={form.education}
                  onChange={(e) => update("education", e.target.value)}
                  placeholder="Degree, Institution, Year"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[80px]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Language proficiency
                </span>
                <textarea
                  value={form.languageProficiency}
                  onChange={(e) => update("languageProficiency", e.target.value)}
                  placeholder="e.g. English (Fluent), Spanish (Intermediate)"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[80px]"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Save size={18} /> Save details
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save & choose template →
          </button>
          <Link
            to="/portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/50 px-5 py-3 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 text-center"
          >
            View portfolio
          </Link>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
