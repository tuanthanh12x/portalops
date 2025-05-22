import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function MyInstances() {
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const res = await axiosInstance.get('/overview/instances/');
        setInstances(res.data);
      } catch (error) {
        console.error('Failed to fetch instances:', error);
      }
    };

    fetchInstances();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axiosInstance.post(`/instances/${id}/action/`, { action });
      alert(`${action} sent successfully.`);
    } catch (error) {
      console.error(`${action} failed:`, error);
      alert(`${action} failed.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">My Instances</h2>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>IP</th>
            <th>Plan</th>
            <th>Region</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {instances.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No instances found.
              </td>
            </tr>
          ) : (
            instances.map((instance) => (
              <tr className="border-t" key={instance.id}>
                <td>{instance.name}</td>
                <td>{instance.status}</td>
                <td>{instance.ip}</td>
                <td>{instance.plan}</td>
                <td>{instance.region}</td>
                <td>{instance.created}</td>
                <td className="space-y-1 text-xs">
                  <button
                    onClick={() => handleAction(instance.id, 'power')}
                    className="text-blue-600 hover:underline block"
                  >
                    Power On/Off
                  </button>
                  <button
                    onClick={() => handleAction(instance.id, 'restart')}
                    className="text-blue-600 hover:underline block"
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => handleAction(instance.id, 'resize')}
                    className="text-blue-600 hover:underline block"
                  >
                    Resize
                  </button>
                  <button
                    onClick={() => handleAction(instance.id, 'console')}
                    className="text-blue-600 hover:underline block"
                  >
                    Console
                  </button>
                  <button
                    onClick={() => handleAction(instance.id, 'snapshot')}
                    className="text-blue-600 hover:underline block"
                  >
                    Snapshot
                  </button>
                  <button
                    onClick={() => handleAction(instance.id, 'delete')}
                    className="text-red-600 hover:underline block"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
