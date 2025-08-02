// services/analyticsService.ts
import { apiClient } from './api';
import {
  AgencyAnalytics,
  BranchAnalytics,
  TeamAnalytics,
  UserPerformanceMetrics,
  AnalyticsFilters,
  AnalyticsTimeRange,
  AnalyticsApiResponse,
  AnalyticsReport,
  AnalyticsExportOptions,
  ActivityEvent,
  DeadlineEvent,
  CompetencyTracking,
  BaseAnalyticsMetrics,
  PerformanceComparison,
} from '../types/analytics';

export class AnalyticsService {
  private static readonly BASE_URL = '/analytics';

  // Helper method to create time range
  static createTimeRange(period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): AnalyticsTimeRange {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'daily':
        start.setDate(start.getDate() - 30);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7 * 12);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 12);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 12);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 3);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      period,
    };
  }

  // Default filters
  static getDefaultFilters(): AnalyticsFilters {
    return {
      timeRange: this.createTimeRange('monthly'),
      includeInactive: false,
    };
  }

  // Agency Analytics (for Educators)
  static async getAgencyAnalytics(
    agencyId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<AgencyAnalytics>> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.getAdvancedAgencyAnalytics(agencyId, filters);
      
      // Mock data for development
      const mockData = this.generateMockAgencyAnalytics(agencyId);
      
      return {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
        executionTime: 125,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching agency analytics:', error);
      throw error;
    }
  }

  // Branch Analytics (for Directors)
  static async getBranchAnalytics(
    branchId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<BranchAnalytics>> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.getAdvancedBranchAnalytics(branchId, filters);
      
      // Mock data for development
      const mockData = this.generateMockBranchAnalytics(branchId);
      
      return {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
        executionTime: 98,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching branch analytics:', error);
      throw error;
    }
  }

  // Team Analytics (for Clinical Managers)
  static async getTeamAnalytics(
    teamId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<TeamAnalytics>> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.getAdvancedTeamAnalytics(teamId, filters);
      
      // Mock data for development
      const mockData = this.generateMockTeamAnalytics(teamId);
      
      return {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
        executionTime: 76,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching team analytics:', error);
      throw error;
    }
  }

  // User Analytics (for Individual Users)
  static async getUserAnalytics(
    userId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<UserPerformanceMetrics>> {
    try {
      const response = await apiClient.getAdvancedUserAnalytics(userId, filters);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  // Activity Feed
  static async getActivityFeed(
    scope: 'agency' | 'branch' | 'team' | 'user',
    entityId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<AnalyticsApiResponse<ActivityEvent[]>> {
    try {
      const response = await apiClient.getAnalyticsActivityFeed(scope, entityId, limit, offset);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  // Upcoming Deadlines
  static async getUpcomingDeadlines(
    scope: 'agency' | 'branch' | 'team' | 'user',
    entityId: number,
    daysAhead: number = 30
  ): Promise<AnalyticsApiResponse<DeadlineEvent[]>> {
    try {
      const response = await apiClient.getAnalyticsUpcomingDeadlines(scope, entityId, daysAhead);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }
  }

  // Competency Tracking
  static async getCompetencyTracking(
    scope: 'agency' | 'branch' | 'team' | 'user',
    entityId: number
  ): Promise<AnalyticsApiResponse<CompetencyTracking[]>> {
    try {
      const response = await apiClient.getAnalyticsCompetencyTracking(scope, entityId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching competency tracking:', error);
      throw error;
    }
  }

  // Performance Comparison
  static async getPerformanceComparison(
    scope: 'agency' | 'branch' | 'team',
    entityId: number,
    currentPeriod: AnalyticsTimeRange,
    comparisonPeriod: AnalyticsTimeRange
  ): Promise<AnalyticsApiResponse<PerformanceComparison>> {
    try {
      const response = await apiClient.getAnalyticsPerformanceComparison(scope, entityId, currentPeriod, comparisonPeriod);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching performance comparison:', error);
      throw error;
    }
  }

  // Export Analytics Report
  static async exportAnalyticsReport(
    scope: 'agency' | 'branch' | 'team' | 'user',
    entityId: number,
    options: AnalyticsExportOptions,
    filters?: AnalyticsFilters
  ): Promise<AnalyticsApiResponse<AnalyticsReport>> {
    try {
      const response = await apiClient.exportAnalyticsReport(scope, entityId, options, filters || this.getDefaultFilters());
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      throw error;
    }
  }

  // Real-time Metrics Dashboard
  static async getRealTimeMetrics(
    scope: 'agency' | 'branch' | 'team',
    entityId: number
  ): Promise<AnalyticsApiResponse<BaseAnalyticsMetrics>> {
    try {
      const response = await apiClient.getAnalyticsRealTimeMetrics(scope, entityId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  // Bulk Analytics for Multiple Entities
  static async getBulkAnalytics(
    scope: 'branches' | 'teams' | 'users',
    entityIds: number[],
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      const response = await apiClient.getAnalyticsBulkData(scope, entityIds, filters);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching bulk analytics:', error);
      throw error;
    }
  }

  // Analytics Insights and Recommendations
  static async getAnalyticsInsights(
    scope: 'agency' | 'branch' | 'team',
    entityId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<{
    insights: string[];
    recommendations: string[];
    trends: Record<string, any>;
    predictions: Record<string, any>;
  }>> {
    try {
      const response = await apiClient.getAnalyticsInsights(scope, entityId, filters);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching analytics insights:', error);
      throw error;
    }
  }

  // Sequence Performance Analytics
  static async getSequencePerformance(
    sequenceId: number,
    scope: 'agency' | 'branch' | 'team',
    entityId: number
  ): Promise<AnalyticsApiResponse<{
    sequenceId: number;
    sequenceTitle: string;
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    averageScore: number;
    averageTimeToComplete: number;
    retakeRate: number;
    userProgress: {
      userId: number;
      userName: string;
      isCompleted: boolean;
      completionDate?: string;
      score?: number;
      timeSpent: number;
      retakeCount: number;
    }[];
  }>> {
    try {
      const response = await apiClient.getAnalyticsSequencePerformance(sequenceId, scope, entityId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching sequence performance:', error);
      throw error;
    }
  }

  // Assessment Performance Analytics
  static async getAssessmentPerformance(
    assessmentId: number,
    scope: 'agency' | 'branch' | 'team',
    entityId: number
  ): Promise<AnalyticsApiResponse<{
    assessmentId: number;
    assessmentTitle: string;
    totalAttempts: number;
    totalPassed: number;
    totalFailed: number;
    passRate: number;
    averageScore: number;
    averageTimeToComplete: number;
    retakeRate: number;
    userResults: {
      userId: number;
      userName: string;
      attempts: number;
      bestScore: number;
      isPassed: boolean;
      lastAttemptDate: string;
    }[];
  }>> {
    try {
      const response = await apiClient.getAnalyticsAssessmentPerformance(assessmentId, scope, entityId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching assessment performance:', error);
      throw error;
    }
  }

  // Learning Path Analytics
  static async getLearningPathAnalytics(
    userId: number
  ): Promise<AnalyticsApiResponse<{
    userId: number;
    userName: string;
    currentPath: {
      sequenceId: number;
      sequenceTitle: string;
      progress: number;
      estimatedCompletionTime: number;
      isOnTrack: boolean;
    }[];
    completedPaths: {
      sequenceId: number;
      sequenceTitle: string;
      completionDate: string;
      score: number;
      timeSpent: number;
    }[];
    recommendations: {
      sequenceId: number;
      sequenceTitle: string;
      reason: string;
      priority: 'low' | 'medium' | 'high';
    }[];
  }>> {
    try {
      const response = await apiClient.getAnalyticsLearningPath(userId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching learning path analytics:', error);
      throw error;
    }
  }

  // Engagement Analytics
  static async getEngagementAnalytics(
    scope: 'agency' | 'branch' | 'team',
    entityId: number,
    filters: AnalyticsFilters = this.getDefaultFilters()
  ): Promise<AnalyticsApiResponse<{
    dailyActiveUsers: { date: string; count: number }[];
    weeklyActiveUsers: { week: string; count: number }[];
    monthlyActiveUsers: { month: string; count: number }[];
    averageSessionDuration: number;
    totalSessions: number;
    bounceRate: number;
    retentionRate: number;
    engagementTrends: {
      metric: string;
      values: { date: string; value: number }[];
    }[];
  }>> {
    try {
      const response = await apiClient.getAnalyticsEngagement(scope, entityId, filters);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      throw error;
    }
  }

  // Compliance Analytics
  static async getComplianceAnalytics(
    scope: 'agency' | 'branch' | 'team',
    entityId: number
  ): Promise<AnalyticsApiResponse<{
    overallComplianceRate: number;
    competencyCompliance: {
      competencyId: number;
      competencyName: string;
      complianceRate: number;
      compliantUsers: number;
      nonCompliantUsers: number;
      overdueUsers: number;
    }[];
    upcomingExpirations: {
      userId: number;
      userName: string;
      competencyName: string;
      expirationDate: string;
      daysUntilExpiration: number;
    }[];
    complianceHistory: {
      date: string;
      complianceRate: number;
    }[];
  }>> {
    try {
      const response = await apiClient.getAnalyticsCompliance(scope, entityId);
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error fetching compliance analytics:', error);
      throw error;
    }
  }

  // Calculate metrics helpers
  static calculateCompletionRate(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  static calculateAverageScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  }

  static formatPercentage(value: number): string {
    return `${value}%`;
  }

  static formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  static getTimeRangeLabel(timeRange: AnalyticsTimeRange): string {
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);
    
    const startLabel = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const endLabel = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startLabel} - ${endLabel}`;
  }

  static getTrendIcon(value: number): string {
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '→';
  }

  static getTrendColor(value: number): string {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'needs_attention':
        return 'text-yellow-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  static getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'needs_attention':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  }

  // Mock data generators for development
  private static generateMockAgencyAnalytics(agencyId: number): AgencyAnalytics {
    return {
      agencyId,
      agencyName: 'Healthcare Solutions Inc.',
      createdDate: '2023-01-15T00:00:00Z',
      subscriptionPlan: 'Professional',
      isActive: true,
      metrics: {
        totalUsers: 245,
        activeUsers: 223,
        completionRate: 87,
        averageScore: 91,
        engagementRate: 82,
        totalHuddles: 156,
        completedHuddles: 1347,
        totalAssessments: 89,
        passedAssessments: 1156,
        failedAssessments: 234,
        pendingAssessments: 67,
        averageTimeToComplete: 28,
        retakeRate: 12,
      },
      performance: {
        current: {
          totalUsers: 245,
          activeUsers: 223,
          completionRate: 87,
          averageScore: 91,
          engagementRate: 82,
          totalHuddles: 156,
          completedHuddles: 1347,
          totalAssessments: 89,
          passedAssessments: 1156,
          failedAssessments: 234,
          pendingAssessments: 67,
          averageTimeToComplete: 28,
          retakeRate: 12,
        },
        previous: {
          totalUsers: 232,
          activeUsers: 210,
          completionRate: 84,
          averageScore: 89,
          engagementRate: 79,
          totalHuddles: 149,
          completedHuddles: 1289,
          totalAssessments: 84,
          passedAssessments: 1098,
          failedAssessments: 221,
          pendingAssessments: 52,
          averageTimeToComplete: 31,
          retakeRate: 15,
        },
        periodOverPeriod: {
          completionRateChange: 3,
          averageScoreChange: 2,
          engagementRateChange: 3,
          userGrowthRate: 6,
        },
      },
      branchPerformance: [
        {
          branchId: 1,
          branchName: 'Downtown Branch',
          metrics: {
            totalUsers: 85,
            activeUsers: 78,
            completionRate: 92,
            averageScore: 94,
            engagementRate: 88,
            totalHuddles: 45,
            completedHuddles: 523,
            totalAssessments: 32,
            passedAssessments: 445,
            failedAssessments: 67,
            pendingAssessments: 23,
            averageTimeToComplete: 26,
            retakeRate: 8,
          },
          teamCount: 4,
          userCount: 85,
          completionRate: 92,
          averageScore: 94,
          engagementRate: 88,
          improvementTrend: 'up' as const,
          improvementValue: 5,
        },
        {
          branchId: 2,
          branchName: 'Suburban Branch',
          metrics: {
            totalUsers: 72,
            activeUsers: 65,
            completionRate: 85,
            averageScore: 89,
            engagementRate: 79,
            totalHuddles: 38,
            completedHuddles: 412,
            totalAssessments: 28,
            passedAssessments: 365,
            failedAssessments: 78,
            pendingAssessments: 19,
            averageTimeToComplete: 29,
            retakeRate: 14,
          },
          teamCount: 3,
          userCount: 72,
          completionRate: 85,
          averageScore: 89,
          engagementRate: 79,
          improvementTrend: 'up' as const,
          improvementValue: 2,
        },
        {
          branchId: 3,
          branchName: 'Rural Branch',
          metrics: {
            totalUsers: 88,
            activeUsers: 80,
            completionRate: 81,
            averageScore: 87,
            engagementRate: 76,
            totalHuddles: 73,
            completedHuddles: 412,
            totalAssessments: 29,
            passedAssessments: 346,
            failedAssessments: 89,
            pendingAssessments: 25,
            averageTimeToComplete: 32,
            retakeRate: 18,
          },
          teamCount: 5,
          userCount: 88,
          completionRate: 81,
          averageScore: 87,
          engagementRate: 76,
          improvementTrend: 'stable' as const,
          improvementValue: 0,
        },
      ],
      teamPerformance: [
        {
          teamId: 1,
          teamName: 'Emergency Care Team',
          branchId: 1,
          branchName: 'Downtown Branch',
          metrics: {
            totalUsers: 22,
            activeUsers: 20,
            completionRate: 95,
            averageScore: 96,
            engagementRate: 92,
            totalHuddles: 18,
            completedHuddles: 156,
            totalAssessments: 12,
            passedAssessments: 134,
            failedAssessments: 18,
            pendingAssessments: 8,
            averageTimeToComplete: 24,
            retakeRate: 5,
          },
          memberCount: 22,
          completionRate: 95,
          averageScore: 96,
          engagementRate: 92,
        },
        {
          teamId: 2,
          teamName: 'ICU Team',
          branchId: 1,
          branchName: 'Downtown Branch',
          metrics: {
            totalUsers: 18,
            activeUsers: 17,
            completionRate: 89,
            averageScore: 92,
            engagementRate: 85,
            totalHuddles: 15,
            completedHuddles: 123,
            totalAssessments: 10,
            passedAssessments: 98,
            failedAssessments: 21,
            pendingAssessments: 6,
            averageTimeToComplete: 27,
            retakeRate: 12,
          },
          memberCount: 18,
          completionRate: 89,
          averageScore: 92,
          engagementRate: 85,
        },
      ],
      userPerformance: [],
      competencyOverview: [
        {
          competencyId: 1,
          competencyName: 'Patient Safety',
          category: 'Safety',
          averageScore: 93,
          completionRate: 91,
          compliantUsers: 223,
          needsAttentionUsers: 18,
          overdueUsers: 4,
        },
        {
          competencyId: 2,
          competencyName: 'Infection Control',
          category: 'Safety',
          averageScore: 89,
          completionRate: 87,
          compliantUsers: 213,
          needsAttentionUsers: 24,
          overdueUsers: 8,
        },
        {
          competencyId: 3,
          competencyName: 'Medication Safety',
          category: 'Clinical',
          averageScore: 91,
          completionRate: 85,
          compliantUsers: 208,
          needsAttentionUsers: 28,
          overdueUsers: 9,
        },
      ],
      sequencePerformance: [
        {
          sequenceId: 1,
          sequenceTitle: 'Basic Safety Protocol',
          totalAssigned: 245,
          totalCompleted: 213,
          completionRate: 87,
          averageScore: 91,
          averageTimeToComplete: 28,
          retakeRate: 12,
        },
        {
          sequenceId: 2,
          sequenceTitle: 'Advanced Emergency Care',
          totalAssigned: 156,
          totalCompleted: 128,
          completionRate: 82,
          averageScore: 89,
          averageTimeToComplete: 45,
          retakeRate: 18,
        },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'huddle_completed',
          userId: 1,
          userName: 'Sarah Johnson',
          branchId: 1,
          branchName: 'Downtown Branch',
          teamId: 1,
          teamName: 'Emergency Care Team',
          message: 'Sarah Johnson completed Advanced CPR Training',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          score: 94,
        },
        {
          id: 2,
          type: 'assessment_passed',
          userId: 2,
          userName: 'Mike Davis',
          branchId: 1,
          branchName: 'Downtown Branch',
          teamId: 2,
          teamName: 'ICU Team',
          message: 'Mike Davis passed Safety Protocol Assessment',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          score: 92,
        },
      ],
      upcomingDeadlines: [
        {
          id: 1,
          type: 'assessment_deadline',
          userId: 3,
          userName: 'Emma Wilson',
          branchId: 2,
          branchName: 'Suburban Branch',
          title: 'Monthly Safety Assessment',
          deadline: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
          priority: 'high',
          isOverdue: false,
          daysUntilDeadline: 2,
          relatedEntityId: 1,
          relatedEntityType: 'assessment',
        },
      ],
      insights: {
        topPerformingBranches: [
          { branchId: 1, branchName: 'Downtown Branch', completionRate: 92 },
          { branchId: 2, branchName: 'Suburban Branch', completionRate: 85 },
        ],
        strugglingBranches: [
          { branchId: 3, branchName: 'Rural Branch', completionRate: 81 },
        ],
        mostImprovedBranches: [
          { branchId: 1, branchName: 'Downtown Branch', improvementRate: 5 },
          { branchId: 2, branchName: 'Suburban Branch', improvementRate: 2 },
        ],
        topPerformingTeams: [
          { teamId: 1, teamName: 'Emergency Care Team', branchName: 'Downtown Branch', completionRate: 95 },
          { teamId: 2, teamName: 'ICU Team', branchName: 'Downtown Branch', completionRate: 89 },
        ],
        competencyGaps: [
          'Medication Safety completion rate below target',
          'Rural Branch engagement needs improvement',
        ],
        recommendations: [
          'Schedule additional training sessions for Rural Branch',
          'Implement peer mentoring program for struggling users',
          'Review Medication Safety curriculum for clarity',
        ],
      },
    };
  }

  private static generateMockBranchAnalytics(branchId: number): BranchAnalytics {
    return {
      branchId,
      branchName: 'Downtown Branch',
      agencyId: 1,
      agencyName: 'Healthcare Solutions Inc.',
      createdDate: '2023-02-01T00:00:00Z',
      isActive: true,
      metrics: {
        totalUsers: 85,
        activeUsers: 78,
        completionRate: 92,
        averageScore: 94,
        engagementRate: 88,
        totalHuddles: 45,
        completedHuddles: 523,
        totalAssessments: 32,
        passedAssessments: 445,
        failedAssessments: 67,
        pendingAssessments: 23,
        averageTimeToComplete: 26,
        retakeRate: 8,
      },
      performance: {
        current: {
          totalUsers: 85,
          activeUsers: 78,
          completionRate: 92,
          averageScore: 94,
          engagementRate: 88,
          totalHuddles: 45,
          completedHuddles: 523,
          totalAssessments: 32,
          passedAssessments: 445,
          failedAssessments: 67,
          pendingAssessments: 23,
          averageTimeToComplete: 26,
          retakeRate: 8,
        },
        previous: {
          totalUsers: 82,
          activeUsers: 74,
          completionRate: 87,
          averageScore: 91,
          engagementRate: 84,
          totalHuddles: 42,
          completedHuddles: 478,
          totalAssessments: 29,
          passedAssessments: 398,
          failedAssessments: 72,
          pendingAssessments: 18,
          averageTimeToComplete: 29,
          retakeRate: 11,
        },
        periodOverPeriod: {
          completionRateChange: 5,
          averageScoreChange: 3,
          engagementRateChange: 4,
          userGrowthRate: 4,
        },
      },
      teamPerformance: [
        {
          teamId: 1,
          teamName: 'Emergency Care Team',
          metrics: {
            totalUsers: 22,
            activeUsers: 20,
            completionRate: 95,
            averageScore: 96,
            engagementRate: 92,
            totalHuddles: 18,
            completedHuddles: 156,
            totalAssessments: 12,
            passedAssessments: 134,
            failedAssessments: 18,
            pendingAssessments: 8,
            averageTimeToComplete: 24,
            retakeRate: 5,
          },
          memberCount: 22,
          completionRate: 95,
          averageScore: 96,
          engagementRate: 92,
          improvementTrend: 'up' as const,
          improvementValue: 3,
        },
        {
          teamId: 2,
          teamName: 'ICU Team',
          metrics: {
            totalUsers: 18,
            activeUsers: 17,
            completionRate: 89,
            averageScore: 92,
            engagementRate: 85,
            totalHuddles: 15,
            completedHuddles: 123,
            totalAssessments: 10,
            passedAssessments: 98,
            failedAssessments: 21,
            pendingAssessments: 6,
            averageTimeToComplete: 27,
            retakeRate: 12,
          },
          memberCount: 18,
          completionRate: 89,
          averageScore: 92,
          engagementRate: 85,
          improvementTrend: 'up' as const,
          improvementValue: 2,
        },
      ],
      userPerformance: [],
      competencyOverview: [
        {
          competencyId: 1,
          competencyName: 'Patient Safety',
          category: 'Safety',
          averageScore: 95,
          completionRate: 94,
          compliantUsers: 80,
          needsAttentionUsers: 4,
          overdueUsers: 1,
        },
        {
          competencyId: 2,
          competencyName: 'Infection Control',
          category: 'Safety',
          averageScore: 92,
          completionRate: 90,
          compliantUsers: 76,
          needsAttentionUsers: 7,
          overdueUsers: 2,
        },
      ],
      sequencePerformance: [
        {
          sequenceId: 1,
          sequenceTitle: 'Basic Safety Protocol',
          totalAssigned: 85,
          totalCompleted: 78,
          completionRate: 92,
          averageScore: 94,
          averageTimeToComplete: 26,
          retakeRate: 8,
        },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'huddle_completed',
          userId: 1,
          userName: 'Sarah Johnson',
          teamId: 1,
          teamName: 'Emergency Care Team',
          message: 'Sarah Johnson completed Advanced CPR Training',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          score: 94,
        },
        {
          id: 2,
          type: 'assessment_passed',
          userId: 2,
          userName: 'Mike Davis',
          teamId: 2,
          teamName: 'ICU Team',
          message: 'Mike Davis passed Safety Protocol Assessment',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          score: 92,
        },
      ],
      upcomingDeadlines: [
        {
          id: 1,
          type: 'assessment_deadline',
          userId: 3,
          userName: 'Emma Wilson',
          teamId: 1,
          teamName: 'Emergency Care Team',
          title: 'Monthly Safety Assessment',
          deadline: new Date(Date.now() + 172800000).toISOString(),
          priority: 'high',
          isOverdue: false,
          daysUntilDeadline: 2,
          relatedEntityId: 1,
          relatedEntityType: 'assessment',
        },
      ],
      insights: {
        topPerformingTeams: [
          { teamId: 1, teamName: 'Emergency Care Team', completionRate: 95 },
          { teamId: 2, teamName: 'ICU Team', completionRate: 89 },
        ],
        strugglingTeams: [],
        mostImprovedTeams: [
          { teamId: 1, teamName: 'Emergency Care Team', improvementRate: 3 },
          { teamId: 2, teamName: 'ICU Team', improvementRate: 2 },
        ],
        competencyGaps: [
          'Some users need additional Infection Control training',
        ],
        recommendations: [
          'Continue current training momentum',
          'Implement peer mentoring for new team members',
        ],
      },
    };
  }

  private static generateMockTeamAnalytics(teamId: number): TeamAnalytics {
    return {
      teamId,
      teamName: 'Emergency Care Team',
      branchId: 1,
      branchName: 'Downtown Branch',
      agencyId: 1,
      agencyName: 'Healthcare Solutions Inc.',
      createdDate: '2023-02-15T00:00:00Z',
      isActive: true,
      metrics: {
        totalUsers: 22,
        activeUsers: 20,
        completionRate: 95,
        averageScore: 96,
        engagementRate: 92,
        totalHuddles: 18,
        completedHuddles: 156,
        totalAssessments: 12,
        passedAssessments: 134,
        failedAssessments: 18,
        pendingAssessments: 8,
        averageTimeToComplete: 24,
        retakeRate: 5,
      },
      performance: {
        current: {
          totalUsers: 22,
          activeUsers: 20,
          completionRate: 95,
          averageScore: 96,
          engagementRate: 92,
          totalHuddles: 18,
          completedHuddles: 156,
          totalAssessments: 12,
          passedAssessments: 134,
          failedAssessments: 18,
          pendingAssessments: 8,
          averageTimeToComplete: 24,
          retakeRate: 5,
        },
        previous: {
          totalUsers: 21,
          activeUsers: 19,
          completionRate: 92,
          averageScore: 93,
          engagementRate: 89,
          totalHuddles: 17,
          completedHuddles: 142,
          totalAssessments: 11,
          passedAssessments: 125,
          failedAssessments: 21,
          pendingAssessments: 6,
          averageTimeToComplete: 26,
          retakeRate: 8,
        },
        periodOverPeriod: {
          completionRateChange: 3,
          averageScoreChange: 3,
          engagementRateChange: 3,
          userGrowthRate: 5,
        },
      },
      memberPerformance: [
        {
          userId: 1,
          userName: 'Sarah Johnson',
          email: 'sarah.johnson@healthcare.com',
          roles: ['FIELD_CLINICIAN'],
          discipline: 'NURSING',
          teamId: 1,
          teamName: 'Emergency Care Team',
          branchId: 1,
          branchName: 'Downtown Branch',
          joinDate: '2023-03-01T00:00:00Z',
          lastLoginDate: new Date(Date.now() - 3600000).toISOString(),
          lastActivityDate: new Date(Date.now() - 1800000).toISOString(),
          isActive: true,
          completionRate: 98,
          averageScore: 97,
          totalHuddlesAssigned: 18,
          totalHuddlesCompleted: 17,
          totalAssessmentsTaken: 12,
          totalAssessmentsPassed: 12,
          currentStreak: 14,
          longestStreak: 21,
          totalTimeSpent: 420,
          averageSessionDuration: 22,
          competencyScores: [],
          recentActivity: [],
          upcomingDeadlines: [],
        },
        {
          userId: 2,
          userName: 'Mike Davis',
          email: 'mike.davis@healthcare.com',
          roles: ['FIELD_CLINICIAN'],
          discipline: 'NURSING',
          teamId: 1,
          teamName: 'Emergency Care Team',
          branchId: 1,
          branchName: 'Downtown Branch',
          joinDate: '2023-03-15T00:00:00Z',
          lastLoginDate: new Date(Date.now() - 7200000).toISOString(),
          lastActivityDate: new Date(Date.now() - 3600000).toISOString(),
          isActive: true,
          completionRate: 94,
          averageScore: 95,
          totalHuddlesAssigned: 18,
          totalHuddlesCompleted: 16,
          totalAssessmentsTaken: 11,
          totalAssessmentsPassed: 11,
          currentStreak: 8,
          longestStreak: 15,
          totalTimeSpent: 385,
          averageSessionDuration: 25,
          competencyScores: [],
          recentActivity: [],
          upcomingDeadlines: [],
        },
      ],
      competencyOverview: [
        {
          competencyId: 1,
          competencyName: 'Patient Safety',
          category: 'Safety',
          averageScore: 97,
          completionRate: 95,
          compliantUsers: 21,
          needsAttentionUsers: 1,
          overdueUsers: 0,
        },
        {
          competencyId: 2,
          competencyName: 'Emergency Response',
          category: 'Clinical',
          averageScore: 96,
          completionRate: 100,
          compliantUsers: 22,
          needsAttentionUsers: 0,
          overdueUsers: 0,
        },
      ],
      sequencePerformance: [
        {
          sequenceId: 1,
          sequenceTitle: 'Emergency Care Fundamentals',
          totalAssigned: 22,
          totalCompleted: 20,
          completionRate: 91,
          averageScore: 96,
          averageTimeToComplete: 24,
          retakeRate: 5,
        },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'huddle_completed',
          userId: 1,
          userName: 'Sarah Johnson',
          message: 'Sarah Johnson completed Advanced CPR Training',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          score: 97,
        },
        {
          id: 2,
          type: 'assessment_passed',
          userId: 2,
          userName: 'Mike Davis',
          message: 'Mike Davis passed Emergency Response Assessment',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          score: 95,
        },
      ],
      upcomingDeadlines: [
        {
          id: 1,
          type: 'assessment_deadline',
          userId: 3,
          userName: 'Emma Wilson',
          title: 'Monthly Safety Assessment',
          deadline: new Date(Date.now() + 172800000).toISOString(),
          priority: 'high',
          isOverdue: false,
          daysUntilDeadline: 2,
          relatedEntityId: 1,
          relatedEntityType: 'assessment',
        },
      ],
      insights: {
        topPerformers: [
          {
            userId: 1,
            userName: 'Sarah Johnson',
            email: 'sarah.johnson@healthcare.com',
            roles: ['FIELD_CLINICIAN'],
            discipline: 'NURSING',
            teamId: 1,
            teamName: 'Emergency Care Team',
            branchId: 1,
            branchName: 'Downtown Branch',
            joinDate: '2023-03-01T00:00:00Z',
            lastLoginDate: new Date(Date.now() - 3600000).toISOString(),
            lastActivityDate: new Date(Date.now() - 1800000).toISOString(),
            isActive: true,
            completionRate: 98,
            averageScore: 97,
            totalHuddlesAssigned: 18,
            totalHuddlesCompleted: 17,
            totalAssessmentsTaken: 12,
            totalAssessmentsPassed: 12,
            currentStreak: 14,
            longestStreak: 21,
            totalTimeSpent: 420,
            averageSessionDuration: 22,
            competencyScores: [],
            recentActivity: [],
            upcomingDeadlines: [],
          },
        ],
        strugglingUsers: [],
        mostImprovedUsers: [
          {
            userId: 2,
            userName: 'Mike Davis',
            email: 'mike.davis@healthcare.com',
            roles: ['FIELD_CLINICIAN'],
            discipline: 'NURSING',
            teamId: 1,
            teamName: 'Emergency Care Team',
            branchId: 1,
            branchName: 'Downtown Branch',
            joinDate: '2023-03-15T00:00:00Z',
            lastLoginDate: new Date(Date.now() - 7200000).toISOString(),
            lastActivityDate: new Date(Date.now() - 3600000).toISOString(),
            isActive: true,
            completionRate: 94,
            averageScore: 95,
            totalHuddlesAssigned: 18,
            totalHuddlesCompleted: 16,
            totalAssessmentsTaken: 11,
            totalAssessmentsPassed: 11,
            currentStreak: 8,
            longestStreak: 15,
            totalTimeSpent: 385,
            averageSessionDuration: 25,
            competencyScores: [],
            recentActivity: [],
            upcomingDeadlines: [],
          },
        ],
        competencyGaps: [],
        recommendations: [
          'Team is performing excellently - maintain current practices',
          'Consider advanced training modules for top performers',
        ],
      },
    };
  }
}