/**
 * Fetch user's saved details from the backend.
 * Single source of truth: GET /get-detail (Detail model).
 * Both AddDetails (manual) and EditResumePage (upload → edit/AI → save) write via create-detail/update-detail.
 * Returns data in the same shape as parseResume() for use in ResumeDesignView, Portfolio, PortfolioDesignView.
 */

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

/** Form shape used by Add Details page (for localStorage "addDetailsForm") */
const INITIAL_FORM = {
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

/**
 * Build plain resume text from form shape (used by AddDetails and EditResumePage).
 * Inverse of parseResume for display; same format so parsing back works.
 */
export function buildResumeTextFromForm(form) {
  if (!form) return "";
  const lines = [];
  lines.push((form.name || "").trim() || "Your Name");
  lines.push((form.role || "").trim() || "Your Role");
  lines.push("");
  if (form.summary?.trim()) {
    lines.push("SUMMARY");
    lines.push(form.summary.trim());
    lines.push("");
  }
  if (form.skills?.length) {
    const skillList = form.skills.filter((s) => (s || "").trim()).join("\n");
    if (skillList) {
      lines.push("SKILLS");
      lines.push(skillList);
      lines.push("");
    }
  }
  if (form.experience?.length) {
    lines.push("EXPERIENCE");
    (form.experience || []).forEach((exp) => {
      if (exp?.role?.trim()) lines.push(exp.role.trim());
      (exp.bullets || []).filter(Boolean).forEach((b) => lines.push(`• ${(b || "").trim()}`));
      lines.push("");
    });
  }
  if (form.projects?.length) {
    const projectTexts = form.projects.filter((p) => (p || "").trim());
    if (projectTexts.length) {
      lines.push("PROJECTS");
      projectTexts.forEach((p) => {
        lines.push((p || "").trim());
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
  if (contact) return text + (text ? "\n\n" : "") + contact;
  return text;
}

/**
 * Build plain resume text from API detail (get-detail response).
 */
export function buildResumeTextFromDetail(d) {
  if (!d) return "";
  return buildResumeTextFromForm(detailLikeToForm(d));
}

/**
 * Convert a detail-like object (parsed resume or API detail) to Add Details form shape.
 * Use after upload to prefill addDetailsForm from extracted text.
 */
export function detailLikeToForm(d) {
  if (!d) return { ...INITIAL_FORM };
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

/**
 * Convert parseResume() output to payload for create-detail / update-detail.
 */
export function parsedToDetailPayload(parsed) {
  if (!parsed) return null;
  const experience = Array.isArray(parsed.experience) && parsed.experience.length > 0
    ? parsed.experience.map((e) => (e != null ? String(e).trim() : "")).filter(Boolean)
    : [""];
  const skills = Array.isArray(parsed.skills) && parsed.skills.length > 0
    ? parsed.skills.map((s) => (s || "").trim()).filter(Boolean)
    : [""];
  const projects = Array.isArray(parsed.projects) && parsed.projects.length > 0
    ? parsed.projects.map((p) => (p || "").trim()).filter(Boolean)
    : [""];
  return {
    name: (parsed.name || "").trim() || "Your Name",
    role: (parsed.role || "").trim() || "Your Role",
    summary: (parsed.summary || "").trim() || "",
    skills,
    experience,
    projects,
    education: (parsed.education || "").trim() || "",
    languageProficiency: (parsed.languageProficiency || "").trim() || "",
    email: (parsed.email || "").trim() || "",
    phone: (parsed.phone || "").trim() || "",
  };
}

/**
 * @returns {Promise<{ name, role, summary, skills, experience, projects, education, languageProficiency, email, phone } | null>}
 */
export async function fetchDetailForResume() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/get-detail`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data) return null;

    const d = json.data;
    const nameStr = d.name != null ? String(d.name).trim() : "";
    const roleStr = d.role != null ? String(d.role).trim() : "";
    return {
      name: nameStr || "Your Name",
      role: roleStr || "Your Role",
      summary: d.summary || "",
      skills: Array.isArray(d.skills) ? d.skills : [],
      experience: Array.isArray(d.experience) ? d.experience : [],
      projects: Array.isArray(d.projects) ? d.projects : [],
      education: d.education || "",
      languageProficiency: d.languageProficiency || "",
      email: d.email || "",
      phone: d.phone || "",
    };
  } catch (_) {
    return null;
  }
}

/**
 * Get resume/portfolio content from the single source of truth: Detail API.
 * Both AddDetails (manual) and EditResumePage (upload → edit → save) write to the same Detail API.
 */
export async function getResumeContentForView() {
  return fetchDetailForResume();
}
