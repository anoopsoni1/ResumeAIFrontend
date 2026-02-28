import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Sparkles, Mail, Phone, Download, ChevronRight, Linkedin } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import PortfolioHTMLDownload from "./Download";
import { getResumeContentForView } from "./utils/detailApi.js";
import { parseResume } from "./utils/parseResume.js";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

const NAV_LINKS = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#services", label: "Services" },
  { to: "#projects", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

export default function PortfolioDesignView() {
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

  const firstName = data?.name?.split(/\s+/)[0] || "Portfolio";
  const initials = data?.name?.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";

  if (loading || detailLoading) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-neutral-500">Loading…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-amber-600">{error || "Template not found"}</p>
          <Link
            to="/templates/portfoliodesign"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft size={18} /> Back to portfolio designs
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300">
            <Sparkles className="text-emerald-600" size={28} />
          </div>
          <p className="text-neutral-500 text-center max-w-md">
            Portfolio is built from your saved details or from an uploaded & edited resume. Add details or upload and edit first.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/add-details"
              className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-4 py-2 text-sm font-medium border-2 border-emerald-500 hover:bg-neutral-800"
            >
              Add details
            </Link>
            <Link
              to="/edit-resume"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-emerald-500 hover:text-emerald-700"
            >
              Upload & edit resume
            </Link>
            <Link
              to="/templates/portfoliodesign"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-black font-medium"
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col" id="home">
      <div className="print:hidden fixed top-4 right-4 z-30 flex items-center gap-2">
        <Link
          to="/templates/portfoliodesign"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-black font-medium"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-emerald-500 bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-800"
        >
          <Download size={14} /> Download PDF
        </button>
      </div>

      <PortfolioHTMLDownload showDownloadHeader={false}>
        <div className="min-h-screen bg-white overflow-hidden">
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-neutral-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold bg-emerald-500"
                >
                  {firstName[0]?.toUpperCase() || "P"}
                </span>
                <span className="text-lg font-semibold text-black">{firstName}</span>
              </Link>
              <nav className="hidden sm:flex items-center gap-8">
                {NAV_LINKS.map(({ to, label }) => (
                  <a
                    key={label}
                    href={to}
                    className={`text-sm font-medium transition-colors ${
                      label === "Home"
                        ? "text-black flex items-center gap-1.5"
                        : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    {label === "Home" && (
                      <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-emerald-500" />
                    )}
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block rounded-lg border-2 border-emerald-500 bg-black text-white px-4 py-2 mb-6 text-sm font-medium">
                  Hi everyone 👋, I'm {data.name}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight leading-tight">
                  {data.role}
                </h1>
                {data.summary && (
                  <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
                    {data.summary}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={data.email ? `mailto:${data.email}` : "#contact"}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-500 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Get In Touch
                    <ChevronRight size={18} className="text-emerald-400" />
                  </a>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 text-black font-medium hover:underline"
                  >
                    Download CV
                    <Download size={18} />
                  </button>
                </div>
                <div className="mt-10">
                  <p className="text-sm text-neutral-600 mb-3">Find me on:</p>
                  <div className="flex items-center gap-3">
                    {data.email && (
                      <a
                        href={`mailto:${data.email}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        aria-label="Email"
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {data.phone && (
                      <a
                        href={`tel:${data.phone}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        aria-label="Phone"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-emerald-500 hover:opacity-90 transition-opacity"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
                <div className="relative">
                  <div
                    className="absolute -top-4 -left-4 w-14 h-16 border-l-2 border-t-2 border-black rounded-tl-lg"
                    aria-hidden
                  />
                  <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <span className="text-6xl sm:text-7xl font-bold text-neutral-400 select-none">
                      {initials}
                    </span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 sm:w-52 sm:h-52 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-emerald-500 opacity-90 -z-10" />
                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 -translate-y-12 flex flex-col items-center gap-2 lg:left-0 lg:top-1/2 lg:bottom-auto lg:-translate-x-16 lg:-translate-y-1/2">
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-300 flex items-center justify-center">
                      <span className="text-neutral-400 text-xs font-medium">↓</span>
                    </div>
                    <p className="text-xs text-neutral-500 text-center max-w-[80px]">explore about me</p>
                    <p className="text-xs text-neutral-500">scroll down</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AppFooter />
        </div>
      </PortfolioHTMLDownload>

      <style>{`
        @media print {
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
