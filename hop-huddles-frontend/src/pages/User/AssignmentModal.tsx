// pages/User/SimplifiedAssignmentModal.tsx - Single assignment with multiple roles
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { 
  X, 
  Shield, 
  Building, 
  Users, 
  AlertCircle,
  Save,
  UserPlus,
  Crown
} from 'lucide-react';
import type { 
  User as UserType, 
  UserRole, 
  Discipline, 
  Branch, 
  Team,
  UserAssignment,
  CreateAssignmentRequest 
} from '../../types';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AssignmentFormData {
  agencyId: number;
  branchId?: number;
  teamId?: number;
  roles: UserRole[];
  disciplines: Discipline[];
  isActive: boolean;
}

interface SimplifiedAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess: () => void;
}

const roleDefinitions: Array<{
  value: UserRole;
  label: string;
  description: string;
  requiresBranch?: boolean;
  requiresTeam?: boolean;
  isLeaderRole?: boolean;
}> = [
  { 
    value: 'EDUCATOR', 
    label: 'Educator', 
    description: 'Full system access including huddle creation and agency management' 
  },
  { 
    value: 'ADMIN', 
    label: 'Administrator', 
    description: 'Full system access except huddle creation' 
  },
  { 
    value: 'DIRECTOR', 
    label: 'Director', 
    description: 'Branch leader with full branch management capabilities',
    requiresBranch: true,
    isLeaderRole: true
  },
  { 
    value: 'CLINICAL_MANAGER', 
    label: 'Clinical Manager', 
    description: 'Team leader with team management capabilities',
    requiresBranch: true,
    requiresTeam: true,
    isLeaderRole: true
  },
  { 
    value: 'FIELD_CLINICIAN', 
    label: 'Field Clinician', 
    description: 'Clinical staff member providing direct patient care' 
  },
  { 
    value: 'SUPERADMIN', 
    label: 'Super Administrator', 
    description: 'System-wide administrative access' 
  }
];

const disciplineOptions: Array<{
  value: Discipline;
  label: string;
}> = [
  { value: 'RN', label: 'Registered Nurse' },
  { value: 'PT', label: 'Physical Therapist' },
  { value: 'OT', label: 'Occupational Therapist' },
  { value: 'SLP', label: 'Speech-Language Pathologist' },
  { value: 'LPN', label: 'Licensed Practical Nurse' },
  { value: 'HHA', label: 'Home Health Aide' },
  { value: 'MSW', label: 'Medical Social Worker' },
  { value: 'OTHER', label: 'Other' }
];

