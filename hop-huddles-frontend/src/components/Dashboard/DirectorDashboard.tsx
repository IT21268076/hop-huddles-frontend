// components/Dashboard/DirectorDashboard.tsx - Director-specific dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  BarChart3, 
  Target, 
  TrendingUp,
  UserPlus,
  Settings,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  PlayCircle,
  Eye,
  GitBranch,
  Activity
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

interface TeamPerformance {
  teamId: number;
  teamName: string;
  memberCount: number;
  completionRate: number;
  activeHuddles: number;
  lastActivity: string;
  status: 'excellent' | 'good' | 'needs-attention';
}

const DirectorDashboard: React.FC = () => {
  const { currentAgency, user } = useAuth();
//   const { capabilities, dataContext } = useActiveRole();

  // Get director's branch info from assignments
  const directorAssignment = user?.assignments.find(a => 
    a.role === 'DIRECTOR' && a.isActive && a.agencyId === currentAgency?.agencyId
  );

  const branchName = directorAssignment?.branchName || 'Your Branch';

  // Mock data - in production this would come from API filtered by branch
  const stats: DashboardStat[] = [
    {
      title: 'Team Members',
      value: 34,
      change: '+2 this month',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Teams',
      value: 5,
      change: 'No change',
      trend: 'neutral',
      icon: GitBranch,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg. Completion Rate',
      value: '87%',
      change: '+3% this month',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Huddles',
      value: 18,
      change: '+5 this week',
      trend: 'up',
      icon: PlayCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const teamPerformance: TeamPerformance[] = [
    {
      teamId: 1,
      teamName: 'Home Health Team A',
      memberCount: 8,
      completionRate: 94,
      activeHuddles: 6,
      lastActivity: '2 hours ago',
      status: 'excellent'
    },
    {
      teamId: 2,
      teamName: 'Wound Care Specialists',
      memberCount: 6,
      completionRate: 89,
      activeHuddles: 4,
      lastActivity: '4 hours ago',
      status: 'good'
    },
    {
      teamId: 3,
      teamName: 'PT/OT Team',
      memberCount: 7,
      completionRate: 76,
      activeHuddles: 3,
      lastActivity: '1 day ago',
      status: 'needs-attention'
    },
    {
      teamId: 4,
      teamName: 'Intake Coordinators',
      memberCount: 4,
      completionRate: 91,
      activeHuddles: 2,
      lastActivity: '3 hours ago',
      status: 'excellent'
    },
    {
      teamId: 5,
      teamName: 'Clinical Supervisors',
      memberCount: 3,
      completionRate: 88,
      activeHuddles: 5,
      lastActivity: '1 hour ago',
      status: 'good'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'team_member_added',
      title: 'New Team Member',
      description: 'Sarah Johnson joined Home Health Team A',
      time: '1 hour ago',
      icon: UserPlus,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'huddle_completed',
      title: 'High Completion Rate',
      description: 'Wound Care team completed Pain Assessment module',
      time: '3 hours ago',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'low_engagement',
      title: 'Attention Needed',
      description: 'PT/OT team has low engagement this week',
      time: '5 hours ago',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 4,
      type: 'huddle_assigned',
      title: 'New Training Assigned',
      description: 'Safety Protocols assigned to all teams',
      time: '1 day ago',
      icon: PlayCircle,
      color: 'text-purple-600'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'HIPAA Compliance Training',
      dueDate: '2024-01-15',
      teamsCompleted: 3,
      totalTeams: 5,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Medication Safety Update',
      dueDate: '2024-01-20',
      teamsCompleted: 4,
      totalTeams: 5,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Emergency Procedures Review',
      dueDate: '2024-01-25',
      teamsCompleted: 1,
      totalTeams: 5,
      priority: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'needs-attention':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Director Dashboard</h1>
          <p className="text-gray-600">
            Managing {branchName} • {currentAgency?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Building className="w-4 h-4 mr-1" />
            Director
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/teams"
            className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Manage Teams</h4>
            </div>
            <p className="text-sm text-gray-600">Add, edit, or reassign team members</p>
          </Link>

          <Link
            to="/users"
            className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Add Team Member</h4>
            </div>
            <p className="text-sm text-gray-600">Onboard new staff to your branch</p>
          </Link>

          <Link
            to="/progress"
            className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">View Analytics</h4>
            </div>
            <p className="text-sm text-gray-600">Branch performance and insights</p>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            <Link to="/teams" className="text-sm text-blue-600 hover:text-blue-500">
              Manage teams
            </Link>
          </div>
          <div className="space-y-4">
            {teamPerformance.map((team) => (
              <div key={team.teamId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{team.teamName}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                    {team.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{team.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{team.completionRate}% completion</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <PlayCircle className="w-4 h-4" />
                    <span>{team.activeHuddles} active huddles</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span>{team.lastActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Training Deadlines</h3>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{deadline.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority} priority
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{deadline.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(deadline.teamsCompleted / deadline.totalTeams) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {deadline.teamsCompleted}/{deadline.totalTeams} teams completed
                    </span>
                  </div>
                  <Link 
                    to={`/teams?filter=incomplete&training=${deadline.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No upcoming deadlines</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;