import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 5000,
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

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("✅ BASE_URL = ", process.env.REACT_APP_API_BASE_URL);

    const token = getTokenWithExpiry("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
