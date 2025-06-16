 import React, { useEffect, useState } from 'react'; 
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function TwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await axiosInstance.get('/auth/2fa/generate/');
        setQrCode(response.data.qr_code);
      } catch (err) {
        setError('Failed to generate QR code.');
      }
    };

    fetchQRCode();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    try {
      const response = await axiosInstance.post('/auth/2fa/verify/', { code });
      setStatus(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-green-500/30">
        <h1 className="text-2xl font-bold text-green-400 text-center mb-6 font-orbitron">Enable Two-Factor Authentication</h1>

        {qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-md border border-green-400" />
            <p className="text-green-300 text-sm text-center font-orbitron">Scan the QR code using Google Authenticator or a similar app.</p>
            <form onSubmit={handleVerify} className="w-full space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 text-white border border-green-600/50 rounded-lg focus:outline-none font-orbitron placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg font-orbitron font-semibold tracking-wide hover:from-green-700 hover:to-green-500 transition-all"
              >
                Confirm Setup
              </button>
            </form>
            {status && <p className="text-green-400 font-orbitron text-sm text-center">{status}</p>}
            {error && <p className="text-red-400 font-orbitron text-sm text-center animate-pulse">{error}</p>}
          </div>
        ) : (
          <p className="text-green-300 text-center font-orbitron">Generating QR code...</p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-green-300 hover:text-green-400 hover:underline font-orbitron text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorSetupPage;