import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../../../components/admin/Navbar';
import axiosInstance from "../../../api/axiosInstance";

// CUSTOM UI COMPONENTS //

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

export function TabsTrigger({ value, active, setActive, children, onClick }) {
  const isActive = active === value;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setActive(value);
    }
  };

  return (
    <button
      onClick={handleClick}
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

export function Button({ variant = "default", children, className = "", ...props }) {
  const base = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
  const variants = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// MAIN PAGE COMPONENT //

export default function NetworkDashboardPage() {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fixed: Use axiosInstance directly instead of treating it like fetch
      const response = await axiosInstance.get('openstack/network/network-list/');
      
      // Fixed: axiosInstance returns response.data, not response.json()
      setNetworks(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch networks:", err);
      setError(err.message || 'Failed to fetch networks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  // Hàm để refresh dữ liệu
  const refreshNetworks = () => {
    fetchNetworks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
            <div className="flex gap-3">
              <Button variant="secondary" onClick={refreshNetworks}>
                <span>🔄</span>
                Refresh
              </Button>
              <Button>
                <span>+</span>
                Create Network
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-8 py-8">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <p className="font-medium text-red-400">Failed to load networks</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="networks">
          <TabsList>
            <TabsTrigger
              value="networks"
              onClick={() => navigate('/admin/network')}
            >
              📡 Networks
            </TabsTrigger>
            <TabsTrigger
              value="subnets"
              onClick={() => navigate('/admin/subnet')}
            >
              🔗 Subnets
            </TabsTrigger>
            <TabsTrigger
              value="routes"
              onClick={() => navigate('/admin/route')}
            >
              🔌 Routes
            </TabsTrigger>
            <TabsTrigger
              value="security"
              onClick={() => navigate('/admin/security-group')}
            >
              🛡️ Security Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/50">
                    <tr>
                      {[
                        { key: 'name', label: 'Network Name' },
                        { key: 'status', label: 'Status' },
                        { key: 'shared', label: 'Shared' },
                        { key: 'external', label: 'External' },
                        { key: 'subnets', label: 'Subnets' },
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
                        <td colSpan="8" className="text-center py-12">
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-400">Loading networks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12">
                          <div className="text-red-400">
                            <div className="text-4xl mb-4">⚠️</div>
                            <p className="font-medium">Failed to load networks</p>
                            <p className="text-sm text-red-300 mt-1">{error}</p>
                            <Button 
                              variant="secondary" 
                              className="mt-4"
                              onClick={refreshNetworks}
                            >
                              Try Again
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : networks.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12">
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              net.status === 'ACTIVE' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {net.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
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
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                              {net.subnets || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                              {net.id ? net.id.substring(0, 128) : "-"}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="text-blue-400 hover:text-blue-300 text-sm">
                                View
                              </button>
                              <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                                Edit
                              </button>
                              <button className="text-red-400 hover:text-red-300 text-sm">
                                Delete
                              </button>
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
        </Tabs>
      </div>
    </div>
  );
}