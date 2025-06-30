// Core Entity Types
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
  agencyStructure: "SINGLE" | "ENTERPRISE";
}

export interface Branch {
  branchId: number;
  agencyId: number;
  name: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ccn: string;
}

export interface Team {
  teamId: number;
  branchId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  discipline?: Discipline;
  role: UserRole;
  isPrimary: boolean;
  accessScope: AccessScope;
  assignedAt: string;
  roles: UserRole[]; // Changed from single role to array
  disciplines?: Discipline[]; // Changed from single to array
  isLeader: boolean; // For Director/Clinical Manager identification
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
  huddles: Huddle[];
  targets: SequenceTarget[];
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
}

export interface SequenceTarget {
  targetId: number;
  targetType: TargetType;
  targetValue: string;
  targetDisplayName: string;
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

export interface DeliverySchedule {
  scheduleId: number;
  sequenceId: number;
  frequencyType: FrequencyType;
  startDate: string;
  releaseTime: string;
  daysOfWeek?: string[];
  timeZone: string;
  autoPublish: boolean;
  sendNotifications: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enum Types
export type AgencyType = "SINGLE_AGENCY" | "ENTERPRISE" | "HOME_HEALTH" | "HOME_CARE" | "HOSPICE" | "SKILLED_NURSING" | "OTHER";

export type SubscriptionPlan = "BASIC" | "PREMIUM" | "ENTERPRISE" | "TRIAL";

export type UserRole = "ADMIN" | "EDUCATOR" | "DIRECTOR" | "CLINICAL_MANAGER" | "BRANCH_MANAGER" | "FIELD_CLINICIAN" | "PRECEPTOR" | "LEARNER" | "SCHEDULER" | "INTAKE_COORDINATOR";

export type Discipline = "RN" | "PT" | "OT" | "SLP" | "LPN" | "HHA" | "MSW" | "OTHER";

export type AccessScope = "AGENCY" | "BRANCH" | "TEAM";

export type SequenceStatus = "DRAFT" | "GENERATING" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

export type HuddleType = "INTRO" | "STANDARD" | "ASSESSMENT" | "SUMMARY";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export type TargetType = "DISCIPLINE" | "ROLE" | "BRANCH" | "TEAM";

export type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

// Request/Response Types
export interface CreateAgencyRequest {
  name: string;
  ccn: string;
  agencyType: AgencyType;
  subscriptionPlan: SubscriptionPlan;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface CreateBranchRequest {
  agencyId: number;
  name: string;
  location?: string;
}

export interface CreateTeamRequest {
  branchId: number;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  auth0Id: string;
  email: string;
  name: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface CreateAssignmentRequest {
  userId: number;
  agencyId: number;
  branchId?: number;
  teamId?: number;
  role: UserRole;
  discipline?: Discipline;
  isPrimary: boolean;
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
  }[];
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

export interface CreateScheduleRequest {
  frequencyType: FrequencyType;
  startDate: string;
  releaseTime: string;
  daysOfWeek?: string[];
  timeZone: string;
  autoPublish: boolean;
  sendNotifications: boolean;
}

// UI State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentAgency: Agency | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}