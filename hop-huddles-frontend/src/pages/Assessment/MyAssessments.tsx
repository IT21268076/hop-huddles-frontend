// pages/Assessment/MyAssessments.tsx - Assessment interface for field clinicians
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  Target,
  Calendar,
  Award,
  Filter,
  Search,
  Eye,
  ChevronRight,
  BookOpen,
  Star,
  TrendingUp,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import toast from 'react-hot-toast';

interface MyAssessment {
  assessmentId: number;
  title: string;
  description: string;
  huddleId: number;
  huddleTitle: string;
  sequenceId: number;
  sequenceTitle: string;
  assessmentType: 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED';
  questionCount: number;
  timeLimit: number; // minutes
  passingScore: number;
  maxAttempts: number;
  attempts: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'OVERDUE';
  lastAttemptScore?: number;
  bestScore?: number;
  assignedDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedDuration: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isRetake: boolean;
  prerequisites: string[];
  canRetake: boolean;
  nextAttemptAvailable?: string;
}

interface AssessmentResult {
  resultId: number;
  assessmentId: number;
  attemptNumber: number;
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number; // minutes
  feedback?: string;
  incorrectAnswers: number;
  totalAnswers: number;
}

interface AssessmentStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
  totalTimeSpent: number;
  successRate: number;
  retakesUsed: number;
}

