import React from 'react';

// Icon đơn sắc trung tính
const ActionItemIcon = ({ className = "w-8 h-8 sm:w-9 sm:h-9", iconColor = "#d1d5db" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke={iconColor}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75l-9-5.25L3.75 9.75m18 0l-9 5.25m9-5.25v9l-9 5.25M3.75 9.75L12 15m0 0V21m0-6L3.75 9.75M12 15l9-5.25m-9 5.25l-9-5.25m9 5.25V5.25" />
  </svg>
);

// Nút hành động với tone trung tính
const ActionButton = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex flex-col items-center justify-center p-4 rounded-xl 
               bg-gray-800 hover:bg-gray-700 border border-gray-700/50 
               transition-all duration-200 ease-in-out shadow-sm group"
  >
    <div className="mb-2 text-gray-300 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-200 group-hover:text-white text-center">
      {text}
    </span>
  </button>
);

const QuickActions = () => {
  const handleActionClick = (actionName) => {
    console.log(`Quick Action: ${actionName}`);
    alert(`Activated: ${actionName} (This is a placeholder)`);
  };

  const actions = [
    { id: 'launchInstance', text: 'Launch Instance' },
    { id: 'createProject', text: 'Create Project' },
    { id: 'createUser', text: 'Create User' },
    { id: 'createVolume', text: 'Create Volume' },
    { id: 'createNetwork', text: 'Create Network' },
    { id: 'securityGroups', text: 'Security Groups' },
    { id: 'uploadImage', text: 'Upload Image' },
    { id: 'createFlavor', text: 'Create Flavor' },
    { id: 'serviceStatus', text: 'Service Status' },
    { id: 'manageRoles', text: 'Manage Roles' },
    { id: 'createRouter', text: 'Create Router' },
    { id: 'manageQuotas', text: 'Manage Quotas' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            icon={<ActionItemIcon />}
            text={action.text}
            onClick={() => handleActionClick(action.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
