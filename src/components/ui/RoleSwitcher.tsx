// components/ui/RoleSwitcher.tsx
import React, { useState } from 'react';
import { ChevronDown, User, Building2, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { Badge } from './Badge';

export const RoleSwitcher: React.FC = () => {
  const { 
    currentAssignment, 
    availableAssignments, 
    switchRole,
    currentUser 
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser || availableAssignments.length <= 1) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-gray-900">
            {currentUser?.name || 'User'}
          </span>
          {currentAssignment && (
            <div className="text-xs text-gray-500">
              {currentAssignment.primaryRole && getRoleDisplayName(currentAssignment.primaryRole)}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleRoleSwitch = (assignmentId: number) => {
    switchRole(assignmentId);
    setIsOpen(false);
  };

  const getAccessScopeIcon = (scope: string) => {
    switch (scope) {
      case 'AGENCY':
        return <Building2 className="h-3 w-3" />;
      case 'BRANCH':
        return <Building2 className="h-3 w-3" />;
      case 'TEAM':
        return <Users className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentUser.name}
          </div>
          {currentAssignment && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              {getAccessScopeIcon(currentAssignment.accessScope)}
              <span>{currentAssignment.primaryRole && getRoleDisplayName(currentAssignment.primaryRole)}</span>
              {currentAssignment.discipline && (
                <>
                  <span>•</span>
                  <span>{getDisciplineDisplayName(currentAssignment.discipline)}</span>
                </>
              )}
            </div>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Switch Role</h3>
              <p className="text-xs text-gray-500">
                Choose which role you want to work as
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableAssignments.map((assignment) => {
                // If assignment has multiple roles, show each role as separate option
                if (assignment.roles && assignment.roles.length > 1) {
                  return assignment.roles.map((role) => (
                    <button
                      key={`${assignment.assignmentId}-${role}`}
                      onClick={() => {
                        // Create a modified assignment with the specific role as active
                        const modifiedAssignment = {
                          ...assignment,
                          activeRole: role,
                          role: role, // For backward compatibility
                          primaryRole: role
                        };
                        switchRole(assignment.assignmentId, role);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        currentAssignment?.assignmentId === assignment.assignmentId && 
                        (currentAssignment?.activeRole || currentAssignment?.role) === role
                          ? 'bg-blue-50 border-blue-100'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {getRoleDisplayName(role)}
                            </span>
                            {assignment.isPrimary && (
                              <Badge variant="success" size="sm">Primary</Badge>
                            )}
                            {currentAssignment?.assignmentId === assignment.assignmentId && 
                             (currentAssignment?.activeRole || currentAssignment?.role) === role && (
                              <Badge variant="info" size="sm">Current</Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-3 w-3" />
                              <span>{assignment.agencyName}</span>
                            </div>
                            
                            {assignment.branchName && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-3 w-3" />
                                <span>{assignment.branchName}</span>
                              </div>
                            )}
                            
                            {assignment.teamName && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{assignment.teamName}</span>
                              </div>
                            )}
                            
                            {assignment.discipline && (
                              <div className="text-xs text-blue-600 font-medium">
                                {getDisciplineDisplayName(assignment.discipline)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-2">
                          <Badge variant="default" size="sm">
                            {assignment.accessScope}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ));
                } else {
                  // Single role assignment
                  const role = assignment.roles?.[0] || assignment.primaryRole;
                  return (
                    <button
                      key={assignment.assignmentId}
                      onClick={() => handleRoleSwitch(assignment.assignmentId)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        currentAssignment?.assignmentId === assignment.assignmentId
                          ? 'bg-blue-50 border-blue-100'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {role && getRoleDisplayName(role)}
                            </span>
                            {assignment.isPrimary && (
                              <Badge variant="success" size="sm">Primary</Badge>
                            )}
                            {currentAssignment?.assignmentId === assignment.assignmentId && (
                              <Badge variant="info" size="sm">Current</Badge>
                            )}
                          </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>{assignment.agencyName}</span>
                        </div>
                        
                        {assignment.branchName && (
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-3 w-3" />
                            <span>{assignment.branchName}</span>
                          </div>
                        )}
                        
                        {assignment.teamName && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{assignment.teamName}</span>
                          </div>
                        )}
                        
                            {assignment.discipline && (
                              <div className="text-xs text-blue-600 font-medium">
                                {getDisciplineDisplayName(assignment.discipline)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-2">
                          <Badge variant="default" size="sm">
                            {assignment.accessScope}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                }
              }).flat()}
            </div>
            
            <div className="p-3 bg-gray-50 text-xs text-gray-500">
              Your permissions and available features will change based on the selected role.
            </div>
          </div>
        </>
      )}
    </div>
  );
};