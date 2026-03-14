import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, Printer, Download, Phone, Mail, MapPin, Linkedin, Award, Globe, User, GraduationCap, Briefcase, FolderOpen, ListChecks } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { getResumeContentForView } from "./utils/detailApi.js";
import Resume2Layout from "./Resume2Layout";
import Resume7Layout from "./Resume7Layout";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

/** Placeholder data so logged-out users can still view template designs */
const PLACEHOLDER_RESUME_DATA = {
  name: "Your Name",
  role: "Your Role",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  experience: [
    "Job Title\nCompany Name\n2020 â€“ Present\nBrief description of your role and key responsibilities.",
    "Previous Role\nPrevious Company\n2018 â€“ 2020\nSummary and achievements.",
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

function Topbar() {
  return <AppHeader />;
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
          <span key={i} className={`${tagClass} wrap-break-words`}>{skill}</span>
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
        <li key={i} className={`flex items-start gap-2 before:content-['â€¢'] before:shrink-0 before:font-bold ${bullet}`}>
          <span className="wrap-break-words">{skill}</span>
        </li>
      ))}
    </ul>
  );
}

const RESUME2_SECTION_HEAD = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black pb-1 mb-2 border-b-2 border-orange-500";

/** Resume 1: two-column classic (blue left with photo/contact/about/skills, white right with purple accent, education/experience/references). */
function Resume1Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col md:flex-row print:flex-row overflow-visible`}>
      {/* Left column: solid dark blue – name, title, contact under title, ABOUT ME, SKILLS */}
      <div className="w-full md:w-[36%] print:w-[36%] min-h-0 flex flex-col bg-[#1e3a5f] print:bg-[#1e3a5f] text-white overflow-visible">
        {/* Header: name + title + contact directly below */}
        <div className="pt-6 pb-4 px-4 sm:px-5 border-b border-white/10">
          <h1 className="text-2xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{name}</h1>
          <p className="mt-1 text-sm text-zinc-300 font-medium">{role}</p>
          <div className="mt-2.5 space-y-1.5 text-sm text-zinc-200">
            {data?.phone && (
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-white" /> {data.phone}
              </p>
            )}
            {data?.email && (
              <p className="flex items-center gap-2 break-all">
                <Mail size={14} className="shrink-0 text-white" /> {data.email}
              </p>
            )}
            {(data?.location || data?.address) && (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-white" /> {data.location || data.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-5 pt-3 pb-5 space-y-4">
          {summary && (
            <section>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white mb-2">
                <User size={14} className="shrink-0 text-white" /> About Me
              </h2>
              <p className="text-xs text-zinc-200 leading-snug">{summary}</p>
            </section>
          )}

          <section>
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white mb-2.5">
              <ListChecks size={14} className="shrink-0 text-white" /> Skills
            </h2>
            {skillsList.length > 0 ? (
              <ul className="space-y-0.5 text-sm text-zinc-200 list-none pl-0">
                {skillsList.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" aria-hidden />
                    <span className="leading-snug">{typeof s === "string" ? s : s?.label ?? ""}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400 italic">Add your skills in your details.</p>
            )}
          </section>
        </div>
      </div>

      {/* Right column: purple top line, education, experience, references */}
      <div className="w-full md:w-[64%] print:w-[64%] min-h-0 flex flex-col bg-white print:bg-white overflow-visible relative">
        <div className="h-1 bg-violet-600 print:bg-violet-600 shrink-0" aria-hidden />

        <div className="flex-1 px-4 sm:px-5 py-3 space-y-4">
          {(data?.education || educationParsed) && (
            <section>
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800 pb-1 mb-2 border-b border-zinc-300">
                <GraduationCap size={12} className="shrink-0 text-[#1e3a5f]" /> Education
              </h2>
              <div className="space-y-2">
                {educationParsed ? (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5">
                    <div>
                      <p className="text-[10px] font-bold text-black leading-snug">{educationParsed.degree}</p>
                      <p className="text-[10px] text-zinc-700 leading-snug">{educationParsed.institution}</p>
                    </div>
                    {educationParsed.dates && (
                      <span className="text-[9px] text-zinc-500 shrink-0 sm:mt-0 mt-0.5">{educationParsed.dates}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-700 whitespace-pre-wrap leading-snug">{data.education}</p>
                )}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section>
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800 pb-1 mb-2 border-b border-zinc-300">
                <Briefcase size={12} className="shrink-0 text-[#1e3a5f]" /> Experience
              </h2>
              <div className="space-y-3">
                {experienceEntries.map((entry, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-black leading-snug">{entry.jobTitle || "Role"}</p>
                      {entry.company && <p className="text-[10px] text-zinc-700 leading-snug">{entry.company}</p>}
                      {entry.bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5 list-none pl-0 text-[10px] text-zinc-700">
                          {entry.bullets.map((b, j) => (
                            <li key={j} className="flex gap-1.5 leading-snug">
                              <span className="w-1 h-1 rounded-full bg-[#1e3a5f] shrink-0 mt-1.5" aria-hidden />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {entry.datesOrLocation && (
                      <span className="text-[9px] text-zinc-500 shrink-0 sm:mt-0 mt-0.5">{entry.datesOrLocation}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data?.projects?.length > 0) && (
            <section>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 pb-1.5 mb-3 border-b border-zinc-300">
                <FolderOpen size={14} className="shrink-0 text-[#1e3a5f]" /> Projects
              </h2>
              <ul className="space-y-2 list-none pl-0">
                {data.projects.filter(Boolean).map((project, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] shrink-0 mt-1.5" aria-hidden />
                    <span className="whitespace-pre-wrap">{typeof project === "string" ? project : project?.title || project?.description || ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ResumeDesignView() {
  const { id } = useParams();
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
        <Topbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-zinc-400">Loadingâ€¦</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar />
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

      {/* Resume: strict one page (11in). On screen content scales to fit; PDF/print is same on mobile and laptop (letter, desktop layout). */}
      <main className="flex-1 py-4 sm:py-6 px-1 sm:px-4 overflow-auto print:p-0">
        <div ref={wrapperRef} className={`${ONE_PAGE_WRAPPER_CLASS} print:max-w-none`}>
          <div
            ref={contentRef}
            className="resume-content-fit w-full origin-top-left flex flex-col min-h-0"
            style={{
              transform: `scale(${fitScale})`,
              width: fitScale < 1 ? `${100 / fitScale}%` : "100%",
              ...(fitScale < 1 ? { position: "absolute", top: 0, left: 0 } : { flex: 1 }),
            }}
          >
            {template?.name && (template.name.includes("1") || template.name.toLowerCase().includes("classic")) ? (
              <Resume1Layout data={displayData} />
            ) : template?.name && template.name.includes("7") ? (
              <Resume7Layout data={displayData} />
            ) : (
              <Resume2Layout data={displayData} />
            )}
            <footer className="resume-doc-footer mt-auto pt-2 text-center text-zinc-500 text-[10px] sm:text-xs print:text-[10px] print:text-zinc-600">
              Made by Resume AI
            </footer>
          </div>
        </div>
      </main>

      {/* Print / PDF: same output on mobile and laptop (letter, one page). Turn off "Headers and footers" in Print dialog to hide date. */}
      <style>{`
        @page { size: letter; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; width: 100% !important; }
          .print\\:hidden { display: none !important; }
          main {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .resume-one-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 11in !important;
            max-height: 11in !important;
            min-height: 11in !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Force same PDF on mobile and laptop: no viewport scaling in print */
          .resume-content-fit {
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-document {
            box-shadow: none !important;
            height: 100% !important;
            max-height: 11in !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-document * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <AppFooter  />
    </div>
  );
}
