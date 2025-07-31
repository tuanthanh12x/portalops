import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setTokenWithExpiry = (key, token, ttl = 3600000) => {
    const now = new Date();
    const item = {
      token,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const redirectUser = (accessToken) => {
    const decoded = jwtDecode(accessToken);
    const roles = decoded?.roles || [];
    const isAdmin = roles.includes('admin');
    window.location.href = isAdmin ? '/admin-dashboard' : '/';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        username,
        password,
      };

      // Add selected project if we're confirming project selection
      if (selectedProject) {
        payload.openstack_id = selectedProject;
      }

      const response = await axiosInstance.post('/auth/login/', payload);

      // Case 1: Require 2FA
      if (response.data.require_2fa) {
        setRequire2FA(true);
        setSessionKey(response.data.session_key);
        setLoading(false);
        return;
      }

      // Case 2: Require project selection
      if (response.data.require_project_selection) {
        setProjects(response.data.projects);
        setLoading(false);
        return;
      }

      // Case 3: Login successful - got access token
      if (response.data.access) {
        const accessToken = response.data.access;
        setTokenWithExpiry('accessToken', accessToken);
        redirectUser(accessToken);
      } else {
        setError('Unexpected response format. Please try again.');
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your username and password.');
      } else if (err.response?.status === 403) {
        setError('Invalid or unauthorized project selected.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    setError('');
    setLoading(true);

    if (!sessionKey) {
      setError('Session expired. Please login again.');
      setRequire2FA(false);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/two-fa-login/', {
        session_key: sessionKey,
        code: otpCode,
      });

      if (response.data.access) {
        const accessToken = response.data.access;
        setTokenWithExpiry('accessToken', accessToken);
        redirectUser(accessToken);
      } else {
        setError('Unexpected response format. Please try again.');
      }

    } catch (err) {
      console.error('2FA verification error:', err);
      
      if (err.response?.status === 403) {
        setError('Session expired or invalid. Please login again.');
        setRequire2FA(false);
        setSessionKey(null);
      } else if (err.response?.status === 400) {
        setError('Invalid 2FA code. Please try again.');
      } else if (err.response?.status === 404) {
        setError('User session not found. Please login again.');
        setRequire2FA(false);
        setSessionKey(null);
      } else {
        setError(err.response?.data?.error || '2FA verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectConfirm = () => {
    if (!selectedProject) {
      setError('Please select a project.');
      return;
    }
    
    // Reset error and call handleLogin with selected project
    setError('');
    handleLogin({ preventDefault: () => {} });
  };

  const resetForm = () => {
    setRequire2FA(false);
    setSessionKey(null);
    setProjects([]);
    setSelectedProject('');
    setOtpCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Login
        </h1>

        {/* Step 1: Username/Password */}
        {!require2FA && projects.length === 0 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow disabled:opacity-50"
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
                  disabled={loading}
                  className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 font-orbitron text-sm disabled:opacity-50"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        )}

        {/* Step 2: 2FA Verification */}
        {require2FA && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-green-300 font-orbitron text-sm">
                2FA is enabled for your account. Please enter your authentication code.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                2FA Authentication Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                maxLength={6}
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500 hover:shadow-glow focus:shadow-glow text-center tracking-widest disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handle2FAVerify}
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify 2FA Code'}
              </button>
              
              <button
                onClick={resetForm}
                disabled={loading}
                className="w-full bg-gray-700 text-green-300 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-orbitron text-sm disabled:opacity-50"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Project Selection */}
        {projects.length > 0 && !require2FA && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-green-300 font-orbitron text-sm">
                You have access to multiple projects. Please select one to continue.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-300 font-orbitron">
                Select Project
              </label>
              <select
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-green-200 border border-green-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-glow focus:shadow-glow font-orbitron transition-all duration-300 disabled:opacity-50"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={loading}
              >
                <option value="" className="bg-gray-900 text-gray-400">
                  -- Choose a project --
                </option>
                {projects.map((project) => (
                  <option
                    key={project.openstack_id}
                    value={project.openstack_id}
                    className="bg-gray-900 text-white"
                  >
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleProjectConfirm}
                disabled={loading || !selectedProject}
                className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm Project'}
              </button>
              
              <button
                onClick={resetForm}
                disabled={loading}
                className="w-full bg-gray-700 text-green-300 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-orbitron text-sm disabled:opacity-50"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center font-orbitron">
              {error}
            </p>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-6 flex justify-between items-center text-sm text-green-300 font-orbitron">
          <button
            onClick={() => navigate('/register')}
            className="hover:underline hover:text-green-400 transition disabled:opacity-50"
            disabled={loading}
          >
            Don't have an account? Register
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            className="hover:underline hover:text-green-400 transition disabled:opacity-50"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;