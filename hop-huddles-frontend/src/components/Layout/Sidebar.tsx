// components/Layout/EnhancedSidebar.tsx - Enhanced sidebar with new navigation structure
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Settings,
  ArrowLeft,
  Sparkles,
  Shield,
  Heart,
  TrendingUp,
  Activity,
  BookDashed,
  LucideLayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'main-platform' | 'hop-huddles' | 'legacy';
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  permission?: string;
  external?: boolean;
  comingSoon?: boolean;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  isOpen, 
  onClose, 
  context = 'legacy' 
}) => {
  const { user, currentAgency } = useAuth();
  const navigate = useNavigate();

  // Navigation items based on context
  const getNavigationItems = (): NavigationItem[] => {
    switch (context) {
      case 'main-platform':
        return [
          {
            name: 'Platform Home',
            href: '/main-platform',
            icon: Home,
          },
          {
            name: 'HOP Huddles',
            href: '/hop-huddles-dashboard',
            icon: PlayCircle,
            permission: PERMISSIONS.HUDDLE_VIEW
          },
          {
            name: 'HOP Care',
            href: '/hop-care-dashboard',
            icon: Heart,
            comingSoon: true
          },
          {
            name: 'HOP Analytics',
            href: '/hop-analytics-dashboard',
            icon: TrendingUp,
            comingSoon: true
          },
          {
            name: 'HOP Wellness',
            href: '/hop-wellness-dashboard',
            icon: Activity,
            comingSoon: true
          }
        ];
      
      case 'hop-huddles':
        return [
          {
            name: 'Huddles Dashboard',
            href: '/hop-huddles-dashboard',
            icon: Home,
          },
          {
            name: 'Sequences',
            href: '/sequences',
            icon: BookOpen,
            permission: PERMISSIONS.HUDDLE_VIEW
          },
          {
            name: 'Users',
            href: '/users',
            icon: Users,
            permission: PERMISSIONS.USER_VIEW
          },
          {
            name: 'Branches',
            href: '/branches',
            icon: GitBranch,
            permission: PERMISSIONS.BRANCH_VIEW
          },
          {
            name: 'Teams',
            href: '/teams',
            icon: Building2,
            permission: PERMISSIONS.TEAM_VIEW
          },
          {
            name: 'Progress',
            href: '/progress',
            icon: BarChart3,
            permission: PERMISSIONS.PROGRESS_VIEW_OWN
          }
        ];
      
      default: // legacy
        return [
          {
            name: 'Main Platform',
            href: '/main-platform',
            icon: Sparkles,
          },
          {
            name: 'Dashboard',
            href: '/hud-dash',
            icon: LucideLayoutDashboard,
          },
          {
            name: 'Agencies',
            href: '/agencies',
            icon: Building,
            permission: PERMISSIONS.AGENCY_VIEW
          },
          {
            name: 'Branches',
            href: '/branches',
            icon: GitBranch,
            permission: PERMISSIONS.BRANCH_VIEW
          },
          {
            name: 'Teams',
            href: '/teams',
            icon: Building2,
            permission: PERMISSIONS.TEAM_VIEW
          },
          {
            name: 'Users',
            href: '/users',
            icon: Users,
            permission: PERMISSIONS.USER_VIEW
          },
          {
            name: 'Sequences',
            href: '/sequences',
            icon: BookOpen,
            permission: PERMISSIONS.HUDDLE_VIEW
          },
          {
            name: 'Progress',
            href: '/progress',
            icon: BarChart3,
            permission: PERMISSIONS.PROGRESS_VIEW_AGENCY
          }
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const filteredNavigation = navigationItems.filter(item => {
    if (item.comingSoon) return true; // Show coming soon items
    if (!item.permission) return true; // No permission required
    return hasPermission(user?.assignments || [], item.permission);
  });

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const handleBackNavigation = () => {
    switch (context) {
      case 'hop-huddles':
        navigate('/main-platform');
        break;
      case 'main-platform':
        // Could go to a different parent if needed
        break;
      default:
        navigate('/main-platform');
    }
  };

  const getSidebarTitle = () => {
    switch (context) {
      case 'main-platform':
        return 'HOP Platform';
      case 'hop-huddles':
        return 'HOP Huddles';
      default:
        return 'HOP Platform';
    }
  };

  const getSidebarIcon = () => {
    switch (context) {
      case 'main-platform':
        return <Sparkles size={20} className="text-white" />;
      case 'hop-huddles':
        return <PlayCircle size={20} className="text-white" />;
      default:
        return <Sparkles size={20} className="text-white" />;
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              {getSidebarIcon()}
            </div>
            <span className="text-xl font-semibold text-gray-900">{getSidebarTitle()}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Back Navigation (for sub-platforms) */}
        {(context === 'hop-huddles') && (
          <div className="px-4 py-2 border-b border-gray-100">
            <button
              onClick={handleBackNavigation}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Platform</span>
            </button>
          </div>
        )}

        {/* Agency Info */}
        {currentAgency && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center">
                <Building size={14} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {currentAgency.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentAgency.agencyStructure === 'SINGLE' ? 'Single Agency' : 'Enterprise'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              
              if (item.comingSoon) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                      Soon
                    </span>
                  </div>
                );
              }

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

        {/* Settings Link */}
        <div className="absolute bottom-16 left-0 right-0 px-4">
          <NavLink
            to="/settings"
            className={navLinkClass}
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.assignments
                  .filter(a => a.isActive)
                  .flatMap(a => a.roles || [a.role])
                  .slice(0, 2) // Show max 2 roles
                  .join(', ')
                  .replace(/_/g, ' ')
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedSidebar;