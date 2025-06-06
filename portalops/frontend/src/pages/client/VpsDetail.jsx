import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";
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
} from "lucide-react";

const VPSDetailPage = () => {
  const { id } = useParams();
  const [vps, setVps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePowerOn = () => performInstanceAction(id, "start");

const handlePowerOff = () => performInstanceAction(id, "stop");

const handleReboot = () => performInstanceAction(id, "reboot");

const handleResize = () => {
  const newFlavorId = prompt("Enter new flavor ID for resize:");
  if (newFlavorId) {
    performInstanceAction(id, "resize", { flavor_id: newFlavorId });
  }
};

const handleConsole = () => {
  alert("Console not yet implemented."); // Tuỳ bạn xử lý thêm
};

const handleBackup = () => {
  alert("Backup feature coming soon.");
};


const handleDestroy = () => {
  if (window.confirm("Are you sure you want to destroy this VPS? This action is irreversible.")) {
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

  const performInstanceAction = async (instanceId, action, payload = {}) => {
  try {
    const res = await axiosInstance.post(`/openstack/compute/instances/${instanceId}/action/`, {
      action,
      ...payload,
    });
    alert(res.data.message || "Action executed successfully");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to execute action");
  }
};


  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-200 overflow-x-hidden">
      <Navbar credits={150} />
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">{vps.name}</h1>
            <p className="text-sm text-gray-400">
              Created on {new Date(vps.created_at).toLocaleDateString()} •{" "}
              <span className="text-green-400 font-semibold">{vps.status}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <ActionButton
              color="green"
              icon={<Power size={16} />}
              label="Power On"
              onClick={handlePowerOn}
            />
            <ActionButton
              color="yellow"
              icon={<RefreshCw size={16} />}
              label="Reboot"
              onClick={handleReboot}
            />
            <ActionButton
              color="blue"
              icon={<Terminal size={16} />}
              label="Console"
              onClick={handleConsole}
            />
            <ActionButton
              color="gray"
              icon={<Save size={16} />}
              label="Backup"
              onClick={handleBackup}
            />
            <ActionButton
              color="red"
              icon={<Trash2 size={16} />}
              label="Destroy"
              onClick={handleDestroy}
            />
          </div>
        </div>

        {/* VPS Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<Cpu />} label="CPU" value={vps.cpu} />
          <InfoCard icon={<Server />} label="RAM" value={vps.ram} />
          <InfoCard icon={<HardDrive />} label="Disk" value={vps.disk} />
          <InfoCard icon={<Globe />} label="IP Address" value={vps.ip} />
          <InfoCard label="Operating System" value={vps.os} />
          <InfoCard label="Region" value={vps.datacenter || "Unknown"} />
        </div>

        {/* Monitoring */}
        <Section title="Monitoring">
          <UsageBar
            label="CPU Usage"
            percent={vps.monitoring?.cpu_usage || 0}
            color="bg-blue-500"
          />
          <UsageBar
            label="RAM Usage"
            percent={vps.monitoring?.ram_usage || 0}
            color="bg-green-500"
          />
          <UsageBar
            label="Disk Usage"
            percent={vps.monitoring?.disk_usage || 0}
            color="bg-yellow-500"
          />
        </Section>

        {/* Snapshots */}
        <Section title="Snapshots">
          {vps.snapshots.length === 0 ? (
            <p className="text-gray-400">No snapshots available.</p>
          ) : (
            vps.snapshots.map((snap) => (
              <div
                key={snap.id || snap.name}
                className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-md mb-2"
              >
                <span>{snap.name}</span>
                <span className="text-sm text-gray-400">
                  {snap.size || "Unknown size"}
                </span>
              </div>
            ))
          )}
          <button
            onClick={handleBackup}
            className="mt-3 px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            + Create Backup
          </button>
        </Section>

        {/* Volumes */}
        <Section title="Volumes">
          {vps.volumes.length === 0 ? (
            <p className="text-gray-400">No volumes attached.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vps.volumes.map((vol) => (
                <VolumeCard
                  key={vol.id || vol.name}
                  name={vol.name}
                  size={vol.size}
                  status={vol.status}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Network Info */}
        <Section title="Network Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NetworkCard
              label="Floating IP"
              value={vps.network?.floating_ip || "None"}
            />
            <NetworkCard
              label="Private IP"
              value={vps.network?.private_ip || "None"}
            />
            <NetworkCard
              label="MAC Address"
              value={vps.network?.mac_address || "Unknown"}
            />
            <NetworkCard
              label="Subnet"
              value={vps.network?.subnet || "Unknown"}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

// Components

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-black/30 border border-gray-700 rounded-2xl shadow-md p-5 flex items-start gap-4 backdrop-blur-lg">
    {icon && <div className="text-blue-400 mt-1">{icon}</div>}
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-gray-200">{value}</div>
    </div>
  </div>
);

const ActionButton = ({ color, icon, label, onClick }) => {
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-400",
    yellow: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400",
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400",
    gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-400",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg transition focus:outline-none focus:ring-2`}
    >
      {icon} {label}
    </button>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-black/30 border border-gray-700 rounded-2xl shadow-md p-6 backdrop-blur-lg">
    <h2 className="text-xl font-bold text-indigo-300 mb-4">{title}</h2>
    {children}
  </div>
);

const UsageBar = ({ label, percent, color }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1 text-sm text-gray-400">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full h-4 bg-gray-700 rounded-full">
      <div className={`${color} h-full rounded-full`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const VolumeCard = ({ name, size, status }) => (
  <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
    <div>
      <div className="text-sm font-semibold text-gray-200">{name}</div>
      <div className="text-xs text-gray-400">{size}</div>
    </div>
    <span
      className={`text-xs font-bold px-2 py-1 rounded-full ${
        status === "attached"
          ? "bg-green-700 text-green-200"
          : "bg-yellow-700 text-yellow-200"
      }`}
    >
      {status}
    </span>
  </div>
);

const NetworkCard = ({ label, value }) => (
  <div className="bg-gray-800 rounded-xl p-4">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-base font-medium text-gray-200">{value}</div>
  </div>
);

export default VPSDetailPage;
