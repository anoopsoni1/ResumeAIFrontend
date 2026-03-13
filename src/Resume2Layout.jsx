import { Phone, Mail, MapPin, ExternalLink, FolderOpen } from "lucide-react";

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

function parseEducation(education) {
  if (!education || !String(education).trim()) return null;
  const lines = education.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    degree: lines[0] || "",
    institution: lines[1] || "",
    dates: lines[2] || "",
  };
}

const TEAL = "text-[#0f766e]";
const SECTION_HEAD = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0f766e] pb-1.5 mb-2 border-b border-zinc-300";

/** Resume 2: light two-column – profile header, left: Contact + Skills + Education dates/schools, right: About Me + Experience + Projects. */
export default function Resume2Layout({ data }) {
  const name = (data?.name || "Your Name").toUpperCase();
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const initials = (data?.name || "?")
    .split(/\s+/)
    .map((w) => (w[0] || "").toUpperCase())
    .slice(0, 2)
    .join("") || "?";

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-[#fafaf9] print:bg-[#fafaf9] border border-zinc-200 print:border-zinc-300`}>
      <div className="w-full flex flex-row items-start gap-4 px-4 sm:px-6 pt-5 pb-4 border-b border-zinc-200">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border-2 border-orange-500 bg-teal-100 flex items-center justify-center text-2xl font-bold text-[#0f766e] shrink-0">
          {initials}
        </div>
        <div className="min-w-0 pt-1">
          <h1 className={`text-xl sm:text-2xl font-bold ${TEAL} tracking-tight`}>{name}</h1>
          <p className="text-sm text-zinc-600 mt-0.5">{role}</p>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        <div className="w-full md:w-[38%] print:w-[38%] min-h-0 flex flex-col px-4 sm:px-5 py-5 border-b md:border-b-0 md:border-r border-zinc-200 bg-white/50 print:bg-white/80">
          <section className="mb-5">
            <h2 className={SECTION_HEAD}>Contact</h2>
            <div className="space-y-2 text-xs text-zinc-700">
              {data?.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={12} className="shrink-0 text-[#0f766e]" /> {data.phone}
                </p>
              )}
              {data?.email && (
                <p className="flex items-center gap-2 break-all">
                  <Mail size={12} className="shrink-0 text-[#0f766e]" /> {data.email}
                </p>
              )}
              {(data?.location || data?.address) && (
                <p className="flex items-center gap-2">
                  <MapPin size={12} className="shrink-0 text-[#0f766e]" /> {data.location || data.address}
                </p>
              )}
              {(data?.website || data?.linkedin) && (
                <p className="flex items-center gap-2 break-all">
                  <ExternalLink size={12} className="shrink-0 text-[#0f766e]" /> {data.website || (data.linkedin && data.linkedin.replace(/^https?:\/\//i, "")) || ""}
                </p>
              )}
            </div>
          </section>

          {skillsList.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <ul className="space-y-1 text-xs text-zinc-700 list-none pl-0">
                {skillsList.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0 mt-2" aria-hidden />
                    <span>{typeof s === "string" ? s : s?.label ?? ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(data?.education || educationParsed) && (
            <section>
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationParsed ? (
                  <div>
                    {educationParsed.dates && <p className="text-xs text-zinc-700 font-medium">{educationParsed.dates}</p>}
                    {educationParsed.institution && <p className="text-xs text-zinc-600">{educationParsed.institution}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 whitespace-pre-wrap">{data.education}</p>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="w-full md:w-[62%] print:w-[62%] min-h-0 flex flex-col px-4 sm:px-6 py-5 bg-[#fafaf9] print:bg-[#fafaf9]">
          {summary && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>About Me</h2>
              <p className="text-xs text-zinc-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => (
                  <div key={i}>
                    <p className={`text-xs font-bold ${TEAL}`}>{entry.jobTitle || "Role"}</p>
                    {entry.company && <p className="text-xs text-zinc-600">{entry.company}</p>}
                    {entry.datesOrLocation && <p className="text-xs text-zinc-500 mt-0.5">{entry.datesOrLocation}</p>}
                    {entry.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-xs text-zinc-700">
                        {entry.bullets.map((b, j) => (
                          <li key={j} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectsList.length > 0 && (
            <section className="mb-5">
              <h2 className={`flex items-center gap-2 ${SECTION_HEAD}`}>
                <FolderOpen size={14} className="shrink-0 text-[#0f766e]" /> Projects
              </h2>
              <ul className="space-y-3 list-none pl-0">
                {projectsList.map((project, i) => (
                  <li key={i} className="text-xs text-zinc-700 leading-relaxed">
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
