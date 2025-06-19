import axios from "axios";

// Base setup
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === "production" ? 10000 : 5000,
  withCredentials: true, // required for sending HttpOnly cookies (refresh token)
});

/**
 * Retrieve access token from localStorage with expiry check
 */
function getTokenWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (
      !item.expiry ||
      typeof item.expiry !== "number" ||
      Date.now() > item.expiry
    ) {
      localStorage.removeItem(key);
      return null;
    }
    return item.token;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Request Interceptor
 * - Uses impersonation_token if present (sessionStorage)
 * - Falls back to accessToken from localStorage
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const impersonationToken = sessionStorage.getItem("impersonation_token");
    const normalToken = getTokenWithExpiry("accessToken");

    if (impersonationToken) {
      config.headers.Authorization = `Bearer ${impersonationToken}`;
    } else if (normalToken) {
      config.headers.Authorization = `Bearer ${normalToken}`;
    }

    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - Handles 401 (unauthorized) with token refresh
 * - Skips refresh if impersonation is active
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isImpersonating = Boolean(
      sessionStorage.getItem("impersonation_token")
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isImpersonating
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const { access } = res.data;
        const expiryMs = 60 * 60 * 1000; // 1 hour
        const now = new Date();

        localStorage.setItem(
          "accessToken",
          JSON.stringify({ token: access, expiry: now.getTime() + expiryMs })
        );

        // Update token in headers
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.warn("🔒 Refresh token failed. Redirecting to login.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
