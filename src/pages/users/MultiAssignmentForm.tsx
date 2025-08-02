// pages/users/MultiAssignmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Shield, Building2, ChevronRight, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MultiSelect, MultiSelectOption } from '../../components/ui/MultiSelect';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CreateAssignmentRequest, User, UserRole, Discipline, AccessScope } from '../../types';
import { getRoleDisplayName, getDisciplineDisplayName, getRoleNaturalAccessScope, getAvailableAccessScopes, getRoleAccessDescription, isValidRoleScopeCombination } from '../../utils/helpers';

interface MultiAssignmentFormProps {
  user: User;
  agencyId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface MultiAssignmentFormData {
  roles: string[];
  disciplines: string[];
  accessScope: AccessScope;
  branchId?: number;
  teamId?: number;
  primaryRole?: string;
}

export const MultiAssignmentForm: React.FC<MultiAssignmentFormProps> = ({
  user,
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [determinedScope, setDeterminedScope] = useState<AccessScope>('AGENCY');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MultiAssignmentFormData>({
    defaultValues: {
      roles: [],
      disciplines: [],
      accessScope: 'AGENCY',
    },
  });

  const watchedScope = watch('accessScope');
  const watchedBranchId = watch('branchId');

  // Determine compatible access scope for multiple roles
  const determineCompatibleScope = (roles: string[]): AccessScope => {
    if (roles.length === 0) return 'AGENCY';
    
    // Get all possible scopes for each role
    const allAvailableScopes = roles.map(role => getAvailableAccessScopes(role));
    
    // Find intersection of all available scopes
    const commonScopes = allAvailableScopes.reduce((intersection, current) => 
      intersection.filter(scope => current.includes(scope))
    );
    
    // If there's a common scope, use the most permissive one
    if (commonScopes.includes('AGENCY')) return 'AGENCY';
    if (commonScopes.includes('BRANCH')) return 'BRANCH';
    if (commonScopes.includes('TEAM')) return 'TEAM';
    
    // If no common scopes, use the most restrictive natural scope
    const naturalScopes = roles.map(role => getRoleNaturalAccessScope(role));
    if (naturalScopes.includes('TEAM')) return 'TEAM';
    if (naturalScopes.includes('BRANCH')) return 'BRANCH';
    return 'AGENCY';
  };

  // Update determined scope when roles change
  useEffect(() => {
    const newScope = determineCompatibleScope(selectedRoles);
    setDeterminedScope(newScope);
    setValue('accessScope', newScope);
    
    // Clear incompatible selections
    if (newScope === 'AGENCY') {
      setValue('branchId', undefined);
      setValue('teamId', undefined);
    } else if (newScope === 'BRANCH') {
      setValue('teamId', undefined);
    }
  }, [selectedRoles, setValue]);

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

  const onSubmit = async (data: MultiAssignmentFormData) => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    // Validate role-scope combinations - check if at least one role is compatible
    const compatibleRoles = selectedRoles.filter(role => isValidRoleScopeCombination(role, determinedScope));
    if (compatibleRoles.length === 0) {
      setError(`None of the selected roles are compatible with ${determinedScope} level access. Please select roles appropriate for this access level or change the access scope.`);
      return;
    }
    
    // Show warning if some roles are incompatible, but allow the assignment
    const incompatibleRoles = selectedRoles.filter(role => !isValidRoleScopeCombination(role, determinedScope));
    if (incompatibleRoles.length > 0) {
      console.warn(`Warning: Some roles may not be fully compatible with ${determinedScope} level access: ${incompatibleRoles.join(', ')}`);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create single assignment with all roles and disciplines
      const assignment: CreateAssignmentRequest = {
        userId: user.userId,
        agencyId,
        roles: selectedRoles as UserRole[],
        disciplines: selectedDisciplines.length > 0 ? selectedDisciplines as Discipline[] : undefined,
        primaryRole: data.primaryRole as UserRole,
        branchId: determinedScope === 'AGENCY' ? undefined : data.branchId,
        teamId: determinedScope !== 'TEAM' ? undefined : data.teamId,
        isPrimary: false,
      };

      // Create the assignment
      await apiClient.createAssignment(assignment);
      
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions: MultiSelectOption[] = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'DIRECTOR', label: 'Director (Branch Leader)' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager (Team Leader)' },
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
  ];

  const disciplineOptions: MultiSelectOption[] = [
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

  const primaryRoleOptions = selectedRoles.map(role => ({
    value: role,
    label: getRoleDisplayName(role),
  }));

  const getAssignmentPreview = (): Array<{ role: string; discipline: string | null }> => {
    if (selectedRoles.length === 0) return [];
    
    const assignments: Array<{ role: string; discipline: string | null }> = [];
    selectedRoles.forEach(role => {
      if (selectedDisciplines.length > 0) {
        selectedDisciplines.forEach(discipline => {
          assignments.push({ role, discipline });
        });
      } else {
        assignments.push({ role, discipline: null });
      }
    });
    
    return assignments;
  };

  const getTotalAssignments = () => {
    return Math.max(selectedRoles.length * Math.max(selectedDisciplines.length, 1), 0);
  };

  const quickPresets = [
    {
      name: 'Field Clinician',
      icon: <Users className="h-4 w-4" />,
      roles: ['FIELD_CLINICIAN'],
      disciplines: ['RN'],
      scope: 'TEAM' as AccessScope,
    },
    {
      name: 'Director + Clinical Manager',
      icon: <Shield className="h-4 w-4" />,
      roles: ['DIRECTOR', 'CLINICAL_MANAGER'],
      disciplines: [],
      scope: 'BRANCH' as AccessScope,
    },
    {
      name: 'Educator + Admin',
      icon: <Building2 className="h-4 w-4" />,
      roles: ['EDUCATOR', 'ADMIN'],
      disciplines: [],
      scope: 'AGENCY' as AccessScope,
    },
    {
      name: 'Multi-Discipline Clinician',
      icon: <Users className="h-4 w-4" />,
      roles: ['FIELD_CLINICIAN'],
      disciplines: ['RN', 'PT', 'OT'],
      scope: 'TEAM' as AccessScope,
    },
  ];

  const applyQuickPreset = (preset: typeof quickPresets[0]) => {
    setSelectedRoles(preset.roles);
    setSelectedDisciplines(preset.disciplines);
    setValue('roles', preset.roles);
    setValue('disciplines', preset.disciplines);
    setValue('accessScope', preset.scope);
    setValue('primaryRole', preset.roles[0]);
  };

  return (
    <Card>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900">
          Assign Multiple Roles to {user.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {user.email} • Create multiple assignments at once
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-600" />
            <label className="text-sm font-medium text-gray-700">Quick Presets</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyQuickPreset(preset)}
                className="p-3 text-left border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {preset.icon}
                  <span className="font-medium text-sm text-gray-900">{preset.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {preset.roles.map(role => getRoleDisplayName(role)).join(', ')}
                  {preset.disciplines.length > 0 && (
                    <span> • {preset.disciplines.map(d => getDisciplineDisplayName(d)).join(', ')}</span>
                  )}
                  <span> • {preset.scope} scope</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Role and Discipline Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelect
            label="Roles"
            placeholder="Select roles..."
            options={roleOptions}
            value={selectedRoles}
            onChange={(values) => {
              setSelectedRoles(values);
              setValue('roles', values);
              // Reset primary role if it's not in selected roles
              const currentPrimary = watch('primaryRole');
              if (currentPrimary && !values.includes(currentPrimary)) {
                setValue('primaryRole', values[0] || '');
              }
            }}
            error={selectedRoles.length === 0 ? 'At least one role is required' : undefined}
          />

          <MultiSelect
            label="Disciplines (Optional)"
            placeholder="Select disciplines..."
            options={disciplineOptions}
            value={selectedDisciplines}
            onChange={(values) => {
              setSelectedDisciplines(values);
              setValue('disciplines', values);
            }}
          />
        </div>

        {/* Access Scope Information */}
        {selectedRoles.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                {determinedScope === 'AGENCY' && <Building2 className="h-4 w-4 text-white" />}
                {determinedScope === 'BRANCH' && <Building2 className="h-4 w-4 text-white" />}
                {determinedScope === 'TEAM' && <Users className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">
                  {determinedScope} Level Access (Auto-determined)
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Based on the selected roles, the access level has been automatically set to {determinedScope} level.
                </p>
                
                {/* Show role compatibility */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-blue-600 font-medium">Selected roles and their access levels:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {selectedRoles.map((role, index) => {
                      const naturalScope = getRoleNaturalAccessScope(role);
                      const isCompatible = isValidRoleScopeCombination(role, determinedScope);
                      return (
                        <div key={index} className={`text-xs flex items-center justify-between py-1 px-2 rounded ${
                          isCompatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <span className="font-medium">{getRoleDisplayName(role)}</span>
                          <span>{naturalScope} Level</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedRoles.some(role => !isValidRoleScopeCombination(role, determinedScope)) && (
                    <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
                      <strong>Info:</strong> Some roles have different natural access levels, but this assignment will work with the selected access scope.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branch and Team Selection */}
        {watchedScope !== 'AGENCY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Branch"
              {...register('branchId', {
                required: watchedScope === 'BRANCH' || watchedScope === 'TEAM' ? 'Branch is required' : false,
              })}
              error={errors.branchId?.message}
              options={branchOptions}
              placeholder="Select a branch"
            />

            {watchedScope === 'TEAM' && watchedBranchId && (
              <Select
                label="Team"
                {...register('teamId', {
                  required: watchedScope === 'TEAM' ? 'Team is required' : false,
                })}
                error={errors.teamId?.message}
                options={teamOptions}
                placeholder="Select a team"
              />
            )}
          </div>
        )}

        {/* Primary Role Selection */}
        {selectedRoles.length > 1 && (
          <Select
            label="Primary Role"
            {...register('primaryRole')}
            options={primaryRoleOptions}
            placeholder="Select primary role (optional)"
          />
        )}

        {/* Assignment Preview */}
        {selectedRoles.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-blue-900 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Assignment Preview
                </h5>
                <Badge variant="info">
                  {getTotalAssignments()} assignment{getTotalAssignments() !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {getAssignmentPreview().slice(0, 6).map((assignment, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="default" size="sm">
                      {getRoleDisplayName(assignment.role)}
                    </Badge>
                    {assignment.discipline && (
                      <>
                        <span>•</span>
                        <Badge variant="info" size="sm">
                          {getDisciplineDisplayName(assignment.discipline)}
                        </Badge>
                      </>
                    )}
                    <span className="text-xs text-blue-600">
                      ({watchedScope} scope)
                    </span>
                  </div>
                ))}
                
                {getAssignmentPreview().length > 6 && (
                  <div className="text-sm text-blue-600">
                    ... and {getAssignmentPreview().length - 6} more assignments
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={selectedRoles.length === 0}
          >
            Create {getTotalAssignments()} Assignment{getTotalAssignments() !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Card>
  );
};