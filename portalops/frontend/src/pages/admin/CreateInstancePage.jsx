import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import Header from "../../../components/admin/Navbar";

export default function CreateInstanceAsAdminPage() {
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [imageId, setImageId] = useState("");
  const [flavorId, setFlavorId] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!projectId || !name || !imageId || !flavorId || !networkId) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/admin/compute/instances/create", {
        project_id: projectId,
        name,
        image_id: imageId,
        flavor_id: flavorId,
        network_id: networkId,
      });

      toast.success(`Instance "${res.data.instance.name}" created successfully.`);
      // Reset form
      setProjectId("");
      setName("");
      setImageId("");
      setFlavorId("");
      setNetworkId("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create instance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card title="Create Instance as Admin">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instance Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image ID</label>
              <input
                type="text"
                value={imageId}
                onChange={(e) => setImageId(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Flavor ID</label>
              <input
                type="text"
                value={flavorId}
                onChange={(e) => setFlavorId(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Network ID</label>
              <input
                type="text"
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Instance"}
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
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
