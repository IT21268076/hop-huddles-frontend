// pages/User/EnhancedUserAssignment.tsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { 
  Plus, 
  X, 
  User, 
  Shield, 
  Building, 
  Users, 
  Star,
  AlertCircle
} from 'lucide-react';
import type { 
  User as UserType, 
  UserRole, 
  Discipline, 
  Branch, 
  Team,
  CreateAssignmentRequest 
} from '../../types';
import { apiClient } from '../../api/client';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserAssignmentData {
  userId: number;
  assignments: Array<{
    agencyId: number;
    branchId?: number;
    teamId?: number;
    roles: UserRole[];
    disciplines: Discipline[];
    isPrimary: boolean;
    isLeader: boolean;
    accessScope: 'AGENCY' | 'BRANCH' | 'TEAM';
  }>;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess: () => void;
}

const roleDefinitions: Array<{
  value: UserRole;
  label: string;
  description: string;
  isLeaderRole: boolean;
  hierarchyLevel: number;
}> = [
  { 
    value: 'EDUCATOR', 
    label: 'Educator', 
    description: 'Full system access including huddle creation and agency management',
    isLeaderRole: false,
    hierarchyLevel: 10
  },
  { 
    value: 'ADMIN', 
    label: 'Administrator', 
    description: 'Full system access except huddle creation',
    isLeaderRole: false,
    hierarchyLevel: 9
  },
  { 
    value: 'DIRECTOR', 
    label: 'Director', 
    description: 'Branch leader with full branch management capabilities',
    isLeaderRole: true,
    hierarchyLevel: 8
  },
  { 
    value: 'CLINICAL_MANAGER', 
    label: 'Clinical Manager', 
    description: 'Team leader with team management capabilities',
    isLeaderRole: true,
    hierarchyLevel: 7
  },
  { 
    value: 'BRANCH_MANAGER', 
    label: 'Branch Manager', 
    description: 'Branch operations and staff management',
    isLeaderRole: false,
    hierarchyLevel: 6
  },
  { 
    value: 'FIELD_CLINICIAN', 
    label: 'Field Clinician', 
    description: 'Direct patient care provider',
    isLeaderRole: false,
    hierarchyLevel: 3
  },
  { 
    value: 'PRECEPTOR', 
    label: 'Preceptor', 
    description: 'Mentors and supervises other clinicians',
    isLeaderRole: false,
    hierarchyLevel: 4
  },
  { 
    value: 'LEARNER', 
    label: 'Learner', 
    description: 'Participates in training programs',
    isLeaderRole: false,
    hierarchyLevel: 1
  },
  { 
    value: 'SCHEDULER', 
    label: 'Scheduler', 
    description: 'Manages scheduling and assignments',
    isLeaderRole: false,
    hierarchyLevel: 2
  },
  { 
    value: 'INTAKE_COORDINATOR', 
    label: 'Intake Coordinator', 
    description: 'Coordinates patient intake and referrals',
    isLeaderRole: false,
    hierarchyLevel: 2
  },
];

