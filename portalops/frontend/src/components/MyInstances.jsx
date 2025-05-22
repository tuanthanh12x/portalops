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
    if (!action) return;

    if (action === 'delete' && !window.confirm('Are you sure you want to delete this instance?')) {
      return;
    }

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
      <div className="min-w-[700px]">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">IP</th>
              <th className="px-2 py-2">Plan</th>
              <th className="px-2 py-2">Region</th>
              <th className="px-2 py-2">Created</th>
              <th className="px-2 py-2">Actions</th>
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
                  <td className="px-2 py-2">{instance.name}</td>
                  <td className="px-2 py-2">{instance.status}</td>
                  <td className="px-2 py-2">{instance.ip}</td>
                  <td className="px-2 py-2">{instance.plan}</td>
                  <td className="px-2 py-2">{instance.region}</td>
                  <td className="px-2 py-2">{instance.created}</td>
                  <td className="px-2 py-2">
                    <select
                      defaultValue=""
                      onChange={(e) => handleAction(instance.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="" disabled>
                        Select Action
                      </option>
                      <option value="power">Power On/Off</option>
                      <option value="restart">Restart</option>
                      <option value="resize">Resize</option>
                      <option value="console">Console</option>
                      <option value="snapshot">Snapshot</option>
                      <option value="delete" className="text-red-600">Delete</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
