import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// OpenStack themed colors
const openStackColors = {
  primary: 'rgba(59, 130, 246, 0.8)',      // Blue
  secondary: 'rgba(16, 185, 129, 0.8)',     // Emerald
  tertiary: 'rgba(139, 92, 246, 0.8)',      // Violet
  quaternary: 'rgba(245, 158, 11, 0.8)',    // Amber
  danger: 'rgba(239, 68, 68, 0.8)',         // Red
  warning: 'rgba(245, 158, 11, 0.8)',       // Amber
  success: 'rgba(34, 197, 94, 0.8)',        // Green
  info: 'rgba(6, 182, 212, 0.8)',          // Cyan
  dark: 'rgba(55, 65, 81, 0.6)',           // Gray
  light: 'rgba(156, 163, 175, 0.4)',       // Light gray
};

// Mock data with more realistic OpenStack metrics
const generateCpuData = () => ({
  labels: ['Compute-01', 'Compute-02', 'Compute-03', 'Controller', 'Network'],
  datasets: [{
    label: 'CPU Usage (%)',
    data: [72, 65, 88, 45, 32],
    backgroundColor: [
      openStackColors.primary,
      openStackColors.secondary,
      openStackColors.tertiary,
      openStackColors.quaternary,
      openStackColors.info
    ],
    borderColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(6, 182, 212, 1)'
    ],
    borderWidth: 2,
    borderRadius: 6,
    borderSkipped: false,
  }],
});

const generateMemoryData = () => ({
  labels: ['Used', 'Cached', 'Available'],
  datasets: [{
    label: 'Memory Usage (GB)',
    data: [128, 64, 96],
    backgroundColor: [
      openStackColors.danger,
      openStackColors.warning,
      openStackColors.success
    ],
    borderColor: [
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(34, 197, 94, 1)'
    ],
    borderWidth: 2,
    hoverOffset: 12,
  }],
});

const generateStorageData = () => ({
  labels: ['Block Storage', 'Object Storage', 'Available'],
  datasets: [{
    label: 'Storage (TB)',
    data: [15.2, 8.7, 26.1],
    backgroundColor: [
      openStackColors.tertiary,
      openStackColors.info,
      openStackColors.light
    ],
    borderColor: [
      'rgba(139, 92, 246, 1)',
      'rgba(6, 182, 212, 1)',
      'rgba(156, 163, 175, 1)'
    ],
    borderWidth: 2,
    hoverOffset: 8,
  }],
});

