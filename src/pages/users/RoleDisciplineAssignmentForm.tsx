// pages/users/RoleDisciplineAssignmentForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Shield, Building2, Crown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MultiSelect, MultiSelectOption } from '../../components/ui/MultiSelect';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CreateAssignmentRequest, User, UserRole, Discipline, AccessScope, UserAssignment } from '../../types';
import { getRoleDisplayName, getDisciplineDisplayName, getRoleNaturalAccessScope, getAvailableAccessScopes, getRoleAccessDescription, isValidRoleScopeCombination } from '../../utils/helpers';

interface RoleDisciplineAssignmentFormProps {
  user: User;
  agencyId: number;
  existingAssignment?: UserAssignment; // If provided, update instead of create
  preselectedBranch?: { branchId: number; name: string }; // If provided, preselect and disable branch
  preselectedTeam?: { teamId: number; name: string; branchId: number }; // If provided, preselect and disable team
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  roles: string[];
  disciplines: string[];
  accessScope: AccessScope;
  branchId?: number;
  teamId?: number;
  // Note: Primary role concept removed - all roles are equal in priority
}

export const RoleDisciplineAssignmentForm: React.FC<RoleDisciplineAssignmentFormProps> = ({
  user,
  agencyId,
  existingAssignment,
  preselectedBranch,
  preselectedTeam,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    existingAssignment?.roles || []
  );
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(
    existingAssignment?.disciplines || []
  );
  const [determinedScope, setDeterminedScope] = useState<AccessScope>('AGENCY');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      roles: existingAssignment?.roles || [],
      disciplines: existingAssignment?.disciplines || [],
      accessScope: existingAssignment?.accessScope || (preselectedTeam ? 'TEAM' : preselectedBranch ? 'BRANCH' : 'AGENCY'),
      branchId: existingAssignment?.branchId || preselectedTeam?.branchId || preselectedBranch?.branchId,
      teamId: existingAssignment?.teamId || preselectedTeam?.teamId,
      // Note: Primary role concept removed
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
  React.useEffect(() => {
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

  const onSubmit = async (data: FormData) => {
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
      const assignmentData = {
        userId: user.userId,
        agencyId,
        roles: selectedRoles as UserRole[],
        disciplines: selectedDisciplines.length > 0 ? selectedDisciplines as Discipline[] : undefined,
        // Note: Primary role concept removed
        branchId: determinedScope === 'AGENCY' ? undefined : data.branchId,
        teamId: determinedScope !== 'TEAM' ? undefined : data.teamId,
        isPrimary: false,
      };

      if (existingAssignment) {
        // Update existing assignment
        await apiClient.updateAssignment(existingAssignment.assignmentId, assignmentData);
      } else {
        // Create new assignment
        await apiClient.createAssignment(assignmentData);
      }
      
      onSuccess();
    } catch (error: any) {
      const action = existingAssignment ? 'update' : 'create';
      setError(error.response?.data?.message || `Failed to ${action} assignment`);
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

  // Note: Primary role selection removed - all roles are equal in priority

  return (
    <Card>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900">
          {existingAssignment ? 'Update' : 'Assign'} Roles & Disciplines for {user.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {user.email} • {existingAssignment ? 'Modify existing' : 'Select multiple'} roles and disciplines for this user
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Role and Discipline Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelect
            label="Roles *"
            placeholder="Select roles..."
            options={roleOptions}
            value={selectedRoles}
            onChange={(values) => {
              setSelectedRoles(values);
              setValue('roles', values);
              // Note: Primary role logic removed - all roles are equal in priority
            }}
            error={selectedRoles.length === 0 ? 'At least one role is required' : undefined}
          />

          <MultiSelect
            label="Disciplines"
            placeholder="Select disciplines..."
            options={disciplineOptions}
            value={selectedDisciplines}
            onChange={(values) => {
              setSelectedDisciplines(values);
              setValue('disciplines', values);
            }}
          />
        </div>

        {/* Primary Role Selection removed - all roles are equal in priority */}

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
        {determinedScope !== 'AGENCY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Branch"
              {...register('branchId', {
                required: determinedScope === 'BRANCH' || determinedScope === 'TEAM' ? 'Branch is required' : false,
              })}
              error={errors.branchId?.message}
              options={branchOptions}
              placeholder="Select a branch"
              disabled={!!preselectedBranch || !!preselectedTeam}
            />

            {(determinedScope === 'TEAM' || selectedRoles.includes('FIELD_CLINICIAN')) && watchedBranchId && (
              <Select
                label={determinedScope === 'TEAM' ? "Team" : "Team (Optional)"}
                {...register('teamId', {
                  required: determinedScope === 'TEAM' ? 'Team is required' : false,
                })}
                error={errors.teamId?.message}
                options={teamOptions}
                placeholder="Select a team"
                disabled={!!preselectedTeam}
              />
            )}
          </div>
        )}

        {/* Assignment Preview */}
        {selectedRoles.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-blue-900 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Assignment Summary
                </h5>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-blue-800">Roles:</span>
                  {selectedRoles.map(role => (
                    <Badge key={role} variant="default" size="sm">
                      {getRoleDisplayName(role)}
                    </Badge>
                  ))}
                </div>
                
                {selectedDisciplines.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-blue-800">Disciplines:</span>
                    {selectedDisciplines.map(discipline => (
                      <Badge key={discipline} variant="info" size="sm">
                        {getDisciplineDisplayName(discipline)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-sm text-blue-600">
                  Access Scope: <span className="font-medium">{determinedScope}</span>
                  {determinedScope !== 'AGENCY' && branchOptions.find(b => b.value === watchedBranchId?.toString()) && (
                    <span> • {branchOptions.find(b => b.value === watchedBranchId?.toString())?.label}</span>
                  )}
                  {determinedScope === 'TEAM' && teamOptions.find(t => t.value === watch('teamId')?.toString()) && (
                    <span> • {teamOptions.find(t => t.value === watch('teamId')?.toString())?.label}</span>
                  )}
                </div>
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
            {existingAssignment ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Card>
  );
};