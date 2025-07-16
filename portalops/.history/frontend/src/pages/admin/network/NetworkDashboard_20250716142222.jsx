import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../../../components/admin/Navbar';
import axiosInstance from "../../../api/axiosInstance";

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
    if (onClick) onClick();
    else setActive(value);
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

export default function NetworkDashboardPage() {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await axiosInstance.get("/openstack/network/network-list/");
        setNetworks(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch networks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworks();
  }, []);

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
            <Button>
              <span>+</span>
              Create Network
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-8 py-8">
        <Tabs defaultValue="networks">
          <TabsList>
            <TabsTrigger value="networks" onClick={() => navigate('/admin/network')}>📡 Networks</TabsTrigger>
            <TabsTrigger value="subnets" onClick={() => navigate('/admin/subnet')}>🔗 Subnets</TabsTrigger>
            <TabsTrigger value="routes" onClick={() => navigate('/admin/route')}>🔌 Routes</TabsTrigger>
            <TabsTrigger value="security" onClick={() => navigate('/admin/security-group')}>🛡️ Security Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Shared</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">External</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-400">Loading networks...</td>
                      </tr>
                    ) : networks.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-400">No networks found</td>
                      </tr>
                    ) : (
                      networks.map((net) => (
                        <tr key={net.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4">{net.name}</td>
                          <td className="px-6 py-4">{net.tenant_id}</td>
                          <td className="px-6 py-4">{net.status}</td>
                          <td className="px-6 py-4">{net.shared ? "Yes" : "No"}</td>
                          <td className="px-6 py-4">{net.router_external ? "Yes" : "No"}</td>
                          <td className="px-6 py-4 text-xs break-words">{net.id}</td>
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
