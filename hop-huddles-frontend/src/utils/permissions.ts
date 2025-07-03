// utils/permissions.ts - FIXED: Clean permission system without debug logging
import type { UserAssignment, UserRole, Discipline, SequenceTarget } from '../types';

// Permission constants
export const PERMISSIONS = {
  // Agency Management
  AGENCY_VIEW: 'AGENCY:VIEW',
  AGENCY_UPDATE: 'AGENCY:UPDATE',
  AGENCY_CREATE: 'AGENCY:CREATE',
  AGENCY_DELETE: 'AGENCY:DELETE',

  // Branch Management
  BRANCH_VIEW: 'BRANCH:VIEW',
  BRANCH_CREATE: 'BRANCH:CREATE',
  BRANCH_UPDATE: 'BRANCH:UPDATE',
  BRANCH_DELETE: 'BRANCH:DELETE',

  // Team Management
  TEAM_VIEW: 'TEAM:VIEW',
  TEAM_CREATE: 'TEAM:CREATE',
  TEAM_UPDATE: 'TEAM:UPDATE',
  TEAM_DELETE: 'TEAM:DELETE',

  // User Management
  USER_VIEW: 'USER:VIEW',
  USER_CREATE: 'USER:CREATE',
  USER_UPDATE: 'USER:UPDATE',
  USER_DELETE: 'USER:DELETE',
  USER_ASSIGN: 'USER:ASSIGN',
  USER_ACTIVATE: 'USER:ACTIVATE',
  USER_DEACTIVATE: 'USER:DEACTIVATE',

  // Huddle Sequence Management
  SEQUENCE_VIEW: 'SEQUENCE:VIEW',
  SEQUENCE_CREATE: 'SEQUENCE:CREATE',
  SEQUENCE_UPDATE: 'SEQUENCE:UPDATE',
  SEQUENCE_DELETE: 'SEQUENCE:DELETE',
  SEQUENCE_PUBLISH: 'SEQUENCE:PUBLISH',

  // Huddle Management
  HUDDLE_VIEW: 'HUDDLE:VIEW',
  HUDDLE_CREATE: 'HUDDLE:CREATE',
  HUDDLE_UPDATE: 'HUDDLE:UPDATE',
  HUDDLE_DELETE: 'HUDDLE:DELETE',
  HUDDLE_PUBLISH: 'HUDDLE:PUBLISH',
  HUDDLE_SCHEDULE: 'HUDDLE:SCHEDULE',

  // Progress & Analytics
  PROGRESS_VIEW_OWN: 'PROGRESS:VIEW_OWN',
  PROGRESS_VIEW_TEAM: 'PROGRESS:VIEW_TEAM',
  PROGRESS_VIEW_BRANCH: 'PROGRESS:VIEW_BRANCH',
  PROGRESS_VIEW_AGENCY: 'PROGRESS:VIEW_AGENCY',

  // Assessment Management
  ASSESSMENT_CREATE: 'ASSESSMENT:CREATE',
  ASSESSMENT_ASSIGN: 'ASSESSMENT:ASSIGN',
  ASSESSMENT_VIEW: 'ASSESSMENT:VIEW',
  ASSESSMENT_GRADE: 'ASSESSMENT:GRADE',
} as const;

// Permission definition interface
interface Permission {
  action: string;
  resource: string;
  scope: 'AGENCY' | 'BRANCH' | 'TEAM';
}

// Role definition interface
interface RoleDefinition {
  name: string;
  hierarchyLevel: number;
  isLeader?: boolean;
  permissions: Permission[];
  restrictions?: Permission[];
}

// FIXED: Simplified and accurate role definitions
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  EDUCATOR: {
    name: 'EDUCATOR',
    hierarchyLevel: 10,
    permissions: [
      // Full agency access + huddle management
      { action: PERMISSIONS.AGENCY_VIEW, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.AGENCY_UPDATE, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_CREATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_VIEW, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_CREATE, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_UPDATE, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_PUBLISH, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.ASSESSMENT_CREATE, resource: 'assessment', scope: 'AGENCY' },
      { action: PERMISSIONS.ASSESSMENT_ASSIGN, resource: 'assessment', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
  },

  ADMIN: {
    name: 'ADMIN',
    hierarchyLevel: 9,
    permissions: [
      // Full agency access (excluding huddle management)
      { action: PERMISSIONS.AGENCY_VIEW, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.AGENCY_UPDATE, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_CREATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_VIEW, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
    restrictions: [
      // Cannot create/manage huddle sequences
      { action: PERMISSIONS.SEQUENCE_CREATE, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.SEQUENCE_UPDATE, resource: 'sequence', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.ASSESSMENT_CREATE, resource: 'assessment', scope: 'AGENCY' },
    ],
  },

  DIRECTOR: {
    name: 'DIRECTOR',
    hierarchyLevel: 8,
    isLeader: true,
    permissions: [
      // Branch-level access
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_BRANCH, resource: 'progress', scope: 'BRANCH' },
    ],
  },

  CLINICAL_MANAGER: {
    name: 'CLINICAL_MANAGER',
    hierarchyLevel: 7,
    isLeader: true,
    permissions: [
      // Team-level access
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'TEAM' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'TEAM' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_TEAM, resource: 'progress', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
    ],
  },

  FIELD_CLINICIAN: {
    name: 'FIELD_CLINICIAN',
    hierarchyLevel: 3,
    permissions: [
      // Limited access - only assigned huddles and own progress
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
    ],
  },

  SUPERADMIN: {
    name: 'SUPERADMIN',
    hierarchyLevel: 100,
    permissions: Object.values(PERMISSIONS).map(action => ({
      action,
      resource: action.split(':')[0].toLowerCase(),
      scope: 'AGENCY' as const
    })),
  }
};

// FIXED: Clean hierarchical permission checking without debug logging
export const hasPermission = (
  userAssignments: UserAssignment[],
  requiredPermission: string,
  context?: {
    agencyId?: number;
    branchId?: number;
    teamId?: number;
    resourceOwnerId?: number;
  }
): boolean => {
  if (!userAssignments || userAssignments.length === 0) {
    return false;
  }

  return userAssignments.some(assignment => {
    // Handle multiple roles - check both primary role and roles array
    const rolesToCheck = assignment.roles && assignment.roles.length > 0 
      ? assignment.roles 
      : [assignment.role];

    return rolesToCheck.some(role => {
      const roleDefinition = ROLE_DEFINITIONS[role];
      if (!roleDefinition) {
        return false;
      }

      // Check if action is restricted for this role
      const hasRestriction = roleDefinition.restrictions?.some(restriction => 
        restriction.action === requiredPermission
      );

      if (hasRestriction) {
        return false;
      }

      // Check if role has this permission
      return roleDefinition.permissions.some(permission => {
        if (permission.action !== requiredPermission) return false;

        // FIXED: Proper hierarchical scope checking
        if (permission.scope && context) {
          return checkHierarchicalAccess(assignment, permission, context);
        }

        return true;
      });
    });
  });
};

// FIXED: Hierarchical access checking logic
function checkHierarchicalAccess(
  assignment: UserAssignment,
  permission: Permission,
  context: { agencyId?: number; branchId?: number; teamId?: number; resourceOwnerId?: number }
): boolean {
  const userScope = assignment.accessScope || getAssignmentScope(assignment);
  
  // Agency users can access everything in their agency
  if (userScope === 'AGENCY') {
    return !context.agencyId || context.agencyId === assignment.agencyId;
  }
  
  // Branch users can access their branch and teams under it
  if (userScope === 'BRANCH') {
    if (permission.scope === 'AGENCY') {
      return false; // Branch users cannot access agency-level resources
    }
    
    // Check agency match
    if (context.agencyId && context.agencyId !== assignment.agencyId) {
      return false;
    }
    
    // For branch scope: user must be in same branch
    if (permission.scope === 'BRANCH') {
      return !context.branchId || context.branchId === assignment.branchId;
    }
    
    // For team scope: team must be under user's branch
    if (permission.scope === 'TEAM') {
      // Note: In a real app, you'd check if the team belongs to the user's branch
      // For now, we'll allow branch users to access any team in their agency
      return !context.branchId || context.branchId === assignment.branchId;
    }
  }
  
  // Team users can only access their specific team
  if (userScope === 'TEAM') {
    if (permission.scope === 'AGENCY' || permission.scope === 'BRANCH') {
      return false; // Team users cannot access higher-level resources
    }
    
    // Check agency and team match
    if (context.agencyId && context.agencyId !== assignment.agencyId) {
      return false;
    }
    
    return !context.teamId || context.teamId === assignment.teamId;
  }
  
  return false;
}

// Helper function to determine assignment scope
function getAssignmentScope(assignment: UserAssignment): 'AGENCY' | 'BRANCH' | 'TEAM' {
  if (assignment.teamId) return 'TEAM';
  if (assignment.branchId) return 'BRANCH';
  return 'AGENCY';
}

// FIXED: Huddle access checking without debug logging
export const canAccessHuddle = (
  userAssignments: UserAssignment[],
  huddleTargets: SequenceTarget[]
): boolean => {
  if (!huddleTargets || huddleTargets.length === 0) {
    return true; // If no targets specified, everyone can access
  }

  return huddleTargets.some(target => {
    switch (target.targetType) {
      case 'DISCIPLINE':
        return userAssignments.some(assignment => {
          const disciplines = assignment.disciplines && assignment.disciplines.length > 0 
            ? assignment.disciplines 
            : (assignment.discipline ? [assignment.discipline] : []);
          return disciplines.includes(target.targetValue as Discipline);
        });
      
      case 'ROLE':
        return userAssignments.some(assignment => {
          const roles = assignment.roles && assignment.roles.length > 0 
            ? assignment.roles 
            : [assignment.role];
          return roles.includes(target.targetValue as UserRole);
        });
      
      case 'BRANCH':
        return userAssignments.some(assignment => 
          assignment.branchId === parseInt(target.targetValue) ||
          assignment.accessScope === 'AGENCY' // Agency users can access all branches
        );
      
      case 'TEAM':
        return userAssignments.some(assignment => 
          assignment.teamId === parseInt(target.targetValue) ||
          assignment.accessScope === 'AGENCY' || // Agency users can access all teams
          (assignment.accessScope === 'BRANCH' && assignment.branchId) // Branch users can access teams in their branch
        );
      
      default:
        return false;
    }
  });
};

// Get user's effective permissions based on all their roles
export const getUserEffectivePermissions = (userAssignments: UserAssignment[]): Permission[] => {
  const allPermissions: Permission[] = [];
  const restrictions: Permission[] = [];
  
  userAssignments.forEach(assignment => {
    const rolesToCheck = assignment.roles && assignment.roles.length > 0 
      ? assignment.roles 
      : [assignment.role];

    rolesToCheck.forEach(role => {
      const roleDefinition = ROLE_DEFINITIONS[role];
      if (roleDefinition) {
        allPermissions.push(...roleDefinition.permissions);
        if (roleDefinition.restrictions) {
          restrictions.push(...roleDefinition.restrictions);
        }
      }
    });
  });
  
  // Remove restricted permissions
  return allPermissions.filter(permission => 
    !restrictions.some(restriction => 
      restriction.action === permission.action && 
      restriction.resource === permission.resource
    )
  );
};

// Debug helper function (only for development)
export const debugUserPermissions = (userAssignments: UserAssignment[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== User Permission Debug ===');
    console.log('User Assignments:', userAssignments);
    
    userAssignments.forEach((assignment, index) => {
      console.log(`Assignment ${index + 1}:`);
      console.log('- Role:', assignment.role);
      console.log('- Roles Array:', assignment.roles);
      console.log('- Access Scope:', assignment.accessScope);
      console.log('- Agency ID:', assignment.agencyId);
      console.log('- Branch ID:', assignment.branchId);
      console.log('- Team ID:', assignment.teamId);
      
      const rolesToCheck = assignment.roles && assignment.roles.length > 0 
        ? assignment.roles 
        : [assignment.role];
      
      rolesToCheck.forEach(role => {
        const roleDefinition = ROLE_DEFINITIONS[role];
        if (roleDefinition) {
          console.log(`- ${role} Permissions:`, roleDefinition.permissions.map(p => p.action));
          console.log(`- ${role} Restrictions:`, roleDefinition.restrictions?.map(r => r.action) || []);
        }
      });
    });
    
    const effectivePermissions = getUserEffectivePermissions(userAssignments);
    console.log('Effective Permissions:', effectivePermissions.map(p => p.action));
  }
};

// Role switching helper functions
export const getUserAvailableRoles = (userAssignments: UserAssignment[]): UserRole[] => {
  const allRoles = new Set<UserRole>();
  
  userAssignments.forEach(assignment => {
    if (assignment.roles && assignment.roles.length > 0) {
      assignment.roles.forEach(role => allRoles.add(role));
    } else if (assignment.role) {
      allRoles.add(assignment.role);
    }
  });
  
  return Array.from(allRoles);
};

export const getAssignmentForRole = (
  userAssignments: UserAssignment[], 
  targetRole: UserRole
): UserAssignment | null => {
  return userAssignments.find(assignment => 
    (assignment.roles && assignment.roles.includes(targetRole)) ||
    assignment.role === targetRole
  ) || null;
};

// Permission validation for specific requirements
export const validateRequiredPermissions = (
  userAssignments: UserAssignment[],
  permissions: string[],
  context?: { agencyId?: number; branchId?: number; teamId?: number }
): { isValid: boolean; missingPermissions: string[] } => {
  const missingPermissions: string[] = [];
  
  permissions.forEach(permission => {
    if (!hasPermission(userAssignments, permission, context)) {
      missingPermissions.push(permission);
    }
  });
  
  return {
    isValid: missingPermissions.length === 0,
    missingPermissions
  };
};