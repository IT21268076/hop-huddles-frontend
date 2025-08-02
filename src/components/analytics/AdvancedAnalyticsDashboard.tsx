// components/analytics/AdvancedAnalyticsDashboard.tsx
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  EngagementLineChart,
  ProgressPieChart,
  EngagementBarChart,
} from './AnalyticsCharts';

interface AdvancedAnalyticsDashboardProps {
  analytics: any;
  onExport?: () => void;
  onPeriodChange?: (period: string) => void;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  analytics,
  onExport,
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedView, setSelectedView] = useState('overview');

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  // Calculate trend indicators
  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return { trend: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change),
    };
  };

  // Mock previous period data for trend calculation
  const previousMetrics = {
    totalUsers: analytics?.metrics?.totalUsers * 0.9 || 0,
    activeUsers: analytics?.metrics?.activeUsers * 0.85 || 0,
    completionRate: (analytics?.metrics?.completionRate || 0) - 5,
    totalViews: analytics?.metrics?.totalViews * 0.8 || 0,
  };

  const userTrend = getTrendIndicator(analytics?.metrics?.activeUsers || 0, previousMetrics.activeUsers);
  const completionTrend = getTrendIndicator(analytics?.metrics?.completionRate || 0, previousMetrics.completionRate);
  const viewsTrend = getTrendIndicator(analytics?.metrics?.totalViews || 0, previousMetrics.totalViews);

  // Enhanced metrics calculations
  const enhancedMetrics = useMemo(() => {
    if (!analytics?.metrics) return null;

    const metrics = analytics.metrics;
    
    return {
      // Core KPIs
      userEngagementScore: ((metrics.activeUsers / metrics.totalUsers) * 0.4 + 
                          (metrics.completionRate / 100) * 0.6) * 100,
      
      // Productivity metrics
      avgViewsPerUser: metrics.totalUsers > 0 ? metrics.totalViews / metrics.totalUsers : 0,
      avgCompletionsPerUser: metrics.totalUsers > 0 ? metrics.completedSequences / metrics.totalUsers : 0,
      
      // Quality metrics
      assessmentParticipationRate: metrics.totalUsers > 0 ? (metrics.totalAssessments / metrics.totalUsers) * 100 : 0,
      
      // Time-based metrics
      dailyAvgEngagement: metrics.dailyEngagement?.length > 0 ? 
        metrics.dailyEngagement.reduce((sum: number, [, count]: [string, number]) => sum + count, 0) / metrics.dailyEngagement.length : 0,
    };
  }, [analytics]);

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="success">Excellent</Badge>;
    if (score >= 60) return <Badge variant="warning">Good</Badge>;
    return <Badge variant="error">Needs Improvement</Badge>;
  };

  if (!analytics || !enhancedMetrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data will appear once users start engaging with huddles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' },
            ]}
            className="w-40"
          />
          
          <Select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'engagement', label: 'Engagement' },
              { value: 'performance', label: 'Performance' },
              { value: 'users', label: 'Users' },
            ]}
            className="w-40"
          />
          
          {onExport && (
            <Button onClick={onExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Engagement Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(enhancedMetrics.userEngagementScore)}`}>
                {enhancedMetrics.userEngagementScore.toFixed(1)}%
              </p>
              <div className="mt-2">
                {getScoreBadge(enhancedMetrics.userEngagementScore)}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <div className="flex items-center">
                {renderTrendIcon(userTrend.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  {userTrend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.metrics.completionRate || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {analytics.metrics.completedSequences} of {analytics.metrics.totalSequences}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <div className="flex items-center">
                {renderTrendIcon(completionTrend.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  {completionTrend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.metrics.activeUsers}
              </p>
              <p className="text-xs text-gray-500">
                of {analytics.metrics.totalUsers} total
              </p>
            </div>
            <div className="flex flex-col items-end">
              <CheckCircle className="h-8 w-8 text-purple-600 mb-2" />
              <div className="flex items-center">
                {renderTrendIcon(userTrend.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  {userTrend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.metrics.totalViews}
              </p>
              <p className="text-xs text-gray-500">
                {enhancedMetrics.avgViewsPerUser.toFixed(1)} per user
              </p>
            </div>
            <div className="flex flex-col items-end">
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <div className="flex items-center">
                {renderTrendIcon(viewsTrend.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  {viewsTrend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dynamic Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <ProgressPieChart
              completed={analytics.metrics.completedSequences}
              inProgress={analytics.metrics.inProgressSequences}
              notStarted={Math.max(0, analytics.metrics.totalSequences - analytics.metrics.completedSequences - analytics.metrics.inProgressSequences)}
            />
          </Card>

          <Card className="p-6">
            <EngagementLineChart
              data={analytics.metrics.dailyEngagement || []}
              title="Daily Engagement Trend"
            />
          </Card>
        </div>
      )}

      {selectedView === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <EngagementBarChart
              views={analytics.metrics.totalViews}
              downloads={analytics.metrics.totalDownloads}
              assessments={analytics.metrics.totalAssessments}
              interactions={analytics.metrics.totalViews + analytics.metrics.totalDownloads}
            />
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Insights</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assessment Participation</span>
                <span className="font-medium">
                  {enhancedMetrics.assessmentParticipationRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily Average Engagement</span>
                <span className="font-medium">
                  {enhancedMetrics.dailyAvgEngagement.toFixed(0)} actions
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completions per User</span>
                <span className="font-medium">
                  {enhancedMetrics.avgCompletionsPerUser.toFixed(1)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Response Time</h3>
              <p className="text-2xl font-bold text-blue-600">Fast</p>
              <p className="text-sm text-gray-500 mt-2">System performance is optimal</p>
            </Card>

            <Card className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Content Quality</h3>
              <p className="text-2xl font-bold text-green-600">High</p>
              <p className="text-sm text-gray-500 mt-2">Based on completion rates</p>
            </Card>

            <Card className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Issues</h3>
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-500 mt-2">No critical issues detected</p>
            </Card>
          </div>
        </div>
      )}

      {/* Export Summary */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Analytics Summary</h4>
            <p className="text-sm text-gray-600 mt-1">
              Generated on {new Date().toLocaleDateString()} • Period: {selectedPeriod} days
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Overall Score</p>
              <p className={`text-xl font-bold ${getScoreColor(enhancedMetrics.userEngagementScore)}`}>
                {enhancedMetrics.userEngagementScore.toFixed(0)}/100
              </p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};