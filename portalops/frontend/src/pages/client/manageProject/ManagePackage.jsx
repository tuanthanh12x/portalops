import React, { useState, useEffect } from "react";
import { Server, Package, Activity, CreditCard, Plus } from "lucide-react";
import Navbar from "../../../components/client/Navbar";
import ProjectCard from "./ProjectCard";
import PackageChangeModal from "./PackageChangeModal";
import ProjectDetailsModal from "./ProjectDetails";
import { fetchRealProjects, fetchPackageOptions } from "./mockData";
import axiosInstance from "../../../api/axiosInstance";
function ProjectDashboard() {
    const [projects, setProjects] = useState([]);
    const [packageOptions, setPackageOptions] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPackageChange, setShowPackageChange] = useState(false);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalCost: 0,
        packageDistribution: {},
    });

    useEffect(() => {
        const loadData = async () => {
            const [projectsData, packages] = await Promise.all([
                fetchRealProjects(),
                fetchPackageOptions(),
            ]);

            setProjects(projectsData);
            setPackageOptions(packages);

            // Stats calculations
            const totalProjects = projectsData.length;
            const activeProjects = projectsData.filter(p => p.status === "Active").length;
            const totalCost = projectsData.reduce((sum, p) => sum + p.pricing.monthly, 0);
            const packageDistribution = projectsData.reduce((acc, project) => {
                acc[project.package] = (acc[project.package] || 0) + 1;
                return acc;
            }, {});

            setStats({
                totalProjects,
                activeProjects,
                totalCost,
                packageDistribution,
            });
        };

        loadData();
    }, []);

    const handleViewDetails = (project) => {
        setSelectedProject(project);
        setShowDetails(true);
    };

    const handleChangePackage = (project) => {
        setSelectedProject(project);
        setShowPackageChange(true);
    };
const handlePackageConfirm = async (newPackageName) => {
    if (!selectedProject) return;

    const newType = packageOptions.find(pkg => pkg.name === newPackageName);
    if (!newType) {
        console.error("Invalid package selected.");
        return;
    }

    try {
        // Send request to update project type
        const response = await axiosInstance.post("project/client-change-vps-package/", {
            project_id: selectedProject.openstack_id,          // this should match project.openstack_id
            project_type_id: newType.id              // expected by backend
        });

        // On success, update local state
        setProjects(projects.map(p =>
            p.id === selectedProject.id
                ? {
                    ...p,
                    package: newType.name,
                    pricing: { ...p.pricing, monthly: newType.price },
                }
                : p
        ));

        setShowPackageChange(false);
        setSelectedProject(null);
    } catch (error) {
        console.error("Failed to change VPS type:", error.response?.data || error.message);
        // Optionally show error notification here
    }
};
    const closeModals = () => {
        setShowDetails(false);
        setShowPackageChange(false);
        setSelectedProject(null);
    };

    return (
        <div className="min-h-screen text-white">
            <Navbar credits={150} />
            <main className="pt-16">
                <div className="border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Server className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Manage Packages</h1>
                                    <p className="text-sm text-gray-400">Cloud service package management</p>
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
                        <StatCard title="Total Projects" value={stats.totalProjects} icon={<Package className="w-6 h-6 text-white" />} color="bg-blue-600" />
                        <StatCard title="Active Projects" value={stats.activeProjects} icon={<Activity className="w-6 h-6 text-white" />} color="bg-green-600" />
                        <StatCard title="Monthly Cost" value={`$${stats.totalCost}`} icon={<CreditCard className="w-6 h-6 text-white" />} color="bg-purple-600" />
                        <StatCard
                            title="Most Used Package"
                            value={
                                Object.entries(stats.packageDistribution).reduce(
                                    (a, b) => stats.packageDistribution[a[0]] > stats.packageDistribution[b[0]] ? a : b,
                                    ["", 0]
                                )[0] || "N/A"
                            }
                            icon={<Package className="w-6 h-6 text-white" />}
                            color="bg-orange-600"
                        />
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onViewDetails={handleViewDetails}
                                onChangePackage={handleChangePackage}
                                packageOptions={packageOptions} // Pass packageOptions here
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
                    packageOptions={packageOptions} // Pass packageOptions here
                />
            )}
            {showPackageChange && (
                <PackageChangeModal
                    project={selectedProject}
                    onClose={closeModals}
                    onConfirm={handlePackageConfirm}
                    packageOptions={packageOptions} // Pass packageOptions here
                />
            )}
        </div>
    );
}

export default ProjectDashboard;

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`p-3 ${color} rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
