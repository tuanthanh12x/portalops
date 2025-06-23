import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const PlaceholderIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-indigo-400" }) => (
  <div className={`${className} ${iconColor} p-0.5 rounded-sm flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1">
      <rect x="1" y="1" width="8" height="8" rx="1" />
    </svg>
  </div>
);

const StatCard = ({ icon, title, value, unit, progressBarValue, statusColor, subText }) => (
  <div className="bg-gray-800/70 p-4 rounded-xl shadow-xl border border-gray-700/80 hover:border-indigo-500/70 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-indigo-500/20">
    <div className="flex items-center text-gray-300 mb-2">
      {icon}
      <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">{title}</span>
    </div>
    <div className={`text-2xl sm:text-3xl font-semibold ${statusColor || 'text-indigo-300'} mb-1 truncate`} title={String(value)}>
      {value !== undefined && value !== null ? value : 'XX'}
      {unit && <span className="text-base sm:text-xl ml-1 text-gray-500">{unit}</span>}
    </div>
    {subText && <div className="text-xs text-gray-500 mb-2">{subText}</div>}
    {typeof progressBarValue === 'number' && !isNaN(progressBarValue) && (
      <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-2.5 shadow-inner">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressBarValue}%` }}
        />
      </div>
    )}
  </div>
);

const SystemOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get('/admin/system/summary/')
      .then(response => setStats(response.data))
      .catch(error => {
        console.error('Failed to fetch system summary:', error);
      });
  }, []);

  const parseValue = (val, fallback = 0) => {
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  const overallSystemStatus = 'Healthy';
  const cpuCores = `${stats?.total_vcpus_used ?? 'XX'} Cores`;

  let systemStatusColor = 'text-green-400';
  let systemStatusDotColor = 'bg-green-500 animate-pulse';

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight mb-2 sm:mb-0">
          SYSTEM OVERVIEW
        </h2>
        <div className="flex items-center px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
          <span className={`w-3 h-3 rounded-full inline-block mr-2 ${systemStatusDotColor}`}></span>
          <span className={`text-sm font-semibold ${systemStatusColor}`}>{overallSystemStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={<PlaceholderIcon iconColor="text-sky-400" />}
          title="Active Users"
          value={stats?.active_users}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-teal-400" />}
          title="Total VMs"
          value={stats?.total_instances}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-amber-400" />}
          title="Storage Used"
          value={stats?.total_storage_used_gb}
          unit="GB"
          progressBarValue={parseValue(stats?.total_storage_used_gb)}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-cyan-400" />}
          title="vCPU Usage"
          value={stats?.total_vcpus_used}
          subText={cpuCores}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-lime-400" />}
          title="Network In"
          value={'XX'}
          unit="Mbps"
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-fuchsia-400" />}
          title="Network Out"
          value={'XX'}
          unit="Mbps"
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-slate-400" />}
          title="System Uptime"
          value={'XX'}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-violet-400" />}
          title="Running Processes"
          value={'XX'}
        />
      </div>
    </div>
  );
};

export default SystemOverview;
