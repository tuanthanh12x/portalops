import React from 'react';

import Header from '../../components/admin/Navbar';
import SubHeader from '../../components/admin/SubHeader';
import SectionWrapper from '../../components/admin/SectionWrapper';
import SystemOverview from '../../components/admin/SystemOverview';
import QuickActions from '../../components/admin/QuickActions';
import RevenueSection from '../../components/admin/RevenueSection';
import SupportTickets from '../../components/admin/SupportTickets';
import ActiveIncidents from '../../components/admin/ActiveIncidents';
import ResourceCharts from '../../components/admin/ResourceCharts';
import RecentActivity from '../../components/admin/RecentActivity';

const Dashboard = () => (
  <div className="min-h-screen w-screen bg-gray-900 overflow-x-hidden">
    <Header />
    <SubHeader />
    <main className="flex flex-col gap-6 px-6 py-8">
      <div className="grid grid-cols-8 gap-6">
        <div className="col-span-5 flex flex-col gap-6">
          
          <SectionWrapper><SystemOverview /></SectionWrapper>
          <SectionWrapper><ResourceCharts /></SectionWrapper>
          <SectionWrapper><RevenueSection /></SectionWrapper>
          <SectionWrapper><ActiveIncidents /></SectionWrapper>
        </div>
        <div className="col-span-3 flex flex-col gap-6">
          <SectionWrapper><QuickActions /></SectionWrapper>
          <SectionWrapper><SupportTickets /></SectionWrapper>
          <SectionWrapper><RecentActivity /></SectionWrapper>
        </div>
      </div>
    </main>
  </div>
);

export default Dashboard;