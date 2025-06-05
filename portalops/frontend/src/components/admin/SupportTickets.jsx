import React from 'react';
import { MessageSquareWarning, LifeBuoy, AlertTriangle, Clock } from 'lucide-react';

// Component hiển thị thống kê số liệu
const TicketStat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-md bg-${color}-800/30 text-${color}-300`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  </div>
);

// Component hiển thị một ticket nhỏ trong danh sách
const TicketItem = ({ ticket }) => (
  <div className="border border-gray-700 rounded-md p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition">
    <div className="flex justify-between text-sm text-gray-300 mb-1">
      <span className="font-medium text-indigo-300">#{ticket.id}</span>
      <span className={`font-semibold ${ticket.urgent ? 'text-red-500' : 'text-gray-400'}`}>
        {ticket.urgent ? 'Urgent' : ''}
      </span>
    </div>
    <div className="text-white font-semibold truncate">{ticket.subject}</div>
    <div className="text-xs text-gray-400 mt-1">Last update: {ticket.lastUpdate}</div>
  </div>
);

const SupportTickets = () => {
  // Dữ liệu thống kê tạm thời (thay bằng API thực tế)
  const stats = {
    total: 24,
    open: 10,
    urgent: 3,
    unreplied: 5,
  };

  // Dữ liệu ticket cần rep gần nhất (tạm thời)
  const recentTickets = [
    { id: 1023, subject: 'Cannot connect to instance', lastUpdate: '2025-06-03 14:23', urgent: true },
    { id: 1019, subject: 'Billing invoice issue', lastUpdate: '2025-06-02 11:15', urgent: false },
    { id: 1007, subject: 'Password reset not working', lastUpdate: '2025-06-01 09:45', urgent: false },
    { id: 1003, subject: 'Slow network performance', lastUpdate: '2025-05-31 16:10', urgent: true },
    { id: 2998, subject: 'Request for new VM creation', lastUpdate: '2025-05-30 13:05', urgent: false },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">Support Tickets</h2>
        <button
          className="text-sm text-indigo-400 hover:text-indigo-300 underline transition-all"
          onClick={() => alert('Redirect to Ticket List Page')}
        >
          View All Tickets
        </button>
      </div>

      {/* Phần thống kê */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <TicketStat icon={LifeBuoy} label="Total" value={stats.total} color="sky" />
        <TicketStat icon={MessageSquareWarning} label="Open" value={stats.open} color="emerald" />
        <TicketStat icon={AlertTriangle} label="Urgent" value={stats.urgent} color="red" />
        <TicketStat icon={Clock} label="Unreplied" value={stats.unreplied} color="amber" />
      </div>

      {/* Danh sách 5 ticket cần rep gần nhất */}
      <div>
        <h3 className="text-white text-md font-semibold mb-3">Recent Tickets Needing Reply</h3>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {recentTickets.map(ticket => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