const disciplineOptions: { value: Discipline; label: string }[] = [
  { value: 'RN', label: 'Registered Nurse' },
  { value: 'PT', label: 'Physical Therapist' },
  { value: 'OT', label: 'Occupational Therapist' },
  { value: 'SLP', label: 'Speech-Language Pathologist' },
  { value: 'LPN', label: 'Licensed Practical Nurse' },
  { value: 'HHA', label: 'Home Health Aide' },
  { value: 'MSW', label: 'Medical Social Worker' },
  { value: 'OTHER', label: 'Other' },
];

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { currentAgency, user: currentUser } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<UserAssignmentData>({
    defaultValues: {
      userId: user?.userId || 0,
      assignments: [{
        agencyId: currentAgency?.agencyId || 0,
        roles: [],
        disciplines: [],
        isPrimary: true,
        isLeader: false,
        accessScope: 'AGENCY'
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assignments'
  });

  // Fetch branches for assignment options
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch teams for selected branch
  const { data: teams } = useQuery(
    ['teams', selectedBranchId],
    () => selectedBranchId ? apiClient.getTeamsByBranch(selectedBranchId) : Promise.resolve([]),
    { enabled: !!selectedBranchId }
  );

  const createAssignmentsMutation = useMutation(
    async (data: UserAssignmentData) => {
      // Create multiple assignments for the user
      const assignmentPromises = data.assignments.map(assignment => {
        // Create separate assignment for each role
        return assignment.roles.map(role => 
          apiClient.createAssignment({
            userId: data.userId,
            agencyId: assignment.agencyId,
            branchId: assignment.branchId,
            teamId: assignment.teamId,
            role: role,
            discipline: assignment.disciplines[0], // Primary discipline
            isPrimary: assignment.isPrimary,
            isLeader: assignment.isLeader,
            roles: assignment.roles,
            disciplines: assignment.disciplines
          } as CreateAssignmentRequest)
        );
      }).flat();

      return Promise.all(assignmentPromises);
    },
    {
      onSuccess: () => {
        toast.success('User assignments created successfully');
        onSuccess();
        onClose();
      },
      onError: () => {
        toast.error('Failed to create user assignments');
      }
    }
  );

  const watchedAssignments = watch('assignments');

  const addAssignment = () => {
    append({
      agencyId: currentAgency?.agencyId || 0,
      roles: [],
      disciplines: [],
      isPrimary: false,
      isLeader: false,
      accessScope: 'AGENCY'
    });
  };

  const updateAccessScope = (index: number, branchId?: number, teamId?: number) => {
    let scope: 'AGENCY' | 'BRANCH' | 'TEAM' = 'AGENCY';
    
    if (teamId) scope = 'TEAM';
    else if (branchId) scope = 'BRANCH';
    
    setValue(`assignments.${index}.accessScope`, scope);
    setValue(`assignments.${index}.branchId`, branchId);
    setValue(`assignments.${index}.teamId`, teamId);
  };

  const checkLeaderConflict = (assignmentIndex: number, selectedRoles: UserRole[]) => {
    const hasLeaderRole = selectedRoles.some(role => 
      roleDefinitions.find(r => r.value === role)?.isLeaderRole
    );
    
    if (hasLeaderRole) {
      setValue(`assignments.${assignmentIndex}.isLeader`, true);
    }
    
    return hasLeaderRole;
  };

  const getAvailableRoles = () => {
    if (!currentUser?.assignments) return roleDefinitions;
    
    // Only allow assigning roles that the current user can manage
    const currentUserRoles = currentUser.assignments.map(a => a.role);
    const canAssignAllRoles = hasPermission(currentUser.assignments, PERMISSIONS.USER_ASSIGN);
    
    if (canAssignAllRoles) {
      return roleDefinitions;
    }
    
    // Filter roles based on hierarchy
    const maxHierarchyLevel = Math.max(
      ...currentUserRoles.map(role => 
        roleDefinitions.find(r => r.value === role)?.hierarchyLevel || 0
      )
    );
    
    return roleDefinitions.filter(role => role.hierarchyLevel <= maxHierarchyLevel);
  };

  const onSubmit = (data: UserAssignmentData) => {
    createAssignmentsMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign User: {user?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Configure roles, disciplines, and access for this user
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Assignment #{index + 1}
                      {watchedAssignments[index]?.isPrimary && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Star size={12} className="mr-1" />
                          Primary
                        </span>
                      )}
                    </h4>
                    
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Roles Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roles * {watchedAssignments[index]?.isLeader && (
                          <span className="text-orange-600 text-xs ml-1">(Leader Role Detected)</span>
                        )}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-3">
                        {getAvailableRoles().map((role) => (
                          <label key={role.value} className="flex items-start space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={role.value}
                              {...register(`assignments.${index}.roles`, {
                                required: 'At least one role is required'
                              })}
                              onChange={(e) => {
                                const currentRoles = watchedAssignments[index]?.roles || [];
                                let newRoles;
                                if (e.target.checked) {
                                  newRoles = [...currentRoles, role.value];
                                } else {
                                  newRoles = currentRoles.filter(r => r !== role.value);
                                }
                                setValue(`assignments.${index}.roles`, newRoles);
                                checkLeaderConflict(index, newRoles);
                              }}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {role.label}
                                {role.isLeaderRole && (
                                  <Shield size={12} className="inline ml-1 text-orange-500" />
                                )}
                              </p>
                              <p className="text-xs text-gray-600">{role.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.assignments?.[index]?.roles && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.assignments[index]?.roles?.message}
                        </p>
                      )}
                    </div>

                    {/* Disciplines Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disciplines
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {disciplineOptions.map((discipline) => (
                          <label key={discipline.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={discipline.value}
                              {...register(`assignments.${index}.disciplines`)}
                              onChange={(e) => {
                                const currentDisciplines = watchedAssignments[index]?.disciplines || [];
                                let newDisciplines;
                                if (e.target.checked) {
                                  newDisciplines = [...currentDisciplines, discipline.value];
                                } else {
                                  newDisciplines = currentDisciplines.filter(d => d !== discipline.value);
                                }
                                setValue(`assignments.${index}.disciplines`, newDisciplines);
                              }}
                            />
                            <span className="text-sm text-gray-900">{discipline.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Branch Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <select
                        {...register(`assignments.${index}.branchId`)}
                        onChange={(e) => {
                          const branchId = e.target.value ? parseInt(e.target.value) : undefined;
                          setSelectedBranchId(branchId || null);
                          updateAccessScope(index, branchId);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Agency Level</option>
                        {branches?.map((branch) => (
                          <option key={branch.branchId} value={branch.branchId}>
                            {branch.name} {branch.location && `(${branch.location})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Team Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team
                      </label>
                      <select
                        {...register(`assignments.${index}.teamId`)}
                        disabled={!watchedAssignments[index]?.branchId}
                        onChange={(e) => {
                          const teamId = e.target.value ? parseInt(e.target.value) : undefined;
                          updateAccessScope(index, watchedAssignments[index]?.branchId, teamId);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Branch Level</option>
                        {teams?.map((team) => (
                          <option key={team.teamId} value={team.teamId}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assignment Options */}
                    <div className="md:col-span-2 flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register(`assignments.${index}.isPrimary`)}
                          disabled={index === 0} // First assignment is always primary
                        />
                        <span className="text-sm text-gray-900">Primary Assignment</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register(`assignments.${index}.isLeader`)}
                          disabled={!checkLeaderConflict(index, watchedAssignments[index]?.roles || [])}
                        />
                        <span className="text-sm text-gray-900">
                          Leader Role
                          {watchedAssignments[index]?.isLeader && (
                            <Shield size={14} className="inline ml-1 text-orange-500" />
                          )}
                        </span>
                      </label>
                    </div>

                    {/* Access Scope Display */}
                    <div className="md:col-span-2">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          <strong>Access Scope:</strong> {watchedAssignments[index]?.accessScope}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          This user will have access to resources at the {watchedAssignments[index]?.accessScope.toLowerCase()} level and below.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Assignment Button */}
              <button
                type="button"
                onClick={addAssignment}
                className="w-full flex items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus size={20} className="mr-2" />
                Add Another Assignment
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAssignmentsMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {createAssignmentsMutation.isLoading ? 'Creating...' : 'Create Assignments'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;