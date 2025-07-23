import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

const FloatingIPListPage = () => {
  const [floatingIPs, setFloatingIPs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFloatingIPs = async () => {
      try {
        const res = await axiosInstance.get("/openstack/network/floatingip-list/");
        setFloatingIPs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch floating IPs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFloatingIPs();
  }, []);

  return (
    <section className="min-h-screen text-white bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
      <header className="container mx-auto px-4 py-6 max-w-7xl">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          🌐 Floating IP Management
        </h2>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700 rounded-xl overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-10">⏳ Loading floating IPs...</p>
        ) : floatingIPs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">🚫 No floating IPs found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">IP Address</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Attached To</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {floatingIPs.map((ip) => (
                <tr
                  key={ip.id || `${ip.ip_address}-${ip.attached_to || "none"}`}
                  className="hover:bg-gray-900/30 transition"
                >
                  <td className="px-6 py-4 font-medium">{ip.ip_address}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        ip.status === "allocated"
                          ? "bg-green-800 text-green-300"
                          : ip.status === "reserved"
                          ? "bg-yellow-800 text-yellow-300"
                          : ip.status === "available"
                          ? "bg-blue-800 text-blue-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {ip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{ip.attached_to || "–"}</td>
                  <td className="px-6 py-4">
                    {ip.created_at
                      ? new Date(ip.created_at).toLocaleDateString()
                      : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default FloatingIPListPage;
