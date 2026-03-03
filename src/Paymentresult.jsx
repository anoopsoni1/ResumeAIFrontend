import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, Truck, Home, CheckCircle2, XCircle, AlertCircle, Receipt, Hash, Banknote, Calendar, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "./slice/user.slice";
import Particles from "./Lighting.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

const statusConfig = {
  success: {
    icon: CheckCircle2,
    label: "Payment Successful",
    accent: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  },
  failed: {
    icon: XCircle,
    label: "Payment Failed",
    accent: "from-red-500/20 to-rose-500/10",
    border: "border-red-500/30",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border border-red-500/40",
  },
  default: {
    icon: AlertCircle,
    label: "Payment Status",
    accent: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  },
};

function PaymentResult() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const [authChecking, setAuthChecking] = useState(true);
  const [status, setStatus] = useState("Verifying...");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication: validate session with profile endpoint, redirect if 401
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            dispatch(clearUser());
            if (!cancelled) navigate("/login");
          }
          return;
        }

        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (authChecking) return;

    const order_id = localStorage.getItem("orderId");

    const payment = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };

        const res = await fetch(`${API_BASE}/api/v1/user/verify-payment`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({ order_id }),
        });

        const data = await res.json();
            console.log(data);

        if (Array.isArray(data) && data.length > 0) {
          setPaymentData(data[0]);
          setStatus(data[0].payment_status || "Unknown");

     if (data[0].payment_status?.toLowerCase() === "success") {
      const premiumRes = await fetch(`${API_BASE}/api/v1/user/make-premium`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("accessToken") ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } : {}),
        },
        body: JSON.stringify({ userId: user._id }),
      });
      const premiumData = await premiumRes.json().catch(() => ({}));
      if (premiumRes.ok && (premiumData.success === true || premiumData.statuscode < 400)) {
             console.log("premiumData ", premiumData);
               navigate("/dashboard");
      } else if (premiumRes.status === 404) {
        console.warn("make-premium endpoint not found (404). Redeploy backend to enable premium upgrade.");
      }
}
        } else {
          setStatus("No payment data found");
        }
      } catch (error) {
        console.log(error);
        setStatus("Error verifying payment");
      } finally {
        setLoading(false);
      }
    };

    payment();
  }, [authChecking, user?._id]);

  const renderValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value ?? "—";
  };

  const today = new Date();
  const estimated = new Date(today);
  estimated.setDate(today.getDate() + 5);
  const formatted = estimated.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusKey = status?.toLowerCase() === "success" ? "success" : status?.toLowerCase() === "failed" ? "failed" : "default";
  const config = statusConfig[statusKey];
  const StatusIcon = config.icon;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 text-center max-w-sm animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/60 mx-auto mb-4 animate-spin" />
          <p className="text-white font-medium tracking-tight">Checking session…</p>
          <p className="mt-2 text-sm text-zinc-400">Verifying authentication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0b]">
      {size.width >= 768 && (
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
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4 sm:p-6">
        <div
          className={`w-full max-w-md rounded-2xl border ${config.border} bg-gradient-to-b ${config.accent} backdrop-blur-xl shadow-2xl overflow-hidden animate-slideUp`}
          style={{ animationDuration: "0.5s" }}
        >
          {/* Header */}
          <div className="p-6 sm:p-8 pb-4 border-b border-white/5">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${config.iconBg} ${config.iconColor} mb-5`}>
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <StatusIcon className="w-7 h-7" strokeWidth={2} />
              )}
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {loading ? "Verifying payment" : config.label}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {loading ? "Please wait while we confirm your transaction" : "Your transaction has been processed"}
            </p>
            {!loading && (
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                {status}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <div className="h-1 w-32 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-white/40 animate-loadingBar" />
              </div>
              <p className="text-zinc-500 text-sm">This usually takes a few seconds</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 pt-4">
              {paymentData && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-3">
                    <Receipt className="w-4 h-4" />
                    Transaction details
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/5 divide-y divide-white/5 overflow-hidden">
                    <DetailRow icon={Hash} label="Order ID" value={renderValue(paymentData.order_id)} />
                    <DetailRow icon={Hash} label="Transaction ID" value={renderValue(paymentData.cf_payment_id)} />
                    <DetailRow icon={Hash} label="Bank reference" value={renderValue(paymentData.bank_reference)} />
                    <DetailRow icon={Banknote} label="Amount" value={`₹${renderValue(paymentData.payment_amount)}`} highlight />
                    <DetailRow icon={CreditCard} label="Currency" value={renderValue(paymentData.payment_currency)} />
                    <DetailRow icon={CreditCard} label="Gateway" value={renderValue(paymentData.payment_gateway_details?.gateway_name)} />
                    <DetailRow icon={CreditCard} label="Method" value={renderValue(paymentData.payment_method?.upi?.channel || paymentData.payment_method)} />
                    <DetailRow icon={Calendar} label="Payment time" value={paymentData.payment_time ? new Date(paymentData.payment_time).toLocaleString() : "—"} />
                    <DetailRow icon={MessageSquare} label="Message" value={renderValue(paymentData.payment_message)} />
                    <DetailRow icon={Receipt} label="Payment group" value={renderValue(paymentData.payment_group)} />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3">
                    <Truck className="w-5 h-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Estimated delivery</p>
                      <p className="text-white font-medium">{formatted}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                Return to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${highlight ? "bg-white/[0.03]" : ""}`}>
      <Icon className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-sm mt-0.5 break-all ${highlight ? "text-white font-semibold" : "text-zinc-300"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default PaymentResult;