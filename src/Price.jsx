import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUser } from "./slice/user.slice";
import axios from "axios";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: false,
    features: [
      "1 resume optimization",
      "Basic ATS score",
      "Standard templates",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "₹100",
    period: "/month",
    highlight: true,
    tag: "Most Popular",
    features: [
      "Unlimited optimizations",
      "Advanced ATS analysis",
      "Portfolio generator",
      "Premium templates",
      "Priority support",
      "Export to PDF/Word",
    ],
    cta: "Start Now",
  },
];


function PricingSection() {
  const user = useSelector((state) => state.user.userData);
   const [size, setSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const [open, setOpen] = useState(false);
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
       <>
       <div className="relative min-h-screen overflow-hidden bg-black">
     <div className="absolute inset-0 z-20 pointer-events-none">
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
                  </div>)
                  }
                  </div>

      <div className="relative  min-h-screen bg-black/70">
        <AppHeader onLogout={handleLogout} />

        <section className="py-16 md:py-20  relative z-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm text-slate-300 md:text-base">
              No hidden fees. Start free and upgrade when ready.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl border bg-black/70 backdrop-blur p-6 shadow-xl transition ${
                    plan.highlight
                      ? "border-indigo-500 shadow-indigo-500/30 scale-[1.03]"
                      : "border-slate-700"
                  }`}
                >
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      {plan.tag}
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-300">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2 text-sm text-slate-200 text-left">
                    {plan.features.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-emerald-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.cta === "Start Now" ? "/payment" : "/upload"}
                    className={`mt-6 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        <AppFooter />
      </div>
    </div>
    </>
  );
}

export default PricingSection;
