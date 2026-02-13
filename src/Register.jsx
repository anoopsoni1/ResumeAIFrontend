import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFileMedical } from "react-icons/fa";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Registration failed");
        return;
      }

      setSuccess("User registered successfully!");
      setForm({ FirstName: "", LastName: "", email: "", password: "" });
      alert("Registered successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background — same as Dashboard */}
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
            enabledWaves={["top", "middle", "bottom"]}
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

      <div
        className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header — same style as Dashboard */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/60">
          <div className="mx-auto flex items-center justify-between px-4 py-3 md:py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-lg font-semibold text-white">
                  <FaFileMedical />
                </span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                RESUME AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-medium text-white/90 hover:text-white p-2 px-4 md:inline-block"
              >
                Sign In
              </Link>
              <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30">
                Get Started
              </span>
            </div>
          </div>
        </header>

        {/* Register form — kept as is */}
        <main className="flex-1 flex justify-center items-center px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Create Account
            </h2>

            {error && (
              <p className="text-red-600 text-center mb-3">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-center mb-3">{success}</p>
            )}

            <input
              name="FirstName"
              placeholder="First Name"
              value={form.FirstName}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded"
            />
            <input
              name="LastName"
              placeholder="Last Name"
              value={form.LastName}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg mt-2 hover:bg-blue-700"
            >
              Register
            </button>

            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 underline">
                Login
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
