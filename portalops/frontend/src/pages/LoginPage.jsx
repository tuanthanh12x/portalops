import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  // --- STATE MANAGEMENT ---
  // Sử dụng một state duy nhất để quản lý bước đăng nhập hiện tại.
  // Điều này giúp code dễ hiểu và tránh các trạng thái logic mâu thuẫn.
  const [loginStep, setLoginStep] = useState('CREDENTIALS'); // 'CREDENTIALS', 'TWO_FACTOR', 'PROJECT_SELECTION'

  // Dữ liệu người dùng nhập
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Dữ liệu từ API
  const [sessionKey, setSessionKey] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  // State cho UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // --- HELPER FUNCTIONS ---
  const setTokenWithExpiry = (key, token, ttl = 3600000) => {
    const now = new Date();
    const item = {
      token,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const redirectUser = (accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const roles = decoded?.roles || [];
      const isAdmin = roles.includes('admin');
      // Sử dụng navigate để chuyển trang trong React Router thay vì window.location.href
      // để có trải nghiệm Single Page App mượt mà hơn.
      navigate(isAdmin ? '/admin-dashboard' : '/');
    } catch (e) {
      console.error("Invalid token:", e);
      setError("Received an invalid session token. Please try logging in again.");
      setLoginStep('CREDENTIALS'); // Quay lại bước đầu nếu token lỗi
    }
  };

  const handleError = (err, context) => {
    console.error(`Error during ${context}:`, err);
    const response = err.response;
    if (response?.data?.detail) {
      setError(response.data.detail);
    } else if (response?.data?.error) {
      setError(response.data.error);
    } else if (response?.status === 401) {
      setError('Invalid credentials. Please check your username and password.');
    } else if (response?.status === 403) {
      setError('Session expired or invalid. Please login again.');
      resetToLogin(); // Nếu session hết hạn, quay về màn hình đăng nhập
    } else if (response?.status === 400) {
      setError('Invalid 2FA code or request. Please try again.');
    } else {
      setError(`An unexpected error occurred during ${context}. Please try again.`);
    }
  };

  // --- API HANDLERS ---

  // Bước 1: Gửi username và password
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login/', { username, password });
      const data = response.data;

      if (data.access) {
        // THÀNH CÔNG NGAY LẬP TỨC
        setTokenWithExpiry('accessToken', data.access);
        redirectUser(data.access);
      } else if (data.require_2fa) {
        // YÊU CẦU 2FA
        setSessionKey(data.session_key);
        setLoginStep('TWO_FACTOR');
      } else if (data.require_project_selection) {
        // YÊU CẦU CHỌN PROJECT
        setProjects(data.projects);
        setLoginStep('PROJECT_SELECTION');
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      handleError(err, 'login');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Gửi mã 2FA
  const handle2FASubmit = async () => {
    if (otpCode.length !== 6) return;
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/two-fa-login/', {
        session_key: sessionKey,
        code: otpCode,
      });
      const data = response.data;

      if (data.access) {
        // THÀNH CÔNG SAU KHI NHẬP 2FA
        setTokenWithExpiry('accessToken', data.access);
        redirectUser(data.access);
      } else if (data.require_project_selection) {
        // **LOGIC QUAN TRỌNG**: Cần chọn project SAU KHI nhập 2FA
        setProjects(data.projects);
        setLoginStep('PROJECT_SELECTION');
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      handleError(err, '2FA verification');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Gửi project đã chọn
  const handleProjectSubmit = async () => {
    if (!selectedProject) {
      setError('Please select a project.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let response;
      // **LOGIC QUAN TRỌNG**: Quyết định gọi API nào dựa vào việc đã qua bước 2FA hay chưa
      if (sessionKey) {
        // Nếu có sessionKey, nghĩa là đã qua bước 2FA -> gọi API 2FA
        response = await axiosInstance.post('/auth/two-fa-login/', {
          session_key: sessionKey,
          code: otpCode, // Mã OTP vẫn cần thiết
          openstack_id: selectedProject,
        });
      } else {
        // Nếu không, đây là lần chọn project đầu tiên -> gọi API login
        response = await axiosInstance.post('/auth/login/', {
          username,
          password,
          openstack_id: selectedProject,
        });
      }

      if (response.data.access) {
        // THÀNH CÔNG CUỐI CÙNG
        setTokenWithExpiry('accessToken', response.data.access);
        redirectUser(response.data.access);
      } else {
         setError('Could not complete login after project selection. Please try again.');
      }
    } catch (err) {
      handleError(err, 'project confirmation');
    } finally {
      setLoading(false);
    }
  };
  
  const resetToLogin = () => {
    setLoginStep('CREDENTIALS');
    setSessionKey(null);
    setProjects([]);
    setSelectedProject('');
    setOtpCode('');
    setError('');
    // Không reset username/password để người dùng không phải nhập lại
  };

  // --- RENDER LOGIC ---

  const renderCredentialsForm = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-green-300 font-orbitron">Username</label>
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
        <label className="block text-sm font-medium text-green-300 font-orbitron">Password</label>
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
  );

  const render2FAForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-green-300 font-orbitron text-sm">
          Please enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-300 font-orbitron">2FA Authentication Code</label>
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
          onClick={handle2FASubmit}
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        <button
          onClick={resetToLogin}
          disabled={loading}
          className="w-full bg-gray-700 text-green-300 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-orbitron text-sm disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  const renderProjectSelector = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-green-300 font-orbitron text-sm">
          You have access to multiple projects. Please select one to continue.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-300 font-orbitron">Select Project</label>
        <select
          className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-green-200 border border-green-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 hover:shadow-glow focus:shadow-glow font-orbitron transition-all duration-300 disabled:opacity-50"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          disabled={loading}
        >
          <option value="" className="bg-gray-900 text-gray-400">-- Choose a project --</option>
          {projects.map((project) => (
            <option key={project.openstack_id} value={project.openstack_id} className="bg-gray-900 text-white">
              {project.project_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        <button
          onClick={handleProjectSubmit}
          disabled={loading || !selectedProject}
          className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Confirming...' : 'Confirm Project'}
        </button>
        <button
          onClick={resetToLogin}
          disabled={loading}
          className="w-full bg-gray-700 text-green-300 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-orbitron text-sm disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          {loginStep === 'TWO_FACTOR' ? '2FA Verification' : loginStep === 'PROJECT_SELECTION' ? 'Select Project' : 'Login'}
        </h1>
        
        {/* Dựa vào loginStep để render component phù hợp */}
        {loginStep === 'CREDENTIALS' && renderCredentialsForm()}
        {loginStep === 'TWO_FACTOR' && render2FAForm()}
        {loginStep === 'PROJECT_SELECTION' && renderProjectSelector()}

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center font-orbitron">{error}</p>
          </div>
        )}

        {loginStep === 'CREDENTIALS' && (
          <div className="mt-6 flex justify-between items-center text-sm text-green-300 font-orbitron">
            <button onClick={() => navigate('/register')} className="hover:underline hover:text-green-400 transition disabled:opacity-50" disabled={loading}>
              Don't have an account? Register
            </button>
            <button onClick={() => navigate('/forgot-password')} className="hover:underline hover:text-green-400 transition disabled:opacity-50" disabled={loading}>
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;