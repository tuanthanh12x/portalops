import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/admin/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Popup from './../../components/client/Popup';

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignPopup, setShowAssignPopup] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [popup, setPopUp] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axiosInstance.get("/project/projects/list/");
                const data = res.data || [];
                setProjects(data);
                setFilteredProjects(data);
            } catch (err) {
                console.error("❌ Failed to fetch projects:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get("/auth/ausers-list/");
                setAllUsers(res.data || []);
                setFilteredUsers(res.data || []);
            } catch (err) {
                console.error("❌ Failed to fetch users:", err);
            }
        };
        fetchUsers();
    }, []);

    const handleAssign = async () => {
        try {
            await axiosInstance.post("/project/assign-user-to-project/", {
                project_id: selectedProjectId,
                user_id: selectedUserId,
            });
            alert("✅ User assigned successfully!");
            setShowAssignPopup(false);
        } catch (err) {
            console.error("❌ Assignment failed:", err);
            alert("❌ Failed to assign user.");
        }
    };

    const handleRowClick = (projectId) => {
        navigate(`/admin/project-detail/${projectId}`);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            <Navbar />

            <header className="container mx-auto px-6 pt-10 pb-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-4xl font-extrabold text-indigo-400 tracking-tight drop-shadow-lg">
                    🏗️ Project Overview
                </h1>
                <div className="flex gap-4">
                    <Link
                        to="/admin/create-project"
                        className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                    >
                        ➕ Create New Project
                    </Link>
                    <button
                        onClick={() => setShowAssignPopup(true)}
                        className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-600 text-white font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                    >
                        🔗 Assign User to Project
                    </button>
                </div>
            </header>

            <div className="container mx-auto max-w-7xl px-6 pb-12">
                <div className="bg-black/40 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 text-xs uppercase tracking-wider">
                            <tr>
                                {["Name", "OpenStack ID", "Package", "User", "Status"].map((title) => (
                                    <th key={title} className="px-6 py-4 text-left font-semibold">
                                        {title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
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
                                    <tr
                                        key={proj.project_id}
                                        onClick={() => handleRowClick(proj.openstack_id)}
                                        className="hover:bg-white/5 hover:backdrop-blur-sm transition duration-200 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-indigo-300">
                                            {proj.project_name}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 break-all">
                                            {proj.openstack_id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {proj.project_type?.name ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {proj.username ?? "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${proj.status === "active"
                                                    ? "bg-green-600/20 text-green-400"
                                                    : proj.status === "disabled"
                                                        ? "bg-red-600/20 text-red-400"
                                                        : "bg-gray-500/20 text-gray-300"
                                                    }`}
                                            >
                                                {proj.status ?? "—"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup for assigning user */}
            {showAssignPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md text-white border border-gray-700 shadow-2xl">
                        <h2 className="text-xl font-semibold mb-4 text-indigo-400">Assign User to Project</h2>

                        <div className="mb-4">
                            <label className="block text-sm mb-1">Search Project by OpenStack ID</label>
                            <input
                                type="text"
                                placeholder="Type OpenStack Project ID..."
                                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-2"
                                onChange={(e) => {
                                    const keyword = e.target.value.toLowerCase();
                                    const filtered = projects.filter((proj) =>
                                        proj.openstack_id.toLowerCase().includes(keyword)
                                    );
                                    setFilteredProjects(filtered);
                                }}
                            />
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                            >
                                <option value="">-- Choose Project --</option>
                                {filteredProjects.map((proj) => (
                                    <option key={proj.project_id} value={proj.project_id}>
                                        {proj.openstack_id} - {proj.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm mb-1">Search User</label>
                            <input
                                type="text"
                                placeholder="Type username"
                                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-2"
                                onChange={(e) => {
                                    const keyword = e.target.value.toLowerCase();
                                    const filtered = allUsers.filter(
                                        (u) =>
                                            u.username.toLowerCase().includes(keyword) ||
                                            (u.email && u.email.toLowerCase().includes(keyword))
                                    );
                                    setFilteredUsers(filtered);
                                }}
                            />
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                            >
                                <option value="">-- Choose User --</option>
                                {filteredUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowAssignPopup(false)}
                                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-semibold"
                                disabled={!selectedUserId || !selectedProjectId}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProjectListPage;
