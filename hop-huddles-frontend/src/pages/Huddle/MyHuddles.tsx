// pages/Huddle/MyHuddles.tsx - Field clinician interface for assigned huddles
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  Lock,
  Star,
  Target,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Award,
  AlertCircle,
  ChevronRight,
  Pause,
  RotateCcw,
  FileText,
  Download,
  BarChart3,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import toast from 'react-hot-toast';

interface MyHuddleSequence {
  sequenceId: number;
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  totalHuddles: number;
  completedHuddles: number;
  estimatedDuration: number; // minutes
  dueDate?: string;
  assignedDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number; // percentage
  lastAccessed?: string;
  nextHuddleId?: number;
  nextHuddleTitle?: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  certificateEligible: boolean;
  huddles: MyHuddle[];
}

interface MyHuddle {
  huddleId: number;
  title: string;
  description: string;
  orderIndex: number;
  duration: number; // minutes
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // percentage
  score?: number;
  completedAt?: string;
  lastAccessed?: string;
  hasAssessment: boolean;
  assessmentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'OVERDUE';
  assessmentScore?: number;
  assessmentAttempts?: number;
  maxAttempts?: number;
  prerequisites: number[]; // huddle IDs that must be completed first
  isOptional: boolean;
}

interface LearningGoal {
  goalId: number;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  relatedSequences: number[];
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
}

