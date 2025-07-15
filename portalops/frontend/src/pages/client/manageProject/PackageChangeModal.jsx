import React, { useState } from "react";
import { Plus } from "lucide-react";

function PackageChangeModal({ project, onClose, onConfirm, packageOptions }) {
    const [selectedPackage, setSelectedPackage] = useState(project?.package || "");

    if (!project || !packageOptions?.length) return null;

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
                            
                            <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>
                            
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

export default PackageChangeModal;
