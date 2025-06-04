import React, { useState } from 'react';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(...registerables);

// Chart Data
const cpuData = {
  labels: ['Core 1', 'Core 2', 'Core 3', 'Core 4'],
  datasets: [{
    label: 'CPU Usage (%)',
    data: [65, 59, 80, 81],
    backgroundColor: 'rgba(79, 70, 229, 0.5)', // Indigo
    borderColor: 'rgba(79, 70, 229, 1)',
    borderWidth: 1,
  }],
};

const ramData = {
  labels: ['Used', 'Free'],
  datasets: [{
    label: 'RAM Usage',
    data: [75, 25],
    backgroundColor: ['rgba(79, 70, 229, 0.5)', 'rgba(55, 65, 81, 0.5)'], // Indigo and gray
    borderColor: ['rgba(79, 70, 229, 1)', 'rgba(55, 65, 81, 1)'],
    borderWidth: 1,
  }],
};

const storageData = {
  labels: ['Used', 'Free'],
  datasets: [{
    label: 'Storage Usage',
    data: [60, 40],
    backgroundColor: ['rgba(79, 70, 229, 0.5)', 'rgba(55, 65, 81, 0.5)'],
    borderColor: ['rgba(79, 70, 229, 1)', 'rgba(55, 65, 81, 1)'],
    borderWidth: 1,
  }],
};

const networkData = {
  labels: ['12:00', '13:00', '14:00', '15:00', '16:00'],
  datasets: [{
    label: 'Network (Mbps)',
    data: [100, 150, 120, 180, 160],
    fill: false,
    borderColor: 'rgba(79, 70, 229, 1)',
    tension: 0.1,
  }],
};

// Header Component
const Header = () => (
  <header className="bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center border-b border-gray-700">
    <div className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md">🖥️ VPS Admin</div>
    <nav className="space-x-4 text-gray-300">
      {['Overview', 'Users', 'Resources', 'Billing', 'System', 'Support'].map(item => (
        <Link key={item} to={`/${item.toLowerCase()}`} className="hover:text-indigo-400 transition">{item}</Link>
      ))}
    </nav>
  </header>
);

// SubHeader Component
const SubHeader = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center border-b border-gray-700">
    <div className="text-gray-200 font-medium">Admin Profile</div>
    <div className="flex space-x-4">
      <span className="bg-red-800 text-red-300 px-2 py-1 text-xs font-bold rounded-full">Alerts (3)</span>
      <span className="bg-green-800 text-green-300 px-2 py-1 text-xs font-bold rounded-full">System Status: OK</span>
    </div>
  </div>
);

// System Overview Component
const SystemOverview = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">System Overview</h2>
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-gray-800/50 rounded text-gray-200">Active Users: 120</div>
      <div className="p-4 bg-gray-800/50 rounded text-gray-200">Total VMs: 85</div>
      <div className="p-4 bg-gray-800/50 rounded text-gray-200">Storage: 60%</div>
    </div>
  </div>
);

// Quick Actions Component
const QuickActions = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Quick Actions</h2>
    <div className="space-y-2">
      <Link
        to="/create-instance"
        className="block px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        + Create Instance
      </Link>
      <button className="w-full px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400">
        System Settings
      </button>
      <button className="w-full px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400">
        View Reports
      </button>
    </div>
  </div>
);

// Resource Utilization Component
const ResourceCharts = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Resource Utilization</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-800/50 rounded">
        <h3 className="text-lg font-medium text-gray-200">CPU Usage</h3>
        <Bar data={cpuData} />
      </div>
      <div className="p-4 bg-gray-800/50 rounded">
        <h3 className="text-lg font-medium text-gray-200">RAM Usage</h3>
        <Doughnut data={ramData} />
      </div>
      <div className="p-4 bg-gray-800/50 rounded">
        <h3 className="text-lg font-medium text-gray-200">Storage Usage</h3>
        <Pie data={storageData} />
      </div>
      <div className="p-4 bg-gray-800/50 rounded">
        <h3 className="text-lg font-medium text-gray-200">Network Activity</h3>
        <Line data={networkData} />
      </div>
    </div>
  </div>
);

// Revenue Component
const RevenueSection = () => {
  const [tab, setTab] = useState('Daily');
  return (
    <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Revenue</h2>
      <div className="flex space-x-4 mb-4">
        {['Daily', 'Monthly', 'Yearly'].map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              tab === t ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="text-2xl font-bold text-gray-200">$4,500</div>
    </div>
  );
};

// Support Tickets Component
const SupportTickets = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Support Tickets</h2>
    <div className="space-y-2 text-gray-200">
      <div>Open: 15 | Urgent: 3</div>
      <button className="w-full px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400">
        View All Tickets
      </button>
    </div>
  </div>
);

// Active Incidents Component
const ActiveIncidents = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Active Incidents</h2>
    <ul className="list-disc pl-5 text-gray-200">
      <li>Region 2: Network Issue</li>
      <li>DB Cluster Maintenance</li>
    </ul>
  </div>
);

// Recent Activity Component
const RecentActivity = () => (
  <div className="bg-black/30 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-700">
    <h2 className="text-2xl font-bold tracking-tight text-indigo-400 drop-shadow-md mb-4">Recent Activity</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            {['Time', 'User', 'Action', 'Resource', 'Details'].map(header => (
              <th key={header} className="px-6 py-4 text-left font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 text-gray-200">
          <tr className="hover:bg-gray-900/30 transition">
            <td className="px-6 py-4">10:00</td>
            <td className="px-6 py-4">UserA</td>
            <td className="px-6 py-4">Created</td>
            <td className="px-6 py-4">VM</td>
            <td className="px-6 py-4">CentOS 7, 2GB RAM, Region 1</td>
          </tr>
          <tr className="hover:bg-gray-900/30 transition">
            <td className="px-6 py-4">10:15</td>
            <td className="px-6 py-4">UserB</td>
            <td className="px-6 py-4">Deleted</td>
            <td className="px-6 py-4">Volume</td>
            <td className="px-6 py-4">50GB SSD</td>
          </tr>
          <tr className="hover:bg-gray-900/30 transition">
            <td className="px-6 py-4">10:30</td>
            <td className="px-6 py-4">Admin</td>
            <td className="px-6 py-4">Updated</td>
            <td className="px-6 py-4">Plan</td>
            <td className="px-6 py-4">Standard Plan price changed</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Main Dashboard Component
const Dashboard = () => (
  <div className="min-h-screen bg-gray-900">
    <Header />
    <SubHeader />
    <main className="mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SystemOverview />
      <QuickActions />
      <ResourceCharts />
      <RevenueSection />
      <SupportTickets />
      <ActiveIncidents />
      <div className="lg:col-span-3">
        <RecentActivity />
      </div>
    </main>
  </div>
);

export default Dashboard;