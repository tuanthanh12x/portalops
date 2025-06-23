import React from 'react';

// Component Icon Placeholder (bạn nên thay thế bằng icon SVG thật hoặc từ thư viện)
// Ví dụ một icon placeholder đơn giản:
const PlaceholderIcon = ({ className = "w-5 h-5 mr-2", iconColor = "text-indigo-400" }) => (
  <div className={`${className} ${iconColor} p-0.5 rounded-sm flex items-center justify-center`}>
    {/* Đây chỉ là một hình vuông đơn giản, bạn có thể thay bằng SVG phức tạp hơn */}
    <svg className="w-full h-full" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1">
      <rect x="1" y="1" width="8" height="8" rx="1" />
    </svg>
  </div>
);


// Component Card cho mỗi thông số (StatCard)
const StatCard = ({ icon, title, value, unit, progressBarValue, statusColor, subText }) => {
  return (
    <div className="bg-gray-800/70 p-4 rounded-xl shadow-xl border border-gray-700/80 
                   hover:border-indigo-500/70 transition-all duration-200 ease-in-out 
                   transform hover:scale-[1.02] hover:shadow-indigo-500/20">
      <div className="flex items-center text-gray-300 mb-2">
        {icon}
        <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-2xl sm:text-3xl font-semibold ${statusColor ? statusColor : 'text-indigo-300'} mb-1 truncate`} title={String(value)}>
        {value}
        {unit && <span className="text-base sm:text-xl ml-1 text-gray-500">{unit}</span>}
      </div>
      {subText && <div className="text-xs text-gray-500 mb-2">{subText}</div>}
      {progressBarValue !== undefined && progressBarValue !== null && !isNaN(progressBarValue) && (
        <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-2.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressBarValue}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

const SystemOverview = () => {
  // Dữ liệu giả lập - bạn sẽ thay thế bằng dữ liệu thực tế
  const activeUsers = 'XX';
  const totalVMs = 'XX';
  const storageUsage = 65; // Ví dụ: 65% (nên là số để thanh tiến trình hoạt động)
  const ramUsage = 78;     // Ví dụ: 78%
  const cpuLoad = '0.65';  // Có thể là "XX" nếu chưa có dữ liệu
  const cpuCores = '4 Cores';
  const networkIn = 'XX';
  const networkOut = 'XX';
  const systemUptime = 'XX'; // Ví dụ: "120d 5h 32m"
  const runningProcesses = 'XX';
  const overallSystemStatus = 'Healthy'; // Các trạng thái khác: 'Warning', 'Critical'
  
  let systemStatusColor = 'text-green-400';
  let systemStatusDotColor = 'bg-green-500 animate-pulse';

  if (overallSystemStatus === 'Warning') {
    systemStatusColor = 'text-yellow-400';
    systemStatusDotColor = 'bg-yellow-500';
  } else if (overallSystemStatus === 'Critical') {
    systemStatusColor = 'text-red-400';
    systemStatusDotColor = 'bg-red-500';
  }

  // Hàm pomocnicza để parse giá trị XX thành số hoặc trả về 0
  const parseValue = (val, fallback = 0) => {
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  return (
    <div className="w-full"> {/* Đảm bảo component này chiếm đủ không gian được cấp */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight mb-2 sm:mb-0">
          SYSTEM OVERVIEW
        </h2>
        <div className="flex items-center px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
          <span className={`w-3 h-3 rounded-full inline-block mr-2 ${systemStatusDotColor}`}></span>
          <span className={`text-sm font-semibold ${systemStatusColor}`}>{overallSystemStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={<PlaceholderIcon iconColor="text-sky-400" />}
          title="Active Users"
          value={activeUsers}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-teal-400" />}
          title="Total VMs"
          value={totalVMs}
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-amber-400" />}
          title="Storage Used"
          value={storageUsage === 'XX' ? 'XX' : storageUsage}
          unit={storageUsage === 'XX' ? '' : "%"}
          progressBarValue={parseValue(storageUsage)}
        />

        <StatCard
          icon={<PlaceholderIcon iconColor="text-cyan-400" />}
          title="CPU Load Avg (1m)"
          value={cpuLoad}
          subText={cpuCores} // Hiển thị số cores ở dòng phụ
        />
         <StatCard
          icon={<PlaceholderIcon iconColor="text-lime-400" />}
          title="Network In"
          value={networkIn}
          unit="Mbps"
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-fuchsia-400" />}
          title="Network Out"
          value={networkOut}
          unit="Mbps"
        />
        <StatCard
          icon={<PlaceholderIcon iconColor="text-slate-400" />}
          title="System Uptime"
          value={systemUptime}
        />
         <StatCard
          icon={<PlaceholderIcon iconColor="text-violet-400" />}
          title="Running Processes"
          value={runningProcesses}
        />
      </div>
    </div>
  );
};

export default SystemOverview;