// components/Sequence/EditSequenceModal.tsx - Modal for editing sequence details
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { 
  X, 
  Save, 
  Users, 
  Shield, 
  Target, 
  Clock, 
  FileText,
  Zap,
  Brain,
  Plus,
  Trash2
} from 'lucide-react';
import type { HuddleSequence, Discipline, UserRole, SequenceTarget } from '../../types';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface EditSequenceFormData {
  title: string;
  description: string;
  topic: string;
  estimatedDurationMinutes: number;
  disciplines: Discipline[];
  roles: UserRole[];
}

interface EditSequenceModalProps {
  sequence: HuddleSequence;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const roleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  { value: 'EDUCATOR', label: 'Educator', description: 'Full system access including huddle creation' },
  { value: 'ADMIN', label: 'Administrator', description: 'Full system access except huddle creation' },
  { value: 'DIRECTOR', label: 'Director', description: 'Branch leader with management capabilities' },
  { value: 'CLINICAL_MANAGER', label: 'Clinical Manager', description: 'Team leader with management capabilities' },
  { value: 'FIELD_CLINICIAN', label: 'Field Clinician', description: 'Clinical staff providing direct patient care' },
  { value: 'SUPERADMIN', label: 'Super Administrator', description: 'System-wide administrative access' }
];

const EditSequenceModal: React.FC<EditSequenceModalProps> = ({
  sequence,
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<EditSequenceFormData>({
    defaultValues: {
      title: sequence.title,
      description: sequence.description || '',
      topic: sequence.topic || '',
      estimatedDurationMinutes: sequence.estimatedDurationMinutes || 0
    }
  });

  // Initialize selected disciplines and roles from sequence targets
  useEffect(() => {
    if (sequence.targets) {
      const disciplines = sequence.targets
        .filter(target => target.targetType === 'DISCIPLINE')
        .map(target => target.targetValue as Discipline);
      const roles = sequence.targets
        .filter(target => target.targetType === 'ROLE')
        .map(target => target.targetValue as UserRole);
      
      setSelectedDisciplines(disciplines);
      setSelectedRoles(roles);
    }
  }, [sequence]);

  // Update sequence mutation
  const updateSequenceMutation = useMutation(
    async (data: EditSequenceFormData) => {
      // Create new targets array
      const newTargets: Partial<SequenceTarget>[] = [
        ...selectedDisciplines.map((discipline, index) => ({
          targetType: 'DISCIPLINE' as const,
          targetValue: discipline,
          targetDisplayName: disciplineOptions.find(d => d.value === discipline)?.label || discipline,
          priority: index,
          isRequired: true
        })),
        ...selectedRoles.map((role, index) => ({
          targetType: 'ROLE' as const,
          targetValue: role,
          targetDisplayName: roleOptions.find(r => r.value === role)?.label || role,
          priority: selectedDisciplines.length + index,
          isRequired: true
        }))
      ];

      // Update sequence with new data and targets
      return await apiClient.updateSequence(sequence.sequenceId, {
        title: data.title,
        description: data.description,
        topic: data.topic,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        targets: newTargets as any
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sequence', sequence.sequenceId]);
        queryClient.invalidateQueries(['sequences']);
        toast.success('Sequence updated successfully');
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error('Failed to update sequence');
        console.error(error);
      }
    }
  );

  const toggleDiscipline = (discipline: Discipline) => {
    setSelectedDisciplines(prev =>
      prev.includes(discipline)
        ? prev.filter(d => d !== discipline)
        : [...prev, discipline]
    );
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const onSubmit = (data: EditSequenceFormData) => {
    if (selectedDisciplines.length === 0 && selectedRoles.length === 0) {
      toast.error('Please select at least one discipline or role');
      return;
    }
    updateSequenceMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Sequence</h2>
                  <p className="text-blue-100 text-sm">Update sequence details and targeting</p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Sequence Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter sequence title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this sequence covers"
                    />
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                      Topic/Category
                    </label>
                    <input
                      type="text"
                      id="topic"
                      {...register('topic')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Fall Prevention, Wound Care"
                    />
                  </div>

                  <div>
                    <label htmlFor="estimatedDurationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="estimatedDurationMinutes"
                        {...register('estimatedDurationMinutes', { 
                          min: { value: 0, message: 'Duration must be positive' }
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.estimatedDurationMinutes ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="30"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.estimatedDurationMinutes && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedDurationMinutes.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Disciplines */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Target Disciplines
                </h3>
                <p className="text-sm text-gray-600">Select which disciplines this sequence is intended for</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {disciplineOptions.map((discipline) => (
                    <label
                      key={discipline.value}
                      className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:scale-105 ${
                        selectedDisciplines.includes(discipline.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDisciplines.includes(discipline.value)}
                        onChange={() => toggleDiscipline(discipline.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-bold text-sm">{discipline.value}</div>
                        <div className="text-xs text-gray-600 mt-1">{discipline.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{discipline.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedDisciplines.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Selected:</strong> {selectedDisciplines.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Target Roles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Target Roles
                </h3>
                <p className="text-sm text-gray-600">Select which roles this sequence is intended for</p>
                
                <div className="space-y-3">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex items-start space-x-3 transition-all hover:scale-[1.01] ${
                        selectedRoles.includes(role.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                        selectedRoles.includes(role.value)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedRoles.includes(role.value) && (
                          <Target className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedRoles.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>Selected:</strong> {selectedRoles.map(role => 
                        roleOptions.find(r => r.value === role)?.label
                      ).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Enhancement Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Enhancement Available</h4>
                    <p className="text-sm text-gray-600">Let AI optimize your targeting and content suggestions</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>Optimize with AI</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {(selectedDisciplines.length > 0 || selectedRoles.length > 0) && (
                  <span>
                    Targeting {selectedDisciplines.length} discipline{selectedDisciplines.length !== 1 ? 's' : ''} 
                    and {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={updateSequenceMutation.isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSequenceMutation.isLoading || (!isDirty && selectedDisciplines.length === 0 && selectedRoles.length === 0)}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateSequenceMutation.isLoading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSequenceModal;