import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          >
            Login
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
