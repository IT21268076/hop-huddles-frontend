import type { UserRole } from "../types";

export const ROLE_PERMISSIONS = {
  ADMIN: ['*'], // All permissions except create_huddles
  EDUCATOR: ['*'], // All permissions including create_huddles
  DIRECTOR: ['manage_branch', 'manage_users', 'view_analytics'],
  CLINICAL_MANAGER: ['manage_team', 'assign_users', 'view_progress'],
  // ... other roles
};

export const RESTRICTED_PERMISSIONS = {
  ADMIN: ['create_huddles'], // Only restriction for admin
};

export const hasPermission = (userRoles: UserRole[], permission: string): boolean => {
  return userRoles.some(role => {
    const permissions = ROLE_PERMISSIONS[role];
    const restrictions = RESTRICTED_PERMISSIONS[role] || [];
    
    return permissions.includes('*') || permissions.includes(permission) && !restrictions.includes(permission);
  });
};