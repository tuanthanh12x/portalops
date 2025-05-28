import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import RequireAuth from "../components/RequireAuth";
import CreateImageForm from "../pages/client/CreateImage";
import CreateKeypairForm from "../pages/client/CreateKeyPair";
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Các route bên dưới đều phải đăng nhập mới xem được */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/create-instance" element={<CreateInstancePage />} />
          <Route path="/" element={<Home />} />
          <Route path="/create-image" element={<CreateImageForm />} />
            <Route path="/create-keypair" element={<CreateKeypairForm />} />
          {/* Add thêm các route private khác ở đây */}
        </Route>

        {/* Nếu truy cập route không hợp lệ, có thể redirect về login hoặc 404 */}
        <Route path="*" element={<Navigate to="/login" />} />F
      </Routes>F
    </Router>
  );
}

export default AppRoutes;
