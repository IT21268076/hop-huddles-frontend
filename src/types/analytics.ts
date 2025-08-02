// types/analytics.ts
export interface AnalyticsTimeRange {
  start: string;
  end: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface BaseAnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageScore: number;
  engagementRate: number;
  totalHuddles: number;
  completedHuddles: number;
  totalAssessments: number;
  passedAssessments: number;
  failedAssessments: number;
  pendingAssessments: number;
  averageTimeToComplete: number; // in minutes
  retakeRate: number;
}

export interface PerformanceComparison {
  current: BaseAnalyticsMetrics;
  previous: BaseAnalyticsMetrics;
  periodOverPeriod: {
    completionRateChange: number;
    averageScoreChange: number;
    engagementRateChange: number;
    userGrowthRate: number;
  };
}

export interface ActivityEvent {
  id: number;
  type: 'huddle_completed' | 'assessment_passed' | 'assessment_failed' | 'user_joined' | 'user_assigned' | 'milestone_reached' | 'sequence_assigned' | 'sequence_completed';
  userId: number;
  userName: string;
  teamId?: number;
  teamName?: string;
  branchId?: number;
  branchName?: string;
  sequenceId?: number;
  sequenceTitle?: string;
  huddleId?: number;
  huddleTitle?: string;
  assessmentId?: number;
  assessmentTitle?: string;
  message: string;
  timestamp: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface DeadlineEvent {
  id: number;
  type: 'assessment_deadline' | 'sequence_deadline' | 'competency_deadline' | 'compliance_deadline';
  userId: number;
  userName: string;
  teamId?: number;
  teamName?: string;
  branchId?: number;
  branchName?: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isOverdue: boolean;
  daysUntilDeadline: number;
  relatedEntityId: number;
  relatedEntityType: 'huddle' | 'sequence' | 'assessment' | 'competency';
}

export interface CompetencyTracking {
  competencyId: number;
  competencyName: string;
  category: string;
  description?: string;
  requiredScore: number;
  currentScore: number;
  completionPercentage: number;
  status: 'not_started' | 'in_progress' | 'compliant' | 'needs_attention' | 'overdue';
  lastUpdated: string;
  deadline?: string;
  relatedSequences: {
    sequenceId: number;
    sequenceTitle: string;
    isCompleted: boolean;
    completionDate?: string;
  }[];
  relatedAssessments: {
    assessmentId: number;
    assessmentTitle: string;
    score?: number;
    isPassed: boolean;
    completionDate?: string;
  }[];
}

export interface UserPerformanceMetrics {
  userId: number;
  userName: string;
  email: string;
  roles: string[];
  discipline?: string;
  teamId?: number;
  teamName?: string;
  branchId?: number;
  branchName?: string;
  joinDate: string;
  lastLoginDate?: string;
  lastActivityDate?: string;
  isActive: boolean;
  completionRate: number;
  averageScore: number;
  totalHuddlesAssigned: number;
  totalHuddlesCompleted: number;
  totalAssessmentsTaken: number;
  totalAssessmentsPassed: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // in minutes
  averageSessionDuration: number; // in minutes
  competencyScores: CompetencyTracking[];
  recentActivity: ActivityEvent[];
  upcomingDeadlines: DeadlineEvent[];
}

export interface TeamAnalytics {
  teamId: number;
  teamName: string;
  branchId: number;
  branchName: string;
  agencyId: number;
  agencyName: string;
  createdDate: string;
  isActive: boolean;
  metrics: BaseAnalyticsMetrics;
  performance: PerformanceComparison;
  memberPerformance: UserPerformanceMetrics[];
  competencyOverview: {
    competencyId: number;
    competencyName: string;
    category: string;
    averageScore: number;
    completionRate: number;
    compliantUsers: number;
    needsAttentionUsers: number;
    overdueUsers: number;
  }[];
  sequencePerformance: {
    sequenceId: number;
    sequenceTitle: string;
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    averageScore: number;
    averageTimeToComplete: number;
    retakeRate: number;
  }[];
  recentActivity: ActivityEvent[];
  upcomingDeadlines: DeadlineEvent[];
  insights: {
    topPerformers: UserPerformanceMetrics[];
    strugglingUsers: UserPerformanceMetrics[];
    mostImprovedUsers: UserPerformanceMetrics[];
    competencyGaps: string[];
    recommendations: string[];
  };
}

export interface BranchAnalytics {
  branchId: number;
  branchName: string;
  agencyId: number;
  agencyName: string;
  createdDate: string;
  isActive: boolean;
  metrics: BaseAnalyticsMetrics;
  performance: PerformanceComparison;
  teamPerformance: {
    teamId: number;
    teamName: string;
    metrics: BaseAnalyticsMetrics;
    memberCount: number;
    completionRate: number;
    averageScore: number;
    engagementRate: number;
    improvementTrend: 'up' | 'down' | 'stable';
    improvementValue: number;
  }[];
  userPerformance: UserPerformanceMetrics[];
  competencyOverview: {
    competencyId: number;
    competencyName: string;
    category: string;
    averageScore: number;
    completionRate: number;
    compliantUsers: number;
    needsAttentionUsers: number;
    overdueUsers: number;
  }[];
  sequencePerformance: {
    sequenceId: number;
    sequenceTitle: string;
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    averageScore: number;
    averageTimeToComplete: number;
    retakeRate: number;
  }[];
  recentActivity: ActivityEvent[];
  upcomingDeadlines: DeadlineEvent[];
  insights: {
    topPerformingTeams: { teamId: number; teamName: string; completionRate: number; }[];
    strugglingTeams: { teamId: number; teamName: string; completionRate: number; }[];
    mostImprovedTeams: { teamId: number; teamName: string; improvementRate: number; }[];
    competencyGaps: string[];
    recommendations: string[];
  };
}

export interface AgencyAnalytics {
  agencyId: number;
  agencyName: string;
  createdDate: string;
  subscriptionPlan: string;
  isActive: boolean;
  metrics: BaseAnalyticsMetrics;
  performance: PerformanceComparison;
  branchPerformance: {
    branchId: number;
    branchName: string;
    metrics: BaseAnalyticsMetrics;
    teamCount: number;
    userCount: number;
    completionRate: number;
    averageScore: number;
    engagementRate: number;
    improvementTrend: 'up' | 'down' | 'stable';
    improvementValue: number;
  }[];
  teamPerformance: {
    teamId: number;
    teamName: string;
    branchId: number;
    branchName: string;
    metrics: BaseAnalyticsMetrics;
    memberCount: number;
    completionRate: number;
    averageScore: number;
    engagementRate: number;
  }[];
  userPerformance: UserPerformanceMetrics[];
  competencyOverview: {
    competencyId: number;
    competencyName: string;
    category: string;
    averageScore: number;
    completionRate: number;
    compliantUsers: number;
    needsAttentionUsers: number;
    overdueUsers: number;
  }[];
  sequencePerformance: {
    sequenceId: number;
    sequenceTitle: string;
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    averageScore: number;
    averageTimeToComplete: number;
    retakeRate: number;
  }[];
  recentActivity: ActivityEvent[];
  upcomingDeadlines: DeadlineEvent[];
  insights: {
    topPerformingBranches: { branchId: number; branchName: string; completionRate: number; }[];
    strugglingBranches: { branchId: number; branchName: string; completionRate: number; }[];
    mostImprovedBranches: { branchId: number; branchName: string; improvementRate: number; }[];
    topPerformingTeams: { teamId: number; teamName: string; branchName: string; completionRate: number; }[];
    competencyGaps: string[];
    recommendations: string[];
  };
}

export interface AnalyticsFilters {
  timeRange: AnalyticsTimeRange;
  userRoles?: string[];
  discipline?: string;
  competencies?: string[];
  sequences?: number[];
  teams?: number[];
  branches?: number[];
  includeInactive?: boolean;
  minCompletionRate?: number;
  maxCompletionRate?: number;
  minScore?: number;
  maxScore?: number;
}

export interface AnalyticsExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeUserDetails: boolean;
  includeCompetencyDetails: boolean;
  includeActivityLog: boolean;
  customDateRange?: AnalyticsTimeRange;
}

export interface AnalyticsReport {
  reportId: string;
  generatedDate: string;
  generatedBy: number;
  reportType: 'agency' | 'branch' | 'team' | 'user';
  entityId: number;
  entityName: string;
  timeRange: AnalyticsTimeRange;
  filters: AnalyticsFilters;
  data: AgencyAnalytics | BranchAnalytics | TeamAnalytics | UserPerformanceMetrics;
  exportOptions: AnalyticsExportOptions;
  downloadUrl?: string;
  expiresAt: string;
}

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  executionTime: number;
  cacheHit: boolean;
}