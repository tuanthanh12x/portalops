import axios from "axios";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
  withCredentials: true, // for refresh token cookie
});

// Token with expiry from localStorage
function getTokenWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (!item.expiry || typeof item.expiry !== "number" || Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.token;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

// Request interceptor: Add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const impersonationToken = sessionStorage.getItem("impersonation_token");
    const token = impersonationToken || getTokenWithExpiry("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Skip token refresh if impersonating
    const isImpersonating = Boolean(sessionStorage.getItem("impersonation_token"));
    const isUnauthorized = error.response?.status === 401;
    const isFirstAttempt = !originalRequest._retry;

    if (isUnauthorized && isFirstAttempt && !isImpersonating) {
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

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
