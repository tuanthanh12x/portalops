import React from 'react';

const CreditsCard = () => {
  return (
    <div className="futuristic-card p-6 rounded-lg shadow relative overflow-hidden border border-[#2c2c3e]">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-200 font-fantasy">My Credits</h4>
        <button className="text-xs bg-[#3b82f6] text-white px-3 py-1 rounded hover:bg-[#2563eb] transition">
          Top up
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4 font-fantasy">
        💰 <strong>Remaining:</strong>{' '}
        <span className="text-[#3b82f6] font-semibold">55 Credits</span>
      </p>
      <div className="w-full text-sm text-gray-300 font-fantasy">
        <div className="grid grid-cols-4 gap-2 font-medium text-xs mb-2">
          <div className="text-left">Period</div>
          <div className="text-right">Used</div>
          <div className="text-right">Remaining</div>
          <div className="text-right">Total</div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs border-t border-[#2c2c3e] py-2">
          <div>Week</div>
          <div className="text-right text-yellow-500">12</div>
          <div className="text-right text-[#3b82f6]">88</div>
          <div className="text-right text-gray-500">100</div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs border-t border-[#2c2c3e] py-2">
          <div>Month</div>
          <div className="text-right text-yellow-500">45</div>
          <div className="text-right text-[#3b82f6]">55</div>
          <div className="text-right text-gray-500">100</div>
        </div>
      </div>
      <div className="absolute inset-0 neon-glow pointer-events-none" />
    </div>
  );
};

export default CreditsCard;
