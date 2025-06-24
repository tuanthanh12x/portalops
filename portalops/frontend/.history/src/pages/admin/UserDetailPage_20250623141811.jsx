// ...imports
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

    const setTokenWithExpiry = (key, token, ttl = 3600000) => {
        const now = new Date();
        const item = {
            token,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    };

    const impersonateUser = async () => {
        if (!user?.project_id) {
            alert("This user has no associated project. Cannot impersonate.");
            return;
        }

        try {
            const res = await axiosInstance.post("/auth/impersonate-usertoken/", { id: user.id });
            setTokenWithExpiry('accessToken', res.data.access);
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Impersonation failed:", err?.response?.data || err);
            alert("Impersonation failed. Please ensure this user has a valid project and try again.");
        }
    };

    if (!user) return <div className="text-white p-8">Loading user details...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            <AdminNavbar />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white/10 rounded-2xl shadow-2xl p-8 space-y-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-4xl font-extrabold text-green-400 tracking-wide">User Details</h2>
                        <div className="text-sm text-gray-300">User ID: {user.id}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-base">
                        <Card title="Basic Info">
                            <Info label="Username" value={user.username} />
                            <Info label="Email" value={user.email} />
                            <Info label="Project ID" value={user.project_id} />
                            <Info label="Joined" value={new Date(user.date_joined).toLocaleDateString()} />
                            <Info label="Status" value={user.is_active ? "Active" : "Suspended"} valueClass={user.is_active ? "text-green-400" : "text-red-400"} />
                            <div className="flex flex-wrap gap-2 mt-4">
                                <ActionBtn color="indigo" label="Edit" />
                                <ActionBtn color="yellow" label="Reset Pass" />
                                <ActionBtn color="red" label="Suspend" />
                                <ActionBtn color="gray" label="Delete" />
                                <ActionBtn color="green" label="Impersonate" onClick={impersonateUser} />
                            </div>
                        </Card>

                        <Card title="Resources">
                            <Info label="VMs" value={user.resource_summary?.vms} />
                            <Info label="Storage" value={`${user.resource_summary?.storage} GB`} />
                            <Info label="Floating IPs" value={user.resource_summary?.floating_ips} />
                            <Info label="Snapshots" value={user.resource_summary?.snapshots} />
                            <div className="mt-4">
                                <ActionBtn color="indigo" label="View Resources" />
                            </div>
                        </Card>

                        <Card title="Billing">
                            <Info label="Balance" value={`$${user.billing?.balance}`} />
                            <Info label="Last Payment" value={user.billing?.last_payment_date} />
                            <Info label="Due Date" value={user.billing?.due_date} />
                            <Info label="Plan" value={user.billing?.plan_name} />
                            <Info label="Usage" value={`$${user.billing?.current_usage}`} />
                            <div className="flex gap-2 mt-4">
                                <ActionBtn color="indigo" label="View Billing" />
                                <ActionBtn color="green" label="Adjust Credit" />
                            </div>
                        </Card>
                    </div>

                    {/* 🔽 Recent Activity Section */}
                    <RecentActions />
                </div>
            </div>
        </div>
    );
}

// Reusable components
function Card({ title, children }) {
    return (
        <div className="bg-white/5 rounded-xl p-5 shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-indigo-400 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function Info({ label, value, valueClass = "text-white/90" }) {
    return (
        <p className="mb-2">
            <span className="font-medium text-white/70">{label}:</span>{" "}
            <span className={`ml-1 font-semibold ${valueClass}`}>{value ?? "—"}</span>
        </p>
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

// 🔽 Mocked Recent Activity Component
function RecentActions() {
    const mockActions = [
        { type: "Login", timestamp: "2025-06-23 08:31", description: "User logged in from IP 192.168.1.12" },
        { type: "Create VM", timestamp: "2025-06-22 17:45", description: "Created VM `web-server-001`" },
        { type: "Update Password", timestamp: "2025-06-21 14:10", description: "Password was updated successfully" },
        { type: "Add Floating IP", timestamp: "2025-06-20 10:25", description: "Associated floating IP 103.56.22.55" },
    ];

    const tagColors = {
        Login: "bg-green-600",
        "Create VM": "bg-indigo-500",
        "Update Password": "bg-yellow-500 text-black",
        "Add Floating IP": "bg-cyan-500",
    };

    return (
        <div className="mt-10">
            <h3 className="text-2xl font-semibold text-white/90 mb-4">Recent Activity</h3>
            <div className="space-y-3">
                {mockActions.map((action, index) => (
                    <div key={index} className="bg-white/5 rounded-md px-4 py-3 flex items-start justify-between hover:bg-white/10 transition">
                        <div>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${tagColors[action.type] || "bg-white/20"}`}>
                                {action.type}
                            </span>
                            <p className="mt-1 text-sm text-white/90">{action.description}</p>
                        </div>
                        <div className="text-xs text-white/50">{action.timestamp}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
