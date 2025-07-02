import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Wand2, 
  Users, 
  Clock, 
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { CreateSequenceRequest, TargetType, Discipline, UserRole, Branch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

interface SequenceFormData extends CreateSequenceRequest {
  targets: {
    targetType: TargetType;
    targetValue: string;
  }[];
}

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

const roles: { value: UserRole; label: string }[] = [
  { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
  { value: 'EDUCATOR', label: 'Educator' }
];

const SequenceCreate: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentAgency, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SequenceFormData>({
    defaultValues: {
      agencyId: currentAgency?.agencyId || 0,
      title: '',
      description: '',
      topic: '',
      estimatedDurationMinutes: 30,
      targets: [{ targetType: 'DISCIPLINE', targetValue: 'RN' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'targets',
  });

  // Fetch branches for targeting
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Create sequence mutation
  const createSequenceMutation = useMutation(
    (data: CreateSequenceRequest) => apiClient.createSequence(data),
    {
      onSuccess: (newSequence) => {
        toast.success('Sequence created successfully! AI is generating content...');
        navigate(`/sequences/${newSequence.sequenceId}`);
      },
      onError: () => {
        toast.error('Failed to create sequence');
        setIsGenerating(false);
      }
    }
  );

  const handleFormSubmit = async (data: SequenceFormData) => {
    if (!currentAgency) {
      toast.error('No agency selected');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    setTimeout(() => {
      createSequenceMutation.mutate({
        ...data,
        agencyId: currentAgency.agencyId,
      });
    }, 2000);
  };

  const addTarget = () => {
    append({ targetType: 'DISCIPLINE', targetValue: 'RN' });
  };

  const getTargetOptions = (targetType: TargetType) => {
    switch (targetType) {
      case 'DISCIPLINE':
        return disciplines;
      case 'ROLE':
        return roles;
      case 'BRANCH':
        return branches?.map(branch => ({ value: branch.branchId.toString(), label: branch.name })) || [];
      case 'TEAM':
        return []; // Would fetch teams based on selected branch
      default:
        return [];
    }
  };

  const suggestedTopics = [
    'Fall Prevention in Home Healthcare',
    'Medication Management Best Practices',
    'Infection Control Protocols',
    'Documentation and Compliance',
    'Patient Safety and Risk Assessment',
    'OASIS Assessment Guidelines',
    'Wound Care Management',
    'Mental Health Support Strategies',
  ];

  const [selectedTopic, setSelectedTopic] = useState('');
  // ADD permission check before rendering
  const canCreateSequences = hasPermission(user?.assignments || [], PERMISSIONS.HUDDLE_CREATE);

  if (!canCreateSequences) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to create huddle sequences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/sequences')}
          className="text-gray-400 hover:text-gray-600 p-2"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Huddle Sequence</h1>
          <p className="text-gray-600">
            Use AI to generate personalized micro-education content for your healthcare teams.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Sequence Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g., Fall Prevention Training Series"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Provide a brief description of what this sequence will cover..."
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label htmlFor="estimatedDurationMinutes" className="block text-sm font-medium text-gray-700">
                <Clock size={16} className="inline mr-1" />
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                id="estimatedDurationMinutes"
                min="5"
                max="180"
                {...register('estimatedDurationMinutes', { 
                  required: 'Duration is required',
                  min: { value: 5, message: 'Minimum duration is 5 minutes' },
                  max: { value: 180, message: 'Maximum duration is 180 minutes' }
                })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.estimatedDurationMinutes ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="30"
              />
              {errors.estimatedDurationMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedDurationMinutes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Topic Generation */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wand2 size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Topic Generation</h2>
          </div>

          <div className="space-y-4">
            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Training Topic or Focus Area *
              </label>
              <textarea
                id="topic"
                rows={3}
                {...register('topic', { required: 'Topic is required' })}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.topic ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Describe what you want the AI to create training content about..."
              />
              {errors.topic && (
                <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
              )}
            </div>

            {/* Suggested Topics */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                <Sparkles size={16} className="inline mr-1" />
                Suggested Topics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className="text-left p-2 text-xs border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target size={20} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Target Audience</h2>
            </div>
            <button
              type="button"
              onClick={addTarget}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} className="mr-1" />
              Add Target
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end space-x-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Target Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Type
                    </label>
                    <select
                      {...register(`targets.${index}.targetType` as const)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="DISCIPLINE">Discipline</option>
                      <option value="ROLE">Role</option>
                      <option value="BRANCH">Branch</option>
                      <option value="TEAM">Team</option>
                    </select>
                  </div>

                  {/* Target Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Value
                    </label>
                    <select
                      {...register(`targets.${index}.targetValue` as const)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {getTargetOptions(watch(`targets.${index}.targetType`)).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remove Button */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <Users size={16} className="inline mr-2" />
              The sequence will be visible only to users matching these target criteria.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => navigate('/sequences')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isGenerating || createSequenceMutation.isLoading}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating with AI...
              </>
            ) : (
              <>
                <Wand2 size={16} className="mr-2" />
                Create & Generate Content
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Generation Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Sparkles size={20} className="text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              AI-Powered Content Generation
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Our AI will create a comprehensive micro-education sequence including:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Multiple focused huddles covering your topic</li>
              <li>• Role and discipline-specific content</li>
              <li>• Interactive assessments and knowledge checks</li>
              <li>• Voice scripts optimized for audio learning</li>
              <li>• PDF materials for reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceCreate;