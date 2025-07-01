// utils/agencyUtils.ts - Utility functions and hooks for agency management
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Agency, User } from '../types';

// Agency registration status interface
export interface AgencyRegistrationStatus {
  hasRegisteredAgency: boolean;
  agencyId?: number;
  agencyName?: string;
  isFirstTime: boolean;
  registrationCompletedAt?: string;
  canCreateAgency: boolean;
}

// Custom hook for agency registration status
export const useAgencyRegistrationStatus = () => {
  const { user, getUserAgencyStatus } = useAuth();
  const [status, setStatus] = useState<AgencyRegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const agencyStatus = await getUserAgencyStatus(user.userId);
        setStatus({
          ...agencyStatus,
          canCreateAgency: !agencyStatus.hasRegisteredAgency
        });
        setError(null);
      } catch (err) {
        setError('Failed to check agency registration status');
        console.error('Agency status check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, getUserAgencyStatus]);

  return { status, loading, error, refetch: () => setLoading(true) };
};

// Utility function to check if user belongs to specific agency
export const isUserInAgency = (user: User, agencyId: number): boolean => {
  return user.assignments.some(assignment => 
    assignment.agencyId === agencyId && assignment.isActive
  );
};

// Utility function to get user's primary agency
export const getUserPrimaryAgency = (user: User): { agencyId: number; agencyName?: string } | null => {
  const primaryAssignment = user.assignments.find(a => a.isPrimary && a.isActive) || 
                           user.assignments.find(a => a.isActive);
  
  if (!primaryAssignment) return null;
  
  return {
    agencyId: primaryAssignment.agencyId,
    agencyName: primaryAssignment.agencyName
  };
};

// Utility function to check if agency creation should be disabled
export const shouldDisableAgencyCreation = (user: User): { disabled: boolean; reason?: string } => {
  const primaryAgency = getUserPrimaryAgency(user);
  
  if (!primaryAgency) {
    return { disabled: false };
  }

  // Check if user already has an agency registration
  const hasActiveAgency = user.assignments.some(a => a.isActive);
  
  if (hasActiveAgency) {
    return { 
      disabled: true, 
      reason: `Agency creation is disabled. You are already assigned to an agency.` 
    };
  }

  return { disabled: false };
};

// Update getUserRolesInAgency function around line 60:
export const getUserRolesInAgency = (user: User, agencyId: number): string[] => {
  const agencyAssignments = user.assignments.filter(a => 
    a.agencyId === agencyId && a.isActive
  );
  
  const roles = new Set<string>();
  agencyAssignments.forEach(assignment => {
    // Use the enhanced roles array structure
    if (assignment.roles && assignment.roles.length > 0) {
      assignment.roles.forEach(role => roles.add(role));
    } else if (assignment.role) {
      roles.add(assignment.role);
    }
  });
  
  return Array.from(roles);
};

// Update canUserManageUsersInAgency function:
export const canUserManageUsersInAgency = (user: User, agencyId: number): boolean => {
  const roles = getUserRolesInAgency(user, agencyId);
  const managerRoles = [
    'EDUCATOR', 
    'ADMIN', 
    'DIRECTOR', 
    'CLINICAL_MANAGER', 
    'BRANCH_MANAGER',
    'INTAKE_COORDINATOR'
  ];
  
  return roles.some(role => managerRoles.includes(role));
};

// Utility function to get user's access scope in agency
export const getUserAccessScopeInAgency = (user: User, agencyId: number): 'AGENCY' | 'BRANCH' | 'TEAM' | null => {
  const agencyAssignments = user.assignments.filter(a => 
    a.agencyId === agencyId && a.isActive
  );
  
  if (agencyAssignments.length === 0) return null;
  
  // Return the highest access scope
  if (agencyAssignments.some(a => a.accessScope === 'AGENCY')) return 'AGENCY';
  if (agencyAssignments.some(a => a.accessScope === 'BRANCH')) return 'BRANCH';
  return 'TEAM';
};

// // Utility function to check if user can manage other users in agency
// export const canUserManageUsersInAgency = (user: User, agencyId: number): boolean => {
//   const roles = getUserRolesInAgency(user, agencyId);
//   const managerRoles = ['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER'];
  
//   return roles.some(role => managerRoles.includes(role));
// };

// Utility function to format agency structure display
export const formatAgencyStructure = (structure: 'SINGLE' | 'ENTERPRISE'): string => {
  switch (structure) {
    case 'SINGLE':
      return 'Single Agency';
    case 'ENTERPRISE':
      return 'Enterprise (Multiple Branches)';
    default:
      return structure;
  }
};

// Utility function to get agency type display name
export const getAgencyTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'HOME_HEALTH': 'Home Health',
    'HOME_CARE': 'Home Care',
    'HOSPICE': 'Hospice',
    'SKILLED_NURSING': 'Skilled Nursing',
    'OTHER': 'Other'
  };
  
  return typeMap[type] || type;
};

