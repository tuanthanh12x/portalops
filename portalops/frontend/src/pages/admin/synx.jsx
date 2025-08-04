import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminNavbar from "../../components/admin/Navbar";

// A small, reusable loading component for individual cards
const CardSpinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
  </div>
);

export default function AdminProjectDetailPage() {
  const { id } = useParams(); // This 'id' is the openstack_id

  // FIX 1: State management has been cleaned up. Removed old/unused state.
  const [basicInfo, setBasicInfo] = useState(null);
  const [quota, setQuota] = useState(null);
  const [vms, setVms] = useState(null);
  const [loading, setLoading] = useState({
    basic: true,
    quota: true,
    vms: true,
    page: false, // For actions like updating package
  });
  const [error, setError] = useState(null);

  // Other state variables for modals, IPs, etc., remain the same
  const [floatingIPs, setFloatingIPs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [selectedIP, setSelectedIP] = useState("");
  const [showAssignIPModal, setShowAssignIPModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showAllIPs, setShowAllIPs] = useState(false);
  const [showChangeOwnerPopup, setShowChangeOwnerPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const IP_DISPLAY_LIMIT = 5;

  // FIX 2: Moved the main data fetching logic into a useCallback
  const fetchAllProjectDetails = useCallback(async () => {
    // Reset states on refetch
    setLoading({ basic: true, quota: true, vms: true, page: true });
    
    const openstack_id = id;
    const infoEndpoint = `/project/${openstack_id}/basic-info/`;
    const quotaEndpoint = `/project/${openstack_id}/quota/`;
    const vmsEndpoint = `/project/${openstack_id}/vms/`;

    const results = await Promise.allSettled([
      axiosInstance.get(infoEndpoint),
      axiosInstance.get(quotaEndpoint),
      axiosInstance.get(vmsEndpoint),
    ]);

    if (results[0].status === "fulfilled") {
      setBasicInfo(results[0].value.data);
    } else {
      console.error("❌ Failed to fetch basic info:", results[0].reason);
      setError("Could not load core project details. Please try again.");
    }
    setLoading(prev => ({ ...prev, basic: false }));

    if (results[1].status === "fulfilled") {
      setQuota(results[1].value.data);
    } else {
      console.error("❌ Failed to fetch quota:", results[1].reason);
    }
    setLoading(prev => ({ ...prev, quota: false }));

    if (results[2].status === "fulfilled") {
      setVms(results[2].value.data);
    } else {
      console.error("❌ Failed to fetch VMs:", results[2].reason);
    }
    setLoading(prev => ({ ...prev, vms: false, page: false }));
  }, [id]);

  // FIX 3: Consolidated all initial data fetching into a single, clean useEffect
  useEffect(() => {
    fetchAllProjectDetails();
    fetchFloatingIPs();
    fetchUsers();
  }, [id, fetchAllProjectDetails]);

  useEffect(() => {
    if (showModal) {
      fetchPackages();
    }
  }, [showModal]);

  const fetchFloatingIPs = () => {
    axiosInstance.get(`/project/${id}/admin-IPs-proj-list/`)
      .then(res => setFloatingIPs(res.data))
      .catch(err => console.error("Failed to fetch floating IPs:", err));
  };
  
  const fetchUsers = async () => {
    try {
        const res = await axiosInstance.get("/auth/ausers-list/");
        setAllUsers(res.data || []);
        setFilteredUsers(res.data || []);
    } catch (err) {
        console.error("❌ Failed to fetch users:", err);
    }
  };

  const fetchPackages = () => {
    axiosInstance.get("/project/project-packages/list/")
      .then((res) => setPackages(res.data))
      .catch((err) => console.error("Failed to fetch packages:", err));
  };

  const showNotification = (message, type) => {
    alert(message);
  };
  
  const handleChangePackage = async () => {
    if (!selectedPackageId) return;
    setLoading(prev => ({ ...prev, page: true }));
    try {
      await axiosInstance.post("/project/change-vps-package/", {
        project_id: basicInfo.id, // Use ID from basicInfo
        project_type_id: selectedPackageId,
      });
      showNotification("✅ Package updated successfully", "success");
      setShowModal(false);
      fetchAllProjectDetails(); // Refetch all data
    } catch (err) {
      showNotification(err.response?.data?.error || "❌ Failed to update package", "error");
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  // ... (All other handler functions like handleAssignIP, etc. remain here)

  // FIX 4: Main loading screen now correctly checks `loading.basic`.
  if (loading.basic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 text-center">
            <p className="text-xl">{error}</p>
        </div>
     );
  }

  // FIX 5: Destructure product_type from basicInfo for use in JSX
  const { product_type } = basicInfo;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{basicInfo.name}</h1>
              <p className="text-gray-400 mt-2">Project ID: {basicInfo.id}</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  basicInfo.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {basicInfo.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Project Information">
                    <Info label="Name" value={basicInfo.name} />
                    <Info label="Description" value={basicInfo.description || "No description"} />
                    <Info label="Created" value={new Date(basicInfo.created_at).toLocaleDateString()} />
                </Card>
                <Card title="Owner Information">
                    <Info label="Name" value={basicInfo.owner?.name || "N/A"} />
                    <Info label="Email" value={basicInfo.owner?.email || "N/A"} />
                </Card>
            </div>
            
            <Card title="Resource Usage">
              {loading.quota ? <CardSpinner /> : quota ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UsageStat label="vCPUs" used={quota.vcpus_used} total={quota.vcpus_total} />
                  <UsageStat label="RAM" used={quota.ram_used} total={quota.ram_total} unit="MB" />
                  <UsageStat label="Storage" used={quota.storage_used} total={quota.storage_total} unit="GB" />
                </div>
              ) : (
                <p className="py-8 text-center text-yellow-400">Could not load usage data.</p>
              )}
            </Card>

            <Card title="Virtual Machines">
              {/* FIX 6: Correctly check vms.vms to access the array */}
              {loading.vms ? <CardSpinner /> : vms?.vms?.length > 0 ? (
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
                            {vms.vms.map((vm) => (
                                <tr key={vm.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="py-3 px-4 font-medium text-white">{vm.name}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            vm.status === "ACTIVE" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                                        }`}>{vm.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">{vm.ip || "—"}</td>
                                    <td className="py-3 px-4 text-gray-300">{vm.created}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  {vms ? "No virtual machines found" : "Could not load VM data."}
                </div>
              )}
            </Card>
            
            {/* Floating IPs Card */}
            {/* This part remains the same */}

          </div>

          <div className="space-y-8">
            <Card title="Current Package">
              {product_type ? (
                <div className="space-y-4">
                  <Info label="Plan" value={product_type.name} />
                  <Info label="Price" value={`$${product_type.price_per_month}/month`} valueClass="text-green-400 font-bold" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-xl font-bold text-white">{product_type.vcpus}</div>
                      <div className="text-xs text-gray-400">vCPUs</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-xl font-bold text-white">{product_type.ram}</div>
                      <div className="text-xs text-gray-400">MB RAM</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No package assigned.</p>
              )}
            </Card>

            <Card title="Project Management">
              {/* This part remains the same */}
            </Card>
          </div>
        </div>

        {/* All modals remain here */}
      </div>
    </div>
  );
}

// Reusable Components (these should ideally be in their own files and imported)
function Modal({ title, children, onClose }) { /* ... */ return <div/>; }
function Card({ title, children }) { /* ... */ return <div/>; }
function Info({ label, value, valueClass = "text-white" }) { /* ... */ return <div/>; }
function UsageStat({ label, used, total, unit = "" }) { /* ... */ return <div/>; }
function ActionBtn({ label, color, onClick, disabled = false }) { /* ... */ return <button/>; }