const MyAssessments: React.FC = () => {
  const { user, currentAgency } = useAuth();
  const { capabilities } = useActiveRole();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'FAILED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<MyAssessment | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Mock data - in production this would come from API for the current user
  const assessmentStats: AssessmentStats = {
    totalAssigned: 18,
    completed: 12,
    pending: 4,
    overdue: 2,
    averageScore: 87,
    totalTimeSpent: 340, // minutes
    successRate: 92,
    retakesUsed: 3
  };

  const myAssessments: MyAssessment[] = [
    {
      assessmentId: 1,
      title: 'Pain Assessment Quiz',
      description: 'Assessment covering basic pain assessment and management principles',
      huddleId: 104,
      huddleTitle: 'Advanced Pain Assessment',
      sequenceId: 1,
      sequenceTitle: 'Pain Management Fundamentals',
      assessmentType: 'QUIZ',
      questionCount: 15,
      timeLimit: 20,
      passingScore: 80,
      maxAttempts: 3,
      attempts: 0,
      status: 'PENDING',
      assignedDate: '2024-01-08T15:00:00Z',
      dueDate: '2024-01-15T23:59:59Z',
      estimatedDuration: 20,
      difficulty: 'INTERMEDIATE',
      isRetake: false,
      prerequisites: [],
      canRetake: true
    },
    {
      assessmentId: 2,
      title: 'Wound Care Practical Assessment',
      description: 'Hands-on assessment of wound cleaning and dressing techniques',
      huddleId: 205,
      huddleTitle: 'Advanced Wound Dressing',
      sequenceId: 2,
      sequenceTitle: 'Advanced Wound Care',
      assessmentType: 'PRACTICAL',
      questionCount: 8,
      timeLimit: 45,
      passingScore: 85,
      maxAttempts: 2,
      attempts: 1,
      status: 'FAILED',
      lastAttemptScore: 78,
      bestScore: 78,
      assignedDate: '2024-01-05T10:00:00Z',
      dueDate: '2024-01-18T23:59:59Z',
      estimatedDuration: 45,
      difficulty: 'ADVANCED',
      isRetake: true,
      prerequisites: ['Complete Wound Assessment module'],
      canRetake: true,
      nextAttemptAvailable: '2024-01-09T10:00:00Z'
    },
    {
      assessmentId: 3,
      title: 'HIPAA Compliance Scenarios',
      description: 'Scenario-based assessment on privacy and security compliance',
      huddleId: 301,
      huddleTitle: 'Privacy Rule Updates',
      sequenceId: 3,
      sequenceTitle: 'HIPAA Compliance Update',
      assessmentType: 'SCENARIO',
      questionCount: 12,
      timeLimit: 30,
      passingScore: 90,
      maxAttempts: 2,
      attempts: 0,
      status: 'OVERDUE',
      assignedDate: '2024-01-01T09:00:00Z',
      dueDate: '2024-01-12T23:59:59Z',
      estimatedDuration: 30,
      difficulty: 'BEGINNER',
      isRetake: false,
      prerequisites: [],
      canRetake: true
    },
    {
      assessmentId: 4,
      title: 'Medication Safety Assessment',
      description: 'Comprehensive assessment on safe medication practices',
      huddleId: 401,
      huddleTitle: 'Medication Administration',
      sequenceId: 4,
      sequenceTitle: 'Medication Safety Protocol',
      assessmentType: 'MIXED',
      questionCount: 20,
      timeLimit: 40,
      passingScore: 85,
      maxAttempts: 3,
      attempts: 1,
      status: 'COMPLETED',
      lastAttemptScore: 94,
      bestScore: 94,
      assignedDate: '2024-01-02T11:00:00Z',
      completedDate: '2024-01-06T14:30:00Z',
      estimatedDuration: 40,
      difficulty: 'INTERMEDIATE',
      isRetake: false,
      prerequisites: [],
      canRetake: false
    },
    {
      assessmentId: 5,
      title: 'Emergency Response Quiz',
      description: 'Quick assessment on emergency response procedures',
      huddleId: 501,
      huddleTitle: 'Emergency Protocols',
      sequenceId: 5,
      sequenceTitle: 'Emergency Response Procedures',
      assessmentType: 'QUIZ',
      questionCount: 10,
      timeLimit: 15,
      passingScore: 80,
      maxAttempts: 3,
      attempts: 2,
      status: 'COMPLETED',
      lastAttemptScore: 87,
      bestScore: 87,
      assignedDate: '2024-01-03T08:00:00Z',
      completedDate: '2024-01-04T16:15:00Z',
      estimatedDuration: 15,
      difficulty: 'BEGINNER',
      isRetake: false,
      prerequisites: [],
      canRetake: true
    },
    {
      assessmentId: 6,
      title: 'Documentation Standards',
      description: 'Assessment on proper documentation practices',
      huddleId: 105,
      huddleTitle: 'Documentation and Communication',
      sequenceId: 1,
      sequenceTitle: 'Pain Management Fundamentals',
      assessmentType: 'QUIZ',
      questionCount: 12,
      timeLimit: 25,
      passingScore: 80,
      maxAttempts: 3,
      attempts: 0,
      status: 'PENDING',
      assignedDate: '2024-01-07T12:00:00Z',
      dueDate: '2024-01-20T23:59:59Z',
      estimatedDuration: 25,
      difficulty: 'INTERMEDIATE',
      isRetake: false,
      prerequisites: ['Complete Pain Assessment Quiz'],
      canRetake: true
    }
  ];

  const recentResults: AssessmentResult[] = [
    {
      resultId: 1,
      assessmentId: 4,
      attemptNumber: 1,
      score: 94,
      passed: true,
      completedAt: '2024-01-06T14:30:00Z',
      timeSpent: 35,
      feedback: 'Excellent understanding of medication safety protocols!',
      incorrectAnswers: 1,
      totalAnswers: 20
    },
    {
      resultId: 2,
      assessmentId: 5,
      attemptNumber: 2,
      score: 87,
      passed: true,
      completedAt: '2024-01-04T16:15:00Z',
      timeSpent: 12,
      feedback: 'Good improvement on emergency response procedures.',
      incorrectAnswers: 1,
      totalAnswers: 10
    },
    {
      resultId: 3,
      assessmentId: 2,
      attemptNumber: 1,
      score: 78,
      passed: false,
      completedAt: '2024-01-03T11:45:00Z',
      timeSpent: 42,
      feedback: 'Review wound dressing techniques before retaking.',
      incorrectAnswers: 2,
      totalAnswers: 8
    }
  ];

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return myAssessments.filter(assessment => {
      const matchesSearch = searchTerm === '' || 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.huddleTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || assessment.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || assessment.assessmentType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [myAssessments, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-blue-600 bg-blue-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'OVERDUE':
        return 'text-orange-600 bg-orange-100';
      case 'IN_PROGRESS':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return 'text-blue-600 bg-blue-100';
      case 'PRACTICAL':
        return 'text-green-600 bg-green-100';
      case 'SCENARIO':
        return 'text-purple-600 bg-purple-100';
      case 'MIXED':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'text-green-600 bg-green-100';
      case 'INTERMEDIATE':
        return 'text-yellow-600 bg-yellow-100';
      case 'ADVANCED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartAssessment = (assessment: MyAssessment) => {
    if (assessment.status === 'OVERDUE') {
      toast.error('This assessment is overdue. Please contact your supervisor.');
      return;
    }

    if (assessment.prerequisites.length > 0) {
      toast.error('Please complete the required prerequisites first.');
      return;
    }

    if (assessment.attempts >= assessment.maxAttempts) {
      toast.error('Maximum attempts reached for this assessment.');
      return;
    }

    if (assessment.nextAttemptAvailable && new Date() < new Date(assessment.nextAttemptAvailable)) {
      toast.error('Next attempt available after ' + new Date(assessment.nextAttemptAvailable).toLocaleString());
      return;
    }

    // In production, this would navigate to the assessment taking interface
    toast.success(`Starting ${assessment.title}...`);
    // navigate(`/assessments/${assessment.assessmentId}/take`);
  };

  const handleViewResults = (assessment: MyAssessment) => {
    const results = recentResults.filter(r => r.assessmentId === assessment.assessmentId);
    if (results.length > 0) {
      // In production, navigate to results page
      toast.success('Viewing assessment results...');
      // navigate(`/assessments/${assessment.assessmentId}/results`);
    }
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const isAssessmentAvailable = (assessment: MyAssessment) => {
    if (assessment.status === 'COMPLETED' && !assessment.canRetake) return false;
    if (assessment.attempts >= assessment.maxAttempts) return false;
    if (assessment.prerequisites.length > 0) return false;
    if (assessment.nextAttemptAvailable && new Date() < new Date(assessment.nextAttemptAvailable)) return false;
    return ['PENDING', 'FAILED'].includes(assessment.status);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!capabilities.showClinicianFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Interface</h2>
          <p className="text-gray-600">This interface is designed for field clinicians.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
            <p className="text-gray-600 mt-2">
              Complete assessments to validate your learning • {currentAgency?.name}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/my-progress"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{assessmentStats.totalAssigned}</p>
                <p className="text-sm text-gray-500">{assessmentStats.pending} pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{assessmentStats.completed}</p>
                <p className="text-sm text-green-600">{assessmentStats.successRate}% success rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{assessmentStats.averageScore}%</p>
                <p className="text-sm text-purple-600">Excellent performance!</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Invested</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(assessmentStats.totalTimeSpent / 60)}h</p>
                <p className="text-sm text-gray-500">{assessmentStats.retakesUsed} retakes used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Assessments Alert */}
        {myAssessments.filter(a => a.status === 'OVERDUE' || (a.dueDate && getDaysUntilDue(a.dueDate) <= 3)).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Urgent Assessments</h3>
                <p className="text-sm text-red-700 mt-1">
                  You have {myAssessments.filter(a => a.status === 'OVERDUE').length} overdue and{' '}
                  {myAssessments.filter(a => a.dueDate && getDaysUntilDue(a.dueDate) <= 3 && a.status !== 'OVERDUE').length} assessments due soon.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Assessments List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="PRACTICAL">Practical</option>
                  <option value="SCENARIO">Scenario</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
            </div>

            {/* Assessments List */}
            {filteredAssessments.length > 0 ? (
              <div className="space-y-4">
                {filteredAssessments.map((assessment) => (
                  <div key={assessment.assessmentId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{assessment.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>From: {assessment.huddleTitle}</span>
                            <span>•</span>
                            <span>{assessment.questionCount} questions</span>
                            <span>•</span>
                            <span>{formatTimeLimit(assessment.timeLimit)} time limit</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                            {assessment.status.replace('_', ' ').toLowerCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.assessmentType)}`}>
                            {assessment.assessmentType.toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Passing Score:</span>
                            <span className="ml-1 font-medium">{assessment.passingScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Attempts:</span>
                            <span className="ml-1 font-medium">{assessment.attempts}/{assessment.maxAttempts}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Difficulty:</span>
                            <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                              {assessment.difficulty.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scores and Progress */}
                      {(assessment.lastAttemptScore || assessment.bestScore) && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {assessment.lastAttemptScore && (
                              <div>
                                <span className="text-gray-600">Last Score:</span>
                                <span className={`ml-1 font-medium ${
                                  assessment.lastAttemptScore >= assessment.passingScore ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {assessment.lastAttemptScore}%
                                </span>
                              </div>
                            )}
                            {assessment.bestScore && (
                              <div>
                                <span className="text-gray-600">Best Score:</span>
                                <span className="ml-1 font-medium text-green-600">{assessment.bestScore}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Due Date Warning */}
                      {assessment.dueDate && assessment.status !== 'COMPLETED' && (
                        <div className="mb-4">
                          {assessment.status === 'OVERDUE' ? (
                            <div className="flex items-center text-red-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span>Overdue since {new Date(assessment.dueDate).toLocaleDateString()}</span>
                            </div>
                          ) : getDaysUntilDue(assessment.dueDate) <= 3 ? (
                            <div className="flex items-center text-orange-600 text-sm">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Due in {getDaysUntilDue(assessment.dueDate)} days ({new Date(assessment.dueDate).toLocaleDateString()})</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500 text-sm">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Due {new Date(assessment.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prerequisites Warning */}
                      {assessment.prerequisites.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm text-yellow-800 font-medium">Prerequisites Required</p>
                              <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                {assessment.prerequisites.map((prereq, index) => (
                                  <li key={index}>{prereq}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {assessment.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleViewResults(assessment)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Results
                            </button>
                          )}
                          
                          {assessment.status === 'FAILED' && assessment.canRetake && (
                            <span className="text-sm text-gray-500">
                              {assessment.nextAttemptAvailable && new Date() < new Date(assessment.nextAttemptAvailable) ? (
                                `Next attempt available ${new Date(assessment.nextAttemptAvailable).toLocaleString()}`
                              ) : (
                                'Ready for retake'
                              )}
                            </span>
                          )}
                        </div>

                        <div>
                          {isAssessmentAvailable(assessment) ? (
                            <button
                              onClick={() => handleStartAssessment(assessment)}
                              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                                assessment.isRetake 
                                  ? 'bg-orange-600 hover:bg-orange-700' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {assessment.isRetake ? (
                                <>
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Retake Assessment
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start Assessment
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {assessment.status === 'COMPLETED' && !assessment.canRetake ? 'Completed' :
                               assessment.attempts >= assessment.maxAttempts ? 'Max attempts reached' :
                               'Not available'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No assessments have been assigned to you yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Recent Results */}
          <div className="space-y-6">
            {/* Recent Results */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
              <div className="space-y-4">
                {recentResults.map((result) => {
                  const assessment = myAssessments.find(a => a.assessmentId === result.assessmentId);
                  return (
                    <div key={result.resultId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{assessment?.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Attempt {result.attemptNumber} • {result.timeSpent}min</p>
                        <p>{new Date(result.completedAt).toLocaleDateString()}</p>
                        {result.feedback && (
                          <p className="text-gray-600 italic">"{result.feedback}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips for Success */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Assessment Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  Review the related huddle before taking the assessment
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  Manage your time - read all questions first
                </li>
                <li className="flex items-start">
                  <Target className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  Aim for understanding, not just memorization
                </li>
                <li className="flex items-start">
                  <Star className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  Use retakes as learning opportunities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAssessments;