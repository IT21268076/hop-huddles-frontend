// components/Layout/Sidebar.tsx - Enhanced with role-based navigation
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
  LucideLayoutDashboard,
  Plus,
  User,
  Eye,
  FileText,
  Calendar,
  Award,
  Target,
  Clipboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import RoleSwitcher from '../Common/RoleSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'main-platform' | 'hop-huddles' | 'legacy';
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  permission?: string;
  roles?: string[];
  external?: boolean;
  comingSoon?: boolean;
  badge?: string;
  description?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  context = 'legacy' 
}) => {
  const { user, currentAgency } = useAuth();
  const { activeRole, capabilities, roleBasedData } = useActiveRole();
  const navigate = useNavigate();

  // Get role-specific navigation structure
  const getNavigationSections = (): NavigationSection[] => {
    switch (context) {
      case 'main-platform':
        return [
          {
            title: 'Platform',
            items: [
              {
                name: 'Platform Home',
                href: '/main-platform',
                icon: Home,
                description: 'Main platform dashboard'
              }
            ]
          },
          {
            title: 'Applications',
            items: [
              {
                name: 'HOP Huddles',
                href: '/hop-huddles-dashboard',
                icon: PlayCircle,
                permission: PERMISSIONS.HUDDLE_VIEW,
                description: 'Micro-education platform'
              },
              {
                name: 'HOP Care',
                href: '/hop-care-dashboard',
                icon: Heart,
                comingSoon: true,
                description: 'Care management system'
              },
              {
                name: 'HOP Analytics',
                href: '/hop-analytics-dashboard',
                icon: TrendingUp,
                comingSoon: true,
                description: 'Advanced analytics platform'
              },
              {
                name: 'HOP Wellness',
                href: '/hop-wellness-dashboard',
                icon: Activity,
                comingSoon: true,
                description: 'Employee wellness platform'
              }
            ]
          }
        ];
      
      case 'hop-huddles':
        const huddleSections: NavigationSection[] = [
          {
            title: 'Dashboard',
            items: [
              {
                name: 'Huddles Dashboard',
                href: '/hop-huddles-dashboard',
                icon: LucideLayoutDashboard,
                description: 'Main huddles overview'
              }
            ]
          }
        ];

        // Role-specific huddles navigation
        if (capabilities.showEducatorFeatures) {
          huddleSections.push({
            title: 'Content Management',
            items: [
              {
                name: 'Sequence Management',
                href: '/sequences',
                icon: BookDashed,
                permission: PERMISSIONS.HUDDLE_VIEW,
                description: 'Manage huddle sequences'
              },
              {
                name: 'Create Sequence',
                href: '/sequences/create',
                icon: Plus,
                permission: PERMISSIONS.HUDDLE_CREATE,
                description: 'Create new sequence'
              },
              {
                name: 'Assessments',
                href: '/assessments',
                icon: Clipboard,
                permission: PERMISSIONS.HUDDLE_CREATE,
                comingSoon: true,
                description: 'Manage assessments'
              }
            ]
          });
        }

        if (capabilities.showAdminFeatures || capabilities.showManagerFeatures) {
          huddleSections.push({
            title: 'Management',
            items: [
              ...(capabilities.canManageBranches ? [{
                name: 'Branch Management',
                href: '/branches',
                icon: Building,
                permission: PERMISSIONS.BRANCH_VIEW,
                description: 'Manage branches'
              }] : []),
              ...(capabilities.canManageTeams ? [{
                name: 'Team Management',
                href: '/teams',
                icon: Users,
                permission: PERMISSIONS.TEAM_VIEW,
                description: 'Manage teams'
              }] : []),
              ...(capabilities.canManageUsers ? [{
                name: 'User Management',
                href: '/users',
                icon: UserCheck,
                permission: PERMISSIONS.USER_VIEW,
                description: 'Manage users'
              }] : [])
            ]
          });
        }

        if (capabilities.canViewUserProgress || capabilities.canViewOwnProgress) {
          huddleSections.push({
            title: 'Analytics',
            items: [
              {
                name: 'Progress Tracking',
                href: '/progress',
                icon: BarChart3,
                permission: PERMISSIONS.PROGRESS_VIEW_OWN,
                description: 'Track learning progress'
              },
              ...(capabilities.canViewAgencyAnalytics ? [{
                name: 'Agency Analytics',
                href: '/analytics/agency',
                icon: TrendingUp,
                permission: PERMISSIONS.PROGRESS_VIEW_AGENCY,
                comingSoon: true,
                description: 'Agency-wide analytics'
              }] : [])
            ]
          });
        }

        if (capabilities.showClinicianFeatures) {
          huddleSections.push({
            title: 'Learning',
            items: [
              {
                name: 'My Huddles',
                href: '/my-huddles',
                icon: PlayCircle,
                description: 'Assigned huddles'
              },
              {
                name: 'My Progress',
                href: '/my-progress',
                icon: Target,
                description: 'Personal learning progress'
              },
              {
                name: 'Assessments',
                href: '/my-assessments',
                icon: FileText,
                description: 'Pending assessments'
              },
              {
                name: 'Certificates',
                href: '/certificates',
                icon: Award,
                comingSoon: true,
                description: 'Earned certificates'
              }
            ]
          });
        }

        return huddleSections;

      default:
        // Legacy navigation with role-based filtering
        return [
          {
            title: 'Main',
            items: [
              {
                name: 'Dashboard',
                href: '/hud-dash',
                icon: LucideLayoutDashboard,
                description: 'Overview dashboard'
              }
            ]
          },
          {
            title: 'Management',
            items: [
              ...(capabilities.canManageAgency ? [{
                name: 'Agency',
                href: '/agency',
                icon: Building2,
                permission: PERMISSIONS.AGENCY_VIEW,
                description: 'Agency settings'
              }] : []),
              ...(capabilities.canManageBranches ? [{
                name: 'Branches',
                href: '/branches',
                icon: GitBranch,
                permission: PERMISSIONS.BRANCH_VIEW,
                description: 'Manage branches'
              }] : []),
              ...(capabilities.canManageTeams ? [{
                name: 'Teams',
                href: '/teams',
                icon: Users,
                permission: PERMISSIONS.TEAM_VIEW,
                description: 'Manage teams'
              }] : []),
              ...(capabilities.canManageUsers ? [{
                name: 'Users',
                href: '/users',
                icon: UserCheck,
                permission: PERMISSIONS.USER_VIEW,
                description: 'Manage users'
              }] : [])
            ].filter(item => item) // Remove undefined items
          },
          {
            title: 'Content',
            items: [
              ...(capabilities.canViewUserProgress ? [{
                name: 'Sequences',
                href: '/sequences',
                icon: BookOpen,
                permission: PERMISSIONS.HUDDLE_VIEW,
                description: 'Huddle sequences'
              }] : []),
              ...(capabilities.canViewUserProgress ? [{
                name: 'Progress',
                href: '/progress',
                icon: BarChart3,
                permission: PERMISSIONS.PROGRESS_VIEW_OWN,
                description: 'Learning progress'
              }] : [])
            ].filter(item => item)
          }
        ];
    }
  };

  const navigationSections = getNavigationSections();
  
  // Filter navigation items based on permissions and roles
  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Check if coming soon items should be hidden for this role
      if (item.comingSoon && capabilities.showClinicianFeatures) {
        return false; // Hide coming soon items for clinicians
      }

      // Check role-specific access
      if (item.roles && activeRole && !item.roles.includes(activeRole)) {
        return false;
      }

      // Check permission-based access
      if (item.permission && user) {
        return hasPermission(user.assignments, item.permission);
      }

      return true;
    })
  })).filter(section => section.items.length > 0); // Remove empty sections

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Role Switcher Section */}
        {activeRole && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Role</p>
            </div>
            <RoleSwitcher variant="sidebar" />
            
            {/* Quick role info */}
            {capabilities.accessScope && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {capabilities.accessScope.toLowerCase()} access
                </span>
              </div>
            )}
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
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-6">
            {filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.comingSoon) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                          title={item.description}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon size={20} />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
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
                        title={item.description}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Settings Link */}
        <div className="border-t border-gray-200 p-4">
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
      </div>
    </>
  );
};

export default Sidebar;