import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/admin/Navbar";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [packages, setPackages] = useState([]);
  const [floatingIPs, setFloatingIPs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [selectedIP, setSelectedIP] = useState("");
  const [showAssignIPModal, setShowAssignIPModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllIPs, setShowAllIPs] = useState(false);
  const [showChangeOwnerPopup, setShowChangeOwnerPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



       const [setProjects] = useState([]);

       const [allUsers, setAllUsers] = useState([]);
       const [selectedUserId, setSelectedUserId] = useState("");

       const [filteredUsers, setFilteredUsers] = useState([]);
      //  const [popup, setPopUp] = useState([]);
       const [ setFilteredProjects] = useState([]);


  const IP_DISPLAY_LIMIT = 5;
useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axiosInstance.get("/project/projects/list/");
                const data = res.data || [];
                setProjects(data);
                setFilteredProjects(data);
            } catch (err) {
                console.error("❌ Failed to fetch projects:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get("/auth/ausers-list/");
                setAllUsers(res.data || []);
                setFilteredUsers(res.data || []);
            } catch (err) {
                console.error("❌ Failed to fetch users:", err);
            }
        };
        fetchUsers();
    }, []);
  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    if (showModal) {
      fetchPackages();
    }
  }, [showModal]);

  useEffect(() => {
    fetchFloatingIPs();
  }, [id]);

  const fetchProjectDetails = () => {
    axiosInstance.get(`/project/${id}/project-detail/`,{ timeout: 300000 })
      .then((res) => setProject(res.data))
      .catch((err) => console.error("Failed to fetch project detail:", err));
  };

  const fetchPackages = () => {
    axiosInstance.get("/project/project-packages/list/")
      .then((res) => setPackages(res.data))
      .catch((err) => console.error("Failed to fetch packages:", err));
  };

  const fetchFloatingIPs = () => {
    axiosInstance.get(`/project/${id}/admin-IPs-proj-list/`)
      .then(res => setFloatingIPs(res.data))
      .catch(err => console.error("Failed to fetch floating IPs:", err));
  };

  const handleChangePackage = async () => {
    const projectId = id;
    const packageId = selectedPackageId;

    if (!projectId || !packageId) {
      showNotification("❗ Please select a valid package before submitting.", "error");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/project/change-vps-package/", {
        project_id: projectId,
        project_type_id: packageId,
      });
      showNotification("✅ Package updated successfully", "success");
      setShowModal(false);
      fetchProjectDetails();
    } catch (err) {
      console.error("❌ Failed to update package:", err.response?.data || err.message);
      showNotification(err.response?.data?.error || "❌ Failed to update package", "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleAssignIPToProject = async () => {
    if (!selectedIP) {
      showNotification("Please select a floating IP.", "error");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/project/${id}/assign-floating-ip/`, {
        ip_address: selectedIP,
      });

      showNotification("✅ Floating IP assigned to project successfully.", "success");
      setShowAssignIPModal(false);
      setSelectedIP("");
      fetchFloatingIPs();
    } catch (err) {
      showNotification("❌ Failed to assign floating IP.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAssignIPModal = async () => {
    try {
      const res = await axiosInstance.get("/project/available-floating-ips-list/");
      setAvailableIPs(res.data);
      setShowAssignIPModal(true);
    } catch (err) {
      showNotification("❌ Failed to fetch available IPs.", "error");
      console.error(err);
    }
  };

  const handleAssignIP = async (ipId, vmId) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/project/assign-floating-ip/`, {
        ip_id: ipId,
        vm_id: vmId,
      });
      showNotification("✅ Floating IP assigned successfully", "success");
      fetchFloatingIPs();
    } catch (err) {
      showNotification("❌ Failed to assign IP", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleChangeOwner = async () => {
  if (!id || !selectedUserId) {
    alert("⚠️ Project ID or new owner ID is missing.");
    return;
  }

  try {
    setIsSubmitting(true);
    await axiosInstance.post("/project/replace-project-owner", {
      project: id, // taken from useParams()
      new_owner: selectedUserId,
    });
    alert("✅ Project owner updated successfully!");
    setShowChangeOwnerPopup(false);
  } catch (err) {
    console.error("❌ Failed to change owner:", err);
    alert("❌ Unable to update project owner.");
  } finally {
    setIsSubmitting(false);
  }
};



  const handleUnassignIP = async (ipId) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/project/unassign-floating-ip/`, {
        ip_id: ipId,
      });
      showNotification("✅ Floating IP unassigned successfully", "success");
      fetchFloatingIPs();
    } catch (err) {
      showNotification("❌ Failed to unassign IP", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseIP = async (ipId, ipAddress) => {
    setConfirmAction({
      type: 'release',
      data: { ipId, ipAddress },
      message: `Are you sure you want to release IP ${ipAddress}? This action cannot be undone.`,
      confirmText: 'Release IP',
      onConfirm: async () => {
        setLoading(true);
        try {
          await axiosInstance.post(`/project/release-floating-ip/`, {
            ip_id: ipId,
          });
          showNotification("✅ Floating IP released successfully", "success");
          fetchFloatingIPs();
        } catch (err) {
          showNotification("❌ Failed to release IP", "error");
          console.error(err);
        } finally {
          setLoading(false);
          setShowConfirmModal(false);
          setConfirmAction(null);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const showNotification = (message, type) => {
    alert(message);
  };

  // Get displayed IPs based on showAllIPs state
  const getDisplayedIPs = () => {
    if (showAllIPs || floatingIPs.length <= IP_DISPLAY_LIMIT) {
      return floatingIPs;
    }
    return floatingIPs.slice(0, IP_DISPLAY_LIMIT);
  };

  const usagePercent = (used, total) =>
    total > 0 ? Math.round((used / total) * 100) : 0;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  const { owner, usage, vms, product_type } = project;
  const displayedIPs = getDisplayedIPs();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {project.name}
              </h1>
              <p className="text-gray-400 mt-2">Project ID: {project.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'Active' ? 'bg-green-600 text-white' :
                project.status === 'Suspended' ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Project Information">
                <Info label="Name" value={project.name} />
                <Info label="Description" value={project.description || "No description"} />
                <Info label="Created" value={new Date(project.created_at).toLocaleDateString()} />
                <Info label="Last Updated" value={new Date(project.updated_at || project.created_at).toLocaleDateString()} />
              </Card>

              <Card title="Owner Information">
                <Info label="Name" value={owner?.name || "N/A"} />
                <Info label="Email" value={owner?.email || "N/A"} />
                <Info label="ID" value={owner?.id || "N/A"} />
              </Card>
            </div>

            {/* Usage Statistics */}
            <Card title="Resource Usage">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UsageStat 
                  label="vCPUs" 
                  used={usage.vcpus_used} 
                  total={usage.vcpus_total} 
                />
                <UsageStat 
                  label="RAM" 
                  used={usage.ram_used} 
                  total={usage.ram_total} 
                  unit="MB" 
                />
                <UsageStat 
                  label="Storage" 
                  used={usage.storage_used} 
                  total={usage.storage_total} 
                  unit="GB" 
                />
              </div>
            </Card>

            {/* Virtual Machines */}
            <Card title="Virtual Machines">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-300 border-b border-gray-700">
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">IP Address</th>
                      <th className="py-3 px-4 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vms.length > 0 ? vms.map((vm) => (
                      <tr key={vm.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-white">{vm.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            vm.status === "Running" ? "bg-green-600 text-white" : 
                            vm.status === "Stopped" ? "bg-red-600 text-white" :
                            "bg-yellow-600 text-white"
                          }`}>
                            {vm.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{vm.ip || "—"}</td>
                        <td className="py-3 px-4 text-gray-300">{vm.created}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-400">
                          No virtual machines found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Floating IPs */}
            <Card title="Floating IP Addresses">
              <div className="mb-6">
                <ActionBtn 
                  label="Assign New IP" 
                  color="blue" 
                  onClick={openAssignIPModal}
                  disabled={loading}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-300 border-b border-gray-700">
                      <th className="py-3 px-4 font-semibold">IP Address</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Assigned VM</th>
                      <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedIPs.length > 0 ? displayedIPs.map(ip => (
                      <tr key={ip.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-white font-medium">{ip.ip_address}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ip.status === "allocated" ? "bg-green-600 text-white" :
                            ip.status === "reserved" ? "bg-blue-600 text-white" :
                            "bg-gray-600 text-white"
                          }`}>
                            {ip.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{ip.vm_name || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {ip.status === "reserved" && (
                              <button
                                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                                onClick={() => handleAssignIP(ip.id, vms[0]?.id)}
                                disabled={loading || vms.length === 0}
                              >
                                Assign
                              </button>
                            )}
                            {ip.status === "allocated" && (
                              <button
                                className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors disabled:opacity-50"
                                onClick={() => handleUnassignIP(ip.id)}
                                disabled={loading}
                              >
                                Unassign
                              </button>
                            )}
                            <button
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                              onClick={() => handleReleaseIP(ip.id, ip.ip_address)}
                              disabled={loading}
                            >
                              Release
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-400">
                          No floating IPs assigned to this project
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Show More/Less Button */}
              {floatingIPs.length > IP_DISPLAY_LIMIT && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllIPs(!showAllIPs)}
                    className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-400 hover:border-blue-300 rounded transition-colors"
                  >
                    {showAllIPs 
                      ? `Show Less (${IP_DISPLAY_LIMIT} of ${floatingIPs.length})`
                      : `Show More (${floatingIPs.length - IP_DISPLAY_LIMIT} more)`
                    }
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Package Info & Actions */}
          <div className="space-y-8">
            {/* Current Package */}
            <Card title="Current Package">
              <div className="space-y-4">
                <Info label="Plan" value={product_type?.name} />
                <Info label="Price" value={`$${product_type?.price_per_month}/month`} valueClass="text-green-400 font-bold" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-xl font-bold text-white">{product_type?.vcpus}</div>
                    <div className="text-xs text-gray-400">vCPUs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-xl font-bold text-white">{product_type?.ram}</div>
                    <div className="text-xs text-gray-400">MB RAM</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-xl font-bold text-white">{product_type?.total_volume_gb}</div>
                    <div className="text-xs text-gray-400">GB Storage</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-xl font-bold text-white">{product_type?.instances}</div>
                    <div className="text-xs text-gray-400">Instances</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Management Actions */}
       <Card title="Project Management">
  <div className="space-y-3">
    {/* Change Owner */}
    <button
      onClick={() => setShowChangeOwnerPopup(true)}
      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold transition-all duration-300"
    >
      🧑‍💼 Change Owner
    </button>

    {/* Update Package */}
    <button
      onClick={() => setShowModal(true)}
      disabled={loading}
      className={`w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      📦 Update Package
    </button>

    {/* Suspend Project */}
    <button
      onClick={() => console.log("Suspend clicked")}
      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold transition-all duration-300"
    >
      🚫 Suspend Project
    </button>

    {/* Delete Project */}
    <button
      onClick={() => console.log("Delete clicked")}
      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all duration-300"
    >
      ❌ Delete Project
    </button>
  </div>
</Card>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssignIPModal && (
        <Modal 
          title="Assign Floating IP" 
          onClose={() => setShowAssignIPModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-300">Select an available floating IP to assign to this project:</p>
            <select
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
              value={selectedIP}
              onChange={(e) => setSelectedIP(e.target.value)}
            >
              <option value="">-- Select an IP Address --</option>
             {availableIPs.map((ip, index) => (
  <option key={`${ip.ip_address}-${index}`} value={ip.ip_address}>
    {ip.ip_address} {ip.note ? `- ${ip.note}` : ""}
  </option>
))}

            </select>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAssignIPModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignIPToProject}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                disabled={loading || !selectedIP}
              >
                {loading ? "Assigning..." : "Assign IP"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal 
          title="Select New Package" 
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-300">Choose a new package for this project:</p>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`cursor-pointer border p-4 rounded transition-all hover:border-blue-400 ${
                    selectedPackageId === pkg.id 
                      ? "border-blue-500 bg-blue-500/10" 
                      : "border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold text-lg">{pkg.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{pkg.description}</div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                        <span>{pkg.vcpus} vCPUs</span>
                        <span>{pkg.ram} MB</span>
                        <span>{pkg.total_volume_gb} GB</span>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold text-lg">${pkg.price_per_month}/mo</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                disabled={!selectedPackageId || loading}
                onClick={handleChangePackage}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Package"}
              </button>
            </div>
          </div>
        </Modal>
      )}
  {showChangeOwnerPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md text-white border border-gray-700 shadow-2xl">
      <h2 className="text-xl font-semibold mb-4 text-indigo-400">Change Project Owner</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-indigo-300 mb-2">
          Select New Owner
        </label>
        <input
          type="text"
          placeholder="Search by username or email..."
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-2"
          onChange={(e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = allUsers.filter(
              (u) =>
                u.username.toLowerCase().includes(keyword) ||
                (u.email && u.email.toLowerCase().includes(keyword))
            );
            setFilteredUsers(filtered);
          }}
        />
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
        >
          <option value="" disabled>-- Select a user --</option>
          {filteredUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowChangeOwnerPopup(false)}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleChangeOwner}
          disabled={!selectedUserId || isSubmitting}
          className={`px-4 py-2 rounded font-semibold text-white ${
            isSubmitting ? "bg-green-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {isSubmitting ? "Processing..." : "Confirm"}
        </button>
      </div>
    </div>
  </div>
)}


      {showConfirmModal && confirmAction && (
        <Modal 
          title="Confirm Action" 
          onClose={() => setShowConfirmModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-300">{confirmAction.message}</p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : confirmAction.confirmText}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Reusable Components
function Modal({ title, children, onClose, size = "md" }) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className={`bg-gray-800 rounded-lg w-full ${sizeClasses[size]} shadow-xl border border-gray-700`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Info({ label, value, valueClass = "text-white" }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
      <span className="font-medium text-gray-400">{label}:</span>
      <span className={`font-medium ${valueClass}`}>{value ?? "—"}</span>
    </div>
  );
}

function UsageStat({ label, used, total, unit = "" }) {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const barColor = percent > 85 ? "bg-red-500" : percent > 60 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">
          {label}
        </span>
        <span className="text-xs text-gray-400">{percent}%</span>
      </div>
      <div className="text-lg font-bold text-white mb-2">
        {used} / {total} {unit}
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`${barColor} h-full transition-all duration-300`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled = false }) {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors focus:outline-none w-full";
  const colorVariants = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-600 hover:bg-gray-500 text-white",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${colorVariants[color] || colorVariants.gray} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {label}
    </button>
  );
}