import React, { useState, useEffect } from "react";
import { Server, Database, HardDrive, Cpu, MemoryStick, Settings, Plus, Edit, Trash2, Eye, Package, CreditCard, Activity, Users, Shield, Clock } from "lucide-react";
import Navbar from "../../../components/client/Navbar";
// Mock data for OpenStack projects
const mockProjects = [
    {
        id: "proj-001",
        name: "Web Frontend",
        description: "Frontend application servers",
        status: "Active",
        created: "2024-01-15",
        package: "Standard",
        pricing: {
            monthly: 299,
            currency: "USD"
        },
        resources: {
            instances: 3,
            vcpus: 12,
            memory: "24 GB",
            storage: "500 GB",
            networks: 2,
            floatingIPs: 2
        },
        usage: {
            cpu: 65,
            memory: 78,
            storage: 45
        },
        region: "us-east-1"
    },
    {
        id: "proj-002", 
        name: "Database Cluster",
        description: "MySQL cluster for production",
        status: "Active",
        created: "2024-02-20",
        package: "Premium",
        pricing: {
            monthly: 599,
            currency: "USD"
        },
        resources: {
            instances: 5,
            vcpus: 20,
            memory: "80 GB", 
            storage: "2 TB",
            networks: 3,
            floatingIPs: 1
        },
        usage: {
            cpu: 45,
            memory: 82,
            storage: 67
        },
        region: "us-west-2"
    },
    {
        id: "proj-003",
        name: "Development Environment",
        description: "Development and testing environment",
        status: "Suspended",
        created: "2024-03-10",
        package: "Basic",
        pricing: {
            monthly: 99,
            currency: "USD"
        },
        resources: {
            instances: 1,
            vcpus: 4,
            memory: "8 GB",
            storage: "100 GB", 
            networks: 1,
            floatingIPs: 1
        },
        usage: {
            cpu: 25,
            memory: 35,
            storage: 28
        },
        region: "eu-central-1"
    }
];

const packageOptions = [
    { name: "Basic", price: 99, vcpus: 4, memory: "8 GB", storage: "100 GB", color: "bg-blue-500" },
    { name: "Standard", price: 299, vcpus: 12, memory: "24 GB", storage: "500 GB", color: "bg-purple-500" },
    { name: "Premium", price: 599, vcpus: 20, memory: "80 GB", storage: "2 TB", color: "bg-orange-500" },
    { name: "Enterprise", price: 1299, vcpus: 40, memory: "160 GB", storage: "5 TB", color: "bg-red-500" },
    
];

