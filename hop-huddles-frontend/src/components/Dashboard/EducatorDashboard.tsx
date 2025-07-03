// components/Dashboard/EducatorDashboard.tsx - Educator-specific dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Users, 
  BarChart3, 
  PlayCircle, 
  Calendar, 
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';

interface DashboardStat {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  primary?: boolean;
}

const EducatorDashboard: React.FC = () => {
  const { currentAgency } = useAuth();
//   const { capabilities, roleBasedData } = useActiveRole();

  // Mock data - in production this would come from API
  const stats: DashboardStat[] = [
    {
      title: 'Active Sequences',
      value: 12,
      change: '+3 this month',
      trend: 'up',
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Learners',
      value: 248,
      change: '+15 this week',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg. Completion Rate',
      value: '89%',
      change: '+5% this month',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Assessments Created',
      value: 24,
      change: '+8 this month',
      trend: 'up',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Create New Sequence',
      description: 'Start building a new micro-education sequence',
      href: '/sequences/create',
      icon: Plus,
      color: 'text-white',
      bgColor: 'bg-blue-600',
      primary: true
    },
    {
      title: 'Manage Sequences',
      description: 'Edit, schedule, and publish existing sequences',
      href: '/sequences',
      icon: Settings,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Create Assessment',
      description: 'Design assessments linked to huddles',
      href: '/assessments/create',
      icon: FileText,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'View Analytics',
      description: 'Analyze learning progress and engagement',
      href: '/progress',
      icon: BarChart3,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'sequence_created',
      title: 'Pain Management Basics',
      description: 'New sequence created with 5 huddles',
      time: '2 hours ago',
      icon: Plus,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'sequence_published',
      title: 'Medication Safety',
      description: 'Sequence published and assigned to Branch A',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'assessment_completed',
      title: 'Home Safety Assessment',
      description: '23 learners completed assessment',
      time: '6 hours ago',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'low_completion',
      title: 'Wound Care Module',
      description: 'Low completion rate (45%) - needs attention',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'text-orange-600'
    }
  ];

  const upcomingReleases = [
    {
      id: 1,
      title: 'Advanced Wound Care',
      scheduledFor: '2024-01-15',
      targetAudience: 'Field Clinicians',
      huddleCount: 6
    },
    {
      id: 2,
      title: 'HIPAA Compliance Update',
      scheduledFor: '2024-01-18',
      targetAudience: 'All Staff',
      huddleCount: 3
    },
    {
      id: 3,
      title: 'Emergency Procedures',
      scheduledFor: '2024-01-22',
      targetAudience: 'Clinical Managers',
      huddleCount: 4
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Educator Dashboard</h1>
          <p className="text-gray-600">
            Manage educational content and track learning across {currentAgency?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Sparkles className="w-4 h-4 mr-1" />
            Educator
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className={`p-4 rounded-lg border-2 border-transparent hover:border-gray-200 transition-all ${
                  action.primary ? action.bgColor : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${action.primary ? 'bg-blue-700' : action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.primary ? 'text-white' : action.color}`} />
                  </div>
                  <h4 className={`font-medium ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                    {action.title}
                  </h4>
                </div>
                <p className={`text-sm ${action.primary ? 'text-blue-100' : 'text-gray-600'}`}>
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Releases */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Releases</h3>
            <Link to="/sequences" className="text-sm text-blue-600 hover:text-blue-500">
              Manage schedule
            </Link>
          </div>
          {upcomingReleases.length > 0 ? (
            <div className="space-y-4">
              {upcomingReleases.map((release) => (
                <div key={release.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{release.title}</h4>
                    <span className="text-xs text-gray-500">{release.huddleCount} huddles</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Target: {release.targetAudience}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{release.scheduledFor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No upcoming releases scheduled</p>
              <Link
                to="/sequences/create"
                className="mt-2 text-blue-600 hover:text-blue-500 text-sm"
              >
                Create and schedule a sequence
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">High Engagement</h4>
            <p className="text-sm text-gray-600 mt-1">
              Pain Management series has 95% completion rate
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Needs Attention</h4>
            <p className="text-sm text-gray-600 mt-1">
              3 sequences have completion rates below 70%
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Top Performers</h4>
            <p className="text-sm text-gray-600 mt-1">
              Branch A leads with 92% average completion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;