/**
 * Fetch user's saved details from the backend.
 * Resume and portfolio can be built from:
 * 1) Saved edited resume text (upload flow) - from GET /get-edited-resume
 * 2) Saved details (add-details flow) - from GET /get-detail
 * Returns data in the same shape as parseResume() for use in ResumeDesignView, Portfolio, PortfolioDesignView.
  */

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user"; 

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
 * Fetch user's saved edited resume text (upload flow). Used when building resume/portfolio from uploaded + edited text.
 * @returns {Promise<string|null>} Raw text or null.
 */
export async function fetchEditedResumeText() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/get-edited-resume`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    const t = json?.data?.text;
    return typeof t === "string" && t.trim() ? t.trim() : null;
  } catch (_) {
    return null;
  }
}

/** Return true if detail has real content (not just defaults with nothing else). */
function detailHasContent(d) {
  if (!d) return false;
  const nameOk = (d.name || "").trim() && (d.name || "").trim() !== "Your Name";
  const roleOk = (d.role || "").trim() && (d.role || "").trim() !== "Your Role";
  const hasSummary = (d.summary || "").trim().length > 0;
  const hasSkills = Array.isArray(d.skills) && d.skills.some((s) => (s || "").trim());
  const hasExperience = Array.isArray(d.experience) && d.experience.some((e) => (e || "").trim());
  const hasProjects = Array.isArray(d.projects) && d.projects.some((p) => (p || "").trim());
  const hasEducation = (d.education || "").trim().length > 0;
  return nameOk || roleOk || hasSummary || hasSkills || hasExperience || hasProjects || hasEducation;
}

/**
 * Get resume/portfolio content. Both flows supported:
 * - When user saves edited text: resume/portfolio use that text (so saving updates the view).
 * - When user has no saved edited text: use saved details from Add details.
 * We prefer edited text when present so that "Save to account" on Edit Resume page actually updates resume/portfolio.
 */
export async function getResumeContentForView(parseResume) {
  const editedText = await fetchEditedResumeText();
  if (editedText && typeof parseResume === "function") {
    const parsed = parseResume(editedText);
    if (parsed) return parsed;
  }
  const detail = await fetchDetailForResume();
  if (detail && detailHasContent(detail)) return detail;
  return detail || null;
}
