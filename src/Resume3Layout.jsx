import { Phone, Mail } from "lucide-react";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

/** Parse experience entry into job title, company, dates, bullets */
function parseExperienceEntryDetailed(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    jobTitle: lines[0] || "",
    company: lines[1] || "",
    datesOrLocation: lines[2] || "",
    bullets: lines.slice(3),
  };
}

/** Parse education string; supports multiple entries separated by double newline. */
function parseEducationList(education) {
  if (!education || !String(education).trim()) return [];
  const blocks = education.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      institution: lines[1] || "",
      dates: lines[2] || "",
    };
  });
}

/** Single education block (one degree) - first 3 lines as degree, institution, dates */
function parseEducationSingle(education) {
  if (!education || !String(education).trim()) return null;
  const lines = education.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    degree: lines[0] || "",
    institution: lines[1] || "",
    dates: lines[2] || "",
  };
}

/** Section header: circle with diamond icon + title + horizontal line */
function SectionHead({ title }) {
  return (
    <div className="flex items-center gap-2 pb-1 mb-2 border-b border-zinc-300">
      <span
        className="w-4 h-4 rounded-full bg-zinc-600 flex items-center justify-center shrink-0"
        aria-hidden
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-white">
          <path d="M4 0L8 4L4 8L0 4L4 0Z" fill="currentColor" />
        </svg>
      </span>
      <h2 className="text-xs font-bold text-black uppercase tracking-wide">{title}</h2>
    </div>
  );
}

/** Decorative fading dots pattern for top-right */
function DotsPattern() {
  return (
    <div
      className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 pointer-events-none opacity-90"
      aria-hidden
    >
      <svg width="100%" height="100%" className="text-zinc-300">
        <defs>
          <pattern
            id="resume3-dots"
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="1" fill="currentColor" />
          </pattern>
          <linearGradient id="resume3-dots-fade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#resume3-dots)" opacity="1" />
        <rect width="100%" height="100%" fill="url(#resume3-dots-fade)" />
      </svg>
    </div>
  );
}

