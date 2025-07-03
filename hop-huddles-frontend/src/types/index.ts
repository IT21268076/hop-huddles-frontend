// types/index.ts - Updated Type Definitions
// Core Entity Types
export interface Agency {
  agencyId: number;
  name: string;
  ccn?: string; // Optional for enterprise agencies
  agencyType: AgencyType;
  subscriptionPlan: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  userCount: number;
  agencyStructure: "SINGLE" | "ENTERPRISE"; // Enhanced structure type
  isActive: boolean;
  settings?: AgencySettings;
}

export interface AgencySettings {
  allowMultipleRoles: boolean;
  requireDisciplineForRoles: string[];
  autoHuddleRelease: boolean;
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
  };
}

export interface Branch {
  branchId: number;
  agencyId: number;
  name: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ccn: string; // Required for all branches
  leaderId?: number; // Director assignment
  settings?: BranchSettings;
}

export interface BranchSettings {
  autoAssignNewUsers: boolean;
  defaultUserRoles: UserRole[];
  huddleVisibilityScope: 'BRANCH_ONLY' | 'AGENCY_WIDE';
}

export interface Team {
  teamId: number;
  branchId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  leaderId?: number; // Clinical Manager assignment
  targetDisciplines?: Discipline[];
  maxMembers?: number;
}

export interface User {
  userId: number;
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
  lastLogin?: string;
  createdAt: string;
  assignments: UserAssignment[];
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notificationSettings: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    huddleReleases?: boolean;
    completionReminders?: boolean;
    achievementUnlocks?: boolean;
    weeklyDigest?: boolean;
    reminderTiming?: number;
  };
  huddleSettings: {
    autoPlay: boolean;
    playbackSpeed: number;
    preferredLanguage: string;
    showTranscripts?: boolean;
    enableCaptions?: boolean;
    playbackQuality?: 'low' | 'medium' | 'high';
  };
  dashboardLayout: 'compact' | 'detailed' | 'cards';
  dashboardSettings?: {
    showQuickStats?: boolean;
    showRecentProgress?: boolean;
    showUpcomingHuddles?: boolean;
    defaultView?: 'overview' | 'progress' | 'sequences';
    widgetOrder?: string[];
  };
  appearance?: {
    theme?: 'light' | 'dark' | 'auto';
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
    fontSize?: 'small' | 'medium' | 'large';
    density?: 'compact' | 'comfortable' | 'spacious';
  };
  privacy?: {
    shareProgressWithTeam?: boolean;
    allowPerformanceComparisons?: boolean;
    shareAchievements?: boolean;
    dataAnalyticsOptIn?: boolean;
  };
}

export interface UserAssignment {
  assignmentId: number;
  userId: number;
  userName: string;
  agencyId: number;
  agencyName: string;
  branchId?: number;
  branchName?: string;
  teamId?: number;
  teamName?: string;
  role: UserRole; // Primary role for backward compatibility
  roles: UserRole[]; // Multiple roles support
  discipline?: Discipline; // Primary discipline for backward compatibility
  disciplines: Discipline[]; // Multiple disciplines support
  isPrimary: boolean;
  isLeader: boolean; // For Director/Clinical Manager identification
  accessScope: AccessScope;
  assignedAt: string;
  assignedBy: number;
  isActive: boolean;
  permissions?: AssignmentPermissions;
}

// Updated UserRole enum with exactly 6 roles as specified
export type UserRole = 
  | "EDUCATOR"           // Full system access including huddle creation and agency management
  | "ADMIN"              // Full system access except huddle creation
  | "DIRECTOR"           // Branch leader with full branch management capabilities
  | "CLINICAL_MANAGER"   // Team leader with team management capabilities
  | "FIELD_CLINICIAN"    // Clinical staff member providing direct patient care
  | "SUPERADMIN";        // System-wide administrative access

