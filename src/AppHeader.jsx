import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
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
import { useSelector } from "react-redux";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/templates", label: "Templates" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/price", label: "Price" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function AppHeader({ onLogout }) {
  const user = useSelector((state) => state.user.userData);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/60">
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
            <FaFileMedical className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">RESUME AI</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-white">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                isActive ? "text-orange-500 font-semibold" : "hover:text-orange-500 transition"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {size.width < 768 ? (
          <>
            {open && (
              <div className="absolute right-0 top-0 w-full bg-black rounded-2xl shadow-xl z-10">
                <ul className="py-2 text-white">
                  <li className="flex items-center gap-3 px-4 py-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
                        <FaFileMedical />
                      </div>
                      <span className="text-lg font-semibold">RESUME AI</span>
                    </div>
                    <button onClick={closeMenu} className="text-2xl cursor-pointer" aria-label="Close menu">
                      <RxCross2 color="red" size={30} />
                    </button>
                  </li>
                  <li><Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><FaHome /> Home</Link></li>
                  <li><Link to="/templates" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><FileText /> Templates</Link></li>
                  <li><Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><FaUser /> Dashboard</Link></li>
                  <li><Link to="/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><GrDocumentUpload /> Upload</Link></li>
                  <li><Link to="/price" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><LuDollarSign /> Price</Link></li>
                  <li><Link to="/contact" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><IoMdContacts /> Contact</Link></li>
                  <li><Link to="/about" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition" onClick={closeMenu}><FaBook /> About</Link></li>
                  {user && typeof onLogout === "function" ? (
                    <li><button type="button" onClick={() => { onLogout(); closeMenu(); }} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 w-full text-left transition"><FaSignInAlt /> Logout</button></li>
                  ) : (
                    <li><Link to="/login" className="flex items-center gap-3 px-4 py-3 text-indigo-400 hover:text-indigo-300 transition" onClick={closeMenu}><FaSignInAlt /> Login</Link></li>
                  )}
                </ul>
              </div>
            )}
            <button type="button" className="flex gap-3 text-zinc-200" onClick={() => setOpen(!open)} aria-label="Open menu">
              <IoReorderThreeOutline size={40} />
            </button>
          </>
        ) : (
          <>
            {user && typeof onLogout === "function" ? (
              <button type="button" onClick={onLogout} className="text-red-400 hover:text-red-300 transition font-medium">
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-white hover:text-orange-500 transition font-medium">
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
