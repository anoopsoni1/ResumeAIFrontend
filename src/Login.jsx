import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import { useToast } from "./context/ToastContext";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || data?.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data?.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }
      if (data?.data?.user) {
        dispatch(setUser(data.data.user));
      }
      toast.success("Welcome back! Redirecting…");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Login failed. Please try again.");
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
            lineCount={5}
            lineDistance={10}
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
                  Welcome back
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                    required
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Password</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                    required
                  />
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
                    <FaSignInAlt className="shrink-0" />
                    Sign in
                  </>
                )}
              </motion.button>

              <motion.p
                variants={item}
                className="mt-6 text-center text-sm text-zinc-400"
              >
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-2 transition-colors"
                >
                  Register
                </Link>
              </motion.p>
            </motion.div>
          </motion.form>
        </main>
      </div>
    </div>
  );
}