// Updated Discipline enum
export type Discipline = 
  | "RN"     // Registered Nurse
  | "PT"     // Physical Therapist
  | "OT"     // Occupational Therapist
  | "SLP"    // Speech-Language Pathologist
  | "LPN"    // Licensed Practical Nurse
  | "HHA"    // Home Health Aide
  | "MSW"    // Medical Social Worker
  | "OTHER"; // Other disciplines

// Rest of the types remain the same as in the previous types file...
export interface Agency {
  agencyId: number;
  name: string;
  ccn?: string; // Optional for enterprise agencies
  agencyType: AgencyType;
  subscriptionPlan: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  userCount: number;
  agencyStructure: "SINGLE" | "ENTERPRISE"; // Enhanced structure type
  isActive: boolean;
  settings?: AgencySettings;
}

export interface AgencySettings {
  allowMultipleRoles: boolean;
  requireDisciplineForRoles: string[];
  autoHuddleRelease: boolean;
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
  };
}

export interface Branch {
  branchId: number;
  agencyId: number;
  name: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ccn: string; // Required for all branches
  leaderId?: number; // Director assignment
  settings?: BranchSettings;
}

export interface BranchSettings {
  autoAssignNewUsers: boolean;
  defaultUserRoles: UserRole[];
  huddleVisibilityScope: 'BRANCH_ONLY' | 'AGENCY_WIDE';
}

export interface Team {
  teamId: number;
  branchId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  leaderId?: number; // Clinical Manager assignment
  targetDisciplines?: Discipline[];
  maxMembers?: number;
}

export interface User {
  userId: number;
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
  lastLogin?: string;
  createdAt: string;
  assignments: UserAssignment[];
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notificationSettings: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    huddleReleases?: boolean;
    completionReminders?: boolean;
    achievementUnlocks?: boolean;
    weeklyDigest?: boolean;
    reminderTiming?: number;
  };
  huddleSettings: {
    autoPlay: boolean;
    playbackSpeed: number;
    preferredLanguage: string;
    showTranscripts?: boolean;
    enableCaptions?: boolean;
    playbackQuality?: 'low' | 'medium' | 'high';
  };
  dashboardLayout: 'compact' | 'detailed' | 'cards';
  dashboardSettings?: {
    showQuickStats?: boolean;
    showRecentProgress?: boolean;
    showUpcomingHuddles?: boolean;
    defaultView?: 'overview' | 'progress' | 'sequences';
    widgetOrder?: string[];
  };
  appearance?: {
    theme?: 'light' | 'dark' | 'auto';
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
    fontSize?: 'small' | 'medium' | 'large';
    density?: 'compact' | 'comfortable' | 'spacious';
  };
  privacy?: {
    shareProgressWithTeam?: boolean;
    allowPerformanceComparisons?: boolean;
    shareAchievements?: boolean;
    dataAnalyticsOptIn?: boolean;
  };
}

export interface AssignmentPermissions {
  canViewAllBranches: boolean;
  canViewAllTeams: boolean;
  canManageUsers: boolean;
  canCreateHuddles: boolean;
  canManageSchedules: boolean;
  restrictedActions?: string[];
}

