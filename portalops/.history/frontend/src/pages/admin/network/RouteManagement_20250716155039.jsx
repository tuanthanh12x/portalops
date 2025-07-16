import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../../../components/admin/Navbar';

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

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 text-xl"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// Input Component
function Input({ label, type = "text", value, onChange, placeholder, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={required}
            />
        </div>
    );
}

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

// Tabs Components
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

export function TabsTrigger({ value, active, setActive, children, onClick }) {
    const isActive = active === value;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
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

// Main Route Management Component
export default function RouteManagement() {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [routers, setRouters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        router_id: '',
        destination_cidr: '',
        next_hop: '',
        description: ''
    });

    // Mock data for demonstration
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Mock routers data
            const mockRouters = [
                { id: "router-001", name: "Main Router" },
                { id: "router-002", name: "External Router" },
                { id: "router-003", name: "Internal Router" }
            ];

            // Mock routes data
            const mockRoutes = [
                {
                    id: "route-001",
                    name: "Default Route",
                    router_id: "router-001",
                    router_name: "Main Router",
                    destination_cidr: "0.0.0.0/0",
                    next_hop: "192.168.1.1",
                    status: "active",
                    description: "Default gateway route"
                },
                {
                    id: "route-002",
                    name: "Internal Route",
                    router_id: "router-001",
                    router_name: "Main Router",
                    destination_cidr: "10.0.0.0/8",
                    next_hop: "10.0.1.1",
                    status: "active",
                    description: "Internal network routing"
                },
                {
                    id: "route-003",
                    name: "DMZ Route",
                    router_id: "router-002",
                    router_name: "External Router",
                    destination_cidr: "172.16.0.0/12",
                    next_hop: "172.16.1.1",
                    status: "inactive",
                    description: "DMZ network access"
                },
                {
                    id: "route-004",
                    name: "Private Route",
                    router_id: "router-003",
                    router_name: "Internal Router",
                    destination_cidr: "192.168.0.0/16",
                    next_hop: "192.168.1.254",
                    status: "active",
                    description: "Private network routing"
                }
            ];

            setTimeout(() => {
                setRouters(mockRouters);
                setRoutes(mockRoutes);
                setLoading(false);
            }, 1000);
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
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🔌</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                    Route Management
                                </h1>
                                <p className="text-gray-400 mt-1">Configure and manage network routes</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <span>+</span>
                            Create Route
                        </Button>
                    </div>
                </div>
            </header>

            <div className="px-6 lg:px-8 py-8">
                <TabsList>
                    <TabsTrigger
                        value="networks"
                        onClick={() => navigate('/admin/network')}
                    >
                        📡 Networks
                    </TabsTrigger>
                    
                    <TabsTrigger
                        value="subnets"
                        onClick={() => navigate('/admin/subnet')}
                    >
                        🔗 Subnets
                    </TabsTrigger>
                    
                    <TabsTrigger
                        value="routes"
                        onClick={() => navigate('/admin/route')}
                    >
                        🔌 Routes
                    </TabsTrigger>
                    
                    <TabsTrigger
                        value="security"
                        onClick={() => navigate('/admin/security-group')}
                    >
                        🛡️ Security Groups
                    </TabsTrigger>
                </TabsList>

                {/* Routes Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    {[
                                        { key: 'name', label: 'Route Name' },
                                        { key: 'router', label: 'Router' },
                                        { key: 'destination', label: 'Destination CIDR' },
                                        { key: 'next_hop', label: 'Next Hop' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'actions', label: 'Actions' }
                                    ].map(header => (
                                        <th key={header.key} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {header.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                                                <span className="text-gray-400">Loading routes...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : routes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="text-gray-500">
                                                <div className="text-4xl mb-4">🔌</div>
                                                <p className="font-medium">No routes found</p>
                                                <p className="text-sm text-gray-600 mt-1">Create your first route to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    routes.map((route) => (
                                        <tr key={route.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-purple-400 text-sm">🔌</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-200">{route.name}</span>
                                                        {route.description && (
                                                            <p className="text-xs text-gray-400 mt-1">{route.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                                                    {route.router_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                                                    {route.destination_cidr}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm text-gray-300">{route.next_hop}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    route.status === 'active' 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {route.status === 'active' ? '● Active' : '○ Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button 
         
                                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                             
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Delete
                                                    </button>
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

   
           
        </div>
    );
}