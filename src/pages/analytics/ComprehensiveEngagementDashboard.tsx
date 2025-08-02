// pages/analytics/ComprehensiveEngagementDashboard.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Activity, 
  Target, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { EngagementVisualization } from '../../components/analytics/EngagementVisualization';
import { formatDate } from '../../utils/helpers';

export const ComprehensiveEngagementDashboard: React.FC = () => {
  const { currentAgency, currentUser } = useApp();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Load comprehensive data
  const {
    data: dashboardData,
    loading: dashboardLoading,
    refetch: refetchDashboard,
  } = useAsync(
    async () => {
      if (!currentAgency || !currentUser) return null;

      try {
        // Parallel data loading for better performance
        const [
          userProgress,
          assessmentAttempts,
          availableAssessments,
          branches,
        ] = await Promise.all([
          apiClient.getUserSequenceProgressOverview(currentUser.userId),
          apiClient.getUserAttempts(currentUser.userId),
          apiClient.getUserAvailableAssessments(),
          apiClient.getBranchesByAgency(currentAgency.agencyId),
        ]);

        // Load engagement stats for each sequence
        const engagementStats: Record<string, any> = {};
        for (const progress of userProgress || []) {
          if (progress.sequenceId) {
            try {
              engagementStats[progress.sequenceId] = await apiClient.getUserEngagementStats(
                currentUser.userId, 
                progress.sequenceId
              );
            } catch (error) {
              console.warn(`Failed to load engagement stats for sequence ${progress.sequenceId}`);
            }
          }
        }

        return {
          userProgress: userProgress || [],
          assessmentAttempts: assessmentAttempts?.content || [],
          availableAssessments: availableAssessments || [],
          branches: branches || [],
          engagementStats,
        };
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        return null;
      }
    },
    [currentAgency?.agencyId, currentUser?.userId, selectedTimeRange]
  );

  if (!currentAgency || !currentUser) {
    return (
      <div className="text-center py-12">
        <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
        <p className="text-gray-600">Please ensure you're logged in and have selected an agency.</p>
      </div>
    );
  }

  if (dashboardLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const {
    userProgress,
    assessmentAttempts,
    availableAssessments,
    branches,
    engagementStats,
  } = dashboardData;

  // Calculate key metrics
  const totalSequences = userProgress.length;
  const completedSequences = userProgress.filter(p => p.sequenceStatus === 'COMPLETED').length;
  const totalAssessmentAttempts = assessmentAttempts.length;
  const passedAssessments = assessmentAttempts.filter(a => a.isPassed).length;
  const averageAssessmentScore = totalAssessmentAttempts > 0
    ? assessmentAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAssessmentAttempts
    : 0;

  const totalEngagementStats = Object.values(engagementStats);
  const totalTimeSpent = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.totalTimeSpent || 0), 0);
  const totalHuddlesEngaged = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.totalHuddles || 0), 0);
  const completedHuddles = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.completedHuddles || 0), 0);

  // Prepare data for visualizations
  const engagementVisualizationData = userProgress.map(progress => {
    const stats = engagementStats[progress.sequenceId || 0];
    return {
      sequenceTitle: progress.sequenceTitle,
      totalHuddles: stats?.totalHuddles || 0,
      completedHuddles: stats?.completedHuddles || 0,
      totalTimeSpent: stats?.totalTimeSpent || 0,
      averageProgress: stats?.averageProgress || progress.completionPercentage,
      status: progress.sequenceStatus,
    };
  });

  const assessmentVisualizationData = assessmentAttempts.reduce((acc: any[], attempt) => {
    const existing = acc.find(item => item.assessmentTitle === attempt.assessmentTitle);
    if (existing) {
      existing.attempts += 1;
      existing.totalScore += attempt.score || 0;
      existing.averageScore = existing.totalScore / existing.attempts;
      existing.passedCount += attempt.isPassed ? 1 : 0;
      existing.passRate = (existing.passedCount / existing.attempts) * 100;
      existing.totalTime += attempt.timeSpentMinutes || 0;
    } else {
      acc.push({
        assessmentTitle: attempt.assessmentTitle || 'Unknown Assessment',
        attempts: 1,
        totalScore: attempt.score || 0,
        averageScore: attempt.score || 0,
        passedCount: attempt.isPassed ? 1 : 0,
        passRate: attempt.isPassed ? 100 : 0,
        totalTime: attempt.timeSpentMinutes || 0,
      });
    }
    return acc;
  }, []);

  const handleExportData = () => {
    // Create CSV export of dashboard data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Sequences', totalSequences],
      ['Completed Sequences', completedSequences],
      ['Total Assessment Attempts', totalAssessmentAttempts],
      ['Passed Assessments', passedAssessments],
      ['Average Assessment Score', `${averageAssessmentScore.toFixed(1)}%`],
      ['Total Time Spent (minutes)', totalTimeSpent],
      ['Total Huddles Engaged', totalHuddlesEngaged],
      ['Completed Huddles', completedHuddles],
      ['Completion Rate', `${totalHuddlesEngaged > 0 ? Math.round((completedHuddles / totalHuddlesEngaged) * 100) : 0}%`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement-dashboard-${formatDate(new Date())}.csv`;
    a.click();
  };

  return (
    <>
      <PageHeader
        title="Engagement Dashboard"
        description={`Comprehensive learning analytics and engagement metrics for ${currentAgency.name}`}
        action={{
          label: 'Export Data',
          onClick: handleExportData,
          icon: <Download className="h-4 w-4" />,
        }}
      />

      {/* Filter Controls */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="w-48">
          <Select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: 'all', label: 'All time' },
            ]}
          />
        </div>

        <div className="w-48">
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...branches.map(branch => ({
                value: branch.branchId.toString(),
                label: branch.name,
              })),
            ]}
          />
        </div>

        <Button variant="outline" onClick={refetchDashboard}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalSequences > 0 ? Math.round((completedSequences / totalSequences) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>{completedSequences} of {totalSequences} sequences completed</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessment Performance</p>
                  <p className="text-3xl font-bold text-green-600">
                    {averageAssessmentScore.toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>{passedAssessments} of {totalAssessmentAttempts} attempts passed</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Investment</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>Across {totalHuddlesEngaged} huddles</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totalHuddlesEngaged > 0 ? Math.round((completedHuddles / totalHuddlesEngaged) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>{completedHuddles} huddles completed</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Assessments</h3>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="space-y-3">
                {availableAssessments.slice(0, 3).map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{assessment.title}</div>
                      <div className="text-sm text-gray-500">{assessment.estimatedMinutes} min</div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
                {availableAssessments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All assessments completed!
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                {assessmentAttempts.slice(0, 3).map((attempt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{attempt.assessmentTitle}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(attempt.completedAt || attempt.startedAt)}
                      </div>
                    </div>
                    <Badge variant={attempt.isPassed ? 'success' : 'destructive'}>
                      {attempt.score}%
                    </Badge>
                  </div>
                ))}
                {assessmentAttempts.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Learning Streaks</h3>
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">7</div>
                  <div className="text-sm text-gray-500">Day streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalHuddlesEngaged}</div>
                  <div className="text-sm text-gray-500">Total huddles engaged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(totalTimeSpent / totalHuddlesEngaged) || 0}</div>
                  <div className="text-sm text-gray-500">Avg. time per huddle (min)</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="space-y-6">
          <EngagementVisualization
            engagementData={engagementVisualizationData}
            assessmentData={[]}
            loading={false}
          />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <EngagementVisualization
            engagementData={[]}
            assessmentData={assessmentVisualizationData}
            loading={false}
          />
        </TabsContent>

        {/* Full Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <EngagementVisualization
            engagementData={engagementVisualizationData}
            assessmentData={assessmentVisualizationData}
            loading={false}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};