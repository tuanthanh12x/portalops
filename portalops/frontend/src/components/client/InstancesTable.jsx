import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import Popup from "../../components/client/Popup";

const Spinner = () => (
  <span className="loader inline-block w-4 h-4 border-2 border-t-white border-r-white border-transparent rounded-full animate-spin"></span>
);

const IPDisplay = ({ floating_ips = [], fixed_ips = [] }) => {
  if (floating_ips.length === 0 && fixed_ips.length === 0) return "-";

  return (
    <div className="group relative">
      {floating_ips.length > 0 && (
        <>
          <div className="text-blue-300">🌐 {floating_ips[0]}</div>
          <div className="absolute left-0 top-full mt-1 w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg shadow-lg p-2 z-10">
            {floating_ips.slice(1).map((ip, idx) => (
              <div key={`fip-extra-${idx}`} className="text-blue-300">
                🌐 {ip}
              </div>
            ))}
            {fixed_ips.map((ip, idx) => (
              <div key={`fixed-ip-${idx}`} className="text-gray-400">
                📌 {ip}
              </div>
            ))}
          </div>
        </>
      )}

      {floating_ips.length === 0 &&
        fixed_ips.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg shadow-lg p-2 z-10">
            {fixed_ips.map((ip, idx) => (
              <div key={`fixed-ip-${idx}`} className="text-gray-400">
                📌 {ip}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

const InstancesTable = ({ instances }) => {
  const [instanceList, setInstanceList] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (Array.isArray(instances)) setInstanceList(instances);
  }, [instances]);

  const handleConsole = async (instanceId) => {
    setLoadingId(instanceId);
    try {
      const res = await axiosInstance.post("/overview/console/", {
        server_id: instanceId,
        type: "novnc",
      });

      const consoleUrl = res.data.console?.url;
      if (consoleUrl) {
        window.open(consoleUrl, "_blank", "noopener,noreferrer");
        setPopup({ message: "Console opened in a new tab.", type: "success" });
      } else {
        setPopup({ message: "Console URL not found in response.", type: "error" });
      }
    } catch (error) {
      setPopup({
        message: `Failed to open console: ${error.response?.data?.error || error.message}`,
        type: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleAction = async (instanceId, action) => {
    setLoadingId(instanceId);
    try {
      await axiosInstance.post(`/openstack/compute/instances/${instanceId}/action/`, { action });
      setInstanceList((prev) =>
        prev.map((i) =>
          i.id === instanceId
            ? { ...i, status: action === "start" ? "Online" : "Offline" }
            : i
        )
      );
      setPopup({ message: `Action '${action}' executed successfully.`, type: "success" });
    } catch (err) {
      console.error("Action failed:", err);
      setPopup({ message: `Failed to execute action '${action}'.`, type: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  const isLoadingData = !Array.isArray(instances) || instances.length === 0;

  return (
    <section className="mx-auto px-4 py-10">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          🖥️ My Instances
        </h2>
        <Link
          to="/create-instance"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          + Create Instance
        </Link>
      </header>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}

      {loadingId && (
        <div className="text-right text-blue-300 py-2 text-sm animate-pulse">
          🔄 Processing instance ID: {loadingId}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {["Name", "Status", "IP", "Flavor", "Region", "Created", "Actions"].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {isLoadingData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(7).fill().map((_, idx) => (
                    <td key={idx} className="px-6 py-4">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : instanceList.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No instances found.
                </td>
              </tr>
            ) : (
              instanceList.map((instance) => {
                const {
                  id,
                  name,
                  status,
                  floating_ips,
                  fixed_ips,
                  plan,
                  region,
                  created,
                } = instance;
                const isOnline = status.toLowerCase() === "online";
                const actionLabel = isOnline ? "Shut Down" : "Power On";
                const actionType = isOnline ? "stop" : "start";

                return (
                  <tr key={id} className="hover:bg-gray-900/30 transition">
                    <td className="px-6 py-4 font-medium">
                      <Link to={`/client/vps/${id}`} className="text-indigo-400 hover:underline">
                        {name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                          isOnline
                            ? "bg-green-800 text-green-300"
                            : "bg-red-800 text-red-300"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <IPDisplay floating_ips={floating_ips} fixed_ips={fixed_ips} />
                    </td>
                    <td className="px-6 py-4">{plan || "-"}</td>
                    <td className="px-6 py-4">{region || "-"}</td>
                    <td className="px-6 py-4" title={new Date(created).toLocaleString()}>
                      {new Date(created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        disabled={loadingId === id}
                        onClick={() => handleAction(id, actionType)}
                        className={`px-4 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 ${
                          isOnline
                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingId === id ? <Spinner /> : actionLabel}
                      </button>
                      <button
                        disabled={loadingId === id}
                        onClick={() => handleConsole(id)}
                        className="px-4 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingId === id ? <Spinner /> : "Console"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InstancesTable;
