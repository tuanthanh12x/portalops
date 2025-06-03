import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import CreateInstancePage from "../pages/client/CreateInstance";
import CreateVolumePage from "../pages/client/CreateVolume";
import RequireAuth from "../components/RequireAuth";
import CreateImageForm from "../pages/client/CreateImage";
import CreateKeypairForm from "../pages/client/CreateKeyPair";
import AdminDashboard from "../pages/admin/AdminDashBoard";
import MyInstancesPage from "../pages/client/InstancesPage";
import ImageListPage from "../pages/client/ImageListPage";
import VolumeListPage from "../pages/client/VolumeListPage";
import KeypairListPage from "../pages/client/KeypairListPage";
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-instance" element={<CreateInstancePage />} />
          <Route path="/instances" element={<MyInstancesPage />} />
          <Route path="/images" element={<ImageListPage />} />
          <Route path="/volumes" element={<VolumeListPage />} />
          <Route path="/keypairs" element={<KeypairListPage />} />
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
