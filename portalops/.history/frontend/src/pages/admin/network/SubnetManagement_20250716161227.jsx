import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import hook để điều hướng
import Header from '../../../components/admin/Navbar';
import axiosInstance from "../../../api/axiosInstance";
import SubnetDetailModal from './SubnetDetailModal';
// Button Component
function Button({ variant = "default", children, className = "", ...props }) {
    const base = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
    const variants = {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
        success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg",
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// Card Component
function Card({ children, className = "" }) {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}



// Input Component

// Select Component
function Select({ label, value, onChange, options, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={required}
            >
                <option value="">Select {label}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
export function Tabs({ defaultValue, children }) {
    const [active, setActive] = useState(defaultValue);
    return (
        <div>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { active, setActive })
            )}
        </div>
    );
}

export function TabsList({ children }) {
    return (
        <div className="flex border-b border-gray-700 mb-8 space-x-0 overflow-x-auto">
            {children}
        </div>
    );
}

// TabsTrigger đã được sửa để chấp nhận prop 'onClick' cho việc điều hướng
export function TabsTrigger({ value, active, setActive, children, onClick }) {
    const isActive = active === value;

    const handleClick = () => {
        // Nếu có hàm onClick tùy chỉnh (để điều hướng), thì gọi nó
        if (onClick) {
            onClick();
        } else {
            // Nếu không, chỉ cập nhật state như bình thường
            setActive(value);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${isActive
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                }`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, active, children }) {
    return active === value ? <div className="animate-in fade-in duration-300">{children}</div> : null;
}
// Main Subnet Management Component
export default function SubnetManagement() {
    const [subnets, setSubnets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedSubnet, setSelectedSubnet] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        network_id: '',
        cidr: '',
        ip_version: '4',
        gateway_ip: '',
        enable_dhcp: true,
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('openstack/network/subnet-list/');
                const data = response.data.map((subnet) => ({
                    ...subnet,
                    network_name: 'Unknown', // Placeholder until real name is fetched from backend
                    status: 'active',        // Default status
                    description: ''          // Optional if not used in UI
                }));
                setSubnets(data);
            } catch (error) {
                console.error("Failed to fetch subnets:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <Header />
            <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-lg">
                <div className="px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🔗</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    Subnet Management
                                </h1>
                                <p className="text-gray-400 mt-1">Configure and manage network subnets</p>
                            </div>
                        </div>
                        <Button >
                            <span>+</span>
                            Create Subnet
                        </Button>
                    </div>
                </div>
            </header>

            <div className="px-6 lg:px-8 py-8">
                <TabsList>
                    <TabsTrigger value="networks" onClick={() => navigate('/admin/network')}>📡 Networks</TabsTrigger>
                    <TabsTrigger value="subnets" onClick={() => navigate('/admin/subnet')}>🔗 Subnets</TabsTrigger>
                    <TabsTrigger value="ports" onClick={() => navigate('/admin/route')}>🔌 Routes</TabsTrigger>
                    <TabsTrigger value="security" onClick={() => navigate('/admin/security-group')}>🛡️ Security Groups</TabsTrigger>
                </TabsList>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    {["Subnet Name", "CIDR", "Gateway", "DHCP", "Actions"].map((label, idx) => (
                                        <th key={idx} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                                <span className="text-gray-400">Loading subnets...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : subnets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="text-gray-500">
                                                <div className="text-4xl mb-4">🔗</div>
                                                <p className="font-medium">No subnets found</p>
                                                <p className="text-sm text-gray-600 mt-1">Create your first subnet to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subnets.map((subnet) => (
                                        <tr key={subnet.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-green-400 text-sm">🔗</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-200">{subnet.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                                                    {subnet.cidr}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm text-gray-300">{subnet.gateway_ip}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${subnet.enable_dhcp
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {subnet.enable_dhcp ? '● Enabled' : '○ Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <button
                                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                                        onClick={() => setSelectedSubnet(subnet)}
                                                    >
                                                        View
                                                    </button>
                                                    <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
                {selectedSubnet && (
    <SubnetDetailModal subnet={selectedSubnet} onClose={() => setSelectedSubnet(null)} />
)}
        </div>
    );


}
