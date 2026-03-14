import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./slice/user.slice";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import { useToast } from "./context/ToastContext";

import { API_BASE, API_BASE_URL } from "./config.js";

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // "email" | "otp" | "newpassword"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_not_configured") {
      toast.error("Google sign-in is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend .env — see Backend/GOOGLE_AUTH_SETUP.md");
    } else if (error === "google_signin_failed" || error === "token_failed") {
      toast.error("Google sign-in failed. Please try again or use email/password.");
    }
  }, [searchParams, toast]);

  // Persist return URL for post-login redirect (used by email login and Google callback)
  useEffect(() => {
    const from = searchParams.get("from");
    if (from && typeof from === "string") {
      const p = from.trim();
      if (p.startsWith("/") && !p.startsWith("//") && !p.startsWith("http"))
        sessionStorage.setItem("loginReturnUrl", p);
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail?.trim()) {
      toast.error("Enter your email.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Request failed.");
        setForgotLoading(false);
        return;
      }
      toast.success("OTP sent to your email.");
      setForgotStep("otp");
      setResendCooldown(60);
    } catch (err) {
      toast.error(err?.message || "Request failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!forgotEmail?.trim() || resendCooldown > 0 || forgotLoading) return;
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Request failed.");
        setForgotLoading(false);
        return;
      }
      toast.success("OTP resent to your email.");
      setResendCooldown(60);
    } catch (err) {
      toast.error(err?.message || "Request failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp?.trim()) {
      toast.error("Enter the OTP.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-forgot-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: forgotOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Invalid or expired OTP.");
        setForgotLoading(false);
        return;
      }
      toast.success("OTP verified. Set your new password.");
      setForgotStep("newpassword");
    } catch (err) {
      toast.error(err?.message || "Request failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!forgotNewPassword?.trim()) {
      toast.error("Enter a new password.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Failed to reset password.");
        setForgotLoading(false);
        return;
      }
      toast.success("Password updated. Sign in with your new password.");
      setForgotSuccess(true);
    } catch (err) {
      toast.error(err?.message || "Request failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setShowForgotPassword(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotSuccess(false);
    setResendCooldown(0);
  };

  const openForgotPassword = () => {
    setForgotEmail(email.trim() || "");
    setShowForgotPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
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
      const returnUrl = searchParams.get("from")?.trim();
      const safePath = returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.startsWith("http") ? returnUrl : null;
      const target = safePath || sessionStorage.getItem("loginReturnUrl") || "/dashboard";
      if (sessionStorage.getItem("loginReturnUrl")) sessionStorage.removeItem("loginReturnUrl");
      navigate(target || "/dashboard");
    } catch (err) {
      toast.error(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isMobile = size.width < 768;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background — same as App.jsx for big screen */}
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />

        <main className="flex-1 flex justify-center items-center px-4 py-8">
          {!showForgotPassword ? (
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
                <motion.div variants={item} className="flex flex-col items-center mb-8">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4"
                    aria-hidden
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <FaFileMedical className="text-white text-2xl" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome back</h1>
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
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete="current-password"
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
                  <p className="text-right">
                    <button
                      type="button"
                      onClick={openForgotPassword}
                      className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </p>
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

                <motion.div variants={item} className="mt-4 flex items-center gap-3">
                  <span className="flex-1 h-px bg-white/10" aria-hidden />
                  <span className="text-xs text-zinc-500">or</span>
                  <span className="flex-1 h-px bg-white/10" aria-hidden />
                </motion.div>
                <motion.a
                  variants={item}
                  href={`${API_BASE_URL}/api/v1/auth/google`}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 active:scale-[0.98]"
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </motion.a>

                <motion.p variants={item} className="mt-6 text-center text-sm text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-2 transition-colors">
                    Register
                  </Link>
                </motion.p>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-1">Forgot password</h1>

              {forgotSuccess ? (
                <div className="space-y-4 mt-4">
                  <p className="text-emerald-400 text-sm">Password updated. You can sign in with your new password.</p>
                  <button
                    type="button"
                    onClick={resetForgotFlow}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : forgotStep === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-4 mt-4">
                  <p className="text-zinc-400 text-sm mb-4">We&apos;ll send an OTP to this email (from sign-in).</p>
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <input
                      type="email"
                      placeholder="Email"
                      value={forgotEmail}
                      readOnly
                      tabIndex={-1}
                      aria-readonly="true"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none cursor-not-allowed opacity-90"
                    />
                  </label>
                  {!forgotEmail?.trim() && (
                    <p className="text-amber-400 text-sm">Enter your email in the sign-in form above, then click Forgot password? again.</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForgotFlow}
                      className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail?.trim()}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? "Sending…" : "Send OTP"}
                    </button>
                  </div>
                </form>
              ) : forgotStep === "otp" ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                  <p className="text-zinc-400 text-sm mb-4">Enter the 6-digit OTP sent to <span className="text-white font-medium">{forgotEmail}</span>.</p>
                  <label className="block">
                    <span className="sr-only">OTP</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                      disabled={forgotLoading}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60 text-center text-lg tracking-widest"
                      required
                    />
                  </label>
                  <p className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={forgotLoading || resendCooldown > 0}
                      className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
                    </button>
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep("email")}
                      className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotOtp.length !== 6}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-60"
                    >
                      {forgotLoading ? "Verifying…" : "Verify OTP"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSetNewPassword} className="space-y-4 mt-4">
                  <p className="text-zinc-400 text-sm mb-4">Enter your new password.</p>
                  <label className="block">
                    <span className="sr-only">New password</span>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        placeholder="New password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        disabled={forgotLoading}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        tabIndex={-1}
                        aria-label={showForgotNewPassword ? "Hide password" : "Show password"}
                      >
                        {showForgotNewPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </label>
                  <label className="block">
                    <span className="sr-only">Confirm password</span>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        disabled={forgotLoading}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-60"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        tabIndex={-1}
                        aria-label={showForgotConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showForgotConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep("otp")}
                      className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotNewPassword !== forgotConfirmPassword || forgotNewPassword.length < 6}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-60"
                    >
                      {forgotLoading ? "Updating…" : "Set new password"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
