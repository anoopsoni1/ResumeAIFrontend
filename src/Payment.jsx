import React, { useState, useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com"

const PAYMENT_AMOUNT = 100;

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

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const user = useSelector((state) => state.user.userData);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.Premium) {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.Premium, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initiatePayment = async () => {
    setError("");
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/v1/user/payment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          amount: PAYMENT_AMOUNT,
          name: user ? `${user.FirstName || ""} ${user.LastName || ""}`.trim() : "Guest",
          email: user?.email || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("orderId", data.order_id);
      const sessionId = data.payment_session_id;

      if (!sessionId) {
        setError("Invalid payment session. Please try again.");
        setLoading(false);
        return;
      }

      const cashfree = await load({ mode: "sandbox" });
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
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

        <main className="flex-1 flex items-center justify-center py-8 px-4">
          {!user ? (
            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-8 max-w-md w-full text-center">
              <p className="text-slate-300 mb-4">Please log in to complete payment.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Go to Login
              </Link>
            </div>
          ) : user.Premium ? (
            <div className="rounded-2xl border border-amber-500/30 bg-black/60 p-8 max-w-md w-full text-center">
              <p className="text-amber-400 font-semibold mb-2">You already have Premium</p>
              <p className="text-slate-400 text-sm mb-4">No need to pay again. Enjoy all premium features.</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8 hover:border-amber-500/50 transition">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Secure <span className="text-amber-500">Payment</span>
                  </h1>
                  <p className="text-slate-400 text-sm mb-6">
                    Complete your Premium upgrade using Cashfree&apos;s secure gateway.
                  </p>

                  <div className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 mb-6 text-left">
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="text-xl font-bold text-white">₹{PAYMENT_AMOUNT}</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 mb-4 w-full">{error}</p>
                  )}

                  <button
                    onClick={initiatePayment}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" /> Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" /> Pay ₹{PAYMENT_AMOUNT}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Your payment is encrypted and secure.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
