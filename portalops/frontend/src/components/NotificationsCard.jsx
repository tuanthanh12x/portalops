import React from "react";

const NotificationsCard = () => {
  return (
    <div className="relative p-6 rounded-lg shadow-xl border border-gray-700 bg-black/30 backdrop-blur-lg overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-xl font-semibold text-indigo-400 font-fantasy">
          Notifications
        </h4>
        <span className="text-sm font-medium bg-gray-800 text-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
          0
        </span>
      </div>
      <div className="text-center text-gray-400 text-sm font-fantasy">
        No unread notifications
      </div>
    </div>
  );
};

export default NotificationsCard;
