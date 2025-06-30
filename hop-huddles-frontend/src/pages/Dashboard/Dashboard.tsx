import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  PlayCircle, 
  TrendingUp, 
  Building, 
  GitBranch,
  Plus,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const Dashboard: React.FC = () => {
  const { user, currentAgency } = useAuth();

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

  const stats = [
    {
      name: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-gray-500',
      link: '/users',
    },
    {
      name: 'Huddle Sequences',
      value: sequences?.length || 0,
      icon: BookOpen,
      color: 'bg-gray-500',
      link: '/sequences',
    },
    {
      name: 'Active Huddles',
      value: sequences?.reduce((acc, seq) => acc + seq.totalHuddles, 0) || 0,
      icon: PlayCircle,
      color: 'bg-gray-500',
      link: '/sequences',
    },
    {
      name: 'Branches',
      value: branches?.length || 0,
      icon: GitBranch,
      color: 'bg-gray-500',
      link: '/branches',
    },
  ];

  const recentSequences = sequences?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's what's happening with your micro-education platform.
          </p>
        </div>
        
        {canCreateSequences && (
          <Link
            to="/sequences/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Plus size={16} className="mr-2" />
            Create Sequence
          </Link>
        )}
      </div>

      {/* Agency Info */}
      {currentAgency && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building size={24} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentAgency.name}</h2>
              <p className="text-sm text-gray-600">
                {currentAgency.agencyType.replace('_', ' ')} • CCN: {currentAgency.ccn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
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
                      <dd className="text-lg font-medium text-gray-900">
                        {sequencesLoading || usersLoading || branchesLoading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                        ) : (
                          stat.value
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sequences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Sequences</h3>
              <Link
                to="/sequences"
                className="text-sm text-gray-600 hover:text-gray-500 flex items-center"
              >
                View all
                <Eye size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {sequencesLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  ))}
                </div>
              </div>
            ) : recentSequences.length > 0 ? (
              recentSequences.map((sequence) => (
                <Link
                  key={sequence.sequenceId}
                  to={`/sequences/${sequence.sequenceId}`}
                  className="block hover:bg-gray-50 px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sequence.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sequence.totalHuddles} huddles • {sequence.sequenceStatus}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sequence.sequenceStatus === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800'
                          : sequence.sequenceStatus === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sequence.sequenceStatus}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sequences yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first huddle sequence.
                </p>
                {canCreateSequences && (
                  <div className="mt-4">
                    <Link
                      to="/sequences/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Sequence
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
                {canCreateSequences && (
                  <Link
                    to="/sequences/create"
                    className="flex items-center p-3 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50 border border-gray-200"
                  >
                    <Plus className="mr-3 h-5 w-5 text-gray-500" />
                    Create New Sequence
                  </Link>
                )}
                {canManageUsers && (
                  <Link
                    to="/users"
                    className="flex items-center p-3 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50 border border-gray-200"
                  >
                    <Users className="mr-3 h-5 w-5 text-gray-500" />
                    Manage Users
                  </Link>
                )}
              <Link
                to="/sequences"
                className="flex items-center p-3 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50 border border-gray-200"
              >
                <BookOpen className="mr-3 h-5 w-5 text-gray-500" />
                View All Sequences
              </Link>
              <Link
                to="/progress"
                className="flex items-center p-3 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50 border border-gray-200"
              >
                <TrendingUp className="mr-3 h-5 w-5 text-gray-500" />
                View Progress Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;