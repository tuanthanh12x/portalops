import React from 'react';
import './AccountCard.css';

const AccountCard = () => {
  return (
    <div className="futuristic-card p-5 rounded-lg shadow-sm relative overflow-hidden border border-[#2c2c3e]">
      <h4 className="text-lg font-semibold text-gray-200 mb-4 font-fantasy">
        Account
      </h4>
      <div className="space-y-3 text-sm text-gray-400 font-fantasy">
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Email</span>
          <span className="text-gray-400">tuanthanhxp1901@gmail.com</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">2FA</span>
          <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-300">
            Off
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Last Login</span>
          <span className="text-gray-400 text-xs">
            May 23, 2025 9:54 AM
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Timezone</span>
          <span className="text-gray-400 text-xs">Asia/Bangkok</span>
        </div>
      </div>
      <div className="absolute inset-0 neon-glow pointer-events-none" />
    </div>
  );
};

export default AccountCard;
