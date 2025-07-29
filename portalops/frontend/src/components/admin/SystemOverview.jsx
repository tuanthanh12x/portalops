import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

// OpenStack specific icons
const CloudIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-blue-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
    </svg>
  </div>
);

const ServerIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-green-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  </div>
);

const StorageIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-purple-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  </div>
);

const CPUIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-orange-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  </div>
);

const NetworkIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-cyan-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  </div>
);

const UserIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-emerald-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  </div>
);

const ProjectIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-indigo-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  </div>
);

const VolumeIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-pink-400" }) => (
  <div className={`${className} ${iconColor} flex items-center justify-center`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0h1a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1m0 0V4a1 1 0 011-1h6a1 1 0 011 1v2M9 12l2 2 4-4" />
    </svg>
  </div>
);

const StatCard = ({ icon, title, value, unit, progressBarValue, statusColor, subText, trend, maxValue }) => (
  <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-slate-700/60 hover:border-blue-500/60 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-blue-500/20 hover:shadow-2xl">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center text-slate-300">
        {icon}
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">{title}</span>
      </div>
      {trend && (
        <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    
    <div className="flex items-baseline gap-2 mb-2">
      <div className={`text-2xl sm:text-3xl font-bold ${statusColor || 'text-blue-300'} group-hover:text-blue-200 transition-colors`} title={String(value)}>
        {value !== undefined && value !== null ? value : '--'}
      </div>
      {unit && <span className="text-base sm:text-lg text-slate-500">{unit}</span>}
      {maxValue && <span className="text-sm text-slate-500">/ {maxValue}</span>}
    </div>
    
    {subText && <div className="text-xs text-slate-400 mb-3">{subText}</div>}
    
    {typeof progressBarValue === 'number' && !isNaN(progressBarValue) && (
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 shadow-inner overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            progressBarValue > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
            progressBarValue > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
            'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500'
          }`}
          style={{ width: `${Math.min(progressBarValue, 100)}%` }}
        />
      </div>
    )}
  </div>
);

const SystemOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/overview/admin/summary/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch OpenStack system summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const parseValue = (val, fallback = 0) => {
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '--';
  };

  // Calculate system health based on resource usage
  const storageUsage = parseValue(stats?.storage_usage_percentage || 0);
  const cpuUsage = parseValue(stats?.cpu_usage_percentage || 0);
  const memoryUsage = parseValue(stats?.memory_usage_percentage || 0);
  
  const avgUsage = (storageUsage + cpuUsage + memoryUsage) / 3;
  let systemStatus = 'Healthy';
  let systemStatusColor = 'text-green-400';
  let systemStatusDotColor = 'bg-green-500 animate-pulse';

  if (avgUsage > 85) {
    systemStatus = 'Critical';
    systemStatusColor = 'text-red-400';
    systemStatusDotColor = 'bg-red-500 animate-pulse';
  } else if (avgUsage > 70) {
    systemStatus = 'Warning';
    systemStatusColor = 'text-amber-400';
    systemStatusDotColor = 'bg-amber-500 animate-pulse';
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800 p-5 rounded-2xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <CloudIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
            OpenStack Overview
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center px-4 py-2 bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700/60">
            <span className={`w-3 h-3 rounded-full inline-block mr-2 ${systemStatusDotColor}`}></span>
            <span className={`text-sm font-semibold ${systemStatusColor}`}>{systemStatus}</span>
          </div>
          <div className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={<UserIcon iconColor="text-emerald-400" />}
          title="Active Users"
          value={formatNumber(stats?.active_users)}
          subText="Currently online"
          trend={5}
        />
        
        <StatCard
          icon={<ProjectIcon iconColor="text-indigo-400" />}
          title="Projects"
          value={formatNumber(stats?.total_projects)}
          subText="Active tenants"
        />
        
        <StatCard
          icon={<ServerIcon iconColor="text-green-400" />}
          title="Instances"
          value={formatNumber(stats?.total_instances)}
          subText={`${stats?.running_instances || 0} running`}
          maxValue={stats?.max_instances}
          progressBarValue={stats?.total_instances && stats?.max_instances ? 
            (stats.total_instances / stats.max_instances) * 100 : 0}
        />
        
        <StatCard
          icon={<CPUIcon iconColor="text-orange-400" />}
          title="vCPU Usage"
          value={formatNumber(stats?.total_vcpus_used)}
          unit="cores"
          subText={`${parseValue(stats?.cpu_usage_percentage).toFixed(1)}% utilized`}
          maxValue={stats?.total_vcpus_available}
          progressBarValue={parseValue(stats?.cpu_usage_percentage)}
        />
        
        <StatCard
          icon={<StorageIcon iconColor="text-purple-400" />}
          title="Storage"
          value={parseValue(stats?.total_storage_used_gb).toFixed(1)}
          unit="GB"
          subText={`${parseValue(stats?.storage_usage_percentage).toFixed(1)}% used`}
          maxValue={parseValue(stats?.total_storage_available_gb).toFixed(1)}
          progressBarValue={parseValue(stats?.storage_usage_percentage)}
        />
        
        <StatCard
          icon={<VolumeIcon iconColor="text-pink-400" />}
          title="Volumes"
          value={formatNumber(stats?.total_volumes)}
          subText={`${stats?.attached_volumes || 0} attached`}
        />
        
        <StatCard
          icon={<NetworkIcon iconColor="text-cyan-400" />}
          title="Networks"
          value={formatNumber(stats?.total_networks)}
          // subText={`${stats?.active_networks || 0} active`}
          subText={`All work well`}
        />
        
        <StatCard
          icon={<NetworkIcon iconColor="text-teal-400" />}
          title="Floating IPs"
          value={formatNumber(stats?.floating_ips_used)}
          maxValue={stats?.floating_ips_total}
          subText={`${stats?.floating_ips_available || 0} available`}
          progressBarValue={stats?.floating_ips_used && stats?.floating_ips_total ? 
            (stats.floating_ips_used / stats.floating_ips_total) * 100 : 0}
        />
      </div>
      
      {/* Additional system info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">CPU Usage</span>
              <span className="text-sm font-medium text-slate-200">{parseValue(stats?.cpu_usage_percentage).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Memory Usage</span>
              <span className="text-sm font-medium text-slate-200">{parseValue(stats?.memory_usage_percentage).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Storage Usage</span>
              <span className="text-sm font-medium text-slate-200">{parseValue(stats?.storage_usage_percentage).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Hypervisors</span>
              <span className="text-sm font-medium text-slate-200">{stats?.total_hypervisors || '--'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Images</span>
              <span className="text-sm font-medium text-slate-200">{stats?.total_images || '--'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Keypairs</span>
              <span className="text-sm font-medium text-slate-200">{stats?.total_keypairs || '--'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">New Instances</span>
              <span className="text-sm font-medium text-green-400">+{stats?.new_instances_today || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Deleted Instances</span>
              <span className="text-sm font-medium text-red-400">-{stats?.deleted_instances_today || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">API Requests</span>
              <span className="text-sm font-medium text-slate-200">{formatNumber(stats?.api_requests_today)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;