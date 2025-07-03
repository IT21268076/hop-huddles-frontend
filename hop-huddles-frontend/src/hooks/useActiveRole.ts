// hooks/useActiveRole.ts - Custom hook for role-based functionality
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import type { UserRole, UserAssignment } from '../types';

interface RoleCapabilities {
  // Management capabilities
  canManageAgency: boolean;
  canManageBranches: boolean;
  canManageTeams: boolean;
  canManageUsers: boolean;
  canManageHuddles: boolean;
  canCreateSequences: boolean;
  canPublishSequences: boolean;
  canScheduleSequences: boolean;
  canCreateAssessments: boolean;
  
  // View capabilities
  canViewAgencyAnalytics: boolean;
  canViewBranchAnalytics: boolean;
  canViewTeamAnalytics: boolean;
  canViewUserProgress: boolean;
  canViewOwnProgress: boolean;
  
  // Access scope
  accessScope: 'AGENCY' | 'BRANCH' | 'TEAM' | null;
  accessLevel: 'FULL' | 'MANAGEMENT' | 'VIEW_ONLY' | 'LIMITED';
  
  // UI configuration
  showAdminFeatures: boolean;
  showEducatorFeatures: boolean;
  showManagerFeatures: boolean;
  showClinicianFeatures: boolean;
  
  // Navigation items
  enabledNavItems: string[];
  hiddenNavItems: string[];
}

interface RoleBasedData {
  // Filtered data based on role
  accessibleBranchIds: number[];
  accessibleTeamIds: number[];
  managedUserIds: number[];
  assignedHuddleIds: number[];
  
  // Display preferences
  defaultDashboardView: 'EDUCATOR' | 'ADMIN' | 'MANAGER' | 'CLINICIAN';
  primaryActions: string[];
  quickActions: string[];
}

