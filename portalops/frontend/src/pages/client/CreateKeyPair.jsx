import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance'; // Axios config với baseURL và JWT token
import Navbar from '../../components/Navbar';
const CreateKeypairForm = ({ onCreate }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState(null); // lưu private key nếu có

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setPrivateKey(null);

        if (!name) {
            setError('Keypair name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post('/openstack-portal/create-keypair/', { name });
            if (res.status === 201) {
                onCreate && onCreate(res.data);

                // Nếu có private_key (OpenStack tạo mới), lưu để user tải về
                if (res.data.keypair && res.data.keypair.private_key) {
                    setPrivateKey(res.data.keypair.private_key);
                }

                setName('');
            } else {
                setError('Failed to create keypair');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Tải private key về dưới dạng file .pem
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
  <div className="bg-gray-900 text-gray-100 min-h-screen">
    <Navbar credits={150} />
    
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-white mt-16">
      <h2 className="text-xl font-semibold mb-4">Create New Keypair</h2>
      {error && <div className="mb-3 text-red-400">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span className="block mb-1">Keypair Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            placeholder="Enter keypair name"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded font-semibold"
        >
          {loading ? 'Creating...' : 'Create Keypair'}
        </button>
      </form>

      {privateKey && (
        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
          <h3 className="font-semibold mb-2">Private Key (Save it securely!)</h3>
          <textarea
            readOnly
            rows={8}
            className="w-full bg-gray-800 p-2 rounded text-sm font-mono"
            value={privateKey}
          />
          <button
            onClick={downloadPrivateKey}
            className="mt-2 bg-green-600 hover:bg-green-700 py-2 rounded w-full"
          >
            Download Private Key (.pem)
          </button>
        </div>
      )}
    </div>
  </div>
);

};

            export default CreateKeypairForm;
