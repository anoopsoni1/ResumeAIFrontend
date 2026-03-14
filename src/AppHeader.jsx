import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical } from "react-icons/fa";
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaHome } from "react-icons/fa";
import { GrDocumentUpload } from "react-icons/gr";
import { IoMdContacts } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { LuDollarSign } from "react-icons/lu";
import { FaSignInAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FileText } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "./slice/user.slice";
import { useLogout } from "./utils/authUtils";
import { API_BASE } from "./config.js";

const MENU_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/dashboard", label: "Dashboard", icon: FaUser },
  { to: "/upload", label: "Upload", icon: GrDocumentUpload },
  { to: "/price", label: "Price", icon: LuDollarSign },
  { to: "/contact", label: "Contact", icon: IoMdContacts },
  { to: "/about", label: "About", icon: FaBook },
];

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/templates", label: "Templates" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/price", label: "Price" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MENU_ANIM_DURATION_MS = 300;

export default function AppHeader({ onLogout }) {
  const dispatch = useDispatch();
  const logout = useLogout(); // Global logout: clears backend session, localStorage, Redux, redirects to /login
  const user = useSelector((state) => state.user.userData);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimeoutRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // So we show Logout on the page that had the bug: use localStorage when Redux user is missing
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const storedUserJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const storedUser = storedUserJson ? (() => { try { return JSON.parse(storedUserJson); } catch { return null; } })() : null;
  const isLoggedIn = !!user || !!(token && storedUser);

  // Restore Redux user from localStorage or profile when we have token but no user (fixes one page showing Login)
  useEffect(() => {
    if (user) return;
    if (!token) return;
    const fromStorage = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
    if (fromStorage && typeof fromStorage === "object") {
      dispatch(setUser(fromStorage));
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/profile`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (cancelled) return;
        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
        else if (data?.statusCode === 401 || data?.statuscode === 401) {
          dispatch(clearUser());
          localStorage.removeItem("accessToken");
        }
      });
    return () => { cancelled = true; };
  }, [user, token, dispatch]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setOpen(false);
      setClosing(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Lock body scroll when mobile menu is open (small screens only)
  useEffect(() => {
    if (size.width >= 768) return;
    if (open && !closing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, closing, size.width]);

  const closeMenu = () => {
    if (!open) return;
    setClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimeoutRef.current = null;
    }, MENU_ANIM_DURATION_MS);
  };

  const openMenu = () => {
    setClosing(false);
    setOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-white/5 transition-all duration-500 ease-out ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/20"
            whileHover={{ scale: 1.1, rotate: 6, boxShadow: "0 10px 30px -5px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <FaFileMedical className="text-white" />
          </motion.div>
          <span className="text-lg font-semibold text-white transition-colors duration-200 group-hover:text-indigo-200">
            RESUME AI
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-white">
          {NAV_LINKS.map(({ to, label }, i) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `group relative py-1 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "hover:text-orange-500"
                }`
              }
              style={{ transitionDelay: mounted ? `${i * 30}ms` : "0ms" }}
            >
              {({ isActive }) => (
                <span className="relative inline-block">
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 rounded-full transition-transform duration-300 origin-center ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                    aria-hidden
                  />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {size.width < 768 ? (
          <>
            {/* Portal overlay to body so fixed inset-0 covers viewport (header's backdrop-blur would otherwise trap it) */}
            {(open || closing) &&
              createPortal(
                <div
                  className="fixed inset-0 z-9999 md:hidden"
                  aria-hidden
                >
                  <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                      closing ? "opacity-0" : "opacity-100"
                    }`}
                    onClick={closeMenu}
                  />
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[min(300px,85vw)] max-w-full bg-black/98 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                      closing ? "-translate-x-full" : "translate-x-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                  >
                    <ul className="py-2 text-white flex-1 overflow-y-auto">
                      <li className="flex items-center gap-3 px-4 py-3 justify-between border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0">
                            <FaFileMedical />
                          </div>
                          <span className="text-lg font-semibold truncate">RESUME AI</span>
                        </div>
                        <button
                          onClick={closeMenu}
                          className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all duration-200 shrink-0"
                          aria-label="Close menu"
                        >
                          <RxCross2 className="text-red-400 w-6 h-6" />
                        </button>
                      </li>
                      {MENU_ITEMS.map((item, index) => (
                        <li
                          key={item.to}
                          className={`group transition-all duration-300 ease-out ${
                            closing ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                          }`}
                          style={{
                            transitionDelay: closing ? "0ms" : `${40 + index * 35}ms`,
                            transitionProperty: "opacity, transform",
                          }}
                        >
                          <Link
                            to={item.to}
                            className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 active:bg-white/15 transition-all duration-200 border-l-2 border-transparent hover:border-indigo-500/50"
                            onClick={closeMenu}
                          >
                            <item.icon size={20} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li
                        className={`mt-auto transition-all duration-300 ease-out ${
                          closing ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                        }`}
                        style={{
                          transitionDelay: closing ? "0ms" : `${40 + MENU_ITEMS.length * 35}ms`,
                          transitionProperty: "opacity, transform",
                        }}
                      >
                        {isLoggedIn ? (
                          <button
                            type="button"
                            onClick={() => { logout(); closeMenu(); }}
                            className="flex items-center gap-3 px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-white/10 w-full text-left transition-colors"
                          >
                            <FaSignInAlt size={20} className="shrink-0" /> Logout
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="flex items-center gap-3 px-4 py-3.5 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-colors"
                            onClick={closeMenu}
                          >
                            <FaSignInAlt size={20} className="shrink-0" /> Login
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>,
                document.body
              )}
            {/* When menu is open, hide hamburger so only drawer's X is visible; avoids two buttons in one bar */}
            <motion.button
              type="button"
              className={`flex items-center justify-center text-zinc-200 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 min-w-[44px] min-h-[44px] transition-opacity duration-200 ${open && !closing ? "opacity-0 pointer-events-none" : ""}`}
              onClick={() => (open ? closeMenu() : openMenu())}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <IoReorderThreeOutline size={28} />
            </motion.button>
          </>
        ) : (
          <>
            {isLoggedIn ? (
              <motion.button
                type="button"
                onClick={logout}
                className="text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Logout
              </motion.button>
            ) : (
              <Link to="/login">
                <motion.span
                  className="inline-block text-white hover:text-orange-500 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-500/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  Login
                </motion.span>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
