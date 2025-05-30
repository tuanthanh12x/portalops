import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import CreateVolumePage from "../pages/client/CreateVolume";
import RequireAuth from "../components/RequireAuth";
import InstancesTable from "../components/InstancesTable";
import CreateImageForm from "../pages/client/CreateImage";
import CreateKeypairForm from "../pages/client/CreateKeyPair";
import AdminDashboard from "../pages/admin/AdminDashBoard";
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/create-instance" element={<CreateInstancePage />} />
          <Route path="/instances" element={<InstancesTable />} />

          <Route path="/create-volume" element={<CreateVolumePage />} />
          <Route path="/" element={<Home />} />
          {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
          <Route path="/create-image" element={<CreateImageForm />} />
          <Route path="/create-keypair" element={<CreateKeypairForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />F
      </Routes>F
    </Router>
  );
}

export default AppRoutes;
