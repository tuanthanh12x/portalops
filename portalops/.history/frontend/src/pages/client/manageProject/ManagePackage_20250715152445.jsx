// ProjectDashboard.js
import React, { useState, useEffect } from "react";
import { Server, Package, Activity, CreditCard, Plus } from "lucide-react";
import Navbar from "../../../components/client/Navbar";
import ProjectCard from "./ProjectCard";
import PackageChangeModal from "./PackageChangeModal";
import ProjectDetailsModal from "./ProjectDetails";
import { mockProjects, packageOptions } from "./mockData";

function ProjectDashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPackageChange, setShowPackageChange] = useState(false);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalCost: 0,
        packageDistribution: {}
    });

    useEffect(() => {
        // Simulate API call
        setProjects(mockProjects);
        
        // Calculate stats
        const totalProjects = mockProjects.length;
        const activeProjects = mockProjects.filter(p => p.status === 'Active').length;
        const totalCost = mockProjects.reduce((sum, p) => sum + p.pricing.monthly, 0);
        
        // Calculate package distribution
        const packageDistribution = mockProjects.reduce((acc, project) => {
            acc[project.package] = (acc[project.package] || 0) + 1;
            return acc;
        }, {});
        
        setStats({
            totalProjects,
            activeProjects,
            totalCost,
            packageDistribution
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

    const closeModals = () => {
        setShowDetails(false);
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
                <div className="border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Server className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Manage Projects</h1>
                                    <p className="text-sm text-gray-400">Quản lý các gói dịch vụ cloud</p>
                                </div>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>New Project</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Projects</p>
                                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                                </div>
                                <div className="p-3 bg-blue-600 rounded-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Projects</p>
                                    <p className="text-2xl font-bold">{stats.activeProjects}</p>
                                </div>
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Monthly Cost</p>
                                    <p className="text-2xl font-bold">${stats.totalCost}</p>
                                </div>
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Most Used Package</p>
                                    <p className="text-2xl font-bold">
                                        {Object.entries(stats.packageDistribution).reduce((a, b) => 
                                            stats.packageDistribution[a[0]] > stats.packageDistribution[b[0]] ? a : b, 
                                            ["", 0]
                                        )[0] || "N/A"}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-600 rounded-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onViewDetails={handleViewDetails}
                                onChangePackage={handleChangePackage}
                            />
                        ))}
                    </div>
                </section>
            </main>

            {/* Modals */}
            {showDetails && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={closeModals}
                />
            )}

            {showPackageChange && (
                <PackageChangeModal
                    project={selectedProject}
                    onClose={closeModals}
                    onConfirm={handlePackageConfirm}
                />
            )}
        </div>
    );
}

export default ProjectDashboard;