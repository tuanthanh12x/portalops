import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
  withCredentials: true, // Important: send HttpOnly cookie (refresh_token)
});

// Helper: Get access token from localStorage with expiry check
function getTokenWithExpiry() {
  const itemStr = localStorage.getItem("accessToken");
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
      localStorage.removeItem("accessToken");
      return null;
    }
    return item.token;
  } catch {
    localStorage.removeItem("accessToken");
    return null;
  }
}

// Helper: Set access token with expiry (default: 1h)
function setAccessToken(token, expiresInSeconds = 3600) {
  const expiry = new Date().getTime() + expiresInSeconds * 1000;
  localStorage.setItem("accessToken", JSON.stringify({ token, expiry }));
}

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenWithExpiry();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with refresh fallback
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Request to refresh token using HttpOnly cookie
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access;
        setAccessToken(newAccessToken); // ✅ Only access token in localStorage

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("🔒 Refresh failed:", err);
        localStorage.removeItem("accessToken");
        // Optional: redirect to login page or show modal
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
