import React from "react";
import { Server, Package, Eye } from "lucide-react";

function ProjectCard({ project, onChangePackage, onViewDetails, packageOptions }) {
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
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg min-h-[360px] flex flex-col justify-between">
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-blue-600 rounded-lg shrink-0">
                            <Server className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
                                {project.name}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2">
                                {project.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-white`}>
                            {project.status}
                        </span>
                        <button
                            onClick={() => onViewDetails(project)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
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

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Created:</span>
                        <span className="text-sm text-gray-300">{project.created}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Region:</span>
                        <span className="text-sm text-gray-300">{project.region}</span>
                    </div>
                </div>
            </div>

            <div className="flex space-x-2 pt-6 mt-auto">
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

export default ProjectCard;
