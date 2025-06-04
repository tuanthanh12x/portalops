import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 5000,
});

/**
 * Retrieve token from localStorage and check expiry.
 * @param {string} key
 * @returns {string|null} token or null if expired/not found
 */
function getTokenWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (!item.expiry || typeof item.expiry !== 'number') {
      localStorage.removeItem(key);
      return null;
    }

    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.token;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

// Request Interceptor: Add Authorization header and custom headers
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

// Response Interceptor: Handle unauthorized errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized. Token may have expired.");
      // Optional: Trigger logout or redirect here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
