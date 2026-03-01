import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setResumeText } from "./slice/Resume.slice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingLines from './Lighting.jsx';
import LiquidEther from './LiquidEther';
import Particles from './Lighting.jsx';
import LightPillar from './LiquidEther.jsx';
import { LuDollarSign } from "react-icons/lu";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import { parseResume } from "./utils/parseResume.js";
import { detailLikeToForm } from "./utils/detailApi.js";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

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



function Payal() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });




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
      const accessToken = localStorage.getItem("accessToken");
      const headers = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("https://resumeaibackend-oqcl.onrender.com/api/v1/user/upload", {
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

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://resumeaibackend-oqcl.onrender.com/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
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

  useEffect(() => {
    if (fileInputRef.current) fileInputRef.current.play();
  }, [fileInputRef]);

  return ( 
    <div className="relative min-h-screen overflow-hidden  bg-black ">
  {size.width >= 768 ? (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
  </div>
) : (

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
)}

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? 'bg-black/40' : 'bg-black/30'}`} />
      <div className="relative z-10">
        <AppHeader onLogout={handleLogout} />
      <div className="relative z-10">
      <div className="min-h-[90vh]  flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-center gap-4 w-full mb-8 sm:mb-12">
          <div className="w-full max-w-6xl"> 
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-center font-semibold text-white leading-tight px-2">
              Upload <span className="text-amber-500">Your Resume</span> Get a <span className="text-amber-500">high ATS</span> score
            </h2>
            <p className="text-zinc-300 text-bold text-center mt-2 text-sm sm:text-base md:text-lg px-2">
              Upload a PDF or DOCX to extract and improve your resume
            </p> 
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mt-2 px-2">Your shortcut to a high ATS score</h1>
          </div>
        </div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full max-w-2xl rounded-2xl backdrop-blur-xl shadow-xl p-4 sm:p-6 md:p-8"
        >
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6 grid gap-4">
            <label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer border-indigo-500"
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!user}
                />
                <FileText className="mx-auto mb-2 sm:mb-3 text-indigo-500 w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-white text-xs sm:text-sm md:text-base wrap-break-words px-2">
                  {file ? (file.name.length > 50 ? file.name.substring(0, 50) + '...' : file.name) : "Click to upload or drag & drop"}
                </p>
              </motion.div>
            </label>

            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white py-2.5  sm:py-3 rounded-xl font-semibold text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex gap-2  justify-center items-center">
                    <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> <span>Uploading...</span>
                  </span>
                ) : (
                  "Upload Resume"
                )}
              </motion.button>
            ) : (
              <Link
                to="/login"
                className="block text-center bg-indigo-500 text-white mt-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base"
              >
                Please Sign In
              </Link>
            )}
          </form>
          {message && (
            <p className="mt-4 text-center text-red-500 text-sm sm:text-base">{message}</p>
          )}
          <p className="mt-4 text-center">
            <Link to="/add-details" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Or add your details manually for resume or portfolio →
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
      <div className="relative z-10">

      <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-14 items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
    >
      <motion.div variants={fadeUp} className="rounded-3xl p-2 sm:p-4  w-full lg:w-auto">
        <video
          muted
          autoPlay
          loop
          playsInline
          className="rounded-2xl object-cover w-full mx-auto"
          src="vid.mp4"
        />
      </motion.div>

      <motion.div className=" w-full">
        <motion.h1 variants={fadeUp} className="text-2xl  sm:text-3xl md:text-4xl sm:text-white text-amber-200 font-semibold mb-4 sm:mb-6 px-2">
          Made for students, professionals, and job seekers to land interviews
          faster.
        </motion.h1>

        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            className="mb-4 sm:mb-5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/5"
          >
            <h2 className="text-base sm:text-lg font-semibold text-indigo-400 mb-2">
              {f.title}
            </h2>
            <p className="text-white text-sm sm:text-base">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
    </div>

<AppFooter />
    </div>
    </div>
    
  );
}

export default Payal;



