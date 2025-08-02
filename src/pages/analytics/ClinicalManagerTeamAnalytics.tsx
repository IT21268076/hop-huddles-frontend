// pages/analytics/ClinicalManagerTeamAnalytics.tsx
import React, { useState } from 'react';
import { 
  Users, 
  User,
  TrendingUp, 
  Activity, 
  BarChart3,
  Calendar,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Building2,
  Star,
  Trophy,
  FileText,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTeamAnalytics, useAnalyticsTimeRange, useAnalyticsFilters, useAnalyticsExport } from '../../hooks/useAnalytics';
import { AnalyticsService } from '../../services/analyticsService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, getRoleDisplayName } from '../../utils/helpers';

interface ClinicalManagerTeamAnalyticsProps {
  teamId: number;
}

export const ClinicalManagerTeamAnalytics: React.FC<ClinicalManagerTeamAnalyticsProps> = ({ teamId }) => {
  const { currentAgency, currentAssignment } = useApp();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  const { timeRange, period, setPeriod, label: timeRangeLabel } = useAnalyticsTimeRange('monthly');
  const { filters, updateFilter, resetFilters } = useAnalyticsFilters({ timeRange });
  const { exportAnalytics, exporting } = useAnalyticsExport();

  // Main team analytics
  const {
    data: analytics,
    loading,
    error,
    refetch,
    isStale,
  } = useTeamAnalytics(teamId, filters, {
    refetchInterval: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportAnalytics('team', teamId, {
        format,
        includeCharts: true,
        includeUserDetails: true,
        includeCompetencyDetails: true,
        includeActivityLog: false,
        customDateRange: timeRange,
      }, filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!permissions.canViewTeamAnalytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view team analytics.</p>
      </div>
    );
  }

  if (loading && !analytics) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
        <p className="text-gray-600 mb-4">Unable to load team analytics. Please try again.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
        <p className="text-gray-600">No analytics data available for this team.</p>
      </div>
    );
  }

  const selectedMemberData = selectedMember ? analytics?.memberPerformance?.find(m => m.userId === selectedMember) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Team Analytics - ${analytics.teamName}`}
        description={`Performance metrics and analytics for ${analytics.teamName}`}
      />

      {/* Team Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{analytics.teamName}</h1>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Building2 className="h-4 w-4 mr-1" />
                {analytics.branchName}
              </p>
              <p className="text-sm text-gray-600">
                {timeRangeLabel} • {analytics.memberPerformance?.length || 0} members
              </p>
              {isStale && (
                <Badge variant="warning" size="sm" className="mt-1">
                  Data may be outdated
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success">Active</Badge>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => handleExport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Roles</label>
                <select
                  multiple
                  value={filters.userRoles || []}
                  onChange={(e) => updateFilter('userRoles', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="CLINICAL_MANAGER">Clinical Manager</option>
                  <option value="FIELD_CLINICIAN">Field Clinician</option>
                  <option value="PRECEPTOR">Preceptor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discipline</label>
                <select
                  value={filters.discipline || ''}
                  onChange={(e) => updateFilter('discipline', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All Disciplines</option>
                  <option value="NURSING">Nursing</option>
                  <option value="THERAPY">Therapy</option>
                  <option value="CLINICAL">Clinical</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Rate</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min %"
                    value={filters.minCompletionRate || ''}
                    onChange={(e) => updateFilter('minCompletionRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max %"
                    value={filters.maxCompletionRate || ''}
                    onChange={(e) => updateFilter('maxCompletionRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button size="sm" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Team Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Members:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Members:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sequences:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.sequencePerformance?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Score:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.averageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engagement Rate:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.engagementRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed Huddles:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.completedHuddles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Passed Assessments:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.passedAssessments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Assessments:</span>
                <span className="text-sm font-medium text-gray-900">{analytics.metrics.pendingAssessments}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.completionRate}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm ${AnalyticsService.getTrendColor(analytics.performance.periodOverPeriod.completionRateChange)}`}>
              {AnalyticsService.getTrendIcon(analytics.performance.periodOverPeriod.completionRateChange)}
              {Math.abs(analytics.performance.periodOverPeriod.completionRateChange)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.averageScore}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm ${AnalyticsService.getTrendColor(analytics.performance.periodOverPeriod.averageScoreChange)}`}>
              {AnalyticsService.getTrendIcon(analytics.performance.periodOverPeriod.averageScoreChange)}
              {Math.abs(analytics.performance.periodOverPeriod.averageScoreChange)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.engagementRate}%</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm ${AnalyticsService.getTrendColor(analytics.performance.periodOverPeriod.engagementRateChange)}`}>
              {AnalyticsService.getTrendIcon(analytics.performance.periodOverPeriod.engagementRateChange)}
              {Math.abs(analytics.performance.periodOverPeriod.engagementRateChange)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </Card>
      </div>

      {/* Team Members Performance & Competency Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Members Performance</h3>
            <Button variant="outline" size="sm" onClick={() => window.location.href = `/teams/${teamId}/members`}>
              <User className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </div>
          <div className="space-y-3">
            {analytics?.memberPerformance?.map((member) => (
              <div 
                key={member.userId} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMember === member.userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedMember(selectedMember === member.userId ? null : member.userId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{member.userName}</h4>
                    <div className="flex space-x-1 mt-1">
                      {member.roles?.slice(0, 2).map((role: string) => (
                        <Badge key={role} variant="default" size="sm">
                          {getRoleDisplayName(role)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{member.completionRate}%</div>
                  <div className="text-xs text-gray-500">Score: {member.averageScore}%</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No team members found</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Tracking</h3>
          <div className="space-y-4">
            {analytics?.competencyOverview?.map((competency, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{competency.competencyName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{competency.completionRate}%</span>
                    <Badge 
                      variant={competency.completionRate >= 90 ? 'success' : competency.completionRate >= 70 ? 'warning' : 'error'}
                      size="sm"
                    >
                      {competency.completionRate >= 90 ? 'Compliant' : competency.completionRate >= 70 ? 'Needs Attention' : 'Overdue'}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      competency.completionRate >= 90 ? 'bg-green-600' : competency.completionRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${competency.completionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Compliant: {competency.compliantUsers} | Needs Attention: {competency.needsAttentionUsers} | Overdue: {competency.overdueUsers}
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No competency data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start space-x-3">
                <div className="p-1 bg-gray-100 rounded-full">
                  <Activity className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                    {activity.userId && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-blue-600 cursor-pointer" onClick={() => setSelectedMember(activity.userId)}>
                          View Member
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics?.upcomingDeadlines?.map((deadline, index) => (
              <div key={deadline.id || index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="p-1 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{deadline.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">Due: {formatDate(deadline.deadline)}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <Badge variant={deadline.isOverdue ? 'error' : 'warning'} size="sm">
                      {deadline.isOverdue ? 'Overdue' : `${deadline.daysUntilDeadline} days`}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {deadline.userName}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Selected Member Detail */}
      {selectedMemberData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedMemberData.userName} - Individual Performance</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/users/${selectedMemberData.userId}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedMemberData.totalHuddlesCompleted}</div>
              <div className="text-sm text-gray-500">Completed Huddles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedMemberData.completionRate}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedMemberData.averageScore}%</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedMemberData.currentStreak}</div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};