import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Target, 
  Clock, 
  FileText, 
  Mic, 
  Calendar,
  Users,
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { useApi } from '../../hooks/useApi';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRole, Discipline, CreateSequenceRequest, Huddle } from '../../types';

interface HuddleFormData {
  title: string;
  description: string;
  content: string;
  voiceScript: string;
  estimatedDuration: number;
  orderIndex: number;
  isRequired: boolean;
  pdfUrl?: string;
  audioUrl?: string;
}

interface ObjectiveFormData {
  value: string;
}

interface SequenceFormData {
  title: string;
  description: string;
  objectives: ObjectiveFormData[];
  targetRoles: UserRole[];
  targetDisciplines: Discipline[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDuration: number;
  scheduledPublishDate?: string;
  huddles: HuddleFormData[];
}

interface AIGenerationProgress {
  isGenerating: boolean;
  currentStep: string;
  progress: number;
  completedHuddles: number;
  totalHuddles: number;
}

export const AISequenceCreator: React.FC = () => {
  const navigate = useNavigate();
  const { sequenceId } = useParams();
  const { currentAgency, currentUser, currentAssignment } = useApp();
  const api = useApi();
  const isEdit = Boolean(sequenceId);

  const [currentStep, setCurrentStep] = useState(1);
  const [aiProgress, setAiProgress] = useState<AIGenerationProgress>({
    isGenerating: false,
    currentStep: '',
    progress: 0,
    completedHuddles: 0,
    totalHuddles: 0,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SequenceFormData>({
    defaultValues: {
      title: '',
      description: '',
      objectives: [{ value: '' }],
      targetRoles: [],
      targetDisciplines: [],
      difficulty: 'BEGINNER',
      estimatedDuration: 0,
      huddles: [
        {
          title: '',
          description: '',
          content: '',
          voiceScript: '',
          estimatedDuration: 5,
          orderIndex: 0,
          isRequired: true,
        }
      ],
    },
  });

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
    control,
    name: 'objectives',
  });

  const {
    fields: huddleFields,
    append: appendHuddle,
    remove: removeHuddle,
    update: updateHuddle,
  } = useFieldArray({
    control,
    name: 'huddles',
  });

  const watchedData = watch();

  // Load existing sequence for editing
  useEffect(() => {
    if (isEdit && sequenceId) {
      loadSequenceData();
    }
  }, [isEdit, sequenceId]);

  const loadSequenceData = async () => {
    try {
      const sequence = await api.getSequenceById(parseInt(sequenceId!));
      const huddles = await api.getHuddlesBySequence(sequence.sequenceId);

      // Populate form with existing data
      setValue('title', sequence.title);
      setValue('description', sequence.description || '');
      setValue('objectives', (sequence.objectives || ['']).map(obj => ({ value: obj })));
      setValue('targetRoles', sequence.targetRoles || []);
      setValue('targetDisciplines', sequence.targetDisciplines || []);
      setValue('difficulty', sequence.difficulty || 'BEGINNER');
      setValue('estimatedDuration', sequence.estimatedDuration || 0);
      setValue('scheduledPublishDate', sequence.scheduledPublishDate);

      // Populate huddles
      const huddleData = huddles.map(huddle => ({
        title: huddle.title,
        description: huddle.contentJson || '',
        content: huddle.contentJson || '',
        voiceScript: huddle.voiceScript || '',
        estimatedDuration: huddle.durationMinutes || 5,
        orderIndex: huddle.orderIndex,
        isRequired: true, // Default to required
        pdfUrl: huddle.pdfUrl,
        audioUrl: huddle.audioUrl,
      }));

      setValue('huddles', huddleData);
    } catch (error) {
      console.error('Failed to load sequence data:', error);
    }
  };

  const generateAIContent = async () => {
    if (!watchedData.title || !watchedData.description || watchedData.huddles.length === 0) {
      alert('Please fill in the basic sequence information and add at least one huddle before generating AI content.');
      return;
    }

    setAiProgress({
      isGenerating: true,
      currentStep: 'Initializing AI generation...',
      progress: 10,
      completedHuddles: 0,
      totalHuddles: watchedData.huddles.length,
    });

    try {
      // Generate content for each huddle
      for (let i = 0; i < watchedData.huddles.length; i++) {
        const huddle = watchedData.huddles[i];
        
        setAiProgress(prev => ({
          ...prev,
          currentStep: `Generating content for "${huddle.title}"...`,
          progress: 20 + (i / watchedData.huddles.length) * 60,
        }));

        // Mock AI content generation since API method doesn't exist
        const generatedContent = {
          content: `Generated content for ${huddle.title}. This would be comprehensive educational content covering the key concepts and learning objectives.`,
          voiceScript: `Voice script for ${huddle.title}. This would be the narration script for the audio version of the content.`,
          estimatedDuration: Math.max(5, Math.min(15, huddle.title.length / 10)),
          pdfUrl: undefined,
          audioUrl: undefined,
        };

        // Update huddle with generated content
        updateHuddle(i, {
          ...huddle,
          content: generatedContent.content,
          voiceScript: generatedContent.voiceScript,
          estimatedDuration: generatedContent.estimatedDuration,
          pdfUrl: generatedContent.pdfUrl,
          audioUrl: generatedContent.audioUrl,
        });

        setAiProgress(prev => ({
          ...prev,
          completedHuddles: i + 1,
        }));
      }

      setAiProgress(prev => ({
        ...prev,
        currentStep: 'Finalizing generation...',
        progress: 95,
      }));

      // Calculate total estimated duration
      const totalDuration = watchedData.huddles.reduce(
        (sum, huddle) => sum + (huddle.estimatedDuration || 0), 
        0
      );
      setValue('estimatedDuration', totalDuration);

      setAiProgress(prev => ({
        ...prev,
        currentStep: 'Generation complete!',
        progress: 100,
      }));

      setTimeout(() => {
        setAiProgress({
          isGenerating: false,
          currentStep: '',
          progress: 0,
          completedHuddles: 0,
          totalHuddles: 0,
        });
      }, 2000);

    } catch (error) {
      console.error('AI generation failed:', error);
      setAiProgress({
        isGenerating: false,
        currentStep: 'Generation failed',
        progress: 0,
        completedHuddles: 0,
        totalHuddles: 0,
      });
    }
  };

  const onSubmit = async (data: SequenceFormData) => {
    if (!currentAgency) return;

    try {
      const sequenceData: CreateSequenceRequest = {
        title: data.title,
        description: data.description,
        objectives: data.objectives.map(obj => obj.value).filter(value => value.trim() !== ''),
        targetRoles: data.targetRoles,
        targetDisciplines: data.targetDisciplines,
        difficulty: data.difficulty,
        estimatedDuration: data.estimatedDuration,
        scheduledPublishDate: data.scheduledPublishDate,
        agencyId: currentAgency.agencyId,
        branchId: currentAssignment?.branchId || 1, // Default to branch 1
        createdBy: 'current-user', // This should come from auth context
      };

      let savedSequence;
      if (isEdit) {
        // For editing, we need to use updateSequenceStatus or create a proper update method
        console.log('Sequence editing would be implemented here');
        return; // Skip for now since we don't have an update method
      } else {
        savedSequence = await api.createSequence(sequenceData, currentUser?.userId || 1);
      }

      // Save huddles
      for (const [index, huddle] of data.huddles.entries()) {
        const huddleData = {
          sequenceId: savedSequence.sequenceId,
          title: huddle.title,
          orderIndex: index,
          contentJson: huddle.content,
          voiceScript: huddle.voiceScript,
          durationMinutes: huddle.estimatedDuration,
          huddleType: 'STANDARD' as const,
        };

        if (isEdit) {
          // Update existing huddles or create new ones
          // This would require additional logic to handle existing huddle IDs
        } else {
          await api.createHuddle(huddleData);
        }
      }

      navigate(`/sequences/${savedSequence.sequenceId}`);
    } catch (error) {
      console.error('Failed to save sequence:', error);
    }
  };

  const addHuddle = () => {
    appendHuddle({
      title: '',
      description: '',
      content: '',
      voiceScript: '',
      estimatedDuration: 5,
      orderIndex: huddleFields.length,
      isRequired: true,
    });
  };

  const addObjective = () => {
    appendObjective({ value: '' });
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Target Audience', icon: Target },
    { id: 3, title: 'Huddles', icon: BookOpen },
    { id: 4, title: 'AI Generation', icon: Sparkles },
    { id: 5, title: 'Review & Publish', icon: CheckCircle },
  ];

  const roleOptions = [
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const disciplineOptions = [
    { value: 'RN', label: 'Registered Nurse' },
    { value: 'LPN', label: 'Licensed Practical Nurse' },
    { value: 'PT', label: 'Physical Therapist' },
    { value: 'OT', label: 'Occupational Therapist' },
    { value: 'SLP', label: 'Speech Language Pathologist' },
    { value: 'HHA', label: 'Home Health Aide' },
    { value: 'MSW', label: 'Medical Social Worker' },
  ];

  const difficultyOptions = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Input
                label="Sequence Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                placeholder="e.g., OASIS Assessment Fundamentals"
              />
            </div>

            <div>
              <Textarea
                label="Description"
                {...register('description', { required: 'Description is required' })}
                error={errors.description?.message}
                placeholder="Describe what this sequence will teach..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              {objectiveFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 mb-2">
                  <Input
                    {...register(`objectives.${index}.value` as const)}
                    placeholder={`Objective ${index + 1}`}
                    className="flex-1"
                  />
                  {objectiveFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </Button>
            </div>

            <div>
              <Select
                label="Difficulty Level"
                {...register('difficulty')}
                options={difficultyOptions}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Roles
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map(role => (
                  <label key={role.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={role.value}
                      {...register('targetRoles')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Disciplines
              </label>
              <div className="grid grid-cols-2 gap-3">
                {disciplineOptions.map(discipline => (
                  <label key={discipline.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={discipline.value}
                      {...register('targetDisciplines')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{discipline.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="Scheduled Publish Date (Optional)"
                type="datetime-local"
                {...register('scheduledPublishDate')}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Huddle Episodes</h3>
              <Button type="button" onClick={addHuddle} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Huddle
              </Button>
            </div>

            {huddleFields.map((field, index) => (
              <Card key={field.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Huddle {index + 1}</h4>
                    {huddleFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHuddle(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Title"
                      {...register(`huddles.${index}.title` as const)}
                      placeholder="e.g., Introduction to OASIS"
                    />
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      {...register(`huddles.${index}.estimatedDuration` as const)}
                      min="1"
                      max="60"
                    />
                  </div>

                  <div className="mt-4">
                    <Textarea
                      label="Description"
                      {...register(`huddles.${index}.description` as const)}
                      placeholder="What will this huddle cover?"
                      rows={2}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`huddles.${index}.isRequired` as const)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Required for sequence completion</span>
                    </label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Content Generation
              </h3>
              <p className="text-gray-600 mb-6">
                Let AI generate comprehensive content, scripts, and materials for your huddles
              </p>
            </div>

            {aiProgress.isGenerating ? (
              <Card>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {aiProgress.currentStep}
                    </div>
                    <div className="text-xs text-gray-500">
                      {aiProgress.completedHuddles} of {aiProgress.totalHuddles} huddles completed
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${aiProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-6">
                  <h4 className="font-medium mb-4">AI will generate:</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Comprehensive content for each huddle</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mic className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Voice-over scripts for audio content</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Optimized duration estimates</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={generateAIContent}
                    className="w-full"
                    disabled={!watchedData.title || huddleFields.length === 0}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Content
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Review & Publish
              </h3>
              <p className="text-gray-600">
                Review your sequence and publish when ready
              </p>
            </div>

            <Card>
              <div className="p-6">
                <h4 className="font-medium mb-4">Sequence Summary</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title:</span>
                    <div className="text-sm text-gray-900">{watchedData.title}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Huddles:</span>
                    <div className="text-sm text-gray-900">{huddleFields.length} episodes</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Duration:</span>
                    <div className="text-sm text-gray-900">{watchedData.estimatedDuration} minutes</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Target Audience:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {watchedData.targetRoles.map(role => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                      {watchedData.targetDisciplines.map(discipline => (
                        <Badge key={discipline} variant="outline" className="text-xs">
                          {discipline}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/sequences')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sequences
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Sequence' : 'Create New Sequence'}
        </h1>
        <p className="text-gray-600">
          Build AI-powered micro-education sequences for your team
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
                    step.id <= currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="p-6">
            {renderStepContent()}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div>
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : (isEdit ? 'Update Sequence' : 'Create Sequence')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};