import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setResumeText } from "./slice/Resume.slice";
import { FaFileMedical } from "react-icons/fa";
import { Link , NavLink} from "react-router-dom";
import { motion } from "framer-motion";


// const fade = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.6 } },
// };

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


function Payal() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/user/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setResumeText(data.data.resumeText));
        localStorage.setItem("extractedtext", data.data.resumeText);
        window.location.href = "/atsscore";
      }
    } catch {
      setMessage("Something went wrong while uploading");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (fileInputRef.current) fileInputRef.current.play();
  }, [fileInputRef]);

  return ( 
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black">
        <div className="mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
              <FaFileMedical className="text-white" />
            </div>
            <span className="text-lg font-semibold text-white">
              RESUME AI
            </span>
          </div>
  
          <nav className="hidden md:flex gap-8 text-white">
            {[
              { to: "/", label: "Home" },
              { to: "/dashboard", label: "Dashboard" },
              { to: "/price", label: "Price" },
              { to: "/about", label: "About" },
            ].map(({ to, label }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "hover:text-orange-500"
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
  
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="h-[90vh] bg-black flex items-center justify-center px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full max-w-2xl rounded-2xl bg-blue-100 backdrop-blur-xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Upload />
            </div>
            <h2 className="text-3xl font-bold text-black">
              Upload Your Resume
            </h2>
            <p className="text-black mt-2">
              Upload a PDF or DOCX to extract and improve your resume
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-indigo-500"
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!user}
                />
                <FileText className="mx-auto mb-3 text-indigo-500" />
                <p className="text-black">
                  {file ? file.name : "Click to upload or drag & drop"}
                </p>
              </motion.div>
            </label>

            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
              >
                {loading ? (
                  <span className="flex gap-2 justify-center">
                    <Loader2 className="animate-spin" /> Uploading...
                  </span>
                ) : (
                  "Upload Resume"
                )}
              </motion.button>
            ) : (
              <Link
                to="/login"
                className="block text-center bg-indigo-500 text-white py-3 rounded-xl font-semibold"
              >
                Please Sign In
              </Link>
            )}
          </form>

          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </motion.div>
      </div>

      <FeatureSection />

       <footer className="bg-black py-10 text-slate-300">
      <div className="mx-auto  px-4">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
                <span className="text-lg font-semibold text-white">AI</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                ResumeAI
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-white">
              Transform your career with AI-assisted resume optimization and
              portfolio generation.
            </p>
            <div className="mt-4 flex gap-3 text-sm text-white">
              <span className="cursor-pointer hover:text-white">Twitter</span>
              <span className="cursor-pointer hover:text-white">LinkedIn</span>
              <span className="cursor-pointer hover:text-white">GitHub</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-white">
              <li>Features</li>
              <li>Pricing</li>
              <li>Templates</li>
              <li>Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-white">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-white">
              <li>Documentation</li>
              <li>Resume Tips</li>
              <li>ATS Guide</li>
              <li>API</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-white md:flex-row">
          <span>© 2025 ResumeAI. All rights reserved.</span>
        </div>
      </div>
    </footer>
    </>
  );
}

export default Payal;


function FeatureSection() {
  return (
    <div className="bg-black">

  
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col lg:flex-row gap-14 items-center px-8 py-20"
    >
      <motion.div variants={fadeUp} className="rounded-3xl p-4 bg-black">
        <video
          muted
          autoPlay
          loop
          className="rounded-2xl object-cover"
          src="vid.mp4"
        />
      </motion.div>

      <motion.div className="max-w-xl">
        <motion.h1 variants={fadeUp} className="text-4xl text-white font-bold mb-6">
          Made for students, professionals, and job seekers to land interviews
          faster.
        </motion.h1>

        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            className="mb-5 p-5 rounded-2xl border border-white/10 bg-white/5"
          >
            <h2 className="text-lg font-semibold text-indigo-400 mb-2">
              {f.title}
            </h2>
            <p className="text-white">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
      </div>
  );
}

const features = [
  {
    title: "AI Resume Builder",
    desc: "Create a powerful resume with AI that understands recruiters and ATS systems.",
  },
  {
    title: "ATS Score Checker",
    desc: "Analyze your resume and get an ATS score with keyword insights.",
  },
  {
    title: "Smart Resume Templates",
    desc: "Modern ATS-friendly templates designed to get shortlisted.",
  },
  {
    title: "Portfolio Website Generator",
    desc: "Automatically generate a professional portfolio website.",
  },
  {
    title: "Job-Specific Optimization",
    desc: "Tailor your resume instantly using job descriptions.",
  },
];
