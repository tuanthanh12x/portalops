import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance'; // đảm bảo bạn có file này
import Navbar from '../../components/Navbar';

const CreateImageForm = ({ }) => {
  const [name, setName] = useState('');
  const [diskFormat, setDiskFormat] = useState('qcow2');
  const [visibility, setVisibility] = useState('private');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const diskFormats = ['qcow2', 'raw', 'vmdk', 'vdi', 'iso'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !file) {
      setError('Name and image file are required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('disk_format', diskFormat);
      formData.append('visibility', visibility);
      formData.append('file', file);

      const res = await axiosInstance.post(
        '/openstack-portal/create-image/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },timeout: 600000,
        },
        
      );

      if (res.status === 201) {
        setName('');
        setFile(null);
        setDiskFormat('qcow2');
        setVisibility('private');
      } else {
        setError('Image creation failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
      <Navbar credits={150} />

      <div className="flex-grow flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 bg-[#1a1a2e] rounded-lg shadow-lg border border-[#33344a]"
          style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.9)' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center font-fantasy">
            Create New Image
          </h2>

          {error && <div className="mb-4 text-red-400 text-center">{error}</div>}

          <label className="block mb-4">
            <span className="block mb-1 font-medium text-gray-300">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded bg-[#2c2c3e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Image name"
              required
            />
          </label>

          <label className="block mb-4">
            <span className="block mb-1 font-medium text-gray-300">Disk Format</span>
            <select
              value={diskFormat}
              onChange={(e) => setDiskFormat(e.target.value)}
              className="w-full p-3 rounded bg-[#2c2c3e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {diskFormats.map((df) => (
                <option key={df} value={df}>
                  {df.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="block mb-1 font-medium text-gray-300">Visibility</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full p-3 rounded bg-[#2c2c3e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label className="block mb-6">
            <span className="block mb-1 font-medium text-gray-300">Image File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
              accept=".qcow2,.raw,.vmdk,.vdi,.iso"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded font-semibold transition"
          >
            {loading ? 'Creating...' : 'Create Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateImageForm;
