import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Popup from '../../components/client/Popup';
import Header from '../../components/admin/Navbar';

export default function CreateProjectTypePage() {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price_per_month: '',
    description: '',
    instances: 0,
    vcpus: 0,
    ram: 0,
    volumes: 0,
    volume_snapshots: 0,
    total_volume_gb: 0,
    metadata_items: 128,
    key_pairs: 100,
    server_groups: 10,
    server_group_members: 10,
    injected_files: 5,
    injected_file_content_bytes: 10240,
    networks: 100,
    ports: 500,
    subnets: 50,
    routers: 10,
    floating_ips: 50,
    security_groups: 10,
    security_group_rules: 100,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/project/project-package/', formData);
      setPopup({ message: '✅ Project Package created successfully.' });
      navigate('/admin/packages');
    } catch (err) {
      setError(err.response?.data?.error || '❌ Failed to create project type.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Header />
      {popup && (
        <Popup
          message={popup.message}
          type="success"
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-400 text-center tracking-wide drop-shadow">
            🛠️ Create New Project Package
          </h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/40 py-2 px-3 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block mb-1 text-sm font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  name={key}
                  type={
                    key === 'name' || key === 'description' ? 'text' : 'number'
                  }
                  value={value}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  required={
                    ['name', 'price_per_month', 'instances', 'vcpus', 'ram', 'volumes', 'volume_snapshots', 'total_volume_gb'].includes(
                      key
                    )
                  }
                />
              </div>
            ))}

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md"
              >
                ➕ Create Project Package
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
