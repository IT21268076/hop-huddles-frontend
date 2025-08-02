// pages/progress/ProgressPage.tsx
import React, { useState } from 'react';
import { TrendingUp, Clock, Award, BookOpen, Users, Target, Filter, CheckCircle, AlertCircle, Calendar, BarChart3, Activity, Trophy } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { SequenceProgress, ProgressStatus, Assessment, UserAssessmentAttempt } from '../../types';
import { formatDate, formatDuration } from '../../utils/helpers';
import { EngagementVisualization } from '../../components/analytics/EngagementVisualization';

export const ProgressPage: React.FC = () => {
  const { currentAgency, currentUser, currentAssignment } = useApp();
  const [viewMode, setViewMode] = useState<'my-progress' | 'team-progress'>('my-progress');
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'sequences' | 'assessments' | 'engagement'>('sequences');

  // ✅ ROLE-SPECIFIC PROGRESS: Only show progress for sequences accessible in current role
  const {
    data: userProgress,
    loading: userProgressLoading,
  } = useAsync(
    async () => {
      if (!currentUser || !currentAssignment) {
        console.log('🎯 PROGRESS: No user or assignment, returning empty progress');
        return [];
      }

      // Get current active role and discipline for precise filtering
      const activeRole = currentAssignment.activeRole || currentAssignment.role;
      const userDiscipline = currentAssignment.discipline;
      
      console.log('🎯 PROGRESS RELOAD: Loading role-specific progress for user:', currentUser.userId, 'role:', activeRole, 'discipline:', userDiscipline);
      
      // Validate that we have the required data
      if (!activeRole) {
        console.error('🚨 PROGRESS: Missing activeRole');
        return [];
      }

      if (activeRole !== 'EDUCATOR' && !userDiscipline) {
        console.error('🚨 PROGRESS: Missing userDiscipline for non-EDUCATOR role');
        return [];
      }

      try {
        // Get role-accessible sequences and user's progress in parallel
        const [accessibleSequences, allUserProgress] = await Promise.all([
          // Use the SAME logic as My Huddles for consistency
          activeRole === 'EDUCATOR' 
            ? apiClient.getSequencesCreatedByMe() // Creator-based for EDUCATORs
            : apiClient.getSequencesForSpecificRole(activeRole, userDiscipline), // Role-specific for others
          apiClient.getUserSequenceProgressOverview(currentUser.userId) // All user progress
        ]);

        console.log('🎯 PROGRESS: Accessible sequences for role', activeRole, ':', accessibleSequences.length);
        console.log('🎯 PROGRESS: Total user progress records:', allUserProgress.length);

        // Create set of accessible sequence IDs for efficient filtering
        const accessibleSequenceIds = new Set(accessibleSequences.map(seq => seq.sequenceId));
        
        // Filter progress to only include accessible sequences
        const roleSpecificProgress = allUserProgress.filter(progress => {
          const isAccessible = accessibleSequenceIds.has(progress.sequenceId);
          if (!isAccessible) {
            console.log('🎯 PROGRESS: Filtering out progress for sequence', progress.sequenceId, '(not accessible in role', activeRole, ')');
          }
          return isAccessible;
        });

        console.log('🔥 PROGRESS RESULT: User', currentUser.userId, 'as', activeRole, 'has progress for', roleSpecificProgress.length, 'accessible sequences');
        
        // Enhanced logging for each progress item
        roleSpecificProgress.forEach((progress, index) => {
          console.log(`🔥 Progress ${index + 1}: Sequence "${progress.sequenceTitle}" - ${progress.completionPercentage}% complete (${progress.sequenceStatus})`);
        });

        return roleSpecificProgress;
        
      } catch (error) {
        console.error('🚨 PROGRESS: Error loading role-specific progress:', error);
        return [];
      }
    },
    [currentUser?.userId, currentAssignment?.assignmentId, currentAssignment?.activeRole, currentAssignment?.role, currentAssignment?.discipline]
  );

  // Agency-wide progress (for managers)
  const {
    data: agencyProgress,
    loading: agencyProgressLoading,
  } = useAsync(
    async () => {
      if (!currentAgency || viewMode !== 'team-progress') return [];
      return await apiClient.getAgencyProgress(currentAgency.agencyId);
    },
    [currentAgency?.agencyId, viewMode]
  );

  // User's assessment attempts and scores
  const {
    data: assessmentAttempts,
    loading: assessmentAttemptsLoading,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      try {
        const response = await apiClient.getUserAttempts(currentUser.userId);
        return response.content || [];
      } catch (error) {
        console.error('Failed to load assessment attempts:', error);
        return [];
      }
    },
    [currentUser?.userId]
  );

  // Available assessments for the user
  const {
    data: availableAssessments,
    loading: availableAssessmentsLoading,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      try {
        return await apiClient.getUserAvailableAssessments();
      } catch (error) {
        console.error('Failed to load available assessments:', error);
        return [];
      }
    },
    [currentUser?.userId]
  );

  // ✅ ROLE-SPECIFIC ENGAGEMENT: Only show engagement for accessible sequences
  const {
    data: engagementStats,
    loading: engagementStatsLoading,
  } = useAsync(
    async () => {
      if (!currentUser || !userProgress?.length) {
        console.log('🎯 ENGAGEMENT: No user or progress data for engagement stats');
        return {};
      }
      
      const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
      console.log('🎯 ENGAGEMENT: Loading role-specific engagement stats for', userProgress.length, 'sequences as', activeRole);
      
      try {
        const stats: Record<string, any> = {};
        for (const progress of userProgress) {
          if (progress.sequenceId) {
            console.log('🎯 ENGAGEMENT: Loading engagement for sequence', progress.sequenceId, ':', progress.sequenceTitle);
            stats[progress.sequenceId] = await apiClient.getUserEngagementStats(
              currentUser.userId, 
              progress.sequenceId
            );
          }
        }
        
        console.log('🔥 ENGAGEMENT RESULT: Loaded engagement stats for', Object.keys(stats).length, 'role-accessible sequences');
        return stats;
      } catch (error) {
        console.error('🚨 ENGAGEMENT: Failed to load engagement stats:', error);
        return {};
      }
    },
    [currentUser?.userId, userProgress, currentAssignment?.activeRole]
  );

  const currentData = viewMode === 'my-progress' ? userProgress : agencyProgress;
  const isLoading = viewMode === 'my-progress' ? userProgressLoading : agencyProgressLoading;

  // Filter data by status
  const filteredData = currentData?.filter(item => 
    !statusFilter || item.sequenceStatus === statusFilter
  ) || [];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: ProgressStatus) => {
    const statusConfig = {
      NOT_STARTED: { variant: 'default' as const, label: 'Not Started' },
      IN_PROGRESS: { variant: 'info' as const, label: 'In Progress' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      SKIPPED: { variant: 'warning' as const, label: 'Skipped' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'sequenceTitle',
      header: 'Sequence',
      render: (progress: SequenceProgress) => (
        <div>
          <div className="font-medium text-gray-900">{progress.sequenceTitle}</div>
          {viewMode === 'team-progress' && (
            <div className="text-sm text-gray-500">User: {progress.userName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'completionPercentage',
      header: 'Progress',
      render: (progress: SequenceProgress) => (
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${getProgressColor(progress.completionPercentage)}`}>
            {progress.completionPercentage.toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      key: 'huddles',
      header: 'Huddles',
      render: (progress: SequenceProgress) => (
        <div className="text-sm text-gray-900">
          {progress.completedHuddles} / {progress.totalHuddles}
        </div>
      ),
    },
    {
      key: 'sequenceStatus',
      header: 'Status',
      render: (progress: SequenceProgress) => getStatusBadge(progress.sequenceStatus),
    },
    {
      key: 'totalTimeSpentMinutes',
      header: 'Time Spent',
      render: (progress: SequenceProgress) => (
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {formatDuration(progress.totalTimeSpentMinutes)}
        </div>
      ),
    },
    {
      key: 'averageScore',
      header: 'Score',
      render: (progress: SequenceProgress) => (
        <div className="text-sm text-gray-900">
          {progress.averageScore ? (
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-yellow-500" />
              {progress.averageScore.toFixed(1)}%
            </span>
          ) : (
            'N/A'
          )}
        </div>
      ),
    },
    {
      key: 'lastAccessed',
      header: 'Last Accessed',
      render: (progress: SequenceProgress) => (
        <span className="text-sm text-gray-500">
          {formatDate(progress.lastAccessed)}
        </span>
      ),
    },
  ];

  // Calculate summary statistics for sequences (team/agency view)
  const teamTotalSequences = currentData?.length || 0;
  const teamCompletedSequences = currentData?.filter(p => p.sequenceStatus === 'COMPLETED').length || 0;
  const teamInProgressSequences = currentData?.filter(p => p.sequenceStatus === 'IN_PROGRESS').length || 0;
  const teamAverageCompletion = teamTotalSequences > 0 
    ? currentData!.reduce((sum, p) => sum + p.completionPercentage, 0) / teamTotalSequences 
    : 0;

  // Calculate assessment statistics
  const totalAssessmentAttempts = assessmentAttempts?.length || 0;
  const passedAssessments = assessmentAttempts?.filter(a => a.isPassed).length || 0;
  const averageAssessmentScore = totalAssessmentAttempts > 0
    ? assessmentAttempts!.reduce((sum, a) => sum + (a.score || 0), 0) / totalAssessmentAttempts
    : 0;
  const pendingAssessments = availableAssessments?.length || 0;

  // Calculate engagement statistics
  const totalEngagementStats = Object.values(engagementStats || {});
  const totalTimeSpent = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.totalTimeSpent || 0), 0);
  const totalHuddlesEngaged = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.totalHuddles || 0), 0);
  const completedHuddles = totalEngagementStats.reduce((sum: number, stats: any) => 
    sum + (stats?.completedHuddles || 0), 0);

  if (!currentAgency || !currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have selected an agency.</p>
      </div>
    );
  }

  // Assessment columns for the assessment table
  const assessmentColumns = [
    {
      key: 'assessmentTitle',
      header: 'Assessment',
      render: (attempt: UserAssessmentAttempt) => (
        <div>
          <div className="font-medium text-gray-900">{attempt.assessmentTitle}</div>
          <div className="text-sm text-gray-500">{attempt.huddleId ? 'Huddle Assessment' : 'Standalone'}</div>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (attempt: UserAssessmentAttempt) => (
        <div className="flex items-center space-x-2">
          <Award className={`h-4 w-4 ${attempt.isPassed ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`font-medium ${attempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.score}%
          </span>
        </div>
      ),
    },
    {
      key: 'isPassed',
      header: 'Status',
      render: (attempt: UserAssessmentAttempt) => (
        <Badge variant={attempt.isPassed ? 'success' : 'destructive'}>
          {attempt.isPassed ? 'Passed' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'timeSpentMinutes',
      header: 'Time Spent',
      render: (attempt: UserAssessmentAttempt) => (
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {attempt.timeSpentMinutes ? `${attempt.timeSpentMinutes} min` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'completedAt',
      header: 'Completed',
      render: (attempt: UserAssessmentAttempt) => (
        <span className="text-sm text-gray-500">
          {formatDate(attempt.completedAt || attempt.startedAt)}
        </span>
      ),
    },
  ];

  // Available assessments columns
  const availableAssessmentColumns = [
    {
      key: 'title',
      header: 'Assessment',
      render: (assessment: Assessment) => (
        <div>
          <div className="font-medium text-gray-900">{assessment.title}</div>
          <div className="text-sm text-gray-500">{assessment.huddleTitle}</div>
        </div>
      ),
    },
    {
      key: 'estimatedMinutes',
      header: 'Est. Time',
      render: (assessment: Assessment) => (
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {assessment.estimatedMinutes || 'N/A'} min
        </div>
      ),
    },
    {
      key: 'passingScore',
      header: 'Passing Score',
      render: (assessment: Assessment) => (
        <span className="text-sm text-gray-900">{assessment.passingScore}%</span>
      ),
    },
    {
      key: 'maxAttempts',
      header: 'Attempts Left',
      render: (assessment: Assessment) => (
        <span className="text-sm text-gray-900">{assessment.maxAttempts}</span>
      ),
    },
  ];

  const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
  const roleSpecificTotalSequences = userProgress?.length || 0;
  const roleSpecificCompletedSequences = userProgress?.filter(p => p.sequenceStatus === 'COMPLETED').length || 0;
  const roleSpecificInProgressSequences = userProgress?.filter(p => p.sequenceStatus === 'IN_PROGRESS').length || 0;
  const roleSpecificNotStartedSequences = userProgress?.filter(p => p.sequenceStatus === 'NOT_STARTED').length || 0;
  const roleSpecificCompletionRate = roleSpecificTotalSequences > 0 ? Math.round((roleSpecificCompletedSequences / roleSpecificTotalSequences) * 100) : 0;
  const roleSpecificAverageCompletion = userProgress?.length > 0 
    ? userProgress.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / userProgress.length 
    : 0;

  return (
    <>
      <PageHeader
        title={`My Progress - ${activeRole || 'Loading...'}`}
        description={
          activeRole === 'EDUCATOR' 
            ? "Track your progress on sequences you created and manage"
            : `Monitor your learning progress as ${activeRole}${currentAssignment?.branchName ? ` in ${currentAssignment.branchName}` : ''}`
        }
        action={
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {activeRole === 'EDUCATOR' ? 'Creator-based progress' : 'Role-based progress'}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Role: {activeRole}
            </span>
            {roleSpecificTotalSequences > 0 && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {roleSpecificCompletionRate}% Complete ({roleSpecificCompletedSequences}/{roleSpecificTotalSequences})
              </span>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sequences" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Sequences</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Engagement</span>
          </TabsTrigger>
        </TabsList>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="space-y-6">
          {/* View Mode Toggle */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('my-progress')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'my-progress'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Progress
              </button>
              <button
                onClick={() => setViewMode('team-progress')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'team-progress'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Team Progress
              </button>
            </div>

            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProgressStatus | '')}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'NOT_STARTED', label: 'Not Started' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'SKIPPED', label: 'Skipped' },
                ]}
              />
            </div>
          </div>

          {/* Sequence Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Sequences</div>
                  <div className="text-2xl font-bold text-gray-900">{roleSpecificTotalSequences}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Completed</div>
                  <div className="text-2xl font-bold text-gray-900">{roleSpecificCompletedSequences}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">In Progress</div>
                  <div className="text-2xl font-bold text-gray-900">{roleSpecificInProgressSequences}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Avg. Completion</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {roleSpecificAverageCompletion.toFixed(0)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sequence Progress Table */}
          <DataTable
            data={filteredData}
            columns={columns}
            loading={isLoading}
            emptyMessage={
              <div className="text-center">
                <div className="mb-2">
                  {viewMode === 'my-progress'
                    ? (activeRole === 'EDUCATOR' 
                        ? "No progress found for sequences you created. Create and publish sequences to see progress here."
                        : `No progress found for ${activeRole} role with ${currentAssignment?.discipline || 'your'} discipline${currentAssignment?.branchName ? ` in ${currentAssignment.branchName}` : ''}. Start learning sequences to see progress here.`
                      )
                    : "No progress data available for the selected filters."
                  }
                </div>
                {viewMode === 'my-progress' && currentAssignment?.roles && currentAssignment.roles.length > 1 && (
                  <div className="text-xs text-blue-600 mt-2">
                    💡 You have multiple roles ({currentAssignment.roles.join(', ')}). Try switching roles using the role selector to see different progress.
                  </div>
                )}
              </div>
            }
            emptyIcon={<TrendingUp className="h-6 w-6" />}
          />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          {/* Assessment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Attempts</div>
                  <div className="text-2xl font-bold text-gray-900">{totalAssessmentAttempts}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Passed</div>
                  <div className="text-2xl font-bold text-gray-900">{passedAssessments}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Avg. Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageAssessmentScore.toFixed(0)}%
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Pending</div>
                  <div className="text-2xl font-bold text-gray-900">{pendingAssessments}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Assessment Attempts Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Assessment Attempts</h3>
            <DataTable
              data={assessmentAttempts || []}
              columns={assessmentColumns}
              loading={assessmentAttemptsLoading}
              emptyMessage="No assessment attempts found."
              emptyIcon={<Award className="h-6 w-6" />}
            />
          </div>

          {/* Available Assessments Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Assessments</h3>
            <DataTable
              data={availableAssessments || []}
              columns={availableAssessmentColumns}
              loading={availableAssessmentsLoading}
              emptyMessage="All assessments completed or no assessments available."
              emptyIcon={<Award className="h-6 w-6" />}
            />
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Time</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Huddles Engaged</div>
                  <div className="text-2xl font-bold text-gray-900">{totalHuddlesEngaged}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Completed Huddles</div>
                  <div className="text-2xl font-bold text-gray-900">{completedHuddles}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalHuddlesEngaged > 0 ? Math.round((completedHuddles / totalHuddlesEngaged) * 100) : 0}%
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Visual Analytics */}
          <EngagementVisualization
            engagementData={userProgress?.map(progress => {
              const stats = engagementStats[progress.sequenceId || 0];
              return {
                sequenceTitle: progress.sequenceTitle,
                totalHuddles: stats?.totalHuddles || 0,
                completedHuddles: stats?.completedHuddles || 0,
                totalTimeSpent: stats?.totalTimeSpent || 0,
                averageProgress: stats?.averageProgress || progress.completionPercentage,
                status: progress.sequenceStatus,
              };
            }).filter(Boolean) || []}
            assessmentData={assessmentAttempts?.reduce((acc: any[], attempt) => {
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
            }, []) || []}
            loading={engagementStatsLoading || assessmentAttemptsLoading}
          />

          {/* Detailed Engagement by Sequence */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Engagement by Sequence</h3>
            <div className="space-y-4">
              {userProgress?.map((progress) => {
                const stats = engagementStats[progress.sequenceId || 0];
                if (!stats) return null;

                return (
                  <Card key={progress.sequenceId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{progress.sequenceTitle}</h4>
                      <Badge variant={progress.sequenceStatus === 'COMPLETED' ? 'success' : 'default'}>
                        {progress.sequenceStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalHuddles || 0}</div>
                        <div className="text-sm text-gray-500">Total Huddles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.completedHuddles || 0}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.totalTimeSpent || 0}m</div>
                        <div className="text-sm text-gray-500">Time Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.averageProgress ? Math.round(stats.averageProgress) : 0}%
                        </div>
                        <div className="text-sm text-gray-500">Avg. Progress</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              
              {(!userProgress || userProgress.length === 0) && (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No engagement data available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};
