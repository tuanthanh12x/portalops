// src/pages/admin/AdminUserDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AdminNavbar from '../../components/admin/Navbar';

export default function AdminUserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        axiosInstance.get(`auth/admin/users/${id}/`)
            .then(res => setUser(res.data))
            .catch(err => console.error("Failed to load user", err));

    }, [id]);

    if (!user) return <div className="text-white p-8">Loading user details...</div>;

    return (
        <div className="min-h-screen bg-black/30 text-white backdrop-blur-lg p-6">
            <AdminNavbar />
            <div className="max-w-6xl mt-10 mx-auto bg-white/10 p-6 rounded-2xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4">USER DETAILS</h2>

                <div className="grid grid-cols-3 gap-6 text-sm">
                    {/* BASIC INFO */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-indigo-400">BASIC INFO</h3>
                        <p><span className="font-medium">ID:</span> {user.id}</p>
                        <p><span className="font-medium">Name:</span> {user.username}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Created:</span> {new Date(user.date_joined).toLocaleDateString()}</p>
                        <p><span className="font-medium">Status:</span> {user.is_active ? 'Active' : 'Suspended'}</p>

                        <div className="flex flex-wrap gap-2 pt-3">
                            <button className="px-3 py-1 bg-indigo-500 rounded hover:bg-indigo-600">Edit</button>
                            <button className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600">Reset Pass</button>
                            <button className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Suspend</button>
                            <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-800">Delete</button>
                        </div>
                    </div>

                    {/* RESOURCES */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-indigo-400">RESOURCES</h3>
                        <p><span className="font-medium">VMs:</span> {user.resource_summary?.vms}</p>
                        <p><span className="font-medium">Storage:</span> {user.resource_summary?.storage} GB</p>
                        <p><span className="font-medium">Floating IPs:</span> {user.resource_summary?.floating_ips}</p>
                        <p><span className="font-medium">Snapshots:</span> {user.resource_summary?.snapshots}</p>

                        <button className="mt-3 px-3 py-1 bg-indigo-400 rounded hover:bg-indigo-500">View Details</button>
                    </div>

                    {/* BILLING */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-indigo-400">BILLING</h3>
                        <p><span className="font-medium">Balance:</span> ${user.billing?.balance}</p>
                        <p><span className="font-medium">Last Payment:</span> {user.billing?.last_payment_date}</p>
                        <p><span className="font-medium">Due Date:</span> {user.billing?.due_date}</p>
                        <p><span className="font-medium">Plan:</span> {user.billing?.plan_name}</p>
                        <p><span className="font-medium">Usage this month:</span> ${user.billing?.current_usage}</p>

                        <div className="flex gap-2 pt-3">
                            <button className="px-3 py-1 bg-indigo-400 rounded hover:bg-indigo-500">View History</button>
                            <button className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Adjust Credits</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
