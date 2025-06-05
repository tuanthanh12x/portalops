import React from 'react';

const SubHeader = () => (
  <div className="w-full bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center border-b border-gray-700">
    <div className="text-gray-200 font-medium">Admin Profile</div>
    <div className="flex space-x-4">
      <span className="bg-red-800 text-red-300 px-2 py-1 text-xs font-bold rounded-full">Alerts (3)</span>
      <span className="bg-green-800 text-green-300 px-2 py-1 text-xs font-bold rounded-full">System Status: OK</span>
    </div>
  </div>
);

export default SubHeader;