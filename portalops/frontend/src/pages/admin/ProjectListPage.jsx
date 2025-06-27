import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/admin/Navbar";

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/project/projects/list/");
        setProjects(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="min-h-screen text-white">
      <Navbar />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md font-fantasy">
          🏗️ Project List
        </h2>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {["Name", "OpenStack ID", "Type ID", "Type Name", "User ID"].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading projects...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No projects found.
                </td>
              </tr>
            ) : (
              projects.map((proj) => (
                <tr key={proj.project_id} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4 font-medium">{proj.project_name}</td>
                  <td className="px-6 py-4 text-xs break-all">{proj.openstack_id}</td>
                  <td className="px-6 py-4">{proj.project_type?.id ?? "—"}</td>
                  <td className="px-6 py-4">{proj.project_type?.name ?? "—"}</td>
                  <td className="px-6 py-4">{proj.user_id ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectListPage;
