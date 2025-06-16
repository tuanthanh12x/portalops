import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import CreateVolumePage from "../pages/client/CreateVolume";
import RequireAuth from "../components/client/RequireAuth";
import CreateImageForm from "../pages/client/CreateImage";
import CreateKeypairForm from "../pages/client/CreateKeyPair";
import AdminDashboard from "../pages/admin/AdminDashBoard";
import MyInstancesPage from "../pages/client/InstancesPage";
import ImageListPage from "../pages/client/ImageListPage";
import VolumeListPage from "../pages/client/VolumeListPage";
import KeypairListPage from "../pages/client/KeypairListPage";
import ClientDashBoard from "../pages/client/ClientDashBoard";
import UserManagementPage from "../pages/admin/UserManagePage";
import VPSDetailPage from "../pages/client/VpsDetail";
import SnapshotListPage from "../pages/client/SnapshotListPage";
import VolumeSnapshotListPage from "../pages/client/VolumeBackupList";
import BillingDashBoard from "../pages/client/BillingDashboard";
import SupportPage from "../pages/client/SupportPage";
import ForgotPasswordPage from "../pages/client/ForgotPassPage";
import RegisterPage from "../pages/RegisterPage";
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Protected routes */}
        {/* <Route element={<RequireAuth />}> */}
        <Route path="/dashboard" element={<ClientDashBoard />} />
        <Route path="/billing" element={<BillingDashBoard />} />
        <Route path="/create-instance" element={<CreateInstancePage />} />
        <Route path="/instances" element={<MyInstancesPage />} />
        <Route path="/images" element={<ImageListPage />} />
        <Route path="/client/vps/:id" element={<VPSDetailPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/volumes" element={<VolumeListPage />} />
        <Route path="/keypairs" element={<KeypairListPage />} />
        <Route path="/create-volume" element={<CreateVolumePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/users-manager" element={<UserManagementPage />} />
        <Route path="/create-image" element={<CreateImageForm />} />
        <Route path="/create-keypair" element={<CreateKeypairForm />} />
        <Route path="/vps-backup" element={<SnapshotListPage />} />
        <Route path="/volume-backup" element={<VolumeSnapshotListPage />} />
              <Route path="/" element={<VolumeSnapshotListPage />} />
        {/* </Route> */}

        {/* Redirect unknown routes to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
