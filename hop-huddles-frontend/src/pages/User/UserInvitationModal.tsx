// pages/User/UserInvitationModal.tsx - Modal for inviting new users to the agency
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Mail, User, Shield, Building, Users, Send, AlertCircle } from 'lucide-react';
import type { UserRole, Discipline, Branch, Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface UserInvitationData {
  email: string;
  name: string;
  role: UserRole;
  disciplines: Discipline[];
  branchId?: number;
  teamId?: number;
  personalMessage?: string;
}

interface UserInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvitation: (data: UserInvitationData) => void;
  agencyId?: number;
  branches: Branch[];
}

// Replace the roleOptions array around line 20:
const roleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
  requiresBranch?: boolean;
  requiresTeam?: boolean;
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
    requiresBranch: true
  },
  { 
    value: 'CLINICAL_MANAGER', 
    label: 'Clinical Manager', 
    description: 'Team leader with team management capabilities',
    requiresBranch: true,
    requiresTeam: true
  },
  { 
    value: 'FIELD_CLINICIAN', 
    label: 'Field Clinician', 
    description: 'Clinical staff member providing direct patient care' 
  }
];

// Replace the disciplineOptions array around line 60:
const disciplineOptions: Array<{
  value: Discipline;
  label: string;
  category: string;
}> = [
  { value: 'RN', label: 'Registered Nurse', category: 'Nursing' },
  { value: 'LPN', label: 'Licensed Practical Nurse', category: 'Nursing' },
  { value: 'PT', label: 'Physical Therapist', category: 'Therapy' },
  { value: 'OT', label: 'Occupational Therapist', category: 'Therapy' },
  { value: 'SLP', label: 'Speech-Language Pathologist', category: 'Therapy' },
  { value: 'HHA', label: 'Home Health Aide', category: 'Support' },
  { value: 'MSW', label: 'Medical Social Worker', category: 'Social Services' },
  { value: 'OTHER', label: 'Other', category: 'Other' }
];

const UserInvitationModal: React.FC<UserInvitationModalProps> = ({
  isOpen,
  onClose,
  onSendInvitation,
  agencyId,
  branches
}) => {
  const { currentAgency } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<UserInvitationData>();

  const watchedRole = watch('role');
  const watchedBranchId = watch('branchId');
  const watchedDisciplines = watch('disciplines') || [];

  const selectedRoleOption = roleOptions.find(option => option.value === watchedRole);

  const onSubmit = async (data: UserInvitationData) => {
    setIsSubmitting(true);
    try {
      await onSendInvitation(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleDiscipline = (discipline: Discipline) => {
    const currentDisciplines = watchedDisciplines;
    const newDisciplines = currentDisciplines.includes(discipline)
      ? currentDisciplines.filter(d => d !== discipline)
      : [...currentDisciplines, discipline];
    setValue('disciplines', newDisciplines);
  };

  if (!isOpen) return null;

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
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Invite User to {currentAgency?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send an invitation to join your agency
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

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="user@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Role *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {roleOptions.map((option) => (
                      <label key={option.value} className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        watchedRole === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value={option.value}
                          {...register('role', { required: 'Please select a role' })}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <Shield className={`h-5 w-5 mt-0.5 mr-3 ${
                            watchedRole === option.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900">{option.label}</h4>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            {(option.requiresBranch || option.requiresTeam) && (
                              <div className="flex items-center mt-2 text-xs text-amber-600">
                                <AlertCircle size={12} className="mr-1" />
                                Requires {option.requiresBranch && 'branch'} {option.requiresTeam && 'and team'} assignment
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                {/* Branch Selection (if required) */}
                {selectedRoleOption?.requiresBranch && (
                  <div>
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                      Branch Assignment *
                    </label>
                    <select
                      id="branchId"
                      {...register('branchId', { 
                        required: selectedRoleOption.requiresBranch ? 'Branch selection is required' : false,
                        valueAsNumber: true
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.branchId ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    >
                      <option value="">Select a branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.name} {branch.location && `- ${branch.location}`}
                        </option>
                      ))}
                    </select>
                    {errors.branchId && (
                      <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>
                    )}
                  </div>
                )}

                {/* Disciplines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Disciplines *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                          <div className="font-medium">{discipline.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{discipline.category}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {watchedDisciplines.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one discipline</p>
                  )}
                </div>

                {/* Personal Message */}
                <div>
                  <label htmlFor="personalMessage" className="block text-sm font-medium text-gray-700">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    id="personalMessage"
                    rows={3}
                    {...register('personalMessage')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a personal message to the invitation..."
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Invitation Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Invitee:</strong> {watch('name') || 'Name'} ({watch('email') || 'email@company.com'})</p>
                    <p><strong>Role:</strong> {selectedRoleOption?.label || 'Select role'}</p>
                    <p><strong>Disciplines:</strong> {watchedDisciplines.length > 0 ? watchedDisciplines.join(', ') : 'None selected'}</p>
                    <p><strong>Agency:</strong> {currentAgency?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || watchedDisciplines.length === 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default UserInvitationModal;