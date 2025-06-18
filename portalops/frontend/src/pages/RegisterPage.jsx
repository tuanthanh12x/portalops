import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/auth/signup/', {
        username,
        email,
        password,
      });

      setSuccess('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login'; // Redirect to login page
      }, 1500);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Register
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-green-300 font-orbitron">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-0 font-orbitron hover:shadow-glow focus:shadow-glow transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-300 font-orbitron">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email"
              className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-0 font-orbitron hover:shadow-glow focus:shadow-glow transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-300 font-orbitron">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-0 font-orbitron hover:shadow-glow focus:shadow-glow transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 text-sm font-orbitron"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide"
          >
            Register Account
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center font-orbitron">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-sm text-center font-orbitron animate-pulse">{success}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
