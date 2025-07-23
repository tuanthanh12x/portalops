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
  const [newIP, setNewIP] = useState("");
  const [availableIPs, setAvailableIPs] = useState([]);
const [selectedIP, setSelectedIP] = useState("");
const [showAssignIPModal, setShowAssignIPModal] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/project/${id}/project-detail/`)
      .then((res) => setProject(res.data))
      .catch((err) => console.error("Failed to fetch project detail:", err));
  }, [id]);

  useEffect(() => {
    if (showModal) {
      axiosInstance.get("/project/project-packages/list/")
        .then((res) => setPackages(res.data))
        .catch((err) => console.error("Failed to fetch packages:", err));
    }
  }, [showModal]);
useEffect(() => {
  axiosInstance.get(`/project/${id}/admin-IPs-proj-list/`)
    .then(res => setFloatingIPs(res.data))
    .catch(err => console.error("Failed to fetch floating IPs:", err));
}, [id]);
  const handleChangePackage = async () => {
  const projectId = id;
  const packageId = selectedPackageId;

  if (!projectId || !packageId) {
    alert("❗Please select a valid package before submitting.");
    return;
  }

  try {
    const response = await axiosInstance.post("/project/change-vps-package/", {
      project_id: projectId,
      project_type_id: packageId,
    });
    alert("✅ Package updated successfully");
    setShowModal(false);
  } catch (err) {
    console.error("❌ Failed to update package:", err.response?.data || err.message);
    alert(err.response?.data?.error || "❌ Failed to update package");
  }
};
const handleAssignIPToProject = async () => {
  if (!newIP) {
    alert("❗ Please enter a valid IP address.");
    return;
  }

  try {
    await axiosInstance.post(`/projects/${id}/assign-floating-ip/`, {
      ip_address: newIP,
    });
    alert("✅ Floating IP assigned to project.");
    setShowAssignIPModal(false);
    setNewIP("");
    const res = await axiosInstance.get(`/project/${id}/admin-IPs-proj-list/`);
    setFloatingIPs(res.data);
  } catch (err) {
    alert("❌ Failed to assign floating IP.");
    console.error(err);
  }
};
const openAssignIPModal = async () => {
  try {
    const res = await axiosInstance.get("/available-floating-ips-list/");
    setAvailableIPs(res.data);
    setShowAssignIPModal(true);
  } catch (err) {
    alert("Failed to fetch available IPs.");
    console.error(err);
  }
};


  const usagePercent = (used, total) =>
    total > 0 ? Math.round((used / total) * 100) : 0;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading project details...</p>
      </div>
    );
  }

  const { owner, usage, vms, product_type } = project;
const handleAssignIP = async (ipId, vmId) => {
  try {
    await axiosInstance.post(`/project/assign-floating-ip/`, {
      ip_id: ipId,
      vm_id: vmId,
    });
    alert("✅ Floating IP assigned");
    // Refresh the IP list
    const res = await axiosInstance.get(`/project/${id}/floating-ips/`);
    setFloatingIPs(res.data);
  } catch (err) {
    alert("❌ Failed to assign IP");
    console.error(err);
  }
};

const handleUnassignIP = async (ipId) => {
  try {
    await axiosInstance.post(`/project/unassign-floating-ip/`, {
      ip_id: ipId,
    });
    alert("✅ Floating IP unassigned");
    const res = await axiosInstance.get(`/project/${id}/floating-ips/`);
    setFloatingIPs(res.data);
  } catch (err) {
    alert("❌ Failed to unassign IP");
    console.error(err);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <AdminNavbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white/10 rounded-2xl shadow-2xl p-8 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-extrabold text-green-400 tracking-wide">Project Details</h2>
            <div className="text-sm text-gray-300">ID: {project.id}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
            <Card title="Project Info">
              <Info label="Name" value={project.name} />
              <Info label="Status" value={project.status} valueClass="text-green-400" />
              <Info label="Created At" value={new Date(project.created_at).toLocaleDateString()} />
              <Info label="Description" value={project.description} />
            </Card>
            <Card title="Owner">
              <Info label="Name" value={owner?.name} />
              <Info label="Email" value={owner?.email} />
            </Card>
            <Card title="Service Package">
              <Info label="Plan" value={product_type?.name} />
              <Info label="Price" value={`$${product_type?.price_per_month}/month`} />
              <Info label="vCPUs" value={product_type?.vcpus} />
             <Info label="RAM" value={`${(product_type?.ram )} MB`} />
              <Info label="Storage" value={`${product_type?.total_volume_gb} GB`} />
              <Info label="Instances" value={product_type?.instances} />
            </Card>
          </div>

          <div className="bg-white/5 rounded-xl p-6 shadow hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-indigo-400 mb-4">Manage Project</h3>
            <div className="flex flex-wrap gap-3">
              <ActionBtn icon="👤" label="Change Owner" color="indigo" />
              <ActionBtn icon="📦" label="Update Package" color="green" onClick={() => setShowModal(true)} />
              <ActionBtn icon="⏸️" label="Suspend" color="yellow" />
              <ActionBtn icon="🗑️" label="Delete Project" color="red" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UsageStat label="vCPUs" used={usage.vcpus_used} total={usage.vcpus_total} />
            <UsageStat label="RAM" used={usage.ram_used } total={usage.ram_total } unit="MB" />
            <UsageStat label="Storage" used={usage.storage_used} total={usage.storage_total} unit="GB" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-indigo-400 mb-4">Virtual Machines</h3>
            <div className="overflow-x-auto rounded-lg bg-white/5 p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-white/70 border-b border-white/10">
                    <th className="py-2">Name</th>
                    <th>Status</th>
                    <th>IP</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {vms.map((vm) => (
                    <tr key={vm.id} className="border-b border-white/5 hover:bg-white/10">
                      <td className="py-2 font-medium text-white">{vm.name}</td>
                      <td className={`text-sm font-semibold ${vm.status === "Running" ? "text-green-400" : "text-yellow-400"}`}>{vm.status}</td>
                      <td>{vm.ip}</td>
                      <td>{vm.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-10">
  <h3 className="text-xl font-bold text-indigo-400 mb-4">Floating IPs</h3>
  <div className="mb-4">
  <button
    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    onClick={() => setShowAssignIPModal(true)}
  >
    ➕ Assign Floating IP to Project
  </button>
</div>
  <div className="overflow-x-auto rounded-lg bg-white/5 p-4">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-white/70 border-b border-white/10">
          <th className="py-2">IP Address</th>
          <th>Status</th>
          <th>VM</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {floatingIPs.map(ip => (
          <tr key={ip.id} className="border-b border-white/10 hover:bg-white/10">
            <td className="py-2 text-white font-medium">{ip.ip_address}</td>
            <td className="text-white/80">{ip.status}</td>
            <td className="text-white/70">{ip.vm_id ?? "—"}</td>
            <td className="space-x-2">
              {ip.status === "reserved" && (
                <button
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded"
                  onClick={() => handleAssignIP(ip.id, vms[0]?.id)} // for demo; can add dropdown
                >
                  Assign
                </button>
              )}
              {ip.status === "allocated" && (
                <button
                  className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded"
                  onClick={() => handleUnassignIP(ip.id)}
                >
                  Unassign
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
        </div>
      </div>
{showAssignIPModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-xl">
      <h3 className="text-2xl font-bold text-green-400 mb-4">Assign Floating IP</h3>
      <input
        type="text"
        placeholder="Enter IP address..."
        className="w-full p-2 mb-4 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none"
        value={newIP}
        onChange={(e) => setNewIP(e.target.value)}
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAssignIPModal(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleAssignIPToProject}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-xl shadow-xl">
            <h3 className="text-2xl font-bold text-green-400 mb-4">Select New Package</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`cursor-pointer border p-4 rounded-lg transition hover:border-green-400 ${
                    selectedPackageId === pkg.id ? "border-green-500 bg-white/10" : "border-white/10"
                  }`}
                >
                  {/* <div className="text-white font-semibold">{pkg.id}</div> */}
                  <div className="text-white font-semibold">{pkg.name}</div>
                  <div className="text-sm text-white/60">{pkg.description}</div>
                  <div className="text-green-400 font-bold mt-1">${pkg.price_per_month}/mo</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPackageId}
                onClick={handleChangePackage}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedPackageId ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-600 text-white/50 cursor-not-allowed"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white/5 rounded-xl p-5 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-indigo-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value, valueClass = "text-white/90" }) {
  return (
    <p className="mb-2">
      <span className="font-medium text-white/70">{label}:</span>{" "}
      <span className={`ml-1 font-semibold ${valueClass}`}>{value ?? "—"}</span>
    </p>
  );
}

function UsageStat({ label, used, total, unit = "" }) {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const barColor = percent > 85 ? "bg-red-500" : percent > 60 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="bg-white/5 rounded-xl p-5 shadow hover:shadow-lg transition">
      <h4 className="text-md font-semibold text-white/80 mb-1">{label} Usage</h4>
      <p className="text-sm mb-2 text-white/70">{used} / {total} {unit}</p>
      <div className="w-full h-3 bg-white/20 rounded overflow-hidden">
        <div className={`${barColor} h-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionBtn({ label, icon, color, onClick }) {
  const base = "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow transition focus:outline-none";
  const colorVariants = {
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    yellow: "bg-yellow-400 hover:bg-yellow-500 text-black",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-white/20 hover:bg-white/30 text-white",
  };
  return (
    <button onClick={onClick} className={`${base} ${colorVariants[color] || colorVariants.gray}`}>
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}
