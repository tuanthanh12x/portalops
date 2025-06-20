import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
});

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

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ BASE_URL = ", process.env.REACT_APP_API_BASE_URL);
    }

    const token = getTokenWithExpiry("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Optional)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized. Maybe token expired.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;