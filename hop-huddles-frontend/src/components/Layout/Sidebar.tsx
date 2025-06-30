import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Building, 
  GitBranch, 
  Users, 
  BookOpen, 
  PlayCircle, 
  BarChart3, 
  X,
  Building2,
  UserCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  permission?: string; // Use permission-based access instead of roles
  description?: string; // For debugging
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    // No permission required - everyone can access dashboard
  },
  {
    name: 'Agencies',
    href: '/agencies',
    icon: Building,
    permission: PERMISSIONS.AGENCY_VIEW,
    description: 'View and manage agencies'
  },
  {
    name: 'Branches',
    href: '/branches',
    icon: GitBranch,
    permission: PERMISSIONS.BRANCH_VIEW,
    description: 'View and manage branches'
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Building2,
    permission: PERMISSIONS.TEAM_VIEW,
    description: 'View and manage teams'
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    permission: PERMISSIONS.USER_VIEW,
    description: 'View and manage users'
  },
  {
    name: 'Huddle Sequences',
    href: '/sequences',
    icon: BookOpen,
    permission: PERMISSIONS.HUDDLE_VIEW,
    description: 'View and manage huddle sequences'
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: BarChart3,
    permission: PERMISSIONS.PROGRESS_VIEW_OWN,
    description: 'View progress and analytics'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Debug logging (remove in production)
  React.useEffect(() => {
    if (user) {
      console.log('Current User:', user.name);
      console.log('User Assignments:', user.assignments);
      console.log('User Roles:', user.assignments.map(a => a.role));
      console.log('User Role Arrays:', user.assignments.map(a => a.roles));
    }
  }, [user]);

  const filteredNavigation = navigationItems.filter(item => {
    // Dashboard is always visible
    if (!item.permission) {
      return true;
    }

    // Check if user has required permission
    const hasAccess = hasPermission(user?.assignments || [], item.permission);
    
    // Debug logging for each navigation item
    console.log(`Navigation "${item.name}":`, {
      permission: item.permission,
      hasAccess,
      userAssignments: user?.assignments?.length || 0
    });

    return hasAccess;
  });

  // Debug: Log filtered navigation
  console.log('Filtered Navigation Items:', filteredNavigation.map(item => item.name));

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-gray-100 text-black font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-600 rounded-lg flex items-center justify-center">
              <PlayCircle size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">HOP Huddles</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={navLinkClass}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Development Debug Panel */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-3 bg-gray-100 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Debug Info</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>User: {user?.name}</div>
                <div>Primary Role: {user?.assignments[0]?.role}</div>
                <div>All Roles: {user?.assignments[0]?.roles?.join(', ')}</div>
                <div>Access Scope: {user?.assignments[0]?.accessScope}</div>
                <div>Visible Items: {filteredNavigation.length}</div>
              </div>
            </div>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.assignments[0]?.role?.replace('_', ' ')}
              </p>
              {user?.assignments[0]?.branchName && (
                <p className="text-xs text-gray-400 truncate">
                  {user.assignments[0].branchName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;