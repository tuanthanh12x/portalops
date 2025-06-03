import React from 'react';

const CreditsCard = () => {
  return (
    <div className="credits-card p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-xl font-semibold text-gray-100 font-fantasy">My Credits</h4>
        <button
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded transition"
          type="button"
        >
          Top up
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-6 font-fantasy">
        💰 <strong>Remaining:</strong>{' '}
        <span className="text-indigo-400 font-semibold">55 Credits</span>
      </p>

      <div className="w-full text-sm text-gray-300 font-fantasy">
        <div className="grid grid-cols-4 gap-4 font-medium text-xs mb-3">
          <div className="text-left">Period</div>
          <div className="text-right">Used</div>
          <div className="text-right">Remaining</div>
          <div className="text-right">Total</div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-700 py-2">
          <div>Week</div>
          <div className="text-right text-yellow-400 font-semibold">12</div>
          <div className="text-right text-indigo-400 font-semibold">88</div>
          <div className="text-right text-gray-500">100</div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-700 py-2">
          <div>Month</div>
          <div className="text-right text-yellow-400 font-semibold">45</div>
          <div className="text-right text-indigo-400 font-semibold">55</div>
          <div className="text-right text-gray-500">100</div>
        </div>
      </div>
    </div>
  );
};

export default CreditsCard;
