// pages/users/UserAssignmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CreateAssignmentRequest, User, UserRole, Discipline, AccessScope } from '../../types';
import { getRoleNaturalAccessScope, getAvailableAccessScopes, getRoleAccessDescription, isValidRoleScopeCombination } from '../../utils/helpers';

interface UserAssignmentFormProps {
  user: User;
  agencyId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserAssignmentForm: React.FC<UserAssignmentFormProps> = ({
  user,
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const [selectedScope, setSelectedScope] = useState<AccessScope>('AGENCY');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<CreateAssignmentRequest>({
    defaultValues: {
      userId: user.userId,
      agencyId,
      isPrimary: false,
    },
  });

  const watchedBranchId = watch('branchId');
  const watchedRole = watch('role');

  // Auto-update access scope when role changes
  useEffect(() => {
    if (watchedRole) {
      const naturalScope = getRoleNaturalAccessScope(watchedRole);
      setSelectedScope(naturalScope);
      setSelectedRole(watchedRole);
      
      // Clear branch and team selections if they're not valid for the new scope
      if (naturalScope === 'AGENCY') {
        setValue('branchId', undefined);
        setValue('teamId', undefined);
      } else if (naturalScope === 'BRANCH') {
        setValue('teamId', undefined);
      }
    }
  }, [watchedRole, setValue]);

  const { data: branches } = useAsync(
    async () => await apiClient.getBranchesByAgency(agencyId),
    [agencyId]
  );

  const { data: teams } = useAsync(
    async () => {
      if (watchedBranchId) {
        return await apiClient.getTeamsByBranch(Number(watchedBranchId));
      }
      return [];
    },
    [watchedBranchId]
  );

  const onSubmit = async (data: CreateAssignmentRequest) => {
    try {
      // Validate role-scope combination - be more flexible with access levels
      if (data.role && !isValidRoleScopeCombination(data.role, selectedScope)) {
        console.warn(`Warning: ${data.role} role may not be fully compatible with ${selectedScope} level access, but assignment will proceed.`);
      }

      const assignmentData = {
        ...data,
        // Convert single role to array for backend compatibility
        roles: data.role ? [data.role] : [],
        // Note: Primary role concept removed
        // Set access scope based on auto-determined scope
        branchId: selectedScope === 'AGENCY' ? undefined : data.branchId,
        teamId: selectedScope !== 'TEAM' ? undefined : data.teamId,
      };

      await apiClient.createAssignment(assignmentData);
      onSuccess();
    } catch (error: any) {
      setError('role', {
        type: 'server',
        message: error.response?.data?.message || 'Failed to create assignment',
      });
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'DIRECTOR', label: 'Director (Branch Leader)' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager (Team Leader)' },
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
  ];

  const disciplineOptions = [
    { value: 'RN', label: 'Registered Nurse' },
    { value: 'PT', label: 'Physical Therapist' },
    { value: 'OT', label: 'Occupational Therapist' },
    { value: 'SLP', label: 'Speech Language Pathologist' },
    { value: 'LPN', label: 'Licensed Practical Nurse' },
    { value: 'HHA', label: 'Home Health Aide' },
    { value: 'MSW', label: 'Medical Social Worker' },
    { value: 'OTHER', label: 'Other' },
  ];

  const branchOptions = branches?.map(branch => ({
    value: branch.branchId.toString(),
    label: branch.name,
  })) || [];

  const teamOptions = teams?.map(team => ({
    value: team.teamId.toString(),
    label: team.name,
  })) || [];

  return (
    <Card>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900">
          Assign Role to {user.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Access Scope Information */}
        {selectedRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">{selectedScope[0]}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  {selectedScope} Level Access
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {getRoleAccessDescription(selectedRole)}
                </p>
                {getAvailableAccessScopes(selectedRole).length > 1 && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-600 mb-2">Available access levels for this role:</p>
                    <div className="flex space-x-2">
                      {getAvailableAccessScopes(selectedRole).map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => setSelectedScope(scope)}
                          className={`px-3 py-1 text-xs font-medium rounded-md border ${
                            selectedScope === scope
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Role"
            {...register('role', { required: 'Role is required' })}
            error={errors.role?.message}
            options={roleOptions}
            placeholder="Select a role"
          />

          <Select
            label="Discipline"
            {...register('discipline')}
            error={errors.discipline?.message}
            options={disciplineOptions}
            placeholder="Select a discipline"
          />

          {selectedScope !== 'AGENCY' && (
            <Select
              label="Branch"
              {...register('branchId', {
                required: selectedScope === 'BRANCH' || selectedScope === 'TEAM' ? 'Branch is required' : false,
              })}
              error={errors.branchId?.message}
              options={branchOptions}
              placeholder="Select a branch"
            />
          )}

          {(selectedScope === 'TEAM' || selectedRole === 'FIELD_CLINICIAN') && watchedBranchId && (
            <Select
              label={selectedScope === 'TEAM' ? "Team" : "Team (Optional)"}
              {...register('teamId', {
                required: selectedScope === 'TEAM' ? 'Team is required' : false,
              })}
              error={errors.teamId?.message}
              options={teamOptions}
              placeholder="Select a team"
            />
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            {...register('isPrimary')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
            Set as primary assignment
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Assignment
          </Button>
        </div>
      </form>
    </Card>
  );
};