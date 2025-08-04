import React, { useEffect,useRef, useState } from "react";
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
  Copy,
  CheckCircle,
  LifeBuoy, Scaling,
  MoreVertical,
  SlidersHorizontal,
  ShieldCheck,
  HardDriveDownload,
  KeyRound,
} from "lucide-react";
import { purple } from "@mui/material/colors";

const VPSDetailPage = () => {
  const { id } = useParams();
  const [vps, setVps] = useState(null);
  const [vmIPs, setVmIPs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [isSnapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [isChangeIpModalOpen, setChangeIpModalOpen] = useState(false);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [loadingIPs, setLoadingIPs] = useState(false);
  const [popup, setPopup] = useState(null);
  const [copiedIp, setCopiedIp] = useState(null);

  useEffect(() => {
    const fetchVpsData = async () => {
      try {
        // Fetch VPS details
        const vpsRes = await axiosInstance.get(`/openstack/vps/${id}/`);
        setVps(vpsRes.data);

        // Fetch detailed IP information
        const ipRes = await axiosInstance.get(`/openstack/network/list-all-ip-of-vm/${id}/`);
        setVmIPs(ipRes.data);
      } catch (err) {
        console.error("Failed to load VPS details:", err);
        setError("Unable to load VPS details.");
      } finally {
        setLoading(false);
      }
    };
    fetchVpsData();
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
      const res = await axiosInstance.get('/openstack/network/floatingip-list/');
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
        `/openstack/network/assign-floating-ip/`,
        {
          ip_id: selectedIpId,
          vm_id: id,
        }
      );
      setPopup({
        message: res.data.detail || "IP address changed successfully",
        type: "success"
      });

      // Refresh both VPS data and IP data
      const [vpsRes, ipRes] = await Promise.all([
        axiosInstance.get(`/openstack/vps/${id}/`),
        axiosInstance.get(`/openstack/network/list-all-ip-of-vm/${id}/`)
      ]);
      setVps(vpsRes.data);
      setVmIPs(ipRes.data);
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


  const handleRescue = () => console.log("Rescue"); // <-- Hàm xử lý cho nút Rescue
const handleChangeResource = () => console.log("Change Resource"); // <-- Hàm xử lý cho nút Change Resource

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

  const handleDestroyClick = () => {
    if (
      window.confirm(
        "Are you sure you want to destroy this VPS? This action is irreversible."
      )
    ) {
      performInstanceAction(id, "delete");
    }
  };

  const handleCopyIP = async (ip) => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopiedIp(ip);
      setTimeout(() => setCopiedIp(null), 2000);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
  };
  
const ActionButton = ({ icon, label, onClick, color, disabled = false }) => {
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    purple:"bg-purple-600 hover:bg-purple-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    blue: "bg-blue-600 hover:bg-blue-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${colorClasses[color]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300"
      >
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
  >
    {icon}
    <span>{label}</span>
  </button>
);


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

            {/* <ActionButton
              color="orange" // Màu cam cho hành động cảnh báo/cứu hộ
              icon={<LifeBuoy size={16} />}
              label="Rescue"
              onClick={handleRescue}
            />


            <ActionButton
              color="gray"
              icon={<Save size={16} />}
              label="Backup"
              onClick={handleBackup}
            />

            <ActionButton
              color="indigo" // Màu indigo cho hành động nâng cấp/thay đổi
              icon={<Scaling size={16} />}
              label="Change Resource"
              onClick={handleChangeResource}
            /> */}

            <ActionButton
              color="purple"
              icon={<Network size={16} />}
              label={loadingIPs ? "Loading IPs..." : loadingId === "change-ip" ? "Adding..." : "Add IP"}
              onClick={handleChangeIp}
              disabled={loadingIPs || loadingId === "change-ip"}
            />
            <ActionButton
              color="red"
              icon={<Trash2 size={16} />}
              label="Destroy"
              onClick={handleDestroyClick}
            />
              <DropdownMenu>
  <DropdownItem
    icon={<Save size={16} />}
    label="Backup"
    onClick={() => setSnapshotModalOpen(true)}
  />
  <DropdownItem
    icon={<Globe size={16} />}
    label="Add IP"
    onClick={() => setChangeIpModalOpen(true)}
  />
  <DropdownItem
    icon={<SlidersHorizontal size={16} />}
    label="Change Resources"
    onClick={() => { /* TODO */ }}
  />
  <DropdownItem
    icon={<ShieldCheck size={16} />}
    label="Rescue Mode"
    onClick={() => { /* TODO */ }}
  />
  <DropdownItem
    icon={<RefreshCw size={16} />}
    label="Rebuild"
    onClick={() => { /* TODO */ }}
  />
  <DropdownItem
    icon={<HardDriveDownload size={16} />}
    label="Attach Volume"
    onClick={() => { /* TODO */ }}
  />
  <DropdownItem
    icon={<KeyRound size={16} />}
    label="Change Password"
    onClick={() => { /* TODO */ }}
  />

  <div className="border-t border-gray-700 my-1"></div>

  <DropdownItem
    icon={<Trash2 size={16} />}
    label="Destroy"
    onClick={handleDestroyClick}
  />
</DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<Cpu />} label="CPU" value={`${vps.cpu} cores`} />
          <InfoCard icon={<Server />} label="RAM" value={`${vps.ram} `} />
          <InfoCard icon={<HardDrive />} label="Disk" value={`${vps.disk} `} />
          <InfoCard icon={<Globe />} label="Primary IP" value={vps.ip} />
          <InfoCard label="Operating System" value={vps.os} />
          <InfoCard label="Region" value={vps.datacenter || "Unknown"} />
        </div>

        <Section title="Monitoring">
          <UsageBar label="CPU Usage" percent={vps.monitoring?.cpu_usage || 0} color="bg-blue-500" />
          <UsageBar label="RAM Usage" percent={vps.monitoring?.ram_usage || 0} color="bg-green-500" />
          <UsageBar label="Disk Usage" percent={vps.monitoring?.disk_usage || 0} color="bg-yellow-500" />
        </Section>

        <Section title="IP Addresses">
          {vmIPs ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IPv4 Addresses */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-blue-400" size={20} />
                    <h4 className="text-lg font-semibold text-blue-400">IPv4 Addresses</h4>
                  </div>
                  <div className="space-y-3">
                    {vmIPs.ips.filter(ip => ip.version === "IPv4").map((ip, index) => (
                      <IPAddressCard
                        key={index}
                        ip={ip}
                        onCopy={handleCopyIP}
                        copiedIp={copiedIp}
                      />
                    ))}
                    {vmIPs.ips.filter(ip => ip.version === "IPv4").length === 0 && (
                      <p className="text-gray-400 text-sm">No IPv4 addresses configured</p>
                    )}
                  </div>
                </div>

                {/* IPv6 Addresses */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Network className="text-purple-400" size={20} />
                    <h4 className="text-lg font-semibold text-purple-400">IPv6 Addresses</h4>
                  </div>
                  <div className="space-y-3">
                    {vmIPs.ips.filter(ip => ip.version === "IPv6").map((ip, index) => (
                      <IPAddressCard
                        key={index}
                        ip={ip}
                        onCopy={handleCopyIP}
                        copiedIp={copiedIp}
                      />
                    ))}
                    {vmIPs.ips.filter(ip => ip.version === "IPv6").length === 0 && (
                      <p className="text-gray-400 text-sm">No IPv6 addresses configured</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-indigo-900/20 border border-indigo-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="text-indigo-400" size={16} />
                  <span className="text-indigo-400 font-semibold">Network Summary</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">VM Name:</span>
                    <div className="font-semibold text-white">{vmIPs.vm_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total IPs:</span>
                    <div className="font-semibold text-white">{vmIPs.ips.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">IPv4 Count:</span>
                    <div className="font-semibold text-blue-400">
                      {vmIPs.ips.filter(ip => ip.version === "IPv4").length}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">IPv6 Count:</span>
                    <div className="font-semibold text-purple-400">
                      {vmIPs.ips.filter(ip => ip.version === "IPv6").length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Loading IP information...</p>
          )}
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

        <Section title="Legacy Network Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="Floating IP" value={vps.network.floating_ip || "N/A"} />
            <InfoCard label="Fixed IP" value={vps.network.private_ip || "N/A"} />
            <InfoCard label="MAC Address" value={vps.network.mac_address || "N/A"} />
            <InfoCard label="Gateway" value={vps.network.subnet || "N/A"} />
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

const IPAddressCard = ({ ip, onCopy, copiedIp }) => {
  const isFloatingIP = ip.floating_ip && ip.floating_ip !== ip.fixed_ip;

  return (
    <div className="bg-gray-700 rounded-md p-4 space-y-3">
      {/* Fixed IP */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">Private IP</div>
          <div className="font-mono text-sm text-white flex items-center gap-2">
            {ip.fixed_ip}
            <button
              onClick={() => onCopy(ip.fixed_ip)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy IP"
            >
              {copiedIp === ip.fixed_ip ? (
                <CheckCircle size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">
          {ip.version}
        </div>
      </div>

      {/* Floating IP */}
      {isFloatingIP && (
        <div className="flex items-center justify-between border-t border-gray-600 pt-3">
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">Public IP (Floating)</div>
            <div className="font-mono text-sm text-green-400 flex items-center gap-2">
              {ip.floating_ip}
              <button
                onClick={() => onCopy(ip.floating_ip)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy IP"
              >
                {copiedIp === ip.floating_ip ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
          <Globe size={16} className="text-green-400" />
        </div>
      )}

      {/* No floating IP indicator */}
      {!isFloatingIP && (
        <div className="text-xs text-gray-500 border-t border-gray-600 pt-2">
          No public IP assigned
        </div>
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
          Add IP Address
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
              The current IP will be released back to the your pool. This action may require you to update
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
              {loading ? "Adding..." : "Add IP"}
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