const MyHuddles: React.FC = () => {
//   const { user, currentAgency } = useAuth();
  const { activeRole, capabilities } = useActiveRole();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'GRID' | 'LIST'>('GRID');

  // Mock data - in production this would come from API based on user assignments
  const mySequences: MyHuddleSequence[] = [
    {
      sequenceId: 1,
      title: 'Pain Management Fundamentals',
      description: 'Essential pain assessment and management techniques for home health professionals',
      category: 'Clinical Skills',
      priority: 'HIGH',
      totalHuddles: 5,
      completedHuddles: 3,
      estimatedDuration: 45,
      dueDate: '2024-01-15',
      assignedDate: '2024-01-01',
      status: 'IN_PROGRESS',
      progress: 60,
      lastAccessed: '2024-01-08T14:30:00Z',
      nextHuddleId: 104,
      nextHuddleTitle: 'Advanced Pain Assessment',
      tags: ['Pain Management', 'Assessment', 'Clinical'],
      difficulty: 'INTERMEDIATE',
      certificateEligible: true,
      huddles: [
        {
          huddleId: 101,
          title: 'Introduction to Pain Management',
          description: 'Overview of pain types and basic assessment',
          orderIndex: 1,
          duration: 8,
          status: 'COMPLETED',
          progress: 100,
          score: 92,
          completedAt: '2024-01-02T10:15:00Z',
          hasAssessment: true,
          assessmentStatus: 'COMPLETED',
          assessmentScore: 88,
          assessmentAttempts: 1,
          maxAttempts: 3,
          prerequisites: [],
          isOptional: false
        },
        {
          huddleId: 102,
          title: 'Pain Assessment Tools',
          description: 'Using standardized pain assessment scales',
          orderIndex: 2,
          duration: 12,
          status: 'COMPLETED',
          progress: 100,
          score: 85,
          completedAt: '2024-01-05T15:20:00Z',
          hasAssessment: true,
          assessmentStatus: 'COMPLETED',
          assessmentScore: 82,
          assessmentAttempts: 2,
          maxAttempts: 3,
          prerequisites: [101],
          isOptional: false
        },
        {
          huddleId: 103,
          title: 'Non-Pharmacological Approaches',
          description: 'Alternative pain management techniques',
          orderIndex: 3,
          duration: 10,
          status: 'COMPLETED',
          progress: 100,
          score: 94,
          completedAt: '2024-01-08T11:45:00Z',
          hasAssessment: false,
          prerequisites: [102],
          isOptional: false
        },
        {
          huddleId: 104,
          title: 'Advanced Pain Assessment',
          description: 'Complex pain scenarios and assessment',
          orderIndex: 4,
          duration: 15,
          status: 'AVAILABLE',
          progress: 0,
          hasAssessment: true,
          assessmentStatus: 'PENDING',
          maxAttempts: 3,
          prerequisites: [103],
          isOptional: false
        },
        {
          huddleId: 105,
          title: 'Documentation and Communication',
          description: 'Proper documentation of pain assessments',
          orderIndex: 5,
          duration: 8,
          status: 'LOCKED',
          progress: 0,
          hasAssessment: true,
          maxAttempts: 2,
          prerequisites: [104],
          isOptional: false
        }
      ]
    },
    {
      sequenceId: 2,
      title: 'Wound Care Essentials',
      description: 'Comprehensive wound assessment and care protocols',
      category: 'Specialization',
      priority: 'MEDIUM',
      totalHuddles: 6,
      completedHuddles: 6,
      estimatedDuration: 60,
      assignedDate: '2023-12-15',
      status: 'COMPLETED',
      progress: 100,
      lastAccessed: '2024-01-07T09:30:00Z',
      tags: ['Wound Care', 'Assessment', 'Treatment'],
      difficulty: 'ADVANCED',
      certificateEligible: true,
      huddles: [
        // Simplified for brevity - would have full huddle data
        {
          huddleId: 201,
          title: 'Wound Assessment Fundamentals',
          description: 'Basic wound assessment principles',
          orderIndex: 1,
          duration: 10,
          status: 'COMPLETED',
          progress: 100,
          score: 96,
          completedAt: '2023-12-20T14:15:00Z',
          hasAssessment: true,
          assessmentStatus: 'COMPLETED',
          assessmentScore: 94,
          assessmentAttempts: 1,
          maxAttempts: 3,
          prerequisites: [],
          isOptional: false
        }
        // ... more huddles
      ]
    },
    {
      sequenceId: 3,
      title: 'HIPAA Compliance Update',
      description: 'Latest privacy and security requirements for healthcare professionals',
      category: 'Compliance',
      priority: 'HIGH',
      totalHuddles: 3,
      completedHuddles: 0,
      estimatedDuration: 25,
      dueDate: '2024-01-12',
      assignedDate: '2024-01-08',
      status: 'OVERDUE',
      progress: 0,
      tags: ['HIPAA', 'Privacy', 'Compliance', 'Required'],
      difficulty: 'BEGINNER',
      certificateEligible: false,
      huddles: [
        {
          huddleId: 301,
          title: 'Privacy Rule Updates',
          description: 'Recent changes to HIPAA privacy requirements',
          orderIndex: 1,
          duration: 8,
          status: 'AVAILABLE',
          progress: 0,
          hasAssessment: true,
          assessmentStatus: 'PENDING',
          maxAttempts: 2,
          prerequisites: [],
          isOptional: false
        },
        {
          huddleId: 302,
          title: 'Security Safeguards',
          description: 'Implementing physical and technical safeguards',
          orderIndex: 2,
          duration: 10,
          status: 'LOCKED',
          progress: 0,
          hasAssessment: true,
          maxAttempts: 2,
          prerequisites: [301],
          isOptional: false
        },
        {
          huddleId: 303,
          title: 'Breach Notification',
          description: 'Proper procedures for reporting breaches',
          orderIndex: 3,
          duration: 7,
          status: 'LOCKED',
          progress: 0,
          hasAssessment: true,
          maxAttempts: 2,
          prerequisites: [302],
          isOptional: false
        }
      ]
    }
  ];

  const learningGoals: LearningGoal[] = [
    {
      goalId: 1,
      title: 'Complete Pain Management Certification',
      description: 'Finish all modules in the Pain Management series',
      targetDate: '2024-01-15',
      progress: 60,
      relatedSequences: [1],
      status: 'ACTIVE'
    },
    {
      goalId: 2,
      title: 'Annual Compliance Training',
      description: 'Complete all required compliance modules',
      targetDate: '2024-01-31',
      progress: 25,
      relatedSequences: [3],
      status: 'OVERDUE'
    }
  ];

  // Filter sequences based on search and filters
  const filteredSequences = useMemo(() => {
    return mySequences.filter(sequence => {
      const matchesSearch = searchTerm === '' || 
        sequence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sequence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sequence.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'ALL' || sequence.category === selectedCategory;
      const matchesStatus = statusFilter === 'ALL' || sequence.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [mySequences, searchTerm, selectedCategory, statusFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mySequences.map(s => s.category)));
    return ['ALL', ...cats];
  }, [mySequences]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalSequences = mySequences.length;
    const completedSequences = mySequences.filter(s => s.status === 'COMPLETED').length;
    const inProgressSequences = mySequences.filter(s => s.status === 'IN_PROGRESS').length;
    const overdueSequences = mySequences.filter(s => s.status === 'OVERDUE').length;
    const totalHours = mySequences.reduce((sum, s) => sum + s.estimatedDuration, 0) / 60;
    const completedHours = mySequences.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.estimatedDuration, 0) / 60;

    return {
      totalSequences,
      completedSequences,
      inProgressSequences,
      overdueSequences,
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      overallProgress: totalSequences > 0 ? Math.round((completedSequences / totalSequences) * 100) : 0
    };
  }, [mySequences]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'NOT_STARTED':
        return 'text-gray-600 bg-gray-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return <Star className="h-4 w-4" />;
      case 'INTERMEDIATE':
        return (
          <div className="flex">
            <Star className="h-4 w-4" />
            <Star className="h-4 w-4" />
          </div>
        );
      case 'ADVANCED':
        return (
          <div className="flex">
            <Star className="h-4 w-4" />
            <Star className="h-4 w-4" />
            <Star className="h-4 w-4" />
          </div>
        );
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const handleStartSequence = (sequenceId: number) => {
    const sequence = mySequences.find(s => s.sequenceId === sequenceId);
    if (sequence) {
      const nextHuddle = sequence.huddles.find(h => h.status === 'AVAILABLE');
      if (nextHuddle) {
        navigate(`/huddles/${nextHuddle.huddleId}/learn`);
      } else {
        toast.error('No available huddles to start');
      }
    }
  };

  const handleContinueSequence = (sequenceId: number) => {
    const sequence = mySequences.find(s => s.sequenceId === sequenceId);
    if (sequence && sequence.nextHuddleId) {
      navigate(`/huddles/${sequence.nextHuddleId}/learn`);
    }
  };

  const renderSequenceCard = (sequence: MyHuddleSequence) => (
    <div key={sequence.sequenceId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{sequence.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{sequence.description}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(sequence.priority)}`}>
              {sequence.priority}
            </span>
            {sequence.certificateEligible && (
              <Award className="h-4 w-4 text-yellow-500">
                <title>Certificate Available</title>
              </Award>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-2 mb-3">
          {sequence.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
          {sequence.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{sequence.tags.length - 3} more</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>{sequence.completedHuddles}/{sequence.totalHuddles} huddles completed</span>
            <span>{sequence.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                sequence.status === 'COMPLETED' ? 'bg-green-500' : 
                sequence.status === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${sequence.progress}%` }}
            />
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{sequence.estimatedDuration} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Difficulty:</span>
            <div className="text-yellow-500">
              {getDifficultyIcon(sequence.difficulty)}
            </div>
          </div>
          {sequence.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span className={sequence.status === 'OVERDUE' ? 'text-red-600' : ''}>
                Due {new Date(sequence.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{sequence.category}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sequence.status)}`}>
            {sequence.status === 'NOT_STARTED' && 'Not Started'}
            {sequence.status === 'IN_PROGRESS' && 'In Progress'}
            {sequence.status === 'COMPLETED' && 'Completed'}
            {sequence.status === 'OVERDUE' && 'Overdue'}
          </span>

          <div className="flex items-center space-x-2">
            {sequence.status === 'COMPLETED' ? (
              <Link
                to={`/sequences/${sequence.sequenceId}/review`}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Link>
            ) : sequence.status === 'IN_PROGRESS' ? (
              <button
                onClick={() => handleContinueSequence(sequence.sequenceId)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Continue
              </button>
            ) : (
              <button
                onClick={() => handleStartSequence(sequence.sequenceId)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Start
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!capabilities.showClinicianFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PlayCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Learning Interface</h2>
          <p className="text-gray-600">This interface is designed for field clinicians.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-600 mt-1">
            Your assigned huddles and learning progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/my-progress"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Progress
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sequences</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalSequences}</p>
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
              <p className="text-2xl font-bold text-gray-900">{summaryStats.completedSequences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.overallProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Learning Hours</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.completedHours}h</p>
              <p className="text-xs text-gray-500">of {summaryStats.totalHours}h total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Goals */}
      {learningGoals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
          <div className="space-y-4">
            {learningGoals.map((goal) => (
              <div key={goal.goalId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    goal.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {goal.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          goal.status === 'COMPLETED' ? 'bg-green-500' :
                          goal.status === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search sequences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'ALL' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <div className="flex items-center space-x-2">
            {summaryStats.overdueSequences > 0 && (
              <span className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {summaryStats.overdueSequences} overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sequences Grid */}
      {filteredSequences.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSequences.map(renderSequenceCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <PlayCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sequences found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your filters to see more results.'
              : 'No learning sequences have been assigned to you yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyHuddles;