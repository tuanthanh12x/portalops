// SubnetDetailModal.js
import React from 'react';

export default function SubnetDetailModal({ subnet, onClose }) {
    if (!subnet) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md text-white relative">
                <h2 className="text-xl font-bold mb-4 text-green-400">Subnet Details</h2>
                <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {subnet.id}</div>
                    <div><strong>Name:</strong> {subnet.name}</div>
                    <div><strong>Project ID:</strong> {subnet.project_id}</div>
                    <div><strong>Network ID:</strong> {subnet.network_id}</div>
                    <div><strong>IP Version:</strong> IPv{subnet.ip_version}</div>
                    <div><strong>Gateway IP:</strong> {subnet.gateway_ip}</div>
                    <div><strong>Enable DHCP:</strong> {subnet.enable_dhcp ? 'Yes' : 'No'}</div>
                    <div><strong>Allocation Pool:</strong>
                        {subnet.allocation_pools?.map((pool, i) => (
                            <div key={i} className="ml-2">• {pool.start} → {pool.end}</div>
                        ))}
                    </div>
                    <div><strong>DNS Nameservers:</strong> {subnet.dns_nameservers?.join(', ') || 'None'}</div>
                    <div><strong>Host Routes:</strong> {subnet.host_routes?.length > 0 ? JSON.stringify(subnet.host_routes) : 'None'}</div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
