import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Button Component
function Button({ variant = "default", children, className = "", ...props }) {
    const base = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
    const variants = {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
        success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg",
        info: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg",
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

function CardContent({ children }) {
    return <div className="space-y-3">{children}</div>;
}

function CardTitle({ children, icon }) {
    return (
        <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-lg font-semibold text-gray-100">{children}</h3>
        </div>
    );
}

// Modal Component
function Modal({ isOpen, onClose, title, children, size = "md" }) {
    if (!isOpen) return null;

    const sizeClasses = {
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`bg-gray-800 border border-gray-700 rounded-2xl p-6 ${sizeClasses[size]} w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
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

export function TabsContent({ value, active, children }) {
    return active === value ? <div className="animate-in fade-in duration-300">{children}</div> : null;
}

// Subnet Details Component
function SubnetDetails({ subnet, onClose }) {
    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-blue-400">📋</span>
                    Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Subnet ID</label>
                        <code className="text-sm bg-gray-900/50 px-3 py-2 rounded block text-gray-300">
                            {subnet.id}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Project ID</label>
                        <code className="text-sm bg-gray-900/50 px-3 py-2 rounded block text-gray-300">
                            {subnet.project_id}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Network ID</label>
                        <code className="text-sm bg-gray-900/50 px-3 py-2 rounded block text-gray-300">
                            {subnet.network_id}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">IP Version</label>
                        <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            IPv{subnet.ip_version}
                        </span>
                    </div>
                </div>
            </div>

            {/* Network Configuration */}
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-green-400">🌐</span>
                    Network Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">CIDR</label>
                        <code className="text-sm bg-gray-900/50 px-3 py-2 rounded block text-gray-300">
                            {subnet.cidr}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Gateway IP</label>
                        <code className="text-sm bg-gray-900/50 px-3 py-2 rounded block text-gray-300">
                            {subnet.gateway_ip}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">DHCP Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            subnet.enable_dhcp 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                        }`}>
                            {subnet.enable_dhcp ? '● Enabled' : '○ Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Allocation Pools */}
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-purple-400">🏊</span>
                    Allocation Pools
                </h4>
                <div className="space-y-2">
                    {subnet.allocation_pools && subnet.allocation_pools.length > 0 ? (
                        subnet.allocation_pools.map((pool, index) => (
                            <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-400">Start: </span>
                                        <code className="text-sm text-gray-300">{pool.start}</code>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-400">End: </span>
                                        <code className="text-sm text-gray-300">{pool.end}</code>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No allocation pools configured</div>
                    )}
                </div>
            </div>

            {/* DNS Nameservers */}
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-cyan-400">🔍</span>
                    DNS Nameservers
                </h4>
                <div className="space-y-2">
                    {subnet.dns_nameservers && subnet.dns_nameservers.length > 0 ? (
                        subnet.dns_nameservers.map((dns, index) => (
                            <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                                <code className="text-sm text-gray-300">{dns}</code>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No DNS nameservers configured</div>
                    )}
                </div>
            </div>

            {/* Host Routes */}
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-orange-400">🛣️</span>
                    Host Routes
                </h4>
                <div className="space-y-2">
                    {subnet.host_routes && subnet.host_routes.length > 0 ? (
                        subnet.host_routes.map((route, index) => (
                            <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-400">Destination: </span>
                                        <code className="text-sm text-gray-300">{route.destination}</code>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-400">Next Hop: </span>
                                        <code className="text-sm text-gray-300">{route.nexthop}</code>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No host routes configured</div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onClose} variant="secondary">
                    Close
                </Button>
            </div>
        </div>
    );
}

// Main Subnet Management Component
export default function SubnetManagement() {
    const [subnets, setSubnets] = useState([]);
    const [networks, setNetworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubnet, setSelectedSubnet] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        network_id: '',
        cidr: '',
        ip_version: '4',
        gateway_ip: '',
        enable_dhcp: true,
        description: ''
    });

    // Fetch subnets from API
    const fetchSubnets = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://108.171.195.159:8000/api/openstack/network/subnet-list/');
            if (!response.ok) throw new Error('Failed to fetch subnets');
            const data = await response.json();
            setSubnets(data);
        } catch (error) {
            console.error('Error fetching subnets:', error);
            // Fallback to mock data if API fails
            const mockSubnets = [
                {
                    id: "subnet-001",
                    name: "Production Subnet",
                    network_id: "net-001",
                    cidr: "10.0.1.0/24",
                    ip_version: 4,
                    gateway_ip: "10.0.1.1",
                    enable_dhcp: true,
                    allocation_pools: [{ start: "10.0.1.10", end: "10.0.1.250" }],
                    dns_nameservers: ["8.8.8.8", "8.8.4.4"],
                    host_routes: [],
                    project_id: "project-001"
                }
            ];
            setSubnets(mockSubnets);
        } finally {
            setLoading(false);
        }
    };

    // Mock networks data
    useEffect(() => {
        const mockNetworks = [
            { id: "net-001", name: "Production Network" },
            { id: "net-002", name: "Development Network" },
            { id: "net-003", name: "Testing Network" }
        ];
        setNetworks(mockNetworks);
        fetchSubnets();
    }, []);

    const handleViewDetails = (subnet) => {
        setSelectedSubnet(subnet);
        setIsDetailModalOpen(true);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateSubnet = () => {
        if (!formData.name || !formData.network_id || !formData.cidr) {
            alert('Please fill in all required fields');
            return;
        }
        const newSubnet = {
            id: `subnet-${Date.now()}`,
            ...formData,
            network_name: networks.find(n => n.id === formData.network_id)?.name || '',
            status: 'active',
            allocation_pools: [{ start: '', end: '' }],
            dns_nameservers: [],
            host_routes: [],
            project_id: 'default-project'
        };

        setSubnets([...subnets, newSubnet]);
        setIsCreateModalOpen(false);
        setFormData({
            name: '',
            network_id: '',
            cidr: '',
            ip_version: '4',
            gateway_ip: '',
            enable_dhcp: true,
            description: ''
        });
    };

    const handleEditSubnet = (subnet) => {
        setSelectedSubnet(subnet);
        setFormData({
            name: subnet.name,
            network_id: subnet.network_id,
            cidr: subnet.cidr,
            ip_version: subnet.ip_version.toString(),
            gateway_ip: subnet.gateway_ip,
            enable_dhcp: subnet.enable_dhcp,
            description: subnet.description || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubnet = () => {
        if (!formData.name || !formData.network_id || !formData.cidr) {
            alert('Please fill in all required fields');
            return;
        }
        const updatedSubnets = subnets.map(subnet =>
            subnet.id === selectedSubnet.id
                ? {
                    ...subnet,
                    ...formData,
                    network_name: networks.find(n => n.id === formData.network_id)?.name || subnet.network_name
                }
                : subnet
        );

        setSubnets(updatedSubnets);
        setIsEditModalOpen(false);
        setSelectedSubnet(null);
    };

    const handleDeleteSubnet = (subnetId) => {
        if (window.confirm('Are you sure you want to delete this subnet?')) {
            setSubnets(subnets.filter(subnet => subnet.id !== subnetId));
        }
    };

    const networkOptions = networks.map(net => ({
        value: net.id,
        label: net.name
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <span>+</span>
                            Create Subnet
                        </Button>
                    </div>
                </div>
            </header>

            <div className="px-6 lg:px-8 py-8">
                <TabsList>
                    <TabsTrigger value="networks" onClick={() => navigate('/admin/network')}>
                        📡 Networks
                    </TabsTrigger>
                    <TabsTrigger value="subnets" onClick={() => navigate('/admin/subnet')}>
                        🔗 Subnets
                    </TabsTrigger>
                    <TabsTrigger value="ports" onClick={() => navigate('/admin/route')}>
                        🔌 Routes
                    </TabsTrigger>
                    <TabsTrigger value="security" onClick={() => navigate('/admin/security-group')}>
                        🛡️ Security Groups
                    </TabsTrigger>
                </TabsList>

                {/* Subnets Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    {[
                                        { key: 'name', label: 'Subnet Name' },
                                        { key: 'cidr', label: 'CIDR' },
                                        { key: 'gateway', label: 'Gateway' },
                                        { key: 'ip_version', label: 'IP Version' },
                                        { key: 'dhcp', label: 'DHCP' },
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
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                                <span className="text-gray-400">Loading subnets...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : subnets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
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
                                                        <p className="text-xs text-gray-400 mt-1">{subnet.id}</p>
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
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                                                    IPv{subnet.ip_version}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    subnet.enable_dhcp 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {subnet.enable_dhcp ? '● Enabled' : '○ Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleViewDetails(subnet)}
                                                        variant="info"
                                                        className="text-xs px-3 py-1"
                                                    >
                                                        <span>👁️</span>
                                                        Details
                                                    </Button>
                                                    <button 
                                                        onClick={() => handleEditSubnet(subnet)}
                                                        className="text-blue-400 hover:text-blue-300 text-sm px-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteSubnet(subnet.id)}
                                                        className="text-red-400 hover:text-red-300 text-sm px-2"
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

            {/* Subnet Details Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Subnet Details - ${selectedSubnet?.name}`}
                size="xl"
            >
                {selectedSubnet && (
                    <SubnetDetails 
                        subnet={selectedSubnet} 
                        onClose={() => setIsDetailModalOpen(false)}
                    />
                )}
            </Modal>

            {/* Create Subnet Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Subnet"
            >
                <div className="space-y-4">
                    <Input
                        label="Subnet Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter subnet name"
                        required
                    />

                    <Select
                        label="Network"
                        value={formData.network_id}
                        onChange={(e) => handleInputChange('network_id', e.target.value)}
                        options={networkOptions}
                        required
                    />

                    <Input
                        label="CIDR"
                        value={formData.cidr}
                        onChange={(e) => handleInputChange('cidr', e.target.value)}
                        placeholder="e.g., 10.0.1.0/24"
                        required
                    />

                    <Input
                        label="Gateway IP"
                        value={formData.gateway_ip}
                        onChange={(e) => handleInputChange('gateway_ip', e.target.value)}
                        placeholder="e.g., 10.0.1.1"
                    />

                    <Select
                        label="IP Version"
                        value={formData.ip_version}
                        onChange={(e) => handleInputChange('ip_version', e.target.value)}
                        options={[
                            { value: '4', label: 'IPv4' },
                            { value: '6', label: 'IPv6' }
                        ]}
                        required
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="enable_dhcp"
                            checked={formData.enable_dhcp}
                            onChange={(e) => handleInputChange('enable_dhcp', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="enable_dhcp" className="text-sm text-gray-300">
                            Enable DHCP
                        </label>
                    </div>

                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Optional description"
                    />

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleCreateSubnet} variant="success">
                            Create Subnet
                        </Button>
                        <Button
                            onClick={() => setIsCreateModalOpen(false)}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Subnet Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Subnet"
            >
                <div className="space-y