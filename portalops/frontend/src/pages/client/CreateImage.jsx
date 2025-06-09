import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';

const CreateImageForm = () => {
  const [name, setName] = useState('');
  const [diskFormat, setDiskFormat] = useState('qcow2');
  const [visibility, setVisibility] = useState('private');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);       // thêm state thông báo thành công
  const [loading, setLoading] = useState(false);

  const diskFormats = ['qcow2', 'raw', 'vmdk', 'vdi', 'iso'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);      // reset thông báo thành công mỗi lần submit

    if (!name || !file) {
      setError('⚠️ Name and image file are required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('disk_format', diskFormat);
      formData.append('visibility', visibility);
      formData.append('file', file);

      const res = await axiosInstance.post('/openstack/compute/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000,
      });

      if (res.status === 201) {
        setName('');
        setFile(null);
        setDiskFormat('qcow2');
        setVisibility('private');
        setSuccess('✅ Image created successfully!');   // hiện thông báo thành công
      } else {
        setError('Image creation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Navbar credits={150} />
      <div className="max-w-3xl mx-auto p-8 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide drop-shadow text-center">
          🧱 Upload a Custom Image
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700"
        >
          {error && (
            <div className="text-red-400 text-sm bg-red-900/40 py-2 px-3 rounded text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-900/40 py-2 px-3 rounded text-center">
              {success}
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Image Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nebula OS v1.0"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Disk Format</label>
            <select
              value={diskFormat}
              onChange={(e) => setDiskFormat(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
            >
              {diskFormats.map(df => (
                <option key={df} value={df}>{df.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Upload Image File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".qcow2,.raw,.vmdk,.vdi,.iso"
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading...
              </span>
            ) : (
              '🚀 Upload Image'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateImageForm;
