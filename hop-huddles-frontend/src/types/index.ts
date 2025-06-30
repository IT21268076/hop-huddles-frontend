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
  };
  huddleSettings: {
    autoPlay: boolean;
    playbackSpeed: number;
    preferredLanguage: string;
  };
  dashboardLayout: 'compact' | 'detailed' | 'cards';
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

export type UserRole = 
  | "EDUCATOR" 
  | "ADMIN" 
  | "DIRECTOR" 
  | "CLINICAL_MANAGER" 
  | "BRANCH_MANAGER" 
  | "FIELD_CLINICIAN" 
  | "PRECEPTOR" 
  | "LEARNER" 
  | "SCHEDULER" 
  | "INTAKE_COORDINATOR"


export type Discipline = "RN" | "PT" | "OT" | "SLP" | "LPN" | "HHA" | "MSW" | "OTHER";

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

// Notification Types
export interface Notification {
  notificationId: number;
  userId: number;
  type: 'HUDDLE_RELEASED' | 'SEQUENCE_COMPLETED' | 'REMINDER' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface BulkNotificationRequest {
  userIds: number[];
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  scheduleFor?: string;
}