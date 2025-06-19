import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
  withCredentials: true, // ⬅️ Required for HttpOnly cookie (refresh token)
});

/**
 * Retrieve token from localStorage and check expiry.
 */
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

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenWithExpiry("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
        console.warn("🔒 Refresh token failed. Redirecting to login.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Force logout
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
