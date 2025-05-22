import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import PrivateRoute from "../components/PrivateRoute";
import { useSelector } from 'react-redux';
function AppRoutes() {
  const accessToken = useSelector(state => state.auth.accessToken);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-instance" element={<CreateInstancePage />} />
        <Route path="/login" element={accessToken ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Thêm các route cần bảo vệ tương tự */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;
