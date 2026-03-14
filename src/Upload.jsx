import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2, Sparkles, X, PenLine, BarChart3, LayoutTemplate, Globe, Target } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setResumeText } from "./slice/Resume.slice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Particles from './Lighting.jsx';
import { clearUser } from "./slice/user.slice";
import { parseResume } from "./utils/parseResume.js";
import { detailLikeToForm } from "./utils/detailApi.js";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { API_BASE } from "./config.js";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const ACCEPTED_TYPES = ["PDF", "DOC", "DOCX"];

const features = [
  {
    title: "AI Resume Builder",
    desc: "Create a powerful resume with AI that understands recruiters and ATS systems.",
    icon: PenLine,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "ATS Score Checker",
    desc: "Analyze your resume and get an ATS score with keyword insights.",
    icon: BarChart3,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Smart Resume Templates",
    desc: "Modern ATS-friendly templates designed to get shortlisted.",
    icon: LayoutTemplate,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Project Website Generator",
    desc: "Automatically generate a professional project website.",
    icon: Globe,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Job-Specific Optimization",
    desc: "Tailor your resume instantly using job descriptions.",
    icon: Target,
    gradient: "from-rose-500 to-pink-500",
  },
];



function Payal() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const fileInputRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0];
    if (chosen) {
      setFile(chosen);
      setMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!user) return;
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) {
      setFile(dropped);
      setMessage("");
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF, DOC, or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setMessage("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        credentials: "include", 
        headers,
        body: formData,
      });
 
      const data = await res.json();

      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }

      if (res.ok) {
        const extractedText = data.data.resumeText || "";
        dispatch(setResumeText(extractedText));
        localStorage.setItem("extractedtext", extractedText);
        try {
          const parsed = parseResume(extractedText);
          if (parsed) {
            const form = detailLikeToForm(parsed);
            localStorage.setItem("addDetailsForm", JSON.stringify(form));
          }
        } catch (_) {}
        navigate("/atsscore");
      }
    } catch {
      setMessage("Something went wrong while uploading");
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOpen(false)
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return ( 
    <div className="relative min-h-screen overflow-hidden  bg-black ">
  <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
    <Particles
      particleColors={["#ffffff"]}
      particleCount={200}
      particleSpread={10}
      speed={0.1}
      particleBaseSize={100}
      moveParticlesOnHover
      alphaParticles={false}
      disableRotation={false}
      pixelRatio={1}
    />
  </div>

      <div className="absolute inset-0 z-1 bg-black/30" />
      <div className="relative z-10">
        <AppHeader />
      <div className="relative z-10">
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-6xl mx-auto text-center mb-8 sm:mb-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 text-amber-400/90 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>One upload → ATS-optimized resume</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight"
          >
            Upload your resume.
            <br />
            <span className="bg-linear-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Get a high ATS score.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-3 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto"
          >
            We extract text from your file and help you improve it for recruiters and ATS systems.
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl shadow-black/40 p-5 sm:p-8"
        >
          <form onSubmit={handleUpload} className="space-y-5">
            <label className="block cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={!user}
              />
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileTap={{ scale: 0.99 }}
                className={`
                  relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                  min-h-[180px] sm:min-h-[200px] flex flex-col items-center justify-center gap-3 p-6
                  ${isDragging
                    ? "border-amber-500 bg-amber-500/10 scale-[1.02]"
                    : file
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-white/20 hover:border-amber-500/50 hover:bg-white/5"
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  if (file) return;
                  if (user) fileInputRef.current?.click();
                }}
              >
                {file ? (
                  <>
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-white font-medium text-center max-w-full truncate px-4">
                      {file.name.length > 45 ? file.name.slice(0, 45) + "…" : file.name}
                    </p>
                    <p className="text-zinc-500 text-sm">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl transition-colors ${isDragging ? "bg-amber-500/20" : "bg-white/10"}`}>
                      <Upload className={`w-7 h-7 ${isDragging ? "text-amber-400" : "text-zinc-400"}`} />
                    </div>
                    <p className={`text-sm font-medium ${isDragging ? "text-amber-400" : "text-zinc-300"}`}>
                      {isDragging ? "Drop your file here" : "Click to upload or drag & drop"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {ACCEPTED_TYPES.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md bg-white/10 text-zinc-400 text-xs font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </label>

            {user ? (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading || !file}
                className="w-full py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/30 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {loading ? (
                  <span className="flex gap-2 justify-center items-center">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Uploading & extracting…</span>
                  </span>
                ) : (
                  "Upload Resume"
                )}
              </motion.button>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center py-3.5 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors"
              >
                Sign in to upload
              </Link>
            )}
          </form>

          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-red-400 text-sm"
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="mt-5 text-center">
            <Link
              to="/add-details"
              className="text-zinc-400 hover:text-amber-400/90 text-sm font-medium transition-colors"
            >
              Or add your details manually for resume or project →
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
      <div className="relative z-10">
        <section
          aria-label="Features"
          className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
        >
          <div className="max-w-8xl mx-auto">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-20 items-center"
            >
              <motion.div
                variants={fadeUp}
                className="w-full lg:max-w-[560px] xl:max-w-[640px] shrink-0"
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
                  <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent pointer-events-none" />
                  <video
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="relative w-full aspect-video object-cover rounded-2xl min-h-[200px] sm:min-h-[280px]"
                    src="vid.mp4"
                  />
                </div>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full flex-1 min-w-0">
                <motion.p
                  variants={fadeUp}
                  className="text-amber-400/90 text-sm font-semibold uppercase tracking-wider mb-3"
                >
                  Why ResumeAI
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2"
                >
                  Made for students, professionals, and job seekers to land
                  interviews faster.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-zinc-400 text-sm sm:text-base mb-8 max-w-xl"
                >
                  One platform to build, score, and optimize your resume for ATS and recruiters.
                </motion.p>

                <div className="space-y-4">
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div
                        key={f.title}
                        variants={fadeUp}
                        whileHover={{ x: 4 }}
                        className="group relative rounded-xl border border-white/10 bg-white/[0.06] p-4 sm:p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                      >
                        <div className="flex gap-4">
                          <div
                            className={`flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                              {f.title}
                            </h3>
                            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                              {f.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

<AppFooter />
    </div>
    </div>
    
  );
}

export default Payal;



