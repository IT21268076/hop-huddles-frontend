// pages/analytics/EducatorAgencyAnalytics.tsx
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
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
  Download,
  Filter,
  RefreshCw,
  Eye,
  UserPlus,
  Plus,
  Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAgencyAnalytics, useAnalyticsTimeRange, useAnalyticsFilters, useAnalyticsExport } from '../../hooks/useAnalytics';
import { AnalyticsService } from '../../services/analyticsService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';

interface EducatorAgencyAnalyticsProps {
  agencyId: number;
  agencyName: string;
}

export const EducatorAgencyAnalytics: React.FC<EducatorAgencyAnalyticsProps> = ({ agencyId, agencyName }) => {
  const { currentAssignment } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  const { timeRange, period, setPeriod, label: timeRangeLabel } = useAnalyticsTimeRange('monthly');
  const { filters, updateFilter, resetFilters } = useAnalyticsFilters({ timeRange });
  const { exportAnalytics, exporting } = useAnalyticsExport();

  // Main agency analytics
  const {
    data: analytics,
    loading,
    error,
    refetch,
    isStale,
  } = useAgencyAnalytics(agencyId, filters, {
    refetchInterval: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });

  // Performance comparison with previous period
  const previousPeriod = useMemo(() => {
    const previousTimeRange = AnalyticsService.createTimeRange(period);
    const duration = new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime();
    const previousEnd = new Date(timeRange.start);
    const previousStart = new Date(previousEnd.getTime() - duration);
    
    return {
      start: previousStart.toISOString(),
      end: previousEnd.toISOString(),
      period: timeRange.period,
    };
  }, [timeRange, period]);

  if (!permissions.canViewAgencyAnalytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view agency analytics.</p>
      </div>
    );
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportAnalytics('agency', agencyId, {
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

  const selectedBranch = analytics?.branchPerformance?.find(b => b.branchId === selectedBranchId);
  const selectedTeam = analytics?.teamPerformance?.find(t => t.teamId === selectedTeamId);

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
        <p className="text-gray-600 mb-4">Unable to load agency analytics. Please try again.</p>
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
        <p className="text-gray-600">No analytics data available for this agency.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Agency Analytics - ${agencyName}`}
        description={`Comprehensive performance metrics and insights for ${agencyName}`}
      />

      {/* Analytics Header with Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agencyName}</h1>
              <p className="text-sm text-gray-600">
                {timeRangeLabel} • {analytics.branchPerformance?.length || 0} branches • {analytics.teamPerformance?.length || 0} teams
              </p>
              {isStale && (
                <Badge variant="warning" size="sm" className="mt-1">
                  Data may be outdated
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
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
            <div className="relative">
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
                  <option value="EDUCATOR">Educator</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="CLINICAL_MANAGER">Clinical Manager</option>
                  <option value="FIELD_CLINICIAN">Field Clinician</option>
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

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{AnalyticsService.formatNumber(analytics.metrics.totalUsers)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm ${AnalyticsService.getTrendColor(analytics.performance.periodOverPeriod.userGrowthRate)}`}>
              {AnalyticsService.getTrendIcon(analytics.performance.periodOverPeriod.userGrowthRate)}
              {Math.abs(analytics.performance.periodOverPeriod.userGrowthRate)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{AnalyticsService.formatPercentage(analytics.metrics.completionRate)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{AnalyticsService.formatPercentage(analytics.metrics.averageScore)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{AnalyticsService.formatPercentage(analytics.metrics.engagementRate)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
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

      {/* Branch Performance & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Branch Performance</h3>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/branches'}>
              <Building2 className="h-4 w-4 mr-2" />
              Manage Branches
            </Button>
          </div>
          <div className="space-y-3">
            {analytics.branchPerformance?.map((branch) => (
              <div 
                key={branch.branchId} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBranchId === branch.branchId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedBranchId(selectedBranchId === branch.branchId ? null : branch.branchId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{branch.branchName}</h4>
                    <p className="text-xs text-gray-500">
                      {branch.teamCount} teams • {branch.userCount} users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{branch.completionRate}%</div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs ${AnalyticsService.getTrendColor(branch.improvementValue)}`}>
                      {branch.improvementTrend === 'up' ? '↗' : branch.improvementTrend === 'down' ? '↘' : '→'}
                      {branch.improvementValue}%
                    </span>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No branches found</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {analytics.insights?.topPerformingBranches?.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">Top Performing Branches</h4>
                <div className="space-y-2">
                  {analytics.insights.topPerformingBranches.map((branch, index) => (
                    <div key={branch.branchId} className="flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        {index + 1}. {branch.branchName}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {branch.completionRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.insights?.strugglingBranches?.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Needs Attention</h4>
                <div className="space-y-2">
                  {analytics.insights.strugglingBranches.map((branch, index) => (
                    <div key={branch.branchId} className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800">
                        {index + 1}. {branch.branchName}
                      </span>
                      <span className="text-sm font-medium text-yellow-600">
                        {branch.completionRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.insights?.recommendations?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {analytics.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      • {recommendation}
                    </li>
                  ))}
                </ul>
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
            {analytics.recentActivity?.slice(0, 10).map((activity, index) => (
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
                    {activity.branchName && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-blue-600">{activity.branchName}</span>
                      </>
                    )}
                    {activity.teamName && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-green-600">{activity.teamName}</span>
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
            {analytics.upcomingDeadlines?.slice(0, 10).map((deadline, index) => (
              <div key={deadline.id || index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="p-1 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{deadline.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">
                      Due: {formatDate(deadline.deadline)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <Badge variant={deadline.isOverdue ? 'error' : 'warning'} size="sm">
                      {deadline.isOverdue ? 'Overdue' : `${deadline.daysUntilDeadline} days`}
                    </Badge>
                  </div>
                  {deadline.branchName && (
                    <p className="text-xs text-gray-500 mt-1">
                      {deadline.branchName} • {deadline.userName}
                    </p>
                  )}
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

      {/* Selected Branch Details */}
      {selectedBranch && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedBranch.branchName} - Detailed Performance
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/branches/${selectedBranch.branchId}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Branch
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedBranchId(null)}>
                Close
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedBranch.teamCount}</div>
              <div className="text-sm text-gray-500">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedBranch.userCount}</div>
              <div className="text-sm text-gray-500">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedBranch.completionRate}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedBranch.averageScore}%</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};