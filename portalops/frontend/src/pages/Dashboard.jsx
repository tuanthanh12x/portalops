import React from 'react';
import Navbar from '../components/Navbar';
import ResourceOverview from '../components/ResourceOverview';
import QuickActions from '../components/QuickActions';
import ResourceUsage from '../components/ResourceUsage';
import RecentAlerts from '../components/RecentAlerts';
import MyInstances from '../components/MyInstances';

export default function Dashboard() {
  return (

    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-sky-100 via-white to-white">
      
      {/* Navbar trên cùng */}
      <Navbar credits={150} />

      {/* Phần chia đôi màn hình (2 cột 50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Bên trái: Resources */}
        <div className="space-y-6">
          <ResourceOverview />
          <ResourceUsage />
        </div>

        {/* Bên phải: Actions + Alerts */}
        <div className="space-y-6">
          <QuickActions />
          <RecentAlerts />
        </div>
      </div>

      {/* Phần dưới cùng toàn màn hình */}
      <div className="mt-6">
        <MyInstances />
      
      </div>
    </div>
  );
}
