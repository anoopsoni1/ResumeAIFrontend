/**
 * Parse plain-text resume into structured sections.
 * Handles various section header names and formatting from PDF/DOCX extraction.
 * Used by Portfolio, ResumeDesignView, and PortfolioDesignView.
 */

const SECTION_HEADERS = {
  summary: [
    /(?:^|\n)\s*(?:SUMMARY|Summary|OBJECTIVE|Objective|PROFILE|Profile|ABOUT\s+ME|About\s+Me|PERSONAL\s+STATEMENT)\s*:?\s*/im,
  ],
  skills: [
    /(?:^|\n)\s*(?:SKILLS?|Skills?|TECHNICAL\s+SKILLS|Technical\s+Skills|CORE\s+COMPETENCIES|KEY\s+SKILLS)\s*:?\s*/im,
  ],
  experience: [
    /(?:^|\n)\s*(?:WORK\s+EXPERIENCE|Work\s+Experience|EXPERIENCE|Experience|EMPLOYMENT|Employment|PROFESSIONAL\s+EXPERIENCE|Career)\s*:?\s*/im,
  ],
  projects: [
    /(?:^|\n)\s*(?:PROJECTS?|Projects?|KEY\s+PROJECTS|Notable\s+Projects)\s*:?\s*/im,
  ],
  education: [
    /(?:^|\n)\s*(?:EDUCATION|Education|ACADEMIC|Qualifications?)\s*:?\s*/im,
  ],
  languages: [
    /(?:^|\n)\s*(?:LANGUAGE\s*PROFICIENCY|LANGUAGES?|Language\s+Skills)\s*:?\s*/im,
  ],
};

function normalizeText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+/g, " ")
    .trim();
}

function stripBullet(line) {
  return line.replace(/^\s*[•\-*·▪▸]\s*/, "").trim();
}

function stripAsterisks(s) {
  return (s || "").replace(/\*/g, "").trim();
}

/** Extract content between two section headers (or end of text). */
function extractSection(text, startPatterns, endPatterns) {
  const normalized = normalizeText(text);
  for (const startRe of startPatterns) {
    const startMatch = normalized.match(startRe);
    if (!startMatch) continue;
    const startIndex = startMatch.index + startMatch[0].length;
    let endIndex = normalized.length;
    for (const endRe of endPatterns) {
      const rest = normalized.slice(startIndex);
      const endMatch = rest.match(endRe);
      if (endMatch && endMatch.index !== undefined) {
        const candidate = startIndex + endMatch.index;
        if (candidate < endIndex) endIndex = candidate;
      }
    }
    let content = normalized.slice(startIndex, endIndex).trim();
    content = content.replace(/\n{3,}/g, "\n\n");
    return content;
  }
  return "";
}

/** Find first line that looks like a section header (all caps or title case, no digits). */
function findSectionBoundaries(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const boundaries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const upper = line.toUpperCase().replace(/\s*:?\s*$/, "");
    if (
      upper.length < 35 &&
      (upper === line.trim() || /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*:?\s*$/.test(line)) &&
      !/\d{4}/.test(line)
    ) {
      boundaries.push({ index: i, line, upper: upper.replace(/\s*:?\s*$/, "") });
    }
  }
  return boundaries;
}

/** Get content between two boundary indices (line-based). */
function getLinesBetween(lines, startIdx, endIdx) {
  return lines.slice(startIdx, endIdx).map((l) => stripBullet(stripAsterisks(l))).filter(Boolean);
}

/** Extract contact from full text. */
function extractContact(text) {
  const email = text.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] || "";
  const phone =
    text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d+)?/)?.[0]?.replace(/\s/g, " ")?.trim() || "";
  return { email, phone };
}

