// types/index.ts

export type AgencyType = "HOME_HEALTH" | "HOME_CARE" | "HOSPICE" | "SKILLED_NURSING" | "OTHER";
export type SubscriptionPlan = "BASIC" | "PREMIUM" | "ENTERPRISE" | "TRIAL";
export type UserRole = "SUPERADMIN" | "EDUCATOR" | "ADMIN" | "DIRECTOR" | "CLINICAL_MANAGER" | "FIELD_CLINICIAN" | "PRECEPTOR" | "SCHEDULER";
export type Discipline = "RN" | "PT" | "OT" | "SLP" | "LPN" | "HHA" | "MSW" | "OTA" | "PTA";
export type CertificationType = "OPTION1" | "OPTION2" | "OPTION3";
export type SequenceStatus = "DRAFT" | "GENERATING" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

// Enum version for runtime use
export const SequenceStatusEnum = {
  DRAFT: "DRAFT" as const,
  GENERATING: "GENERATING" as const,
  REVIEW: "REVIEW" as const,
  PUBLISHED: "PUBLISHED" as const,
  ARCHIVED: "ARCHIVED" as const,
} as const;

// ✅ CERTIFICATION DISPLAY NAMES
export const CertificationDisplayNames: Record<CertificationType, string> = {
  OPTION1: "Option 1",
  OPTION2: "Option 2", 
  OPTION3: "Option 3",
} as const;
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
export type HuddleType = "INTRO" | "STANDARD" | "ASSESSMENT" | "SUMMARY";
export type HuddleReleaseStatus = "NOT_RELEASED" | "RELEASED" | "SCHEDULED" | "CANCELLED";
export type EventType = "VIEW" | "DOWNLOAD" | "PLAY_AUDIO" | "PAUSE_AUDIO" | "ASSESSMENT_START" | "ASSESSMENT_SUBMIT" | "FEEDBACK_SUBMIT" | "SEQUENCE_START" | "SEQUENCE_COMPLETE";
export type AccessScope = "AGENCY" | "BRANCH" | "TEAM";
export type TargetType = "DISCIPLINE" | "ROLE";
export type FrequencyType = "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY" | "INTERVAL" | "CUSTOM";
export type ScheduleStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED";
export type CalendarEventType = "huddle_release" | "assessment_due" | "sequence_start" | "sequence_end";
export type CalendarEventStatus = "upcoming" | "active" | "completed" | "overdue";

// HuddleCombination interface for role-discipline combinations
export interface HuddleCombination {
  combinationId: number;
  sequenceId: number;
  userRole: UserRole;
  discipline: Discipline;
  orderIndex: number;
  huddles: Huddle[];
  createdAt: string;
  updatedAt: string;
  title?: string;
  totalHuddles?: number;
  description?: string;
}

export interface Agency {
  agencyId: number;
  name: string;
  ccn: string;
  agencyType: AgencyType;
  subscriptionPlan: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  userCount: number;
  isActive: boolean;
}

export interface CreateAgencyRequest {
  name: string;
  ccn?: string;
  agencyType: AgencyType;
  subscriptionPlan?: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive?: boolean;
}

export interface Branch {
  branchId: number;
  agencyId: number;
  name: string;
  location?: string; // Legacy field
  ccn?: string;
  ccnNumber?: string; // Enhanced CCN field
  
  // Geographic information (required)
  state: string;
  city: string;
  zipCode: string;
  fullAddress?: string; // Backend sends this computed field
  address?: string;
  
  // Branch-specific disciplines
  disciplines: Discipline[];
  disciplineDisplayNames?: string[];
  
  // ✅ CERTIFICATION SUPPORT
  hasCertifications?: boolean;
  certifications?: CertificationType[];
  
  // Counters
  teamCount?: number;
  userCount?: number;
  educatorCount?: number;
  
