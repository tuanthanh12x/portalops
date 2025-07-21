import React, { useState } from 'react';

const NetworkDetailPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subnetSearch, setSubnetSearch] = useState('');
  const [portSearch, setPortSearch] = useState('');

  // Sample data
  const networkData = {
    name: 'net-a',
    id: '2e3d4f5g-6h7i-8j9k-l0m1-n2o3p4q5r6s7',
    project: 'demo-project',
    shared: false,
    external: false,
    adminState: 'UP',
    mtu: 1500,
    subnetCount: 2,
    portCount: 8,
    createdAt: '2025-01-15 14:30:22',
    status: 'ACTIVE'
  };

  const subnets = [
    {
      name: 'subnet-a-1',
      cidr: '192.168.10.0/24',
      ipVersion: 'IPv4',
      gateway: '192.168.10.1',
      dhcp: true,
      allocationPool: '192.168.10.100-200'
    },
    {
      name: 'subnet-a-2',
      cidr: '192.168.20.0/24',
      ipVersion: 'IPv4',
      gateway: '192.168.20.1',
      dhcp: false,
      allocationPool: '192.168.20.50-150'
    },
    {
      name: 'subnet-a-ipv6',
      cidr: '2001:db8::/64',
      ipVersion: 'IPv6',
      gateway: '2001:db8::1',
      dhcp: true,
      allocationPool: 'Auto-assigned'
    }
  ];

  const ports = [
    {
      id: '2e3d-1234',
      fixedIPs: ['192.168.10.15'],
      macAddress: 'fa:16:3e:12:34:56',
      device: 'instance-web-01',
      owner: 'compute:nova',
      status: 'ACTIVE'
    },
    {
      id: '2e3d-5678',
      fixedIPs: ['192.168.10.16'],
      macAddress: 'fa:16:3e:56:78:90',
      device: 'instance-db-01',
      owner: 'compute:nova',
      status: 'ACTIVE'
    },
    {
      id: '2e3d-9abc',
      fixedIPs: ['192.168.10.1'],
      macAddress: 'fa:16:3e:ab:cd:ef',
      device: 'router-gateway',
      owner: 'network:router_interface',
      status: 'ACTIVE'
    },
    {
      id: '2e3d-def0',
      fixedIPs: ['192.168.10.100', '192.168.10.101'],
      macAddress: 'fa:16:3e:de:f0:12',
      device: 'lb-web-cluster',
      owner: 'network:loadbalancer',
      status: 'ACTIVE'
    },
    {
      id: '2e3d-3456',
      fixedIPs: ['192.168.20.25'],
      macAddress: 'fa:16:3e:34:56:78',
      device: 'instance-backup',
      owner: 'compute:nova',
      status: 'DOWN'
    }
  ];

  const filteredSubnets = subnets.filter(subnet =>
    subnet.name.toLowerCase().includes(subnetSearch.toLowerCase()) ||
    subnet.cidr.toLowerCase().includes(subnetSearch.toLowerCase())
  );

  const filteredPorts = ports.filter(port =>
    port.id.toLowerCase().includes(portSearch.toLowerCase()) ||
    port.device.toLowerCase().includes(portSearch.toLowerCase()) ||
    port.owner.toLowerCase().includes(portSearch.toLowerCase())
  );

  const StatusBadge = ({ status, type = 'default' }) => {
    const getStatusStyles = () => {
      if (type === 'dhcp') {
        return status 
          ? 'bg-indigo-600 text-white' 
          : 'bg-gray-600 text-white';
      }
      
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-600 text-white';
        case 'DOWN':
          return 'bg-red-600 text-white';
        default:
          return 'bg-gray-600 text-white';
      }
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusStyles()}`}>
        {type === 'dhcp' ? (status ? 'On' : 'Off') : status}
      </span>
    );
  };

  const InfoCard = ({ label, value, icon }) => (
    <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-xl p-6 hover:bg-black/50 transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</div>
          <div className="text-lg font-bold text-white mt-1">{value}</div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tabKey, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabKey)}
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8 mb-8">
          <button className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 mb-6">
            <span>←</span>
            <span>Back to Networks</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-indigo-400 tracking-wide drop-shadow">
              🌐 Network: {networkData.name}
            </h1>
            <StatusBadge status={networkData.status} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <TabButton
            tabKey="overview"
            label="📊 Overview"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            tabKey="subnets"
            label="🏠 Subnets"
            isActive={activeTab === 'subnets'}
            onClick={setActiveTab}
          />
          <TabButton
            tabKey="ports"
            label="🔌 Ports"
            isActive={activeTab === 'ports'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-indigo-400 mb-6">Network Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard label="Network Name" value={networkData.name} icon="🏷️" />
                <InfoCard label="Network ID" value={networkData.id.substring(0, 18) + '...'} icon="🆔" />
                <InfoCard label="Project" value={networkData.project} icon="📁" />
                <InfoCard label="Shared" value={networkData.shared ? 'True' : 'False'} icon="🔗" />
                <InfoCard label="External" value={networkData.external ? 'True' : 'False'} icon="🌍" />
                <InfoCard label="Admin State" value={networkData.adminState} icon="⚙️" />
                <InfoCard label="MTU" value={networkData.mtu} icon="📏" />
                <InfoCard label="Subnet Count" value={networkData.subnetCount} icon="🏠" />
                <InfoCard label="Port Count" value={networkData.portCount} icon="🔌" />
                <InfoCard label="Created At" value={networkData.createdAt} icon="📅" />
              </div>

              <div className="flex flex-wrap gap-4 justify-center pt-8">
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                  ✏️ Edit Network
                </button>
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                  ➕ Create Subnet
                </button>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                  🗑️ Delete Network
                </button>
              </div>
            </div>
          )}

          {activeTab === 'subnets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-indigo-400">🏠 Subnets</h2>
                <input
                  type="text"
                  placeholder="Search by name or CIDR..."
                  value={subnetSearch}
                  onChange={(e) => setSubnetSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">CIDR</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">IP Version</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Gateway</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">DHCP</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Allocation Pool</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSubnets.map((subnet, index) => (
                      <tr key={index} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{subnet.name}</td>
                        <td className="px-6 py-4 text-green-400 font-mono">{subnet.cidr}</td>
                        <td className="px-6 py-4 text-gray-300">{subnet.ipVersion}</td>
                        <td className="px-6 py-4 text-blue-400 font-mono">{subnet.gateway}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={subnet.dhcp} type="dhcp" />
                        </td>
                        <td className="px-6 py-4 text-gray-300">{subnet.allocationPool}</td>
                        <td className="px-6 py-4">
                          <button className="text-indigo-400 hover:text-indigo-300 font-semibold">
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-indigo-400">🔌 Ports</h2>
                <input
                  type="text"
                  placeholder="Search by port ID or device..."
                  value={portSearch}
                  onChange={(e) => setPortSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Port ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Fixed IP(s)</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">MAC Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Attached Device</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Device Owner</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredPorts.map((port, index) => (
                      <tr key={index} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-blue-400 font-mono">{port.id}</td>
                        <td className="px-6 py-4 text-green-400 font-mono">
                          {port.fixedIPs.join(', ')}
                        </td>
                        <td className="px-6 py-4 text-yellow-400 font-mono">{port.macAddress}</td>
                        <td className="px-6 py-4 text-white font-medium">{port.device}</td>
                        <td className="px-6 py-4 text-gray-300">{port.owner}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={port.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-indigo-400 hover:text-indigo-300 font-semibold">
                            👁️ View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkDetailPage;