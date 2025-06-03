import React from 'react';
import './AccountCard.css';

const AccountCard = () => {
  return (
    <div className="account-card p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden">
      <h4 className="text-xl font-semibold text-gray-100 mb-6 font-fantasy">Account</h4>
      <div className="space-y-5 text-sm text-gray-400 font-fantasy">
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Email</span>
          <span className="truncate max-w-xs text-gray-400" title="tuanthanhxp1901@gmail.com">
            tuanthanhxp1901@gmail.com
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">2FA</span>
          <span className="inline-block bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300 font-mono">
            Off
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Last Login</span>
          <time
            className="text-gray-400 text-xs font-mono"
            dateTime="2025-05-23T09:54:00"
          >
            May 23, 2025 9:54 AM
          </time>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Timezone</span>
          <span className="text-gray-400 text-xs font-mono">Asia/Bangkok</span>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
