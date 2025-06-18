import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Popup from "../../components/client/Popup";
import Header from '../../components/admin/Navbar';

export default function CreateUserPage() {
  const navigate = useNavigate();
      const [popup, setPopup] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone_number: '',
    address: '',
    role_id: ''
  });

  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get('auth/roles-list/')
      .then(res => setRoles(res.data))
      .catch(() => setError('⚠️ Failed to load roles.'));
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('auth/create-user/', formData);
      setPopup({ message: " ✅ User created successfully. " });
      navigate('/users-manager');
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Failed to create user.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Header />
       {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-400 text-center tracking-wide drop-shadow">
            👤 Create New User
          </h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/40 py-2 px-3 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium">Username</label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Phone Number</label>
              <input
                name="phone_number"
                type="text"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Address</label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Role</label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              ➕ Create User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
