import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ArrowLeft, FileText, Printer, Download, Phone, Mail, MapPin, Linkedin, Award } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { getResumeContentForView } from "./utils/detailApi.js";
import { parseResume } from "./utils/parseResume.js";
import { clearUser } from "./slice/user.slice";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none min-h-0";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}

function getLayoutType(template) {
  const n = (template?.name || "").toLowerCase();
  if (n.includes("resume3") || n.includes("resume 3")) return "resume3";
  return "resume2";
}

function parseExperienceEntry(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { roleTitle: lines[0] || "Role", bullets: lines.slice(1) };
}

function ContactStrip({ data, linkClass = "text-blue-600 hover:underline" }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-6 text-xs sm:text-sm">
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

function ExperienceList({ experience, bulletListClass = "mt-2 space-y-1.5 text-xs sm:text-sm text-black list-disc list-inside pl-0" }) {
  if (!experience?.length) return null;
  return (
    <div className="space-y-4 sm:space-y-5">
      {experience.map((entry, i) => {
        const { roleTitle, bullets } = parseExperienceEntry(entry);
        return (
          <div key={i}>
            <h3 className="text-sm sm:text-base font-bold text-black">{roleTitle}</h3>
            {bullets.length > 0 ? (
              <ul className={bulletListClass}>
                {bullets.map((bullet, j) => (
                  <li key={j} className="leading-snug">{bullet}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs sm:text-sm text-black whitespace-pre-wrap">{entry}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Resume2Layout({ data }) {
  const sideHeading = "text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-2 sm:mb-3";
  const mainHeading = "text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-2 sm:mb-3";
  const mainHeadingMb4 = `${mainHeading} mb-3 sm:mb-4`;
  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col md:flex-row print:flex-row`}>
      <aside className="w-full md:w-[36%] md:min-w-[200px] print:w-[36%] bg-zinc-200 print:bg-zinc-200 p-4 sm:p-5 md:p-6 flex flex-col order-2 md:order-1">
        <section className="mb-4 sm:mb-6">
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-black">
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-black" />
                <a href={`tel:${data.phone}`}>{data.phone}</a>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-black" />
                <a href={`mailto:${data.email}`} className="break-all">{data.email}</a>
              </div>
            )}
          </div>
        </section>
        {data.education && (
          <section className="mb-4 sm:mb-6">
            <h2 className={sideHeading}>Education</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap">{data.education}</p>
          </section>
        )}
        {data.skills?.length > 0 && (
          <section className="md:flex-1">
            <h2 className={sideHeading}>Skills</h2>
            <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-black list-disc list-inside">
              {data.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        {data.languageProficiency && (
          <section className="mt-4 sm:mt-6">
            <h2 className={sideHeading}>Languages</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap">{data.languageProficiency}</p>
          </section>
        )}
      </aside>
      <div className="flex-1 w-full p-4 sm:p-5 md:p-8 bg-white order-1 md:order-2">
        <header className="border-b border-black pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-zinc-600">{data.name || "Your Name"}</h1>
          <p className="text-base sm:text-lg font-semibold uppercase tracking-wide text-zinc-600 mt-0.5">{data.role || "Your Role"}</p>
        </header>
        {data.summary && (
          <section className="mb-4 sm:mb-6">
            <h2 className={mainHeading}>Professional Summary</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience?.length > 0 && (
          <section className="mb-4 sm:mb-6">
            <h2 className={mainHeadingMb4}>Experience</h2>
            <ExperienceList experience={data.experience} />
          </section>
        )}
        {data.projects?.length > 0 && (
          <section>
            <h2 className={mainHeading}>Projects</h2>
            <div className="space-y-1.5 sm:space-y-2">
              {data.projects.map((project, i) => (
                <p key={i} className="text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap">{project}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Resume3Layout({ data }) {
  const headingClass = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-1 mb-2 sm:mb-3";
  const headingClassMb4 = `${headingClass} mb-3 sm:mb-4`;
  return (
    <article className={`${DOCUMENT_CLASS} max-w-3xl`}>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <header className="text-center border-b border-emerald-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{data.name || "Your Name"}</h1>
          <p className="text-emerald-600 font-medium mt-1 sm:mt-2 text-sm sm:text-base">{data.role || "Your Role"}</p>
          <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1">
            <ContactStrip data={data} linkClass="text-emerald-600 hover:underline" />
          </div>
        </header>
        {data.summary && (
          <section className="mb-4 sm:mb-6">
            <h2 className={headingClass}>Summary</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.skills?.length > 0 && (
          <section className="mb-4 sm:mb-6">
            <h2 className={headingClass}>Skills</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{s}</span>
              ))}
            </div>
          </section>
        )}
        {data.experience?.length > 0 && (
          <section className="mb-4 sm:mb-6">
            <h2 className={headingClassMb4}>Experience</h2>
            <ExperienceList experience={data.experience} />
          </section>
        )}
        {data.education && (
          <section className="mb-4 sm:mb-6">
            <h2 className={headingClass}>Education</h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap">{data.education}</p>
          </section>
        )}
        {data.projects?.length > 0 && (
          <section>
            <h2 className={headingClass}>Projects</h2>
            <div className="space-y-1.5 sm:space-y-2">
              {data.projects.map((project, i) => (
                <p key={i} className="text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap">{project}</p>
              ))}
            </div>
          </section>
        )}
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
      const content = await getResumeContentForView(parseResume);
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

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <FileText className="text-zinc-500" size={48} />
          <p className="text-zinc-400 text-center max-w-md">
            Resume is built from your saved details or from an uploaded & edited resume. Add details or upload and edit first.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/add-details"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add details
            </Link>
            <Link
              to="/edit-resume"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Upload & edit resume
            </Link>
            <Link
              to="/templates/resumedesign"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={18} /> Back to designs
            </Link>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* <Topbar onLogout={handleLogout} /> */}

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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

      {/* Full resume document: layout depends on template (Resume 2 or 3) */}
      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 overflow-visible">
        {(() => {
          const layout = getLayoutType(template);
          if (layout === "resume3") return <Resume3Layout data={data} />;
          return <Resume2Layout data={data} />;
        })()}
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
          .resume-document { box-shadow: none !important; }
        }
      `}</style>
      <AppFooter  />
    </div>
  );
}
