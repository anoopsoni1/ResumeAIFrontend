import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { FiUser, FiMail } from "react-icons/fi";
import { clearUser, setUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUserProfile] = useState(null);

  // Update account form
  const [editFirstName, setEditFirstName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem("accessToken");
    return { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) };
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/v1/user/logout`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Auth: fetch profile and redirect if not logged in
  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || res.status === 401) {
          dispatch(clearUser());
          navigate("/login");
          return;
        }
        const currentUser = data?.user || data?.data?.user;
        if (currentUser) {
          dispatch(setUser(currentUser));
          setUserProfile(currentUser);
          setEditFirstName(currentUser.FirstName || "");
          setEditEmail(currentUser.email || "");
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setUpdateMessage({ type: "", text: "" });
    if (!editFirstName?.trim() || !editEmail?.trim()) {
      setUpdateMessage({ type: "error", text: "First name and email are required." });
      return;
    }
    setUpdateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ FirstName: editFirstName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUpdateMessage({ type: "error", text: data?.message || "Update failed." });
        return;
      }
      const updatedUser = data?.data || data?.user;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        setUserProfile(updatedUser);
      }
      setUpdateMessage({ type: "success", text: "Account updated successfully." });
    } catch (err) {
      setUpdateMessage({ type: "error", text: err?.message || "Update failed." });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-300">Verifying authentication.</p>
        </div>
      </div>
    );
  }

  const backgroundLayout = (
    <>
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
      <div className={`absolute inset-0 z-1 ${size.width >= 768 ? "bg-black/40" : "bg-black/30"}`} />
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {backgroundLayout}
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <AppHeader onLogout={handleLogout} />
        <main className="flex-1 py-6 sm:py-8 px-4">
          <div className="mx-auto max-w-2xl">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-400 transition mb-6"
            >
              ← Back to Dashboard
            </Link>

            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8 space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Profile</h1>
                <p className="text-slate-400 text-sm sm:text-base">Manage your account.</p>
              </div>

              {!user ? (
                <p className="text-slate-400">Loading profile…</p>
              ) : (
                <>
                  {/* Current info (read-only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                          <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                          <p className="font-semibold text-white text-sm sm:text-base truncate">
                            {user.FirstName} {user.LastName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                          <FiMail className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                          <p className="font-medium text-white text-sm sm:text-base truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Update account details */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Update account details</h2>
                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                      <div>
                        <label htmlFor="profile-firstName" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          First name
                        </label>
                        <input
                          id="profile-firstName"
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          id="profile-email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Email"
                        />
                      </div>
                      {updateMessage.text && (
                        <p className={`text-sm ${updateMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                          {updateMessage.text}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {updateLoading ? "Saving…" : "Save changes"}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default Profile;
