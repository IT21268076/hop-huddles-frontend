// pages/Assessment/AssessmentCreate.tsx - Create new assessments
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Clock,
  Target,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Copy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import toast from 'react-hot-toast';

interface Question {
  questionId?: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'PRACTICAL' | 'SCENARIO';
  questionText: string;
  explanation?: string;
  points: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  requiredKeywords?: string[];
  mediaUrl?: string;
}

interface QuestionOption {
  optionId?: number;
  text: string;
  isCorrect: boolean;
}

interface AssessmentFormData {
  title: string;
  description: string;
  huddleId: number;
  assessmentType: 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED';
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  autoAssign: boolean;
  isActive: boolean;
  dueDate?: string;
  instructions: string;
  questions: Question[];
  targetRoles: string[];
  targetDisciplines: string[];
}

const AssessmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const { currentAgency } = useAuth();
  const { capabilities } = useActiveRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AssessmentFormData>({
    defaultValues: {
      title: '',
      description: '',
      huddleId: 0,
      assessmentType: 'QUIZ',
      timeLimit: 30,
      passingScore: 80,
      maxAttempts: 3,
      autoAssign: true,
      isActive: true,
      instructions: '',
      questions: [
        {
          type: 'MULTIPLE_CHOICE',
          questionText: '',
          explanation: '',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ],
      targetRoles: [],
      targetDisciplines: []
    }
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchedQuestions = watch('questions');
  const watchedAssessmentType = watch('assessmentType');
  const watchedHuddleId = watch('huddleId');

  // Mock data for huddles - in production, this would come from API
  const availableHuddles = [
    { huddleId: 101, title: 'Pain Assessment Techniques', sequenceTitle: 'Pain Management Basics' },
    { huddleId: 102, title: 'Advanced Wound Care', sequenceTitle: 'Wound Care Certification' },
    { huddleId: 103, title: 'Privacy Compliance Update', sequenceTitle: 'HIPAA Compliance Training' },
    { huddleId: 104, title: 'Safe Medication Practices', sequenceTitle: 'Medication Safety Protocol' },
    { huddleId: 105, title: 'Emergency Response Procedures', sequenceTitle: 'Emergency Preparedness' }
  ];

  const roleOptions = [
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  const disciplineOptions = [
    { value: 'NURSING', label: 'Nursing' },
    { value: 'PHYSICAL_THERAPY', label: 'Physical Therapy' },
    { value: 'OCCUPATIONAL_THERAPY', label: 'Occupational Therapy' },
    { value: 'SPEECH_THERAPY', label: 'Speech Therapy' },
    { value: 'SOCIAL_WORK', label: 'Social Work' },
    { value: 'HOME_HEALTH_AIDE', label: 'Home Health Aide' }
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      type: 'MULTIPLE_CHOICE',
      questionText: '',
      explanation: '',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    };
    appendQuestion(newQuestion);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = watchedQuestions[questionIndex].options || [];
    setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { text: '', isCorrect: false }
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = watchedQuestions[questionIndex].options || [];
    if (currentOptions.length > 2) {
      setValue(`questions.${questionIndex}.options`, 
        currentOptions.filter((_, index) => index !== optionIndex)
      );
    }
  };

  const duplicateQuestion = (questionIndex: number) => {
    const questionToDuplicate = watchedQuestions[questionIndex];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      questionText: `${questionToDuplicate.questionText} (Copy)`,
      options: questionToDuplicate.options ? [...questionToDuplicate.options] : undefined
    };
    appendQuestion(duplicatedQuestion);
  };

  const calculateTotalPoints = () => {
    return watchedQuestions.reduce((total, question) => total + (question.points || 0), 0);
  };

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      // Validate at least one question
      if (data.questions.length === 0) {
        toast.error('Please add at least one question');
        return;
      }

      // Validate huddle selection
      if (!data.huddleId) {
        toast.error('Please select a huddle for this assessment');
        return;
      }

      // Validate questions
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        if (!question.questionText.trim()) {
          toast.error(`Question ${i + 1} is missing question text`);
          return;
        }
        
        if (question.type === 'MULTIPLE_CHOICE' && question.options) {
          if (!question.options.some(option => option.isCorrect)) {
            toast.error(`Question ${i + 1} must have at least one correct answer`);
            return;
          }
        }
      }

      // Mock API call - in production, this would create the assessment
      console.log('Creating assessment:', data);
      
      toast.success('Assessment created successfully!');
      navigate('/assessments');
    } catch (error) {
      toast.error('Failed to create assessment');
    }
  };

  const renderQuestionEditor = (question: Question, questionIndex: number) => {
    return (
      <div key={questionIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Question {questionIndex + 1}</h4>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => duplicateQuestion(questionIndex)}
              className="text-gray-600 hover:text-gray-900"
              title="Duplicate Question"
            >
              <Copy className="h-4 w-4" />
            </button>
            {questionFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(questionIndex)}
                className="text-red-600 hover:text-red-900"
                title="Delete Question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                {...register(`questions.${questionIndex}.type`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="PRACTICAL">Practical Assessment</option>
                <option value="SCENARIO">Scenario-based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                max="10"
                {...register(`questions.${questionIndex}.points`, { 
                  required: true, 
                  min: 1, 
                  max: 10,
                  valueAsNumber: true 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                rows={3}
                {...register(`questions.${questionIndex}.questionText`, { required: true })}
                placeholder="Enter your question here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                rows={2}
                {...register(`questions.${questionIndex}.explanation`)}
                placeholder="Provide explanation for the correct answer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Answer Options */}
        {question.type === 'MULTIPLE_CHOICE' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-gray-700">Answer Options</h5>
              <button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </button>
            </div>
            
            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register(`questions.${questionIndex}.options.${optionIndex}.isCorrect`)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {question.options && question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(questionIndex, optionIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === 'TRUE_FALSE' && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-700 mb-4">Correct Answer</h5>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...register(`questions.${questionIndex}.correctAnswer`)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="false"
                  {...register(`questions.${questionIndex}.correctAnswer`)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                False
              </label>
            </div>
          </div>
        )}

        {question.type === 'SHORT_ANSWER' && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Keywords (comma-separated)
            </label>
            <input
              type="text"
              {...register(`questions.${questionIndex}.requiredKeywords`)}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Answers will be marked correct if they contain these keywords
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!capabilities.canCreateAssessments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to create assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/assessments')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
            <p className="text-gray-600">Design an assessment linked to your huddle content</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Basic Info</span>
          </div>
          <div className="h-px bg-gray-300 flex-1"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Questions</span>
          </div>
          <div className="h-px bg-gray-300 flex-1"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Review</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter assessment title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    {...register('description')}
                    placeholder="Describe what this assessment covers..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linked Huddle *
                  </label>
                  <select
                    {...register('huddleId', { 
                      required: 'Please select a huddle',
                      valueAsNumber: true 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a huddle...</option>
                    {availableHuddles.map((huddle) => (
                      <option key={huddle.huddleId} value={huddle.huddleId}>
                        {huddle.title} ({huddle.sequenceTitle})
                      </option>
                    ))}
                  </select>
                  {errors.huddleId && (
                    <p className="mt-1 text-sm text-red-600">{errors.huddleId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Type
                  </label>
                  <select
                    {...register('assessmentType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="QUIZ">Quiz</option>
                    <option value="PRACTICAL">Practical Assessment</option>
                    <option value="SCENARIO">Scenario-based</option>
                    <option value="MIXED">Mixed Types</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      {...register('timeLimit', { 
                        required: true, 
                        min: 5, 
                        max: 180,
                        valueAsNumber: true 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      {...register('passingScore', { 
                        required: true, 
                        min: 50, 
                        max: 100,
                        valueAsNumber: true 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <select
                    {...register('maxAttempts', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                    <option value={-1}>Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions for Learners
                  </label>
                  <textarea
                    rows={4}
                    {...register('instructions')}
                    placeholder="Provide instructions for taking this assessment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('autoAssign')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Auto-assign when huddle is completed
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Active (available for assignment)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Next: Add Questions
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Assessment Questions</h2>
                  <p className="text-gray-600">
                    Current total: {calculateTotalPoints()} points
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questionFields.map((field, index) => (
                  renderQuestionEditor(watchedQuestions[index], index)
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Assessment</h2>
            
            <div className="space-y-6">
              {/* Assessment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{watchedQuestions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{calculateTotalPoints()}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{watch('timeLimit')}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              </div>

              {/* Question Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Questions Preview</h3>
                <div className="space-y-4">
                  {watchedQuestions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                        </h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{question.questionText}</p>
                      {question.options && (
                        <ul className="text-sm text-gray-600 ml-4">
                          {question.options.map((option, optionIndex) => (
                            <li key={optionIndex} className={`${option.isCorrect ? 'text-green-600 font-medium' : ''}`}>
                              • {option.text} {option.isCorrect && '(Correct)'}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Creating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 inline" />
                      Create Assessment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AssessmentCreate;