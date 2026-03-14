import { Phone, Mail, MapPin, Linkedin, FolderOpen } from "lucide-react";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

const TEXT_DARK = "text-[#333]";
/** Section heading: bold uppercase dark grey with thin orange underline */
const SECTION_HEAD =
  "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#333] pb-1 mb-2 border-b-2 border-orange-500";

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

/** Split "05/2017 - Present | Dallas, Texas" into { dates, location } */
function splitDatesAndLocation(str) {
  if (!str || !String(str).trim()) return { dates: "", location: "" };
  const s = String(str).trim();
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
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

/** Resume 7: Match reference – dark grey text, orange for dates/icons/underlines. Company/university underlined. Courses & Passions optional. */
export default function Resume7Layout({ data }) {
  const name = (data?.name || "Your Name").toUpperCase();
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const courses = data?.courses != null ? String(data.courses).trim() : "";
  const passions = data?.passions != null ? String(data.passions).trim() : "";

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white`}>
      {/* Header: name + title left; phone & location stacked below; email & LinkedIn right (orange icons) aligned with name */}
      <header className="w-full flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-2 sm:gap-4 px-4 sm:px-6 pt-5 pb-4 border-b border-zinc-200">
        <div className="flex flex-col gap-0.5">
          <h1 className={`text-2xl sm:text-3xl font-bold ${TEXT_DARK} tracking-tight`}>{name}</h1>
          <p className={`text-sm font-normal ${TEXT_DARK}`}>{role}</p>
          <div className="flex flex-col gap-0.5 mt-1 text-xs text-[#333]">
            {data?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="shrink-0 text-[#333]" /> {data.phone}
              </span>
            )}
            {(data?.location || data?.address) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0 text-[#333]" /> {data.location || data.address}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#333] sm:mt-0 mt-1">
          {data?.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="shrink-0 text-orange-500" /> {data.email}
            </span>
          )}
          {(data?.linkedin || data?.website) && (
            <span className="flex items-center gap-1.5 break-all">
              <Linkedin size={14} className="shrink-0 text-orange-500" />{" "}
              {data.linkedin ? data.linkedin.replace(/^https?:\/\//i, "") : (data.website || "").replace(/^https?:\/\//i, "")}
            </span>
          )}
        </div>
      </header>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* Left column (wider): Professional Summary, Experience, Education */}
        <div className="w-full md:w-[60%] print:w-[60%] min-h-0 flex flex-col px-4 sm:px-6 py-5 border-b md:border-b-0 md:border-r border-zinc-200">
          {summary && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Professional Summary</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed`}>{summary}</p>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed`}>
                {skillsList.map((s) => (typeof s === "string" ? s : s?.label ?? "")).join(", ")}
              </p>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => {
                  const { dates, location } = splitDatesAndLocation(entry.datesOrLocation);
                  return (
                    <div key={i}>
                      <p className={`text-xs font-bold ${TEXT_DARK}`}>{entry.jobTitle || "Role"}</p>
                      {entry.company && (
                        <p className={`text-xs font-normal ${TEXT_DARK} underline decoration-[#333] decoration-1`}>
                          {entry.company}
                        </p>
                      )}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs">
                        {dates && <span className="text-orange-500">{dates}</span>}
                        {location && (
                          <span className={`flex items-center gap-1 ${TEXT_DARK}`}>
                            <MapPin size={12} className="shrink-0" /> {location}
                          </span>
                        )}
                        {!dates && !location && entry.datesOrLocation && (
                          <span className={TEXT_DARK}>{entry.datesOrLocation}</span>
                        )}
                      </div>
                      {entry.bullets.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 list-disc list-inside pl-0 text-xs text-[#333] ml-0.5">
                          {entry.bullets.map((b, j) => (
                            <li key={j} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(data?.education || educationParsed) && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationParsed ? (
                  <div>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>{educationParsed.degree || "Degree"}</p>
                    {educationParsed.institution && (
                      <p className={`text-xs font-normal ${TEXT_DARK} underline decoration-[#333] decoration-1`}>
                        {educationParsed.institution}
                      </p>
                    )}
                    {educationParsed.dates && (() => {
                      const { dates: edDates, location: edLoc } = splitDatesAndLocation(educationParsed.dates);
                      return (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs">
                          {edDates && <span className="text-orange-500">{edDates}</span>}
                          {edLoc && (
                            <span className={`flex items-center gap-1 ${TEXT_DARK}`}>
                              <MapPin size={12} className="shrink-0" /> {edLoc}
                            </span>
                          )}
                          {!edDates && !edLoc && (
                            <span className="text-orange-500">{educationParsed.dates}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className={`text-xs ${TEXT_DARK} whitespace-pre-wrap`}>{data.education}</p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right column: Projects, Courses, Passions */}
        <div className="w-full md:w-[40%] print:w-[40%] min-h-0 flex flex-col px-4 sm:px-5 py-5 bg-white">
          {projectsList.length > 0 && (
            <section className="mb-5">
              <h2 className={`flex items-center gap-2 ${SECTION_HEAD}`}>
                <FolderOpen size={14} className="shrink-0 text-orange-500" /> Projects
              </h2>
              <div className="space-y-3">
                {projectsList.map((project, i) => (
                  <div key={i}>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>
                      {typeof project === "string" ? project : project?.title || project?.description || "Achievement"}
                    </p>
                    {(typeof project === "object" ? project?.description : null) && (
                      <p className={`text-xs ${TEXT_DARK} mt-0.5 leading-relaxed`}>{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {courses && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Courses</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed whitespace-pre-wrap`}>{courses}</p>
            </section>
          )}

          {passions && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Passions</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed whitespace-pre-wrap`}>{passions}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