  // Metadata
  agencyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBranchRequest {
  agencyId: number;
  name: string;
  location?: string;
  ccn?: string;
  ccnNumber?: string;
  
  // Geographic information (required)
  state: string;
  city: string;
  zipCode: string;
  address?: string;
  
  // Selected disciplines for this branch
  selectedDisciplines: Discipline[];
  
  // ✅ CERTIFICATION SUPPORT
  hasCertifications?: boolean;
  selectedCertifications?: CertificationType[];
}

export interface Team {
  teamId: number;
  branchId: number;
  branchName?: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface CreateTeamRequest {
  branchId: number;
  name: string;
  description?: string;
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
  isInvited?: boolean;
  hasCompletedAgencySetup?: boolean;
  agencyId?: number; // Current agency ID for compatibility
  assignments: UserAssignment[];
}

export interface CreateUserRequest {
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
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
  roles: UserRole[];
  discipline?: Discipline;
  primaryRole?: UserRole;
  activeRole?: UserRole; // Currently active role for this assignment
  isPrimary: boolean;
  accessScope: AccessScope;
  assignedAt: string;
  
  // Compatibility properties for existing code
  role?: UserRole; // Will be primaryRole or first role
  disciplines?: Discipline[]; // Will be array containing single discipline
}

export interface CreateAssignmentRequest {
  userId: number;
  agencyId: number;
  branchId?: number;
  teamId?: number;
  roles: UserRole[];
  discipline?: Discipline;
  primaryRole?: UserRole;
  isPrimary: boolean;
  
  // Compatibility properties for existing code
  role?: UserRole; // Will be primaryRole or first role
  disciplines?: Discipline[]; // Will be array containing single discipline
}

export interface SequenceTarget {
  targetId: number;
  targetType: TargetType;
  targetValue: string;
  targetDisplayName: string;
}

export interface CreateSequenceTargetRequest {
  targetType: TargetType;
  targetValue: string;
}

export interface HuddleSequence {
  sequenceId: number;
  agencyId: number;
  agencyName: string;
  
  // Branch information for branch-specific sequences
  branchId?: number;
  branchName?: string;
  branchState?: string;
  branchCity?: string;
  
  title: string;
  description?: string;
  topic?: string;
  totalHuddles: number;
  estimatedDurationMinutes?: number;
  sequenceStatus: SequenceStatus;
  status: SequenceStatus; // alias for compatibility
  generationPrompt?: string;
  createdByUserId: number;
  createdByUserName: string;
  publishedByUserId?: number;
  publishedByUserName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  huddles?: Huddle[];
  targets?: SequenceTarget[];
  combinations?: HuddleCombination[];
  targetRoles?: UserRole[];
  targetDisciplines?: Discipline[];
  objectives?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDuration?: number;
  scheduledPublishDate?: string;
  canEdit?: boolean;
  branchDisplayName?: string;
  branchCcn?: string;
  totalCombinations?: number;
}

export interface CreateSequenceRequest {
  agencyId: number;
  branchId: number; // Required for branch-specific sequences
  title: string;
  description?: string;
  topic?: string;
  numberOfHuddles?: number;
  estimatedDurationMinutes?: number;
  
  // Branch context data for API generation
  branchState?: string;
  branchCcn?: string;
  
  // Scheduling Information
  releaseDate?: string;
  releaseTime?: string;
  frequency?: FrequencyType;
  autoPublish?: boolean;
  
  // Enhanced Target Audience (branch-filtered)
  targets?: CreateSequenceTargetRequest[];
  targetRoles?: UserRole[];
  targetDisciplines?: Discipline[];
  
  // RAG Integration
  ragGenerationPrompt?: string;
  ragMetadata?: Record<string, any>;
  
