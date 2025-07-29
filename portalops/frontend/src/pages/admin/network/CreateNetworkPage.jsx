// CreateNetworkPage.jsx
import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import Header from '../../../components/admin/Navbar';


export default function TCreateNetworkPage() {
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [external, setExternal] = useState(false);
  const [adminStateUp, setAdminStateUp] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/openstack/network/create-networks/", {
        name,
        shared,
        "router:external": external,
        admin_state_up: adminStateUp,
      });

      toast.success(`Network '${res.data.network.name}' created successfully.`);
      setName("");
      setShared(false);
      setExternal(false);
      setAdminStateUp(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card title="Create New Network">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Network Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={shared}
                  onChange={() => setShared(!shared)}
                  className="accent-blue-600"
                />
                <span>Shared</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={external}
                  onChange={() => setExternal(!external)}
                  className="accent-blue-600"
                />
                <span>External</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adminStateUp}
                  onChange={() => setAdminStateUp(!adminStateUp)}
                  className="accent-blue-600"
                />
                <span>Admin State Up</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Network"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
function Card({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}