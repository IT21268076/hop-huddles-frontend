// hooks/useUserScheduleFilter.ts
// ⭐ USER VISIBILITY FILTERING FOR SERIES-EPISODE SCHEDULING
// Ensures users only see episodes for their specific role-discipline combination

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiClient } from '../services/api';
import { 
  CombinationSchedule,
  UserRole,
  Discipline,
  UserAssignment
} from '../types';

export interface UserScheduleFilterOptions {
  showAllSeries?: boolean; // For EDUCATOR role - can see all series in their branches
  showOnlyUserSeries?: boolean; // Default - only show user's role-discipline series
  includeCompleted?: boolean; // Include completed series
  branchId?: number; // Filter by specific branch
}

export interface FilteredScheduleData {
  schedules: CombinationSchedule[];
  userRole: UserRole | null;
  userDiscipline: Discipline | null;
  availableRoles: UserRole[];
  canSeeAllSeries: boolean;
  filterOptions: UserScheduleFilterOptions;
  loading: boolean;
  error: string | null;
}

export const useUserScheduleFilter = (
  agencyId?: number,
  options: UserScheduleFilterOptions = {}
): FilteredScheduleData => {
  const { currentUser, currentAssignment, availableAssignments } = useApp();
  const [schedules, setSchedules] = useState<CombinationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine user's current role and discipline
  const userContext = useMemo(() => {
    if (!currentAssignment) {
      return {
        userRole: null,
        userDiscipline: null,
        availableRoles: [],
        canSeeAllSeries: false
      };
    }

    const userRole = currentAssignment.activeRole || currentAssignment.roles[0];
    const userDiscipline = currentAssignment.discipline;
    const availableRoles = currentAssignment.roles || [];
    
    // EDUCATORs can see all series in their assigned branches
    const canSeeAllSeries = userRole === 'EDUCATOR' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    return {
      userRole,
      userDiscipline,
      availableRoles,
      canSeeAllSeries
    };
  }, [currentAssignment]);

  // Load and filter schedules based on user context
  useEffect(() => {
    const loadFilteredSchedules = async () => {
      if (!agencyId || !currentAssignment) {
        setSchedules([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let allSchedules: CombinationSchedule[] = [];

        if (userContext.canSeeAllSeries && options.showAllSeries !== false) {
          // Load all schedules for the agency (for EDUCATORs, ADMINs, etc.)
          allSchedules = await apiClient.getAgencyCombinationSchedules(agencyId);
        } else if (userContext.userRole && userContext.userDiscipline) {
          // Load only schedules for user's specific role-discipline combination
          allSchedules = await apiClient.getSchedulesForRoleDiscipline(
            userContext.userRole,
            userContext.userDiscipline,
            agencyId
          );
        } else {
          // No specific role-discipline, show empty
          allSchedules = [];
        }

        // Apply additional filters
        let filteredSchedules = allSchedules;

        // Filter by branch if specified
        if (options.branchId && currentAssignment.branchId !== options.branchId) {
          filteredSchedules = filteredSchedules.filter(schedule => {
            // This would require adding branchId to the schedule response
            // For now, we'll rely on the API filtering
            return true;
          });
        }

        // Filter by completion status
        if (!options.includeCompleted) {
          filteredSchedules = filteredSchedules.filter(schedule => 
            schedule.scheduleStatus !== 'COMPLETED' && 
            schedule.currentHuddleIndex < schedule.totalHuddlesInCombination
          );
        }

        setSchedules(filteredSchedules);
      } catch (err: any) {
        console.error('Error loading filtered schedules:', err);
        setError(err.message || 'Failed to load schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredSchedules();
  }, [
    agencyId, 
    currentAssignment, 
    userContext.userRole, 
    userContext.userDiscipline,
    userContext.canSeeAllSeries,
    options.showAllSeries,
    options.includeCompleted,
    options.branchId
  ]);

  return {
    schedules,
    userRole: userContext.userRole,
    userDiscipline: userContext.userDiscipline,
    availableRoles: userContext.availableRoles,
    canSeeAllSeries: userContext.canSeeAllSeries,
    filterOptions: options,
    loading,
    error
  };
};

// ⭐ HOOK FOR USER-SPECIFIC EPISODE ACCESS
// Determines if a user can access a specific episode based on their role-discipline

export const useUserEpisodeAccess = () => {
  const { currentAssignment } = useApp();

  const canAccessEpisode = (schedule: CombinationSchedule): boolean => {
    if (!currentAssignment) return false;

    const userRole = currentAssignment.activeRole || currentAssignment.roles[0];
    const userDiscipline = currentAssignment.discipline;

    // SUPERADMINs and ADMINs can access all episodes
    if (userRole === 'SUPERADMIN' || userRole === 'ADMIN') {
      return true;
    }

    // EDUCATORs can access all episodes in their assigned branches
    if (userRole === 'EDUCATOR') {
      // This would require checking if the schedule's branch matches educator's assignments
      // For now, allow access to all
      return true;
    }

    // Other roles can only access episodes for their specific role-discipline combination
    // This would require the schedule to have role/discipline information
    // For now, assume they can access if they have a role and discipline
    return userRole && userDiscipline ? true : false;
  };

  const getAccessReason = (schedule: CombinationSchedule): string => {
    if (!currentAssignment) return 'Not authenticated';

    const userRole = currentAssignment.activeRole || currentAssignment.roles[0];
    const userDiscipline = currentAssignment.discipline;

    if (userRole === 'SUPERADMIN' || userRole === 'ADMIN') {
      return 'Administrative access';
    }

    if (userRole === 'EDUCATOR') {
      return 'Educator access to branch content';
    }

    if (userRole && userDiscipline) {
      return `Access as ${userRole} - ${userDiscipline}`;
    }

    return 'No matching role-discipline combination';
  };

  return {
    canAccessEpisode,
    getAccessReason,
    currentRole: currentAssignment?.activeRole || currentAssignment?.roles[0],
    currentDiscipline: currentAssignment?.discipline
  };
};

// ⭐ UTILITY HOOK FOR ROLE SWITCHING WITH SCHEDULE FILTERING
// Allows users to switch roles and see different schedule views

export const useRoleSwitchingScheduleFilter = (agencyId?: number) => {
  const { currentAssignment, switchRole, availableAssignments } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Use the role from state if set, otherwise use current active role
  const effectiveRole = selectedRole || 
    (currentAssignment?.activeRole || currentAssignment?.roles[0]);

  // Load schedules for the effective role
  const { schedules, loading, error } = useUserScheduleFilter(agencyId, {
    showAllSeries: effectiveRole === 'EDUCATOR' || effectiveRole === 'ADMIN',
    showOnlyUserSeries: effectiveRole !== 'EDUCATOR' && effectiveRole !== 'ADMIN',
    includeCompleted: false
  });

  const handleRoleSwitch = (newRole: UserRole) => {
    setSelectedRole(newRole);
    
    // If user has multiple assignments, switch to the one with this role
    const targetAssignment = availableAssignments.find(assignment => 
      assignment.roles.includes(newRole)
    );
    
    if (targetAssignment && currentAssignment) {
      switchRole(targetAssignment.assignmentId, newRole);
    }
  };

  return {
    schedules,
    currentRole: effectiveRole,
    availableRoles: currentAssignment?.roles || [],
    onRoleSwitch: handleRoleSwitch,
    loading,
    error
  };
};