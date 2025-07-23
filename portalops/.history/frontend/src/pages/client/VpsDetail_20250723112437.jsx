import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";
import Popup from "../../components/client/Popup";
import {
  Power,
  RefreshCw,
  Trash2,
  Terminal,
  Save,
  Cpu,
  HardDrive,
  Server,
  Globe,
  Network,
} from "lucide-react";

const VPSDetailPage = () => {
  const { id } = useParams();
  const [vps, setVps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [isSnapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [isChangeIpModalOpen, setChangeIpModalOpen] = useState(false);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [loadingIPs, setLoadingIPs] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const fetchVps = async () => {
      try {
        const res = await axiosInstance.get(`/openstack/vps/${id}/`);
        setVps(res.data);
      } catch (err) {
        console.error("Failed to load VPS details:", err);
        setError("Unable to load VPS details.");
      } finally {
        setLoading(false);
      }
    };
    fetchVps();
  }, [id]);

  const performInstanceAction = async (instanceId, action, payload = {}) => {
    try {
      const res = await axiosInstance.post(
        `/openstack/compute/instances/${instanceId}/action/`,
        { action, ...payload }
      );

      setPopup({ message: res.data.message || "Action executed successfully", type: "success" });

      if (action === "start") {
        setVps((prev) => ({ ...prev, status: "Online" }));
      } else if (action === "stop") {
        setVps((prev) => ({ ...prev, status: "Offline" }));
      } else if (action === "delete") {
        setVps(null);
      }

      const updated = await axiosInstance.get(`/openstack/vps/${instanceId}/`);
      setVps(updated.data);
    } catch (err) {
      console.error(err);
      setPopup({ message: err.response?.data?.error || "Failed to execute action", type: "error" });
    }
  };

  const handlePowerOn = () => performInstanceAction(id, "start");
  const handlePowerOff = () => performInstanceAction(id, "stop");
  const handleReboot = () => performInstanceAction(id, "reboot");
  const handleResize = () => {
    const newFlavorId = prompt("Enter new flavor ID for resize:");
    if (newFlavorId) {
      performInstanceAction(id, "resize", { flavor_id: newFlavorId });
    }
  };

  const handleConsole = async () => {
    setLoadingId(id);
    try {
      const res = await axiosInstance.post("/overview/console/", {
        server_id: id,
        type: "novnc",
      });
      const consoleUrl = res.data.console?.url;
      if (consoleUrl) {
        window.open(consoleUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("Console URL not found in response.");
      }
    } catch (error) {
      alert(
        `Failed to open console: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleBackup = () => {
    setSnapshotModalOpen(true);
  };

  const handleChangeIp = async () => {
    setLoadingIPs(true);
    try {
      const res = await axiosInstance.get('/openstac/network/floatingip-list/');
      setAvailableIPs(res.data);
      setChangeIpModalOpen(true);
    } catch (error) {
      console.error("Failed to load floating IPs:", error);
      setPopup({
        message: error.response?.data?.error || "Failed to load available IPs",
        type: "error"
      });
    } finally {
      setLoadingIPs(false);
    }
  };

  const changeIpAddress = async (selectedIpId) => {
    setLoadingId("change-ip");
    try {
      const res = await axiosInstance.post(
        `/openstack/network/assign-or-replace-floating-ip/`,
        { 
          ip_id: selectedIpId,
          vm_id: id,
          project_id: vps.project_id // optional, if available in vps data
        }
      );
      setPopup({ 
        message: res.data.detail || "IP address changed successfully", 
        type: "success" 
      });
      
      // Refresh VPS data to get new IP
      const updated = await axiosInstance.get(`/openstack/vps/${id}/`);
      setVps(updated.data);
    } catch (error) {
      console.error("Change IP failed:", error);
      setPopup({
        message: error.response?.data?.detail || "Failed to change IP address",
        type: "error"
      });
    } finally {
      setLoadingId(null);
      setChangeIpModalOpen(false);
    }
  };const changeIpAddress = async (selectedIpId) => {
    setLoadingId("change-ip");
    try {
      const res = await axiosInstance.post(
        `/openstack/network/assign-or-replace-floating-ip/`,
        { 
          ip_id: selectedIpId,
          vm_id: id,
          project_id: vps.project_id // optional, if available in vps data
        }
      );
      setPopup({ 
        message: res.data.detail || "IP address changed successfully", 
        type: "success" 
      });
      
      // Refresh VPS data to get new IP
      const updated = await axiosInstance.get(`/openstack/vps/${id}/`);
      setVps(updated.data);
    } catch (error) {
      console.error("Change IP failed:", error);
      setPopup({
        message: error.response?.data?.detail || "Failed to change IP address",
        type: "error"
      });
    } finally {
      setLoadingId(null);
      setChangeIpModalOpen(false);
    }
  };

  const createBackup = async (backupName) => {
    try {
      const res = await axiosInstance.post(
        `/openstack/compute/instances/${id}/snapshot/`,
        { name: backupName }
      );
      alert(res.data.message || "Backup created successfully.");
      const updated = await axiosInstance.get(`/openstack/vps/${id}/`);
      setVps(updated.data);
    } catch (error) {
      console.error("Backup failed:", error);
      alert(
        error.response?.data?.error ||
        error.message ||
        "Backup operation failed."
      );
    } finally {
      setSnapshotModalOpen(false);
    }
  };

  const handleDeleteSnapshot = async (snapshotId) => {
    if (!window.confirm("Are you sure you want to delete this snapshot?")) return;
    try {
      await axiosInstance.delete(`/openstack/compute/snapshots/${snapshotId}/`);
      alert("Snapshot deleted successfully.");
      const updated = await axiosInstance.get(`/openstack/vps/${id}/`);
      setVps(updated.data);
    } catch (error) {
      console.error("Failed to delete snapshot:", error);
      alert(error.response?.data?.error || "Failed to delete snapshot.");
    }
  };

  const handleDestroy = () => {
    if (
      window.confirm(
        "Are you sure you want to destroy this VPS? This action is irreversible."
      )
    ) {
      performInstanceAction(id, "delete");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400 bg-gray-900 min-h-screen">
        Loading VPS details...
      </div>
    );
  }

  if (error || !vps) {
    return (
      <div className="text-center py-10 text-red-400 bg-gray-900 min-h-screen">
        {error || "VPS not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-200 overflow-x-hidden">
      <Navbar credits={150} />
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">{vps.name}</h1>
            <p className="text-sm text-gray-400">
              Created on {new Date(vps.created_at).toLocaleDateString()} •{" "}
              <span
                className={`font-semibold ${vps.status.toLowerCase() === "shutoff"
                    ? "text-red-500"
                    : vps.status.toLowerCase() === "active"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
              >
                {vps.status.toLowerCase() === "shutoff"
                  ? "Offline"
                  : vps.status.toLowerCase() === "active"
                    ? "Online"
                    : vps.status}
              </span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {vps.status.toLowerCase() === "active" ? (
              <ActionButton
                color="red"
                icon={<Power size={16} />}
                label="Power Off"
                onClick={handlePowerOff}
              />
            ) : (
              <ActionButton
                color="green"
                icon={<Power size={16} />}
                label="Power On"
                onClick={handlePowerOn}
              />
            )}
            <ActionButton
              color="yellow"
              icon={<RefreshCw size={16} />}
              label="Reboot"
              onClick={handleReboot}
            />
            <ActionButton
              color="blue"
              icon={<Terminal size={16} />}
              label={loadingId === id ? "Loading..." : "Console"}
              onClick={handleConsole}
              disabled={loadingId === id}
            />
            <ActionButton
              color="gray"
              icon={<Save size={16} />}
              label="Backup"
              onClick={handleBackup}
            />
            <ActionButton
              color="purple"
              icon={<Network size={16} />}
              label={loadingIPs ? "Loading IPs..." : loadingId === "change-ip" ? "Changing..." : "Change IP"}
              onClick={handleChangeIp}
              disabled={loadingIPs || loadingId === "change-ip"}
            />
            <ActionButton
              color="red"
              icon={<Trash2 size={16} />}
              label="Destroy"
              onClick={handleDestroy}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<Cpu />} label="CPU" value={`${vps.cpu} cores`} />
          <InfoCard icon={<Server />} label="RAM" value={`${vps.ram} `} />
          <InfoCard icon={<HardDrive />} label="Disk" value={`${vps.disk} `} />
          <InfoCard icon={<Globe />} label="IP Address" value={vps.ip} />
          <InfoCard label="Operating System" value={vps.os} />
          <InfoCard label="Region" value={vps.datacenter || "Unknown"} />
        </div>

        <Section title="Monitoring">
          <UsageBar label="CPU Usage" percent={vps.monitoring?.cpu_usage || 0} color="bg-blue-500" />
          <UsageBar label="RAM Usage" percent={vps.monitoring?.ram_usage || 0} color="bg-green-500" />
          <UsageBar label="Disk Usage" percent={vps.monitoring?.disk_usage || 0} color="bg-yellow-500" />
        </Section>

        <Section title="Volumes">
          {vps.volumes.length === 0 ? (
            <p className="text-gray-400">No volumes attached.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vps.volumes.map((vol) => (
                <VolumeCard
                  key={vol.id || vol.name}
                  name={vol.name}
                  size={`${vol.size} GB`}
                  status={vol.status}
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Network Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="IPv4" value={vps.ipv4 || "N/A"} />
            <InfoCard label="IPv6" value={vps.ipv6 || "N/A"} />
            <InfoCard label="MAC Address" value={vps.mac_address || "N/A"} />
            <InfoCard label="Gateway" value={vps.gateway || "N/A"} />
          </div>
        </Section>
      </div>

      {isSnapshotModalOpen && (
        <SnapshotModal
          onClose={() => setSnapshotModalOpen(false)}
          onCreate={createBackup}
        />
      )}

      {isChangeIpModalOpen && (
        <ChangeIpModal
          onClose={() => setChangeIpModalOpen(false)}
          onConfirm={changeIpAddress}
          currentIp={vps.ip}
          availableIPs={availableIPs}
          loading={loadingId === "change-ip"}
        />
      )}
    </div>
  );
};

const ChangeIpModal = ({ onClose, onConfirm, currentIp, availableIPs, loading }) => {
  const [selectedIpAddress, setSelectedIpAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIpAddress) {
      alert("Please select an IP address.");
      return;
    }
    onConfirm(selectedIpAddress);
  };

  // Filter available IPs (exclude current IP and show only unassigned)
  const selectableIPs = availableIPs.filter(ip => 
    ip.ip_address !== currentIp && 
    (!ip.vm_id || ip.status === 'available')
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'text-green-400';
      case 'assigned':
        return 'text-red-400';
      case 'reserved':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (ip) => {
    if (ip.vm_id) {
      return `Assigned to VM: ${ip.vm_id}`;
    }
    return ip.status || 'Available';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-md p-6 w-[600px] max-w-[90vw] shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-indigo-400">
          Change IP Address
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-700 rounded-md p-4">
            <p className="text-gray-300 text-sm mb-2">Current IP Address:</p>
            <p className="text-white font-mono font-semibold">{currentIp}</p>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Select New IP Address:
            </label>
            {selectableIPs.length === 0 ? (
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-md p-4">
                <p className="text-yellow-300 text-sm">
                  No available floating IPs found. All IPs are either assigned or this is your current IP.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectableIPs.map((ip, index) => (
                  <label key={index} className="flex items-center space-x-3 bg-gray-700 p-4 rounded-md hover:bg-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="selectedIp"
                      value={ip.ip_address}
                      checked={selectedIpAddress === ip.ip_address}
                      onChange={(e) => setSelectedIpAddress(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-mono font-semibold text-white text-lg">
                        {ip.ip_address}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
                        <span className={getStatusColor(ip.status)}>
                          Status: {getStatusText(ip)}
                        </span>
                        {ip.subnet_id && (
                          <span>Subnet: {ip.subnet_id}</span>
                        )}
                        {ip.network_id && (
                          <span>Network: {ip.network_id}</span>
                        )}
                      </div>
                      {ip.note && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          Note: {ip.note}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(ip.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600 rounded-md p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Warning:</strong> Changing the IP address will assign the selected floating IP to your VPS. 
              The current IP will be released back to the pool. This action may require you to update 
              DNS records and firewall rules.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedIpAddress || selectableIPs.length === 0}
              className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing..." : "Change IP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SnapshotModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === "") {
      alert("Snapshot name cannot be empty.");
      return;
    }
    onCreate(name.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-md p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-400">
          Create Snapshot Backup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-300">
            Snapshot Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. backup-2025-06-06"
              className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              required
              maxLength={64}
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 text-white font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color, disabled }) => {
  const colors = {
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    blue: "bg-blue-600 hover:bg-blue-700",
    gray: "bg-gray-600 hover:bg-gray-700",
    red: "bg-red-600 hover:bg-red-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white ${colors[color] || colors.gray
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {icon}
      {label}
    </button>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-800 rounded-md p-4 flex items-center gap-4">
    {icon && <div className="text-indigo-400">{icon}</div>}
    <div>
      {label && <div className="text-gray-400 text-xs">{label}</div>}
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h3 className="text-lg font-semibold text-indigo-400 mb-3">{title}</h3>
    {children}
  </section>
);

const UsageBar = ({ label, percent, color }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1 text-sm text-gray-400">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full h-4 bg-gray-700 rounded-md overflow-hidden">
      <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const VolumeCard = ({ name, size, status }) => (
  <div className="bg-gray-800 rounded-md p-4">
    <div className="font-semibold text-indigo-400">{name}</div>
    <div className="text-gray-400 text-sm">{size}</div>
    <div className="mt-1 text-xs text-gray-500">Status: {status}</div>
  </div>
);

export default VPSDetailPage;