import React, { useEffect, useState } from "react";

// Custom UI Components
export function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
}

export function TabsList({ children }) {
  return (
    <div className="flex border-b border-gray-700 mb-8 space-x-0 overflow-x-auto">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, active, setActive, children }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
        isActive 
          ? "border-blue-500 text-blue-400 bg-blue-500/10" 
          : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children }) {
  return active === value ? <div className="animate-in fade-in duration-300">{children}</div> : null;
}

// Card Component
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="space-y-3">{children}</div>;
}

export function CardTitle({ children, icon }) {
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-lg font-semibold text-gray-100">{children}</h3>
    </div>
  );
}

// Button Component
export function Button({ variant = "default", children, className = "", ...props }) {
  const base = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
  const variants = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// Main Page Component
export default function NetworkDashboardPage() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchNetworks = async () => {
      try {
        // Simulated data
        const mockNetworks = [
          {
            id: "net-001",
            name: "Production Network",
            project_id: "proj-main",
            shared: true,
            router_external: false,
            status: "active"
          },
          {
            id: "net-002", 
            name: "Development Network",
            project_id: "proj-dev",
            shared: false,
            router_external: true,
            status: "active"
          },
          {
            id: "net-003",
            name: "Testing Network",
            project_id: "proj-test",
            shared: false,
            router_external: false,
            status: "inactive"
          }
        ];
        
        setTimeout(() => {
          setNetworks(mockNetworks);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("❌ Failed to fetch networks:", err);
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
        <Header />
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-lg">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Network Management
                </h1>
                <p className="text-gray-400 mt-1">Manage your network infrastructure</p>
              </div>
            </div>
            <Button>
              <span>+</span>
              Create Network
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <CardTitle icon="📊">Total Networks</CardTitle>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-400">{networks.length}</p>
                <span className="text-sm text-green-400 font-medium">+2 this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <CardTitle icon="🏷️">Floating IPs</CardTitle>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-indigo-400">78</p>
                <span className="text-sm text-gray-400">/ 200</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '39%'}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <CardTitle icon="🔀">Active Routers</CardTitle>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-emerald-400">6</p>
                <span className="text-sm text-green-400 font-medium">All healthy</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <CardTitle icon="🔒">Security Groups</CardTitle>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-amber-400">12</p>
                <span className="text-sm text-yellow-400 font-medium">3 updated</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="networks">
          <TabsList>
            <TabsTrigger value="networks">📡 Networks</TabsTrigger>
            <TabsTrigger value="subnets">🔗 Subnets</TabsTrigger>
            <TabsTrigger value="ports">🔌 Ports</TabsTrigger>
            <TabsTrigger value="security">🛡️ Security Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/50">
                    <tr>
                      {[
                        { key: 'name', label: 'Network Name' },
                        { key: 'project', label: 'Project' },
                        { key: 'status', label: 'Status' },
                        { key: 'shared', label: 'Shared' },
                        { key: 'external', label: 'External' },
                        { key: 'id', label: 'Network ID' },
                        { key: 'actions', label: 'Actions' }
                      ].map(header => (
                        <th key={header.key} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-400">Loading networks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : networks.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <div className="text-gray-500">
                            <div className="text-4xl mb-4">🚫</div>
                            <p className="font-medium">No networks found</p>
                            <p className="text-sm text-gray-600 mt-1">Create your first network to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      networks.map((net) => (
                        <tr key={net.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-blue-400 text-sm">🌐</span>
                              </div>
                              <span className="font-medium text-gray-200">{net.name || "-"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                              {net.project_id || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              net.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {net.status === 'active' ? '● Active' : '○ Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              net.shared 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {net.shared ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              net.router_external 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {net.router_external ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                              {net.id}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                              <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subnets">
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Subnets Management</h3>
                <p className="text-gray-400 mb-6">Configure and manage your network subnets</p>
                <Button variant="secondary">Coming Soon</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ports">
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Port Management</h3>
                <p className="text-gray-400 mb-6">Monitor and configure network ports</p>
                <Button variant="secondary">Coming Soon</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Security Groups</h3>
                <p className="text-gray-400 mb-6">Manage firewall rules and security policies</p>
                <Button variant="secondary">Coming Soon</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}