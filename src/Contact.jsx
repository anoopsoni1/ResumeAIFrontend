import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import { HiMail, HiLocationMarker, HiPhone } from "react-icons/hi";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <AppHeader onLogout={handleLogout} />;
}

export default function Contact() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleMail = async () => {
    const response = await axios.post(`${API_BASE}/api/v1/user/mail`, form);
    return response.data;
  };

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleMail();
      setStatus({ type: "info", text: "Thanks! We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "", phone: "" });
    } catch (error) {
      setStatus({ type: "error", text: "Failed to send. Please try again." });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
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

      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 py-8 px-4">
          <div className="mx-auto ">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Get in <span className="text-amber-500">Touch</span>
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base">
                Have questions? We’d love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact info cards */}
              <div className="space-y-4 lg:col-span-1">
                {[
                  {
                    icon: <HiMail className="text-xl text-amber-500" />,
                    title: "Email",
                    value: "support@resumeai.com",
                  },
                  {
                    icon: <HiPhone className="text-xl text-amber-500" />,
                    title: "Phone",
                    value: "+1 (555) 123-4567",
                  },
                  {
                    icon: <HiLocationMarker className="text-xl text-amber-500" />,
                    title: "Office",
                    value: "123 Resume Street, Tech City",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200/50 bg-black/60 p-4 hover:border-amber-500/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <p className="text-xs text-slate-400">{item.title}</p>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact form */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">PhoneNumber</label>
                      <input
                        type="number"
                        name="PhoneNumber"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="+91 99999999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        placeholder="Your message..."
                      />
                    </div>
                    {status.text && (
                      <p className={`text-sm ${status.type === "info" ? "text-amber-400" : "text-red-400"}`}>
                        {status.text}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
