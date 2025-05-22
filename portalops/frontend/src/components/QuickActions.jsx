import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-3">
      <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
      <div className="flex flex-col gap-3">
        <Link to="/create-instance">
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition duration-200 shadow-md flex items-center justify-center gap-2">
            🚀 Create New Instance
          </button>
        </Link>

        <Link to="/storage/add">
          <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 active:scale-95 transition duration-200 shadow-md flex items-center justify-center gap-2">
            💾 Add Block Storage
          </button>
        </Link>

        <Link to="/billing">
          <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 active:scale-95 transition duration-200 shadow-md flex items-center justify-center gap-2">
            💳 View Billing
          </button>
        </Link>
      </div>
    </div>
  );
}
