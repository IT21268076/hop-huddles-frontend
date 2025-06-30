// utils/permissions.ts - FIXED RBAC System
import type { Discipline, SequenceTarget, UserAssignment, UserRole } from "../types";

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

// FIXED: Complete role definitions
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
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_DELETE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DELETE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_DELETE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_PUBLISH, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_SCHEDULE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
  },

  // FIXED: Complete ADMIN role with restrictions
  ADMIN: {
    name: 'ADMIN',
    hierarchyLevel: 9,
    permissions: [
      { action: PERMISSIONS.AGENCY_UPDATE, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.AGENCY_VIEW, resource: 'agency', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_CREATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_UPDATE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_DELETE, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_CREATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_UPDATE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_DELETE, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DELETE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_DELETE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_PUBLISH, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.HUDDLE_SCHEDULE, resource: 'huddle', scope: 'AGENCY' },
      { action: PERMISSIONS.PROGRESS_VIEW_AGENCY, resource: 'progress', scope: 'AGENCY' },
    ],
    restrictions: [
      { action: PERMISSIONS.HUDDLE_CREATE, resource: 'huddle' }, // ADMIN cannot create huddles
      { action: PERMISSIONS.AGENCY_CREATE, resource: 'agency' }, // ADMIN cannot create agencies
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
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_CREATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_UPDATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'BRANCH' },
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
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ASSIGN, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_ACTIVATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.USER_DEACTIVATE, resource: 'user', scope: 'TEAM' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.HUDDLE_UPDATE, resource: 'huddle', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_TEAM, resource: 'progress', scope: 'TEAM' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'TEAM' },
    ],
  },

  BRANCH_MANAGER: {
    name: 'BRANCH_MANAGER',
    hierarchyLevel: 6,
    permissions: [
      { action: PERMISSIONS.BRANCH_VIEW, resource: 'branch', scope: 'BRANCH' },
      { action: PERMISSIONS.TEAM_VIEW, resource: 'team', scope: 'BRANCH' },
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'BRANCH' },
      { action: PERMISSIONS.HUDDLE_VIEW, resource: 'huddle', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_BRANCH, resource: 'progress', scope: 'BRANCH' },
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'BRANCH' },
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
      { action: PERMISSIONS.USER_VIEW, resource: 'user', scope: 'TEAM' },
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
      { action: PERMISSIONS.PROGRESS_VIEW_OWN, resource: 'progress', scope: 'BRANCH' },
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
};

// FIXED: Proper hierarchical permission checking
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
  console.log('=== Permission Check ===');
  console.log('Required Permission:', requiredPermission);
  console.log('Context:', context);
  console.log('User Assignments:', userAssignments);

  return userAssignments.some(assignment => {
    console.log('Checking assignment:', assignment);
    
    // Handle multiple roles - check both primary role and roles array
    const rolesToCheck = assignment.roles && assignment.roles.length > 0 
      ? assignment.roles 
      : [assignment.role];

    console.log('Roles to check:', rolesToCheck);

    return rolesToCheck.some(role => {
      const roleDefinition = ROLE_DEFINITIONS[role];
      if (!roleDefinition) {
        console.log(`No role definition found for: ${role}`);
        return false;
      }

      console.log(`Checking role: ${role}`, roleDefinition);

      // First check if action is restricted for this role
      const hasRestriction = roleDefinition.restrictions?.some(restriction => 
        restriction.action === requiredPermission
      );

      if (hasRestriction) {
        console.log(`Permission ${requiredPermission} is restricted for role ${role}`);
        return false;
      }

      // Check if role has this permission
      const hasRolePermission = roleDefinition.permissions.some(permission => {
        if (permission.action !== requiredPermission) return false;

        console.log('Found matching permission:', permission);

        // FIXED: Hierarchical scope checking
        // Users with higher scope can access lower scope resources
        if (permission.scope && context) {
          const userScope = assignment.accessScope || getAssignmentScope(assignment);
          console.log('Permission scope:', permission.scope, 'User scope:', userScope);

          switch (permission.scope) {
            case 'AGENCY':
              // Agency level users can access everything in their agency
              if (context.agencyId && context.agencyId !== assignment.agencyId) {
                console.log('Agency mismatch');
                return false;
              }
              break;
            
            case 'BRANCH':
              // Branch level users can access their branch and teams within it
              if (userScope === 'AGENCY') {
                // Agency level users can access any branch
                if (context.agencyId && context.agencyId !== assignment.agencyId) {
                  console.log('Agency mismatch for branch access');
                  return false;
                }
              } else if (userScope === 'BRANCH') {
                // Branch level users can only access their specific branch
                if (context.branchId && context.branchId !== assignment.branchId) {
                  console.log('Branch mismatch');
                  return false;
                }
              } else {
                // Team level users cannot access branch level resources
                console.log('Team level user cannot access branch level');
                return false;
              }
              break;
            
            case 'TEAM':
              // Team level access - hierarchical access applies
              if (userScope === 'AGENCY') {
                // Agency level users can access any team
                if (context.agencyId && context.agencyId !== assignment.agencyId) {
                  console.log('Agency mismatch for team access');
                  return false;
                }
              } else if (userScope === 'BRANCH') {
                // Branch level users can access teams in their branch
                if (context.branchId && context.branchId !== assignment.branchId) {
                  console.log('Branch mismatch for team access');
                  return false;
                }
              } else if (userScope === 'TEAM') {
                // Team level users can only access their specific team
                if (context.teamId && context.teamId !== assignment.teamId) {
                  console.log('Team mismatch');
                  return false;
                }
              }
              break;
          }
        }

        console.log('Permission granted');
        return true;
      });

      console.log(`Role ${role} has permission: ${hasRolePermission}`);
      return hasRolePermission;
    });
  });
};

// Helper function to determine assignment scope
function getAssignmentScope(assignment: UserAssignment): 'AGENCY' | 'BRANCH' | 'TEAM' {
  if (assignment.teamId) return 'TEAM';
  if (assignment.branchId) return 'BRANCH';
  return 'AGENCY';
}

// FIXED: Better huddle access checking
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
          (assignment.accessScope === 'BRANCH' && // Branch users can access teams in their branch
           assignment.branchId === getBranchIdForTeam(parseInt(target.targetValue)))
        );
      
      default:
        return false;
    }
  });
};

// Helper function - you'll need to implement this based on your team data
function getBranchIdForTeam(teamId: number): number | undefined {
  // This should lookup the branch ID for a given team ID
  // For now, return undefined - implement based on your data structure
  return undefined;
}

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

// Debug helper function
export const debugUserPermissions = (userAssignments: UserAssignment[]): void => {
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
};