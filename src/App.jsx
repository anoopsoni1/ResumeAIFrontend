import React, { useState, useEffect } from "react";
import { useNavigate ,Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "./slice/user.slice";
import axios from "axios";
import LiquidEther from "./LiquidEther";
import TextType from './TextType';
import FloatingLines from './Lighting.jsx';
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import InstallPrompt from "./Install.jsx";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return <AppHeader onLogout={handleLogout} />;
}

function Hero() {
  return ( 
    <>
  <section className="flex min-h-[90vh] flex-col items-center justify-center text-center px-4">
  <TextType 
  text={["Land your dream job with AI-powered resumes", "ATS Optimized Resumes", "Create Stunning Portfolios in Minutes"]}
  typingSpeed={85}
  pauseDuration={1500}
  showCursor
  cursorCharacter="●"
  texts={["Land your dream job with AI-powered resumes"]}
  deletingSpeed={50}
  variableSpeedEnabled={false}
  variableSpeedMin={60}
  variableSpeedMax={120}
  cursorBlinkDuration={0.5}
  className="text-white font-bold text-6xl"
/>
    <h3 className=" text-3xl font-semibold pt-2 text-orange-400 ">Build resumes that get interviews — not rejections.</h3>
      <p className="mt-6 max-w-2xl text-white text-lg">
        Optimize your resume with AI suggestions, beat ATS filters,
        and build stunning portfolios in minutes.
      </p>
         <Link to="/upload" className="mt-8 rounded-full bg-indigo-600 px-6 py-3 text-white text-lg font-semibold hover:bg-indigo-700">
        Get Started
      </Link>
    </section>
      </>
  );
}


function Home() {
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
  
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
    enabledWaves={["top","middle","bottom"]}
    // Array - specify line count per wave; Number - same count for all waves
    lineCount={10}
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

    

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? 'bg-black/40' : 'bg-black/30'}`} />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <InstallPrompt />
        <AppFooter />
      </div>

    </div>
  );
}

export default Home;
