import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

      if (response.data.require_2fa) {
        setRequire2FA(true);
      } else {
        setTokenWithExpiry('accessToken', response.data.access);
        window.location.href = '/';
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handle2FAVerify = async () => {
    setError('');
    try {
      const response = await axiosInstance.post('/auth/2fa-login', {
        username,
        code: otpCode,
      });
      setTokenWithExpiry('accessToken', response.data.access);
      window.location.href = '/';
    } catch (err) {
      setError('Invalid 2FA code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Login
        </h1>

        {!require2FA ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow"
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
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                Enter 2FA Code
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow"
              />
            </div>

            <button
              onClick={handle2FAVerify}
              className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide"
            >
              Verify 2FA Code
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center font-orbitron animate-pulse mt-4">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-green-300 font-orbitron">
          <button
            onClick={() => navigate('/register')}
            className="hover:underline hover:text-green-400 transition"
          >
            Don't have an account? Register
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            className="hover:underline hover:text-green-400 transition"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
