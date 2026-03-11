/**
 * Handles redirect from backend after Google OAuth.
 * URL: /auth/callback?token=...&user=...
 * Stores token in localStorage, user in Redux, then redirects to dashboard.
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "./slice/user.slice";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token) {
      localStorage.setItem("accessToken", token);
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          dispatch(setUser(user));
        } catch {
          // ignore invalid user payload
        }
      }
      // Replace URL so token is not left in history
      window.history.replaceState({}, "", "/dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
        <p className="text-white font-semibold">Signing you in…</p>
        <p className="mt-1 text-sm text-slate-400">Please wait.</p>
      </div>
    </div>
  );
}
