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
  UserCheck
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
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Agencies',
    href: '/agencies',
    icon: Building,
    roles: ['ADMIN'],
  },
  {
    name: 'Branches',
    href: '/branches',
    icon: GitBranch,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Building2,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN', 'BRANCH_MANAGER'],
  },
  {
    name: 'Huddle Sequences',
    href: '/sequences',
    icon: BookOpen,
    roles: ['ADMIN', 'BRANCH_MANAGER', 'EDUCATOR'],
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: BarChart3,
    roles: ['ADMIN', 'BRANCH_MANAGER', 'EDUCATOR', 'MANAGER'],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const userRoles = user?.assignments.map(assignment => assignment.role) || [];

  const filteredNavigation = navigationItems.filter(item => {
    if (!item.roles) return true;
    
    // Use the enhanced permission system
    const requiredPermissions = {
      'Agencies': PERMISSIONS.AGENCY_VIEW,
      'Branches': PERMISSIONS.BRANCH_VIEW,
      'Teams': PERMISSIONS.TEAM_VIEW,
      'Users': PERMISSIONS.USER_VIEW,
      'Huddle Sequences': PERMISSIONS.HUDDLE_VIEW,
      'Progress': PERMISSIONS.PROGRESS_VIEW_OWN
    };

    const permission = requiredPermissions[item.name as keyof typeof requiredPermissions];
    if (permission) {
      return hasPermission(user?.assignments || [], permission);
    }

    // Fallback to role-based checking for other items
    return item.roles.some(role => userRoles.includes(role as any));
  });

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
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCheck size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.assignments[0]?.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;