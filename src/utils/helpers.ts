// utils/helpers.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getStatusColor = (status: string, type: 'bg' | 'variant' = 'bg') => {
  const colorMap = {
    draft: { bg: 'bg-gray-100 text-gray-800', variant: 'secondary' },
    generating: { bg: 'bg-blue-100 text-blue-800', variant: 'default' },
    review: { bg: 'bg-yellow-100 text-yellow-800', variant: 'warning' },
    published: { bg: 'bg-green-100 text-green-800', variant: 'success' },
    active: { bg: 'bg-green-100 text-green-800', variant: 'success' },
    archived: { bg: 'bg-red-100 text-red-800', variant: 'error' },
    inactive: { bg: 'bg-red-100 text-red-800', variant: 'error' },
    in_progress: { bg: 'bg-blue-100 text-blue-800', variant: 'default' },
    completed: { bg: 'bg-green-100 text-green-800', variant: 'success' },
    not_started: { bg: 'bg-gray-100 text-gray-800', variant: 'secondary' },
    skipped: { bg: 'bg-orange-100 text-orange-800', variant: 'warning' },
  };
  
  const statusKey = status.toLowerCase() as keyof typeof colorMap;
  const colors = colorMap[statusKey] || colorMap.draft;
  
  return type === 'variant' ? colors.variant as any : colors.bg;
};

export const getRoleDisplayName = (role: string) => {
  const roleNames: Record<string, string> = {
    SUPERADMIN: 'Super Administrator',
    EDUCATOR: 'Educator',
    ADMIN: 'Administrator',
    DIRECTOR: 'Director',
    CLINICAL_MANAGER: 'Clinical Manager',
    FIELD_CLINICIAN: 'Field Clinician',
  };
  return roleNames[role] || role;
};

export const getDisciplineDisplayName = (discipline: string) => {
  const disciplineNames: Record<string, string> = {
    RN: 'Registered Nurse',
    PT: 'Physical Therapist',
    OT: 'Occupational Therapist',
    SLP: 'Speech Language Pathologist',
    LPN: 'Licensed Practical Nurse',
    HHA: 'Home Health Aide',
    MSW: 'Medical Social Worker',
    OTHER: 'Other',
  };
  return disciplineNames[discipline] || discipline;
};

export const isSuperAdmin = (currentUser: any, auth0User: any) => {
  // Check if user has SUPERADMIN role in their assignments
  if (currentUser?.assignments?.some((assignment: any) => assignment.role === 'SUPERADMIN')) {
    return true;
  }
  
  // Fallback: check if email is superadmin email
  if (currentUser?.email === 'superadmin@hophuddles.com' || auth0User?.email === 'superadmin@hophuddles.com') {
    return true;
  }
  
  return false;
};

// Utility function to handle boolean property name variations from backend
export const getActiveStatus = (obj: any): boolean => {
  // Handle different possible property names from backend
  if (typeof obj?.isActive === 'boolean') {
    return obj.isActive;
  }
  if (typeof obj?.active === 'boolean') {
    return obj.active;
  }
  // Default to true if no status field found
  return true;
};

// Role-aware access scope logic
export const getRoleNaturalAccessScope = (role: string): 'AGENCY' | 'BRANCH' | 'TEAM' => {
  switch (role) {
    case 'SUPERADMIN':
    case 'EDUCATOR':
    case 'ADMIN':
      // These roles have agency-wide permissions and should have agency-level access
      return 'AGENCY';
    
    case 'DIRECTOR':
      // Directors manage branches, so they have branch-level access
      return 'BRANCH';
    
    case 'CLINICAL_MANAGER':
      // Clinical managers manage teams, so they have team-level access
      return 'TEAM';
    
    case 'FIELD_CLINICIAN':
      // Field clinicians are learners and can be assigned to either branch or team
      // Default to branch level for flexibility
      return 'BRANCH';
    
    default:
      // Default to most restrictive access
      return 'TEAM';
  }
};

export const getAvailableAccessScopes = (role: string): Array<'AGENCY' | 'BRANCH' | 'TEAM'> => {
  switch (role) {
    case 'SUPERADMIN':
      // Superadmins can work at any level
      return ['AGENCY', 'BRANCH', 'TEAM'];
    
    case 'EDUCATOR':
    case 'ADMIN':
      // Agency-level roles can work at agency level and below
      return ['AGENCY', 'BRANCH', 'TEAM'];
    
    case 'DIRECTOR':
      // Directors can work at branch level and below
      return ['BRANCH', 'TEAM'];
    
    case 'CLINICAL_MANAGER':
      // Clinical managers can work at team level
      return ['TEAM'];
    
    case 'FIELD_CLINICIAN':
      // Field clinicians can have team or branch level access
      return ['BRANCH', 'TEAM'];
    
    default:
      // Default to most flexible access
      return ['AGENCY', 'BRANCH', 'TEAM'];
  }
};

export const getRoleAccessDescription = (role: string): string => {
  switch (role) {
    case 'SUPERADMIN':
      return 'Platform-wide access across all agencies';
    case 'EDUCATOR':
      return 'Agency-wide access with huddle sequence management';
    case 'ADMIN':
      return 'Agency-wide access for general administration';
    case 'DIRECTOR':
      return 'Branch-level access for assigned branch and its teams';
    case 'CLINICAL_MANAGER':
      return 'Team-level access for assigned team';
    case 'FIELD_CLINICIAN':
      return 'Learner access - can be assigned to branch or team';
    default:
      return 'Role-based access level';
  }
};

export const isValidRoleScopeCombination = (role: string, scope: string): boolean => {
  const availableScopes = getAvailableAccessScopes(role);
  return availableScopes.includes(scope as 'AGENCY' | 'BRANCH' | 'TEAM');
};

// Check if user has management access to perform assignment operations
export const hasManagementAccess = (currentUser: any, targetUser: any, currentAssignment: any): boolean => {
  if (!currentUser || !currentAssignment) return false;

  const currentRole = currentAssignment.primaryRole || currentAssignment.role;
  
  // SUPERADMIN has access to everything
  if (currentRole === 'SUPERADMIN') return true;
  
  // EDUCATOR and ADMIN have agency-wide management access
  if (currentRole === 'EDUCATOR' || currentRole === 'ADMIN') {
    return currentAssignment.agencyId === (targetUser?.agencyId || currentAssignment.agencyId);
  }
  
  // DIRECTOR has access to manage users in their branch
  if (currentRole === 'DIRECTOR' && currentAssignment.branchId) {
    return targetUser?.branchId === currentAssignment.branchId || 
           targetUser?.assignments?.some((assignment: any) => assignment.branchId === currentAssignment.branchId);
  }
  
  // CLINICAL_MANAGER has access to manage users in their team
  if (currentRole === 'CLINICAL_MANAGER' && currentAssignment.teamId) {
    return targetUser?.teamId === currentAssignment.teamId ||
           targetUser?.assignments?.some((assignment: any) => assignment.teamId === currentAssignment.teamId);
  }
  
  return false;
};