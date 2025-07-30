import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

const FloatingIPListPage = () => {
  const [ipRows, setIpRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allIPsRes, floatListRes] = await Promise.all([
          axiosInstance.get("/openstack/network/list-all-ip-of-project/"),
          axiosInstance.get("/openstack/network/floatingip-list/")
        ]);

        const { floating_ips = [], fixed_ips = [] } = allIPsRes.data || {};
        const floatList = floatListRes.data || [];

        const findFixedIP = (fixed_ip) =>
          fixed_ips.find((f) => f.ip === fixed_ip);

        const findVMInfo = (float_ip) =>
          floatList.find((f) => f.ip_address === float_ip);

        const mergedMap = new Map();

        // Merge from list-all-ip-of-project (base)
        floating_ips.forEach((fip) => {
          const fixed = fip.fixed_ip ? findFixedIP(fip.fixed_ip) : null;
          const vmInfo = findVMInfo(fip.ip) || {};

          mergedMap.set(fip.ip, {
            ip: fip.ip,
            fixed_ip: fip.fixed_ip || "–",
            device_id: fixed?.device_id || "–",
            vm_name: vmInfo.vm_name || "Unassigned",
            status: fip.status,
            version: fip.version,
            type: fip.type,
            created_at: vmInfo.created_at || null,
          });
        });

        // Add remaining IPs from floatingip-list that were not in base API
        floatList.forEach((entry) => {
          if (!mergedMap.has(entry.ip_address)) {
            mergedMap.set(entry.ip_address, {
              ip: entry.ip_address,
              fixed_ip: entry.fixed_ip || "–",
              device_id: "–",
              vm_name: entry.vm_name || "Unassigned",
              status: entry.status || "UNKNOWN",
              version: "–",
              type: "floating",
              created_at: entry.created_at || null,
            });
          }
        });

        setIpRows(Array.from(mergedMap.values()));
      } catch (error) {
        console.error("Failed to fetch IP data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        ) : ipRows.length === 0 ? (
          <p className="text-center text-gray-500 py-10">🚫 No floating IPs found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Floating IP</th>
                <th className="px-6 py-3 text-left">Fixed IP</th>
                <th className="px-6 py-3 text-left">VM Name</th>
                <th className="px-6 py-3 text-left">Device ID</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Version</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {ipRows.map((ip, idx) => (
                <tr key={idx} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4 font-medium">{ip.ip}</td>
                  <td className="px-6 py-4">{ip.fixed_ip}</td>
                  <td className="px-6 py-4">{ip.vm_name}</td>
                  <td className="px-6 py-4">{ip.device_id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        ip.status === "ACTIVE"
                          ? "bg-green-800 text-green-300"
                          : ip.status === "DOWN"
                          ? "bg-yellow-800 text-yellow-300"
                          : ip.status === "available"
                          ? "bg-blue-800 text-blue-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {ip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{ip.version}</td>
                  <td className="px-6 py-4">
                    {ip.created_at
                      ? new Date(ip.created_at).toLocaleString()
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
