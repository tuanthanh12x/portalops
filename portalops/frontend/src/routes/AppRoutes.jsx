import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import RequireAuth from "../components/RequireAuth";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Các route bên dưới đều phải đăng nhập mới xem được */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/create-instance" element={<CreateInstancePage />} />
          {/* Add thêm các route private khác ở đây */}
        </Route>

        {/* Nếu truy cập route không hợp lệ, có thể redirect về login hoặc 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