const generateNetworkData = () => {
  const hours = [];
  const inbound = [];
  const outbound = [];
  
  // Generate last 12 hours data
  for (let i = 11; i >= 0; i--) {
    const now = new Date();
    now.setHours(now.getHours() - i);
    hours.push(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    inbound.push(Math.floor(Math.random() * 500 + 100));
    outbound.push(Math.floor(Math.random() * 300 + 50));
  }

  return {
    labels: hours,
    datasets: [
      {
        label: 'Inbound (Mbps)',
        data: inbound,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: openStackColors.primary,
        tension: 0.4,
        pointBackgroundColor: openStackColors.primary,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: openStackColors.primary,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
        label: 'Outbound (Mbps)',
        data: outbound,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: openStackColors.secondary,
        tension: 0.4,
        pointBackgroundColor: openStackColors.secondary,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: openStackColors.secondary,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3,
      }
    ],
  };
};

// Enhanced chart options
const createChartOptions = (type = 'default') => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(203, 213, 225)', // slate-300
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 8,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // slate-900
        titleColor: 'rgb(248, 250, 252)',          // slate-50
        bodyColor: 'rgb(203, 213, 225)',           // slate-300
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        usePointStyle: true,
        boxPadding: 6,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  if (type === 'axis') {
    return {
      ...baseOptions,
      scales: {
        x: {
          ticks: {
            color: 'rgb(148, 163, 184)', // slate-400
            font: { size: 11, weight: '500' },
            maxRotation: 45,
            autoSkipPadding: 10,
          },
          grid: {
            color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
            borderColor: 'rgba(71, 85, 105, 0.3)',
            drawBorder: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgb(148, 163, 184)', // slate-400
            font: { size: 11, weight: '500' },
            padding: 8,
          },
          grid: {
            color: 'rgba(71, 85, 105, 0.3)',
            borderColor: 'rgba(71, 85, 105, 0.3)',
            drawBorder: false,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 6,
        },
        line: {
          borderJoinStyle: 'round',
        },
        point: {
          hoverBorderWidth: 3,
        },
      },
    };
  }

  if (type === 'doughnut') {
    return {
      ...baseOptions,
      cutout: '65%',
      elements: {
        arc: {
          borderWidth: 3,
          borderAlign: 'inner',
        },
      },
    };
  }

  if (type === 'pie') {
    return {
      ...baseOptions,
      elements: {
        arc: {
          borderWidth: 2,
        },
      },
    };
  }

  return baseOptions;
};

// Enhanced chart card with status indicators
const ChartCard = ({ title, children, status = 'healthy', metric, trend }) => {
  const statusColors = {
    healthy: 'text-green-400 border-green-500/30',
    warning: 'text-yellow-400 border-yellow-500/30',
    critical: 'text-red-400 border-red-500/30',
  };

  const statusIcons = {
    healthy: '●',
    warning: '▲',
    critical: '■',
  };

  return (
    <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-blue-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {metric && (
            <div className="text-right">
              <div className="text-lg font-bold text-blue-300">{metric}</div>
              {trend && (
                <div className={`text-xs ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
                </div>
              )}
            </div>
          )}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${statusColors[status]} bg-slate-800/50`}>
            <span className="animate-pulse">{statusIcons[status]}</span>
            <span className="text-xs font-medium capitalize">{status}</span>
          </div>
        </div>
      </div>
      <div className="h-64 sm:h-72 lg:h-80">
        {children}
      </div>
    </div>
  );
};

const ResourceCharts = () => {
  const [cpuData, setCpuData] = useState(generateCpuData());
  const [memoryData, setMemoryData] = useState(generateMemoryData());
  const [storageData, setStorageData] = useState(generateStorageData());
  const [networkData, setNetworkData] = useState(generateNetworkData());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      setCpuData(generateCpuData());
      setMemoryData(generateMemoryData());
      setStorageData(generateStorageData());
      setNetworkData(generateNetworkData());
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate average CPU usage for display
  const avgCpuUsage = (cpuData.datasets[0].data.reduce((a, b) => a + b, 0) / cpuData.datasets[0].data.length).toFixed(1);
  
  // Calculate memory usage percentage
  const totalMemory = memoryData.datasets[0].data.reduce((a, b) => a + b, 0);
  const usedMemory = memoryData.datasets[0].data[0];
  const memoryPercentage = ((usedMemory / totalMemory) * 100).toFixed(1);

  // Calculate storage usage
  const totalStorage = storageData.datasets[0].data.reduce((a, b) => a + b, 0);
  const usedStorage = storageData.datasets[0].data[0] + storageData.datasets[0].data[1];
  const storagePercentage = ((usedStorage / totalStorage) * 100).toFixed(1);

  // Calculate current network traffic (latest values)
  const currentInbound = networkData.datasets[0].data[networkData.datasets[0].data.length - 1];
  const currentOutbound = networkData.datasets[1].data[networkData.datasets[1].data.length - 1];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            Resource Monitoring
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setCpuData(generateCpuData());
              setMemoryData(generateMemoryData());
              setStorageData(generateStorageData());
              setNetworkData(generateNetworkData());
              setRefreshKey(prev => prev + 1);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/50 hover:border-blue-500/50 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs text-slate-400">Refresh</span>
          </button>
          <div className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8" key={refreshKey}>
        <ChartCard 
          title="OpenStack Node CPU Usage" 
          status={avgCpuUsage > 80 ? 'critical' : avgCpuUsage > 60 ? 'warning' : 'healthy'}
          metric={`${avgCpuUsage}%`}
          trend={Math.floor(Math.random() * 10) - 5}
        >
          <Bar data={cpuData} options={createChartOptions('axis')} />
        </ChartCard>
        
        <ChartCard 
          title="Memory Allocation" 
          status={memoryPercentage > 85 ? 'critical' : memoryPercentage > 70 ? 'warning' : 'healthy'}
          metric={`${memoryPercentage}%`}
          trend={Math.floor(Math.random() * 6) - 3}
        >
          <Doughnut data={memoryData} options={createChartOptions('doughnut')} />
        </ChartCard>
        
        <ChartCard 
          title="Storage Distribution" 
          status={storagePercentage > 90 ? 'critical' : storagePercentage > 75 ? 'warning' : 'healthy'}
          metric={`${storagePercentage}%`}
          trend={Math.floor(Math.random() * 4) - 2}
        >
          <Pie data={storageData} options={createChartOptions('pie')} />
        </ChartCard>
        
        <ChartCard 
          title="Network Traffic (12h)" 
          status={currentInbound > 400 ? 'warning' : 'healthy'}
          metric={`${currentInbound + currentOutbound} Mbps`}
          trend={Math.floor(Math.random() * 8) - 4}
        >
          <Line data={networkData} options={createChartOptions('axis')} />
        </ChartCard>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30">
          <div className="text-xs text-blue-300 mb-1">Compute Nodes</div>
          <div className="text-xl font-bold text-blue-200">5 Active</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-4 rounded-xl border border-green-500/30">
          <div className="text-xs text-green-300 mb-1">Running VMs</div>
          <div className="text-xl font-bold text-green-200">127</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30">
          <div className="text-xs text-purple-300 mb-1">Total Storage</div>
          <div className="text-xl font-bold text-purple-200">50 TB</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm p-4 rounded-xl border border-amber-500/30">
          <div className="text-xs text-amber-300 mb-1">Peak Traffic</div>
          <div className="text-xl font-bold text-amber-200">847 Mbps</div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCharts;