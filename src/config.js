/**
 * Backend API URL from .env (Vite: VITE_API_BASE_URL).
 * Use API_BASE for /api/v1/user routes; use API_BASE_URL for other paths or socket.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

/** Base URL for user API: ${API_BASE_URL}/api/v1/user */
export const API_BASE = `${API_BASE_URL}/api/v1/user`;

/** Backend origin (for socket, auth redirects, etc.) */
export { API_BASE_URL };
export default API_BASE_URL;
