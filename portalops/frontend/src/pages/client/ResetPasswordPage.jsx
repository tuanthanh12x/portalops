import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function ResetPasswordPage() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await axiosInstance.post(`/reset-password/${uidb64}/${token}/`, {
        password,
      });
      setSubmitted(true);
    } catch (err) {
      setError('The link is invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Reset Password
        </h1>

        {submitted ? (
          <div className="text-green-400 text-center font-orbitron">
            ✅ Your password has been reset successfully.
            <br />
            <button
              onClick={() => navigate('/login')}
              className="mt-4 underline hover:text-green-300 transition"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-300 font-orbitron">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg placeholder-gray-500 font-orbitron hover:shadow-glow focus:shadow-glow focus:outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-300 font-orbitron">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg placeholder-gray-500 font-orbitron hover:shadow-glow focus:shadow-glow focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 font-orbitron tracking-wide font-semibold transition-all"
            >
              Reset Password
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center font-orbitron animate-pulse">{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
