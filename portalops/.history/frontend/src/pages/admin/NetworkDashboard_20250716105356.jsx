// Custom UI Components
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";

// Tabs Component
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
  return <div className="flex border-b border-gray-300 mb-4 space-x-2">{children}</div>;
}

export function TabsTrigger({ value, active, setActive, children }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors duration-200 ${
        isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children }) {
  return active === value ? <div>{children}</div> : null;
}

// Card Component
export function Card({ children }) {
  return <div className="bg-white rounded-xl shadow-md p-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="space-y-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold text-gray-800">{children}</h3>;
}

// Button Component
export function Button({ variant = "default", children, ...props }) {
  const base = "px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>;
}

// Main Page Component
export default function NetworkDashboardPage() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await axiosInstance.get("/network/networks/");
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
    <section className="min-h-screen text-white">
      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md font-fantasy">
          🌐 Network Management
        </h2>
        <Link
          to="/admin/create-network"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Create Network
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent>
              <CardTitle>Total Networks</CardTitle>
              <p className="text-2xl font-semibold mt-2">{networks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <CardTitle>Floating IPs</CardTitle>
              <p className="text-2xl font-semibold mt-2">78 / 200</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <CardTitle>Active Routers</CardTitle>
              <p className="text-2xl font-semibold mt-2">6</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="networks">
          <TabsList>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="subnets">Subnets</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
            <TabsTrigger value="security">Security Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <div className="overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    {['Name', 'Project', 'Shared', 'External', 'ID'].map(header => (
                      <th key={header} className="px-6 py-4 text-left font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                        ⏳ Loading networks...
                      </td>
                    </tr>
                  ) : networks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                        🚫 No networks found.
                      </td>
                    </tr>
                  ) : (
                    networks.map((net) => (
                      <tr key={net.id} className="hover:bg-gray-900/30 transition">
                        <td className="px-6 py-4 font-medium">{net.name || "-"}</td>
                        <td className="px-6 py-4">{net.project_id || "-"}</td>
                        <td className="px-6 py-4">{net.shared ? "Yes" : "No"}</td>
                        <td className="px-6 py-4">{net.router_external ? "Yes" : "No"}</td>
                        <td className="px-6 py-4 text-xs break-words">{net.id}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="subnets">
            <div className="mt-4">
              <p className="text-muted-foreground">Subnet list coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="ports">
            <div className="mt-4">
              <p className="text-muted-foreground">Port table coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="mt-4">
              <p className="text-muted-foreground">Security groups will be listed here...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}