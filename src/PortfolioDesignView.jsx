import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ArrowLeft, Sparkles, Mail, Phone, Download, ChevronRight, Linkedin, Lock, ArrowUpRight } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import PortfolioHTMLDownload from "./Download";
import { getResumeContentForView } from "./utils/detailApi.js";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com/api/v1/user";

/** Placeholder data so logged-out users can still view portfolio template */
const PLACEHOLDER_PORTFOLIO_DATA = {
  name: "Your Name",
  role: "Your Role / Title",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: [],
  experience: [],
  education: "",
  projects: [],
  languageProficiency: "",
  email: "email@example.com",
  phone: "+1 234 567 8900",
  location: "",
  website: "",
  linkedin: "",
};

const NAV_LINKS = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#services", label: "Services" },
  { to: "#projects", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

function getLayoutType(template) {
  const n = (template?.name || "").toLowerCase();
  if (n.includes("portfolio 2") || n.includes("portfolio2")) return "portfolio2";
  return "portfolio1";
}

/** Portfolio 2: Dark agency-style layout (hero + about + CTA sections). Uses displayData for all text. */
function Portfolio2Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";
  const headline = role || "RECOGNIZE POTENTIAL";
  const tagline = summary ? summary.slice(0, 120) + (summary.length > 120 ? "…" : "") : "Discover the power of innovation and embrace growth with bold strategies.";
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const partnerLabels = skills.length >= 3 ? skills.slice(0, 6) : projects.length >= 2 ? projects.map((p) => (p || "").slice(0, 20)) : ["Zoom", "Google", "Partners", "Clients", "Brands", "Studio"];
  const contactHref = data?.email ? `mailto:${data.email}` : "#contact";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ——— Section 1: Hero ——— */}
      <section className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <a href="#menu" className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/90 hover:text-white">Menu</a>
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white text-sm font-bold">
            {initials[0] || "P"}
          </span>
          <a href={contactHref} className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/90 hover:text-white">Contact us</a>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 relative flex items-center justify-center lg:justify-start order-2 lg:order-1 px-4 sm:px-6 lg:pl-12">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden bg-neutral-800">
              {data?.avatar || data?.profileImage ? (
                <img src={data.avatar || data.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white/30">{initials}</div>
              )}
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(90deg, rgba(220,38,38,0.15) 1px, transparent 1px), linear-gradient(rgba(220,38,38,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px" }} aria-hidden />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0 order-1 lg:order-2 text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.1]">
              {headline.split(/\s+/).slice(0, 2).join(" ")}
              <br />
              {headline.split(/\s+/).slice(2).join(" ") || "\u00A0"}
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-white/60 uppercase tracking-wide max-w-lg">
              {tagline}
            </p>
            <a href={contactHref} className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white hover:text-white/80">
              Get in touch <ArrowUpRight className="h-4 w-4 text-orange-500" />
            </a>
          </div>
        </div>

        <footer className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t border-white/10">
          <span className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80">{role}</span>
          <span className="text-xs sm:text-sm text-white/60 uppercase tracking-widest">IG / LN / TW / WA</span>
          <span className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80">Scroll for more</span>
        </footer>
      </section>

      {/* ——— Section 2: About + partners bar ——— */}
      <section id="about" className="min-h-screen flex flex-col justify-between py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <a href="#about" className="self-start text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white mb-8 sm:mb-12">About us</a>
        <div className="flex-1 flex flex-col justify-center max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase leading-tight tracking-tight text-right">
            <span className="block">Let&apos;s work together</span>
            <span className="block mt-2 sm:mt-4 pl-8 sm:pl-16">to recognize your</span>
            <span className="block mt-2 sm:mt-4 pl-16 sm:pl-24">potential</span>
            <span className="block mt-2 sm:mt-4 pl-8 sm:pl-16">and shape</span>
            <span className="block mt-2 sm:mt-4">a future</span>
            <span className="block mt-2 sm:mt-4 pl-16 sm:pl-24">where</span>
            <span className="block mt-2 sm:mt-4 pl-16 sm:pl-24">your brand shines</span>
          </h2>
          <p className="mt-6 sm:mt-8 text-white/60 text-right max-w-xl ml-auto text-sm sm:text-base">{summary || "We help you grow."}</p>
        </div>
        <div className="mt-12 sm:mt-16 w-full rounded-t-xl sm:rounded-t-2xl bg-red-600 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 text-sm sm:text-base font-medium uppercase">
            {partnerLabels.slice(0, 6).map((label, i) => (
              <span key={i} className="text-white/95">{typeof label === "string" ? label : String(label).slice(0, 15)}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Section 3: CTA + footer ——— */}
      <section id="contact" className="min-h-screen flex flex-col justify-between py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <a href="#contact" className="self-start text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white mb-8 sm:mb-12">Let&apos;s get started</a>
        <div className="flex-1 flex flex-col justify-center items-end">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase leading-tight tracking-tight text-right max-w-4xl">
            <span className="block">Let&apos;s take your brand</span>
            <span className="block mt-2 sm:mt-4">to the next level</span>
            <span className="block mt-2 sm:mt-4 pl-8 sm:pl-16">whether you&apos;re</span>
            <span className="block mt-2 sm:mt-4 pl-16 sm:pl-24">looking to rebrand</span>
            <span className="block mt-2 sm:mt-4 pl-8 sm:pl-16">stunning campaign</span>
            <span className="block mt-2 sm:mt-4 pl-16 sm:pl-24">or develop a digital</span>
            <span className="block mt-2 sm:mt-4 pl-8 sm:pl-16">strategy</span>
          </h2>
        </div>
        <footer className="flex items-center justify-between pt-8 sm:pt-12 border-t border-white/10">
          <a href="#menu" className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white">Menu</a>
          <span className="text-xs sm:text-sm text-white/60 uppercase tracking-widest">IG / LN / TW / WA</span>
          <a href={contactHref} className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white">Contact us</a>
        </footer>
      </section>
    </div>
  );
}

export default function PortfolioDesignView() {
  const { id } = useParams();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;
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
      const content = await getResumeContentForView();
      if (!cancelled) {
        setData(content);
        setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displayData = data || PLACEHOLDER_PORTFOLIO_DATA;
  const isPlaceholder = !data;
  const firstName = displayData?.name?.split(/\s+/)[0] || "Portfolio";
  const initials = displayData?.name?.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";

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

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 sm:p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Portfolio is premium</h1>
            <p className="text-neutral-600 text-sm sm:text-base mb-6">
              Upgrade to view and use portfolio templates.
            </p>
            <Link
              to="/price"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-500 transition-all"
            >
              <Lock className="h-4 w-4" /> Upgrade to unlock
            </Link>
          </div>
          <Link to="/templates/design" className="mt-6 text-neutral-500 hover:text-neutral-700 text-sm">
            <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to template type
          </Link>
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

  const layout = getLayoutType(template);
  const isPortfolio2 = layout === "portfolio2";

  return (
    <div className={`min-h-screen flex flex-col ${isPortfolio2 ? "bg-[#0a0a0a]" : "bg-white text-neutral-900"}`} id="home">
      {isPlaceholder && (
        <div className="print:hidden bg-amber-500/20 border-b border-amber-400/30 px-3 sm:px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-800">
              Viewing with sample data. Sign in to use your own details and save your portfolio.
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
                className="inline-flex items-center rounded-lg border border-amber-600/50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="print:hidden fixed top-4 right-4 z-30 flex items-center gap-2">
        <Link
          to="/templates/portfoliodesign"
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${isPortfolio2 ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-black"}`}
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium ${isPortfolio2 ? "border-orange-500 bg-orange-600 text-white hover:bg-orange-500" : "border-emerald-500 bg-black text-white hover:bg-neutral-800"}`}
        >
          <Download size={14} /> Download PDF
        </button>
      </div>

      <PortfolioHTMLDownload showDownloadHeader={false}>
        {isPortfolio2 ? (
          <Portfolio2Layout data={displayData} />
        ) : (
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
                  Hi everyone 👋, I'm {displayData.name}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight leading-tight">
                  {displayData.role}
                </h1>
                {displayData.summary && (
                  <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
                    {displayData.summary}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={displayData.email ? `mailto:${displayData.email}` : "#contact"}
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
                    {displayData.email && (
                      <a
                        href={`mailto:${displayData.email}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        aria-label="Email"
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {displayData.phone && (
                      <a
                        href={`tel:${displayData.phone}`}
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
        )}
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
