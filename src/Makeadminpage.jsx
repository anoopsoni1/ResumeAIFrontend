import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import FloatingLines from "./Lighting";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useToast } from "./context/ToastContext";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function Makeadminpage() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makingAdminId, setMakingAdminId] = useState(null);

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/v1/user/get-all-users`, {
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch users");
      setUsers(json?.data ?? []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load users");
      if (err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("admin")) {
        dispatch(clearUser());
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    if (!userData.isAdmin) {
      setError("Access denied. Admin only.");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [userData, navigate, dispatch]);

  const handleMakeAdmin = async (userId) => {
    setMakingAdminId(userId);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/v1/user/make-admin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to make admin");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isAdmin: true } : u))
      );
      toast.success("User is now an admin.");
    } catch (err) {
      toast.error(err.message || "Failed to make admin.");
    } finally {
      setMakingAdminId(null);
    }
  };

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
            lineCount={5}
            lineDistance={10}
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

  if (!userData) return null;
  if (!userData.isAdmin) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {backgroundLayout}
        <div className="relative z-10 flex flex-col min-h-screen text-white">
          <AppHeader onLogout={handleLogout} />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-amber-500">Access Denied</h1>
              <p className="mt-2 text-slate-400">This page is for administrators only.</p>
              <Link to="/dashboard" className="mt-4 inline-block text-indigo-400 hover:underline">
                Back to Dashboard
              </Link>
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {backgroundLayout}
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <AppHeader onLogout={handleLogout} />
        <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Make Admin</h1>
          <div className="flex gap-4">
            <Link
              to="/admin-dashboard"
              className="text-sm text-white hover:text-indigo-400 transition"
            >
              All Users
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-white  hover:text-indigo-400 transition"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Premium</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr
                        key={u._id}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 transition"
                      >
                        <td className="px-4 py-3 text-slate-300">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {u.FirstName} {u.LastName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.Premium ? "bg-amber-500/20 text-amber-400" : "bg-slate-600/50 text-slate-400"
                            }`}
                          >
                            {u.Premium ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.isAdmin ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-600/50 text-slate-400"
                            }`}
                          >
                            {u.isAdmin ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.isAdmin ? (
                            <span className="text-slate-500 text-sm">—</span>
                          ) : (
                            <button
                              type="button"
                              disabled={makingAdminId === u._id}
                              onClick={() => handleMakeAdmin(u._id)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {makingAdminId === u._id ? "Making admin…" : "Make Admin"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <p className="mt-4 text-sm text-white">
            Total: {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        )}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default Makeadminpage;
