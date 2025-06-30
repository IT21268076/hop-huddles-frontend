// pages/Progress/ProgressManagement.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Award, 
  Target,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import type { 
  UserProgress, 
  UserAnalytics, 
  HuddleSequence, 
  User as UserType,
  ProgressStatus 
} from '../../types';

interface ProgressFilters {
  userId?: number;
  sequenceId?: number;
  branchId?: number;
  teamId?: number;
  discipline?: string;
  role?: string;
  status?: ProgressStatus;
  dateRange?: {
    start: string;
    end: string;
  };
}

const ProgressManagement: React.FC = () => {
  const { currentAgency, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'huddles' | 'analytics'>('overview');
  const [filters, setFilters] = useState<ProgressFilters>({});
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<HuddleSequence | null>(null);

  // Check permissions
  const canViewAgencyProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_AGENCY);
  const canViewBranchProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_BRANCH);
  const canViewTeamProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_TEAM);

  // Fetch progress data
  const { data: allProgress, isLoading: progressLoading } = useQuery(
    ['progress', currentAgency?.agencyId, filters],
    () => currentAgency ? apiClient.getProgressByAgency(currentAgency.agencyId, filters) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch users for filtering
  const { data: allUsers } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch sequences for filtering
  const { data: allSequences } = useQuery(
    ['sequences', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getSequencesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch user analytics
  const { data: userAnalytics } = useQuery(
    ['user-analytics', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUserAnalytics(currentAgency.agencyId) : Promise.resolve({}),
    { enabled: !!currentAgency && canViewAgencyProgress }
  );

  // Fetch huddle analytics
  const { data: huddleAnalytics } = useQuery(
    ['huddle-analytics', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getHuddleAnalytics(currentAgency.agencyId) : Promise.resolve({}),
    { enabled: !!currentAgency && canViewAgencyProgress }
  );

  // Calculate derived metrics
  const progressMetrics = useMemo(() => {
    if (!allProgress) return null;

    const totalProgress = allProgress.length;
    const completedProgress = allProgress.filter(p => p.progressStatus === 'COMPLETED').length;
    const inProgressCount = allProgress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
    const notStartedCount = allProgress.filter(p => p.progressStatus === 'NOT_STARTED').length;
    
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    const averageScore = allProgress
      .filter(p => p.assessmentScore !== null)
      .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);

    const uniqueUsers = new Set(allProgress.map(p => p.userId)).size;
    const activeUsers = new Set(
      allProgress
        .filter(p => p.progressStatus === 'IN_PROGRESS' || p.progressStatus === 'COMPLETED')
        .map(p => p.userId)
    ).size;

    return {
      totalProgress,
      completedProgress,
      inProgressCount,
      notStartedCount,
      totalTimeSpent,
      averageScore,
      uniqueUsers,
      activeUsers,
      completionRate: totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0,
      engagementRate: uniqueUsers > 0 ? (activeUsers / uniqueUsers) * 100 : 0
    };
  }, [allProgress]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Progress Records</p>
              <p className="text-3xl font-bold">{progressMetrics?.totalProgress || 0}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold">{progressMetrics?.completionRate.toFixed(1) || 0}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">{progressMetrics?.activeUsers || 0}</p>
            </div>
            <Users className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg. Score</p>
              <p className="text-3xl font-bold">{progressMetrics?.averageScore.toFixed(1) || 0}%</p>
            </div>
            <Award className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Status Distribution</h3>
          <ProgressStatusChart data={progressMetrics} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
          <EngagementChart data={allProgress} />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersCard users={allUsers} progress={allProgress} />
        <TopSequencesCard sequences={allSequences} progress={allProgress} />
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Progress Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Progress Overview</h3>
        </div>
        
        <UserProgressTable 
          users={allUsers || []}
          progress={allProgress || []}
          onSelectUser={setSelectedUser}
          canViewDetails={canViewAgencyProgress || canViewBranchProgress}
        />
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserProgressDetailModal
          user={selectedUser}
          progress={allProgress?.filter(p => p.userId === selectedUser.userId) || []}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );

  const renderHuddlesTab = () => (
    <div className="space-y-6">
      {/* Huddle Performance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Huddle Performance Analysis</h3>
        </div>
        
        <HuddleProgressTable
          sequences={allSequences || []}
          progress={allProgress || []}
          onSelectSequence={setSelectedSequence}
          canViewDetails={canViewAgencyProgress || canViewBranchProgress}
        />
      </div>

      {/* Huddle Detail Modal */}
      {selectedSequence && (
        <HuddleProgressDetailModal
          sequence={selectedSequence}
          progress={allProgress?.filter(p => p.sequenceId === selectedSequence.sequenceId) || []}
          onClose={() => setSelectedSequence(null)}
        />
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Advanced Analytics Dashboard */}
      <AdvancedAnalyticsDashboard
        userAnalytics={userAnalytics}
        huddleAnalytics={huddleAnalytics}
        progress={allProgress || []}
        users={allUsers || []}
        sequences={allSequences || []}
      />
    </div>
  );

  if (progressLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Management</h1>
          <p className="text-gray-600">
            Track user progress, engagement metrics, and performance analytics across all huddles.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ProgressFilters onFiltersChange={setFilters} />
          <button
            onClick={() => {/* Export functionality */}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'huddles', label: 'Huddles', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'huddles' && renderHuddlesTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
};

// Supporting Components
const ProgressStatusChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div>No data available</div>;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Completed</span>
        <span className="text-sm font-medium text-gray-900">{data.completedProgress}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full" 
          style={{ width: `${(data.completedProgress / data.totalProgress) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">In Progress</span>
        <span className="text-sm font-medium text-gray-900">{data.inProgressCount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${(data.inProgressCount / data.totalProgress) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Not Started</span>
        <span className="text-sm font-medium text-gray-900">{data.notStartedCount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gray-400 h-2 rounded-full" 
          style={{ width: `${(data.notStartedCount / data.totalProgress) * 100}%` }}
        />
      </div>
    </div>
  );
};

const EngagementChart: React.FC<{ data: UserProgress[] | undefined }> = ({ data }) => {
  // Implementation for engagement chart
  return <div className="h-64 flex items-center justify-center text-gray-500">Engagement Chart Placeholder</div>;
};

const TopPerformersCard: React.FC<{ users: UserType[] | undefined; progress: UserProgress[] | undefined }> = ({ users, progress }) => {
  const topPerformers = useMemo(() => {
    if (!users || !progress) return [];
    
    return users
      .map(user => {
        const userProgress = progress.filter(p => p.userId === user.userId);
        const completedCount = userProgress.filter(p => p.progressStatus === 'COMPLETED').length;
        const averageScore = userProgress
          .filter(p => p.assessmentScore !== null)
          .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);
        
        return {
          user,
          completedCount,
          averageScore,
          totalProgress: userProgress.length
        };
      })
      .sort((a, b) => b.completedCount - a.completedCount)
      .slice(0, 5);
  }, [users, progress]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
      <div className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div key={performer.user.userId} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{performer.user.name}</p>
                <p className="text-xs text-gray-600">{performer.completedCount} completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{performer.averageScore.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">avg score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopSequencesCard: React.FC<{ sequences: HuddleSequence[] | undefined; progress: UserProgress[] | undefined }> = ({ sequences, progress }) => {
  // Similar implementation for top sequences
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sequences</h3>
      {/* Implementation */}
    </div>
  );
};

const UserProgressTable: React.FC<any> = ({ users, progress, onSelectUser, canViewDetails }) => {
  // Implementation for user progress table
  return <div>User Progress Table Implementation</div>;
};

const HuddleProgressTable: React.FC<any> = ({ sequences, progress, onSelectSequence, canViewDetails }) => {
  // Implementation for huddle progress table
  return <div>Huddle Progress Table Implementation</div>;
};

const UserProgressDetailModal: React.FC<any> = ({ user, progress, onClose }) => {
  // Implementation for user detail modal
  return <div>User Detail Modal Implementation</div>;
};

const HuddleProgressDetailModal: React.FC<any> = ({ sequence, progress, onClose }) => {
  // Implementation for huddle detail modal
  return <div>Huddle Detail Modal Implementation</div>;
};

const AdvancedAnalyticsDashboard: React.FC<any> = ({ userAnalytics, huddleAnalytics, progress, users, sequences }) => {
  // Implementation for advanced analytics
  return <div>Advanced Analytics Dashboard Implementation</div>;
};

const ProgressFilters: React.FC<{ onFiltersChange: (filters: ProgressFilters) => void }> = ({ onFiltersChange }) => {
  // Implementation for progress filters
  return <div>Progress Filters Implementation</div>;
};

export default ProgressManagement;