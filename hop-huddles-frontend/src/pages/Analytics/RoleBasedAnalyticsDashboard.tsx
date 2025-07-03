// pages/Analytics/RoleBasedAnalyticsDashboard.tsx - Comprehensive analytics based on user role
import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target, 
  Award,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { apiClient } from '../../api/client';
import type { 
  User, 
  UserProgress, 
  HuddleSequence, 
  AssessmentResult, 
  RoleBasedAnalytics,
  AnalyticsTimeframe 
} from '../../types';

const RoleBasedAnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'comparisons'>('overview');
  const [filterBy, setFilterBy] = useState<string>('all');

  const { user, currentAgency, activeRole, currentAccessScope, currentBranch, currentTeam } = useAuth();
  const queryClient = useQuery;

  // Permission checks for different analytics levels
  const canViewAgencyAnalytics = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_AGENCY);
  const canViewBranchAnalytics = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_BRANCH);
  const canViewTeamAnalytics = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_TEAM);
  const canViewOwnAnalytics = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_OWN);

  // Fetch data based on user's access scope
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', currentAgency?.agencyId, activeRole, selectedTimeframe],
    async () => {
      if (!currentAgency || !user) return null;
      
      const context = {
        agencyId: currentAgency.agencyId,
        branchId: currentBranch?.id,
        teamId: currentTeam?.id,
        userId: user.userId
      };

      return await apiClient.getRoleBasedAnalytics(user.userId, activeRole || 'FIELD_CLINICIAN', selectedTimeframe, context);
    },
    { enabled: !!currentAgency && !!user }
  );

  // Fetch progress data
  const { data: progressData } = useQuery(
    ['progress', currentAgency?.agencyId, activeRole, selectedTimeframe],
    async () => {
      if (!currentAgency) return [];
      
      switch (currentAccessScope) {
        case 'AGENCY':
          return await apiClient.getAgencyProgress(currentAgency.agencyId, selectedTimeframe);
        case 'BRANCH':
          return currentBranch 
            ? await apiClient.getBranchProgress(currentBranch.id, selectedTimeframe)
            : [];
        case 'TEAM':
          return currentTeam 
            ? await apiClient.getTeamProgress(currentTeam.id, selectedTimeframe)
            : [];
        default:
          return await apiClient.getUserProgress(user?.userId || 0, selectedTimeframe);
      }
    },
    { enabled: !!currentAgency }
  );

  // Fetch users data for management views
  const { data: usersData } = useQuery(
    ['users', currentAgency?.agencyId, currentAccessScope],
    async () => {
      if (!currentAgency || !canViewAgencyAnalytics) return [];
      
      switch (currentAccessScope) {
        case 'AGENCY':
          return await apiClient.getUsersByAgency(currentAgency.agencyId);
        case 'BRANCH':
          return currentBranch 
            ? await apiClient.getUsersByBranch(currentBranch.id)
            : [];
        case 'TEAM':
          return currentTeam 
            ? await apiClient.getUsersByTeam(currentTeam.id)
            : [];
        default:
          return [];
      }
    },
    { enabled: !!currentAgency && (canViewAgencyAnalytics || canViewBranchAnalytics || canViewTeamAnalytics) }
  );

  // Fetch assessment results
  const { data: assessmentResults } = useQuery(
    ['assessment-results', currentAgency?.agencyId, currentAccessScope],
    async () => {
      if (!currentAgency) return [];
      
      switch (currentAccessScope) {
        case 'AGENCY':
          return await apiClient.getAssessmentResultsByAgency(currentAgency.agencyId);
        case 'BRANCH':
          return currentBranch 
            ? await apiClient.getAssessmentResultsByBranch(currentBranch.id)
            : [];
        case 'TEAM':
          return currentTeam 
            ? await apiClient.getAssessmentResultsByTeam(currentTeam.id)
            : [];
        default:
          return user ? await apiClient.getAssessmentResultsByUser(user.userId) : [];
      }
    },
    { enabled: !!currentAgency }
  );

  // Calculate key metrics based on role and scope
  const keyMetrics = useMemo(() => {
    if (!progressData || !usersData) return null;

    const totalUsers = usersData.length || 1;
    const totalProgress = progressData.length;
    const completedProgress = progressData.filter(p => p.progressStatus === 'COMPLETED').length;
    const inProgressCount = progressData.filter(p => p.progressStatus === 'IN_PROGRESS').length;
    
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
    const engagementRate = totalUsers > 0 ? (new Set(progressData.map(p => p.userId)).size / totalUsers) * 100 : 0;
    
    const averageScore = progressData
      .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
      .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);
    
    const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    
    // Assessment metrics
    const assessmentCompletions = assessmentResults?.filter(r => r.status === 'COMPLETED').length || 0;
    const assessmentPassRate = assessmentResults && assessmentResults.length > 0
      ? (assessmentResults.filter(r => r.status === 'COMPLETED' && (r.score || 0) >= 70).length / assessmentResults.length) * 100
      : 0;

    return {
      totalUsers,
      totalProgress,
      completedProgress,
      inProgressCount,
      completionRate,
      engagementRate,
      averageScore,
      totalTimeSpent,
      assessmentCompletions,
      assessmentPassRate
    };
  }, [progressData, usersData, assessmentResults]);

  // Get role-specific title and description
  const getDashboardInfo = () => {
    switch (activeRole) {
      case 'EDUCATOR':
      case 'ADMIN':
        return {
          title: `${activeRole === 'EDUCATOR' ? 'Educator' : 'Admin'} Analytics Dashboard`,
          description: 'Agency-wide performance insights and content management analytics',
          scope: 'Agency Level'
        };
      case 'DIRECTOR':
        return {
          title: 'Director Analytics Dashboard',
          description: `Branch performance insights for ${currentBranch?.name || 'your branch'}`,
          scope: 'Branch Level'
        };
      case 'CLINICAL_MANAGER':
        return {
          title: 'Clinical Manager Analytics Dashboard',
          description: `Team performance insights for ${currentTeam?.name || 'your team'}`,
          scope: 'Team Level'
        };
      case 'FIELD_CLINICIAN':
        return {
          title: 'Personal Analytics Dashboard',
          description: 'Your learning progress and performance insights',
          scope: 'Personal Level'
        };
      default:
        return {
          title: 'Analytics Dashboard',
          description: 'Performance insights',
          scope: 'User Level'
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

  // Get appropriate charts and views based on role
  const getAnalyticsViews = () => {
    const isManager = ['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER'].includes(activeRole || '');
    
    return {
      showUserManagement: isManager,
      showContentCreation: activeRole === 'EDUCATOR',
      showTeamComparisons: isManager,
      showPersonalProgress: true,
      showAssessmentManagement: activeRole === 'EDUCATOR' || activeRole === 'ADMIN'
    };
  };

  const views = getAnalyticsViews();

  if (!canViewOwnAnalytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboardInfo.title}</h1>
            <p className="text-gray-600 mt-1">{dashboardInfo.description}</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {dashboardInfo.scope}
              </span>
              <span className="text-sm text-gray-500">
                {currentAgency?.name}
                {currentBranch && ` → ${currentBranch.name}`}
                {currentTeam && ` → ${currentTeam.name}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Timeframe Selector */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as AnalyticsTimeframe)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>

            {/* Export Button */}
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Export
            </button>

            {/* Refresh Button */}
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-6 w-fit">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedView === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedView === 'detailed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Detailed
          </button>
          {views.showTeamComparisons && (
            <button
              onClick={() => setSelectedView('comparisons')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'comparisons'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Comparisons
            </button>
          )}
        </div>
      </div>

      {analyticsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          {keyMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {views.showUserManagement && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">{keyMetrics.totalUsers}</p>
                      <p className="text-sm text-gray-600">
                        {activeRole === 'EDUCATOR' || activeRole === 'ADMIN' ? 'Total Users' :
                         activeRole === 'DIRECTOR' ? 'Branch Users' :
                         activeRole === 'CLINICAL_MANAGER' ? 'Team Members' : 'Total Users'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {keyMetrics.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {keyMetrics.averageScore.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {keyMetrics.engagementRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Based on Selected View */}
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Overview Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed</span>
                      <span>{keyMetrics?.completedProgress || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${keyMetrics?.completionRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>In Progress</span>
                      <span>{keyMetrics?.inProgressCount || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ 
                          width: `${keyMetrics && keyMetrics.totalProgress > 0 
                            ? (keyMetrics.inProgressCount / keyMetrics.totalProgress) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Not Started</span>
                      <span>
                        {keyMetrics 
                          ? keyMetrics.totalProgress - keyMetrics.completedProgress - keyMetrics.inProgressCount 
                          : 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-600 h-2 rounded-full" 
                        style={{ 
                          width: `${keyMetrics && keyMetrics.totalProgress > 0 
                            ? ((keyMetrics.totalProgress - keyMetrics.completedProgress - keyMetrics.inProgressCount) / keyMetrics.totalProgress) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Completions</span>
                    <span className="text-lg font-semibold">{keyMetrics?.assessmentCompletions || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pass Rate</span>
                    <span className="text-lg font-semibold text-green-600">
                      {keyMetrics?.assessmentPassRate.toFixed(1) || 0}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full" 
                      style={{ width: `${keyMetrics?.assessmentPassRate || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Based on {assessmentResults?.length || 0} assessment attempts
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {progressData?.slice(0, 5).map((progress, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        progress.progressStatus === 'COMPLETED' ? 'bg-green-100' :
                        progress.progressStatus === 'IN_PROGRESS' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {progress.progressStatus === 'COMPLETED' ? 
                          <CheckCircle size={16} className="text-green-600" /> :
                          <Clock size={16} className="text-yellow-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{progress.huddleTitle}</p>
                        <p className="text-xs text-gray-500">
                          {views.showUserManagement ? progress.userName : 'You'} • {
                            new Date(progress.lastAccessed).toLocaleDateString()
                          }
                        </p>
                      </div>
                      {progress.assessmentScore && (
                        <span className="text-sm font-medium text-gray-900">
                          {progress.assessmentScore.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {!progressData || progressData.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Spent Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Time</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round((keyMetrics?.totalTimeSpent || 0) / 60)}h
                    </p>
                    <p className="text-sm text-gray-600">Total time spent learning</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {progressData ? Math.round((keyMetrics?.totalTimeSpent || 0) / progressData.length) : 0}
                      </p>
                      <p className="text-xs text-gray-600">Avg. per session (min)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {keyMetrics?.totalProgress || 0}
                      </p>
                      <p className="text-xs text-gray-600">Total sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'detailed' && (
            <div className="space-y-6">
              {/* Detailed Progress Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Detailed Progress Report</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {views.showUserManagement && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Access
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {progressData?.slice(0, 20).map((progress, index) => (
                        <tr key={index}>
                          {views.showUserManagement && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {progress.userName}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{progress.huddleTitle}</div>
                              <div className="text-sm text-gray-500">{progress.sequenceTitle}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              progress.progressStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              progress.progressStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {progress.progressStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {progress.completionPercentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {progress.assessmentScore ? `${progress.assessmentScore.toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {progress.timeSpentMinutes}m
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(progress.lastAccessed).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'comparisons' && views.showTeamComparisons && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team/Branch Comparison */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {activeRole === 'DIRECTOR' ? 'Team Comparison' : 'Performance Comparison'}
                </h3>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm">Comparison charts coming soon</p>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm">Trend analysis coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RoleBasedAnalyticsDashboard;