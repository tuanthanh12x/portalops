import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import Header from "../../components/admin/Navbar";

export default function CreateImagePage() {
  const [name, setName] = useState("");
  const [diskFormat, setDiskFormat] = useState("qcow2");
  const [visibility, setVisibility] = useState("private");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("disk_format", diskFormat);
    formData.append("visibility", visibility);
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axiosInstance.post("/openstack/image/create-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(`Image '${res.data.image_name}' created successfully.`);
      setName("");
      setDiskFormat("qcow2");
      setVisibility("private");
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card title="Create New Image">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Image Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Disk Format</label>
              <select
                value={diskFormat}
                onChange={(e) => setDiskFormat(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
              >
                <option value="qcow2">qcow2</option>
                <option value="raw">raw</option>
                <option value="vmdk">vmdk</option>
                <option value="vhd">vhd</option>
              </select>
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">Visibility</label>
  <select
    value={visibility}
    onChange={(e) => setVisibility(e.target.value)}
    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
  >
    <option value="private">Private (default)</option>
    <option value="public">Public (global)</option>
    <option value="shared">Shared (with specific projects)</option>
    <option value="community">Community (open for all users)</option>
  </select>
</div>


            <div>
              <label className="block text-sm font-medium mb-1">Image File</label>
              <input
                type="file"
                accept=".qcow2,.img,.iso,.raw,.vmdk,.vhd"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Create Image"}
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
