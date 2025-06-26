import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";
import { Link } from "react-router-dom";

const NetworkListPage = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPorts, setModalPorts] = useState([]);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await axiosInstance.get("/openstack/network/network-list/");
        setNetworks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch networks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworks();
  }, []);

  const showPortDetails = async (networkId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/openstack/network/${networkId}/ports/`);
      setModalPorts(res.data || []);
      setModalVisible(true);
    } catch (err) {
      console.error("Failed to load port details:", err);
      setModalPorts([]);
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen text-white">
      <Navbar />
      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          🌐 Network Management
        </h2>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700 rounded-xl overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-10">⏳ Loading networks...</p>
        ) : networks.length === 0 ? (
          <p className="text-center text-gray-500 py-10">🚫 No networks found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Shared</th>
                <th className="px-6 py-3 text-left">Admin State</th>
                <th className="px-6 py-3 text-left">Subnets</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {networks.map((net) => (
                <tr key={net.id} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4 font-medium">{net.name}</td>
                  <td className="px-6 py-4">{net.status}</td>
                  <td className="px-6 py-4">{net.shared ? "✅ Yes" : "❌ No"}</td>
                  <td className="px-6 py-4">{net.admin_state_up ? "Up" : "Down"}</td>
                  <td className="px-6 py-4">{net.subnets.length}</td>
                  <td className="px-6 py-4">
                    <button
                      className="text-indigo-400 hover:underline"
                      onClick={() => showPortDetails(net.id)}
                    >
                      View Ports
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Port Details Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setModalVisible(false)}
        >
          <div
            className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Port Details</h3>
            {modalPorts.length === 0 ? (
              <p>No port details available.</p>
            ) : (
              <table className="w-full text-sm border border-gray-700 rounded">
                <thead className="bg-gray-800 text-gray-300 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">IP Addresses</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Device Owner</th>
                    <th className="px-4 py-2 text-left">Attached VM ID</th> {/* New column */}
                  </tr>
                </thead>
                <tbody>
                  {modalPorts.map((port) => (
                    <tr
                      key={port.id}
                      className="border-t border-gray-700 hover:bg-gray-800 transition"
                    >
                      <td className="px-4 py-2">{port.name || "-"}</td>
                      <td className="px-4 py-2">
                        {port.ip_addresses?.length > 0
                          ? port.ip_addresses.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-2">{port.status}</td>
                      <td className="px-4 py-2">{port.device_owner || "-"}</td>
                      <td className="px-4 py-2">
                        {port.device_owner?.startsWith("compute")
                          ? port.device_id
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default NetworkListPage;
