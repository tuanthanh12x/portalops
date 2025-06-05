import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

// Note: Add this to your index.html or import in your CSS file
// <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet">

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Save token with expiry
  const setTokenWithExpiry = (key, token, ttl = 3600000) => {
    const now = new Date();
    const item = {
      token,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      setTokenWithExpiry('accessToken', access);
      setTokenWithExpiry('refreshToken', refresh);

      window.location.href = '/'; // Redirect to home/dashboard
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Login failed. Invalid username or password.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-green-300 font-orbitron">
              User Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none focus:ring-0 placeholder-gray-500 font-orbitron transition-all duration-300 hover:shadow-glow focus:shadow-glow"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-green-300 font-orbitron">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none focus:ring-0 placeholder-gray-500 font-orbitron transition-all duration-300 hover:shadow-glow focus:shadow-glow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 font-orbitron text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide"
          >
            Initiate Login
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center font-orbitron animate-pulse">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;