export const useActiveRole = () => {
  const { 
    user, 
    activeRole, 
    availableRoles, 
    switchRole, 
    canSwitchToRole, 
    getCurrentAccessScope,
    getFilteredDataContext 
  } = useAuth();

  const userAssignments = user?.assignments || [];
  const dataContext = getFilteredDataContext();

  // Calculate role capabilities
  const capabilities: RoleCapabilities = useMemo(() => {
    if (!activeRole || !user) {
      return {
        canManageAgency: false,
        canManageBranches: false,
        canManageTeams: false,
        canManageUsers: false,
        canManageHuddles: false,
        canCreateSequences: false,
        canPublishSequences: false,
        canScheduleSequences: false,
        canCreateAssessments: false,
        canViewAgencyAnalytics: false,
        canViewBranchAnalytics: false,
        canViewTeamAnalytics: false,
        canViewUserProgress: false,
        canViewOwnProgress: false,
        accessScope: null,
        accessLevel: 'LIMITED',
        showAdminFeatures: false,
        showEducatorFeatures: false,
        showManagerFeatures: false,
        showClinicianFeatures: false,
        enabledNavItems: [],
        hiddenNavItems: []
      };
    }

    const accessScope = getCurrentAccessScope();
    
    // Check permissions for current role
    const canManageAgency = hasPermission(userAssignments, PERMISSIONS.AGENCY_UPDATE);
    const canManageBranches = hasPermission(userAssignments, PERMISSIONS.BRANCH_CREATE) || 
                             hasPermission(userAssignments, PERMISSIONS.BRANCH_UPDATE);
    const canManageTeams = hasPermission(userAssignments, PERMISSIONS.TEAM_CREATE) || 
                          hasPermission(userAssignments, PERMISSIONS.TEAM_UPDATE);
    const canManageUsers = hasPermission(userAssignments, PERMISSIONS.USER_CREATE) || 
                          hasPermission(userAssignments, PERMISSIONS.USER_UPDATE);
    const canManageHuddles = hasPermission(userAssignments, PERMISSIONS.HUDDLE_CREATE) || 
                            hasPermission(userAssignments, PERMISSIONS.HUDDLE_UPDATE);
    const canCreateSequences = hasPermission(userAssignments, PERMISSIONS.HUDDLE_CREATE);
    const canPublishSequences = hasPermission(userAssignments, PERMISSIONS.HUDDLE_PUBLISH);
    const canScheduleSequences = hasPermission(userAssignments, PERMISSIONS.HUDDLE_SCHEDULE);
    
    // Progress viewing permissions
    const canViewAgencyAnalytics = hasPermission(userAssignments, PERMISSIONS.PROGRESS_VIEW_AGENCY);
    const canViewBranchAnalytics = hasPermission(userAssignments, PERMISSIONS.PROGRESS_VIEW_BRANCH);
    const canViewTeamAnalytics = hasPermission(userAssignments, PERMISSIONS.PROGRESS_VIEW_TEAM);
    const canViewUserProgress = canViewAgencyAnalytics || canViewBranchAnalytics || canViewTeamAnalytics;
    const canViewOwnProgress = hasPermission(userAssignments, PERMISSIONS.PROGRESS_VIEW_OWN);

    // Determine access level
    let accessLevel: 'FULL' | 'MANAGEMENT' | 'VIEW_ONLY' | 'LIMITED' = 'LIMITED';
    if (activeRole === 'EDUCATOR' || activeRole === 'SUPERADMIN') {
      accessLevel = 'FULL';
    } else if (activeRole === 'ADMIN' || activeRole === 'DIRECTOR' || activeRole === 'CLINICAL_MANAGER') {
      accessLevel = 'MANAGEMENT';
    } else if (canViewUserProgress || canViewOwnProgress) {
      accessLevel = 'VIEW_ONLY';
    }

    // Feature visibility
    const showEducatorFeatures = activeRole === 'EDUCATOR';
    const showAdminFeatures = ['ADMIN', 'EDUCATOR', 'SUPERADMIN'].includes(activeRole);
    const showManagerFeatures = ['DIRECTOR', 'CLINICAL_MANAGER', 'ADMIN', 'EDUCATOR'].includes(activeRole);
    const showClinicianFeatures = activeRole === 'FIELD_CLINICIAN';

    // Navigation items based on role
    const enabledNavItems: string[] = [];
    const hiddenNavItems: string[] = [];

    // Always available
    enabledNavItems.push('dashboard', 'profile', 'settings');

    // Role-specific navigation
    if (showEducatorFeatures || showAdminFeatures) {
      enabledNavItems.push('agency-management', 'branches', 'teams', 'users', 'analytics');
    }

    if (showEducatorFeatures) {
      enabledNavItems.push('sequence-management', 'huddle-creation', 'assessments');
    }

    if (showManagerFeatures && !showAdminFeatures) {
      enabledNavItems.push('team-management', 'progress-tracking');
      if (activeRole === 'DIRECTOR') {
        enabledNavItems.push('branch-management');
      }
    }

    if (showClinicianFeatures) {
      enabledNavItems.push('my-huddles', 'my-progress', 'assessments-todo');
      hiddenNavItems.push('management', 'analytics', 'administration');
    }

    return {
      canManageAgency,
      canManageBranches,
      canManageTeams,
      canManageUsers,
      canManageHuddles,
      canCreateSequences,
      canPublishSequences,
      canScheduleSequences,
      canCreateAssessments: canCreateSequences, // Assessments linked to sequences
      canViewAgencyAnalytics,
      canViewBranchAnalytics,
      canViewTeamAnalytics,
      canViewUserProgress,
      canViewOwnProgress,
      accessScope,
      accessLevel,
      showAdminFeatures,
      showEducatorFeatures,
      showManagerFeatures,
      showClinicianFeatures,
      enabledNavItems,
      hiddenNavItems
    };
  }, [activeRole, user, userAssignments, getCurrentAccessScope]);

  // Calculate role-based data access
  const roleBasedData: RoleBasedData = useMemo(() => {
    if (!activeRole || !dataContext.agencyId) {
      return {
        accessibleBranchIds: [],
        accessibleTeamIds: [],
        managedUserIds: [],
        assignedHuddleIds: [],
        defaultDashboardView: 'CLINICIAN',
        primaryActions: [],
        quickActions: []
      };
    }

    // Default dashboard view based on role
    let defaultDashboardView: 'EDUCATOR' | 'ADMIN' | 'MANAGER' | 'CLINICIAN' = 'CLINICIAN';
    if (activeRole === 'EDUCATOR') defaultDashboardView = 'EDUCATOR';
    else if (activeRole === 'ADMIN') defaultDashboardView = 'ADMIN';
    else if (['DIRECTOR', 'CLINICAL_MANAGER'].includes(activeRole)) defaultDashboardView = 'MANAGER';

    // Primary actions based on role
    const primaryActions: string[] = [];
    const quickActions: string[] = [];

    switch (activeRole) {
      case 'EDUCATOR':
        primaryActions.push('create-sequence', 'manage-huddles', 'view-analytics');
        quickActions.push('create-huddle', 'schedule-sequence', 'create-assessment');
        break;
      case 'ADMIN':
        primaryActions.push('manage-users', 'manage-branches', 'view-analytics');
        quickActions.push('add-user', 'create-branch', 'create-team');
        break;
      case 'DIRECTOR':
        primaryActions.push('manage-branch', 'manage-teams', 'track-progress');
        quickActions.push('add-team-member', 'assign-huddles', 'view-branch-analytics');
        break;
      case 'CLINICAL_MANAGER':
        primaryActions.push('manage-team', 'track-progress', 'assign-huddles');
        quickActions.push('add-team-member', 'view-team-progress', 'schedule-huddles');
        break;
      case 'FIELD_CLINICIAN':
        primaryActions.push('complete-huddles', 'view-progress', 'take-assessments');
        quickActions.push('continue-learning', 'view-certificates', 'update-profile');
        break;
    }

    return {
      accessibleBranchIds: dataContext.branchIds,
      accessibleTeamIds: dataContext.teamIds,
      managedUserIds: dataContext.userIds,
      assignedHuddleIds: [], // Would be populated from API
      defaultDashboardView,
      primaryActions,
      quickActions
    };
  }, [activeRole, dataContext]);

  // Helper functions
  const isRole = (role: UserRole): boolean => activeRole === role;
  const hasAnyRole = (roles: UserRole[]): boolean => !!activeRole && roles.includes(activeRole);
  const canAccessResource = (resourceType: 'AGENCY' | 'BRANCH' | 'TEAM', resourceId?: number): boolean => {
    const accessScope = getCurrentAccessScope();
    if (!accessScope) return false;

    switch (resourceType) {
      case 'AGENCY':
        return accessScope === 'AGENCY';
      case 'BRANCH':
        return accessScope === 'AGENCY' || 
               (accessScope === 'BRANCH' && (!resourceId || dataContext.branchIds.includes(resourceId)));
      case 'TEAM':
        return accessScope === 'AGENCY' || 
               accessScope === 'BRANCH' || 
               (accessScope === 'TEAM' && (!resourceId || dataContext.teamIds.includes(resourceId)));
      default:
        return false;
    }
  };

  const getRoleDisplayInfo = () => {
    if (!activeRole) return null;

    const roleLabels: Record<UserRole, string> = {
      EDUCATOR: 'Educator',
      ADMIN: 'Administrator',
      DIRECTOR: 'Director',
      CLINICAL_MANAGER: 'Clinical Manager',
      FIELD_CLINICIAN: 'Field Clinician',
      SUPERADMIN: 'Super Administrator'
    };

    return {
      role: activeRole,
      label: roleLabels[activeRole],
      accessScope: getCurrentAccessScope(),
      hasMultipleRoles: availableRoles.length > 1
    };
  };

  return {
    // Current role info
    activeRole,
    availableRoles,
    capabilities,
    roleBasedData,
    
    // Role management
    switchRole,
    canSwitchToRole,
    getRoleDisplayInfo,
    
    // Role checking helpers
    isRole,
    hasAnyRole,
    canAccessResource,
    
    // Data context
    dataContext,
    accessScope: getCurrentAccessScope()
  };
};

export default useActiveRole;