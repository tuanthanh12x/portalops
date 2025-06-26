import React from 'react';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

// Nếu bạn tách data ra file riêng thì import vào đây
// import { cpuData, ramData, storageData, networkData } from '../data/chartData';

ChartJS.register(...registerables);

// --- Dữ liệu biểu đồ (giữ nguyên như bạn cung cấp) ---
const cpuData = {
  labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4'],
  datasets: [{
    label: 'CPU Usage (%)',
    data: [65, 59, 80, 81],
    backgroundColor: 'rgba(79, 70, 229, 0.6)', // Slightly more opaque
    borderColor: 'rgba(79, 70, 229, 1)',
    borderWidth: 1,
    borderRadius: 4, // Rounded bars
  }],
};

const ramData = {
  labels: ['Used', 'Free'],
  datasets: [{
    label: 'RAM Usage',
    data: [75, 25],
    backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(55, 65, 81, 0.6)'],
    borderColor: ['rgba(79, 70, 229, 1)', 'rgba(55, 65, 81, 1)'],
    borderWidth: 1,
    hoverOffset: 8, // Add some interaction
  }],
};

const storageData = {
  labels: ['Used', 'Free'],
  datasets: [{
    label: 'Storage Usage',
    data: [60, 40],
    backgroundColor: ['rgba(139, 92, 246, 0.7)', 'rgba(55, 65, 81, 0.6)'], // Violet color
    borderColor: ['rgba(139, 92, 246, 1)', 'rgba(55, 65, 81, 1)'],
    borderWidth: 1,
    hoverOffset: 8,
  }],
};

const networkData = {
  labels: ['12:00', '13:00', '14:00', '15:00', '16:00'],
  datasets: [{
    label: 'Network (Mbps)',
    data: [100, 150, 120, 180, 160],
    fill: true, // Fill area under line
    backgroundColor: 'rgba(79, 70, 229, 0.2)', // Area fill color
    borderColor: 'rgba(79, 70, 229, 1)',
    tension: 0.3, // Smoother line
    pointBackgroundColor: 'rgba(79, 70, 229, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
    pointRadius: 4,
    pointHoverRadius: 6,
  }],
};
// --- Hết phần data ---

// --- Tùy chọn chung cho các biểu đồ ---
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Quan trọng khi đặt chiều cao cố định cho container
  plugins: {
    legend: {
      position: 'bottom', // Đặt chú giải ở dưới để tiết kiệm không gian phía trên
      labels: {
        color: 'rgb(209, 213, 219)', // text-gray-300
        padding: 15,
        font: {
          size: 11,
        },
        usePointStyle: true, // Sử dụng point style cho legend
        boxWidth: 8, // Kích thước của point style
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(17, 24, 39, 0.9)', // bg-gray-900 with opacity
      titleColor: 'rgb(229, 231, 235)',    // text-gray-200
      bodyColor: 'rgb(209, 213, 219)',     // text-gray-300
      borderColor: 'rgba(79, 70, 229, 0.8)', // border-indigo-500/purple-600
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      usePointStyle: true,
      boxPadding: 3,
    },
  },
};

const axisChartOptions = {
  ...commonChartOptions,
  scales: {
    x: {
      ticks: {
        color: 'rgb(156, 163, 175)', // text-gray-400
        font: { size: 10 },
        maxRotation: 0, // Tránh xoay label nếu không cần thiết
        autoSkipPadding: 10,
      },
      grid: {
        color: 'rgba(55, 65, 81, 0.25)', // gray-700 with opacity, mờ hơn
        borderColor: 'rgba(55, 65, 81, 0.25)',
        drawBorder: false, // Bỏ đường viền của trục X
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: 'rgb(156, 163, 175)', // text-gray-400
        font: { size: 10 },
        padding: 8,
      },
      grid: {
        color: 'rgba(55, 65, 81, 0.25)',
        borderColor: 'rgba(55, 65, 81, 0.25)',
        drawBorder: false, // Bỏ đường viền của trục Y
        // ZeroLine settings
        zeroLineColor: 'rgba(107, 114, 128, 0.5)', // gray-500 for the zero line
        zeroLineWidth: 1,

      },
    },
  },
};

const pieDoughnutOptions = {
  ...commonChartOptions,
  cutout: '60%', // For Doughnut, làm cho nó mảnh hơn
};


// --- Component ResourceCharts ---
const ChartCard = ({ title, children }) => (
  <div className="bg-gray-800/60 p-3 sm:p-4 rounded-xl shadow-xl border border-gray-700/70">
    <h3 className="text-sm sm:text-md font-semibold text-indigo-300 mb-2 sm:mb-3 px-1">
      {title}
    </h3>
    <div className="h-56 sm:h-64 md:h-72"> {/* Chiều cao cố định cho biểu đồ */}
      {children}
    </div>
  </div>
);

const ResourceCharts = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    <ChartCard title="CPU Usage Overview">
      <Bar data={cpuData} options={axisChartOptions} />
    </ChartCard>
    
    <ChartCard title="RAM Usage">
      <Doughnut data={ramData} options={pieDoughnutOptions} />
    </ChartCard>
    
    <ChartCard title="Storage Allocation">
      <Pie data={storageData} options={{...pieDoughnutOptions, cutout: '0%' }} />
    </ChartCard>
    
    <ChartCard title="Network Traffic (Last 5 hours)">
      <Line data={networkData} options={axisChartOptions} />
    </ChartCard>
  </div>
);

export default ResourceCharts;