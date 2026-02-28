import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, Printer, Download } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { getResumeContentForView } from "./utils/detailApi.js";
import { parseResume } from "./utils/parseResume.js";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

export default function ResumeDesignView() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <AppHeader />
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
        <AppHeader />
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
        <AppHeader />
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
      <AppHeader />

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

      {/* Full resume document */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <article
          className="resume-document max-w-4xl mx-auto bg-white text-zinc-800 shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none"
          style={{ minHeight: "80vh" }}
        >
          {/* Design badge (template name) - subtle */}
          <div className="px-8 pt-6 pb-2 border-b border-zinc-200 print:border-zinc-300">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              Resume · {template.name}
            </p>
          </div>

          {/* Header: Name, role, contact */}
          <header className="px-8 pt-6 pb-6 text-center border-b border-zinc-200 print:border-zinc-300">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              {data.name}
            </h1>
            <p className="mt-1 text-lg text-zinc-600 font-medium">{data.role}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-zinc-600">
              {data.email && (
                <a href={`mailto:${data.email}`} className="hover:text-indigo-600">
                  {data.email}
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="hover:text-indigo-600">
                  {data.phone}
                </a>
              )}
            </div>
          </header>

          <div className="px-8 py-6 sm:py-8 space-y-6">
            {/* Summary */}
            {data.summary && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Summary
                </h2>
                <p className="text-zinc-700 leading-relaxed">{data.summary}</p>
              </section>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Skills
                </h2>
                <p className="text-zinc-700 leading-relaxed">
                  {data.skills.join(" · ")}
                </p>
              </section>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Experience
                </h2>
                <div className="space-y-4">
                  {data.experience.map((entry, i) => {
                    const lines = entry.split("\n").map((l) => l.trim()).filter(Boolean);
                    const roleTitle = lines[0] || "Role";
                    const bullets = lines.slice(1);
                    return (
                      <div key={i}>
                        <h3 className="font-semibold text-zinc-900">{roleTitle}</h3>
                        {bullets.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-zinc-700 text-sm list-disc list-inside">
                            {bullets.map((bullet, j) => (
                              <li key={j}>{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="mt-2 text-zinc-700 text-sm whitespace-pre-wrap font-sans">
                            {entry}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects?.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Projects
                </h2>
                <div className="space-y-3">
                  {data.projects.map((project, i) => (
                    <p key={i} className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {project}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Education
                </h2>
                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {data.education}
                </p>
              </section>
            )}

            {/* Language proficiency */}
            {data.languageProficiency && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1 mb-3">
                  Language Proficiency
                </h2>
                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {data.languageProficiency}
                </p>
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

      <AppFooter />
    </div>
  );
}
