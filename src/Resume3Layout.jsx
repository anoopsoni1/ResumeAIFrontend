import { Phone, Mail, MapPin } from "lucide-react";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

const TEXT_DARK = "text-[#333]";
const TEXT_MUTED = "text-zinc-600";

/** Section: horizontal line + small diamond + bold title */
function SectionHead({ title }) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-300 pb-1.5 mb-2">
      <span className="w-2 h-2 bg-[#333] rotate-45 shrink-0" aria-hidden />
      <h2 className={`text-[11px] font-bold uppercase tracking-wider ${TEXT_DARK}`}>{title}</h2>
    </div>
  );
}

function parseExperienceEntry(entry) {
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

/** Parse reference string: Name\nCompany / Title\nPhone\nEmail */
function parseReference(str) {
  if (!str || !String(str).trim()) return null;
  const lines = str.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    name: lines[0] || "",
    companyTitle: lines[1] || "",
    phone: lines[2] || "",
    email: lines[3] || "",
  };
}

/**
 * Resume 3: Same UI as reference image – header (name, title, contact), two columns.
 * Left: Summary, Work Experience, References. Right: Education, Skills, Language.
 * Uses app fields: name, role, summary, experience, education, skills, languageProficiency, email, phone, location, references.
 */
export default function Resume3Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntry(e));
  const educationParsed = parseEducation(data?.education);
  const languageProficiency = data?.languageProficiency || "";
  const referencesList = Array.isArray(data?.references) ? data.references.filter(Boolean) : [];

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white relative`}>
      {/* Subtle dot pattern top-right */}
      <div
        className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 pointer-events-none opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #333 1px, transparent 0)`,
          backgroundSize: "12px 12px",
        }}
      />

      {/* Header: name, title, contact */}
      <header className="px-4 sm:px-6 pt-6 pb-4 border-b border-zinc-200 relative">
        <h1 className={`text-xl sm:text-2xl font-bold ${TEXT_DARK} tracking-tight`}>{name}</h1>
        <p className={`mt-0.5 text-sm ${TEXT_MUTED}`}>{role}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
          {data?.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={14} className="shrink-0 text-zinc-500" /> {data.phone}
            </span>
          )}
          {data?.email && (
            <span className="flex items-center gap-1.5 break-all">
              <Mail size={14} className="shrink-0 text-zinc-500" /> {data.email}
            </span>
          )}
          {(data?.location || data?.address) && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-zinc-500" /> {data.location || data.address}
            </span>
          )}
        </div>
      </header>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* Left column: Summary, Work Experience, References */}
        <div className="w-full md:w-[58%] print:w-[58%] min-h-0 flex flex-col px-4 sm:px-6 py-5 border-b md:border-b-0 md:border-r border-zinc-200">
          {summary && (
            <section className="mb-5">
              <SectionHead title="Summary" />
              <p className={`text-xs ${TEXT_DARK} leading-relaxed`}>{summary}</p>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-5">
              <SectionHead title="Work Experience" />
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => (
                  <div key={i}>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>{entry.jobTitle || "Role"}</p>
                    {entry.company && (
                      <p className={`text-xs ${TEXT_MUTED}`}>{entry.company}</p>
                    )}
                    {entry.datesOrLocation && (
                      <p className={`text-xs ${TEXT_MUTED} mt-0.5`}>{entry.datesOrLocation}</p>
                    )}
                    {entry.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-xs text-[#333]">
                        {entry.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2" aria-hidden />
                            {b}
                          </li>
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
              <SectionHead title="Projects" />
              <div className="space-y-2">
                {projectsList.map((project, i) => (
                  <div key={i} className="text-xs">
                    <p className={`font-bold ${TEXT_DARK}`}>
                      {typeof project === "string" ? project : project?.title || project?.description || "Project"}
                    </p>
                    {typeof project === "object" && project?.description && (
                      <p className={`${TEXT_MUTED} mt-0.5 leading-relaxed`}>{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {referencesList.length > 0 && (
            <section className="mb-5">
              <SectionHead title="References" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {referencesList.map((refStr, i) => {
                  const ref = parseReference(refStr);
                  if (!ref) return null;
                  return (
                    <div key={i} className="text-xs">
                      <p className={`font-bold ${TEXT_DARK}`}>{ref.name}</p>
                      {ref.companyTitle && <p className={TEXT_MUTED}>{ref.companyTitle}</p>}
                      {ref.phone && <p className={TEXT_MUTED}>{ref.phone}</p>}
                      {ref.email && <p className={`${TEXT_MUTED} break-all`}>{ref.email}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right column: Education, Skills, Language */}
        <div className="w-full md:w-[42%] print:w-[42%] min-h-0 flex flex-col px-4 sm:px-5 py-5 bg-white">
          {(data?.education || educationParsed) && (
            <section className="mb-5">
              <SectionHead title="Education" />
              <div className="space-y-3">
                {educationParsed ? (
                  <div>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>{educationParsed.institution || educationParsed.degree}</p>
                    {educationParsed.degree && educationParsed.institution && (
                      <p className={`text-xs ${TEXT_MUTED}`}>{educationParsed.degree}</p>
                    )}
                    {educationParsed.dates && (
                      <p className={`text-xs ${TEXT_MUTED} mt-0.5`}>{educationParsed.dates}</p>
                    )}
                  </div>
                ) : (
                  <p className={`text-xs ${TEXT_DARK} whitespace-pre-wrap leading-relaxed`}>{data.education}</p>
                )}
              </div>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className="mb-5">
              <SectionHead title="Skills" />
              <ul className="space-y-1 list-none pl-0 text-xs text-[#333]">
                {skillsList.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" aria-hidden />
                    <span>{typeof s === "string" ? s : s?.label ?? ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languageProficiency && (
            <section className="mb-5">
              <SectionHead title="Language" />
              <ul className="space-y-1 list-none pl-0 text-xs text-[#333]">
                {languageProficiency.split(/[,;]|\n/).map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" aria-hidden />
                      <span>{trimmed}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
