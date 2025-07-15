import React from "react";
import { Plus, Package, CreditCard, MapPin, Calendar } from "lucide-react";

function ProjectDetailsModal({ project, onClose, packageOptions }) {
    if (!project) return null;

    const currentPackage = packageOptions.find(pkg => pkg.name === project.package);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
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
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Package className="w-4 h-4 text-blue-400" />
                                    <div className="flex-1">
                                        <span className="text-gray-400">Project ID:</span>
                                        <p className="text-white font-medium">{project.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className={`w-4 h-4 rounded-full ${
                                        project.status === 'Active' ? 'bg-green-500' : 
                                        project.status === 'Suspended' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                    <div className="flex-1">
                                        <span className="text-gray-400">Status:</span>
                                        <p className="text-white font-medium">{project.status}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <div className="flex-1">
                                        <span className="text-gray-400">Created:</span>
                                        <p className="text-white font-medium">{project.created}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-4 h-4 text-orange-400" />
                                    <div className="flex-1">
                                        <span className="text-gray-400">Region:</span>
                                        <p className="text-white font-medium">{project.region}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Info */}
                    <div className="space-y-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Package Information</h3>
                            {currentPackage ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Package:</span>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${currentPackage.color}`} />
                                            <span className="text-white font-medium">{currentPackage.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Monthly Cost:</span>
                                        <span className="text-white font-bold text-lg">${currentPackage.price}</span>
                                    </div>

                                    <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                                        <p className="text-sm text-gray-300 mb-2">Package includes:</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">vCPUs:</span>
                                                <span className="text-white">{currentPackage.vcpus}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Memory:</span>
                                                <span className="text-white">{currentPackage.memory}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Storage:</span>
                                                <span className="text-white">{currentPackage.storage}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No package information available.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-gray-300">{project.description}</p>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetailsModal;
