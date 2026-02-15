import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./slice/user.slice";
import { useNavigate, Link } from "react-router-dom";
import { FaFileMedical } from "react-icons/fa";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setemail(e.target.value);
    } else if (e.target.name === "password") {
      setpassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      localStorage.setItem("accessToken", data.data.accessToken);
      dispatch(setUser(data.data.user));
      alert("Login Successfully");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
              <span className="hidden text-sm font-medium text-white p-2 px-4 rounded-full bg-indigo-600 md:inline-block shadow-md shadow-indigo-500/30">
                Sign In
              </span>
              <Link
                to="/register"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Sign-in form — kept as is */}
        <main className="flex-1 flex justify-center items-center px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className=" shadow-lg p-8 rounded-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>

            {error && (
              <p className="text-red-600 text-center mb-3">{error}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded border-gray-300 outline-none placeholder:text-white text-white"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              className="w-full mb-3 p-3 border rounded border-gray-300 outline-none placeholder:text-white text-white"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg mt-2 hover:bg-blue-700"
            >
              Login
            </button>

            <p className="mt-4 text-center text-sm text-white">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 underline">
                Register
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
