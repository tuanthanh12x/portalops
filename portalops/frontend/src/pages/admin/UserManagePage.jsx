import React, { useState, useEffect } from "react";
import Header from '../../components/admin/Navbar';
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    axiosInstance.get("/auth/users-list/")
      .then((res) => {
        const enhancedUsers = res.data.map(user => ({
          ...user,
          resources: `${user.vm_count} VM${user.vm_count !== 1 ? "s" : ""}`,
          credits: `$${parseFloat(user.credits || 0).toFixed(2)}`,
        }));
        setUsers(enhancedUsers);
      })
      .catch((err) => {
        console.error("Failed to fetch user list:", err);
      });
  }, []);

  const filteredUsers = users
    .filter(user => filter === "All" || user.status === filter)
    .filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <Header />

      <header className="container mx-auto max-w-7xl px-4 py-8 flex justify-between items-center">
        <h2 className="text-4xl font-bold text-green-400 tracking-wide drop-shadow-md">
          👥 User Management
        </h2>
        <div className="flex gap-3">
          <Link to="/create-user">
            <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md transition">
              + Add User
            </button>
          </Link>
          <button className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium shadow-md transition">
            Export List
          </button>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-2 rounded-md border border-gray-600 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="radio" checked={filter === "Active"} onChange={() => setFilter("Active")} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="radio" checked={filter === "Locked"} onChange={() => setFilter("Locked")} />
            Suspended
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="radio" checked={filter === "All"} onChange={() => setFilter("All")} />
            All
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl backdrop-blur-md bg-black/30 border border-gray-700 shadow-xl">
          <table className="min-w-full text-sm divide-y divide-gray-700">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Username</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Credits</th>
                <th className="px-6 py-4 text-left">Date Joined</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500 font-medium">
                    🚫 No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-900/30 transition">
                    <td className="px-6 py-4 font-medium">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className={`px-6 py-4 font-semibold ${user.status === "Active" ? "text-green-400" : "text-yellow-400"}`}>
                      {user.status}
                    </td>
                    <td className="px-6 py-4">{user.credits}</td>
                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/users/${user.user_id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow text-xs transition inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
