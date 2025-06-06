import React, { useEffect, useState } from "react";
import Navbar from "../../components/client/Navbar";
import {
  Power, RefreshCw, Trash2, Terminal, Save,
  Cpu, HardDrive, Server, Globe, Network, Disc, MemoryStick
} from "lucide-react";

const VPSDetailPage = () => {
  const [vps, setVps] = useState(null);

  useEffect(() => {
    setVps({
      id: "1",
      name: "web-server-01",
      status: "ACTIVE",
      ip: "103.11.12.34",
      cpu: "2 vCPU",
      ram: "4 GB",
      disk: "40 GB",
      os: "Ubuntu 22.04 LTS",
      datacenter: "Singapore",
      created_at: "2025-05-01",
    });
  }, []);

  if (!vps)
    return (
      <div className="text-center py-10 text-gray-400 bg-gray-900 min-h-screen">
        Loading VPS details...
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-200 overflow-x-hidden">
      <Navbar credits={150} />
      <div className="p-8 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">{vps.name}</h1>
            <p className="text-sm text-gray-400">
              Created on {vps.created_at} • <span className="text-green-400 font-semibold">{vps.status}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <ActionButton color="green" icon={<Power size={16} />} label="Power On" />
            <ActionButton color="yellow" icon={<RefreshCw size={16} />} label="Reboot" />
            <ActionButton color="blue" icon={<Terminal size={16} />} label="Console" />
            <ActionButton color="gray" icon={<Save size={16} />} label="Snapshot" />
            <ActionButton color="red" icon={<Trash2 size={16} />} label="Destroy" />
          </div>
        </div>

        {/* VPS Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<Cpu />} label="CPU" value={vps.cpu} />
          <InfoCard icon={<Server />} label="RAM" value={vps.ram} />
          <InfoCard icon={<HardDrive />} label="Disk" value={vps.disk} />
          <InfoCard icon={<Globe />} label="IP Address" value={vps.ip} />
          <InfoCard label="Operating System" value={vps.os} />
          <InfoCard label="Region" value={vps.datacenter} />
        </div>

        {/* Monitoring */}
        <Section title="Monitoring">
          <UsageBar label="CPU Usage" percent={55} color="bg-blue-500" />
          <UsageBar label="RAM Usage" percent={72} color="bg-green-500" />
          <UsageBar label="Disk Usage" percent={40} color="bg-yellow-500" />
        </Section>

        {/* Snapshots */}
        <Section title="Snapshots">
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-md">
              <span>snapshot-2025-05-25</span>
              <span className="text-sm text-gray-400">2.1 GB</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-md">
              <span>before-update</span>
              <span className="text-sm text-gray-400">1.7 GB</span>
            </div>
            <button className="mt-3 px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              + Create Snapshot
            </button>
          </div>
        </Section>

        {/* Volumes */}
        <Section title="Volumes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VolumeCard name="volume-01" size="40 GB" status="attached" />
            <VolumeCard name="backup-disk" size="100 GB" status="available" />
          </div>
        </Section>

        {/* Network Info */}
        <Section title="Network Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NetworkCard label="Floating IP" value="103.11.12.34" />
            <NetworkCard label="Private IP" value="192.168.1.10" />
            <NetworkCard label="MAC Address" value="fa:16:3e:12:ab:cd" />
            <NetworkCard label="Subnet" value="192.168.1.0/24" />
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

const ActionButton = ({ color, icon, label }) => {
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-400",
    yellow: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400",
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400",
    gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-400",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-400",
  };

  return (
    <button
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
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === "attached" ? "bg-green-700 text-green-200" : "bg-yellow-700 text-yellow-200"}`}>
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