// Enhanced Request/Response Types
export interface CreateUserRequest {
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface CreateAssignmentRequest {
  userId: number;
  agencyId: number;
  branchId?: number;
  teamId?: number;
  role: UserRole; // Primary role
  roles: UserRole[]; // Multiple roles
  discipline?: Discipline; // Primary discipline
  disciplines: Discipline[]; // Multiple disciplines
  isPrimary: boolean;
  isLeader: boolean;
  permissions?: Partial<AssignmentPermissions>;
}

// UI State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentAgency: Agency | null;
  loading: boolean;
  permissions: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

// Enhanced User Assignment with multiple roles support
export interface UserAssignment {
  assignmentId: number;
  userId: number;
  userName: string;
  agencyId: number;
  agencyName: string;
  branchId?: number;
  branchName?: string;
  teamId?: number;
  teamName?: string;
  role: UserRole; // Primary role for backward compatibility
  roles: UserRole[]; // Multiple roles support
  discipline?: Discipline; // Primary discipline for backward compatibility
  disciplines: Discipline[]; // Multiple disciplines support
  isPrimary: boolean;
  isLeader: boolean; // For Director/Clinical Manager identification
  accessScope: AccessScope;
  assignedAt: string;
  assignedBy: number;
  isActive: boolean;
  permissions?: AssignmentPermissions;
}

export interface AssignmentPermissions {
  canViewAllBranches: boolean;
  canViewAllTeams: boolean;
  canManageUsers: boolean;
  canCreateHuddles: boolean;
  canManageSchedules: boolean;
  restrictedActions?: string[];
}

export interface HuddleSequence {
  sequenceId: number;
  agencyId: number;
  agencyName: string;
  title: string;
  description?: string;
  topic?: string;
  totalHuddles: number;
  estimatedDurationMinutes?: number;
  sequenceStatus: SequenceStatus;
  generationPrompt?: string;
  createdByUserId: number;
  createdByUserName: string;
  publishedByUserId?: number;
  publishedByUserName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  huddles: Huddle[];
  targets: SequenceTarget[];
  schedule?: DeliverySchedule;
  analytics?: SequenceAnalytics;
  visibility: VisibilitySettings;
}

export interface VisibilitySettings {
  isPublic: boolean;
  targetRules: TargetRule[];
  accessConditions?: AccessCondition[];
  releaseSchedule?: ReleaseSchedule;
}

export interface TargetRule {
  ruleId: string;
  type: 'INCLUDE' | 'EXCLUDE';
  targetType: TargetType;
  targetValues: string[];
  conditions?: {
    minExperience?: number;
    requiredCertifications?: string[];
    departmentRestrictions?: string[];
  };
}

export interface AccessCondition {
  conditionType: 'PREREQUISITE' | 'SCHEDULE' | 'APPROVAL';
  value: string;
  description: string;
}

export interface ReleaseSchedule {
  startDate: string;
  endDate?: string;
  releasePattern: 'IMMEDIATE' | 'SEQUENTIAL' | 'SCHEDULED';
  intervalDays?: number;
  timeOfDay?: string;
  timezone: string;
}

export interface Huddle {
  huddleId: number;
  sequenceId: number;
  sequenceTitle: string;
  title: string;
  orderIndex: number;
  contentJson?: string;
  voiceScript?: string;
  pdfUrl?: string;
  audioUrl?: string;
  durationMinutes?: number;
  huddleType: HuddleType;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  prerequisites?: number[]; // Other huddle IDs that must be completed first
  visibility?: HuddleVisibility;
  analytics?: HuddleAnalytics;
}

export interface HuddleVisibility {
  isReleased: boolean;
  releaseDate?: string;
  visibleToUsers: number[];
  restrictedUsers: number[];
}

export interface HuddleAnalytics {
  totalViews: number;
  totalCompletions: number;
  averageCompletionTime: number;
  averageScore?: number;
  engagementRate: number;
}

export interface SequenceTarget {
  targetId: number;
  targetType: TargetType;
  targetValue: string;
  targetDisplayName: string;
  priority: number; // For ordering multiple targets
  isRequired: boolean; // Whether this target is mandatory or optional
}

export interface UserProgress {
  progressId: number;
  userId: number;
  userName: string;
  huddleId: number;
  huddleTitle: string;
  sequenceId: number;
  sequenceTitle: string;
  progressStatus: ProgressStatus;
  completionPercentage: number;
  timeSpentMinutes: number;
  assessmentScore?: number;
  assessmentAttempts: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessed: string;
  feedback?: string;
  interactions?: ProgressInteraction[];
}

export interface ProgressInteraction {
  interactionId: number;
  interactionType: 'VIEW' | 'PAUSE' | 'RESUME' | 'COMPLETE' | 'ASSESSMENT';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DeliverySchedule {
  scheduleId: number;
  sequenceId: number;
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime: string;
  daysOfWeek?: string[];
  timeZone: string;
  autoPublish: boolean;
  sendNotifications: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  inAppNotifications: boolean;
  reminderTiming: number; // Hours before release
  escalationSettings?: {
    enabled: boolean;
    escalateAfterHours: number;
    escalateToRoles: UserRole[];
  };
}

export interface SequenceAnalytics {
  totalUsers: number;
  completedUsers: number;
  inProgressUsers: number;
  notStartedUsers: number;
  averageCompletionTime: number;
  completionRate: number;
  engagementMetrics: {
    totalViews: number;
    averageSessionTime: number;
    dropOffPoints: number[];
  };
}

// Enhanced Enum Types
export type AgencyType = "SINGLE_AGENCY" | "ENTERPRISE" | "HOME_HEALTH" | "HOME_CARE" | "HOSPICE" | "SKILLED_NURSING" | "OTHER";

export type SubscriptionPlan = "BASIC" | "PREMIUM" | "ENTERPRISE" | "TRIAL";

export type AccessScope = "AGENCY" | "BRANCH" | "TEAM";

export type SequenceStatus = "DRAFT" | "GENERATING" | "REVIEW" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";

export type HuddleType = "INTRO" | "STANDARD" | "ASSESSMENT" | "SUMMARY" | "INTERACTIVE";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";

export type TargetType = "DISCIPLINE" | "ROLE" | "BRANCH" | "TEAM" | "USER" | "CUSTOM";

export type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "ONE_TIME";

// Enhanced Request/Response Types
export interface CreateAgencyRequest {
  name: string;
  ccn?: string; // Optional for enterprise
  agencyType: AgencyType;
  agencyStructure: "SINGLE" | "ENTERPRISE";
  subscriptionPlan: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  settings?: Partial<AgencySettings>;
}

export interface CreateBranchRequest {
  agencyId: number;
  name: string;
  location?: string;
  ccn: string; // Required for all branches
  leaderId?: number;
  isActive?: boolean; // Default to true
  settings?: Partial<BranchSettings>;
}

export interface CreateTeamRequest {
  branchId: number;
  name: string;
  description?: string;
  leaderId?: number;
  targetDisciplines?: Discipline[];
  maxMembers?: number;
}

export interface CreateUserRequest {
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface CreateAssignmentRequest {
  userId: number;
  agencyId: number;
  branchId?: number;
  teamId?: number;
  role: UserRole; // Primary role
  roles: UserRole[]; // Multiple roles
  discipline?: Discipline; // Primary discipline
  disciplines: Discipline[]; // Multiple disciplines
  isPrimary: boolean;
  isLeader: boolean;
  permissions?: Partial<AssignmentPermissions>;
}

export interface CreateSequenceRequest {
  agencyId: number;
  title: string;
  description?: string;
  topic?: string;
  estimatedDurationMinutes?: number;
  targets: {
    targetType: TargetType;
    targetValue: string;
    priority?: number;
    isRequired?: boolean;
  }[];
  visibility?: Partial<VisibilitySettings>;
  schedule?: Partial<DeliverySchedule>;
}

export interface CreateHuddleRequest {
  sequenceId: number;
  title: string;
  orderIndex: number;
  contentJson?: string;
  voiceScript?: string;
  durationMinutes?: number;
  huddleType: HuddleType;
  prerequisites?: number[];
  visibility?: Partial<HuddleVisibility>;
}

export interface CreateScheduleRequest {
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime: string;
  daysOfWeek?: string[];
  timeZone: string;
  autoPublish: boolean;
  sendNotifications: boolean;
  notificationSettings?: Partial<NotificationSettings>;
}

// UI State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentAgency: Agency | null;
  loading: boolean;
  permissions: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

// Analytics and Reporting Types
export interface AgencyAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalSequences: number;
  publishedSequences: number;
  totalHuddles: number;
  completedHuddles: number;
  averageEngagement: number;
  topPerformingSequences: HuddleSequence[];
  userProgressOverview: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export interface UserAnalytics {
  totalAssignedHuddles: number;
  completedHuddles: number;
  inProgressHuddles: number;
  averageScore: number;
  totalTimeSpent: number;
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  achievementId: number;
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt: string;
  category: 'COMPLETION' | 'ENGAGEMENT' | 'PERFORMANCE' | 'STREAK';
}

export interface BulkNotificationRequest {
  userIds: number[];
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  scheduleFor?: string;
}

// Add these assessment-related types to your existing src/types/index.ts file

// // Assessment System Types
// export interface Assessment {
//   assessmentId: number;
//   agencyId: number;
//   title: string;
//   description?: string;
//   linkedHuddleId?: number;
//   linkedSequenceId?: number;
//   timeLimit?: number; // in minutes
//   passingScore: number; // percentage (0-100)
//   maxAttempts: number;
//   allowRetake: boolean;
//   retakeDelay: number; // hours before retake allowed
//   randomizeQuestions: boolean;
//   showResults: boolean;
//   autoAssign: boolean; // auto-assign when linked huddle is completed
//   status: AssessmentStatus;
//   questions: AssessmentQuestion[];
//   createdByUserId: number;
//   createdAt: string;
//   updatedAt: string;
// }

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AssessmentQuestion {
  questionId: number;
  assessmentId?: number;
  questionText: string;
  questionType: QuestionType;
  points: number;
  required: boolean;
  orderIndex: number;
  options: QuestionOption[];
  explanation?: string;
  metadata?: {
    category?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    tags?: string[];
  };
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'FILL_BLANK';

export interface QuestionOption {
  optionId: number;
  questionId?: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
  explanation?: string;
}

export interface AssessmentResult {
  resultId: number;
  assessmentId: number;
  userId: number;
  userName: string;
  status: AssessmentResultStatus;
  score?: number; // percentage (0-100)
  maxPossibleScore: number;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number; // in minutes
  answers: AssessmentAnswer[];
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
  canRetake: boolean;
  nextRetakeAllowed?: string;
}

export type AssessmentResultStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'GRADING_REQUIRED';

export interface AssessmentAnswer {
  answerId: number;
  resultId: number;
  questionId: number;
  questionType: QuestionType;
  selectedOptions?: number[]; // for multiple choice
  textAnswer?: string; // for text-based questions
  isCorrect?: boolean;
  pointsEarned: number;
  timeSpent?: number; // seconds spent on this question
  submittedAt: string;
}

export interface AssessmentAssignment {
  assignmentId: number;
  assessmentId: number;
  userId: number;
  assignedBy: number;
  assignedAt: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'OVERDUE';
  autoAssigned: boolean; // true if assigned by system after huddle completion
  sourceHuddleId?: number; // if auto-assigned from huddle completion
  notificationSent: boolean;
  remindersSent: number;
}

// Enhanced Progress Tracking Types
export interface EnhancedUserProgress extends UserProgress {
  assessmentResults?: AssessmentResult[];
  learningPath?: {
    totalHuddles: number;
    completedHuddles: number;
    currentLevel: string;
    nextMilestone?: string;
    estimatedCompletion?: string;
  };
  achievements?: Achievement[];
  streaks?: {
    currentStreak: number;
    longestStreak: number;
    lastActivity?: string;
  };
}

export interface Achievement {
  achievementId: number;
  userId: number;
  type: AchievementType;
  title: string;
  description: string;
  iconUrl?: string;
  earnedAt: string;
  progress?: number; // 0-100 for progress-based achievements
  metadata?: Record<string, any>;
}

export type AchievementType = 
  | 'FIRST_HUDDLE' 
  | 'SEQUENCE_COMPLETE' 
  | 'PERFECT_SCORE' 
  | 'STREAK_WEEK' 
  | 'STREAK_MONTH' 
  | 'MENTOR' 
  | 'EARLY_ADOPTER'
  | 'ASSESSMENT_ACE';

// Enhanced Analytics Types
export interface RoleBasedAnalytics {
  userId: number;
  userRole: UserRole;
  accessScope: AccessScope;
  timeframe: AnalyticsTimeframe;
  metrics: AnalyticsMetrics;
  comparisons?: AnalyticsComparisons;
  trends?: AnalyticsTrends;
}

export interface AnalyticsMetrics {
  engagement?: {
    totalLogins: number;
    averageSessionDuration: number;
    lastLoginDate?: string;
    activeStreak: number;
  };
  progress?: {
    huddlesCompleted: number;
    huddlesAssigned: number;
    completionRate: number;
    averageScore: number;
    timeSpentLearning: number; // in minutes
  };
  assessments?: {
    assessmentsCompleted: number;
    assessmentsAssigned: number;
    averageAssessmentScore: number;
    passRate: number;
    retakeRate: number;
  };
  team?: {
    teamSize?: number;
    teamCompletionRate?: number;
    teamAverageScore?: number;
    topPerformers?: string[];
    strugglingMembers?: string[];
  };
  management?: {
    usersManaged?: number;
    huddlesCreated?: number;
    assessmentsCreated?: number;
    contentEngagement?: number;
  };
}

export interface AnalyticsComparisons {
  vsTeamAverage?: number;
  vsBranchAverage?: number;
  vsAgencyAverage?: number;
  vsIndustryBenchmark?: number;
  ranking?: {
    position: number;
    total: number;
    percentile: number;
  };
}

export interface AnalyticsTrends {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dataPoints: AnalyticsDataPoint[];
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  changePercentage: number;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  metric: string;
  metadata?: Record<string, any>;
}

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';

// Auto-Assignment Rules
export interface AutoAssignmentRule {
  ruleId: number;
  agencyId: number;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: AssignmentTrigger;
  conditions: AssignmentCondition[];
  actions: AssignmentAction[];
  priority: number;
  createdBy: number;
  createdAt: string;
  lastTriggered?: string;
  timesTriggered: number;
}

export interface AssignmentTrigger {
  type: 'HUDDLE_COMPLETION' | 'SEQUENCE_COMPLETION' | 'ROLE_ASSIGNMENT' | 'TIME_BASED' | 'MANUAL';
  huddleId?: number;
  sequenceId?: number;
  targetRoles?: UserRole[];
  targetDisciplines?: Discipline[];
  delay?: number; // minutes after trigger event
}

export interface AssignmentCondition {
  type: 'SCORE_THRESHOLD' | 'COMPLETION_TIME' | 'ATTEMPT_COUNT' | 'USER_ATTRIBUTE';
  operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: string | number;
  attribute?: string;
}

export interface AssignmentAction {
  type: 'ASSIGN_ASSESSMENT' | 'ASSIGN_HUDDLE' | 'SEND_NOTIFICATION' | 'UPDATE_PROGRESS' | 'AWARD_ACHIEVEMENT';
  targetId?: number; // assessmentId, huddleId, etc.
  parameters?: Record<string, any>;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Notification System Types
export interface Notification {
  notificationId: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  metadata?: {
    assessmentId?: number;
    huddleId?: number;
    sequenceId?: number;
    [key: string]: any;
  };
}

export type NotificationType = 
  | 'ASSESSMENT_ASSIGNED'
  | 'ASSESSMENT_DUE'
  | 'ASSESSMENT_OVERDUE'
  | 'ASSESSMENT_PASSED'
  | 'ASSESSMENT_FAILED'
  | 'ASSESSMENT_RETAKE_AVAILABLE'
  | 'HUDDLE_ASSIGNED'
  | 'HUDDLE_COMPLETED'
  | 'SEQUENCE_COMPLETED'
  | 'ACHIEVEMENT_EARNED'
  | 'SYSTEM_UPDATE'
  | 'ROLE_CHANGED';

// Enhanced User Preferences
export interface EnhancedUserPreferences extends UserPreferences {
  notifications?: {
    email?: {
      assessmentAssigned?: boolean;
      assessmentDue?: boolean;
      assessmentResults?: boolean;
      huddleAssigned?: boolean;
      achievements?: boolean;
      weeklyDigest?: boolean;
    };
    push?: {
      assessmentReminders?: boolean;
      dueDateAlerts?: boolean;
      achievementNotifications?: boolean;
    };
    frequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  };
  learning?: {
    preferredTimeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING';
    sessionDuration?: number; // minutes
    reminderSchedule?: string[];
    autoAdvance?: boolean;
    showHints?: boolean;
  };
  dashboard?: {
    defaultView?: 'OVERVIEW' | 'PROGRESS' | 'ASSESSMENTS' | 'ANALYTICS';
    showCompletionStats?: boolean;
    showTeamComparisons?: boolean;
    showUpcomingTasks?: boolean;
  };
}

// API Response Types
export interface AssessmentListResponse {
  assessments: Assessment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AssessmentResultsResponse {
  results: AssessmentResult[];
  analytics: {
    totalAssigned: number;
    completed: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
  };
}

export interface AssessmentStatsResponse {
  assessmentId: number;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  passed: number;
  failed: number;
  averageScore: number;
  averageAttempts: number;
  averageTimeSpent: number;
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  totalAnswered: number;
  correctAnswers: number;
  averageTimeSpent: number;
  difficultyRating: number; // 0-1 based on success rate
  optionStats?: OptionStats[];
}

export interface OptionStats {
  optionId: number;
  optionText: string;
  selectedCount: number;
  isCorrect: boolean;
  percentage: number;
}

export interface CreateAssessmentRequest {
  title: string;
  description: string;
  huddleId: number;
  assessmentType: 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED';
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  autoAssign: boolean;
  isActive: boolean;
  dueDate?: string;
  instructions: string;
  questions: AssessmentQuestion[];
  targetRoles: string[];
  targetDisciplines: string[];
}

export interface Assessment {
  assessmentId: number;
  title: string;
  description: string;
  huddleId: number;
  huddleTitle: string;
  sequenceId: number;
  sequenceTitle: string;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  totalAssigned: number;
  totalCompleted: number;
  averageScore: number;
  assessmentType: 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED';
  autoAssign: boolean;
  dueDate?: string;
}

export interface MyHuddleSequence {
  sequenceId: number;
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  totalHuddles: number;
  completedHuddles: number;
  estimatedDuration: number;
  dueDate?: string;
  assignedDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number;
  lastAccessed?: string;
  nextHuddleId?: number;
  nextHuddleTitle?: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  certificateEligible: boolean;
  huddles: Huddle[];
}

export interface LearningGoal {
  goalId: number;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  relatedSequences: number[];
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
}

export interface VisibilityRule {
  ruleId: string;
  name: string;
  type: 'INCLUDE' | 'EXCLUDE';
  targetType: 'ROLE' | 'DISCIPLINE' | 'BRANCH' | 'TEAM' | 'USER';
  targetValues: string[];
  conditions?: {
    minExperience?: number;
    requiredCertifications?: string[];
    departmentRestrictions?: string[];
    completionRequirements?: string[];
  };
  priority: number;
  isActive: boolean;
}

export interface HuddleAssignment {
  assignmentId: string;
  userId: number;
  userName: string;
  userEmail: string;
  branchName?: string;
  teamName?: string;
  role: string;
  discipline: string;
  assignedAt: string;
  dueDate?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'EXEMPTED';
  progress: number;
  lastAccessed?: string;
  completedAt?: string;
  score?: number;
  attempts: number;
  assignedBy: string;
}