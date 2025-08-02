// hooks/usePermissions.ts
import { useMemo } from 'react';
import type { UserRole, Discipline } from '../types';
import { useApp } from '../contexts/AppContext';

interface UsePermissionsProps {
  userRole?: UserRole;
  userDiscipline?: Discipline;
}

export const usePermissions = ({ userRole, userDiscipline }: UsePermissionsProps = {}) => {
  const { currentAssignment } = useApp();
  
  // Use current assignment if no specific role provided
  const effectiveRole = userRole || currentAssignment?.activeRole || currentAssignment?.role;
  const effectiveDiscipline = userDiscipline || currentAssignment?.discipline;

  const permissions = useMemo(() => {
    // Platform Level (Super Admin)
    const canManagePlatform = effectiveRole === 'SUPERADMIN';
    const canCreatePlatformAgencies = effectiveRole === 'SUPERADMIN';

    // Agency Level (Admin, Educator)
    const canManageAgency = ['SUPERADMIN', 'ADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canCreateSequence = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || ''); // Only Educators
    const canManageHuddleSequences = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || ''); // Only Educators
    const canViewAgencyAnalytics = ['SUPERADMIN', 'ADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canManageAgencyUsers = ['SUPERADMIN', 'ADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canCreateAgencyBranches = ['SUPERADMIN', 'ADMIN', 'EDUCATOR'].includes(effectiveRole || '');

    // Branch Level (Director)
    const canManageBranch = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR'].includes(effectiveRole || '');
    const canViewBranchAnalytics = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR'].includes(effectiveRole || '');
    const canManageBranchUsers = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR'].includes(effectiveRole || '');
    const canCreateBranchTeams = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR'].includes(effectiveRole || '');

    // Team Level (Clinical Manager)
    const canManageTeam = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR', 'CLINICAL_MANAGER'].includes(effectiveRole || '');
    const canViewTeamAnalytics = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR', 'CLINICAL_MANAGER'].includes(effectiveRole || '');
    const canManageTeamUsers = ['SUPERADMIN', 'ADMIN', 'EDUCATOR', 'DIRECTOR', 'CLINICAL_MANAGER'].includes(effectiveRole || '');

    // Personal Level (Field Clinician)
    const canViewPersonalHuddles = true; // All users can view assigned huddles
    const canCompleteHuddles = true; // All users can complete assigned huddles
    const canTakeAssessments = true; // All users can take assessments
    const canViewPersonalProgress = true; // All users can view their progress

    // Content Management (Only Educators can manage huddle sequences per requirements)
    const canEditHuddles = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canPublishSequences = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canScheduleHuddles = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || '');
    const canCreateAssessments = ['SUPERADMIN', 'EDUCATOR'].includes(effectiveRole || '');

    // Access Level Determination
    const getAccessLevel = () => {
      switch (effectiveRole) {
        case 'SUPERADMIN':
          return 'platform';
        case 'ADMIN':
        case 'EDUCATOR':
          return 'agency';
        case 'DIRECTOR':
          return 'branch';
        case 'CLINICAL_MANAGER':
          return 'team';
        case 'FIELD_CLINICIAN':
          return 'personal';
        default:
          return 'none';
      }
    };

    return {
      // Platform Level
      canManagePlatform,
      canCreatePlatformAgencies,

      // Agency Level
      canManageAgency,
      canCreateSequence,
      canManageHuddleSequences,
      canViewAgencyAnalytics,
      canManageAgencyUsers,
      canCreateAgencyBranches,

      // Branch Level
      canManageBranch,
      canViewBranchAnalytics,
      canManageBranchUsers,
      canCreateBranchTeams,

      // Team Level
      canManageTeam,
      canViewTeamAnalytics,
      canManageTeamUsers,

      // Personal Level
      canViewPersonalHuddles,
      canCompleteHuddles,
      canTakeAssessments,
      canViewPersonalProgress,

      // Content Management
      canEditHuddles,
      canPublishSequences,
      canScheduleHuddles,
      canCreateAssessments,

      // Access Level
      accessLevel: getAccessLevel(),
      
      // Current Role Info
      currentRole: effectiveRole,
      currentDiscipline: effectiveDiscipline,
    };
  }, [effectiveRole, effectiveDiscipline]);

  return permissions;
};