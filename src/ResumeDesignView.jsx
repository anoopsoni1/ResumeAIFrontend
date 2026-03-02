import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ArrowLeft, FileText, Printer, Download, Phone, Mail, MapPin, Linkedin, Award, Globe } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { getResumeContentForView } from "./utils/detailApi.js";
import { clearUser } from "./slice/user.slice";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

/** Placeholder data so logged-out users can still view template designs */
const PLACEHOLDER_RESUME_DATA = {
  name: "Your Name",
  role: "Your Role",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  experience: [
    "Job Title\nCompany Name\n2020 – Present\nBrief description of your role and key responsibilities.",
    "Previous Role\nPrevious Company\n2018 – 2020\nSummary and achievements.",
  ],
  education: "Degree or certification\nInstitution name\nYear",
  projects: [],
  languageProficiency: "",
  email: "email@example.com",
  phone: "+1 234 567 8900",
  location: "City, Country",
  website: "www.example.com",
};

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";
/** One page only: constrain to 11in height; scale content down to fit if it overflows. */
const ONE_PAGE_WRAPPER_CLASS =
  "resume-one-page w-full max-h-[11in] min-h-[11in] print:max-h-[11in] print:min-h-0 print:h-[11in] overflow-hidden relative flex flex-col";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

function getLayoutType(template) {
  const n = (template?.name || "").toLowerCase();
  if (n.includes("resume3") || n.includes("resume 3")) return "resume3";
  if (n.includes("resume4") || n.includes("resume 4")) return "resume4";
  if (n.includes("resume5") || n.includes("resume 5")) return "resume5";
  if (n.includes("resume6") || n.includes("resume 6")) return "resume6";
  return "resume2";
}

function parseExperienceEntry(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { roleTitle: lines[0] || "Role", bullets: lines.slice(1) };
}

/** Parse experience entry into job title, company, dates/location line, and bullets (for Resume2 orange layout). */
function parseExperienceEntryDetailed(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const jobTitle = lines[0] || "";
  const company = lines[1] || "";
  const datesOrLocation = lines[2] || "";
  const bullets = lines.slice(3);
  return { jobTitle, company, datesOrLocation, bullets };
}

/** Parse education string into degree, institution, dates (for Resume2). */
function parseEducation(education) {
  if (!education || !String(education).trim()) return null;
  const lines = education.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    degree: lines[0] || "",
    institution: lines[1] || "",
    dates: lines[2] || "",
  };
}