  // Legacy fields
  objectives?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDuration?: number;
  scheduledPublishDate?: string;
  createdBy: string;
}

// ⭐ FIXED: Delivery Schedule Interface with Sequential Huddle Release
export interface DeliverySchedule {
  scheduleId: number;
  sequenceId: number;
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime?: string;
  timeZone?: string;
  autoPublish?: boolean;
  sendNotifications?: boolean;
  scheduleStatus: ScheduleStatus;
  nextExecutionTime?: string;
  lastExecutionTime?: string;
  executionCount: number;
  maxExecutions?: number;
  
  // ⭐ SEQUENTIAL HUDDLE TRACKING
  currentHuddleIndex: number; // Which huddle to release next (0-based)
  
  daysOfWeek?: string[];
  intervalDays?: number;
  isActive?: boolean;
  createdAt?: string;
  
  // ⭐ HELPER METHODS FOR DISPLAY
  currentHuddleProgress?: string; // "Huddle 3 of 5"
  hasAllHuddlesReleased?: boolean;
}

export interface CreateScheduleRequest {
  sequenceId: number;
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime?: string;
  timeZone?: string;
  autoPublish?: boolean;
  sendNotifications?: boolean;
  maxExecutions?: number;
  daysOfWeek?: string[];
  intervalDays?: number;
  isActive?: boolean;
}

// ⭐ COMBINATION SCHEDULE INTERFACES (Series-Episode Model)
// Each role-discipline combination has its own independent episode release schedule

export interface CombinationSchedule {
  combinationScheduleId: number;
  combinationId: number;
  sequenceId: number; // Computed from combination
  
  // ⭐ SERIES-EPISODE TRACKING
  currentHuddleIndex: number; // Which episode (0-based) to release next
  totalHuddlesInCombination: number; // Total episodes in this series
  
  // SCHEDULE PATTERN
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime?: string;
  timeZone: string;
  daysOfWeek?: string[];
  cronExpression?: string;
  
  // AUTOMATION SETTINGS
  autoPublish: boolean;
  sendNotifications: boolean;
  notificationHoursBefore: number;
  reminderHoursBefore: number;
  
  // EXECUTION TRACKING
  nextExecutionTime?: string;
  lastExecutionTime?: string;
  scheduleStatus: ScheduleStatus;
  executionCount: number;
  
  // ERROR TRACKING
  lastErrorMessage?: string;
  consecutiveFailures: number;
  
  // METADATA
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCombinationScheduleRequest {
  combinationId: number;
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime?: string;
  timeZone?: string;
  daysOfWeek?: string[];
  autoPublish?: boolean;
  sendNotifications?: boolean;
  notificationHoursBefore?: number;
  reminderHoursBefore?: number;
}

export interface UpdateCombinationScheduleRequest {
  frequencyType?: FrequencyType;
  startDate?: string;
  endDate?: string;
  releaseTime?: string;
  timeZone?: string;
  daysOfWeek?: string[];
  autoPublish?: boolean;
  sendNotifications?: boolean;
  notificationHoursBefore?: number;
  reminderHoursBefore?: number;
}

// ⭐ SERIES-EPISODE DISPLAY HELPERS
export interface CombinationScheduleWithDetails extends CombinationSchedule {
  // Series information
  seriesTitle: string; // Role-Discipline display name
  currentEpisodeTitle: string; // Next huddle title
  episodeProgress: string; // "Episode 3 of 5"
  hasAllEpisodesReleased: boolean;
  
  // Combination details
  userRole: UserRole;
  discipline: Discipline;
  combinationKey: string; // "RN_EDUCATOR"
  
