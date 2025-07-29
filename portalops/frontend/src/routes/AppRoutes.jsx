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
import TwoFactorSetupPage from "../pages/client/TwoFactorSetupPage";
import EditProfilePage from './../pages/client/EditProfilePage';
import CreateUserPage from "../pages/admin/CreateUserPage";
import AdminUserDetailPage from "../pages/admin/UserDetailPage";
import NetworkListPage from "../pages/client/Network";
import { CreateFloatingIPPage, CreateNetworkPage } from "../pages/client/CreateNetworkPage";
import FloatingIPListPage from "../pages/client/FloatingIPPage";
import InstancesPage from "../pages/admin/InstancesPage";
import CreateProjectTypePage from "../pages/admin/CreateProjectType";
import ProjectTypeListPage from "../pages/admin/PackagePage";
import ProjectListPage from "../pages/admin/ProjectListPage";
import CreateProjectPage from "../pages/admin/CreateProjectPage";
import ProjectDetail from "../pages/admin/ProjectDetailsPage";
import ProjectDashboard from '../pages/client/manageProject/ManagePackage';
import NetworkDashboardPage from './../pages/admin/network/NetworkDashboard';
import SubnetManagement from './../pages/admin/network/SubnetManagement';
import RouteManagement from './../pages/admin/network/RouteManagement';
import NetworkDetailPage from './../pages/admin/network/NetworkDetail';
import TCreateNetworkPage from './../pages/admin/network/CreateNetworkPage';
import CreateImagePage from "../pages/admin/CreateImagePage";
import CreateInstanceAsAdminPage from "../pages/admin/CreateInstancePage";



function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<EditProfilePage />} />
        {/* Protected routes */}
        <Route element={<RequireAuth />}>
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
          <Route path="/networks" element={<NetworkListPage />} />
          <Route path="/floating-ips" element={<FloatingIPListPage />} />

          <Route path="/create-network" element={<CreateNetworkPage />} />
          <Route path="/create-image" element={<CreateImageForm />} />
          <Route path="/create-keypair" element={<CreateKeypairForm />} />
          <Route path="/vps-backup" element={<SnapshotListPage />} />
          <Route path="/volume-backup" element={<VolumeSnapshotListPage />} />
          <Route path="/setup-2fa" element={<TwoFactorSetupPage />} />
          <Route path="/" element={<VolumeSnapshotListPage />} />
          <Route path="/manage-project" element={< ProjectDashboard />} />




          {/* Staff routes */}

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/create-user" element={<CreateUserPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/users-manager" element={<UserManagementPage />} />
          <Route path="/admin/instances" element={< InstancesPage />} />
          <Route path="/admin/create-package" element={< CreateProjectTypePage />} />
          <Route path="/admin/create-images" element={< CreateImagePage />} />
            <Route path="/admin/create-instance" element={< CreateInstanceAsAdminPage />} />
          <Route path="/admin/packages" element={< ProjectTypeListPage />} />
          <Route path="/admin/project-detail/:id" element={< ProjectDetail />} />
          <Route path="/admin/projects" element={< ProjectListPage />} />
          <Route path="/admin/create-project" element={< CreateProjectPage />} />
          <Route path="/admin/network" element={< NetworkDashboardPage />} />
          <Route path="/admin/subnet" element={< SubnetManagement />} />
          <Route path="/admin/network-detail" element={< NetworkDetailPage />} />
          <Route path="/admin/create-networks" element={< TCreateNetworkPage />} />
          <Route path="/admin/subnet" element={< SubnetManagement />} />
          <Route path="/admin/subnet" element={< SubnetManagement />} />
        </Route>

        {/* Redirect unknown routes to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
