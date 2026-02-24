import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import { useToast } from "./context/ToastContext";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

const initialForm = {
  FirstName: "",
  LastName: "",
  email: "",
  password: "",
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  const toast = useToast();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || data?.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created. You can sign in now.");
      setForm(initialForm);
    } catch (err) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isMobile = size.width < 768;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background */}
      {!isMobile ? (
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
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={10}
            lineDistance={5}
            bendRadius={5}
            bendStrength={-0.5}
            interactive
            parallax
            mixBlendMode="screen"
            topWavePosition={0}
            middleWavePosition={0}
            bottomWavePosition={-2}
            animationSpeed={2}
            mouseDamping={0.05}
          />
        </div>
      )}

      <div className={`absolute inset-0 z-1 ${isMobile ? "bg-black/30" : "bg-black/40"}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />

        <main className="flex-1 flex justify-center items-center px-4 py-8">
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-md"
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10"
              variants={container}
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Logo + title */}
              <motion.div
                variants={item}
                className="flex flex-col items-center mb-8"
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4"
                  aria-hidden
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <FaFileMedical className="text-white text-2xl" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Create account
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Join Resume AI to get started</p>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="sr-only">First name</span>
                    <input
                      name="FirstName"
                      type="text"
                      placeholder="First name"
                      value={form.FirstName}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="given-name"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Last name</span>
                    <input
                      name="LastName"
                      type="text"
                      placeholder="Last name"
                      value={form.LastName}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="family-name"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                      required
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                    required
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Password</span>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="new-password"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                </label>
              </motion.div>

              <motion.button
                variants={item}
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <FaUserPlus className="shrink-0" />
                    Create account
                  </>
                )}
              </motion.button>

              <motion.p
                variants={item}
                className="mt-6 text-center text-sm text-zinc-400"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-2 transition-colors"
                >
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          </motion.form>
        </main>
      </div>
    </div>
  );
}
