import React, { useState } from 'react';
import { ChevronDown, UserCheck, Building2, Users, Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  assignment: any;
  label: string;
  description: string;
  accessLevel: string;
  icon: React.ComponentType<{ className?: string }>;
  roleKey?: string; // To differentiate between different roles of the same assignment
}

export const RoleSwitcher: React.FC = () => {
  const { currentUser, currentAssignment, availableAssignments, switchRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleInfo = (role: UserRole | undefined, assignment: any): Omit<RoleOption, 'assignment'> => {
    if (!role) {
      return {
        role: 'FIELD_CLINICIAN',
        label: 'Unknown Role',
        description: 'Role-based access',
        accessLevel: 'Limited Access',
        icon: UserCheck,
      };
    }
    switch (role) {
      case 'SUPERADMIN':
        return {
          role,
          label: 'Super Administrator',
          description: 'Platform-wide administration',
          accessLevel: 'Platform Level',
          icon: UserCheck,
        };
      case 'EDUCATOR':
        return {
          role,
          label: 'Educator',
          description: 'Huddle sequence management & agency analytics',
          accessLevel: 'Agency Level',
          icon: UserCheck,
        };
      case 'ADMIN':
        return {
          role,
          label: 'Administrator',
          description: 'Agency-wide management (no huddle sequences)',
          accessLevel: 'Agency Level',
          icon: Building2,
        };
      case 'DIRECTOR':
        return {
          role,
          label: 'Director',
          description: `Branch leadership ${assignment?.branchName ? `for ${assignment.branchName}` : ''}`,
          accessLevel: 'Branch Level',
          icon: Building2,
        };
      case 'CLINICAL_MANAGER':
        return {
          role,
          label: 'Clinical Manager',
          description: `Team leadership ${assignment?.teamName ? `for ${assignment.teamName}` : ''}`,
          accessLevel: 'Team Level',
          icon: Users,
        };
      case 'FIELD_CLINICIAN':
        return {
          role,
          label: 'Field Clinician',
          description: 'Personal learning path',
          accessLevel: 'Personal Level',
          icon: Stethoscope,
        };
      default:
        return {
          role: role || 'FIELD_CLINICIAN',
          label: role ? (role as string).replace('_', ' ') : 'Unknown Role',
          description: 'Role-based access',
          accessLevel: 'Limited Access',
          icon: UserCheck,
        };
    }
  };

  // Check if user has multiple roles across assignments or multiple roles within single assignment
  const hasMultipleRoles = availableAssignments.some(assignment => 
    assignment.roles && assignment.roles.length > 1
  ) || availableAssignments.length > 1;

  if (!currentUser || !availableAssignments || availableAssignments.length === 0) {
    return null; // Don't show if user has no assignments
  }

  // If user has only one role, show a simplified profile display (but still clickable for testing)
  if (!hasMultipleRoles) {
    const currentRoleInfo = currentAssignment ? getRoleInfo(
      currentAssignment.activeRole || currentAssignment.role || currentAssignment.primaryRole, 
      currentAssignment
    ) : null;

    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
        {currentRoleInfo && (
          <currentRoleInfo.icon className="h-4 w-4 flex-shrink-0 text-gray-600" />
        )}
        <div className="text-left min-w-0 hidden sm:block">
          <div className="text-sm font-medium text-gray-900 truncate">
            {currentRoleInfo?.label || currentUser.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {currentRoleInfo?.accessLevel || 'User'}
          </div>
        </div>
      </div>
    );
  }

  const roleOptions: RoleOption[] = availableAssignments.flatMap(assignment => {
    // Every assignment can have multiple roles now
    if (assignment.roles && assignment.roles.length > 0) {
      return assignment.roles.map((role: UserRole) => ({
        ...getRoleInfo(role, assignment),
        assignment,
        roleKey: `${assignment.assignmentId}-${role}`
      }));
    } else if (assignment.role) {
      // Fallback for legacy assignments
      return [{
        ...getRoleInfo(assignment.role, assignment),
        assignment,
        roleKey: `${assignment.assignmentId}-${assignment.role}`
      }];
    } else {
      // Skip assignments with no roles
      return [];
    }
  });

  const currentRoleInfo = currentAssignment ? getRoleInfo(
    currentAssignment.activeRole || currentAssignment.role || currentAssignment.primaryRole, 
    currentAssignment
  ) : null;

  const handleRoleSwitch = (assignment: any, selectedRole?: UserRole) => {
    switchRole(assignment.assignmentId, selectedRole);
    setIsOpen(false);
    
    // Don't reload - let React handle the state update
    // The UI will automatically update when the currentAssignment changes
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-0"
      >
        {currentRoleInfo && (
          <currentRoleInfo.icon className="h-4 w-4 flex-shrink-0" />
        )}
        <div className="text-left min-w-0 hidden sm:block">
          <div className="text-sm font-medium truncate">
            {currentRoleInfo?.label || 'Select Role'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {currentRoleInfo?.accessLevel}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Switch Role</h3>
              <p className="text-xs text-gray-500 mt-1">
                Change your active role to access different features
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {roleOptions.map((option, index) => {
                const isActive = currentAssignment?.assignmentId === option.assignment.assignmentId && 
                                 (currentAssignment?.activeRole || currentAssignment?.role || currentAssignment?.primaryRole) === option.role;
                
                return (
                  <button
                    key={option.roleKey || index}
                    onClick={() => handleRoleSwitch(option.assignment, option.role)}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      isActive ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <option.icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {option.label}
                          </span>
                          {isActive && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs mt-1 ${
                          isActive ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>{option.accessLevel}</span>
                          {option.assignment.branchName && (
                            <span>• {option.assignment.branchName}</span>
                          )}
                          {option.assignment.teamName && (
                            <span>• {option.assignment.teamName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};