import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setResumeText } from "./slice/Resume.slice";
import { FaFileMedical } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaHome } from "react-icons/fa";
import { GrDocumentUpload } from "react-icons/gr";
import { IoMdContacts } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import FloatingLines from './Lighting.jsx';
import LiquidEther from './LiquidEther';
import { FaDollarSign } from "react-icons/fa";
import axios from "axios";
import { clearUser } from "./slice/user.slice";

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

      const res = await fetch("http://localhost:5000/api/v1/user/upload", {
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
        dispatch(setResumeText(data.data.resumeText));
        localStorage.setItem("extractedtext", data.data.resumeText);
        window.location.href = "/atsscore";
      }
    } catch {
      setMessage("Something went wrong while uploading");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/v1/user/logout",
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
  {size.width>= 768 ? (<>
  <div className="absolute inset-0 z-0 pointer-events-none">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={50}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          color0="#5227FF"
          color1="#FF9FFC"
          color2="#B19EEF"
        />
      </div>
</>
) : (

  <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full  mix-blend-screen">

  <FloatingLines 
    enabledWaves={["top","middle","bottom","left","right"]}
    // Array - specify line count per wave; Number - same count for all waves
    lineCount={5}
    // Array - specify line distance per wave; Number - same distance for all waves
    lineDistance={5}
    bendRadius={5}
    bendStrength={-0.5}
    interactive={true}
    parallax={true}
    mixBlendMode="screen"
    topWavePosition={0}
    middleWavePosition={0}
    bottomWavePosition={-2}
    animationSpeed={2}
    mouseDamping={0.05}
  />
  </div>
)}

      <div className="relative z-10">
      <header className="sticky top-0 z-30 backdrop-blur-xl ">
        <div className="mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
              <FaFileMedical className="text-white" />
            </div>
            <span className="text-lg font-semibold text-white">
            ResumeAI
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
  
          {size.width < 768 ?( 
  <>
 {open && (
<div
className="absolute right-0 top-0  w-full bg-black  rounded-2xl shadow-xl z-10">
<ul className="py-2 text-white">

<li className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition justify-between">
 <div className="flex items-center gap-3"> <div className="bg-blue-700 h-9 w-9 place-items-center p-3 rounded-full flex text-white"><FaFileMedical /></div> <div className="text-white text-lg font-semibold">RESUME AI</div></div>
  <div onClick={() => setOpen(false)} className=" text-2xl cursor-pointer"><RxCross2 color="red" size={30} /></div>
 </li>

 <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
 <FaHome /> Home
 </Link>

 <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
 <FaUser /> Dashboard
 </Link>

  <Link to="/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
  <GrDocumentUpload /> Upload Resume
 </Link>

 <Link to="/price" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
  <FaDollarSign /> Price
 </Link>

  <Link to="/contact" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
  <IoMdContacts /> Contact Us
 </Link>

  <Link to="/about" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
  <FaBook /> About Us
 </Link>

 {user ? (
   <Link onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 cursor-pointer transition">
   <FaSignInAlt /> Logout
  </Link>
 ) : (
   <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-blue-700 cursor-pointer transition">
   <FaSignInAlt /> Login
  </Link>
 )}
</ul>
</div>
)}
<div className="flex gap-3 text-zinc-200"   onClick={() => setOpen(!open)}>
<IoReorderThreeOutline size={40} />
 </div>
</> )
 : 
 (<> 
 {user ? (
   <Link onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 cursor-pointer transition">
   <FaSignInAlt /> Logout
  </Link>
 ) : (
   <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-blue-700 cursor-pointer transition">
   <FaSignInAlt /> Login
  </Link>
 )}
 </>)}
        </div>
      </header>
      
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
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
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
                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex gap-2 justify-center items-center">
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

       <footer className=" py-8 sm:py-10 text-slate-300 relative z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-indigo-500">
                <span className="text-base sm:text-lg font-semibold text-white">AI</span>
              </div>
              <span className="text-base sm:text-lg font-semibold tracking-tight text-white">
                ResumeAI
              </span>
            </div>
            <p className="mt-2 sm:mt-3 max-w-sm text-xs sm:text-sm text-white mb-4 sm:mb-0">
              Transform your career with AI-assisted resume optimization and
              portfolio generation.
            </p>
            <div className="mt-4 flex gap-3 sm:gap-4 text-xs sm:text-sm text-white">
              <span className="cursor-pointer hover:text-indigo-400 transition-colors">Twitter</span>
              <span className="cursor-pointer hover:text-indigo-400 transition-colors">LinkedIn</span>
              <span className="cursor-pointer hover:text-indigo-400 transition-colors">GitHub</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">Product</h4>
            <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white">
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Templates</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">Company</h4>
            <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white">
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">About</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">Resources</h4>
            <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white">
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">Resume Tips</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">ATS Guide</li>
              <li className="hover:text-indigo-400 cursor-pointer transition-colors">API</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-4 sm:pt-6 text-xs sm:text-sm text-white md:flex-row">
          <span className="text-center md:text-left">© 2025 ResumeAI. All rights reserved.</span>
        </div>
      </div>
    </footer>
    </div>
    </div>
    
  );
}

export default Payal;



