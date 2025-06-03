import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";

const InstancesTable = ({ instances }) => {
  const [instanceList, setInstanceList] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (Array.isArray(instances)) {
      setInstanceList(instances);
    }
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
      } else {
        alert("Console URL not found in response.");
      }
    } catch (error) {
      alert(`Failed to open console: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAction = async (instanceId, action) => {
    setLoadingId(instanceId);
    try {
      await axiosInstance.post(
        `/openstack/compute/instances/${instanceId}/action/`,
        { action }
      );
      setInstanceList((prevList) =>
        prevList.map((instance) =>
          instance.id === instanceId
            ? {
                ...instance,
                status:
                  action === "start"
                    ? "ONLINE"
                    : action === "stop"
                    ? "SHUTOFF"
                    : instance.status,
              }
            : instance
        )
      );
    } catch (error) {
      // You might want to log the error for diagnostics
      console.error("Action failed:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-100 tracking-wide font-sans">
          My Instances
        </h2>
        <Link
          to="/create-instance"
          className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Create a new instance"
        >
          + Create Instance
        </Link>
      </header>

      <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg bg-[#1a1a2e]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#2c2c3e]">
            <tr>
              {["Name", "Status", "IP", "Flavor", "Region", "Created", "Actions"].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {instanceList.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">
                  No instances found.
                </td>
              </tr>
            ) : (
              instanceList.map((instance) => {
                const isOnline = instance.status.toLowerCase() === "online";
                const actionLabel = isOnline ? "Shut Down" : "Power On";
                const actionType = isOnline ? "stop" : "start";

                return (
                  <tr
                    key={instance.id}
                    className="hover:bg-[#26263b] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200 font-medium">{instance.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isOnline ? "bg-green-800 text-green-400" : "bg-red-800 text-red-400"
                        }`}
                        aria-label={`Status: ${instance.status}`}
                      >
                        {instance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{instance.ip || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{instance.plan || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{instance.region || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300" title={new Date(instance.created).toLocaleString()}>
                      {new Date(instance.created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2 justify-start md:justify-end">
                      <button
                        disabled={loadingId === instance.id}
                        onClick={() => handleAction(instance.id, actionType)}
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          isOnline
                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`${actionLabel} instance ${instance.name}`}
                      >
                        {loadingId === instance.id ? (
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        ) : null}
                        {actionLabel}
                      </button>
                      <button
                        disabled={loadingId === instance.id}
                        onClick={() => handleConsole(instance.id)}
                        className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Open console for instance ${instance.name}`}
                      >
                        Console
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