export function parseResume(text = "") {
  const raw = normalizeText(text);
  if (!raw) return null;

  const lines = raw.split("\n").map((l) => normalizeText(l)).filter(Boolean);
  const { email, phone } = extractContact(raw);

  // --- Name & role: first lines; skip if they look like contact ---
  let name = "Your Name";
  let role = "Your Role";
  if (lines.length > 0) {
    const first = stripAsterisks(lines[0]);
    if (first && !first.includes("@") && !/^\d[\d\s\-.]+\d$/.test(first)) {
      name = first;
    }
  }
  if (lines.length > 1) {
    const second = stripAsterisks(lines[1]);
    if (second && !second.includes("@") && second.length < 80 && !/^\d[\d\s\-.]+\d$/.test(second)) {
      role = second;
    }
  }

  // --- Section content using regex (primary) ---
  let summary = extractSection(raw, SECTION_HEADERS.summary, [
    /\n\s*(?:SKILLS?|TECHNICAL|EXPERIENCE|WORK\s+EXPERIENCE|EDUCATION|PROJECTS?|OBJECTIVE|PROFILE)\s*:?\s*/im,
  ]);
  if (!summary) {
    const objMatch = raw.match(/(?:OBJECTIVE|SUMMARY|PROFILE)\s*:?\s*([\s\S]*?)(?=\n\s*(?:SKILLS|EXPERIENCE|EDUCATION|PROJECTS)|$)/im);
    if (objMatch) summary = objMatch[1].trim();
  }

  let skillsRaw = extractSection(raw, SECTION_HEADERS.skills, [
    /\n\s*(?:WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|PROJECTS?|EDUCATION)\s*:?\s*/im,
  ]);
  let experienceRaw = extractSection(raw, SECTION_HEADERS.experience, [
    /\n\s*(?:PROJECTS?|EDUCATION|SKILLS?|CERTIFICATIONS?)\s*:?\s*/im,
  ]);
  let projectsRaw = extractSection(raw, SECTION_HEADERS.projects, [
    /\n\s*(?:EDUCATION|SKILLS?|EXPERIENCE|CERTIFICATIONS?)\s*:?\s*/im,
  ]);
  let educationRaw = extractSection(raw, SECTION_HEADERS.education, [
    /\n\s*(?:LANGUAGE|LANGUAGES?|SKILLS?|CERTIFICATIONS?|REFERENCES?)\s*:?\s*/im,
  ]);
  let languageRaw = "";
  for (const re of SECTION_HEADERS.languages) {
    const m = raw.match(re);
    if (m) {
      const start = m.index + m[0].length;
      languageRaw = raw.slice(start).trim();
      break;
    }
  }

  // --- Fallback: line-based boundaries for odd formatting ---
  const boundaries = findSectionBoundaries(raw);
  if (!summary && boundaries.length > 0) {
    const sumIdx = boundaries.findIndex((b) => /SUMMARY|OBJECTIVE|PROFILE/i.test(b.upper));
    if (sumIdx >= 0 && sumIdx + 1 < boundaries.length) {
      summary = getLinesBetween(
        lines,
        boundaries[sumIdx].index + 1,
        boundaries[sumIdx + 1].index
      ).join("\n");
    }
  }
  if (!skillsRaw && boundaries.length > 0) {
    const skIdx = boundaries.findIndex((b) => /SKILLS?/i.test(b.upper));
    if (skIdx >= 0 && skIdx + 1 < boundaries.length) {
      skillsRaw = getLinesBetween(lines, boundaries[skIdx].index + 1, boundaries[skIdx + 1].index).join("\n");
    }
  }
  if (!experienceRaw && boundaries.length > 0) {
    const exIdx = boundaries.findIndex((b) => /EXPERIENCE|EMPLOYMENT|WORK/i.test(b.upper));
    if (exIdx >= 0 && exIdx + 1 < boundaries.length) {
      experienceRaw = getLinesBetween(lines, boundaries[exIdx].index + 1, boundaries[exIdx + 1].index).join("\n");
    }
  }
  if (!projectsRaw && boundaries.length > 0) {
    const prIdx = boundaries.findIndex((b) => /PROJECTS?/i.test(b.upper));
    if (prIdx >= 0 && prIdx + 1 < boundaries.length) {
      projectsRaw = getLinesBetween(lines, boundaries[prIdx].index + 1, boundaries[prIdx + 1].index).join("\n");
    }
  }
  if (!educationRaw && boundaries.length > 0) {
    const edIdx = boundaries.findIndex((b) => /EDUCATION|ACADEMIC/i.test(b.upper));
    if (edIdx >= 0 && edIdx + 1 < boundaries.length) {
      educationRaw = getLinesBetween(lines, boundaries[edIdx].index + 1, boundaries[edIdx + 1].index).join("\n");
    }
  }

  // --- Clean and structure ---
  summary = stripAsterisks(summary).replace(/\n{3,}/g, "\n\n").trim();

  const skillsList = skillsRaw
    .split(/[\n,;|]+/)
    .map((s) => stripBullet(stripAsterisks(s)).trim())
    .filter((s) => s.length > 0 && s.length < 80)
    .filter((s) => !/^(?:SKILLS?|EXPERIENCE|EDUCATION|PROJECTS?|SUMMARY)$/i.test(s));

  const experienceBlocks = experienceRaw
    .split(/\n\s*\n+/)
    .map((b) => stripAsterisks(b))
    .map((b) =>
      b
        .split("\n")
        .map((line) => stripBullet(line))
        .join("\n")
        .trim()
    )
    .filter((b) => b.length > 2);

  const isSectionHeader = (block) => {
    const first = block.split("\n")[0]?.trim().toUpperCase() || "";
    return (
      /^SKILLS?$/.test(first) ||
      /^EXPERIENCE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE$/.test(first)
    );
  };

  const projects = projectsRaw
    .split(/\n\s*\n+/)
    .map((b) => stripAsterisks(b))
    .map((b) =>
      b
        .split("\n")
        .map((line) => stripBullet(line))
        .join("\n")
        .trim()
    )
    .filter((b) => b.length > 2 && !isSectionHeader(b));

  let educationOnly = stripAsterisks(educationRaw).replace(/\n{3,}/g, "\n\n").trim();
  let languageOnly = stripAsterisks(languageRaw).replace(/\n{3,}/g, "\n\n").trim();

  const langInEd = educationOnly.match(
    /\n\s*(?:Language\s*Proficiency|Languages?|LANGUAGE\s*PROFICIENCY)\s*:?\s*([\s\S]*)/i
  );
  if (langInEd) {
    languageOnly = stripAsterisks(langInEd[1]).trim() || languageOnly;
    educationOnly = educationOnly.replace(
      /\n\s*(?:Language\s*Proficiency|Languages?|LANGUAGE\s*PROFICIENCY)\s*:?\s*[\s\S]*/i,
      ""
    ).trim();
  }

  return {
    name: name.trim(),
    role: role.trim(),
    summary,
    skills: skillsList,
    experience: experienceBlocks,
    projects,
    education: educationOnly,
    languageProficiency: languageOnly,
    email,
    phone,
    raw: text,
  };
}
