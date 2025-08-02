// pages/users/BulkAssignmentForm.tsx
import React, { useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CreateAssignmentRequest, User, UserRole, Discipline, AccessScope } from '../../types';
import { getRoleNaturalAccessScope } from '../../utils/helpers';

interface BulkAssignmentFormProps {
  user: User;
  agencyId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BulkAssignmentFormData {
  assignments: (CreateAssignmentRequest & { accessScope?: AccessScope })[];
}

export const BulkAssignmentForm: React.FC<BulkAssignmentFormProps> = ({
  user,
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
  } = useForm<BulkAssignmentFormData>({
    defaultValues: {
      assignments: [
        {
          userId: user.userId,
          agencyId,
          roles: ['FIELD_CLINICIAN'] as UserRole[],
          discipline: undefined,
          isPrimary: false,
          branchId: undefined,
          teamId: undefined,
          accessScope: 'TEAM' as AccessScope,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assignments',
  });


  const { data: branches } = useAsync(
    async () => await apiClient.getBranchesByAgency(agencyId),
    [agencyId]
  );

  const { data: teams } = useAsync(
    async () => {
      if (!branches || branches.length === 0) return [];
      // Get teams for all branches
      const allTeams = await Promise.all(
        branches.map(branch => apiClient.getTeamsByBranch(branch.branchId))
      );
      return allTeams.flat();
    },
    [branches]
  );

  const onSubmit = async (data: BulkAssignmentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create all assignments
      const promises = data.assignments.map(assignment => {
        const cleanAssignment = {
          ...assignment,
          branchId: assignment.branchId || undefined,
          teamId: assignment.teamId || undefined,
        };
        return apiClient.createAssignment(cleanAssignment);
      });

      await Promise.all(promises);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAssignment = () => {
    const defaultRole = 'FIELD_CLINICIAN' as UserRole;
    const naturalScope = getRoleNaturalAccessScope(defaultRole);
    
    append({
      userId: user.userId,
      agencyId,
      roles: [defaultRole],
      discipline: undefined,
      isPrimary: false,
      branchId: undefined,
      teamId: undefined,
      accessScope: naturalScope,
    });
  };

  const getAccessScopeOptions = (assignmentIndex: number) => {
    const assignments = watch('assignments');
    const assignment = assignments?.[assignmentIndex];
    const role = assignment?.roles?.[0]; // Get first role for bulk assignments
    
    // Role-aware access scope restrictions based on natural access levels
    switch (role) {
      case 'SUPERADMIN':
      case 'EDUCATOR':
      case 'ADMIN':
        // These roles must have agency-level access
        return [{ value: 'AGENCY', label: 'Agency Level' }];
      
      case 'DIRECTOR':
        // Directors must have branch-level access
        return [{ value: 'BRANCH', label: 'Branch Level' }];
      
      case 'CLINICAL_MANAGER':
        // Clinical managers must have team-level access
        return [{ value: 'TEAM', label: 'Team Level' }];
      
      case 'FIELD_CLINICIAN':
        // Field clinicians can have team or branch level access
        return [
          { value: 'BRANCH', label: 'Branch Level (Float)' },
          { value: 'TEAM', label: 'Team Level (Assigned)' },
        ];
      
      default:
        // Default to most restrictive
        return [{ value: 'TEAM', label: 'Team Level' }];
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

  const getTeamOptions = (branchId?: string) => {
    if (!branchId) return [];
    return teams?.filter(team => team.branchId === parseInt(branchId)).map(team => ({
      value: team.teamId.toString(),
      label: team.name,
    })) || [];
  };

  return (
    <Card>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900">
          Create Multiple Assignments for {user.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {user.email} • Add multiple roles and disciplines at once
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Assignment {index + 1}</Badge>
                  {watch('assignments')?.[index]?.isPrimary && (
                    <Badge variant="success">Primary</Badge>
                  )}
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name={`assignments.${index}.roles.0`}
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <Select
                      label="Role"
                      {...field}
                      options={roleOptions}
                      placeholder="Select a role"
                      error={errors.assignments?.[index]?.roles?.[0]?.message}
                    />
                  )}
                />

                <Controller
                  name={`assignments.${index}.discipline`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Discipline"
                      {...field}
                      options={disciplineOptions}
                      placeholder="Select a discipline"
                      error={errors.assignments?.[index]?.discipline?.message}
                    />
                  )}
                />

                <Controller
                  name={`assignments.${index}.accessScope`}
                  control={control}
                  rules={{ required: 'Access scope is required' }}
                  render={({ field }) => (
                    <Select
                      label="Access Scope"
                      {...field}
                      options={getAccessScopeOptions(index)}
                      placeholder="Select access scope"
                      error={errors.assignments?.[index]?.accessScope?.message}
                    />
                  )}
                />

                {watch('assignments')?.[index]?.accessScope !== 'AGENCY' && (
                  <Controller
                    name={`assignments.${index}.branchId`}
                    control={control}
                    rules={{ 
                      required: watch('assignments')?.[index]?.accessScope === 'BRANCH' || 
                                 watch('assignments')?.[index]?.accessScope === 'TEAM' 
                                 ? 'Branch is required' : false 
                    }}
                    render={({ field }) => (
                      <Select
                        label="Branch"
                        {...field}
                        options={branchOptions}
                        placeholder="Select a branch"
                        error={errors.assignments?.[index]?.branchId?.message}
                      />
                    )}
                  />
                )}

                {watch('assignments')?.[index]?.accessScope === 'TEAM' && (
                  <Controller
                    name={`assignments.${index}.teamId`}
                    control={control}
                    rules={{ 
                      required: watch('assignments')?.[index]?.accessScope === 'TEAM' ? 'Team is required' : false 
                    }}
                    render={({ field }) => (
                      <Select
                        label="Team"
                        {...field}
                        options={getTeamOptions(watch('assignments')?.[index]?.branchId?.toString())}
                        placeholder="Select a team"
                        error={errors.assignments?.[index]?.teamId?.message}
                      />
                    )}
                  />
                )}
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id={`isPrimary-${index}`}
                  {...register(`assignments.${index}.isPrimary`)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`isPrimary-${index}`} className="ml-2 block text-sm text-gray-900">
                  Set as primary assignment
                </label>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addAssignment}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Assignment
          </Button>
          
          <div className="text-sm text-gray-500">
            {fields.length} assignment{fields.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create {fields.length} Assignment{fields.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Card>
  );
};