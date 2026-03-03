import axios from "axios";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../slice/user.slice";

const LOGOUT_URL = "https://resumeaibackend-oqcl.onrender.com/api/v1/user/logout";

/**
 * Performs full logout: backend call, clear localStorage (accessToken + user), clear Redux.
 * Call this from anywhere to ensure user is logged out across the whole app.
 * @param {Function} dispatch - Redux dispatch
 * @param {Function} [navigate] - Optional navigate function (e.g. from useNavigate). If provided, redirects to /login.
 */
export async function performLogout(dispatch, navigate) {
  try {
    await axios.post(LOGOUT_URL, {}, { withCredentials: true });
  } catch (err) {
    console.error("Logout request failed", err);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (typeof dispatch === "function") dispatch(clearUser());
    if (typeof navigate === "function") navigate("/login");
  }
}

/**
 * Hook that returns a single logout handler. Use in any component (e.g. AppHeader)
 * so logout always clears session + storage + Redux and redirects to /login.
 */
export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useCallback(async () => {
    await performLogout(dispatch, navigate);
  }, [dispatch, navigate]);
}

export { LOGOUT_URL };
