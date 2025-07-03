// pages/Progress/MyProgress.tsx - Personal progress tracking for field clinicians
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Star,
  Calendar,
  CheckCircle,
  PlayCircle,
  BookOpen,
  BarChart3,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Zap,
  Trophy,
  Activity,
  AlertCircle,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';

interface PersonalStats {
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  totalOverdue: number;
  completionRate: number;
  averageScore: number;
  totalHoursSpent: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  totalUsers: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

interface LearningActivity {
  activityId: number;
  type: 'HUDDLE_COMPLETED' | 'ASSESSMENT_PASSED' | 'SEQUENCE_COMPLETED' | 'STREAK_ACHIEVED' | 'BADGE_EARNED';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  score?: number;
  sequenceTitle?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ProgressData {
  sequenceId: number;
  sequenceTitle: string;
  category: string;
  totalHuddles: number;
  completedHuddles: number;
  progress: number;
  lastAccessed: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  averageScore?: number;
  timeSpent: number; // minutes
  dueDate?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTimeRemaining?: number;
}

interface Achievement {
  achievementId: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  earnedDate: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
}

interface LearningGoal {
  goalId: number;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  relatedSequences: number[];
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  isPersonal: boolean;
}

const MyProgress: React.FC = () => {
  const { user, currentAgency } = useAuth();
  const { capabilities } = useActiveRole();
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Mock data - in production this would come from API for the current user
  const personalStats: PersonalStats = {
    totalAssigned: 24,
    totalCompleted: 18,
    totalInProgress: 4,
    totalOverdue: 2,
    completionRate: 75,
    averageScore: 88,
    totalHoursSpent: 32.5,
    currentStreak: 7,
    longestStreak: 14,
    rank: 12,
    totalUsers: 156,
    improvementTrend: 'up'
  };

  const recentActivity: LearningActivity[] = [
    {
      activityId: 1,
      type: 'HUDDLE_COMPLETED',
      title: 'Completed: Pain Assessment Module',
      description: 'Scored 94% on first attempt',
      timestamp: '2024-01-08T14:30:00Z',
      points: 50,
      score: 94,
      sequenceTitle: 'Pain Management Fundamentals',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      activityId: 2,
      type: 'STREAK_ACHIEVED',
      title: '7-Day Learning Streak!',
      description: 'Completed learning activities for 7 consecutive days',
      timestamp: '2024-01-08T09:00:00Z',
      points: 100,
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      activityId: 3,
      type: 'ASSESSMENT_PASSED',
      title: 'Passed: Wound Care Assessment',
      description: 'Achieved 91% on wound care practical assessment',
      timestamp: '2024-01-07T16:45:00Z',
      points: 75,
      score: 91,
      sequenceTitle: 'Advanced Wound Care',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      activityId: 4,
      type: 'SEQUENCE_COMPLETED',
      title: 'Completed: Medication Safety Protocol',
      description: 'All 6 huddles completed with 89% average score',
      timestamp: '2024-01-06T11:20:00Z',
      points: 200,
      score: 89,
      sequenceTitle: 'Medication Safety Protocol',
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      activityId: 5,
      type: 'BADGE_EARNED',
      title: 'Earned: Quick Learner Badge',
      description: 'Completed 5 huddles in one week',
      timestamp: '2024-01-05T13:15:00Z',
      points: 150,
      icon: Star,
      color: 'text-orange-600'
    }
  ];

  const progressData: ProgressData[] = [
    {
      sequenceId: 1,
      sequenceTitle: 'Pain Management Fundamentals',
      category: 'Clinical Skills',
      totalHuddles: 5,
      completedHuddles: 3,
      progress: 60,
      lastAccessed: '2024-01-08T14:30:00Z',
      status: 'IN_PROGRESS',
      averageScore: 91,
      timeSpent: 42,
      dueDate: '2024-01-15',
      difficulty: 'INTERMEDIATE',
      estimatedTimeRemaining: 25
    },
    {
      sequenceId: 2,
      sequenceTitle: 'Advanced Wound Care',
      category: 'Specialization',
      totalHuddles: 6,
      completedHuddles: 6,
      progress: 100,
      lastAccessed: '2024-01-07T16:45:00Z',
      status: 'COMPLETED',
      averageScore: 93,
      timeSpent: 78,
      difficulty: 'ADVANCED'
    },
    {
      sequenceId: 3,
      sequenceTitle: 'HIPAA Compliance Update',
      category: 'Compliance',
      totalHuddles: 3,
      completedHuddles: 0,
      progress: 0,
      lastAccessed: '2024-01-01T00:00:00Z',
      status: 'OVERDUE',
      timeSpent: 0,
      dueDate: '2024-01-12',
      difficulty: 'BEGINNER',
      estimatedTimeRemaining: 25
    },
    {
      sequenceId: 4,
      sequenceTitle: 'Medication Safety Protocol',
      category: 'Safety',
      totalHuddles: 6,
      completedHuddles: 6,
      progress: 100,
      lastAccessed: '2024-01-06T11:20:00Z',
      status: 'COMPLETED',
      averageScore: 89,
      timeSpent: 65,
      difficulty: 'INTERMEDIATE'
    },
    {
      sequenceId: 5,
      sequenceTitle: 'Emergency Response Procedures',
      category: 'Safety',
      totalHuddles: 4,
      completedHuddles: 1,
      progress: 25,
      lastAccessed: '2024-01-04T10:00:00Z',
      status: 'IN_PROGRESS',
      averageScore: 87,
      timeSpent: 15,
      dueDate: '2024-01-20',
      difficulty: 'INTERMEDIATE',
      estimatedTimeRemaining: 35
    }
  ];

  const achievements: Achievement[] = [
    {
      achievementId: 1,
      title: 'First Steps',
      description: 'Completed your first huddle',
      icon: Star,
      color: 'text-yellow-600',
      earnedDate: '2023-12-15',
      rarity: 'COMMON',
      points: 25
    },
    {
      achievementId: 2,
      title: 'Perfect Score',
      description: 'Achieved 100% on an assessment',
      icon: Target,
      color: 'text-green-600',
      earnedDate: '2023-12-22',
      rarity: 'RARE',
      points: 100
    },
    {
      achievementId: 3,
      title: 'Quick Learner',
      description: 'Completed 5 huddles in one week',
      icon: Zap,
      color: 'text-blue-600',
      earnedDate: '2024-01-05',
      rarity: 'EPIC',
      points: 150
    },
    {
      achievementId: 4,
      title: 'Streak Master',
      description: 'Maintained a 14-day learning streak',
      icon: Trophy,
      color: 'text-purple-600',
      earnedDate: '2024-01-01',
      rarity: 'LEGENDARY',
      points: 300
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
      status: 'ACTIVE',
      isPersonal: false
    },
    {
      goalId: 2,
      title: 'Improve Assessment Scores',
      description: 'Achieve 90%+ average on all assessments',
      targetDate: '2024-01-31',
      progress: 75,
      relatedSequences: [1, 3, 5],
      status: 'ACTIVE',
      isPersonal: true
    }
  ];

  // Filter progress data by category
  const filteredProgressData = useMemo(() => {
    if (selectedCategory === 'ALL') return progressData;
    return progressData.filter(item => item.category === selectedCategory);
  }, [progressData, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(progressData.map(p => p.category)));
    return ['ALL', ...cats];
  }, [progressData]);

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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return 'text-gray-600 bg-gray-100';
      case 'RARE':
        return 'text-blue-600 bg-blue-100';
      case 'EPIC':
        return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!capabilities.canViewOwnProgress && !capabilities.showClinicianFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view progress data.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Learning Progress</h1>
            <p className="text-gray-600 mt-2">
              Track your learning journey and achievements • {currentAgency?.name}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="QUARTER">This Quarter</option>
              <option value="YEAR">This Year</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{personalStats.completionRate}%</p>
                <div className="flex items-center text-sm">
                  {personalStats.improvementTrend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={personalStats.improvementTrend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {personalStats.improvementTrend === 'up' ? '+' : '-'}3% this month
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{personalStats.averageScore}%</p>
                <p className="text-sm text-green-600">Excellent performance!</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Invested</p>
                <p className="text-2xl font-bold text-gray-900">{personalStats.totalHoursSpent}h</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{personalStats.currentStreak}</p>
                <p className="text-sm text-gray-600">days • Best: {personalStats.longestStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Goals */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Goals */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
                <Link to="/goals" className="text-sm text-blue-600 hover:text-blue-500">
                  Manage Goals
                </Link>
              </div>
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
                        {goal.isPersonal && '👤 '}
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

            {/* Progress by Sequence */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
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
              </div>

              <div className="space-y-4">
                {filteredProgressData.map((item) => (
                  <div key={item.sequenceId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.sequenceTitle}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{item.completedHuddles}/{item.totalHuddles} huddles</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty.toLowerCase()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTimeSpent(item.timeSpent)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ').toLowerCase()}
                        </span>
                        {item.status === 'IN_PROGRESS' && (
                          <Link
                            to={`/my-huddles?sequence=${item.sequenceId}`}
                            className="text-blue-600 hover:text-blue-500 text-sm flex items-center"
                          >
                            Continue
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress: {item.progress}%</span>
                        {item.averageScore && (
                          <span className="text-gray-600">Score: {item.averageScore}%</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'COMPLETED' ? 'bg-green-500' :
                            item.status === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          {item.estimatedTimeRemaining && (
                            <span>~{item.estimatedTimeRemaining}min remaining</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Achievements */}
          <div className="space-y-8">
            {/* Performance Rank */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Ranking</h3>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-blue-600">#{personalStats.rank}</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  Ranked #{personalStats.rank} of {personalStats.totalUsers}
                </p>
                <p className="text-sm text-gray-600">
                  Top {Math.round((personalStats.rank / personalStats.totalUsers) * 100)}% performer
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-500">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.activityId} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.color === 'text-green-600' ? 'bg-green-100' :
                        activity.color === 'text-yellow-600' ? 'bg-yellow-100' :
                        activity.color === 'text-purple-600' ? 'bg-purple-100' :
                        activity.color === 'text-blue-600' ? 'bg-blue-100' :
                        'bg-orange-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                          {activity.points && (
                            <span className="text-xs text-green-600 font-medium">
                              +{activity.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                <Link to="/achievements" className="text-sm text-blue-600 hover:text-blue-500">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.achievementId} className="border border-gray-200 rounded-lg p-3 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                        achievement.color === 'text-yellow-600' ? 'bg-yellow-100' :
                        achievement.color === 'text-green-600' ? 'bg-green-100' :
                        achievement.color === 'text-blue-600' ? 'bg-blue-100' :
                        'bg-purple-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${achievement.color}`} />
                      </div>
                      <p className="text-xs font-medium text-gray-900 mb-1">{achievement.title}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;