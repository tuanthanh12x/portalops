import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/admin/Navbar';
export default function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone_number: '',
    address: '',
    role_id: ''
  });

  const [roles, setRoles] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [error, setError] = useState(null);

  // Fetch roles and timezones
  useEffect(() => {
    axiosInstance.get('auth/roles-list/')
      .then(res => setRoles(res.data))
      .catch(() => setError('Failed to load roles'));

  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('auth/create-user/', formData);
      alert('User created successfully.');
      navigate('/users-manager'); // adjust based on your routes
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  return (
      <div className="min-h-screen w-screen bg-gray-900 overflow-x-hidden">
    <Header/>
    <div className="max-w-2xl mx-auto mt-10 bg-black/30 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">Create New User</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Username</label>
          <input
            name="username"
            type="text"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm">Password</label>
          <input
            name="password"
            type="password"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input
            name="email"
            type="email"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm">Phone Number</label>
          <input
            name="phone_number"
            type="text"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm">Address</label>
          <input
            name="address"
            type="text"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

    


        <div>
          <label className="block text-sm">Role</label>
          <select
            name="role_id"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-2"
            value={formData.role_id}
            onChange={handleChange}
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
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl transition duration-300"
        >
          Create User
        </button>
      </form>
    </div>
    </div>
  );
}
