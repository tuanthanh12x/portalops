import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';

const CreateKeypairForm = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPrivateKey(null);

    if (!name) {
      setError('⚠️ Keypair name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/openstack/compute/keypair/', { name });
      if (res.status === 201) {
        onCreate && onCreate(res.data);
        if (res.data.keypair?.private_key) {
          setPrivateKey(res.data.keypair.private_key);
        }
        setName('');
      } else {
        setError('❌ Failed to create keypair.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPrivateKey = () => {
    if (!privateKey) return;
    const blob = new Blob([privateKey], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'private_key'}.pem`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Navbar credits={150} />

      <div className="max-w-xl mx-auto px-6 py-12 animate-fade-in">
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-400 text-center tracking-wide drop-shadow">
            🔑 Create a New Keypair
          </h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/40 py-2 px-3 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block mb-1 text-sm font-medium">Keypair Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., my-cloud-key"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '➕ Create Keypair'}
            </button>
          </form>

          {privateKey && (
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold text-green-400">📄 Your Private Key</h3>
              <textarea
                readOnly
                rows={8}
                className="w-full bg-gray-800 p-3 rounded text-sm font-mono text-green-300"
                value={privateKey}
              />
              <button
                onClick={downloadPrivateKey}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                ⬇ Download .pem File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateKeypairForm;
