// pages/assessments/CreateAssessmentForm.tsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, FileText, Clock, Award, Settings, Save, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CreateAssessmentRequest, CreateAssessmentQuestionRequest } from '../../types';

interface CreateAssessmentFormProps {
  huddleId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AssessmentFormData {
  huddleId: number;
  title: string;
  description?: string;
  instructions?: string;
  estimatedMinutes?: number;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  randomizeQuestions?: boolean;
  showResultsImmediately?: boolean;
  questions: EnhancedAssessmentQuestionRequest[];
}

interface EnhancedAssessmentQuestionRequest extends CreateAssessmentQuestionRequest {
  points?: number;
  dynamicOptions: string[];
}

export const CreateAssessmentForm: React.FC<CreateAssessmentFormProps> = ({
  huddleId,
  onSuccess,
  onCancel,
}) => {
  const { currentAgency } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  // ✅ Debug log for huddleId prop
  React.useEffect(() => {
    console.log('🎯 CreateAssessmentForm received huddleId:', huddleId, 'Type:', typeof huddleId);
  }, [huddleId]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<AssessmentFormData>({
    defaultValues: {
      huddleId: huddleId || undefined,
      passingScore: 70,
      maxAttempts: 3,
      estimatedMinutes: 10,
      randomizeQuestions: false,
      showResultsImmediately: true,
      questions: [
        {
          questionText: '',
          questionType: 'MULTIPLE_CHOICE',
          options: ['', '', '', ''],
          dynamicOptions: ['', ''],
          correctAnswer: '',
          explanation: '',
          orderIndex: 0,
          points: 1,
        },
      ],
    },
  });

  // ✅ Update form when huddleId prop changes
  React.useEffect(() => {
    if (huddleId) {
      setValue('huddleId', huddleId);
      console.log('📝 Set huddleId in form:', huddleId);
    }
  }, [huddleId, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // ✅ Get available huddles from EDUCATOR's sequences only
  const { data: huddles } = useAsync(
    async () => {
      if (!currentAgency) return [];
      try {
        // Get only sequences created by the current EDUCATOR
        const sequences = await apiClient.getSequencesCreatedByMe();
        const allHuddles: any[] = [];
        
        // Load full sequence details with huddles for each sequence
        for (const sequence of sequences) {
          try {
            const fullSequence = await apiClient.getBranchSequenceWithCombinations(sequence.sequenceId);
            if (fullSequence.combinations) {
              fullSequence.combinations.forEach(combination => {
                if (combination.huddles) {
                  combination.huddles.forEach(huddle => {
                    allHuddles.push({
                      ...huddle,
                      sequenceTitle: fullSequence.title,
                      combinationKey: `${combination.userRole}-${combination.discipline}`
                    });
                  });
                }
              });
            }
          } catch (error) {
            console.error(`Failed to load huddles for sequence ${sequence.sequenceId}:`, error);
          }
        }
        
        return allHuddles;
      } catch (error) {
        console.error('Failed to load educator huddles:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      console.log('📋 Form data received:', data);
      console.log('📋 HuddleId from data:', data.huddleId, 'Type:', typeof data.huddleId);
      
      // ✅ Validate huddleId is present and valid
      if (!data.huddleId || isNaN(Number(data.huddleId))) {
        console.error('❌ Invalid huddleId:', data.huddleId);
        setError('huddleId', {
          type: 'validation',
          message: 'Please select a valid huddle',
        });
        return;
      }

      // ✅ Ensure huddleId is properly converted to number
      const assessmentData: CreateAssessmentRequest = {
        ...data,
        huddleId: Number(data.huddleId), // Explicit conversion to number
        questions: data.questions
          .filter(q => q.questionText && q.questionText.trim()) // Only include questions with text
          .map((q, index) => ({
            ...q,
            orderIndex: index,
            options: q.questionType === 'MULTIPLE_CHOICE' 
              ? q.dynamicOptions?.filter(opt => opt.trim()) 
              : q.questionType === 'TRUE_FALSE' 
              ? ['True', 'False']
              : undefined,
          })),
      };

      // ✅ Validate at least one question exists
      if (assessmentData.questions.length === 0) {
        setError('questions', {
          type: 'validation',
          message: 'At least one question with text is required',
        });
        return;
      }

      console.log('📤 Submitting assessment data:', assessmentData);

      // Use enhanced endpoint for better features
      const response = await apiClient.createEnhancedAssessment(assessmentData);
      
      // If not saving as draft, publish immediately
      if (!saveAsDraft && response.assessmentId) {
        await apiClient.publishAssessment(response.assessmentId);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('❌ Assessment creation failed:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.fieldErrors) {
        // Set specific field errors
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof AssessmentFormData, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        // Set general error
        setError('title', {
          type: 'server',
          message: error.response?.data?.message || error.message || 'Failed to create assessment',
        });
      }
    }
  };

  const addQuestion = () => {
    append({
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      dynamicOptions: ['', ''],
      correctAnswer: '',
      explanation: '',
      orderIndex: fields.length,
      points: 1,
    });
  };

  const addOptionToQuestion = (questionIndex: number) => {
    const currentOptions = watch(`questions.${questionIndex}.dynamicOptions`) || [];
    setValue(`questions.${questionIndex}.dynamicOptions`, [...currentOptions, '']);
  };

  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    const currentOptions = watch(`questions.${questionIndex}.dynamicOptions`) || [];
    const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
    setValue(`questions.${questionIndex}.dynamicOptions`, newOptions);
  };

  const huddleOptions = huddles?.filter(huddle => huddle?.huddleId)
    .map(huddle => ({
      value: huddle.huddleId.toString(),
      label: `${huddle.sequenceTitle || 'Unknown Sequence'} → ${huddle.title || 'Untitled Huddle'} (${huddle.combinationKey || 'Unknown'})`,
    })) || [];

  const questionTypeOptions = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
  ];

  const steps = [
    { title: 'Basic Information', icon: FileText },
    { title: 'Configuration', icon: Settings },
    { title: 'Questions', icon: Award },
  ];

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* ✅ Enhanced huddle selection with better context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Select Target Huddle</h4>
        <Select
          label="Huddle"
          {...register('huddleId', { 
            required: 'Please select a huddle',
            setValueAs: (value) => value ? Number(value) : undefined // Explicit conversion
          })}
          error={errors.huddleId?.message}
          options={huddleOptions}
          placeholder={huddleOptions.length > 0 ? "Choose a huddle from your sequences" : "No huddles available - create sequences first"}
          disabled={!!huddleId || huddleOptions.length === 0}
        />
        <p className="text-xs text-blue-700 mt-2">
          {huddleId 
            ? 'Huddle was pre-selected from the sidebar' 
            : huddleOptions.length === 0 
            ? 'No huddles found. Create sequences with huddles first to enable assessments.'
            : 'Select which huddle this assessment should be associated with'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Assessment Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          placeholder="e.g., Fall Prevention Knowledge Check"
        />

        <Input
          label="Estimated Completion Time (minutes)"
          type="number"
          {...register('estimatedMinutes', {
            valueAsNumber: true,
            min: { value: 1, message: 'Must be at least 1 minute' },
          })}
          error={errors.estimatedMinutes?.message}
          placeholder="10"
          helper="How long should this assessment take?"
        />
      </div>

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Brief description of what this assessment covers"
        rows={3}
      />

      <Textarea
        label="Instructions"
        {...register('instructions')}
        error={errors.instructions?.message}
        placeholder="Special instructions for taking this assessment..."
        rows={4}
        helper="Instructions shown to users before they start the assessment"
      />
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Passing Score (%)"
          type="number"
          {...register('passingScore', {
            required: 'Passing score is required',
            valueAsNumber: true,
            min: { value: 0, message: 'Must be at least 0%' },
            max: { value: 100, message: 'Must be at most 100%' },
          })}
          error={errors.passingScore?.message}
          placeholder="70"
        />

        <Input
          label="Max Attempts"
          type="number"
          {...register('maxAttempts', {
            required: 'Max attempts is required',
            valueAsNumber: true,
            min: { value: 1, message: 'Must allow at least 1 attempt' },
          })}
          error={errors.maxAttempts?.message}
          placeholder="3"
        />

        <Input
          label="Time Limit (minutes)"
          type="number"
          {...register('timeLimit', { valueAsNumber: true })}
          error={errors.timeLimit?.message}
          placeholder="30 (optional)"
          helper="Leave empty for no time limit"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Assessment Options</h4>
        
        <div className="space-y-3">
          <Checkbox
            {...register('randomizeQuestions')}
            label="Randomize question order"
            helper="Questions will appear in random order for each attempt"
          />

          <Checkbox
            {...register('showResultsImmediately')}
            label="Show results immediately after submission"
            helper="Users will see their score and correct answers right away"
          />
        </div>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      {fields.map((field, index) => {
        const questionType = watch(`questions.${index}.questionType`);
        const dynamicOptions = watch(`questions.${index}.dynamicOptions`) || [];
        
        return (
          <Card key={field.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Question {index + 1}
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Textarea
                    label="Question Text"
                    {...register(`questions.${index}.questionText`, {
                      required: 'Question text is required',
                    })}
                    error={errors.questions?.[index]?.questionText?.message}
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>

                <Select
                  label="Question Type"
                  {...register(`questions.${index}.questionType`)}
                  options={questionTypeOptions}
                />

                <Input
                  label="Points"
                  type="number"
                  {...register(`questions.${index}.points`, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1 point' },
                  })}
                  error={errors.questions?.[index]?.points?.message}
                  placeholder="1"
                />
              </div>

              {/* Multiple Choice Options with Dynamic Management */}
              {questionType === 'MULTIPLE_CHOICE' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOptionToQuestion(index)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {dynamicOptions.map((_, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            {...register(`questions.${index}.dynamicOptions.${optionIndex}`)}
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          />
                        </div>
                        {dynamicOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOptionFromQuestion(index, optionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* True/False uses built-in options */}
              {questionType === 'TRUE_FALSE' && (
                <div className="text-sm text-gray-600">
                  Options are automatically set to "True" and "False"
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Correct Answer"
                  {...register(`questions.${index}.correctAnswer`, {
                    required: 'Correct answer is required',
                  })}
                  error={errors.questions?.[index]?.correctAnswer?.message}
                  placeholder={
                    questionType === 'TRUE_FALSE' 
                      ? 'True or False'
                      : questionType === 'MULTIPLE_CHOICE'
                      ? 'Enter the exact text of the correct option'
                      : 'Enter correct answer'
                  }
                  helper={
                    questionType === 'MULTIPLE_CHOICE'
                      ? 'Must match exactly with one of the options above'
                      : undefined
                  }
                />
              </div>

              <Textarea
                label="Explanation (Optional)"
                {...register(`questions.${index}.explanation`)}
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </div>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Question
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              <step.icon className="h-4 w-4" />
            </div>
            <span
              className={`text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {currentStep === 0 && renderBasicInfo()}
        {currentStep === 1 && renderConfiguration()}
        {currentStep === 2 && renderQuestions()}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          </div>

          <div className="flex space-x-3">
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <>
                <div className="flex items-center space-x-2 mr-4">
                  <Checkbox
                    checked={saveAsDraft}
                    onChange={(e) => setSaveAsDraft(e.target.checked)}
                    label="Save as draft"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  loading={isSubmitting}
                  variant={saveAsDraft ? "outline" : "default"}
                  onClick={() => setSaveAsDraft(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>

                <Button 
                  type="submit" 
                  loading={isSubmitting}
                  onClick={() => setSaveAsDraft(false)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create & Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};