  // Sequence details
  sequenceTitle: string;
  sequenceBranchName?: string;
}

// ⭐ SCHEDULE STATISTICS (for analytics)
export interface ScheduleStatistics {
  totalSeries: number;
  activeSeries: number;
  pausedSeries: number;
  completedSeries: number;
  totalEpisodes: number;
  releasedEpisodes: number;
  pendingEpisodes: number;
  completionPercentage: number;
}

// ⭐ BULK SCHEDULE OPERATIONS
export interface BulkScheduleRequest {
  sequenceId: number;
  templateSchedule: CreateCombinationScheduleRequest;
}

export interface BulkScheduleResponse {
  createdSchedules: CombinationSchedule[];
  skippedCombinations: string[]; // Combinations that already had schedules
  errors: string[];
}

// ⭐ USER-SPECIFIC SCHEDULE FILTERING
export interface UserScheduleFilter {
  userId: number;
  role?: UserRole;
  discipline?: Discipline;
  agencyId?: number;
  branchId?: number;
  includeCompleted?: boolean;
}

// RAG Integration Interfaces
export interface RAGGenerationRequest {
  sequenceTitle: string;
  topic: string;
  numberOfHuddles: number;
  targetRoles: UserRole[];
  targetDisciplines: Discipline[];
  estimatedDurationMinutes?: number;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  objectives?: string[];
  agencyType?: AgencyType;
}

export interface RAGGenerationResponse {
  generationId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  huddles: RAGHuddleContent[];
  metadata?: Record<string, any>;
  errorMessage?: string;
}

export interface RAGHuddleContent {
  title: string;
  description: string;
  orderIndex: number;
  pdfContent: string;
  voiceOverScript: string;
  keyPoints: string[];
  estimatedDurationMinutes: number;
  huddleType: HuddleType;
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
  canEdit?: boolean;
  hasPdf?: boolean;
  hasVoiceScript?: boolean;
  description?: string;
  totalHuddles?: number;
  combination?: HuddleCombination;
  getRoleDisciplineDisplay?: () => string;
}

export interface CreateHuddleRequest {
  sequenceId: number;
  title: string;
  orderIndex: number;
  contentJson?: string;
  voiceScript?: string;
  durationMinutes?: number;
  huddleType: HuddleType;
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
}

export interface UpdateProgressRequest {
  userId: number;
  huddleId: number;
  completionPercentage: number;
  timeSpentMinutes?: number;
}

export interface SequenceProgress {
  sequenceProgressId: number;
  userId: number;
  userName: string;
  sequenceId: number;
  sequenceTitle: string;
  agencyId: number;
  agencyName: string;
  totalHuddles: number;
  completedHuddles: number;
  completionPercentage: number;
  totalTimeSpentMinutes: number;
  averageScore?: number;
  sequenceStatus: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  lastAccessed: string;
}

// Note: Duplicate interface definitions removed above

export interface Analytics {
  agencyId: number;
  period: string;
  generatedAt: string;
  metrics: {
    totalSequences: number;
    totalUsers: number;
    activeUsers: number;
    completedSequences: number;
    inProgressSequences: number;
    totalViews: number;
    totalDownloads: number;
    totalAssessments: number;
    activeUserRate: number;
    completionRate: number;
    activeSequences?: number;
    dailyEngagement: [string, number][];
  };
}

export interface UserInvitation {
  invitationId: string;
  email: string;
  name: string;
  agencyId?: number; // Optional - null until agency is created
  agencyName?: string; // Returns intended agency name if agency not created yet
  intendedAgencyName: string;
  intendedAgencyType: AgencyType;
  role: UserRole;
  roleName: string;
  invitedByUserId: number;
  invitedByUserName: string;
  invitationToken: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  name: string;
  intendedAgencyName: string;
  intendedAgencyType: AgencyType;
  role: UserRole;
  invitedByUserId: number;
}

export interface CreateUserInvitationRequest {
  email: string;
  name: string;
  agencyId: number;
  role: UserRole;
  invitedByUserId: number;
}

export interface Assessment {
  assessmentId: number;
  huddleId: number;
  title: string;
  description?: string;
  instructions?: string;
  estimatedMinutes?: number;
  questions: AssessmentQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  randomizeQuestions?: boolean;
  showResultsImmediately?: boolean;
  status?: string;
  totalPoints?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Helper fields from backend
  huddleTitle?: string;
  sequenceTitle?: string;
  sequenceId?: number;
  averageScore?: number;
}

export interface AssessmentQuestion {
  questionId: number;
  assessmentId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
  points?: number;
}

export interface CreateAssessmentRequest {
  huddleId: number;
  title: string;
  description?: string;
  instructions?: string;
  estimatedMinutes?: number;
  questions: CreateAssessmentQuestionRequest[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  randomizeQuestions?: boolean;
  showResultsImmediately?: boolean;
}

export interface CreateAssessmentQuestionRequest {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
  points?: number;
}

// Calendar and Scheduling Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  eventDate?: Date; // Alias for date
  type: CalendarEventType;
  huddleId?: number;
  sequenceId?: number;
  sequenceTitle?: string;
  status?: CalendarEventStatus;
  description?: string;
  durationMinutes?: number;
  completed?: boolean;
  branchName?: string;
  dueDate?: Date;
}

export interface ScheduledHuddle {
  id: string;
  huddleId: number;
  sequenceId: number;
  title: string;
  sequenceTitle: string;
  scheduledDate: Date;
  releaseDate: Date;
  isReleased: boolean;
  status: CalendarEventStatus;
  description?: string;
  durationMinutes?: number;
  isAssignedToUser: boolean;
}

export interface UserDeadline {
  id: string;
  title: string;
  dueDate: Date;
  type: 'assessment' | 'sequence' | 'huddle';
  huddleId?: number;
  sequenceId?: number;
  assessmentId?: number;
  status: CalendarEventStatus;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface UserAssessmentAttempt {
  attemptId: number;
  userId: number;
  assessmentId: number;
  huddleId?: number;
  sequenceId?: number;
  score: number;
  answers: Record<number, string>;
  startedAt: string;
  completedAt?: string;
  isPassed: boolean;
  passed?: boolean;
  timeSpent?: number;
  assessmentTitle?: string;
  timeSpentMinutes?: number;
}

export interface AssessmentAttempt {
  attemptId: number;
  userId: number;
  assessmentId: number;
  score: number;
  answers: Record<number, string>;
  startedAt: string;
  completedAt?: string;
  isPassed: boolean;
  passed: boolean;
  timeSpent: number;
}

export interface AssessmentAssignment {
  assignmentId: number;
  assessmentId: number;
  huddleId: number;
  sequenceId?: number;
  title: string;
  description?: string;
  huddleTitle: string;
  sequenceTitle: string;
  questionsCount: number;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  assignedDate: string;
  isRequired: boolean;
  triggerType: 'POST_HUDDLE' | 'SCHEDULED' | 'MANUAL';
  status: string;
  attemptCount: number;
  bestScore?: number;
  isPassed: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  status: number;
  path?: string;
  fieldErrors?: Record<string, string>;
}

// User Huddle Types for Role-Based Dashboards
export interface UserHuddle {
  sequenceId: number;
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDurationMinutes: number;
  totalHuddles: number;
  completedHuddles: number;
  completionPercentage: number;
  userRole: UserRole;
  userDiscipline: Discipline;
  isRequired: boolean;
  dueDate?: string;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
  nextHuddleTitle?: string;
  nextHuddleId?: number;
  isCompleted: boolean;
  isOverdue: boolean;
  progressStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

export interface UserHuddleDashboard {
  role: UserRole;
  huddles: {
    notStarted: UserHuddle[];
    inProgress: UserHuddle[];
    completed: UserHuddle[];
    overdue: UserHuddle[];
    all: UserHuddle[];
  };
  statistics: {
    totalSequences: number;
    completedSequences: number;
    inProgressSequences: number;
    overdueSequences: number;
    totalHuddles: number;
    completedHuddles: number;
    overallCompletionPercentage: number;
  };
}

export interface UserHuddleStats {
  totalSequences: number;
  completedSequences: number;
  overdueSequences: number;
  inProgressSequences: number;
  totalHuddles: number;
  completedHuddles: number;
  overallCompletionPercentage: number;
  userRole: UserRole;
}