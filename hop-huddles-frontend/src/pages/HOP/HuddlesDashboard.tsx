// pages/HOP/HuddlesDashboard.tsx - Main HOP Huddles platform dashboard
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft,
  Users, 
  BookOpen, 
  PlayCircle, 
  TrendingUp, 
  Building, 
  GitBranch,
  Plus,
  Eye,
  Calendar,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const HuddlesDashboard: React.FC = () => {
  const { user, currentAgency } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: sequences, isLoading: sequencesLoading } = useQuery(
    ['sequences', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getSequencesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const { data: branches, isLoading: branchesLoading } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const canCreateSequences = hasPermission(user?.assignments || [], PERMISSIONS.HUDDLE_CREATE);
  const canViewProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_OWN);
  const canManageUsers = hasPermission(user?.assignments || [], PERMISSIONS.USER_VIEW);
  const canManageBranches = hasPermission(user?.assignments || [], PERMISSIONS.BRANCH_VIEW);

  const stats = [
    {
      name: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/users',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Huddle Sequences',
      value: sequences?.length || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      link: '/sequences',
      change: '+3',
      changeType: 'increase'
    },
    {
      name: 'Active Huddles',
      value: sequences?.reduce((acc, seq) => acc + seq.totalHuddles, 0) || 0,
      icon: PlayCircle,
      color: 'bg-purple-500',
      link: '/sequences',
      change: '+8',
      changeType: 'increase'
    },
    {
      name: 'Branches',
      value: branches?.length || 0,
      icon: GitBranch,
      color: 'bg-orange-500',
      link: '/branches',
      change: '0',
      changeType: 'neutral'
    },
  ];

  const recentSequences = sequences?.slice(0, 5) || [];
  const isLoading = sequencesLoading || usersLoading || branchesLoading;

  // Quick actions for educators
  const quickActions = [
    {
      title: 'Create New Sequence',
      description: 'Start building a new huddle sequence',
      icon: Plus,
      action: () => navigate('/sequences/create'),
      color: 'bg-blue-600 hover:bg-blue-700',
      show: canCreateSequences
    },
    {
      title: 'Manage Users',
      description: 'Add or edit team members',
      icon: Users,
      action: () => navigate('/users'),
      color: 'bg-green-600 hover:bg-green-700',
      show: canManageUsers
    },
    {
      title: 'View Analytics',
      description: 'Check progress and engagement',
      icon: TrendingUp,
      action: () => navigate('/progress'),
      color: 'bg-purple-600 hover:bg-purple-700',
      show: canViewProgress
    },
    {
      title: 'Manage Branches',
      description: 'Organize your agency structure',
      icon: Building,
      action: () => navigate('/branches'),
      color: 'bg-orange-600 hover:bg-orange-700',
      show: canManageBranches
    }
  ].filter(action => action.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/main-platform')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm">Back to Platform</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <PlayCircle size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">HOP Huddles</span>
              </div>
            </div>
            
            {canCreateSequences && (
              <Link
                to="/sequences/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Create Sequence
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HOP Huddles
          </h1>
          <p className="text-gray-600">
            Manage your micro-education platform for {currentAgency?.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.link}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${stat.color} rounded-md p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {isLoading ? '...' : stat.value}
                          </div>
                          {stat.change !== '0' && (
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.change}
                            </div>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.title}
                        onClick={action.action}
                        className={`
                          ${action.color} text-white p-4 rounded-lg text-left
                          transition-all duration-200 transform hover:scale-105
                        `}
                      >
                        <Icon className="h-6 w-6 mb-3" />
                        <h4 className="font-semibold mb-1">{action.title}</h4>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Sequences</h3>
            </div>
            <div className="p-6">
              {recentSequences.length > 0 ? (
                <div className="space-y-4">
                  {recentSequences.map((sequence) => (
                    <Link
                      key={sequence.sequenceId}
                      to={`/sequences/${sequence.sequenceId}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {sequence.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {sequence.totalHuddles} huddles
                          </p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sequence.sequenceStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                sequence.sequenceStatus === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                sequence.sequenceStatus === 'GENERATING' ? 'bg-blue-100 text-blue-800' :
                                sequence.sequenceStatus === 'REVIEW' ? 'bg-purple-100 text-purple-800' :
                                sequence.sequenceStatus === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                                sequence.sequenceStatus === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {sequence.sequenceStatus}
                            </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No sequences created yet</p>
                  {canCreateSequences && (
                    <Link
                      to="/sequences/create"
                      className="mt-2 text-blue-600 hover:text-blue-500 text-sm"
                    >
                      Create your first sequence
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Dashboard Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Releases */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Releases
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-6">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No scheduled releases</p>
                <p className="text-sm text-gray-400 mt-1">
                  Huddles will appear here when scheduled
                </p>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Team Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-6">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Performance data will appear here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete some huddles to see analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuddlesDashboard;