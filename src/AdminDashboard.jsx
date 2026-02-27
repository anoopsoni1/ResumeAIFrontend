import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { clearUser } from "./slice/user.slice";
import LiquidEther from "./LiquidEther";
import LightPillar from "./LiquidEther.jsx";
import FloatingLines from "./Lighting";
import Particles from "./Lighting.jsx";
import Particles from "./Lighting.jsx";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";

function AdminDashboard() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/api/v1/user/get-all-users`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || "Failed to fetch users");
        }
        setUsers(json?.data ?? []);
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

    fetchUsers();
  }, [userData, navigate, dispatch]);

  if (!userData) return null;
  const layout = (
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
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <AppHeader onLogout={handleLogout} />
        <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link
            to="/dashboard"
            className="text-sm text-white hover:text-indigo-400 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-white px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Last Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Premium
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white">
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
                        <td className="px-4 py-3 font-medium text-white">{u.FirstName}</td>
                        <td className="px-4 py-3 font-medium text-white">{u.LastName}</td>
                        <td className="px-4 py-3 text-slate-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.Premium
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-slate-600/50 text-slate-400"
                            }`}
                          >
                            {u.Premium ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.isAdmin
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "bg-slate-600/50 text-slate-400"
                            }`}
                          >
                            {u.isAdmin ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : "—"}
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

  if (!userData.isAdmin) {
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

  return layout;
}

export default AdminDashboard;
