import React from 'react';
import { Link } from 'react-router-dom';

// Icon đơn sắc trung tính với hiệu ứng chuyển màu
const ActionItemIcon = ({ className = "w-8 h-8 sm:w-9 sm:h-9", iconColor = "#d1d5db" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke={iconColor}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75l-9-5.25L3.75 9.75m18 0l-9 5.25m9-5.25v9l-9 5.25M3.75 9.75L12 15m0 0V21m0-6L3.75 9.75M12 15l9-5.25m-9 5.25l-9-5.25m9 5.25V5.25" />
  </svg>
);

// Link hành động có hiệu ứng
const ActionLinkButton = ({ icon, text, to }) => (
  <Link
    to={to}
    className="w-full flex flex-col items-center justify-center p-4 rounded-xl 
               bg-gray-800 hover:bg-gray-700 border border-gray-700/50 
               transition-all duration-200 ease-in-out shadow group hover:scale-[1.03]"
  >
    <div className="mb-2 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-200 group-hover:text-white text-center">
      {text}
    </span>
  </Link>
);

const QuickActions = () => {
  const actions = [
    { id: 'launchInstance', text: 'Launch Instance', to: '/create-user' },
    { id: 'createProject', text: 'Create Project', to: '/create-user' },
    { id: 'createUser', text: 'Create User', to: '/create-user' },
    { id: 'createVolume', text: 'Create Volume', to: '/volumes/create' },
    { id: 'createNetwork', text: 'Create Network', to: '/networks/create' },
    { id: 'securityGroups', text: 'Security Groups', to: '/security-groups' },
    { id: 'uploadImage', text: 'Upload Image', to: '/images/upload' },
    { id: 'createFlavor', text: 'Create Flavor', to: '/admin/create-flavor' },
    { id: 'serviceStatus', text: 'Service Status', to: '/admin/services' },
    { id: 'manageRoles', text: 'Manage Roles', to: '/admin/roles' },
    { id: 'createRouter', text: 'Create Router', to: '/routers/create' },
    { id: 'manageQuotas', text: 'Manage Quotas', to: '/admin/quotas' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-200">⚡ Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {actions.map((action) => (
          <ActionLinkButton
            key={action.id}
            icon={<ActionItemIcon />}
            text={action.text}
            to={action.to}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
