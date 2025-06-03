import React from "react";

const CreditsCard = () => {
  return (
    <div className="relative bg-gradient-to-br bg-black/30
     border border-gray-700 rounded-2xl p-6 shadow-xl overflow-hidden text-sm">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-bold text-indigo-400 tracking-wide font-fantasy">
          💰 My Credits
        </h4>
        <button
          type="button"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Top Up
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        <strong className="text-white">Remaining:</strong>{" "}
        <span className="text-indigo-400 font-semibold">55 Credits</span>
      </p>

      <div className="w-full text-sm text-gray-300 font-mono">
        <div className="grid grid-cols-4 gap-4 font-medium text-xs mb-3 text-gray-400 uppercase tracking-wide">
          <div className="text-left">Period</div>
          <div className="text-right">Used</div>
          <div className="text-right">Remaining</div>
          <div className="text-right">Total</div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-700 py-2">
          <div className="text-left">Week</div>
          <div className="text-right text-yellow-400 font-semibold">12</div>
          <div className="text-right text-indigo-400 font-semibold">88</div>
          <div className="text-right text-gray-500">100</div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-700 py-2">
          <div className="text-left">Month</div>
          <div className="text-right text-yellow-400 font-semibold">45</div>
          <div className="text-right text-indigo-400 font-semibold">55</div>
          <div className="text-right text-gray-500">100</div>
        </div>
      </div>
    </div>
  );
};

export default CreditsCard;
