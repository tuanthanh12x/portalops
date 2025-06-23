import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
  withCredentials: true, // Important: send HttpOnly cookie
});

// Helper to get access token from localStorage
function getTokenWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.token;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

// Helper to store access token with expiry
function setAccessToken(token, expiresIn = 3600) {
  const expiry = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem("accessToken", JSON.stringify({ token, expiry }));
}

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ BASE_URL =", process.env.REACT_APP_API_BASE_URL);
    }

    const token = getTokenWithExpiry("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with refresh logic
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
        // Call the refresh API (HttpOnly cookie is used automatically)
        const refreshRes = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.access;
        setAccessToken(newAccessToken);

        // Retry the original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔴 Refresh token failed", refreshError);
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
