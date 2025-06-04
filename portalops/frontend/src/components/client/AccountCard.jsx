import React from "react";

const AccountCard = () => {
  return (
    <div className="relative bg-black/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl overflow-hidden text-sm text-gray-300 font-sans">
      <h4 className="text-2xl font-bold text-indigo-400 mb-6 tracking-wide drop-shadow-md font-fantasy">
        👤 Account Overview
      </h4>

      <div className="space-y-5">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-400">Email</span>
          <span
            className="truncate max-w-[200px] text-right"
            title="tuanthanhxp1901@gmail.com"
          >
            tuanthanhxp1901@gmail.com
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-400">2FA</span>
          <span className="px-3 py-1 rounded-full bg-yellow-900 text-yellow-400 text-xs font-mono border border-yellow-600">
            Off
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-gray-400">Last Login</span>
          <time
            dateTime="2025-05-23T09:54:00"
            className="text-right font-mono text-xs text-gray-400"
          >
            May 23, 2025 — 9:54 AM
          </time>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-gray-400">Timezone</span>
          <span className="text-xs font-mono text-gray-400">Asia/Bangkok</span>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
