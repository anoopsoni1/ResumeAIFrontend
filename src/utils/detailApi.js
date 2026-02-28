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
    return {
      name: d.name || "Your Name",
      role: d.role || "Your Role",
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
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    const t = json?.data?.text;
    return typeof t === "string" && t.trim() ? t.trim() : null;
  } catch (_) {
    return null;
  }
}

/**
 * Get resume/portfolio content: prefers saved edited resume text (upload flow), else saved details (add-details flow).
 * @param {import("./parseResume.js").parseResume} parseResume - Parser function to convert raw text to structured data.
 * @returns {Promise<{ name, role, summary, skills, experience, projects, education, languageProficiency, email, phone } | null>}
 */
export async function getResumeContentForView(parseResume) {
  const editedText = await fetchEditedResumeText();
  if (editedText && typeof parseResume === "function") {
    const parsed = parseResume(editedText);
    if (parsed) return parsed;
  }
  return fetchDetailForResume();
}