const SimplifiedAssignmentModal: React.FC<SimplifiedAssignmentModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { currentAgency } = useAuth();
  const queryClient = useQueryClient();

  // Fetch branches and teams
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const { data: teams } = useQuery(
    ['teams', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getTeamsByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<AssignmentFormData>({
    defaultValues: {
      agencyId: currentAgency?.agencyId || 0,
      roles: [],
      disciplines: [],
      isActive: true
    }
  });

  const watchedRoles = watch('roles') || [];
  const watchedBranchId = watch('branchId');
  const watchedDisciplines = watch('disciplines') || [];

  // Get existing assignment for this user in current agency
  const existingAssignment = user?.assignments.find(a => 
    a.agencyId === currentAgency?.agencyId && a.isActive
  );

  // Initialize form with existing assignment data
  useEffect(() => {
    if (user && currentAgency) {
      if (existingAssignment) {
        // Load existing assignment
        reset({
          agencyId: currentAgency.agencyId,
          branchId: existingAssignment.branchId,
          teamId: existingAssignment.teamId,
          roles: existingAssignment.roles || [existingAssignment.role],
          disciplines: existingAssignment.disciplines || [existingAssignment.discipline].filter(Boolean) as Discipline[],
          isActive: existingAssignment.isActive
        });
      } else {
        // New assignment
        reset({
          agencyId: currentAgency.agencyId,
          roles: [],
          disciplines: [],
          isActive: true
        });
      }
    }
  }, [user, currentAgency, existingAssignment, reset]);

  // Save assignment mutation
  const saveAssignmentMutation = useMutation(
    async (formData: AssignmentFormData) => {
      if (!user || !currentAgency) throw new Error('User or agency not found');

      // Determine if user is a leader based on roles
      const hasLeaderRole = formData.roles.some(role => 
        roleDefinitions.find(r => r.value === role)?.isLeaderRole
      );

      // Determine primary role (first selected role)
      const primaryRole = formData.roles[0];

      if (existingAssignment) {
        // Update existing assignment
        await apiClient.updateAssignment(existingAssignment.assignmentId, {
          branchId: formData.branchId,
          teamId: formData.teamId,
          role: primaryRole,
          roles: formData.roles,
          disciplines: formData.disciplines,
          isPrimary: true, // Single assignment is always primary
          isLeader: hasLeaderRole
        });
      } else {
        // Create new assignment
        const createRequest: CreateAssignmentRequest = {
          userId: user.userId,
          agencyId: currentAgency.agencyId,
          branchId: formData.branchId,
          teamId: formData.teamId,
          role: primaryRole,
          roles: formData.roles,
          disciplines: formData.disciplines,
          isPrimary: true, // Single assignment is always primary
          isLeader: hasLeaderRole
        };
        await apiClient.createAssignment(createRequest);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User assignment updated successfully');
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error('Failed to update assignment');
        console.error(error);
      }
    }
  );

  const getTeamsForBranch = (branchId?: number): Team[] => {
    if (!branchId || !teams) return [];
    return teams.filter(team => team.branchId === branchId);
  };

  const toggleRole = (role: UserRole) => {
    const currentRoles = watchedRoles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    setValue('roles', newRoles);

    // Clear branch/team if no roles require them
    const requiresBranch = newRoles.some(r => 
      roleDefinitions.find(rd => rd.value === r)?.requiresBranch
    );
    const requiresTeam = newRoles.some(r => 
      roleDefinitions.find(rd => rd.value === r)?.requiresTeam
    );

    if (!requiresBranch) {
      setValue('branchId', undefined);
      setValue('teamId', undefined);
    } else if (!requiresTeam) {
      setValue('teamId', undefined);
    }
  };

  const toggleDiscipline = (discipline: Discipline) => {
    const currentDisciplines = watchedDisciplines;
    const newDisciplines = currentDisciplines.includes(discipline)
      ? currentDisciplines.filter(d => d !== discipline)
      : [...currentDisciplines, discipline];
    
    setValue('disciplines', newDisciplines);
  };

  const handleBranchChange = (branchId?: number) => {
    setValue('branchId', branchId);
    // Clear team when branch changes
    setValue('teamId', undefined);
  };

  const onSubmit = (data: AssignmentFormData) => {
    // Validation
    if (data.roles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    if (data.disciplines.length === 0) {
      toast.error('Please select at least one discipline');
      return;
    }

    // Check role-specific requirements
    const requiresBranch = data.roles.some(role => 
      roleDefinitions.find(r => r.value === role)?.requiresBranch
    );
    const requiresTeam = data.roles.some(role => 
      roleDefinitions.find(r => r.value === role)?.requiresTeam
    );

    if (requiresBranch && !data.branchId) {
      toast.error('Branch selection is required for Director or Clinical Manager roles');
      return;
    }

    if (requiresTeam && !data.teamId) {
      toast.error('Team selection is required for Clinical Manager role');
      return;
    }

    saveAssignmentMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const availableTeams = getTeamsForBranch(watchedBranchId);
  const hasLeaderRoles = watchedRoles.some(role => 
    roleDefinitions.find(r => r.value === role)?.isLeaderRole
  );
  const requiresBranch = watchedRoles.some(role => 
    roleDefinitions.find(r => r.value === role)?.requiresBranch
  );
  const requiresTeam = watchedRoles.some(role => 
    roleDefinitions.find(r => r.value === role)?.requiresTeam
  );

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {existingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.name} - {user.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Agency Info */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Agency:</strong> {currentAgency?.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  User will have one assignment within this agency
                </p>
              </div>

              <div className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Roles * <span className="text-xs text-gray-500">(Select multiple roles as needed)</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {roleDefinitions.map((roleDefinition) => (
                      <label 
                        key={roleDefinition.value} 
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                          watchedRoles.includes(roleDefinition.value)
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={watchedRoles.includes(roleDefinition.value)}
                          onChange={() => toggleRole(roleDefinition.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <Shield className={`h-5 w-5 mt-0.5 mr-3 ${
                            watchedRoles.includes(roleDefinition.value) ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900">{roleDefinition.label}</h4>
                              {roleDefinition.isLeaderRole && (
                                <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{roleDefinition.description}</p>
                            {(roleDefinition.requiresBranch || roleDefinition.requiresTeam) && (
                              <div className="flex items-center mt-2 text-xs text-amber-600">
                                <AlertCircle size={12} className="mr-1" />
                                Requires {roleDefinition.requiresBranch && 'branch'} 
                                {roleDefinition.requiresTeam && ' and team'} assignment
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {watchedRoles.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one role</p>
                  )}
                </div>

                {/* Branch Selection */}
                {requiresBranch && (
                  <div>
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                      Branch Assignment *
                    </label>
                    <select
                      id="branchId"
                      value={watchedBranchId || ''}
                      onChange={(e) => handleBranchChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a branch</option>
                      {branches?.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.name} {branch.location && `- ${branch.location}`}
                        </option>
                      ))}
                    </select>
                    {requiresBranch && !watchedBranchId && (
                      <p className="mt-1 text-sm text-red-600">Branch selection is required</p>
                    )}
                  </div>
                )}

                {/* Team Selection */}
                {requiresTeam && (
                  <div>
                    <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">
                      Team Assignment *
                    </label>
                    <select
                      id="teamId"
                      {...register('teamId', {
                        required: requiresTeam ? 'Team selection is required' : false,
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={!watchedBranchId}
                    >
                      <option value="">Select a team</option>
                      {availableTeams.map((team) => (
                        <option key={team.teamId} value={team.teamId}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    {!watchedBranchId && requiresTeam && (
                      <p className="mt-1 text-xs text-amber-600">
                        <AlertCircle size={12} className="inline mr-1" />
                        Select a branch first
                      </p>
                    )}
                    {errors.teamId && (
                      <p className="mt-1 text-sm text-red-600">{errors.teamId.message}</p>
                    )}
                  </div>
                )}

                {/* Disciplines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplines *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {disciplineOptions.map((discipline) => (
                      <label
                        key={discipline.value}
                        className={`cursor-pointer border rounded-lg p-3 text-sm transition-all ${
                          watchedDisciplines.includes(discipline.value)
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={watchedDisciplines.includes(discipline.value)}
                          onChange={() => toggleDiscipline(discipline.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-medium">{discipline.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{discipline.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {watchedDisciplines.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one discipline</p>
                  )}
                </div>

                {/* Leadership Status Info */}
                {hasLeaderRoles && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Leadership Role Selected
                        </p>
                        <p className="text-xs text-green-600">
                          This user will have leadership access for the selected {requiresTeam ? 'team' : 'branch'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assignment Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>User:</strong> {user.name}</p>
                    <p><strong>Agency:</strong> {currentAgency?.name}</p>
                    <p><strong>Roles:</strong> {watchedRoles.length > 0 ? watchedRoles.join(', ') : 'None selected'}</p>
                    <p><strong>Disciplines:</strong> {watchedDisciplines.length > 0 ? watchedDisciplines.join(', ') : 'None selected'}</p>
                    {watchedBranchId && (
                      <p><strong>Branch:</strong> {branches?.find(b => b.branchId === watchedBranchId)?.name}</p>
                    )}
                    {watch('teamId') && (
                      <p><strong>Team:</strong> {availableTeams.find(t => t.teamId === watch('teamId'))?.name}</p>
                    )}
                    {hasLeaderRoles && (
                      <p><strong>Leadership:</strong> Yes</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={saveAssignmentMutation.isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveAssignmentMutation.isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    {existingAssignment ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {existingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={saveAssignmentMutation.isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAssignmentModal;