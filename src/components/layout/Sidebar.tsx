// components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  Home,
  UserCheck,
  FileText,
  Award,
  Shield,
} from 'lucide-react';
import { cn, isSuperAdmin } from '../../utils/helpers';
import { usePermissions } from '../../hooks/usePermissions';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/Auth0Context';
import { CalendarWidget } from '../calendar/CalendarWidget';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof ReturnType<typeof usePermissions>;
  badge?: string;
}

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { currentAssignment, currentUser, currentAgency } = useApp();
  const { user } = useAuth();
  const permissions = usePermissions();

  // Debug logging for branch visibility
  console.log('Sidebar Debug:', {
    accessLevel: permissions.accessLevel,
    subscriptionPlan: currentAgency?.subscriptionPlan,
    agencyName: currentAgency?.name,
    canManageBranch: permissions.canManageBranch,
    canViewBranchAnalytics: permissions.canViewBranchAnalytics,
    currentRole: permissions.currentRole
  });

  // Check if user is superadmin
  const isUserSuperAdmin = isSuperAdmin(currentUser, user);

  // Create navigation based on user's role and access level
  const getNavigationItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
      },
    ];

    // Personal Level Items (All Users)
    const personalItems: NavItem[] = [
      {
        name: 'My Huddles',
        href: '/my-huddles',
        icon: FileText,
        permission: 'canViewPersonalHuddles',
      },
      {
        name: 'My Progress',
        href: '/progress',
        icon: UserCheck,
        permission: 'canViewPersonalProgress',
      },
    ];

    // Team Level Items (Clinical Manager and above)
    const teamItems: NavItem[] = [
      {
        name: permissions.accessLevel === 'team' ? 'My Team' : 'Team Management',
        href: '/teams',
        icon: Users,
        permission: 'canManageTeam',
      },
      {
        name: permissions.accessLevel === 'team' ? 'My Team Analytics' : 'Team Analytics',
        href: '/analytics/team',
        icon: BarChart3,
        permission: 'canViewTeamAnalytics',
      },
    ];

    // Branch Level Items (Director and above)
    const branchItems: NavItem[] = [
      {
        name: permissions.accessLevel === 'branch' ? 'My Branch' : 'Branch Management',
        href: '/branches',
        icon: Building2,
        permission: 'canManageBranch',
      },
      {
        name: permissions.accessLevel === 'branch' ? 'My Branch Analytics' : 'Branch Analytics',
        href: '/analytics/branch',
        icon: BarChart3,
        permission: 'canViewBranchAnalytics',
      },
    ];

    // Agency Level Items (Admin/Educator)
    const agencyItems: NavItem[] = [
      {
        name: 'Agency Settings',
        href: '/agencies',
        icon: Building2,
        permission: 'canManageAgency',
      },
      {
        name: 'User Management',
        href: '/users',
        icon: Users,
        permission: 'canManageAgencyUsers',
      },
      {
        name: 'Huddle Sequences',
        href: '/sequences',
        icon: BookOpen,
        permission: 'canManageHuddleSequences',
      },
      {
        name: 'Assessments',
        href: '/assessments',
        icon: Award,
        permission: 'canCreateAssessments',
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        permission: 'canViewAgencyAnalytics',
      },
      {
        name: 'Scheduling',
        href: '/scheduling',
        icon: Calendar,
        permission: 'canScheduleHuddles',
      },
    ];

    // Platform Level Items (Super Admin)
    const platformItems: NavItem[] = [
      {
        name: 'SuperAdmin',
        href: '/superadmin',
        icon: Shield,
      },
    ];

    const commonItems: NavItem[] = [
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ];

    // Combine items based on access level
    let allItems = [...baseItems, ...personalItems];

    // If user is superadmin, show only relevant items
    if (isUserSuperAdmin) {
      // For superadmin, the dashboard should go to superadmin dashboard
      const superAdminBaseItems: NavItem[] = [
        {
          name: 'Dashboard',
          href: '/superadmin',
          icon: Home,
        },
      ];
      allItems = [...superAdminBaseItems, ...personalItems, ...platformItems, ...commonItems];
      return allItems;
    }

    // Regular user navigation based on access level
    if (permissions.accessLevel === 'team' || permissions.accessLevel === 'branch' || permissions.accessLevel === 'agency' || permissions.accessLevel === 'platform') {
      allItems = [...allItems, ...teamItems];
    }

    if (permissions.accessLevel === 'branch' || permissions.accessLevel === 'agency' || permissions.accessLevel === 'platform') {
      // Show branch items for users with branch-level access
      // In development: always show if user has permission
      // In production: check subscription plan
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           window.location.hostname === 'localhost' ||
                           !currentAgency?.subscriptionPlan;
      
      if (isDevelopment || currentAgency?.subscriptionPlan === 'ENTERPRISE') {
        allItems = [...allItems, ...branchItems];
      }
    }

    if (permissions.accessLevel === 'agency' || permissions.accessLevel === 'platform') {
      allItems = [...allItems, ...agencyItems];
    }

    if (permissions.accessLevel === 'platform') {
      allItems = [...allItems, ...platformItems];
    }

    allItems = [...allItems, ...commonItems];

    return allItems;
  };

  const navigation = getNavigationItems();

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || permissions[item.permission]
  );

  const handleNavClick = () => {
    // Close mobile sidebar when nav item is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-full">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Calendar Widget */}
      {!isUserSuperAdmin && currentUser && (
        <div className="px-4 py-4 border-t border-gray-200">
          <CalendarWidget
            compact={true}
            showUpcoming={true}
            onEventClick={(event) => {
              // Handle event click - navigate to appropriate page
              if ('huddleId' in event && event.huddleId) {
                // Navigate to huddle or sequence
                if (event.sequenceId) {
                  window.location.href = `/sequences/${event.sequenceId}`;
                }
              } else if ('type' in event && event.type === 'assessment') {
                // Navigate to assessments
                window.location.href = '/assessments';
              }
            }}
            onViewAllClick={() => {
              // Navigate to full calendar view
              window.location.href = '/calendar';
            }}
          />
        </div>
      )}

      {/* Quick Actions */}
      {(permissions.canManageHuddleSequences || permissions.canCreateSequence) && (
        <div className="px-4 py-4 border-t border-gray-200">
          <NavLink
            to="/sequences/new"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sequence
          </NavLink>
        </div>
      )}
      
      {/* Role Information */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">Current Role:</div>
        <div className="text-sm font-medium text-gray-700">
          {permissions.currentRole?.replace('_', ' ')} 
        </div>
        <div className="text-xs text-gray-500">
          {permissions.accessLevel} Level Access
        </div>
      </div>
    </div>
  );
};