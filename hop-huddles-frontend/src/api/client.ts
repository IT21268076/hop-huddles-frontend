// api/client.ts - Enhanced with user management methods
import axios, { type AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type {
    Agency,
    Branch,
    Team,
    User,
    UserAssignment,
    HuddleSequence,
    Huddle,
    UserProgress,
    DeliverySchedule,
    CreateAgencyRequest,
    CreateBranchRequest,
    CreateTeamRequest,
    CreateUserRequest,
    CreateAssignmentRequest,
    CreateSequenceRequest,
    CreateHuddleRequest,
    CreateScheduleRequest,
    ApiError,
    SequenceStatus,
    SequenceTarget,
    UserPreferences,
    Assessment,
    AssessmentAssignment,
    AssessmentResult,
    CreateAssessmentRequest,
    HuddleAssignment,
    LearningGoal,
    MyHuddleSequence,
    SequenceAnalytics,
    UserRole,
    VisibilityRule,
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiError;

      switch (status) {
        case 401:
          toast.error('Unauthorized. Please login again.');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          toast.error(data.message || 'Validation failed.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An unexpected error occurred.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
  }

  // Agency Management
  async createAgency(agency: CreateAgencyRequest): Promise<Agency> {
    const response = await this.client.post<Agency>('/agencies', agency);
    return response.data;
  }

  async getAgency(agencyId: number): Promise<Agency> {
    const response = await this.client.get<Agency>(`/agencies/${agencyId}`);
    return response.data;
  }

  async getAgencies(): Promise<Agency[]> {
    const response = await this.client.get<Agency[]>('/agencies');
    return response.data;
  }

  async updateAgency(agencyId: number, agency: Partial<CreateAgencyRequest>): Promise<Agency> {
    const response = await this.client.put<Agency>(`/agencies/${agencyId}`, agency);
    return response.data;
  }

  async deleteAgency(agencyId: number): Promise<void> {
    await this.client.delete(`/agencies/${agencyId}`);
  }

  // Branch Management
  async createBranch(branch: CreateBranchRequest): Promise<Branch> {
    const response = await this.client.post<Branch>('/branches', branch);
    return response.data;
  }

  async getBranch(branchId: number): Promise<Branch> {
    const response = await this.client.get<Branch>(`/branches/${branchId}`);
    return response.data;
  }

  async getBranchesByAgency(agencyId: number): Promise<Branch[]> {
    const response = await this.client.get<Branch[]>(`/branches/agency/${agencyId}`);
    return response.data;
  }

  async updateBranch(branchId: number, branch: Partial<CreateBranchRequest>): Promise<Branch> {
    const response = await this.client.put<Branch>(`/branches/${branchId}`, branch);
    return response.data;
  }

  async deleteBranch(branchId: number): Promise<void> {
    await this.client.delete(`/branches/${branchId}`);
  }

  // Team Management
  async createTeam(team: CreateTeamRequest): Promise<Team> {
    const response = await this.client.post<Team>('/teams', team);
    return response.data;
  }

  async getTeam(teamId: number): Promise<Team> {
    const response = await this.client.get<Team>(`/teams/${teamId}`);
    return response.data;
  }

  async getTeamsByBranch(branchId: number): Promise<Team[]> {
    const response = await this.client.get<Team[]>(`/teams/branch/${branchId}`);
    return response.data;
  }

  // NEW: Get teams by agency
  async getTeamsByAgency(agencyId: number): Promise<Team[]> {
    const response = await this.client.get<Team[]>(`/teams/agency/${agencyId}`);
    return response.data;
  }

  async updateTeam(teamId: number, team: Partial<CreateTeamRequest>): Promise<Team> {
    const response = await this.client.put<Team>(`/teams/${teamId}`, team);
    return response.data;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.client.delete(`/teams/${teamId}`);
  }

  // ===== ENHANCED USER MANAGEMENT METHODS =====
  
  // User Management
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.client.post<User>('/users', userData);
    return response.data;
  }

  async getUser(userId: number): Promise<User> {
    const response = await this.client.get<User>(`/users/${userId}`);
    return response.data;
  }

  async getUsersByAgency(agencyId: number): Promise<User[]> {
    const response = await this.client.get<User[]>(`/users/agency/${agencyId}`);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.client.put<User>(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/users/${userId}`);
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    const response = await this.client.patch<User>(`/users/${userId}/status`, { isActive });
    return response.data;
  }

  // Assignment Management
  async createAssignment(assignmentData: CreateAssignmentRequest): Promise<UserAssignment> {
    const response = await this.client.post<UserAssignment>('/assignments', assignmentData);
    return response.data;
  }

  async getAssignment(assignmentId: number): Promise<UserAssignment> {
    const response = await this.client.get<UserAssignment>(`/assignments/${assignmentId}`);
    return response.data;
  }

  async getAssignmentsByUser(userId: number): Promise<UserAssignment[]> {
    const response = await this.client.get<UserAssignment[]>(`/assignments/user/${userId}`);
    return response.data;
  }

  async getAssignmentsByAgency(agencyId: number): Promise<UserAssignment[]> {
    const response = await this.client.get<UserAssignment[]>(`/assignments/agency/${agencyId}`);
    return response.data;
  }

  async updateAssignment(assignmentId: number, assignmentData: Partial<CreateAssignmentRequest>): Promise<UserAssignment> {
    const response = await this.client.put<UserAssignment>(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.client.delete(`/assignments/${assignmentId}`);
  }

  async bulkAssignUsers(assignments: CreateAssignmentRequest[]): Promise<UserAssignment[]> {
    const response = await this.client.post<UserAssignment[]>('/assignments/bulk', { assignments });
    return response.data;
  }

  // Branch Leader Management
  async assignBranchLeader(branchId: number, userId: number): Promise<UserAssignment> {
    const response = await this.client.post<UserAssignment>(`/branches/${branchId}/leader`, { userId });
    return response.data;
  }

  async assignTeamLeader(teamId: number, userId: number): Promise<UserAssignment> {
    const response = await this.client.post<UserAssignment>(`/teams/${teamId}/leader`, { userId });
    return response.data;
  }

  // ===== END ENHANCED USER MANAGEMENT METHODS =====

  // Sequence Management
  async createSequence(sequence: CreateSequenceRequest): Promise<HuddleSequence> {
    const response = await this.client.post<HuddleSequence>('/sequences', sequence);
    return response.data;
  }

  async getSequence(sequenceId: number): Promise<HuddleSequence> {
    const response = await this.client.get<HuddleSequence>(`/sequences/${sequenceId}`);
    return response.data;
  }

  async getSequencesByAgency(agencyId: number): Promise<HuddleSequence[]> {
    const response = await this.client.get<HuddleSequence[]>(`/sequences/agency/${agencyId}`);
    return response.data;
  }

  async updateSequence(sequenceId: number, sequence: Partial<CreateSequenceRequest>): Promise<HuddleSequence> {
    const response = await this.client.put<HuddleSequence>(`/sequences/${sequenceId}`, sequence);
    return response.data;
  }

  async deleteSequence(sequenceId: number): Promise<void> {
    await this.client.delete(`/sequences/${sequenceId}`);
  }

  async updateSequenceStatus(sequenceId: number, status: SequenceStatus): Promise<HuddleSequence> {
    const response = await this.client.patch<HuddleSequence>(`/sequences/${sequenceId}/status`, { status });
    return response.data;
  }

  // Huddle Management
  async createHuddle(huddle: CreateHuddleRequest): Promise<Huddle> {
    const response = await this.client.post<Huddle>('/huddles', huddle);
    return response.data;
  }

  async getHuddle(huddleId: number): Promise<Huddle> {
    const response = await this.client.get<Huddle>(`/huddles/${huddleId}`);
    return response.data;
  }

  async getHuddlesBySequence(sequenceId: number): Promise<Huddle[]> {
    const response = await this.client.get<Huddle[]>(`/huddles/sequence/${sequenceId}`);
    return response.data;
  }

  async updateHuddle(huddleId: number, huddle: Partial<CreateHuddleRequest>): Promise<Huddle> {
    const response = await this.client.put<Huddle>(`/huddles/${huddleId}`, huddle);
    return response.data;
  }

  async deleteHuddle(huddleId: number): Promise<void> {
    await this.client.delete(`/huddles/${huddleId}`);
  }

  async updateHuddleContent(huddleId: number, content: { contentJson?: string; voiceScript?: string }): Promise<Huddle> {
    const response = await this.client.put<Huddle>(`/huddles/${huddleId}/content`, content);
    return response.data;
  }

  // Progress Management
  async startHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    const response = await this.client.post<UserProgress>(`/progress/start?userId=${userId}&huddleId=${huddleId}`);
    return response.data;
  }

  async updateProgress(progress: { userId: number; huddleId: number; completionPercentage: number; timeSpentMinutes: number }): Promise<UserProgress> {
    const response = await this.client.put<UserProgress>('/progress/update', progress);
    return response.data;
  }

  async completeHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    const response = await this.client.post<UserProgress>(`/progress/complete?userId=${userId}&huddleId=${huddleId}`);
    return response.data;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const response = await this.client.get<UserProgress[]>(`/progress/user/${userId}`);
    return response.data;
  }

  // Scheduling
  async createSchedule(sequenceId: number, schedule: CreateScheduleRequest): Promise<DeliverySchedule> {
    const response = await this.client.post<DeliverySchedule>(`/schedules/sequence/${sequenceId}`, schedule);
    return response.data;
  }

  async getSchedulesBySequence(sequenceId: number): Promise<DeliverySchedule[]> {
    const response = await this.client.get<DeliverySchedule[]>(`/schedules/sequence/${sequenceId}`);
    return response.data;
  }

  async pauseSchedule(scheduleId: number): Promise<void> {
    await this.client.post(`/schedules/${scheduleId}/pause`);
  }

  async resumeSchedule(scheduleId: number): Promise<void> {
    await this.client.post(`/schedules/${scheduleId}/resume`);
  }

  // Analytics Methods
  async getProgressByAgency(agencyId: number, filters?: any): Promise<UserProgress[]> {
    const response = await this.client.get<UserProgress[]>(`/progress/agency/${agencyId}`, { params: filters });
    return response.data;
  }

  async getUserAnalytics(agencyId: number): Promise<Record<number, any>> {
    const response = await this.client.get<Record<number, any>>(`/analytics/users/agency/${agencyId}`);
    return response.data;
  }

  async getHuddleAnalytics(agencyId: number): Promise<Record<number, any>> {
    const response = await this.client.get<Record<number, any>>(`/analytics/huddles/agency/${agencyId}`);
    return response.data;
  }

  async getBranchAnalytics(agencyId: number): Promise<Record<number, any>> {
    const response = await this.client.get<Record<number, any>>(`/analytics/branches/agency/${agencyId}`);
    return response.data;
  }

  // Sequence Management Enhancements
  async updateSequenceTargets(sequenceId: number, targets: SequenceTarget[]): Promise<SequenceTarget[]> {
    const response = await this.client.put<SequenceTarget[]>(`/sequences/${sequenceId}/targets`, { targets });
    return response.data;
  }

  async createOrUpdateSchedule(sequenceId: number, schedule: Partial<DeliverySchedule>): Promise<DeliverySchedule> {
    const response = await this.client.put<DeliverySchedule>(`/sequences/${sequenceId}/schedule`, schedule);
    return response.data;
  }

  async getSequenceSchedule(sequenceId: number): Promise<DeliverySchedule | null> {
    try {
      const response = await this.client.get<DeliverySchedule>(`/sequences/${sequenceId}/schedule`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  // User Preferences
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    const response = await this.client.get<UserPreferences>(`/users/${userId}/preferences`);
    return response.data;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<UserPreferences> {
    const response = await this.client.put<UserPreferences>(`/users/${userId}/preferences`, preferences);
    return response.data;
  }

  async resetUserPreferencesToDefaults(userId: number): Promise<UserPreferences> {
    const response = await this.client.post<UserPreferences>(`/users/${userId}/preferences/reset`);
    return response.data;
  }

  // User Invitation (placeholder for future implementation)
  async inviteUser(invitationData: {
    email: string;
    name: string;
    agencyId: number;
    invitedBy: number;
    role?: string;
    personalMessage?: string;
  }): Promise<{ success: boolean; invitationId: string }> {
    const response = await this.client.post<{ success: boolean; invitationId: string }>('/users/invite', invitationData);
    return response.data;
  }

  // Assessment CRUD Operations
  async createAssessment(assessmentData: CreateAssessmentRequest): Promise<Assessment> {
    const response = await this.client.post<Assessment>('/assessments', assessmentData);
    return response.data;
  }

  async getAssessment(assessmentId: number): Promise<Assessment> {
    const response = await this.client.get<Assessment>(`/assessments/${assessmentId}`);
    return response.data;
  }

  async getAssessmentsByAgency(agencyId: number): Promise<Assessment[]> {
    const response = await this.client.get<Assessment[]>(`/assessments/agency/${agencyId}`);
    return response.data;
  }

  async getAssessmentsBySequence(sequenceId: number): Promise<Assessment[]> {
    const response = await this.client.get<Assessment[]>(`/assessments/sequence/${sequenceId}`);
    return response.data;
  }

  async updateAssessment(assessmentId: number, assessmentData: Partial<CreateAssessmentRequest>): Promise<Assessment> {
    const response = await this.client.put<Assessment>(`/assessments/${assessmentId}`, assessmentData);
    return response.data;
  }

  async deleteAssessment(assessmentId: number): Promise<void> {
    await this.client.delete(`/assessments/${assessmentId}`);
  }

  async toggleAssessmentStatus(assessmentId: number, isActive: boolean): Promise<Assessment> {
    const response = await this.client.patch<Assessment>(`/assessments/${assessmentId}/status`, { isActive });
    return response.data;
  }

  async duplicateAssessment(assessmentId: number): Promise<Assessment> {
    const response = await this.client.post<Assessment>(`/assessments/${assessmentId}/duplicate`);
    return response.data;
  }

  // Assessment Assignment & Results
  async assignAssessment(assessmentId: number, userIds: number[]): Promise<AssessmentAssignment[]> {
    const response = await this.client.post<AssessmentAssignment[]>(`/assessments/${assessmentId}/assign`, { userIds });
    return response.data;
  }

  async getAssessmentResults(assessmentId: number): Promise<AssessmentResult[]> {
    const response = await this.client.get<AssessmentResult[]>(`/assessments/${assessmentId}/results`);
    return response.data;
  }

  async getUserAssessments(userId: number, status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'): Promise<UserAssessment[]> {
    const params = status ? { status } : {};
    const response = await this.client.get<UserAssessment[]>(`/users/${userId}/assessments`, { params });
    return response.data;
  }

  async submitAssessmentResponse(assessmentId: number, userId: number, responses: AssessmentResponse[]): Promise<AssessmentResult> {
    const response = await this.client.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, {
      userId,
      responses
    });
    return response.data;
  }

  async getAssessmentAttempts(assessmentId: number, userId: number): Promise<AssessmentAttempt[]> {
    const response = await this.client.get<AssessmentAttempt[]>(`/assessments/${assessmentId}/users/${userId}/attempts`);
    return response.data;
  }

  // ===== HUDDLE VISIBILITY & ASSIGNMENT METHODS =====

  // Sequence Visibility Management
  async updateSequenceVisibility(sequenceId: number, visibilitySettings: {
    rules: VisibilityRule[];
    schedule: AssignmentSchedule;
  }): Promise<void> {
    await this.client.put(`/sequences/${sequenceId}/visibility`, visibilitySettings);
  }

  async getSequenceVisibility(sequenceId: number): Promise<{
    rules: VisibilityRule[];
    schedule: AssignmentSchedule;
  }> {
    const response = await this.client.get(`/sequences/${sequenceId}/visibility`);
    return response.data;
  }

  // Sequence Assignment Management
  async getSequenceAssignments(sequenceId: number, filters?: {
    status?: string;
    branch?: string;
    team?: string;
    role?: string;
  }): Promise<HuddleAssignment[]> {
    const response = await this.client.get<HuddleAssignment[]>(`/sequences/${sequenceId}/assignments`, { params: filters });
    return response.data;
  }

  async bulkAssignSequence(sequenceId: number, assignmentData: {
    userIds: number[];
    dueDate?: string;
    assignedBy: number;
  }): Promise<HuddleAssignment[]> {
    const response = await this.client.post<HuddleAssignment[]>(`/sequences/${sequenceId}/assign`, assignmentData);
    return response.data;
  }

  async removeSequenceAssignment(assignmentId: string): Promise<void> {
    await this.client.delete(`/assignments/${assignmentId}`);
  }

  async updateSequenceAssignment(assignmentId: string, updates: {
    dueDate?: string;
    status?: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'EXEMPTED';
  }): Promise<HuddleAssignment> {
    const response = await this.client.patch<HuddleAssignment>(`/assignments/${assignmentId}`, updates);
    return response.data;
  }

  // Target User Calculation
  async getTargetUsers(agencyId: number, visibilityRules: VisibilityRule[]): Promise<User[]> {
    const response = await this.client.post<User[]>(`/agencies/${agencyId}/target-users`, { visibilityRules });
    return response.data;
  }

  // ===== FIELD CLINICIAN LEARNING METHODS =====

  // My Huddles Interface
  async getUserAssignedSequences(userId: number, filters?: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    category?: string;
  }): Promise<MyHuddleSequence[]> {
    const response = await this.client.get<MyHuddleSequence[]>(`/users/${userId}/assigned-sequences`, { params: filters });
    return response.data;
  }

  async getUserHuddleProgress(userId: number, sequenceId: number): Promise<SequenceProgress> {
    const response = await this.client.get<SequenceProgress>(`/users/${userId}/sequences/${sequenceId}/progress`);
    return response.data;
  }

  async updateUserHuddleProgress(userId: number, huddleId: number, progressData: {
    completionPercentage: number;
    timeSpentMinutes: number;
    lastAccessed: string;
  }): Promise<UserProgress> {
    const response = await this.client.put<UserProgress>(`/users/${userId}/huddles/${huddleId}/progress`, progressData);
    return response.data;
  }

  async startUserHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    const response = await this.client.post<UserProgress>(`/users/${userId}/huddles/${huddleId}/start`);
    return response.data;
  }

  async completeUserHuddle(userId: number, huddleId: number, completionData?: {
    score?: number;
    feedback?: string;
  }): Promise<UserProgress> {
    const response = await this.client.post<UserProgress>(`/users/${userId}/huddles/${huddleId}/complete`, completionData);
    return response.data;
  }

  // Learning Goals Management
  async getUserLearningGoals(userId: number): Promise<LearningGoal[]> {
    const response = await this.client.get<LearningGoal[]>(`/users/${userId}/learning-goals`);
    return response.data;
  }

  async createUserLearningGoal(userId: number, goalData: {
    title: string;
    description: string;
    targetDate: string;
    relatedSequences: number[];
  }): Promise<LearningGoal> {
    const response = await this.client.post<LearningGoal>(`/users/${userId}/learning-goals`, goalData);
    return response.data;
  }

  async updateUserLearningGoal(userId: number, goalId: number, updates: Partial<LearningGoal>): Promise<LearningGoal> {
    const response = await this.client.put<LearningGoal>(`/users/${userId}/learning-goals/${goalId}`, updates);
    return response.data;
  }

  async deleteUserLearningGoal(userId: number, goalId: number): Promise<void> {
    await this.client.delete(`/users/${userId}/learning-goals/${goalId}`);
  }

  // ===== ENHANCED ANALYTICS METHODS =====

  // Detailed Analytics
  async getBranchAnalyticsDetailed(branchId: number, timeRange?: string): Promise<BranchAnalytics> {
    const params = timeRange ? { timeRange } : {};
    const response = await this.client.get<BranchAnalytics>(`/analytics/branches/${branchId}`, { params });
    return response.data;
  }

  async getTeamAnalyticsDetailed(teamId: number, timeRange?: string): Promise<TeamAnalytics> {
    const params = timeRange ? { timeRange } : {};
    const response = await this.client.get<TeamAnalytics>(`/analytics/teams/${teamId}`, { params });
    return response.data;
  }

  async getUserProgressSummary(userId: number): Promise<UserProgressSummary> {
    const response = await this.client.get<UserProgressSummary>(`/analytics/users/${userId}/summary`);
    return response.data;
  }

  async getAgencyCompletionRates(agencyId: number, timeRange?: string): Promise<CompletionRateData> {
    const params = timeRange ? { timeRange } : {};
    const response = await this.client.get<CompletionRateData>(`/analytics/agencies/${agencyId}/completion-rates`, { params });
    return response.data;
  }

  async getSequenceAnalytics(sequenceId: number): Promise<SequenceAnalytics> {
    const response = await this.client.get<SequenceAnalytics>(`/analytics/sequences/${sequenceId}`);
    return response.data;
  }

  async getHuddleEngagementMetrics(huddleId: number): Promise<HuddleEngagementMetrics> {
    const response = await this.client.get<HuddleEngagementMetrics>(`/analytics/huddles/${huddleId}/engagement`);
    return response.data;
  }

  // ===== ROLE SWITCHING & PERSISTENCE =====

  // User Active Role Management
  async setUserActiveRole(userId: number, role: UserRole): Promise<void> {
    await this.client.patch(`/users/${userId}/active-role`, { role });
  }

  async getUserActiveRole(userId: number): Promise<UserRole | null> {
    try {
      const response = await this.client.get<{ role: UserRole }>(`/users/${userId}/active-role`);
      return response.data.role;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  // ===== SYSTEM CONFIGURATION =====

  // Invitation System
  async checkUserInvitation(email: string): Promise<{
    isInvited: boolean;
    agencyId?: number;
    invitedBy?: string;
    role?: string;
  }> {
    const response = await this.client.get(`/invitations/check`, { params: { email } });
    return response.data;
  }

  async getUserAgencyStatus(userId: number): Promise<{
    hasRegisteredAgency: boolean;
    agencyId?: number;
    agencyName?: string;
    isFirstTime: boolean;
  }> {
    const response = await this.client.get(`/users/${userId}/agency-status`);
    return response.data;
  }

  async markAgencyAsRegistered(agencyId: number): Promise<void> {
    await this.client.post(`/agencies/${agencyId}/mark-registered`);
  }

  // ===== BULK OPERATIONS =====

  // Bulk Assessment Operations
  async bulkToggleAssessments(assessmentIds: number[], isActive: boolean): Promise<void> {
    await this.client.patch('/assessments/bulk/toggle', { assessmentIds, isActive });
  }

  async bulkDeleteAssessments(assessmentIds: number[]): Promise<void> {
    await this.client.delete('/assessments/bulk', { data: { assessmentIds } });
  }

  async exportAssessmentData(assessmentIds: number[]): Promise<Blob> {
    const response = await this.client.post('/assessments/export', 
      { assessmentIds }, 
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Export Analytics Data
  async exportProgressData(agencyId: number, filters?: any): Promise<Blob> {
    const response = await this.client.get(`/analytics/agencies/${agencyId}/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
}

// Export the appropriate client based on environment
// export const apiClient = mockApiClient; // Using mock client for development

// Uncomment below for production use
export const apiClient = new ApiClient();