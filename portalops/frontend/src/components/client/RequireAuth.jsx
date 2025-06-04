import { Navigate, Outlet } from "react-router-dom";

function getTokenWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.token;
}

const RequireAuth = () => {
  const token = getTokenWithExpiry("accessToken");
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
