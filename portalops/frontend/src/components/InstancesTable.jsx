import React, { useState } from "react";
import axiosInstance from '../api/axiosInstance'; // Ensure this file exists
import { Link } from "react-router-dom";

const InstancesTable = ({ instances }) => {
  const instancesArray = Array.isArray(instances) ? instances : [];
  const [loadingId, setLoadingId] = useState(null);

  const handleConsole = async (instanceId) => {
    setLoadingId(instanceId);
    try {
      const res = await axiosInstance.post("/overview/console/", {
        server_id: instanceId,
        type: "novnc",
      });

      const consoleUrl = res.data.console?.url;

      if (consoleUrl) {
        window.open(consoleUrl, "_blank");
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
      const res = await axiosInstance.post(
        `/openstack/compute/instances/${instanceId}/action/`,
        { action }
      );
      alert(`Action "${action}" succeeded on instance ${instanceId}`);

    } catch (error) {
      alert(`Failed to ${action} instance: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
  <h2 className="text-2xl font-semibold text-gray-200 font-fantasy">
    My Instances
  </h2>
  <Link
    to="/create-instance"
    className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
  >
    + Create Instance
  </Link>
</div>


      <div className="bg-[#1a1a2e] rounded shadow p-4 overflow-auto border border-[#2c2c3e]">
        <div className="min-w-[800px] w-full">
          {/* Header */}
          <div className="hidden md:grid grid-cols-7 gap-4 bg-[#2c2c3e] text-gray-300 text-sm p-3 rounded-t">
            <div>Name</div>
            <div>Status</div>
            <div>IP</div>
            <div>Flavor</div>
            <div>Region</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-[#33344a]">
            {instancesArray.length === 0 ? (
              <div className="text-center p-6 text-gray-500">No instances found.</div>
            ) : (
              instancesArray.map((instance) => (
                <div
                  key={instance.id}
                  className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 p-3 hover:bg-[#26263b] transition-colors text-gray-300"
                >
                  <div>
                    <span className="md:hidden font-semibold">Name: </span>
                    {instance.name}
                  </div>
                  <div>
                    <span className="md:hidden font-semibold">Status: </span>
                    <span
                      className={
                        instance.status.toLowerCase() === "online"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {instance.status}
                    </span>
                  </div>
                  <div>
                    <span className="md:hidden font-semibold">IP: </span>
                    {instance.ip}
                  </div>
                  <div>
                    <span className="md:hidden font-semibold">Flavor: </span>
                    {instance.plan || "-"}
                  </div>
                  <div>
                    <span className="md:hidden font-semibold">Region: </span>
                    {instance.region}
                  </div>
                  <div>
                    <span className="md:hidden font-semibold">Created: </span>
                    {new Date(instance.created).toLocaleString()}
                  </div>
                  <div className="flex justify-start md:justify-end space-x-2">
                    <button
                      disabled={loadingId === instance.id}
                      onClick={() => handleAction(instance.id, "start")}
                      className="bg-[#3a3a5e] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#50507b] transition-colors disabled:opacity-50"
                    >
                      Power On
                    </button>
                    <button
                      disabled={loadingId === instance.id}
                      onClick={() => handleAction(instance.id, "stop")}
                      className="bg-[#333350] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#46466a] transition-colors disabled:opacity-50"
                    >
                      Shut Down
                    </button>
                    <button
                      disabled={loadingId === instance.id}
                      onClick={() => handleConsole(instance.id)}
                      className="bg-[#2d2d4a] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#42425f] transition-colors disabled:opacity-50"
                    >
                      Console
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstancesTable;