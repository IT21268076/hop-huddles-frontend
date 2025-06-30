import type { Discipline, SequenceTarget, UserAssignment, UserRole } from "../types";

// utils/permissions.ts - Enhanced RBAC System
export interface Permission {
  action: string;
  resource: string;
  scope?: 'AGENCY' | 'BRANCH' | 'TEAM';
  conditions?: Record<string, any>;
}

export interface RoleDefinition {
  name: UserRole;
  permissions: Permission[];
  restrictions?: Permission[];
  hierarchyLevel: number;
  isLeader?: boolean;
}

export const PERMISSIONS = {
  // Agency Management
  AGENCY_CREATE: 'agency:create',
  AGENCY_UPDATE: 'agency:update',
  AGENCY_DELETE: 'agency:delete',
  AGENCY_VIEW: 'agency:view',
  
  // Branch Management
  BRANCH_CREATE: 'branch:create',
  BRANCH_UPDATE: 'branch:update',
  BRANCH_DELETE: 'branch:delete',
  BRANCH_VIEW: 'branch:view',
  
  // Team Management
  TEAM_CREATE: 'team:create',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_VIEW: 'team:view',
  
  // User Management
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  USER_ASSIGN: 'user:assign',
  USER_ACTIVATE: 'user:activate',
  USER_DEACTIVATE: 'user:deactivate',
  
  // Huddle Management
  HUDDLE_CREATE: 'huddle:create',
  HUDDLE_UPDATE: 'huddle:update',
  HUDDLE_DELETE: 'huddle:delete',
  HUDDLE_VIEW: 'huddle:view',
  HUDDLE_PUBLISH: 'huddle:publish',
  HUDDLE_SCHEDULE: 'huddle:schedule',
  
  // Progress Management
  PROGRESS_VIEW_OWN: 'progress:view:own',
  PROGRESS_VIEW_TEAM: 'progress:view:team',
  PROGRESS_VIEW_BRANCH: 'progress:view:branch',
  PROGRESS_VIEW_AGENCY: 'progress:view:agency',
} as const;

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  EDUCATOR: {
    name: 'EDUCATOR',
    hierarchyLevel: 10,
    permissions: [
      { action: PERMISSIONS.AGENCY_CREATE, resource: 'agency' },
      { action: PERMISSIONS.AGENCY_UPDATE, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.AGENCY_VIEW, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_CREATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_DELETE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_DELETE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_DELETE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_PUBLISH, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_SCHEDULE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
  },

  ADMIN: {
    name: 'ADMIN',
    hierarchyLevel: 9,
    permissions: [
      { action: PERMISSIONS.AGENCY_UPDATE, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.AGENCY_VIEW, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_CREATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_DELETE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_DELETE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
    restrictions: [
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle' },
      { action: PERMISSIONS.AGENCY_CREATE, resource: 'agency' },
    ],
  },

  DIRECTOR: {
    name: 'DIRECTOR',
    hierarchyLevel: 8,
    isLeader: true,
    permissions: [
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_DELETE, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_BRANCH, resource: 'progress', scope: 'BRANCH' },
    ],
  },

  CLINICAL_MANAGER: {
    name: 'CLINICAL_MANAGER',
    hierarchyLevel: 7,
    isLeader: true,
    permissions: [
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'TEAM' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'TEAM' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_TEAM, resource: 'progress', scope: 'TEAM' },
    ],
  },

  // Add other roles...
  BRANCH_MANAGER: {
    name: 'BRANCH_MANAGER',
    hierarchyLevel: 6,
    permissions: [
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_BRANCH, resource: 'progress', scope: 'BRANCH' },
    ],
  },

  FIELD_CLINICIAN: {
    name: 'FIELD_CLINICIAN',
    hierarchyLevel: 3,
    permissions: [
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
    ],
  },

  PRECEPTOR: {
    name: 'PRECEPTOR',
    hierarchyLevel: 4,
    permissions: [
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_TEAM, resource: 'progress', scope: 'TEAM' },
    ],
  },

  LEARNER: {
    name: 'LEARNER',
    hierarchyLevel: 1,
    permissions: [
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
    ],
  },

  SCHEDULER: {
    name: 'SCHEDULER',
    hierarchyLevel: 2,
    permissions: [
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_SCHEDULE, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
    ],
  },

  INTAKE_COORDINATOR: {
    name: 'INTAKE_COORDINATOR',
    hierarchyLevel: 2,
    permissions: [
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'BRANCH' },
    ],
  },
  // SUPERVISOR: undefined,
  // QUALITY_MANAGER: undefined
};

// Enhanced permission checking with multiple roles and context
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
  return userAssignments.some(assignment => {
    const roleDefinition = ROLE_DEFINITIONS[assignment.role];
    
    // Check if role has this permission
    const hasRolePermission = roleDefinition.permissions.some(permission => {
      if (permission.action !== requiredPermission) return false;
      
      // Check scope constraints
      if (permission.scope === 'AGENCY' && context?.agencyId !== assignment.agencyId) return false;
      if (permission.scope === 'BRANCH' && context?.branchId !== assignment.branchId) return false;
      if (permission.scope === 'TEAM' && context?.teamId !== assignment.teamId) return false;
      
      return true;
    });
    
    // Check if action is restricted for this role
    const hasRestriction = roleDefinition.restrictions?.some(restriction => 
      restriction.action === requiredPermission
    );
    
    return hasRolePermission && !hasRestriction;
  });
};

// Check if user can access resource based on disciplines and roles
export const canAccessHuddle = (
  userAssignments: UserAssignment[],
  huddleTargets: SequenceTarget[]
): boolean => {
  return huddleTargets.some(target => {
    switch (target.targetType) {
      case 'DISCIPLINE':
        return userAssignments.some(assignment => 
          assignment.disciplines?.includes(target.targetValue as Discipline)
        );
      case 'ROLE':
        return userAssignments.some(assignment => 
          assignment.roles?.includes(target.targetValue as UserRole)
        );
      case 'BRANCH':
        return userAssignments.some(assignment => 
          assignment.branchId === parseInt(target.targetValue)
        );
      case 'TEAM':
        return userAssignments.some(assignment => 
          assignment.teamId === parseInt(target.targetValue)
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
    const roleDefinition = ROLE_DEFINITIONS[assignment.role];
    allPermissions.push(...roleDefinition.permissions);
    if (roleDefinition.restrictions) {
      restrictions.push(...roleDefinition.restrictions);
    }
  });
  
  // Remove restricted permissions
  return allPermissions.filter(permission => 
    !restrictions.some(restriction => 
      restriction.action === permission.action && 
      restriction.resource === permission.resource
    )
  );
};