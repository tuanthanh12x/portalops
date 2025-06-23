import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AdminNavbar from '../../components/admin/Navbar';

export default function AdminUserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');

    useEffect(() => {
        axiosInstance.get(`auth/admin/users/${id}/`)
            .then(res => setUser(res.data))
            .catch(err => console.error("Failed to load user", err));
    }, [id]);

    const setTokenWithExpiry = (key, token, ttl = 3600000) => {
        const now = new Date();
        const item = { token, expiry: now.getTime() + ttl };
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

    const handleAction = (action) => {
        setModalAction(action);
        setShowModal(true);
    };

    const confirmAction = () => {
        if (modalAction === 'Suspend') {
            alert(`User ${user.username} has been suspended.`);
        } else if (modalAction === 'Delete') {
            alert(`User ${user.username} has been deleted.`);
        }
        setShowModal(false);
    };

    if (!user) return <div className="text-white p-8">Loading user details...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            <AdminNavbar />
            <div className="flex max-w-7xl mx-auto px-4 py-8">
                {/* Sidebar */}
                <div className="hidden lg:block w-64 mr-8">
                    <div className="sticky top-20 bg-white/5 rounded-xl p-4 shadow-lg">
                        <h3 className="text-lg font-bold text-indigo-400 mb-4">Navigation</h3>
                        <nav className="space-y-2">
                            {['Overview', 'Resources', 'Billing', 'Projects', 'Activity'].map(section => (
                                <a key={section} href={`#${section.toLowerCase()}`} className="block px-4 py-2 rounded-lg hover:bg-indigo-600/20 text-gray-300 hover:text-white transition">
                                    {section}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center" id="overview">
                        <h2 className="text-4xl font-extrabold text-indigo-400 tracking-wide">User: {user.username}</h2>
                        <div className="text-sm text-gray-400">User ID: {user.id}</div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <Card title="Basic Info">
                            <Info label="Username" value={user.username} />
                            <Info label="Email" value={user.email} />
                            <Info label="Joined" value={new Date(user.date_joined).toLocaleDateString()} />
                            <Info label="Status" value={user.is_active ? "Active" : "Suspended"} valueClass={user.is_active ? "text-green-400" : "text-red-400"} />
                            <div className="flex flex-wrap gap-2 mt-6">
                                <ActionBtn color="indigo" label="Edit" />
                                <ActionBtn color="yellow" label="Reset Pass" />
                                <ActionBtn color="red" label="Suspend" onClick={() => handleAction('Suspend')} />
                                <ActionBtn color="gray" label="Delete" onClick={() => handleAction('Delete')} />
                                <ActionBtn color="green" label="Impersonate" onClick={impersonateUser} />
                            </div>
                        </Card>

                        {/* Resources */}
                        <Card title="Resources" id="resources">
                            <Info label="VMs" value={user.resource_summary?.vms ?? 0} />
                            <Info label="Storage" value={`${user.resource_summary?.storage ?? 0} GB`} />
                            <Info label="Floating IPs" value={user.resource_summary?.floating_ips ?? 0} />
                            <Info label="Snapshots" value={user.resource_summary?.snapshots ?? 0} />
                            <div className="mt-6">
                                <ActionBtn color="indigo" label="View Resources" />
                            </div>
                        </Card>

                        {/* Billing */}
                        <Card title="Billing" id="billing">
                            <Info label="Balance" value={`$${user.billing?.balance ?? 0}`} />
                            <Info label="Last Payment" value={user.billing?.last_payment_date ?? "N/A"} />
                            <Info label="Due Date" value={user.billing?.due_date ?? "N/A"} />
                            <Info label="Plan" value={user.billing?.plan_name ?? "None"} />
                            <Info label="Usage" value={`$${user.billing?.current_usage ?? 0}`} />
                            <div className="flex gap-2 mt-6">
                                <ActionBtn color="indigo" label="View Billing" />
                                <ActionBtn color="green" label="Adjust Credit" />
                            </div>
                        </Card>

                        {/* Project Details */}
                        <Card title="Project Details" id="projects">
                            <Info label="Project ID" value={user.project_id ?? "N/A"} />
                            <Info label="Project Name" value={user.project_name ?? "None"} />
                            <Info label="Created" value={user.project_created ? new Date(user.project_created).toLocaleDateString() : "N/A"} />
                            <Info label="Members" value={user.project_members?.length ?? 0} />
                            <div className="mt-6">
                                <ActionBtn color="indigo" label="View Project" />
                            </div>
                        </Card>

                        {/* Recent Activity */}
                        <Card title="Recent Activity" id="activity" className="md:col-span-2 lg:col-span-3">
                            <div className="space-y-4">
                                {(user.recent_activity || []).slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                                        <div>
                                            <p className="font-medium text-white/90">{activity.action}</p>
                                            <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                                        </div>
                                        <span className="text-sm text-indigo-400">{activity.status}</span>
                                    </div>
                                ))}
                                <ActionBtn color="indigo" label="View All Activity" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm {modalAction}</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to {modalAction.toLowerCase()} user {user.username}?</p>
                        <div className="flex justify-end gap-2">
                            <ActionBtn color="gray" label="Cancel" onClick={() => setShowModal(false)} />
                            <ActionBtn color="red" label="Confirm" onClick={confirmAction} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Card({ title, children, className = '', id }) {
    return (
        <div id={id} className={`bg-white/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
            <h3 className="text-xl font-bold text-indigo-400 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function Info({ label, value, valueClass = "text-white/90" }) {
    return (
        <p className="mb-3 flex items-center">
            <span className="font-medium text-white/70 w-24">{label}:</span>
            <span className={`font-semibold ${valueClass}`}>{value ?? "—"}</span>
        </p>
    );
}

function ActionBtn({ label, color, onClick }) {
    const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105";
    const colors = {
        indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
        yellow: "bg-yellow-500 hover:bg-yellow-600 text-black",
        red: "bg-red-600 hover:bg-red-700 text-white",
        gray: "bg-gray-600 hover:bg-gray-700 text-white",
        green: "bg-green-600 hover:bg-green-700 text-white",
    };
    return (
        <button onClick={onClick} className={`${base} ${colors[color] || "bg-white/20 hover:bg-white/30 text-white"}`}>
            {label}
        </button>
    );
}