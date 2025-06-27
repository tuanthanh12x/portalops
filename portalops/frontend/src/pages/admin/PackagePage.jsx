import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/admin/Navbar";
import { Link } from "react-router-dom";

const ProjectTypeListPage = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectTypes = async () => {
      try {
        const res = await axiosInstance.get("/project/project-packages/list/");
        setProjectTypes(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch project types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTypes();
  }, []);

  return (
    <section className="min-h-screen text-white">
      <Navbar />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md font-fantasy">
          🧩 Project Packages
        </h2>
        <Link
          to="/admin/create-package"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Create Project Package
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {["Name", "Price ($/mo)", "RAM (MB)", "vCPUs", "Instances", "Volumes", "Total GB", "Floating IPs", "ID"].map(
                (header) => (
                  <th key={header} className="px-6 py-4 text-left font-semibold">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading project packages...
                </td>
              </tr>
            ) : projectTypes.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No project packages found.
                </td>
              </tr>
            ) : (
              projectTypes.map((pt) => (
                <tr key={pt.id} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4 font-medium">{pt.name}</td>
                  <td className="px-6 py-4">{pt.price_per_month}</td>
                  <td className="px-6 py-4">{pt.ram}</td>
                  <td className="px-6 py-4">{pt.vcpus}</td>
                  <td className="px-6 py-4">{pt.instances}</td>
                  <td className="px-6 py-4">{pt.volumes}</td>
                  <td className="px-6 py-4">{pt.total_volume_gb}</td>
                  <td className="px-6 py-4">{pt.floating_ips}</td>
                  <td className="px-6 py-4 text-xs break-words">{pt.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectTypeListPage;
