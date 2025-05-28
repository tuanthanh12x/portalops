import React from 'react';

const NotificationsCard = () => {
  return (
    <div className="futuristic-card p-4 rounded-lg shadow-sm relative overflow-hidden border border-[#2c2c3e]">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-200 font-fantasy">
          Notifications
        </h4>
        <span className="text-sm font-medium bg-gray-700 text-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
          0
        </span>
      </div>
      <div className="text-center text-gray-400 text-sm font-fantasy">
        No unread notifications
      </div>
      <div className="absolute inset-0 neon-glow pointer-events-none" />
    </div>
  );
};

export default NotificationsCard;
