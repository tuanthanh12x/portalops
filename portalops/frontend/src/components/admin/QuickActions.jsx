import React from 'react';
import { Link } from 'react-router-dom';

// OpenStack specific icons
const LaunchIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ProjectIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const FlavorIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const UserIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const VolumeIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
  </svg>
);

const NetworkIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const SecurityIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ImageIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ServiceIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RoleIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const RouterIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const QuotaIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

// Enhanced action button with better styling and effects
const ActionLinkButton = ({ icon, text, to, color = "blue", isNew = false, description }) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/60 text-blue-300 hover:text-blue-200 hover:shadow-blue-500/25",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/60 text-green-300 hover:text-green-200 hover:shadow-green-500/25",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 hover:shadow-purple-500/25",
    orange: "from-orange-500/20 to-amber-500/20 border-orange-500/30 hover:border-orange-400/60 text-orange-300 hover:text-orange-200 hover:shadow-orange-500/25",
    pink: "from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-400/60 text-pink-300 hover:text-pink-200 hover:shadow-pink-500/25",
    indigo: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 hover:border-indigo-400/60 text-indigo-300 hover:text-indigo-200 hover:shadow-indigo-500/25",
    teal: "from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:border-teal-400/60 text-teal-300 hover:text-teal-200 hover:shadow-teal-500/25",
    red: "from-red-500/20 to-rose-500/20 border-red-500/30 hover:border-red-400/60 text-red-300 hover:text-red-200 hover:shadow-red-500/25"
  };

  return (
    <Link
      to={to}
      className="group relative"
    >
      <div className={`
        relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl 
        bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm
        border transition-all duration-300 ease-out 
        hover:scale-[1.05] hover:shadow-2xl transform-gpu
        min-h-[100px] sm:min-h-[120px]
      `}>
        {isNew && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            NEW
          </div>
        )}
        
        <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        
        <span className="text-sm sm:text-base font-semibold text-center leading-tight mb-1">
          {text}
        </span>
        
        {description && (
          <span className="text-xs text-slate-400 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {description}
          </span>
        )}
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent pointer-events-none" />
      </div>
    </Link>
  );
};

const QuickActions = () => {
  const actions = [
      { 
      id: 'createProject', 
      text: 'Create Project', 
      to: '/admin/create-project',
      icon: <ProjectIcon />,
      color: 'green',
      description: 'Set up a new tenant'
    },
    { 
      id: 'launchInstance', 
      text: 'Launch Instance', 
      to: '/admin/create-instance',
      icon: <LaunchIcon />,
      color: 'blue',
      description: 'Create a new virtual machine'
    },
  
    { 
      id: 'createFlavor', 
      text: 'Create Package', 
      to: '/admin/create-package',
      icon: <FlavorIcon />,
      color: 'purple',
      description: 'Define instance specifications'
    },
    { 
      id: 'createUser', 
      text: 'Create User', 
      to: '/create-user',
      icon: <UserIcon />,
      color: 'orange',
      description: 'Add new system user'
    },
    { 
      id: 'createVolume', 
      text: 'Create Volume', 
      to: '/volumes/create',
      icon: <VolumeIcon />,
      color: 'pink',
      description: 'Allocate block storage'
    },
    { 
      id: 'createNetwork', 
      text: 'Create Network', 
      to: '/admin/create-networks',
      icon: <NetworkIcon />,
      color: 'indigo',
      description: 'Configure virtual network'
    },
    { 
      id: 'securityGroups', 
      text: 'Security Groups', 
      to: '/security-groups',
      icon: <SecurityIcon />,
      color: 'red',
      description: 'Manage firewall rules'
    },
    { 
      id: 'uploadImage', 
      text: 'Upload Image', 
      to: '/admin/create-images',
      icon: <ImageIcon />,
      color: 'teal',
      description: 'Add OS images'
    },
    { 
      id: 'serviceStatus', 
      text: 'Service Status', 
      to: '/admin/services',
      icon: <ServiceIcon />,
      color: 'blue',
      description: 'Monitor system services'
    },
    { 
      id: 'manageRoles', 
      text: 'Manage Roles', 
      to: '/admin/roles',
      icon: <RoleIcon />,
      color: 'green',
      description: 'Configure user permissions'
    },
    { 
      id: 'createRouter', 
      text: 'Create Router', 
      to: '/routers/create',
      icon: <RouterIcon />,
      color: 'purple',
      description: 'Set up network routing',
      isNew: true
    },
    { 
      id: 'manageQuotas', 
      text: 'Manage Quotas', 
      to: '/admin/quotas',
      icon: <QuotaIcon />,
      color: 'orange',
      description: 'Control resource limits'
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          Quick Actions
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">Ready</span>
        </div>
      </div>
      
      {/* Action grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
        {actions.map((action) => (
          <ActionLinkButton
            key={action.id}
            icon={action.icon}
            text={action.text}
            to={action.to}
            color={action.color}
            isNew={action.isNew}
            description={action.description}
          />
        ))}
      </div>
      
      {/* Quick stats */}
      <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Compute Actions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Admin Functions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>Resource Management</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>New Features</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;