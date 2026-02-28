import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, Printer, Download, Phone, Mail } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { getResumeContentForView } from "./utils/detailApi.js";
import { parseResume } from "./utils/parseResume.js";
import { clearUser } from "./slice/user.slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; 

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

function Topbar({ onLogout }) {
  return <AppHeader onLogout={onLogout} />;
}
export default function ResumeDesignView() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();


const handleLogout = async () => {
  try {
    await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
    dispatch(clearUser());
    navigate("/login");
  } catch (error) {
    console.error("Logout failed", error);
  }
};
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
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "Failed to load template");
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading || detailLoading) {
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/templates/resumedesign"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={18} /> Back
            </Link>
            <span className="text-zinc-500">|</span>
            <span className="text-sm text-zinc-400">Template: {template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/15"
            >
              <Printer size={16} /> Print / PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Full resume document: two-column layout (your design) */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <article
          className="resume-document max-w-4xl mx-auto bg-white text-black shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none flex min-h-[80vh]"
        >
          {/* Left column: grey - Contact, Education, Skills */}
          <aside className="w-[36%] min-w-[200px] bg-zinc-200 print:bg-zinc-200 p-6 flex flex-col">
            <section className="mb-6">
              <div className="space-y-2 text-sm text-black">
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
              <section className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-3">
                  Education
                </h2>
                <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{data.education}</p>
              </section>
            )}

            {data.skills?.length > 0 && (
              <section className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-3">
                  Skills
                </h2>
                <ul className="space-y-1 text-sm text-black list-disc list-inside">
                  {data.skills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}

            {data.languageProficiency && (
              <section className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-3">
                  Languages
                </h2>
                <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{data.languageProficiency}</p>
              </section>
            )}
          </aside>

          {/* Right column: white - Name, Role, Summary, Experience, Projects */}
          <div className="flex-1 p-8 bg-white">
            <header className="border-b border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase tracking-wide text-zinc-600">
                {data.name || "Your Name"}
              </h1>
              <p className="text-lg font-semibold uppercase tracking-wide text-zinc-600 mt-0.5">
                {data.role || "Your Role"}
              </p>
            </header>

            {data.summary && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-3">
                  Professional Summary
                </h2>
                <p className="text-sm text-black leading-relaxed">{data.summary}</p>
              </section>
            )}

            {data.experience?.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-4">
                  Experience
                </h2>
                <div className="space-y-5">
                  {data.experience.map((entry, i) => {
                    const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                    const roleTitle = lines[0] || "Role";
                    const bullets = lines.slice(1);
                    return (
                      <div key={i}>
                        <h3 className="text-base font-bold text-black">{roleTitle}</h3>
                        {bullets.length > 0 ? (
                          <ul className="mt-2 space-y-1.5 text-sm text-black list-disc list-inside pl-0">
                            {bullets.map((bullet, j) => (
                              <li key={j} className="leading-snug">{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-black whitespace-pre-wrap">{entry}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {data.projects?.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-black pb-1 mb-3">
                  Projects
                </h2>
                <div className="space-y-2">
                  {data.projects.map((project, i) => (
                    <p key={i} className="text-sm text-black leading-relaxed whitespace-pre-wrap">{project}</p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
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