/** Resume 3: two-column grayscale layout – left: Summary, Experience, Projects; right: Education, Skills, Language. Section headers with diamond icon. */
export default function Resume3Layout({ data }) {
  const name = data?.name || "Lorna Alvarado";
  const role = data?.role || "Marketing Manager";
  const summary =
    data?.summary ||
    "I am a Sales Representative, a professional who initializes and manages relationships with customers. They serve as their point of contact and lead from initial outreach through the making of the final purchase by them or someone in their household.";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationList = parseEducationList(data?.education);
  const educationSingle = educationList.length === 0 ? parseEducationSingle(data?.education) : null;
  const languageText = data?.languageProficiency || "";
  const languageList = languageText
    ? languageText.split(/[,;|\n]/).map((s) => s.trim()).filter(Boolean)
    : ["English"];

  const defaultSkills =
    skillsList.length > 0
      ? skillsList
      : [
          "Client Acquisition",
          "B2B Sales",
          "Negotiation",
          "Relationship Management",
          "Market Analysis",
          "Sales Strategies",
          "Problem-Solving",
          "Time Management",
          "Presentation Skills",
          "Networking",
          "Market Research",
        ];

  const defaultExperience =
    experienceEntries.length > 0
      ? experienceEntries
      : [
          {
            jobTitle: "Senior Sales Representative",
            company: "Timmerman Industries",
            datesOrLocation: "January 2021 to Present",
            bullets: [
              "Developed and executed sales strategies, resulting in a 25% increase in annual revenue.",
              "Conducted market research to identify new business opportunities.",
            ],
          },
          {
            jobTitle: "Sales Agent",
            company: "Timmerman Industries",
            datesOrLocation: "June 2017 to December 2020",
            bullets: [
              "Prospected and qualified leads through cold calling and networking events.",
              "Increased sales by 20% by implementing upselling and cross-selling strategies.",
            ],
          },
        ];

  const defaultProjects =
    projectsList.length > 0
      ? projectsList
      : [
          "E-commerce platform – Led end-to-end development, increasing conversion by 18%.",
          "CRM integration – Built API integrations for sales team, reducing manual data entry by 40%.",
        ];

  const defaultEducation =
    educationList.length > 0 || educationSingle
      ? educationList.length > 0
        ? educationList
        : educationSingle
          ? [educationSingle]
          : []
      : [
          { institution: "Borcelle University", degree: "Bachelor of Business Management", dates: "2020 - 2023" },
          { institution: "Wardiere University", degree: "Bachelor of Business Management", dates: "2016 - 2020" },
          { institution: "Wardiere University", degree: "Bachelor of Business Management", dates: "2012 - 2016" },
        ];

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white border border-zinc-200 print:border-zinc-300 relative`}
    >
      <DotsPattern />

      {/* Header: name + role on left, contact beside (right) */}
      <header className="px-4 sm:px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 tracking-tight">{name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{role}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 shrink-0">
          {data?.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-1.5">
              <Phone size={14} className="shrink-0 text-zinc-600" /> {data.phone}
            </a>
          )}
          {data?.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-1.5 break-all">
              <Mail size={14} className="shrink-0 text-zinc-600" /> {data.email}
            </a>
          )}
          {!data?.phone && !data?.email && (
            <>
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="shrink-0 text-zinc-600" /> +123-456-7890
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="shrink-0 text-zinc-600" /> hello@reallygreatsite.com
              </span>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row print:flex-row flex-1 min-h-0 px-4 sm:px-6 pb-5">
        {/* Left column: Summary, Experience, Projects */}
        <div className="w-full md:w-[62%] print:w-[62%] min-h-0 flex flex-col pr-4">
          <section className="mb-4">
            <SectionHead title="Summary" />
            <p className="text-xs text-zinc-700 leading-relaxed">{summary}</p>
          </section>

          <section className="mb-4">
            <SectionHead title="Experience" />
            <div className="space-y-3">
              {defaultExperience.map((entry, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-black leading-snug">{entry.jobTitle}</p>
                  <p className="text-xs text-zinc-600 leading-snug">{entry.company}</p>
                  <p className="text-[11px] text-zinc-500 leading-snug">{entry.datesOrLocation}</p>
                  {entry.bullets.length > 0 && (
                    <ul className="mt-1 space-y-0.5 list-none pl-0 text-xs text-zinc-700">
                      {entry.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" aria-hidden />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHead title="Projects" />
            <ul className="space-y-1.5 list-none pl-0 text-xs text-zinc-700">
              {defaultProjects.map((project, i) => (
                <li key={i} className="flex gap-2 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" aria-hidden />
                  <span className="whitespace-pre-wrap">
                    {typeof project === "string" ? project : project?.title || project?.description || ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column: Education, Skills, Language */}
        <div className="w-full md:w-[38%] print:w-[38%] min-h-0 flex flex-col border-l border-zinc-200 pl-4">
          <section className="mb-4">
            <SectionHead title="Education" />
            <div className="space-y-2">
              {defaultEducation.map((ed, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-black">{ed.institution}</p>
                  <p className="text-[11px] text-zinc-700">{ed.degree}</p>
                  <p className="text-[11px] text-zinc-500">{ed.dates}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-4">
            <SectionHead title="Skills" />
            <ul className="space-y-0.5 list-none pl-0 text-xs text-zinc-700">
              {defaultSkills.map((s, i) => (
                <li key={i} className="flex gap-2 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" aria-hidden />
                  {typeof s === "string" ? s : s?.label ?? ""}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHead title="Language" />
            <ul className="space-y-0.5 list-none pl-0 text-xs text-zinc-700">
              {languageList.map((lang, i) => (
                <li key={i} className="flex gap-2 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" aria-hidden />
                  {typeof lang === "string" ? lang : lang?.label ?? ""}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
