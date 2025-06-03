import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';

const CreateImageForm = () => {
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
    <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen">
      <Navbar credits={150} />

      <div className="flex items-center justify-center py-12 px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.7)] transition-all"
        >
          <h2 className="text-3xl font-bold mb-6 text-center tracking-wide">
            🚀 Deploy Image to Cloud
          </h2>

          {error && (
            <div className="mb-4 text-red-400 text-sm text-center bg-red-900/40 py-2 px-3 rounded">
              {error}
            </div>
          )}

          <label className="block mb-5">
            <span className="block mb-1 text-sm font-medium">🖋️ Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nebula OS v1.0"
              className="w-full px-4 py-3 rounded-lg bg-[#1f1f2e] border border-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </label>

          <label className="block mb-5">
            <span className="block mb-1 text-sm font-medium">💾 Disk Format</span>
            <select
              value={diskFormat}
              onChange={(e) => setDiskFormat(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f1f2e] border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {diskFormats.map(df => (
                <option key={df} value={df}>{df.toUpperCase()}</option>
              ))}
            </select>
          </label>

          <label className="block mb-5">
            <span className="block mb-1 text-sm font-medium">🔐 Visibility</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f1f2e] border border-gray-700 focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label className="block mb-6">
            <span className="block mb-1 text-sm font-medium">📂 Image File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".qcow2,.raw,.vmdk,.vdi,.iso"
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 transition-all rounded-lg font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Image'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateImageForm;
