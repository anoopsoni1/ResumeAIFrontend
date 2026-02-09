import React, { useState } from "react";
import {
  FiGlobe,
  FiZap,
  FiTarget,
} from "react-icons/fi";
import { FaFileMedical } from "react-icons/fa";
import { MdAutoAwesome, MdWbSunny } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink, Link } from "react-router-dom";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import { useEffect  } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaHome } from "react-icons/fa";
import { GrDocumentUpload } from "react-icons/gr";
import { IoMdContacts } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

function Topbar() {
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://shoesbackend-4.onrender.com/api/v1/user/logout",
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

  return (
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
  );
}

function StatCards() {
  return (
    <div className="mt-6 px-4">
      <div className="mx-auto  grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <FiTarget />, label: "ATS Score", value: "87%" },
            { icon: <AiOutlineFileText />, label: "Resume Status", value: "Optimized" },
            { icon: <FiZap />, label: "Applications", value: "24" },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-black p-4 hover:border-amber-500 transition"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {item.icon}
                </div>
                <span className="text-xs">{item.label}</span>
              </div>
              <div className="mt-3 text-xl font-bold text-white">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <AiOutlineFileText />,
              title: "Upload New Resume",
              desc: "Start fresh with a new resume upload.",
            },
            {
              icon: <MdAutoAwesome />,
              title: "Optimize Resume",
              desc: "Improve your ATS score and keywords.",
            },
            {
              icon: <FiGlobe />,
              title: "Update Portfolio",
              desc: "Customize your online presence.",
              link: "/upload",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-black p-5 hover:border-amber-500 hover:shadow-md transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                {item.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-amber-500">{item.desc}</p>
              {item.link ? (
                <Link to={item.link} className="mt-3 inline-block text-xs font-semibold text-indigo-600">
                  Get Started →
                </Link>
              ) : (
                <button className="mt-3 text-xs font-semibold text-indigo-600">
                  Get Started →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = useSelector((state) => state.user.userData);
  const [theme ] = useState("dark");

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {size.width >= 768 ? (
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
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
          <FloatingLines 
            enabledWaves={["top","middle","bottom"]}
            lineCount={10}
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

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? 'bg-black/40' : 'bg-black/30'}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />
        {user ? (
          <main className="flex-1 py-6">
            <div className="mx-auto px-4">
              <div className="rounded-2xl border border-yellow-100 p-6">
                <h2 className="text-lg sm:text-xl font-bold">
                  <span className="text-amber-500">
                    {user?.FirstName} {user?.LastName}
                  </span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Your resume is performing well. Here are your latest stats and
                  quick actions.
                </p>
              </div>
            </div>

            <StatCards />
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 text-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Welcome to ResumeAI Dashboard
              </h1>
              <p className="mt-4 text-sm sm:text-lg text-amber-500">
                Please log in to access your dashboard.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
        <footer className="bg-black/70 text-white py-5 mt-auto">
          <div className="mx-auto px-4 text-center text-sm">
            © 2025 ResumeAI. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
