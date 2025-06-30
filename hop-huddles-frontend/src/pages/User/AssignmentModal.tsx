import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X } from 'lucide-react';
import type { User, CreateAssignmentRequest, UserRole, Discipline, Branch } from '../../types';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  agencyId: number;
  branches: Branch[];
  onSuccess: () => void;
}

const userRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'ADMIN', label: 'Administrator', description: 'Full system access and management' },
  { value: 'BRANCH_MANAGER', label: 'Branch Manager', description: 'Manages branch operations and staff' },
  { value: 'EDUCATOR', label: 'Educator', description: 'Creates and manages training content' },
  { value: 'CLINICAL_MANAGER', label: 'Manager', description: 'Supervises teams and operations' },
  { value: 'FIELD_CLINICIAN', label: 'Field Clinician', description: 'Provides direct patient care' },
  { value: 'PRECEPTOR', label: 'Preceptor', description: 'Mentors and supervises other clinicians' },
  { value: 'LEARNER', label: 'Learner', description: 'Participates in training programs' },
  { value: 'SCHEDULER', label: 'Scheduler', description: 'Manages scheduling and assignments' },
  { value: 'INTAKE_COORDINATOR', label: 'Intake Coordinator', description: 'Coordinates patient intake and referrals' },
];

const disciplines: { value: Discipline; label: string }[] = [
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
  agencyId,
  branches,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateAssignmentRequest>();

  const selectedRole = watch('role');

  // Create assignment mutation
  const createAssignmentMutation = useMutation(apiClient.createAssignment, {
    onSuccess: () => {
      onSuccess();
      onClose();
      reset();
      toast.success('Assignment created successfully');
    },
    onError: () => {
      toast.error('Failed to create assignment');
    }
  });

  const handleFormSubmit = (data: CreateAssignmentRequest) => {
    if (!user) return;
    
    const assignmentData: CreateAssignmentRequest = {
      ...data,
      userId: user.userId,
      agencyId,
      isPrimary: user.assignments.length === 0, // First assignment is primary
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !user) return null;

  // Check if role requires discipline
  const requiresDiscipline = ['FIELD_CLINICIAN', 'PRECEPTOR', 'LEARNER'].includes(selectedRole);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create Assignment for {user.name}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <select
                    id="role"
                    {...register('role', { required: 'Role is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">Select a role</option>
                    {userRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                  {selectedRole && (
                    <p className="mt-1 text-sm text-gray-500">
                      {userRoles.find(r => r.value === selectedRole)?.description}
                    </p>
                  )}
                </div>

                {/* Discipline Selection (conditional) */}
                {requiresDiscipline && (
                  <div>
                    <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
                      Discipline *
                    </label>
                    <select
                      id="discipline"
                      {...register('discipline', { 
                        required: requiresDiscipline ? 'Discipline is required for this role' : false 
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.discipline ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    >
                      <option value="">Select a discipline</option>
                      {disciplines.map((discipline) => (
                        <option key={discipline.value} value={discipline.value}>
                          {discipline.label}
                        </option>
                      ))}
                    </select>
                    {errors.discipline && (
                      <p className="mt-1 text-sm text-red-600">{errors.discipline.message}</p>
                    )}
                  </div>
                )}

                {/* Branch Selection (optional) */}
                {branches.length > 0 && (
                  <div>
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                      Branch (Optional)
                    </label>
                    <select
                      id="branchId"
                      {...register('branchId', { valueAsNumber: true })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">No specific branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.name} {branch.location && `(${branch.location})`}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Leave empty for agency-wide access
                    </p>
                  </div>
                )}

                {/* Primary Assignment Info */}
                {user.assignments.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      This will be the user's primary assignment since they don't have any existing assignments.
                    </p>
                  </div>
                )}

                {/* Existing Assignments */}
                {user.assignments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Assignments:</h4>
                    <div className="space-y-1">
                      {user.assignments.map((assignment) => (
                        <div
                          key={assignment.assignmentId}
                          className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1"
                        >
                          {assignment.role.replace('_', ' ')} 
                          {assignment.discipline && ` (${assignment.discipline})`}
                          {assignment.branchName && ` @ ${assignment.branchName}`}
                          {assignment.isPrimary && ' - Primary'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={createAssignmentMutation.isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAssignmentMutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Assignment'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default AssignmentModal;