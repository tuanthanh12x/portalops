import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

function getTokenWithExpiry() {
  const tokenStr = localStorage.getItem("accessToken");
  if (!tokenStr) return null;
  try {
    const { token, expiry } = JSON.parse(tokenStr);
    if (Date.now() > expiry) {
      localStorage.removeItem("accessToken");
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem("accessToken");
    return null;
  }
}

function setAccessToken(token, expiresInSeconds = 3600) {
  const expiry = Date.now() + expiresInSeconds * 1000;
  const item = { token, expiry };
  localStorage.setItem("accessToken", JSON.stringify(item));
}

// === Request Interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenWithExpiry();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor (refresh if needed) ===
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.access;
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