// Utility function to get subscription plan badge color
export const getSubscriptionPlanBadge = (plan: string): string => {
  const badgeMap: Record<string, string> = {
    'TRIAL': 'bg-yellow-100 text-yellow-800',
    'BASIC': 'bg-blue-100 text-blue-800',
    'PREMIUM': 'bg-purple-100 text-purple-800',
    'ENTERPRISE': 'bg-green-100 text-green-800'
  };
  
  return badgeMap[plan] || 'bg-gray-100 text-gray-800';
};

// Agency isolation utility functions
export class AgencyIsolationManager {
  // Filter data by agency
  static filterByAgency<T extends { agencyId?: number }>(
    data: T[], 
    currentAgencyId: number | undefined
  ): T[] {
    if (!currentAgencyId) return [];
    return data.filter(item => item.agencyId === currentAgencyId);
  }

  // Check if user has access to resource in agency
  static hasAgencyAccess(
    user: User, 
    resourceAgencyId: number, 
    currentAgencyId: number | undefined
  ): boolean {
    if (!currentAgencyId || resourceAgencyId !== currentAgencyId) return false;
    return isUserInAgency(user, currentAgencyId);
  }

  // Get user's agency-specific data
  static getUserAgencyData<T extends { agencyId: number }>(
    user: User,
    data: T[]
  ): T[] {
    const userAgencies = user.assignments
      .filter(a => a.isActive)
      .map(a => a.agencyId);
    
    return data.filter(item => userAgencies.includes(item.agencyId));
  }
}

// Navigation utilities for the new flow
export const getPostLoginRedirectPath = (
  hasRegisteredAgency: boolean,
  isFirstLogin: boolean
): string => {
  if (!hasRegisteredAgency && isFirstLogin) {
    return '/agency-wizard';
  }
  return '/main-platform';
};

// Agency creation flow helpers
export const getAgencyCreationSteps = (structure: 'SINGLE' | 'ENTERPRISE') => {
  const baseSteps = [
    { step: 1, title: 'Structure', description: 'Choose agency structure' },
    { step: 2, title: 'Information', description: 'Basic agency details' }
  ];

  if (structure === 'SINGLE') {
    baseSteps.push({ step: 3, title: 'CCN', description: 'Certification number' });
  } else {
    baseSteps.push({ step: 3, title: 'Setup', description: 'Enterprise configuration' });
  }

  baseSteps.push({ step: 4, title: 'Review', description: 'Review and create' });
  
  return baseSteps;
};

// Platform card helpers
export const getAvailablePlatforms = (userRoles: string[]) => {
  const platforms = [
    {
      id: 'hop-huddles',
      available: true, // Always available
      requiredRoles: []
    },
    {
      id: 'hop-care',
      available: false, // Coming soon
      requiredRoles: ['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER']
    },
    {
      id: 'hop-analytics',
      available: false, // Coming soon
      requiredRoles: ['EDUCATOR', 'ADMIN', 'DIRECTOR']
    },
    {
      id: 'hop-compliance',
      available: false, // Coming soon
      requiredRoles: ['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER']
    },
    {
      id: 'hop-connect',
      available: false, // Coming soon
      requiredRoles: []
    },
    {
      id: 'hop-wellness',
      available: false, // Coming soon
      requiredRoles: []
    }
  ];

  return platforms.filter(platform => {
    if (!platform.available) return true; // Show coming soon platforms
    if (platform.requiredRoles.length === 0) return true; // No role restriction
    return platform.requiredRoles.some(role => userRoles.includes(role));
  });
};

export default {
  useAgencyRegistrationStatus,
  isUserInAgency,
  getUserPrimaryAgency,
  shouldDisableAgencyCreation,
  getUserRolesInAgency,
  getUserAccessScopeInAgency,
  canUserManageUsersInAgency,
  formatAgencyStructure,
  getAgencyTypeDisplay,
  getSubscriptionPlanBadge,
  AgencyIsolationManager,
  getPostLoginRedirectPath,
  getAgencyCreationSteps,
  getAvailablePlatforms
};