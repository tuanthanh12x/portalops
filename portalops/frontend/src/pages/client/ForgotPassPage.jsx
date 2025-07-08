import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/auth/forgot-password/', { email });
      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-3xl font-bold text-green-400 text-center mb-8 font-orbitron tracking-wide">
          Forgot Password
        </h1>

        {submitted ? (
          <div className="text-green-400 font-orbitron text-center">
            ✅ If this email is registered, a reset link has been sent.
            <br /> Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-300 font-orbitron">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none placeholder-gray-500 font-orbitron transition-all duration-300 hover:shadow-glow focus:shadow-glow"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-orbitron font-semibold tracking-wide"
            >
              Send Reset Link
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center font-orbitron animate-pulse">{error}</p>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-green-300 hover:underline hover:text-green-400 font-orbitron text-sm"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
