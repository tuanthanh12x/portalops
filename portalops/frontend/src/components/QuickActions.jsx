import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <Link to="/create-instance">
  <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition duration-200 shadow-md">
    🚀 Create new Instance
  </button>
</Link>

        <Link to="/storage/add">
          <button className="w-full bg-blue-600 text-white py-2 rounded-xl">Add Block Storage</button>
        </Link>
        <Link to="/billing">
          <button className="w-full bg-blue-600 text-white py-2 rounded-xl">View Billing</button>
        </Link>
      </div>
    </div>
  );
}