function ContactStrip({ data, linkClass = "text-blue-600 hover:underline" }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 sm:gap-x-3 text-xs sm:text-sm">
      {data.phone && (
        <a href={`tel:${data.phone}`} className={`flex items-center gap-1.5 ${linkClass}`}>
          <Phone size={14} className="shrink-0" /> {data.phone}
        </a>
      )}
      {data.email && (
        <a href={`mailto:${data.email}`} className={`flex items-center gap-1.5 break-all ${linkClass}`}>
          <Mail size={14} className="shrink-0" /> {data.email}
        </a>
      )}
      {data.linkedin && (
        <a href={data.linkedin} className={`flex items-center gap-1.5 ${linkClass}`}>
          <Linkedin size={14} className="shrink-0" /> {data.linkedin.replace(/^https?:\/\//i, "")}
        </a>
      )}
      {data.location && (
        <span className={`flex items-center gap-1.5 ${linkClass}`}>
          <MapPin size={14} className="shrink-0" /> {data.location}
        </span>
      )}
    </div>
  );
}

function ExperienceList({ experience, bulletListClass = "mt-1 space-y-0.5 text-xs sm:text-sm text-black list-disc list-inside pl-0" }) {
  if (!experience?.length) return null;
  return (
    <div className="space-y-2 sm:space-y-2.5">
      {experience.map((entry, i) => {
        const { roleTitle, bullets } = parseExperienceEntry(entry);
        return (
          <div key={i}>
            <h3 className="text-xs sm:text-sm font-bold text-black leading-tight">{roleTitle}</h3>
            {bullets.length > 0 ? (
              <ul className={bulletListClass}>
                {bullets.map((bullet, j) => (
                  <li key={j} className="leading-snug">{bullet}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-black whitespace-pre-wrap leading-snug">{entry}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SKILLS_TAG_STYLES = {
  emerald: "px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-medium",
  indigo: "px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs sm:text-sm font-medium",
  violet: "px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 border border-violet-200 text-xs sm:text-sm font-medium",
};

function SkillsBlock({ skills, variant = "list", theme = "zinc" }) {
  if (!skills?.length) return null;
  const list = skills.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean);
  if (!list.length) return null;

  if (variant === "tags") {
    const tagClass = SKILLS_TAG_STYLES[theme] || SKILLS_TAG_STYLES.emerald;
    return (
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {list.map((skill, i) => (
          <span key={i} className={`${tagClass} break-words`}>{skill}</span>
        ))}
      </div>
    );
  }

  const bulletColors = {
    zinc: "before:text-zinc-500",
    violet: "before:text-violet-600",
    rose: "before:text-rose-400/80",
  };
  const textColors = {
    zinc: "text-black",
    violet: "text-black",
    rose: "text-zinc-300",
  };
  const bullet = bulletColors[theme] || bulletColors.zinc;
  const textCls = textColors[theme] || "text-black";

  return (
    <ul className={`grid grid-cols-2 gap-x-3 gap-y-1 sm:gap-y-1.5 text-xs sm:text-sm ${textCls} list-none pl-0 leading-snug`}>
      {list.map((skill, i) => (
        <li key={i} className={`flex items-start gap-2 before:content-['•'] before:shrink-0 before:font-bold ${bullet}`}>
          <span className="break-words">{skill}</span>
        </li>
      ))}
    </ul>
  );
}

const RESUME2_SECTION_HEAD = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black pb-1 mb-2 border-b-2 border-orange-500";

function Resume2Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const location = data?.location || "";
  const educationParsed = parseEducation(data?.education);
  const achievements = (data?.experience?.flatMap((e) => parseExperienceEntry(e).bullets) || []).slice(0, 4);
  const achievementsFromProjects = (data?.projects || []).slice(0, 4).map((p) => ({ title: (p || "").slice(0, 40), desc: (p || "").trim() }));
  const hasAchievements = achievements.length > 0 || achievementsFromProjects.length > 0;
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const skillsText = skillsList.join(", ");

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col md:flex-row print:flex-row bg-neutral-50 print:bg-white`}>
      {/* ——— Left column (wider): name, role, contact, summary, employment ——— */}
      <div className="w-full md:w-[62%] print:w-[62%] min-h-0 p-4 sm:p-5 md:p-6 bg-white print:bg-white order-1 flex flex-col overflow-visible">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-neutral-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black">{name}</h1>
            <p className="text-sm text-black mt-0.5">{role}</p>
            <div className="mt-2 space-y-0.5 text-xs sm:text-sm text-black">
              {data?.phone && <p>{data.phone}</p>}
              {location && <p>{location}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            {data?.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-1.5 text-black hover:text-orange-600 break-all">
                <Mail size={14} className="shrink-0 text-orange-500" />
                {data.email}
              </a>
            )}
            {data?.linkedin && (
              <a href={data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-black hover:text-orange-600">
                <Linkedin size={14} className="shrink-0 text-orange-500" />
                {data.linkedin.replace(/^https?:\/\//i, "")}
              </a>
            )}
          </div>
        </header>

        {data?.summary && (
          <section className="mt-4">
            <h2 className={RESUME2_SECTION_HEAD}>Professional Summary</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data?.experience?.length > 0 && (
          <section className="mt-5">
            <h2 className={RESUME2_SECTION_HEAD}>Employment History</h2>
            <div className="space-y-4">
              {data.experience.map((entry, i) => {
                const { jobTitle, company, datesOrLocation, bullets } = parseExperienceEntryDetailed(entry);
                return (
                  <div key={i}>
                    <p className="text-xs sm:text-sm font-bold text-black">{jobTitle || "Role"}</p>
                    {company && (
                      <a href="#" className="text-xs sm:text-sm text-orange-600 underline decoration-orange-600">{company}</a>
                    )}
                    {datesOrLocation && (
                      <p className="text-[10px] sm:text-xs text-black mt-0.5">
                        <span className="text-orange-600">{datesOrLocation.split("|")[0]?.trim() || datesOrLocation}</span>
                        {datesOrLocation.includes("|") ? ` | ${datesOrLocation.split("|").slice(1).join("|").trim()}` : ""}
                      </p>
                    )}
                    {bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-xs sm:text-sm text-black">
                        {bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" aria-hidden />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Left column remaining space: Education + Language */}
        {(data?.education || educationParsed) && (
          <section className="mt-5">
            <h2 className={RESUME2_SECTION_HEAD}>Education</h2>
            {educationParsed ? (
              <div>
                <p className="text-xs font-bold text-black">{educationParsed.degree}</p>
                <span className="text-xs text-orange-600">{educationParsed.institution}</span>
                {educationParsed.dates && (
                  <p className="text-[10px] text-black mt-0.5"><span className="text-orange-600">{educationParsed.dates}</span></p>
                )}
              </div>
            ) : (
              <p className="text-[10px] sm:text-xs text-black leading-snug whitespace-pre-wrap">{data.education}</p>
            )}
          </section>
        )}
        {data?.languageProficiency && (
          <section className="mt-5">
            <h2 className={RESUME2_SECTION_HEAD}>Language</h2>
            <p className="text-[10px] sm:text-xs text-black leading-snug whitespace-pre-wrap">{data.languageProficiency}</p>
          </section>
        )}
      </div>

      {/* ——— Right column: Projects, Skills ——— */}
      <aside className="w-full md:w-[38%] print:w-[38%] md:min-w-[180px] print:min-w-0 p-4 sm:p-5 md:p-6 bg-neutral-50 print:bg-neutral-50/80 border-l border-neutral-200 order-2 flex flex-col overflow-visible">
        {hasAchievements && (
          <section className="mb-4">
            <h2 className={RESUME2_SECTION_HEAD}>Projects</h2>
            <div className="space-y-3">
              {achievementsFromProjects.length > 0
                ? achievementsFromProjects.map((a, i) => (
                    <div key={i}>
                      <p className="text-xs font-bold text-black">{a.title || "Achievement"}</p>
                      <p className="text-[10px] sm:text-xs text-black mt-0.5 leading-snug">{a.desc}</p>
                    </div>
                  ))
                : achievements.slice(0, 4).map((bullet, i) => (
                    <div key={i}>
                      <p className="text-[10px] sm:text-xs text-black leading-snug">{bullet}</p>
                    </div>
                  ))}
            </div>
          </section>
        )}

        {skillsList.length > 0 && (
          <section className="mb-4">
            <h2 className={RESUME2_SECTION_HEAD}>Skills</h2>
            <p className="text-[10px] sm:text-xs text-black leading-relaxed">{skillsText}</p>
          </section>
        )}

      </aside>
    </article>
  );
}

function Resume3Layout({ data }) {
  const headingClass = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-0.5 mb-1 sm:mb-2";
  const headingClassMb4 = `${headingClass} mb-2 sm:mb-2.5`;
  return (
    <article className={`${DOCUMENT_CLASS} max-w-3xl`}>
      <div className="p-2.5 sm:p-3 md:p-4 min-h-0 overflow-visible flex flex-col">
        <header className="text-center border-b border-emerald-200 pb-2 sm:pb-3 mb-2 sm:mb-3">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-black leading-tight">{data.name || "Your Name"}</h1>
          <p className="text-emerald-600 font-medium mt-0.5 sm:mt-1 text-sm sm:text-base">{data.role || "Your Role"}</p>
          <div className="mt-1.5 sm:mt-2 flex flex-wrap justify-center gap-x-2 sm:gap-x-3 gap-y-0.5">
            <ContactStrip data={data} linkClass="text-emerald-600 hover:underline" />
          </div>
        </header>
        {data.summary && (
          <section className="mb-2 sm:mb-3">
            <h2 className={headingClass}>Summary</h2>
            <p className="text-xs sm:text-sm text-black leading-snug">{data.summary}</p>
          </section>
        )}
        {data.skills?.length > 0 && (
          <section className="mb-2 sm:mb-3">
            <h2 className={headingClass}>Skills</h2>
            <SkillsBlock skills={data.skills} variant="tags" theme="emerald" />
          </section>
        )}
        {data.experience?.length > 0 && (
          <section className="mb-2 sm:mb-3">
            <h2 className={headingClassMb4}>Experience</h2>
            <ExperienceList experience={data.experience} />
          </section>
        )}
        {data.education && (
          <section className="mb-2 sm:mb-3">
            <h2 className={headingClass}>Education</h2>
            <p className="text-xs sm:text-sm text-black leading-snug whitespace-pre-wrap">{data.education}</p>
          </section>
        )}
        {data.projects?.length > 0 && (
          <section>
            <h2 className={headingClass}>Projects</h2>
            <div className="space-y-1">
              {data.projects.map((project, i) => (
                <p key={i} className="text-xs sm:text-sm text-black leading-snug whitespace-pre-wrap">{project}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Resume4Layout({ data }) {
  const sectionTitleClass = "bg-sky-100 text-sky-900 font-bold uppercase tracking-wider text-[10px] sm:text-xs py-1 px-2 sm:px-3 mb-1.5";
  const sectionTitleClassMb4 = `${sectionTitleClass} mb-2`;
  const languagesList = data.languageProficiency
    ? data.languageProficiency.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const referencesList = data.references
    ? (Array.isArray(data.references) ? data.references : [data.references]).map((r) => (typeof r === "string" ? r : `${r.name || ""} ${r.email || ""}`).trim()).filter(Boolean)
    : [];

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl bg-white`}>
      <header className="flex flex-col md:flex-row print:flex-row md:items-start md:justify-between gap-2 p-2.5 sm:p-3 border-b border-sky-100">
        <div className="flex flex-col gap-1 text-zinc-600 text-xs sm:text-sm">
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 hover:text-sky-700">
              <span className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center shrink-0"><Phone size={14} className="text-sky-700" /></span>
              {data.phone}
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 break-all hover:text-sky-700">
              <span className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center shrink-0"><Mail size={14} className="text-sky-700" /></span>
              {data.email}
            </a>
          )}
          {data.location && (
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center shrink-0"><MapPin size={14} className="text-sky-700" /></span>
              {data.location}
            </span>
          )}
          {(data.website || data.linkedin) && (
            <a href={data.website?.startsWith("http") ? data.website : data.linkedin || `https://${data.website || ""}`} className="flex items-center gap-2 hover:text-sky-700" target="_blank" rel="noopener noreferrer">
              <span className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center shrink-0"><Globe size={14} className="text-sky-700" /></span>
              {(data.website || data.linkedin || "").replace(/^https?:\/\//i, "")}
            </a>
          )}
        </div>
        <div className="text-right md:text-right">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-sky-900 uppercase tracking-wide leading-tight">{data.name || "Your Name"}</h1>
          <p className="text-zinc-600 text-sm sm:text-base mt-0.5">{data.role || "Your Role"}</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row print:flex-row min-h-0 flex-1 overflow-visible">
        <div className="flex-1 min-w-0 min-h-0 p-2.5 sm:p-3 md:p-4 order-2 md:order-1 overflow-visible">
          {data.summary && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClass}>About me</h2>
              <p className="text-zinc-700 text-xs sm:text-sm leading-snug">{data.summary}</p>
            </section>
          )}
          {data.experience?.length > 0 && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClassMb4}>Experience</h2>
              <div className="space-y-2">
                {data.experience.map((entry, i) => {
                  const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                  const { roleTitle, bullets } = parseExperienceEntry(entry);
                  const dateLine = lines[1] && /(\d{4}|\d{2})/.test(lines[1]) ? lines[1] : "";
                  return (
                    <div key={i} className="border-l-2 border-sky-200 pl-2.5">
                      <div className="flex flex-wrap justify-between gap-x-2 items-baseline">
                        <p className="text-sky-900 font-bold text-xs sm:text-sm leading-tight">{roleTitle}</p>
                        {dateLine && <span className="text-zinc-500 text-[10px] whitespace-nowrap">{dateLine}</span>}
                      </div>
                      {bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-zinc-700 text-xs sm:text-sm list-disc list-inside pl-0">
                          {bullets.map((b, j) => (
                            <li key={j} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {data.education && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClass}>Education</h2>
              <p className="text-zinc-700 text-xs sm:text-sm leading-snug whitespace-pre-wrap">{data.education}</p>
            </section>
          )}
          {data.projects?.length > 0 && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClass}>Projects</h2>
              <div className="space-y-1.5 text-zinc-700 text-xs sm:text-sm">
                {data.projects.map((project, i) => (
                  <p key={i} className="leading-snug whitespace-pre-wrap">{project}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="w-full md:w-[36%] md:min-w-[200px] print:w-[36%] p-2.5 sm:p-3 bg-sky-50/50 print:bg-sky-50/30 border-t md:border-t-0 md:border-l border-sky-100 order-1 md:order-2 min-h-0 overflow-visible">
          {data.skills?.length > 0 && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClass}>Skills</h2>
              <ul className="space-y-1 text-zinc-700 text-xs sm:text-sm list-none pl-0">
                {data.skills.filter((s) => (s || "").trim()).map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" aria-hidden />
                    <span className="break-words">{(s || "").trim()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {languagesList.length > 0 && (
            <section className="mb-2 sm:mb-3">
              <h2 className={sectionTitleClass}>Languages</h2>
              <div className="space-y-1">
                {languagesList.map((lang, i) => {
                  const match = lang.match(/(.+?)\s*[:\-–]\s*(\d+)%?/i) || lang.match(/(.+?)\s*\((.+)\)/i);
                  const name = match ? match[1].trim() : lang;
                  const level = match && /^\d+$/.test(String(match[2]).replace("%", "")) ? Math.min(100, parseInt(match[2], 10)) : 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] text-zinc-700 mb-0.5">
                        <span>{name}</span>
                        {level < 100 && <span>{level}%</span>}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-600" style={{ width: `${level}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {referencesList.length > 0 && (
            <section>
              <h2 className={sectionTitleClass}>References</h2>
              <div className="space-y-1 text-zinc-700 text-xs sm:text-sm">
                {referencesList.map((ref, i) => {
                  const parts = ref.split(/\s+Email:\s*/i);
                  const name = parts[0]?.trim() || ref;
                  const email = parts[1]?.trim();
                  return (
                    <div key={i}>
                      <p className="font-bold text-sky-900">{name}</p>
                      {email && <p>Email: <a href={`mailto:${email}`} className="text-sky-700 hover:underline">{email}</a></p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}

function Resume5Layout({ data }) {
  const sectionTitle = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black mb-1.5 sm:mb-2";
  const educationBlocks = data.education
    ? data.education.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((arr) => arr.length > 0)
    : [];
  const contactParts = [
    data.phone,
    data.location,
    data.website || data.linkedin,
    data.email,
  ].filter(Boolean);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl bg-white overflow-visible relative`}>
      <header className="flex flex-col sm:flex-row print:flex-row">
        <div className="w-full sm:w-[36%] sm:min-w-[180px] print:w-[36%] bg-blue-700 print:bg-blue-700 px-5 sm:px-6 py-6 sm:py-8 flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {data.name || "Your Name"}
          </h1>
        </div>
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 flex flex-col justify-center">
          <p className="text-black font-semibold text-base sm:text-lg text-right">{data.role || "Your Role"}</p>
          <div className="flex flex-wrap justify-end gap-x-2 sm:gap-x-3 gap-y-1 mt-2 text-zinc-700 text-xs sm:text-sm">
            {contactParts.map((part, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-zinc-300">|</span>}
                {typeof part === "string" && (part.startsWith("http") || part.includes(".com") || part.includes("@")) ? (
                  <a href={part.startsWith("http") ? part : part.includes("@") ? `mailto:${part}` : `https://${part}`} className="text-black hover:underline">{part}</a>
                ) : part === data.phone ? (
                  <a href={`tel:${part}`} className="text-black hover:underline">{part}</a>
                ) : (
                  <span>{part}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-zinc-100 print:bg-zinc-100 p-2.5 sm:p-3 md:p-4 min-h-0 overflow-visible flex flex-col">
        {data.summary && (
          <section className="mb-2 sm:mb-3">
            <h2 className={sectionTitle}>About me</h2>
            <p className="text-black text-xs sm:text-sm leading-snug">{data.summary}</p>
          </section>
        )}

        <div className="flex flex-col md:flex-row print:flex-row gap-2 md:gap-4 mb-2 sm:mb-3">
          {data.education && (
            <section className="flex-1 min-w-0">
              <h2 className={sectionTitle}>Education</h2>
              {educationBlocks.length >= 2 ? (
                <div className="relative">
                  <div className="absolute top-2 left-0 right-0 h-0.5 bg-black hidden md:block print:block" style={{ top: "0.6rem" }} aria-hidden />
                  <div className="flex justify-between gap-2 relative">
                    {educationBlocks.slice(0, 3).map((lines, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="w-3 h-3 rounded-full bg-black mx-auto mb-2 shrink-0" aria-hidden />
                        <p className="text-xs text-black">{lines[0] || ""}</p>
                        <p className="text-xs font-bold text-black uppercase mt-0.5">{lines[1] || ""}</p>
                        <p className="text-xs text-black mt-0.5">{lines[2] || ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-black leading-snug whitespace-pre-wrap">{data.education}</p>
              )}
            </section>
          )}
          {data.skills?.length > 0 && (
            <section className="md:w-[42%] md:max-w-[220px] md:pl-3 md:border-l md:border-zinc-300 print:border-l print:border-zinc-300">
              <h2 className={sectionTitle}>Skills</h2>
              <ul className="space-y-1 text-black text-xs sm:text-sm list-none pl-0">
                {data.skills.filter((s) => (s || "").trim()).map((s, i) => (
                  <li key={i}>{(s || "").trim()}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {data.experience?.length > 0 && (
          <section>
            <h2 className={sectionTitle}>Work experience</h2>
            <div className="space-y-2 sm:space-y-2.5">
              {data.experience.map((entry, i) => {
                const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                const { roleTitle, bullets } = parseExperienceEntry(entry);
                const dateLine = lines[1] && /(\d{4}|\d{2})/.test(lines[1]) ? lines[1] : "";
                return (
                  <div key={i}>
                    <div className="flex flex-wrap justify-between gap-x-2 items-baseline">
                      <p className="text-black font-bold uppercase text-xs sm:text-sm leading-tight">{roleTitle}</p>
                      {dateLine && <span className="text-black text-[10px] whitespace-nowrap">{dateLine}</span>}
                    </div>
                    {bullets.length > 0 && (
                      <>
                        {bullets[0] && <p className="mt-1 text-black text-xs sm:text-sm leading-snug">{bullets[0]}</p>}
                        {bullets.length > 1 && (
                          <ul className="mt-1 space-y-0.5 text-black text-xs sm:text-sm list-disc list-inside pl-3">
                            {bullets.slice(1).map((b, j) => (
                              <li key={j} className="leading-snug">{b}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {data.projects?.length > 0 && (
          <section>
            <h2 className={sectionTitle}>Projects</h2>
            <div className="space-y-1.5 text-black text-xs sm:text-sm">
              {data.projects.map((project, i) => (
                <p key={i} className="leading-snug whitespace-pre-wrap">{project}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="h-1.5 w-20 bg-blue-700 print:bg-blue-700 rounded-br-full shrink-0" aria-hidden />
    </article>
  );
}

function Resume6Layout({ data }) {
  const name = data.name || "Your Name";
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const sectionTitleClass = "flex items-center gap-2 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1.5 sm:mb-2";
  const pinkSquare = <span className="w-1.5 h-1.5 rounded-sm bg-rose-400 shrink-0 shadow-sm shadow-rose-400/30" aria-hidden />;
  const linkClass = "text-white hover:text-rose-300 transition-colors underline underline-offset-2";
  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl bg-zinc-900 text-white overflow-visible`}>
      <header className="relative text-center pt-3 sm:pt-4 pb-3 sm:pb-4 px-3">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-transparent pointer-events-none" aria-hidden />
        {data.avatar || data.profileImage ? (
          <img src={data.avatar || data.profileImage} alt="" className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto object-cover ring-2 ring-rose-400/60 ring-offset-2 ring-offset-zinc-900 shadow-lg" />
        ) : (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto bg-zinc-700/80 ring-2 ring-rose-400/60 ring-offset-2 ring-offset-zinc-900 flex items-center justify-center text-rose-400 font-bold text-sm shadow-inner">
            {initials}
          </div>
        )}
        <h1 className="relative mt-2 sm:mt-2.5 text-base sm:text-lg md:text-xl font-bold text-rose-400 uppercase tracking-widest leading-tight drop-shadow-sm">{name}</h1>
        <p className="relative text-white/95 text-sm sm:text-base uppercase tracking-widest mt-1 font-medium">{data.role || "Your Role"}</p>
      </header>
      <div className="flex flex-col md:flex-row print:flex-row px-2.5 sm:px-4 pb-4 sm:pb-5 gap-3 md:gap-4 min-h-0 flex-1 overflow-visible">
        <div className="w-full md:w-[48%] space-y-2 sm:space-y-3 order-2 md:order-1 min-h-0 overflow-visible">
          {data.experience?.length > 0 && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} Work Experience</h2>
              <div className="space-y-2">
                {data.experience.map((entry, i) => {
                  const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                  const { roleTitle, bullets } = parseExperienceEntry(entry);
                  const dateOrSub = lines[1] || "";
                  return (
                    <div key={i} className="border-l-2 border-zinc-700 pl-2.5">
                      <p className="text-white font-semibold text-xs sm:text-sm leading-tight">{roleTitle}</p>
                      {dateOrSub && <p className="text-rose-400/90 text-[10px] sm:text-xs mt-0.5 font-medium">{dateOrSub}</p>}
                      {bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-zinc-300 text-xs sm:text-sm list-none pl-0">
                          {bullets.map((b, j) => (
                            <li key={j} className="flex gap-2 before:content-['•'] before:text-rose-400/80 before:shrink-0 leading-snug">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {data.skills?.length > 0 && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} Skills</h2>
              <SkillsBlock skills={data.skills} variant="list" theme="rose" />
            </section>
          )}
          {data.languageProficiency && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} Languages</h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-snug whitespace-pre-wrap">{data.languageProficiency}</p>
            </section>
          )}
          <section>
            <h2 className={sectionTitleClass}>{pinkSquare} Contact</h2>
            <div className="space-y-1 text-zinc-300 text-xs sm:text-sm">
              {data.email && (
                <p className="flex items-center gap-2">
                  <Mail size={12} className="shrink-0 text-rose-400/80" />
                  <a href={`mailto:${data.email}`} className={linkClass}>{data.email}</a>
                </p>
              )}
              {data.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={12} className="shrink-0 text-rose-400/80" />
                  <a href={`tel:${data.phone}`} className={linkClass}>{data.phone}</a>
                </p>
              )}
              {data.website && (
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded border border-rose-400/80 shrink-0 inline-block" aria-hidden />
                  <a href={data.website.startsWith("http") ? data.website : `https://${data.website}`} className={linkClass} target="_blank" rel="noopener noreferrer">{data.website.replace(/^https?:\/\//i, "")}</a>
                </p>
              )}
              {data.linkedin && (
                <p className="flex items-center gap-2">
                  <Linkedin size={12} className="shrink-0 text-rose-400/80" />
                  <a href={data.linkedin} className={linkClass} target="_blank" rel="noopener noreferrer">{data.linkedin.replace(/^https?:\/\//i, "")}</a>
                </p>
              )}
              {!data.email && !data.phone && !data.website && !data.linkedin && (
                <p className="text-zinc-500 text-xs">Add contact in your details</p>
              )}
            </div>
          </section>
        </div>
        <div className="w-full md:w-[52%] md:pl-4 print:pl-4 space-y-2 sm:space-y-3 order-1 md:order-2 border-t md:border-t-0 md:border-l border-zinc-700/80 pt-3 md:pt-0 min-h-0 overflow-visible">
          {data.summary && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} About</h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-snug tracking-wide">{data.summary}</p>
            </section>
          )}
          {data.education && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} Education</h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-snug whitespace-pre-wrap tracking-wide">{data.education}</p>
            </section>
          )}
          {data.projects?.length > 0 && (
            <section>
              <h2 className={sectionTitleClass}>{pinkSquare} Projects</h2>
              <div className="space-y-1 text-zinc-300 text-xs sm:text-sm">
                {data.projects.map((project, i) => (
                  <p key={i} className="leading-snug whitespace-pre-wrap">{project}</p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ResumeDesignView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fitScale, setFitScale] = useState(1);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;
    const wrapperHeight = wrapperRef.current.getBoundingClientRect().height;
    const contentHeight = contentRef.current.scrollHeight;
    if (contentHeight <= 0) return;
    const scale = Math.min(1, wrapperHeight / contentHeight);
    setFitScale(scale);
  }, [template, data, loading, detailLoading]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
      dispatch(clearUser());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [dispatch, navigate]);

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
        if (!cancelled) setError(err?.response?.data?.message || err?.message || "Failed to load template");
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

  const handlePrint = useCallback(() => window.print(), []);

  const isLoading = loading || detailLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-zinc-400">Loading…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-amber-400">{error || "Template not found"}</p>
          <Link
            to="/templates/resumedesign"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-white"
          >
            <ArrowLeft size={18} /> Back to resume designs
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  const displayData = data || PLACEHOLDER_RESUME_DATA;
  const isPlaceholder = !data;

  return (
    <div className="min-h-screen bg-zinc-900 print:bg-white text-white print:text-black flex flex-col">
      {/* Banner when viewing with placeholder (e.g. logged out) */}
      {isPlaceholder && (
        <div className="print:hidden bg-amber-500/20 border-b border-amber-400/30 px-3 sm:px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-200">
              Viewing with sample data. Sign in to use your own details and save your resume.
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
                className="inline-flex items-center rounded-lg border border-amber-400/50 px-3 py-1.5 text-sm font-medium text-amber-200 hover:text-white hover:border-amber-300"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: only on screen, hidden in print */}
      <div className="print:hidden border-b border-white/10 bg-zinc-900/95 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/templates/resumedesign"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white shrink-0"
            >
              <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back
            </Link>
            <span className="text-zinc-500 max-sm:hidden">|</span>
            <span className="text-xs sm:text-sm text-zinc-400 truncate max-w-[120px] sm:max-w-none">Template: {template.name}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
            <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">No date on PDF: uncheck &quot;Headers and footers&quot; in Print dialog</span>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium hover:bg-white/15"
            >
              <Printer size={14} className="sm:w-4 sm:h-4" /> <span className="max-sm:hidden">Print / PDF</span><span className="sm:hidden">Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-indigo-600 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Download size={14} className="sm:w-4 sm:h-4" /> <span className="max-sm:hidden">Download PDF</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resume: strict one page (11in); content scales to fit */}
      <main className="flex-1 py-4 sm:py-6 px-3 sm:px-4 overflow-auto">
        <div ref={wrapperRef} className={ONE_PAGE_WRAPPER_CLASS}>
          <div
            ref={contentRef}
            className="resume-content-fit w-full origin-top-left flex flex-col min-h-0"
            style={{
              transform: `scale(${fitScale})`,
              width: fitScale < 1 ? `${100 / fitScale}%` : "100%",
              ...(fitScale < 1 ? { position: "absolute", top: 0, left: 0 } : { flex: 1 }),
            }}
          >
            {(() => {
              const layout = getLayoutType(template);
              /* All layouts use same multi-page wrapper and print CSS above */
              if (layout === "resume3") return <Resume3Layout data={displayData} />;
              if (layout === "resume4") return <Resume4Layout data={displayData} />;
              if (layout === "resume5") return <Resume5Layout data={displayData} />;
              if (layout === "resume6") return <Resume6Layout data={displayData} />;
              return <Resume2Layout data={displayData} />;
            })()}
            <footer className="resume-doc-footer mt-auto pt-2 text-center text-zinc-500 text-[10px] sm:text-xs print:text-[10px] print:text-zinc-600">
              Made by Resume AI
            </footer>
          </div>
        </div>
      </main>

      {/* Print / PDF: one page only (11in). Turn off "Headers and footers" in Print dialog to hide date. */}
      <style>{`
        @page { size: letter; margin: 0; }
        @media print {
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
          .resume-one-page {
            height: 11in !important;
            max-height: 11in !important;
            min-height: 11in !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .resume-content-fit {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-document {
            box-shadow: none !important;
            height: 100% !important;
            max-height: 11in !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-document * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          main { background: transparent !important; padding: 0 !important; overflow: visible !important; }
        }
      `}</style>
      <AppFooter  />
    </div>
  );
}
