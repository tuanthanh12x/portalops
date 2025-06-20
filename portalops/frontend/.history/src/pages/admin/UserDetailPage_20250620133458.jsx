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

    const setTokenWithExpiry = (token, ttl = 3600000) => {
        const now = new Date();
        const item = {
            token,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem("accessToken", JSON.stringify(item));
    };

    const impersonateUser = async () => {
        if (!user?.project_id) {
            alert("This user has no associated project. Cannot impersonate.");
            return;
        }

        try {
            const res = await axiosInstance.post("/auth/impersonate-usertoken/", {
                user_id: user.id,
                project_id: user.project_id,
            });

            const { access_token } = res.data.access_token;
            setTokenWithExpiry( access_token);


            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Impersonation failed:", err?.response?.data || err);
            alert("Impersonation failed. Please ensure this user has a valid project and try again.");
        }
    };

    if (!user) return <div className="text-white p-8">Loading user details...</div>;

    return (
        <div className="min-h-screen bg-black/30 backdrop-blur-lg text-white">
            <AdminNavbar />
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="bg-white/10 rounded-2xl shadow-2xl p-8 space-y-8">
                    <h2 className="text-3xl font-bold text-green-400 tracking-wide border-b border-white/20 pb-4">
                        User Overview
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                        {/* BASIC INFO */}
                        <div className="bg-white/5 rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Basic Info</h3>
                            <p><span className="font-semibold text-white/80">ID:</span> {user.id}</p>
                            <p><span className="font-semibold text-white/80">Username:</span> {user.username}</p>
                            <p><span className="font-semibold text-white/80">Email:</span> {user.email}</p>
                            <p><span className="font-semibold text-white/80">Created:</span> {new Date(user.date_joined).toLocaleDateString()}</p>
                            <p><span className="font-semibold text-white/80">Status:</span>
                                <span className={`ml-1 font-bold ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                    {user.is_active ? 'Active' : 'Suspended'}
                                </span>
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <ActionBtn color="indigo" label="Edit" />
                                <ActionBtn color="yellow" label="Reset Pass" />
                                <ActionBtn color="red" label="Suspend" />
                                <ActionBtn color="gray" label="Delete" />
                                <ActionBtn color="green" label="Go to Dashboard" onClick={impersonateUser} />
                            </div>
                        </div>

                        {/* RESOURCES */}
                        <div className="bg-white/5 rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Resources</h3>
                            <p><span className="font-semibold text-white/80">VMs:</span> {user.resource_summary?.vms}</p>
                            <p><span className="font-semibold text-white/80">Storage:</span> {user.resource_summary?.storage} GB</p>
                            <p><span className="font-semibold text-white/80">Floating IPs:</span> {user.resource_summary?.floating_ips}</p>
                            <p><span className="font-semibold text-white/80">Snapshots:</span> {user.resource_summary?.snapshots}</p>

                            <div className="mt-4">
                                <ActionBtn color="indigo" label="View Details" />
                            </div>
                        </div>

                        {/* BILLING */}
                        <div className="bg-white/5 rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Billing</h3>
                            <p><span className="font-semibold text-white/80">Balance:</span> ${user.billing?.balance}</p>
                            <p><span className="font-semibold text-white/80">Last Payment:</span> {user.billing?.last_payment_date}</p>
                            <p><span className="font-semibold text-white/80">Due Date:</span> {user.billing?.due_date}</p>
                            <p><span className="font-semibold text-white/80">Plan:</span> {user.billing?.plan_name}</p>
                            <p><span className="font-semibold text-white/80">Usage This Month:</span> ${user.billing?.current_usage}</p>

                            <div className="flex gap-2 mt-4">
                                <ActionBtn color="indigo" label="View History" />
                                <ActionBtn color="green" label="Adjust Credits" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionBtn({ label, color, onClick }) {
    const base = "px-3 py-1 rounded font-medium text-sm transition";
    const colors = {
        indigo: "bg-indigo-500 hover:bg-indigo-600",
        yellow: "bg-yellow-500 hover:bg-yellow-600 text-black",
        red: "bg-red-500 hover:bg-red-600",
        gray: "bg-gray-600 hover:bg-gray-700",
        green: "bg-green-600 hover:bg-green-700",
    };
    return (
        <button onClick={onClick} className={`${base} ${colors[color] || "bg-white/20 hover:bg-white/30"}`}>
            {label}
        </button>
    );
}
