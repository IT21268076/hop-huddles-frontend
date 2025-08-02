// pages/sequences/CreateSequencePage.tsx
import React, { useState, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Clock, BookOpen, Calendar, Play, Building2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useForm } from 'react-hook-form';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { CreateSequenceRequest, TargetType, Discipline, UserRole, FrequencyType, Branch, BranchSequenceCreateRequest } from '../../types';

interface SequenceFormData extends Omit<BranchSequenceCreateRequest, 'targetRoles' | 'targetDisciplines'> {
  selectedDisciplines: Discipline[];
  selectedRoles: UserRole[];
  releaseDate?: string;
  releaseTime?: string;
  frequency?: FrequencyType;
}

export const CreateSequencePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAgency, currentUser, currentAssignment } = useApp();
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<SequenceFormData>();

  const watchedNumberOfHuddles = useWatch({
    control,
    name: 'numberOfHuddles',
  });

  // Load accessible branches for EDUCATOR
  useEffect(() => {
    const loadAccessibleBranches = async () => {
      if (!currentUser || !currentAgency) {
        setBranchesLoading(false);
        return;
      }

      try {
        setBranchesLoading(true);
        // Try to get branches accessible by this educator
        console.log('🔧 Loading accessible branches for user:', currentUser.userId, 'agency:', currentAgency.agencyId);
        const branches = await apiClient.getUserAccessibleBranches(currentUser.userId, currentAgency.agencyId);
        console.log('🔧 Loaded accessible branches:', branches);
        setAvailableBranches(branches);
        
        // Auto-select first branch if only one available, or current assignment branch
        if (branches.length === 1) {
          setSelectedBranchId(branches[0].branchId);
        } else if (currentAssignment?.branchId && branches.some(b => b.branchId === currentAssignment.branchId)) {
          setSelectedBranchId(currentAssignment.branchId);
        }
      } catch (error) {
        console.error('Failed to load accessible branches:', error);
        // No fallback - only show branches user is actually assigned to
        setAvailableBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };

    loadAccessibleBranches();
  }, [currentUser, currentAgency, currentAssignment]);

  const onSubmit = async (data: SequenceFormData) => {
    if (!currentAgency || !currentUser) {
      setError('title', { type: 'server', message: 'Agency or user not selected' });
      return;
    }

    if (!selectedBranchId) {
      setError('title', { type: 'server', message: 'Please select a branch for this sequence' });
      return;
    }

    if (selectedDisciplines.length === 0 && selectedRoles.length === 0) {
      setError('title', { 
        type: 'server', 
        message: 'Please select at least one discipline or role for targeting' 
      });
      return;
    }

    if (!data.numberOfHuddles || data.numberOfHuddles < 1) {
      setError('numberOfHuddles', {
        type: 'server',
        message: 'Number of huddles is required and must be at least 1'
      });
      return;
    }

    try {
      setIsGenerating(true);

      const sequenceData: BranchSequenceCreateRequest = {
        branchId: selectedBranchId,
        title: data.title,
        description: data.description,
        topic: data.topic,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        
        // Target audience
        targetRoles: selectedRoles,
        targetDisciplines: selectedDisciplines,
      };

      const createdSequence = await apiClient.createBranchSequence(sequenceData);

      navigate(`/sequences/${createdSequence.sequenceId}`);
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SequenceFormData, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        setError('title', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to create sequence',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

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

  const roleOptions = [
    { value: 'FIELD_CLINICIAN', label: 'Frontline Clinician' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'EDUCATOR', label: 'Educator' }
  ];

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

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to create a sequence.</p>
      </div>
    );
  }

  if (!branchesLoading && availableBranches.length === 0) {
    return (
      <>
        <PageHeader
          title="Create New Huddle Sequence"
          description="Generate AI-powered micro-learning content tailored to your team"
          breadcrumbs={[
            { label: 'Huddle Sequences', href: '/sequences' },
            { label: 'New Sequence' },
          ]}
        />
        
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Branches Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have access to any branches, or no branches have been created yet.
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/sequences')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sequences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Create New Huddle Sequence"
        description="Generate AI-powered micro-learning content tailored to your team"
        breadcrumbs={[
          { label: 'Huddle Sequences', href: '/sequences' },
          { label: 'New Sequence' },
        ]}
      />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Provide the topic and details for your AI-generated huddle sequence
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Sequence Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                placeholder="e.g., Fall Prevention Training"
              />

              <Textarea
                label="Topic/Subject"
                {...register('topic')}
                error={errors.topic?.message}
                placeholder="e.g., Patient safety and fall prevention strategies for home health care"
                rows={3}
                helper="Describe the main topic or learning objective for the AI to generate content around"
              />

              <Textarea
                label="Description (Optional)"
                {...register('description')}
                error={errors.description?.message}
                placeholder="e.g., Comprehensive fall prevention protocols for field clinicians"
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Number of Huddles"
                  type="number"
                  {...register('numberOfHuddles', {
                    valueAsNumber: true,
                    required: 'Number of huddles is required',
                    min: { value: 1, message: 'Must have at least 1 huddle' },
                    max: { value: 20, message: 'Maximum 20 huddles per sequence' },
                  })}
                  error={errors.numberOfHuddles?.message}
                  placeholder="5"
                  helper="Number of micro-learning episodes in this sequence"
                />
                
                <Input
                  label="Estimated Duration (minutes)"
                  type="number"
                  {...register('estimatedDurationMinutes', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                  })}
                  error={errors.estimatedDurationMinutes?.message}
                  placeholder="45"
                  helper="Total estimated time for all huddles"
                />
              </div>
            </div>
          </Card>

          {/* Branch Selection */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                Branch Selection
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose which branch this sequence will be created for
              </p>
            </div>

            <div className="space-y-4">
              {branchesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading accessible branches...</span>
                </div>
              ) : availableBranches.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Building2 className="h-5 w-5 text-yellow-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-900">No Branches Available</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You don't have access to any branches, or no branches have been created yet. 
                        Please contact your administrator or create a branch first.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Select
                    label="Target Branch"
                    value={selectedBranchId?.toString() || ''}
                    onChange={(value) => setSelectedBranchId(value ? parseInt(value) : null)}
                    options={availableBranches.map(branch => ({
                      value: branch.branchId.toString(),
                      label: `${branch.name} (${branch.city}, ${branch.state})`
                    }))}
                    placeholder="Select a branch"
                    required
                    helper="The sequence will be created for this specific branch and will be visible to users assigned to it"
                  />
                  
                  {selectedBranchId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {(() => {
                        const selectedBranch = availableBranches.find(b => b.branchId === selectedBranchId);
                        return selectedBranch ? (
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-900">
                                Selected Branch: {selectedBranch.name}
                              </h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Location: {selectedBranch.city}, {selectedBranch.state} {selectedBranch.zipCode}
                              </p>
                              {selectedBranch.disciplines && selectedBranch.disciplines.length > 0 && (
                                <p className="text-sm text-blue-700 mt-1">
                                  Available disciplines: {selectedBranch.disciplines.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Scheduling Section */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Scheduling & Release
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure when and how often huddles will be automatically released to users
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Release Date"
                  type="date"
                  {...register('releaseDate', {
                    required: 'Release date is required for automatic scheduling',
                  })}
                  error={errors.releaseDate?.message}
                  helper="First huddle release date"
                />
                
                <Input
                  label="Release Time"
                  type="time"
                  {...register('releaseTime', {
                    required: 'Release time is required for automatic scheduling',
                  })}
                  error={errors.releaseTime?.message}
                  helper="Daily release time"
                />
                
                <Select
                  label="Frequency"
                  {...register('frequency', {
                    required: 'Release frequency is required',
                  })}
                  error={errors.frequency?.message}
                  options={[
                    { value: 'DAILY', label: 'Daily' },
                    { value: 'WEEKLY', label: 'Weekly' },
                    { value: 'MONTHLY', label: 'Monthly' },
                  ]}
                  placeholder="Select frequency"
                  helper="How often new huddles are released"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Play className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      Automatic Episode Release
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Huddles will be automatically released to your target audience based on the schedule you set. 
                      Each episode becomes available progressively, creating a structured learning journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Target Audience */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Target Audience
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Select disciplines and roles to target for personalized content
              </p>
            </div>

            <div className="space-y-6">
              {/* Disciplines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Disciplines
                </label>
                <div className="flex flex-wrap gap-2">
                  {disciplineOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleDiscipline(option.value as Discipline)}
                      className={`px-3 py-2 text-sm font-medium rounded-full border transition-colors ${
                        selectedDisciplines.includes(option.value as Discipline)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {selectedDisciplines.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDisciplines.map((discipline) => (
                      <Badge key={discipline} variant="info" size="sm">
                        {disciplineOptions.find(o => o.value === discipline)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleRole(option.value as UserRole)}
                      className={`px-3 py-2 text-sm font-medium rounded-full border transition-colors ${
                        selectedRoles.includes(option.value as UserRole)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {selectedRoles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedRoles.map((role) => (
                      <Badge key={role} variant="success" size="sm">
                        {roleOptions.find(o => o.value === role)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* RAG-Based AI Generation Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  RAG-Powered Content Generation
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Our advanced RAG (Retrieval-Augmented Generation) system will create a complete sequence with:
                </p>
                <ul className="mt-3 text-sm text-gray-600 space-y-1">
                  <li>• <strong>All {selectedRoles.length > 0 || selectedDisciplines.length > 0 ? 'Targeted' : 'Customized'} Content:</strong> PDF materials and voice-over scripts for all huddles generated at once</li>
                  <li>• <strong>Automatic Scheduling:</strong> Episodes released progressively based on your schedule</li>
                  <li>• <strong>Role & Discipline Specific:</strong> Content tailored to selected audience</li>
                  <li>• <strong>CMS Compliant:</strong> Latest healthcare requirements and evidence-based practices</li>
                  <li>• <strong>Micro-Learning:</strong> Bite-sized episodes for better retention</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    ✨ The RAG system will generate content for all {watchedNumberOfHuddles || 'specified'} huddles simultaneously, 
                    ensuring consistency and comprehensive coverage of your topic.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/sequences')}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sequences
            </Button>

            <Button
              type="submit"
              loading={isSubmitting || isGenerating}
              disabled={!selectedBranchId || availableBranches.length === 0 || (selectedDisciplines.length === 0 && selectedRoles.length === 0)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating RAG Content...' : 'Create Sequence & Generate Content'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};