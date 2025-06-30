import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Filter,
  Download,
  Calendar,
  Search
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface ProgressStats {
  totalUsers: number;
  activeUsers: number;
  totalSequences: number;
  completedSequences: number;
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  engagementRate: number;
}

interface UserProgressSummary {
  userId: number;
  userName: string;
  email: string;
  totalSequences: number;
  completedSequences: number;
  inProgressSequences: number;
  totalTimeSpent: number;
  averageScore: number;
  lastAccessed: string;
  completionRate: number;
}

interface SequenceProgressSummary {
  sequenceId: number;
  sequenceTitle: string;
  totalUsers: number;
  completedUsers: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
}

const ProgressManagement: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sequences'>('overview');
  const { currentAgency } = useAuth();

  // Mock data for demonstration
  const mockStats: ProgressStats = {
    totalUsers: 85,
    activeUsers: 72,
    totalSequences: 12,
    completedSequences: 187,
    totalTimeSpent: 2480, // minutes
    averageScore: 87.5,
    completionRate: 78.2,
    engagementRate: 84.7,
  };

  const mockUserProgress: UserProgressSummary[] = [
    {
      userId: 1,
      userName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      totalSequences: 5,
      completedSequences: 4,
      inProgressSequences: 1,
      totalTimeSpent: 120,
      averageScore: 92.3,
      lastAccessed: '2024-01-15T14:30:00Z',
      completionRate: 80,
    },
    {
      userId: 2,
      userName: 'Michael Chen',
      email: 'michael.chen@example.com',
      totalSequences: 3,
      completedSequences: 3,
      inProgressSequences: 0,
      totalTimeSpent: 85,
      averageScore: 88.7,
      lastAccessed: '2024-01-14T09:15:00Z',
      completionRate: 100,
    },
    {
      userId: 3,
      userName: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      totalSequences: 4,
      completedSequences: 2,
      inProgressSequences: 2,
      totalTimeSpent: 95,
      averageScore: 85.1,
      lastAccessed: '2024-01-15T16:45:00Z',
      completionRate: 50,
    },
  ];

  const mockSequenceProgress: SequenceProgressSummary[] = [
    {
      sequenceId: 1,
      sequenceTitle: 'Fall Prevention Training',
      totalUsers: 45,
      completedUsers: 38,
      averageScore: 89.2,
      averageTimeSpent: 32,
      completionRate: 84.4,
    },
    {
      sequenceId: 2,
      sequenceTitle: 'Medication Management',
      totalUsers: 32,
      completedUsers: 25,
      averageScore: 91.5,
      averageTimeSpent: 28,
      completionRate: 78.1,
    },
    {
      sequenceId: 3,
      sequenceTitle: 'Documentation Standards',
      totalUsers: 28,
      completedUsers: 20,
      averageScore: 85.7,
      averageTimeSpent: 35,
      completionRate: 71.4,
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
            {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
          </dl>
        </div>
      </div>
    </div>
  );

  const filteredUsers = mockUserProgress.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSequences = mockSequenceProgress.filter(sequence =>
    sequence.sequenceTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress & Analytics</h1>
          <p className="text-gray-600">
            Track user progress and analyze learning outcomes across your organization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'users', label: 'User Progress', icon: Users },
            { key: 'sequences', label: 'Sequence Analytics', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={mockStats.totalUsers}
              icon={Users}
              color="bg-blue-500"
              subtitle={`${mockStats.activeUsers} active`}
            />
            <StatCard
              title="Completed Sequences"
              value={mockStats.completedSequences}
              icon={BookOpen}
              color="bg-green-500"
              subtitle={`${mockStats.totalSequences} total available`}
            />
            <StatCard
              title="Total Learning Time"
              value={`${Math.round(mockStats.totalTimeSpent / 60)}h`}
              icon={Clock}
              color="bg-purple-500"
              subtitle={`${mockStats.totalTimeSpent} minutes`}
            />
            <StatCard
              title="Average Score"
              value={`${mockStats.averageScore}%`}
              icon={Award}
              color="bg-orange-500"
              subtitle="Across all assessments"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Rate Chart */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rates</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Completion</span>
                  <span className="text-sm font-medium text-gray-900">{mockStats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${mockStats.completionRate}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Engagement</span>
                  <span className="text-sm font-medium text-gray-900">{mockStats.engagementRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${mockStats.engagementRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Sarah completed "Fall Prevention Training"</span>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Michael started "Documentation Standards"</span>
                  <span className="text-xs text-gray-400">4h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Emily completed assessment with 92%</span>
                  <span className="text-xs text-gray-400">6h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New sequence "Medication Management" published</span>
                  <span className="text-xs text-gray-400">1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filters
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {user.completedSequences}/{user.totalSequences}
                          </div>
                          <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.completionRate}%` }}
                            ></div>
                          </div>
                          <div className="ml-2 text-xs text-gray-500">{user.completionRate}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.averageScore}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalTimeSpent} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastAccessed).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sequences Tab */}
      {activeTab === 'sequences' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sequences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sequences Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSequences.map((sequence) => (
              <div key={sequence.sequenceId} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{sequence.sequenceTitle}</h3>
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">{sequence.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${sequence.completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-xs text-gray-500">Users</div>
                      <div className="text-sm font-medium text-gray-900">
                        {sequence.completedUsers}/{sequence.totalUsers}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg Score</div>
                      <div className="text-sm font-medium text-gray-900">{sequence.averageScore}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg Time</div>
                      <div className="text-sm font-medium text-gray-900">{sequence.averageTimeSpent}m</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressManagement;