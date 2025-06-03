import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useLogout } from '../../features/auth/Logout';

export default function AdminDashboard() {
  const logout = useLogout();

  // Fake data
  const [data, setData] = useState({
    userCount: 324,
    activeTenants: 127,
    newSignups: 24,
    pendingApprovals: 3,
    revenue: 15420.75,
    recentLogins: [
      { user: 'alice', time: '2 min ago' },
      { user: 'bob', time: '10 min ago' },
      { user: 'charlie', time: '30 min ago' },
    ],
    serverHealth: {
      status: 'healthy',
      uptime: '124h 37m',
      lastCheck: '2025-06-03T11:45:00Z',
    },
    systemStats: {
      totalInstances: 340,
      totalCPU: 540,
      totalRAM: 1024,
      totalStorage: 7860,
    },
    supportTickets: [
      { id: '#2341', subject: 'Billing issue', status: 'Open' },
      { id: '#2342', subject: 'Cannot deploy instance', status: 'Pending' },
      { id: '#2343', subject: 'Request feature', status: 'Closed' },
    ]
  });

  return (
    <div className="dark bg-gray-900 min-h-screen">
      <Navbar isAdmin />
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">System Overview & Control Panel</p>
          </div>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'Users', value: data.userCount, icon: '👥' },
            { title: 'Active Tenants', value: data.activeTenants, icon: '🏘️' },
            { title: 'Revenue (USD)', value: `$${data.revenue.toLocaleString()}`, icon: '💰' },
            { title: 'Pending Approvals', value: data.pendingApprovals, icon: '🕓' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800 p-5 rounded-xl shadow-md">
              <div className="text-4xl">{item.icon}</div>
              <h2 className="text-white text-xl font-semibold mt-2">{item.title}</h2>
              <p className="text-gray-300 text-lg">{item.value}</p>
            </div>
          ))}
        </div>

        {/* System Stats + Server Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">System Resources</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Total Instances: <span className="text-white">{data.systemStats.totalInstances}</span></li>
              <li>Total CPU: <span className="text-white">{data.systemStats.totalCPU} cores</span></li>
              <li>Total RAM: <span className="text-white">{data.systemStats.totalRAM} GB</span></li>
              <li>Total Storage: <span className="text-white">{data.systemStats.totalStorage} GB</span></li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Server Health</h3>
            <p>Status: <span className={`font-bold ${data.serverHealth.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>{data.serverHealth.status}</span></p>
            <p>Uptime: <span className="text-white">{data.serverHealth.uptime}</span></p>
            <p>Last Check: <span className="text-white">{new Date(data.serverHealth.lastCheck).toLocaleString()}</span></p>
          </div>
        </div>

        {/* Recent Logins + Support Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Logins</h3>
            <ul className="space-y-2 text-gray-300">
              {data.recentLogins.map((login, i) => (
                <li key={i} className="flex justify-between">
                  <span>{login.user}</span>
                  <span className="text-gray-400">{login.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Support Tickets</h3>
            <ul className="space-y-2 text-gray-300">
              {data.supportTickets.map((ticket, i) => (
                <li key={i} className="flex justify-between">
                  <span>{ticket.subject} <span className="text-sm text-gray-500">({ticket.id})</span></span>
                  <span className={`text-sm ${ticket.status === 'Open' ? 'text-yellow-300' : ticket.status === 'Pending' ? 'text-orange-400' : 'text-green-400'}`}>{ticket.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
