// components/Dashboard/ClinicianDashboard.tsx - Field Clinician-specific dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  Target, 
  Award, 
  Clock, 
  CheckCircle,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp,
  Star,
  AlertCircle,
  User,
  ChevronRight,
  BarChart3,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  totalHuddles: number;
  completedHuddles: number;
  estimatedTime: number;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Assessment {
  id: number;
  title: string;
  huddleTitle: string;
  dueDate: string;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'completed' | 'overdue';
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  earnedDate: string;
  icon: React.ComponentType<any>;
  color: string;
}

const ClinicianDashboard: React.FC = () => {
  const { user, currentAgency } = useAuth();
  const { capabilities } = useActiveRole();

  // Get clinician's team info
  const clinicianAssignment = user?.assignments.find(a => 
    a.role === 'FIELD_CLINICIAN' && a.isActive && a.agencyId === currentAgency?.agencyId
  );

  const teamName = clinicianAssignment?.teamName || 'Your Team';

  // Mock data - in production this would come from API for the specific user
  const learningStats = {
    totalAssigned: 24,
    completed: 18,
    inProgress: 4,
    overdue: 2,
    completionRate: 75,
    timeSpent: 12.5, // hours
    averageScore: 88
  };

  const learningPaths: LearningPath[] = [
    {
      id: 1,
      title: 'Pain Management Fundamentals',
      description: 'Essential pain assessment and management techniques',
      totalHuddles: 5,
      completedHuddles: 3,
      estimatedTime: 45,
      dueDate: '2024-01-15',
      priority: 'high',
      category: 'Clinical Skills'
    },
    {
      id: 2,
      title: 'Wound Care Certification',
      description: 'Advanced wound assessment and treatment protocols',
      totalHuddles: 8,
      completedHuddles: 5,
      estimatedTime: 60,
      dueDate: '2024-01-20',
      priority: 'medium',
      category: 'Specialization'
    },
    {
      id: 3,
      title: 'HIPAA Compliance Update',
      description: 'Latest privacy and security requirements',
      totalHuddles: 3,
      completedHuddles: 0,
      estimatedTime: 20,
      dueDate: '2024-01-12',
      priority: 'high',
      category: 'Compliance'
    },
    {
      id: 4,
      title: 'Medication Safety',
      description: 'Safe medication administration practices',
      totalHuddles: 6,
      completedHuddles: 6,
      estimatedTime: 50,
      priority: 'low',
      category: 'Safety'
    }
  ];

  const pendingAssessments: Assessment[] = [
    {
      id: 1,
      title: 'Pain Assessment Quiz',
      huddleTitle: 'Pain Management Module 3',
      dueDate: '2024-01-15',
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Wound Care Practical',
      huddleTitle: 'Advanced Wound Care',
      dueDate: '2024-01-18',
      attempts: 1,
      maxAttempts: 3,
      status: 'pending'
    },
    {
      id: 3,
      title: 'HIPAA Scenarios',
      huddleTitle: 'Privacy Compliance',
      dueDate: '2024-01-10',
      attempts: 0,
      maxAttempts: 2,
      status: 'overdue'
    }
  ];

  const recentAchievements: Achievement[] = [
    {
      id: 1,
      title: 'Quick Learner',
      description: 'Completed 5 huddles in one week',
      earnedDate: '2024-01-08',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 2,
      title: 'Perfect Score',
      description: 'Scored 100% on Medication Safety assessment',
      earnedDate: '2024-01-05',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      id: 3,
      title: 'Consistency Champion',
      description: 'Completed daily learning for 7 days straight',
      earnedDate: '2024-01-02',
      icon: Target,
      color: 'text-green-600'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600">
            {teamName} • {currentAgency?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
            <Stethoscope className="w-4 h-4 mr-1" />
            Field Clinician
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.completionRate}%</p>
              <p className="text-sm text-green-600 mt-1">+5% this week</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Invested</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.timeSpent}h</p>
              <p className="text-sm text-blue-600 mt-1">This month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.averageScore}%</p>
              <p className="text-sm text-purple-600 mt-1">Excellent!</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.inProgress + pendingAssessments.length}</p>
              <p className="text-sm text-orange-600 mt-1">{learningStats.overdue} overdue</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/my-huddles"
            className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Continue Learning</h4>
            </div>
            <p className="text-sm text-gray-600">Resume where you left off</p>
          </Link>

          <Link
            to="/my-assessments"
            className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Take Assessments</h4>
            </div>
            <p className="text-sm text-gray-600">{pendingAssessments.length} pending</p>
          </Link>

          <Link
            to="/my-progress"
            className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">View Progress</h4>
            </div>
            <p className="text-sm text-gray-600">Track your learning journey</p>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Learning Paths */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Learning Paths</h3>
            <Link to="/my-huddles" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {learningPaths.map((path) => {
              const progress = calculateProgress(path.completedHuddles, path.totalHuddles);
              return (
                <div key={path.id} className={`border rounded-lg p-4 ${getPriorityColor(path.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{path.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{path.description}</p>
                    </div>
                    {path.dueDate && (
                      <div className="text-xs text-gray-500 flex items-center ml-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due {path.dueDate}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {path.completedHuddles}/{path.totalHuddles}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{path.estimatedTime}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Assessments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Assessments</h3>
            <Link to="/my-assessments" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          {pendingAssessments.length > 0 ? (
            <div className="space-y-4">
              {pendingAssessments.map((assessment) => (
                <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{assessment.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">From: {assessment.huddleTitle}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {assessment.dueDate}</span>
                    </div>
                    <span>
                      {assessment.attempts}/{assessment.maxAttempts} attempts used
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <p className="text-gray-500">All caught up!</p>
              <p className="text-sm text-gray-400">No pending assessments</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className={`w-6 h-6 ${achievement.color}`} />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <p className="text-xs text-gray-500">Earned {achievement.earnedDate}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Keep learning to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicianDashboard;