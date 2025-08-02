// pages/sequences/BranchSequenceCreator.tsx
import React, { useState } from 'react';
import { ChevronRight, MapPin, Users, Zap, Calendar, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { Branch, Discipline, UserRole, FrequencyType } from '../../types';

interface BranchSequenceCreatorProps {
  // For EDUCATORs to create branch-specific sequences
}

interface SequenceFormData {
  branchId: string;
  title: string;
  description: string;
  topic: string;
  numberOfHuddlesPerCombination: number;
  estimatedDurationMinutes: number;
  targetRoles: UserRole[];
  targetDisciplines: Discipline[];
  generationPrompt: string;
  releaseDate?: string;
  releaseTime?: string;
  frequency?: FrequencyType;
}

// Available roles for target audience
const AVAILABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'EDUCATOR' as UserRole, label: 'EDUCATOR' },
  { value: 'DIRECTOR' as UserRole, label: 'DIRECTOR' },
  { value: 'CLINICAL_MANAGER' as UserRole, label: 'CLINICAL_MANAGER' },
  { value: 'FIELD_CLINICIAN' as UserRole, label: 'FIELD_CLINICIAN' },
];

export const BranchSequenceCreator: React.FC<BranchSequenceCreatorProps> = () => {
  const { currentUser, currentAssignment } = useApp();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [combinationPreview, setCombinationPreview] = useState<string[]>([]);

  // Get branches assigned to current EDUCATOR
  const {
    data: assignedBranches,
    loading: branchesLoading,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      if (!currentAssignment) return [];
      return await apiClient.getEducatorAccessibleBranches(currentUser.userId, currentAssignment.agencyId);
    },
    [currentUser?.userId]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SequenceFormData>({
    defaultValues: {
      numberOfHuddlesPerCombination: 3,
      estimatedDurationMinutes: 15,
    },
  });

  const watchedBranchId = watch('branchId');

  // Update selected branch when branch changes
  React.useEffect(() => {
    if (watchedBranchId && assignedBranches) {
      const branch = assignedBranches.find(b => b.branchId.toString() === watchedBranchId);
      setSelectedBranch(branch || null);
      
      // Reset disciplines when branch changes
      setSelectedDisciplines([]);
      updateCombinationPreview([], selectedRoles);
    }
  }, [watchedBranchId, assignedBranches]);

  // Update combination preview when roles or disciplines change
  React.useEffect(() => {
    updateCombinationPreview(selectedDisciplines, selectedRoles);
  }, [selectedDisciplines, selectedRoles]);

  const updateCombinationPreview = (disciplines: Discipline[], roles: UserRole[]) => {
    const combinations: string[] = [];
    
    for (const role of roles) {
      for (const discipline of disciplines) {
        combinations.push(`${discipline}-${role}`);
      }
    }
    
    setCombinationPreview(combinations);
  };

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev => {
      const newRoles = prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role];
      
      return newRoles;
    });
  };

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines(prev => {
      const newDisciplines = prev.includes(discipline)
        ? prev.filter(d => d !== discipline)
        : [...prev, discipline];
      
      return newDisciplines;
    });
  };

  const onSubmit = async (data: SequenceFormData) => {
    // Validate target audience
    if (selectedRoles.length === 0) {
      setError('root', { message: 'Please select at least one target role' });
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError('root', { message: 'Please select at least one target discipline' });
      return;
    }

    setIsSubmitting(true);
    try {
      const sequence = await apiClient.createBranchSequence({
        branchId: parseInt(data.branchId),
        title: data.title,
        description: data.description,
        topic: data.topic,
        numberOfHuddlesPerCombination: data.numberOfHuddlesPerCombination,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        targetRoles: selectedRoles,
        targetDisciplines: selectedDisciplines,
        generationPrompt: data.generationPrompt,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        releaseTime: data.releaseTime || undefined,
        frequency: data.frequency,
      });

      // Navigate to preview page
      navigate(`/sequences/${sequence.sequenceId}/preview`);
      
    } catch (error: any) {
      console.error('Failed to create sequence:', error);
      setError('root', {
        message: error.response?.data?.message || 'Failed to create sequence. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (branchesLoading) {
    return <LoadingSpinner text="Loading your branches..." className="py-12" />;
  }

  if (!assignedBranches || assignedBranches.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Available</h3>
        <p className="text-gray-500 mb-4">
          You need to be assigned to at least one branch to create sequences.
        </p>
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="font-medium text-blue-900 mb-2">💡 Quick Setup:</p>
          <ol className="text-left space-y-1">
            <li>1. Go to <strong>Branches</strong> page</li>
            <li>2. Click <strong>"Create Branch"</strong></li>
            <li>3. Fill in branch details and select disciplines</li>
            <li>4. You'll be automatically assigned to your created branch</li>
            <li>5. Return here to create sequences</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Huddle Sequence</h1>
        <p className="mt-2 text-gray-600">
          Create branch-specific sequences with role-discipline combinations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Branch Selection */}
        <Card>
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Branch Context</h3>
          </div>

          <Select
            label="Select Branch"
            {...register('branchId', { required: 'Please select a branch' })}
            error={errors.branchId?.message}
            required
            options={[
              { value: '', label: 'Choose a branch...' },
              ...assignedBranches.map(branch => ({
                value: branch.branchId.toString(),
                label: `${branch.name} - ${branch.city}, ${branch.state}`
              }))
            ]}
          />

          {selectedBranch && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-blue-900">{selectedBranch.name}</p>
                  <p className="text-sm text-blue-800">
                    {selectedBranch.city}, {selectedBranch.state} {selectedBranch.zipCode}
                  </p>
                  {selectedBranch.ccn && (
                    <p className="text-sm text-blue-800">CCN: {selectedBranch.ccn}</p>
                  )}
                </div>
                <Badge variant="info">
                  {selectedBranch.disciplines.length} disciplines available
                </Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Sequence Details */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sequence Information</h3>

          <div className="space-y-4">
            <Input
              label="Sequence Title"
              placeholder="Enter a descriptive title for your sequence"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 255, message: 'Title must not exceed 255 characters' }
              })}
              error={errors.title?.message}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the purpose and goals of this sequence"
              {...register('description', {
                maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' }
              })}
              error={errors.description?.message}
              rows={3}
            />

            <Textarea
              label="Learning Topic"
              placeholder="Main topic or subject for AI content generation"
              {...register('topic', {
                required: 'Topic is required for AI generation',
                minLength: { value: 10, message: 'Topic must be at least 10 characters' },
                maxLength: { value: 1000, message: 'Topic must not exceed 1000 characters' }
              })}
              error={errors.topic?.message}
              required
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Huddles per Combination"
                type="number"
                min={1}
                max={10}
                {...register('numberOfHuddlesPerCombination', {
                  required: 'Number of huddles is required',
                  min: { value: 1, message: 'Must be at least 1 huddle' },
                  max: { value: 10, message: 'Cannot exceed 10 huddles per combination' }
                })}
                error={errors.numberOfHuddlesPerCombination?.message}
                required
              />

              <Input
                label="Estimated Duration (minutes)"
                type="number"
                min={5}
                max={60}
                {...register('estimatedDurationMinutes', {
                  min: { value: 5, message: 'Duration must be at least 5 minutes' },
                  max: { value: 60, message: 'Duration cannot exceed 60 minutes' }
                })}
                error={errors.estimatedDurationMinutes?.message}
              />
            </div>
          </div>
        </Card>

        {/* Target Audience */}
        {selectedBranch && (
          <Card>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Target Audience</h3>
            </div>

            {/* Roles Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Roles *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role.value);
                  
                  return (
                    <div
                      key={role.value}
                      onClick={() => handleRoleToggle(role.value)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Badge
                        variant={isSelected ? 'info' : 'default'}
                        className="w-full justify-center"
                      >
                        {role.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disciplines Selection (Branch-Specific) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Disciplines * (Available in {selectedBranch.name})
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Only disciplines assigned to this branch are available for selection. 
                {selectedBranch.disciplines.length} disciplines available.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedBranch.disciplines.map((discipline) => {
                  const isSelected = selectedDisciplines.includes(discipline);
                  
                  return (
                    <div
                      key={discipline}
                      onClick={() => handleDisciplineToggle(discipline)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Badge
                        variant={isSelected ? 'success' : 'default'}
                        className="w-full justify-center"
                      >
                        {discipline}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combination Preview */}
            {combinationPreview.length > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Generated Combinations ({combinationPreview.length}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {combinationPreview.map((combination, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {combination}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Each combination will generate {watch('numberOfHuddlesPerCombination') || 3} huddles
                </p>
              </div>
            )}
          </Card>
        )}

        {/* AI Generation */}
        <Card>
          <div className="flex items-center mb-4">
            <Zap className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">AI Content Generation</h3>
          </div>

          <Textarea
            label="Generation Prompt"
            placeholder="Provide specific instructions for AI content generation..."
            {...register('generationPrompt', {
              required: 'Generation prompt is required',
              minLength: { value: 20, message: 'Prompt must be at least 20 characters' }
            })}
            error={errors.generationPrompt?.message}
            required
            rows={4}
          />

          {selectedBranch && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Context:</strong> Content will be generated using CCN {selectedBranch.ccn || 'N/A'} 
                and location {selectedBranch.state} for branch-specific relevance.
              </p>
            </div>
          )}
        </Card>

        {/* Optional Scheduling */}
        <Card>
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Scheduling (Optional)</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You can set scheduling now or configure it later from the sequences page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Release Date"
              type="date"
              {...register('releaseDate')}
              error={errors.releaseDate?.message}
            />

            <Input
              label="Release Time"
              type="time"
              {...register('releaseTime')}
              error={errors.releaseTime?.message}
            />

            <Select
              label="Frequency"
              {...register('frequency')}
              error={errors.frequency?.message}
              options={[
                { value: '', label: 'Select frequency...' },
                { value: 'ONCE', label: 'Once' },
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' }
              ]}
            />
          </div>
        </Card>

        {/* Error Display */}
        {errors.root && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => navigate('/sequences')}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Create Sequence
            {combinationPreview.length > 0 && (
              <span className="ml-2 text-xs">
                ({combinationPreview.length} combinations)
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};