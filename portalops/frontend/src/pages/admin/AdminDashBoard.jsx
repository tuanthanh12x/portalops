import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="text-xl font-bold">🌐 AdminPanel</div>
        <div className="flex gap-8">
          {['Overview', 'Users', 'Resources', 'Billing', 'System', 'Support'].map((item) => (
            <button key={item} className="text-gray-300 hover:text-white">
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-900 border-b border-gray-800">
        <div className="bg-gray-800 p-4 rounded">👑 Admin: John Doe</div>
        <div className="bg-gray-800 p-4 rounded">🔔 Alerts: 3</div>
        <div className="bg-gray-800 p-4 rounded">✅ System Status: OK</div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* SYSTEM OVERVIEW */}
        <div className="bg-gray-800 rounded p-4 col-span-2">
          <h2 className="text-lg font-bold mb-4">System Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card title="Active Users" value="324" />
            <Card title="Total VMs" value="89" />
            <Card title="Storage Used" value="76%" />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-gray-800 rounded p-4">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {['Add New User', 'System Settings', 'View Reports'].map((text) => (
              <button key={text} className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left">
                {text}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-2">Active Incidents</h2>
            <ul className="list-disc list-inside text-sm text-red-400">
              <li>Region 2: Network Issue</li>
              <li>DB Cluster Maintenance</li>
            </ul>
          </div>
        </div>

        {/* RESOURCE UTILIZATION */}
        <div className="bg-gray-800 rounded p-4 col-span-2">
          <h2 className="text-lg font-bold mb-4">Resource Utilization</h2>
          <div className="grid grid-cols-2 gap-4">
            <ChartCard label="CPU Usage" value={[30, 45, 50, 40, 60]} />
            <ChartCard label="RAM Usage" value={[60, 50, 70, 65, 80]} />
            <ChartCard label="Storage Usage" value={[45, 55, 40, 60, 75]} />
            <ChartCard label="Network Usage" value={[20, 35, 50, 45, 30]} />
          </div>
        </div>

        {/* REVENUE + SUPPORT */}
        <div className="bg-gray-800 rounded p-4">
          <h2 className="text-lg font-bold mb-4">Revenue</h2>
          <div className="flex gap-2 mb-2">
            <button className="bg-gray-700 px-3 py-1 rounded">Daily</button>
            <button className="bg-gray-700 px-3 py-1 rounded">Monthly</button>
            <button className="bg-gray-700 px-3 py-1 rounded">Yearly</button>
          </div>
          <p className="text-3xl font-bold text-green-400">$15,420</p>

          <h2 className="text-lg font-bold mt-6 mb-2">Support Tickets</h2>
          <div className="bg-gray-700 p-3 rounded mb-2">Open: 5 | Urgent: 1</div>
          <button className="text-blue-400 underline hover:text-blue-300">View All Tickets</button>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-gray-800 rounded p-4 col-span-3">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-700 text-gray-200">
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Resource</th>
                  <th className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['12:03', 'UserA', 'Created', 'VM', 'CentOS 7, 2GB RAM, Region 1'],
                  ['12:01', 'UserB', 'Deleted', 'Volume', '50GB SSD'],
                  ['11:59', 'Admin', 'Updated', 'Plan', 'Standard Plan → $19.99'],
                ].map(([time, user, action, res, detail], i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-4 py-2">{time}</td>
                    <td className="px-4 py-2">{user}</td>
                    <td className="px-4 py-2">{action}</td>
                    <td className="px-4 py-2">{res}</td>
                    <td className="px-4 py-2">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-700 p-4 rounded text-center">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({ label, value }) {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      label,
      data: value,
      backgroundColor: '#4ade80',
    }]
  };
  return (
    <div className="bg-gray-700 p-4 rounded">
      <div className="text-sm mb-2 text-gray-300">{label}</div>
      <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
}