function ProjectCard({ project, onViewDetails, onChangePackage, onManage }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-green-500";
            case "Suspended": return "bg-yellow-500";
            case "Stopped": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getPackageColor = (packageName) => {
        const pkg = packageOptions.find(p => p.name === packageName);
        return pkg ? pkg.color : "bg-gray-500";
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-white`}>
                        {project.status}
                    </span>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => onViewDetails(project)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onManage(project)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Package Info */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPackageColor(project.package)} text-white`}>
                        {project.package}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">${project.pricing.monthly}</p>
                    <p className="text-sm text-gray-400">/month</p>
                </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">{project.resources.instances} Instances</span>
                </div>
                <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">{project.resources.vcpus} vCPUs</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">{project.resources.memory}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-300">{project.resources.storage}</span>
                </div>
            </div>

            {/* Usage Bars */}
            <div className="space-y-2 mb-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">CPU Usage</span>
                        <span className="text-xs text-gray-400">{project.usage.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.usage.cpu}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Memory Usage</span>
                        <span className="text-xs text-gray-400">{project.usage.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.usage.memory}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
                <button
                    onClick={() => onViewDetails(project)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    View Details
                </button>
                <button
                    onClick={() => onChangePackage(project)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    Change Package
                </button>
            </div>
        </div>
    );
}

function ProjectDetails({ project, onClose }) {
    if (!project) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Project Details: {project.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Plus className="w-6 h-6 transform rotate-45" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Project ID:</span>
                                    <span className="text-white">{project.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        project.status === 'Active' ? 'bg-green-500' : 
                                        project.status === 'Suspended' ? 'bg-yellow-500' : 'bg-red-500'
                                    } text-white`}>
                                        {project.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Created:</span>
                                    <span className="text-white">{project.created}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Region:</span>
                                    <span className="text-white">{project.region}</span>
                                </div>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Package Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Package:</span>
                                    <span className="text-white font-medium">{project.package}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Monthly Cost:</span>
                                    <span className="text-white font-bold">${project.pricing.monthly}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Resource Allocation</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Server className="w-4 h-4 text-blue-400" />
                                        <span className="text-gray-400">Instances</span>
                                    </div>
                                    <span className="text-white font-medium">{project.resources.instances}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Cpu className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-400">vCPUs</span>
                                    </div>
                                    <span className="text-white font-medium">{project.resources.vcpus}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <MemoryStick className="w-4 h-4 text-purple-400" />
                                        <span className="text-gray-400">Memory</span>
                                    </div>
                                    <span className="text-white font-medium">{project.resources.memory}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <HardDrive className="w-4 h-4 text-orange-400" />
                                        <span className="text-gray-400">Storage</span>
                                    </div>
                                    <span className="text-white font-medium">{project.resources.storage}</span>
                                </div>
                            </div>
                        </div>

                        {/* Usage */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Resource Usage</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">CPU Usage</span>
                                        <span className="text-white font-medium">{project.usage.cpu}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-3">
                                        <div 
                                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${project.usage.cpu}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">Memory Usage</span>
                                        <span className="text-white font-medium">{project.usage.memory}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-3">
                                        <div 
                                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${project.usage.memory}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">Storage Usage</span>
                                        <span className="text-white font-medium">{project.usage.storage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-3">
                                        <div 
                                            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${project.usage.storage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PackageChangeModal({ project, onClose, onConfirm }) {
    const [selectedPackage, setSelectedPackage] = useState(project?.package || "");

    if (!project) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Change Package for {project.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Plus className="w-6 h-6 transform rotate-45" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {packageOptions.map((pkg) => (
                        <div
                            key={pkg.name}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                selectedPackage === pkg.name 
                                    ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                                    : 'border-gray-600 hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedPackage(pkg.name)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                                <div className={`w-4 h-4 rounded-full ${pkg.color}`} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Price:</span>
                                    <span className="text-white font-bold">${pkg.price}/month</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">vCPUs:</span>
                                    <span className="text-white">{pkg.vcpus}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Memory:</span>
                                    <span className="text-white">{pkg.memory}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Storage:</span>
                                    <span className="text-white">{pkg.storage}</span>
                                </div>
                            </div>
                            {selectedPackage === pkg.name && (
                                <div className="mt-3 p-2 bg-blue-600 bg-opacity-20 rounded text-center">
                                    <span className="text-blue-300 text-sm font-medium">Selected</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(selectedPackage)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                        disabled={!selectedPackage || selectedPackage === project.package}
                    >
                        Confirm Change
                    </button>
                </div>
            </div>
        </div>
    );
}

function OpenStackProjectDashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPackageChange, setShowPackageChange] = useState(false);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalCost: 0,
        totalInstances: 0
    });

    useEffect(() => {
        // Simulate API call
        setProjects(mockProjects);
        
        // Calculate stats
        const totalProjects = mockProjects.length;
        const activeProjects = mockProjects.filter(p => p.status === 'Active').length;
        const totalCost = mockProjects.reduce((sum, p) => sum + p.pricing.monthly, 0);
        const totalInstances = mockProjects.reduce((sum, p) => sum + p.resources.instances, 0);
        
        setStats({
            totalProjects,
            activeProjects,
            totalCost,
            totalInstances
        });
    }, []);

    const handleViewDetails = (project) => {
        setSelectedProject(project);
        setShowDetails(true);
    };

    const handleChangePackage = (project) => {
        setSelectedProject(project);
        setShowPackageChange(true);
    };

    const handlePackageConfirm = (newPackage) => {
        const newPrice = packageOptions.find(p => p.name === newPackage)?.price || 0;
        
        setProjects(projects.map(p => 
            p.id === selectedProject.id 
                ? { ...p, package: newPackage, pricing: { ...p.pricing, monthly: newPrice } }
                : p
        ));
        
        setShowPackageChange(false);
        setSelectedProject(null);
    };

   return (
    <div className="min-h-screen text-white">
        {/* Navbar */}
        <Navbar credits={150} />

        {/* Main content wrapper with top padding */}
        <main className="pt-16">
            {/* Header Section */}
            <div className=" border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Server className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Manage Projects</h1>
                                <p className="text-sm text-gray-400">Manage your cloud infrastructure</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Sign New Project</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        {
                            label: 'Total Projects',
                            value: stats.totalProjects,
                            color: 'bg-blue-600',
                            icon: <Package className="w-6 h-6 text-white" />,
                        },
                        {
                            label: 'Active Projects',
                            value: stats.activeProjects,
                            color: 'bg-green-600',
                            icon: <Activity className="w-6 h-6 text-white" />,
                        },
                        {
                            label: 'Monthly Cost',
                            value: `$${stats.totalCost}`,
                            color: 'bg-purple-600',
                            icon: <CreditCard className="w-6 h-6 text-white" />,
                        },
                        {
                            label: 'Total Instances',
                            value: stats.totalInstances,
                            color: 'bg-orange-600',
                            icon: <Server className="w-6 h-6 text-white" />,
                        },
                    ].map(({ label, value, color, icon }, index) => (
                        <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">{label}</p>
                                    <p className="text-2xl font-bold">{value}</p>
                                </div>
                                <div className={`p-3 ${color} rounded-lg`}>
                                    {icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onViewDetails={handleViewDetails}
                            onChangePackage={handleChangePackage}
                            onManage={(project) => console.log('Manage:', project)}
                        />
                    ))}
                </div>
            </section>
        </main>

        {/* Modals */}
        {showDetails && (
            <ProjectDetails
                project={selectedProject}
                onClose={() => {
                    setShowDetails(false);
                    setSelectedProject(null);
                }}
            />
        )}

        {showPackageChange && (
            <PackageChangeModal
                project={selectedProject}
                onClose={() => {
                    setShowPackageChange(false);
                    setSelectedProject(null);
                }}
                onConfirm={handlePackageConfirm}
            />
        )}
    </div>
)}


export default OpenStackProjectDashboard;