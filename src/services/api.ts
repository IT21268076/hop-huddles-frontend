// services/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
    Agency,
    CreateAgencyRequest,
    Branch,
    CreateBranchRequest,
    Team,
    CreateTeamRequest,
    User,
    CreateUserRequest,
    UserAssignment,
    CreateAssignmentRequest,
    HuddleSequence,
    CreateSequenceRequest,
    Huddle,
    CreateHuddleRequest,
    UserProgress,
    UpdateProgressRequest,
    SequenceProgress,
    DeliverySchedule,
    CreateScheduleRequest,
    CombinationSchedule,
    CreateCombinationScheduleRequest,
    UpdateCombinationScheduleRequest,
    CombinationScheduleWithDetails,
    ScheduleStatistics,
    BulkScheduleRequest,
    BulkScheduleResponse,
    UserScheduleFilter,
    Analytics,
    Assessment,
    CreateAssessmentRequest,
    UserAssessmentAttempt,
    SequenceStatus,
    UserRole,
    Discipline,
    CreateInvitationRequest,
    CreateUserInvitationRequest,
    UserInvitation,
    CalendarEvent,
    ScheduledHuddle,
    UserDeadline
} from '../types';

// Educator Branch Assignment Interfaces
export interface EducatorBranchAssignmentRequest {
  educatorId: number;
  branchId: number;
  assignmentNotes?: string;
}

export interface EducatorBranchAssignment {
  assignmentId: number;
  educatorId: number;
  educatorName: string;
  branchId: number;
  branchName: string;
  assignmentNotes?: string;
  assignedAt: string;
  assignedBy?: number;
}

export interface BranchSequenceCreateRequest {
  branchId: number;
  title: string;
  description?: string;
  topic: string;
  numberOfHuddlesPerCombination?: number;
  estimatedDurationMinutes?: number;
  targetRoles: UserRole[];
  targetDisciplines: Discipline[];
  generationPrompt: string;
  releaseDate?: Date;
  releaseTime?: string;
  frequency?: string;
}

export interface PersonalizedCalendarFilters {
  branch?: string;
  role?: UserRole | 'ALL';
  discipline?: Discipline | 'ALL';
  eventType?: string;
  showCompleted?: boolean;
}

export interface PlatformAnalytics {
  agencyId?: number;
  branchId?: number;
  userId?: number;
  scope: 'agency' | 'branch' | 'user';
  period: string;
  metrics: any;
  insights: any;
  generatedAt: string;
}

export class HopApiClient {
  private api: AxiosInstance;
  private getAccessToken?: () => Promise<string>;
  private currentUserId?: number;

  constructor(baseURL: string = 'http://localhost:8080/api/v1') {
    this.api = axios.create({
      baseURL,
      timeout: 10000, // 10 second timeout to prevent hanging requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token and dev user ID
    this.api.interceptors.request.use(async (config) => {
      if (this.getAccessToken) {
        try {
          const token = await this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get access token:', error);
        }
      }
      
      // Add development user ID header for backend user context
      if (this.currentUserId && process.env.NODE_ENV === 'development') {
        config.headers['X-Dev-User-Id'] = this.currentUserId.toString();
      }
      
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setAccessTokenGetter(getAccessToken: () => Promise<string>) {
    this.getAccessToken = getAccessToken;
  }

  setCurrentUserId(userId: number | undefined) {
    this.currentUserId = userId;
    console.log('🔧 DEV MODE: API client set current user ID to:', userId);
  }

  // User Authentication
  async getUserByEmail(email: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/email/${encodeURIComponent(email)}`);
    return response.data;
  }

  async createInvitedUser(userData: {
    email: string;
    name: string;
    auth0Id: string;
    invitationToken?: string;
  }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users/invited', userData);
    return response.data;
  }

  async completeAgencySetup(userId: number, agencyId?: number): Promise<User> {
    const url = `/users/${userId}/complete-agency-setup${agencyId ? `?agencyId=${agencyId}` : ''}`;
    const response: AxiosResponse<User> = await this.api.post(url);
    return response.data;
  }

  async sendUserInvitation(invitationData: CreateUserInvitationRequest): Promise<{ invitationId: string; invitationUrl: string }> {
    const response = await this.api.post('/invitations/send', invitationData);
    return response.data;
  }

  async validateInvitation(token: string): Promise<{
    isValid: boolean;
    email: string;
    agencyName: string;
    roleName: string;
  }> {
    const response = await this.api.get(`/invitations/validate/${token}`);
    return response.data;
  }

  // Agency Management
  async getAgencies(): Promise<Agency[]> {
    const response: AxiosResponse<Agency[]> = await this.api.get('/agencies');
    return response.data;
  }

  async getAllAgencies(): Promise<Agency[]> {
    const response: AxiosResponse<Agency[]> = await this.api.get('/agencies/all');
    return response.data;
  }

  async getAgencyById(agencyId: number): Promise<Agency> {
    const response: AxiosResponse<Agency> = await this.api.get(`/agencies/${agencyId}`);
    return response.data;
  }

  async createAgency(agency: CreateAgencyRequest): Promise<Agency> {
    const response: AxiosResponse<Agency> = await this.api.post('/agencies', agency);
    return response.data;
  }

  async updateAgency(agencyId: number, agency: Partial<CreateAgencyRequest>): Promise<Agency> {
    const response: AxiosResponse<Agency> = await this.api.put(`/agencies/${agencyId}`, agency);
    return response.data;
  }

  async deleteAgency(agencyId: number): Promise<void> {
    await this.api.delete(`/agencies/${agencyId}`);
  }

  async searchAgencies(params: {
    name?: string;
    agencyType?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: Agency[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get('/agencies/search', { params });
    return response.data;
  }

  // Branch Management
  async getBranchesByAgency(agencyId: number): Promise<Branch[]> {
    const response: AxiosResponse<Branch[]> = await this.api.get(`/branches/agency/${agencyId}`);
    return response.data;
  }

  // Get branches created by current EDUCATOR user (creator-based filtering)
  async getBranchesCreatedByMe(): Promise<Branch[]> {
    const response: AxiosResponse<Branch[]> = await this.api.get(`/branches/created-by-me`);
    return response.data;
  }

  async getBranchById(branchId: number): Promise<Branch> {
    const response: AxiosResponse<Branch> = await this.api.get(`/branches/${branchId}`);
    return response.data;
  }

  async createBranch(branch: CreateBranchRequest): Promise<Branch> {
    const response: AxiosResponse<Branch> = await this.api.post('/branches', branch);
    return response.data;
  }

  async updateBranch(branchId: number, branch: Partial<CreateBranchRequest>): Promise<Branch> {
    const response: AxiosResponse<Branch> = await this.api.put(`/branches/${branchId}`, branch);
    return response.data;
  }

  async deleteBranch(branchId: number): Promise<void> {
    await this.api.delete(`/branches/${branchId}`);
  }

  // Team Management
  async getTeamsByBranch(branchId: number): Promise<Team[]> {
    const response: AxiosResponse<Team[]> = await this.api.get(`/teams/branch/${branchId}`);
    return response.data;
  }

  async getTeamsByAgency(agencyId: number): Promise<Team[]> {
    const response: AxiosResponse<Team[]> = await this.api.get(`/teams/agency/${agencyId}`);
    return response.data;
  }

  async getTeamById(teamId: number): Promise<Team> {
    const response: AxiosResponse<Team> = await this.api.get(`/teams/${teamId}`);
    return response.data;
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    const response: AxiosResponse<Team> = await this.api.post('/teams', team);
    return response.data;
  }

  async updateTeam(teamId: number, team: Partial<CreateTeamRequest>): Promise<Team> {
    const response: AxiosResponse<Team> = await this.api.put(`/teams/${teamId}`, team);
    return response.data;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.api.delete(`/teams/${teamId}`);
  }

  // Sequence Management Extensions
  async deleteSequence(sequenceId: number): Promise<void> {
    await this.api.delete(`/sequences/${sequenceId}`);
  }

  async duplicateSequence(sequenceId: number, newTitle: string): Promise<HuddleSequence> {
    const response: AxiosResponse<HuddleSequence> = await this.api.post(`/sequences/${sequenceId}/duplicate`, { title: newTitle });
    return response.data;
  }

  async getSequenceAssignments(sequenceId: number): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/sequences/${sequenceId}/assignments`);
    return response.data;
  }

  // User Management
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users');
    return response.data;
  }

  async getUserById(userId: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async getUsersByAgency(agencyId: number): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/users/agency/${agencyId}`);
    return response.data;
  }

  async getEducatorsByAgency(agencyId: number): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/users/agency/${agencyId}/educators`);
    return response.data;
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', user);
    return response.data;
  }

  async updateUser(userId: number, user: Partial<CreateUserRequest>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${userId}`, user);
    return response.data;
  }

  async searchUsersInAgency(agencyId: number, params: {
    searchTerm?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: User[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/users/agency/${agencyId}/search`, { params });
    return response.data;
  }

  // User Assignment Management
  async getAssignmentsByUser(userId: number): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/assignments/user/${userId}`);
    return response.data;
  }

  async getAssignmentsByAgency(agencyId: number): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/assignments/agency/${agencyId}`);
    return response.data;
  }

  async getAssignmentsByAgencyAndRole(agencyId: number, role: UserRole): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/assignments/agency/${agencyId}/role/${role}`);
    return response.data;
  }

  async createAssignment(assignment: CreateAssignmentRequest): Promise<UserAssignment> {
    const response: AxiosResponse<UserAssignment> = await this.api.post('/assignments', assignment);
    return response.data;
  }

  async updateAssignment(assignmentId: number, assignment: Partial<CreateAssignmentRequest>): Promise<UserAssignment> {
    const response: AxiosResponse<UserAssignment> = await this.api.put(`/assignments/${assignmentId}`, assignment);
    return response.data;
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.api.delete(`/assignments/${assignmentId}`);
  }

  // Leader Management
  async getBranchLeader(branchId: number): Promise<UserAssignment | null> {
    try {
      const response: AxiosResponse<UserAssignment> = await this.api.get(`/assignments/branch/${branchId}/leader`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getTeamLeader(teamId: number): Promise<UserAssignment | null> {
    try {
      const response: AxiosResponse<UserAssignment> = await this.api.get(`/assignments/team/${teamId}/leader`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getBranchLeadersByAgency(agencyId: number): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/assignments/agency/${agencyId}/branch-leaders`);
    return response.data;
  }

  async getTeamLeadersByAgency(agencyId: number): Promise<UserAssignment[]> {
    const response: AxiosResponse<UserAssignment[]> = await this.api.get(`/assignments/agency/${agencyId}/team-leaders`);
    return response.data;
  }

  async assignBranchLeader(branchId: number, userId: number, agencyId: number): Promise<UserAssignment> {
    const response: AxiosResponse<UserAssignment> = await this.api.post(`/assignments/branch/${branchId}/leader?userId=${userId}&agencyId=${agencyId}`);
    return response.data;
  }

  async assignTeamLeader(teamId: number, userId: number, agencyId: number): Promise<UserAssignment> {
    const response: AxiosResponse<UserAssignment> = await this.api.post(`/assignments/team/${teamId}/leader?userId=${userId}&agencyId=${agencyId}`);
    return response.data;
  }

  async removeBranchLeader(branchId: number, agencyId: number): Promise<void> {
    await this.api.delete(`/assignments/branch/${branchId}/leader?agencyId=${agencyId}`);
  }

  async removeTeamLeader(teamId: number, agencyId: number): Promise<void> {
    await this.api.delete(`/assignments/team/${teamId}/leader?agencyId=${agencyId}`);
  }

  // User Invitation Management
  async sendInvitation(invitation: CreateInvitationRequest): Promise<UserInvitation> {
    const response: AxiosResponse<UserInvitation> = await this.api.post('/invitations/send', invitation);
    return response.data;
  }

  async createInvitation(invitation: CreateInvitationRequest): Promise<UserInvitation> {
    const response: AxiosResponse<UserInvitation> = await this.api.post('/invitations', invitation);
    return response.data;
  }

  async getInvitationsByAgency(agencyId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<{ content: UserInvitation[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/invitations/agency/${agencyId}`, { params });
    return response.data;
  }

  async getPendingInvitationsByAgency(agencyId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<{ content: UserInvitation[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/invitations/agency/${agencyId}/pending`, { params });
    return response.data;
  }

  async resendInvitation(invitationId: string): Promise<UserInvitation> {
    const response: AxiosResponse<UserInvitation> = await this.api.post(`/invitations/${invitationId}/resend`);
    return response.data;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await this.api.delete(`/invitations/${invitationId}`);
  }

  async linkAgencyToInvitation(invitationToken: string, agencyId: number): Promise<void> {
    await this.api.post(`/invitations/link-agency`, { invitationToken, agencyId });
  }

  // Assessment Management
  async getAssessmentsByAgency(agencyId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<{ content: Assessment[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/assessments/agency/${agencyId}`, { params });
    return response.data;
  }

  async getAssessmentsByHuddle(huddleId: number): Promise<Assessment[]> {
    const response: AxiosResponse<Assessment[]> = await this.api.get(`/assessments/huddle/${huddleId}`);
    return response.data;
  }

  async getAssessmentById(assessmentId: number): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.get(`/assessments/${assessmentId}`);
    return response.data;
  }

  async getAssessmentByHuddle(huddleId: number): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.get(`/assessments/huddle/${huddleId}`);
    return response.data;
  }

  async createAssessment(assessment: CreateAssessmentRequest): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.post('/assessments', assessment);
    return response.data;
  }

  async updateAssessment(assessmentId: number, assessment: CreateAssessmentRequest): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.put(`/assessments/${assessmentId}`, assessment);
    return response.data;
  }

  async deleteAssessment(assessmentId: number): Promise<void> {
    await this.api.delete(`/assessments/${assessmentId}`);
  }

  async startAssessment(assessmentId: number, userId?: number): Promise<UserAssessmentAttempt> {
    const url = userId 
      ? `/assessments/${assessmentId}/start?userId=${userId}`
      : `/assessments/${assessmentId}/start`;
    const response: AxiosResponse<UserAssessmentAttempt> = await this.api.post(url);
    return response.data;
  }

  async submitAssessment(attemptId: number, answers: Record<number, string>): Promise<UserAssessmentAttempt> {
    const response: AxiosResponse<UserAssessmentAttempt> = await this.api.post(`/assessment-attempts/${attemptId}/submit`, { answers });
    return response.data;
  }

  async getUserAssessmentAttempts(userId: number, assessmentId?: number): Promise<UserAssessmentAttempt[]> {
    const url = assessmentId 
      ? `/assessment-attempts/user/${userId}/assessment/${assessmentId}`
      : `/assessment-attempts/user/${userId}`;
    const response: AxiosResponse<UserAssessmentAttempt[]> = await this.api.get(url);
    return response.data;
  }

  // Enhanced Assessment Methods
  async createEnhancedAssessment(assessment: CreateAssessmentRequest): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.post('/assessments/enhanced', assessment);
    return response.data;
  }

  async publishAssessment(assessmentId: number): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.post(`/assessments/${assessmentId}/publish`);
    return response.data;
  }

  async moveAssessmentToReview(assessmentId: number): Promise<Assessment> {
    const response: AxiosResponse<Assessment> = await this.api.post(`/assessments/${assessmentId}/review`);
    return response.data;
  }

  async startEnhancedAssessment(assessmentId: number): Promise<UserAssessmentAttempt> {
    const response: AxiosResponse<UserAssessmentAttempt> = await this.api.post(`/assessments/${assessmentId}/start-enhanced`);
    return response.data;
  }

  async submitEnhancedAssessment(attemptId: number, answers: Record<string, string>): Promise<UserAssessmentAttempt> {
    const response: AxiosResponse<UserAssessmentAttempt> = await this.api.post(`/assessments/attempts/${attemptId}/submit-enhanced`, { answers });
    return response.data;
  }

  async getUserAvailableAssessments(): Promise<Assessment[]> {
    const response: AxiosResponse<Assessment[]> = await this.api.get('/assessments/available');
    return response.data;
  }

  async getAssessmentAnalytics(assessmentId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/assessments/${assessmentId}/analytics`);
    return response.data;
  }

  async getUserEngagementStats(userId: number, sequenceId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/assessments/engagement/user/${userId}/sequence/${sequenceId}`);
    return response.data;
  }

  async getAssessmentsBySequence(sequenceId: number): Promise<Assessment[]> {
    const response: AxiosResponse<Assessment[]> = await this.api.get(`/assessments/sequence/${sequenceId}`);
    return response.data;
  }

  async canUserTakeAssessment(assessmentId: number): Promise<boolean> {
    const response: AxiosResponse<boolean> = await this.api.get(`/assessments/${assessmentId}/can-take`);
    return response.data;
  }

  async getUserAttempts(userId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<{ content: UserAssessmentAttempt[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/assessments/attempts/user/${userId}`, { params });
    return response.data;
  }

  // Assessment Extensions for Auto-Assignment
  async startAssessmentAttempt(assessmentId: number, userId?: number): Promise<UserAssessmentAttempt> {
    return this.startAssessment(assessmentId, userId);
  }

  async getUserAssessmentAssignments(userId: number): Promise<UserAssessmentAttempt[]> {
    return this.getUserAssessmentAttempts(userId);
  }

  async getAssessmentAttempts(userId: number, assessmentId?: number): Promise<UserAssessmentAttempt[]> {
    return this.getUserAssessmentAttempts(userId, assessmentId);
  }

  // Huddle Sequence Management - Updated to use BranchSequenceController
  async getSequencesByAgency(agencyId: number): Promise<HuddleSequence[]> {
    const response: AxiosResponse<HuddleSequence[]> = await this.api.get(`/branch-sequences/agency/${agencyId}`);
    return response.data;
  }

  // Get sequences created by current EDUCATOR user (creator-based filtering)
  async getSequencesCreatedByMe(): Promise<HuddleSequence[]> {
    const response: AxiosResponse<HuddleSequence[]> = await this.api.get(`/branch-sequences/created-by-me`);
    return response.data;
  }

  async getSequenceById(sequenceId: number): Promise<HuddleSequence> {
    const response: AxiosResponse<HuddleSequence> = await this.api.get(`/sequences/${sequenceId}`);
    return response.data;
  }

  async createSequence(sequence: CreateSequenceRequest, createdByUserId: number): Promise<HuddleSequence> {
    const response: AxiosResponse<HuddleSequence> = await this.api.post(`/sequences?createdByUserId=${createdByUserId}`, sequence);
    return response.data;
  }

  async updateSequenceStatus(sequenceId: number, status: SequenceStatus, updatedByUserId?: number): Promise<{ sequence: HuddleSequence; message: string; messageType: string }> {
    const userId = updatedByUserId || 1; // fallback to a default user ID if not provided
    const response = await this.api.put(`/branch-sequences/${sequenceId}/status?status=${status}&userId=${userId}`);
    return {
      sequence: response.data.sequence,
      message: response.data.message,
      messageType: response.data.messageType
    };
  }

  async saveDraft(sequenceId: number, userId?: number): Promise<{ sequence: HuddleSequence; message: string; messageType: string }> {
    const response = await this.api.put(`/branch-sequences/${sequenceId}/save-draft`);
    return {
      sequence: response.data.sequence,
      message: response.data.message,
      messageType: response.data.messageType
    };
  }

  async publishSequence(sequenceId: number, publishedByUserId?: number): Promise<HuddleSequence> {
    const userId = publishedByUserId || 1; // fallback to a default user ID if not provided
    const response: AxiosResponse<HuddleSequence> = await this.api.post(`/sequences/${sequenceId}/publish?publishedByUserId=${userId}`);
    return response.data;
  }

  async searchSequences(agencyId: number, params: {
    title?: string;
    status?: SequenceStatus;
    page?: number;
    size?: number;
  }): Promise<{ content: HuddleSequence[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get(`/sequences/agency/${agencyId}/search`, { params });
    return response.data;
  }

  // Calendar and Scheduling - Updated to use PersonalizedCalendarController
  async getCalendarEvents(userId: number, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response: AxiosResponse<CalendarEvent[]> = await this.api.get(`/calendar/user/${userId}/events?${params}`);
    return response.data;
  }

  async getScheduledHuddles(userId: number, date?: string): Promise<ScheduledHuddle[]> {
    const params = date ? `?date=${date}` : '';
    const response: AxiosResponse<ScheduledHuddle[]> = await this.api.get(`/calendar/user/${userId}/scheduled-huddles${params}`);
    return response.data;
  }

  async getUserUpcomingDeadlines(userId: number): Promise<UserDeadline[]> {
    const response: AxiosResponse<UserDeadline[]> = await this.api.get(`/calendar/user/${userId}/deadlines`);
    return response.data;
  }

  async getBranchCalendarEvents(branchId: number, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response: AxiosResponse<CalendarEvent[]> = await this.api.get(`/calendar/branch/${branchId}/events?${params}`);
    return response.data;
  }

  async getVisibleSequencesForUser(userId: number): Promise<HuddleSequence[]> {
    const response: AxiosResponse<HuddleSequence[]> = await this.api.get(`/branch-sequences/visible?userId=${userId}`);
    return response.data;
  }

  // Huddle Management
  async getHuddlesBySequence(sequenceId: number): Promise<Huddle[]> {
    const response: AxiosResponse<Huddle[]> = await this.api.get(`/huddles/sequence/${sequenceId}`);
    return response.data;
  }

  async getHuddleById(huddleId: number): Promise<Huddle> {
    const response: AxiosResponse<Huddle> = await this.api.get(`/huddles/${huddleId}`);
    return response.data;
  }

  async createHuddle(huddle: CreateHuddleRequest): Promise<Huddle> {
    const response: AxiosResponse<Huddle> = await this.api.post('/huddles', huddle);
    return response.data;
  }

  async updateHuddleContent(huddleId: number, content: {
    contentJson?: string;
    voiceScript?: string;
  }): Promise<Huddle> {
    const response: AxiosResponse<Huddle> = await this.api.put(`/huddles/${huddleId}/content`, content);
    return response.data;
  }

  async updateHuddleFiles(huddleId: number, files: {
    pdfUrl?: string;
    audioUrl?: string;
  }): Promise<Huddle> {
    const response: AxiosResponse<Huddle> = await this.api.put(`/huddles/${huddleId}/files`, files);
    return response.data;
  }

  // Progress Tracking - Updated to use HuddleProgressController
  async startHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    const response: AxiosResponse<UserProgress> = await this.api.post(`/huddle-progress/start?huddleId=${huddleId}`);
    return response.data;
  }

  async updateHuddleProgress(huddleId: number, completionPercentage: number, timeSpentMinutes?: number): Promise<UserProgress> {
    const params = new URLSearchParams();
    params.append('huddleId', huddleId.toString());
    params.append('completionPercentage', completionPercentage.toString());
    if (timeSpentMinutes) params.append('timeSpentMinutes', timeSpentMinutes.toString());
    
    const response: AxiosResponse<UserProgress> = await this.api.put(`/huddle-progress/update?${params}`);
    return response.data;
  }

  async completeHuddle(userId: number, huddleId: number, completionNotes?: string): Promise<UserProgress> {
    const params = new URLSearchParams();
    params.append('userId', userId.toString());
    params.append('huddleId', huddleId.toString());
    if (completionNotes) params.append('completionNotes', completionNotes);
    
    const response: AxiosResponse<UserProgress> = await this.api.post(`/huddle-progress/complete?${params}`);
    return response.data;
  }

  async updateProgress(progress: { userId: number; huddleId: number; completionPercentage: number; timeSpentMinutes?: number }): Promise<UserProgress> {
    const response: AxiosResponse<UserProgress> = await this.api.put('/huddle-progress/update', progress);
    return response.data;
  }

  async recordAssessment(userId: number, huddleId: number, score: number): Promise<UserProgress> {
    const response: AxiosResponse<UserProgress> = await this.api.post(`/huddle-progress/assessment?userId=${userId}&huddleId=${huddleId}&score=${score}`);
    return response.data;
  }

  async initializeProgressForCombination(combinationId: number): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.post(`/huddle-progress/initialize/${combinationId}`);
    return response.data;
  }

  async getMyProgress(): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get('/huddle-progress/my-progress');
    return response.data;
  }

  async getMyProgressSummary(): Promise<any> {
    const response = await this.api.get('/huddle-progress/my-summary');
    return response.data;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get(`/huddle-progress/user/${userId}/details`);
    return response.data;
  }

  async getUserProgressSummary(userId: number): Promise<any> {
    const response = await this.api.get(`/huddle-progress/user/${userId}/summary`);
    return response.data;
  }

  async getTeamProgressSummary(teamId: number): Promise<any> {
    const response = await this.api.get(`/huddle-progress/team/${teamId}/summary`);
    return response.data;
  }

  async getBranchProgressSummary(branchId: number): Promise<any> {
    const response = await this.api.get(`/huddle-progress/branch/${branchId}/summary`);
    return response.data;
  }

  async getAgencyProgressSummary(): Promise<any> {
    const response = await this.api.get('/huddle-progress/agency/summary');
    return response.data;
  }

  async getRecentActivity(hours: number = 24): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get(`/huddle-progress/recent-activity?hours=${hours}`);
    return response.data;
  }

  async searchProgress(filters: any): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, value.toString());
    });
    
    const response = await this.api.get(`/huddle-progress/search?${params}`);
    return response.data;
  }

  async getStaleProgress(inactiveHours: number = 72): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get(`/huddle-progress/stale?inactiveHours=${inactiveHours}`);
    return response.data;
  }

  async getUserSequenceProgress(userId: number, sequenceId: number): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get(`/progress/user/${userId}/sequence/${sequenceId}`);
    return response.data;
  }

  // Sequence Progress - Updated to use HuddleProgressController
  async getUserSequenceProgressOverview(userId: number): Promise<SequenceProgress[]> {
    const response: AxiosResponse<SequenceProgress[]> = await this.api.get(`/sequence-progress/user/${userId}/overview`);
    return response.data;
  }

  async getSequenceProgressBySequence(sequenceId: number): Promise<SequenceProgress[]> {
    const response: AxiosResponse<SequenceProgress[]> = await this.api.get(`/sequence-progress/sequence/${sequenceId}`);
    return response.data;
  }

  async getAgencyProgress(agencyId: number): Promise<SequenceProgress[]> {
    const response: AxiosResponse<SequenceProgress[]> = await this.api.get(`/sequence-progress/agency/${agencyId}`);
    return response.data;
  }

  // Scheduling
  async getSequenceSchedules(sequenceId: number): Promise<DeliverySchedule[]> {
    const response: AxiosResponse<DeliverySchedule[]> = await this.api.get(`/schedules/sequence/${sequenceId}`);
    return response.data;
  }

  async createSchedule(sequenceId: number, schedule: CreateScheduleRequest): Promise<DeliverySchedule> {
    const response: AxiosResponse<DeliverySchedule> = await this.api.post(`/schedules/sequence/${sequenceId}`, schedule);
    return response.data;
  }

  async updateSchedule(scheduleId: number, schedule: Partial<DeliverySchedule>): Promise<DeliverySchedule> {
    const response: AxiosResponse<DeliverySchedule> = await this.api.put(`/schedules/${scheduleId}`, schedule);
    return response.data;
  }

  async pauseSchedule(scheduleId: number): Promise<void> {
    await this.api.post(`/schedules/${scheduleId}/pause`);
  }

  async resumeSchedule(scheduleId: number): Promise<void> {
    await this.api.post(`/schedules/${scheduleId}/resume`);
  }

  async cancelSchedule(scheduleId: number): Promise<void> {
    await this.api.delete(`/schedules/${scheduleId}`);
  }

  async getAgencySchedules(agencyId: number): Promise<DeliverySchedule[]> {
    const response: AxiosResponse<DeliverySchedule[]> = await this.api.get(`/schedules/agency/${agencyId}`);
    return response.data;
  }

  // ⭐ COMBINATION SCHEDULE API METHODS (Series-Episode Model)

  // Combination-specific endpoints
  async createCombinationSchedule(combinationId: number, schedule: CreateCombinationScheduleRequest): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.post(`/combination-schedules/combination/${combinationId}`, schedule);
    return response.data;
  }

  async getCombinationSchedules(combinationId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/combination/${combinationId}`);
    return response.data;
  }

  async getActiveCombinationSchedule(combinationId: number): Promise<CombinationSchedule | null> {
    try {
      const response: AxiosResponse<CombinationSchedule> = await this.api.get(`/combination-schedules/combination/${combinationId}/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Schedule management endpoints
  async getCombinationScheduleById(scheduleId: number): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.get(`/combination-schedules/${scheduleId}`);
    return response.data;
  }

  async updateCombinationSchedule(scheduleId: number, schedule: UpdateCombinationScheduleRequest): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.put(`/combination-schedules/${scheduleId}`, schedule);
    return response.data;
  }

  async deleteCombinationSchedule(scheduleId: number): Promise<void> {
    await this.api.delete(`/combination-schedules/${scheduleId}`);
  }

  async pauseCombinationSchedule(scheduleId: number): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.post(`/combination-schedules/${scheduleId}/pause`);
    return response.data;
  }

  async resumeCombinationSchedule(scheduleId: number): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.post(`/combination-schedules/${scheduleId}/resume`);
    return response.data;
  }

  async restartCombinationSchedule(scheduleId: number): Promise<CombinationSchedule> {
    const response: AxiosResponse<CombinationSchedule> = await this.api.post(`/combination-schedules/${scheduleId}/restart`);
    return response.data;
  }

  // Sequence-level endpoints (all series in a sequence)
  async getSequenceCombinationSchedules(sequenceId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/sequence/${sequenceId}`);
    return response.data;
  }

  async getSequenceScheduleProgress(sequenceId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/sequence/${sequenceId}/progress`);
    return response.data;
  }

  // Agency-level endpoints
  async getAgencyCombinationSchedules(agencyId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/agency/${agencyId}`);
    return response.data;
  }

  async getActiveAgencyCombinationSchedules(agencyId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/agency/${agencyId}/active`);
    return response.data;
  }

  async getAgencyScheduleStatistics(agencyId: number): Promise<ScheduleStatistics> {
    const response: AxiosResponse<ScheduleStatistics> = await this.api.get(`/combination-schedules/agency/${agencyId}/statistics`);
    return response.data;
  }

  async getAgencyScheduleProgressMap(agencyId: number): Promise<Record<number, CombinationSchedule[]>> {
    const response: AxiosResponse<Record<number, CombinationSchedule[]>> = await this.api.get(`/combination-schedules/agency/${agencyId}/progress-map`);
    return response.data;
  }

  // User-specific endpoints (role-discipline filtering)
  async getSchedulesForRoleDiscipline(role: string, discipline: string, agencyId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/role-discipline`, {
      params: { role, discipline, agencyId }
    });
    return response.data;
  }

  // Analytics endpoints
  async getUpcomingCombinationSchedules(startDate: string, endDate: string): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.get(`/combination-schedules/upcoming`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Bulk operations
  async createSchedulesForAllCombinations(sequenceId: number, templateSchedule: CreateCombinationScheduleRequest): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.post(`/combination-schedules/sequence/${sequenceId}/create-all`, templateSchedule);
    return response.data;
  }

  async pauseAllSequenceSchedules(sequenceId: number): Promise<CombinationSchedule[]> {
    const response: AxiosResponse<CombinationSchedule[]> = await this.api.post(`/combination-schedules/sequence/${sequenceId}/pause-all`);
    return response.data;
  }

  // Health check
  async checkCombinationScheduleHealth(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/combination-schedules/health`);
    return response.data;
  }

  // Analytics - Updated to use ProductionAnalyticsController
  async getAgencyAnalytics(agencyId: number): Promise<Analytics> {
    const response: AxiosResponse<Analytics> = await this.api.get(`/analytics/agency/${agencyId}`);
    return response.data;
  }

  async getBranchAnalytics(branchId: number): Promise<Analytics> {
    const response: AxiosResponse<Analytics> = await this.api.get(`/analytics/branch/${branchId}`);
    return response.data;
  }

  async getTeamAnalytics(teamId: number): Promise<Analytics> {
    const response: AxiosResponse<Analytics> = await this.api.get(`/analytics/team/${teamId}`);
    return response.data;
  }

  async getUserAnalytics(userId: number): Promise<Analytics> {
    const response: AxiosResponse<Analytics> = await this.api.get(`/analytics/user/${userId}`);
    return response.data;
  }

  async getMyContextAnalytics(): Promise<Analytics> {
    const response: AxiosResponse<Analytics> = await this.api.get('/analytics/my-context');
    return response.data;
  }

  async getPerformanceAnalytics(agencyId: number): Promise<any[]> {
    const response = await this.api.get(`/analytics/agency/${agencyId}/performance`);
    return response.data;
  }

  async getDailyCompletionTrends(agencyId: number, days: number = 30): Promise<any[]> {
    const response = await this.api.get(`/analytics/agency/${agencyId}/trends?days=${days}`);
    return response.data;
  }

  async getPlatformWideAnalytics(): Promise<any> {
    const response = await this.api.get('/analytics/platform');
    return response.data;
  }

  // EDUCATOR BRANCH ASSIGNMENT MANAGEMENT
  
  async getEducatorBranchAssignments(educatorId: number): Promise<EducatorBranchAssignment[]> {
    const response = await this.api.get(`/educator-branch-assignments/educator/${educatorId}`);
    return response.data;
  }

  async getBranchAssignments(branchId: number): Promise<EducatorBranchAssignment[]> {
    const response = await this.api.get(`/educator-branch-assignments/branch/${branchId}`);
    return response.data;
  }

  async assignEducatorToBranch(request: EducatorBranchAssignmentRequest): Promise<EducatorBranchAssignment> {
    const response = await this.api.post('/educator-branch-assignments/assign', request);
    return response.data;
  }

  async batchAssignEducatorToBranches(educatorId: number, branchIds: number[], notes?: string): Promise<EducatorBranchAssignment[]> {
    const response = await this.api.post('/educator-branch-assignments/batch-assign', {
      educatorId,
      branchIds,
      assignmentNotes: notes
    });
    return response.data;
  }

  async assignEducatorToBranches(data: { educatorId: number; branchIds: number[]; notes?: string }): Promise<EducatorBranchAssignment[]> {
    return this.batchAssignEducatorToBranches(data.educatorId, data.branchIds, data.notes);
  }

  async removeEducatorFromBranch(educatorId: number, branchId: number): Promise<void> {
    await this.api.delete(`/educator-branch-assignments/remove/${educatorId}/${branchId}`);
  }

  async getEducatorAccessibleBranches(educatorId: number, agencyId: number): Promise<Branch[]> {
    const response = await this.api.get(`/educator-branch-assignments/educator/${educatorId}/accessible-branches/${agencyId}`);
    return response.data;
  }

  async checkEducatorBranchAccess(educatorId: number, branchId: number): Promise<boolean> {
    const response = await this.api.get(`/educator-branch-assignments/check-access?educatorId=${educatorId}&branchId=${branchId}`);
    return response.data;
  }

  // BRANCH-SPECIFIC SEQUENCE MANAGEMENT
  
  async createBranchSequence(request: BranchSequenceCreateRequest): Promise<HuddleSequence> {
    const response = await this.api.post('/branch-sequences', request);
    return response.data;
  }

  async getMyBranchSequences(): Promise<HuddleSequence[]> {
    const response = await this.api.get('/branch-sequences/my-sequences');
    return response.data;
  }

  async getBranchSequenceWithCombinations(sequenceId: number): Promise<HuddleSequence> {
    const response = await this.api.get(`/branch-sequences/${sequenceId}/full`);
    return response.data;
  }

  async updateBranchSequenceStatus(sequenceId: number, status: SequenceStatus, userId: number): Promise<{ sequence: HuddleSequence; message: string; messageType: string }> {
    const response = await this.api.put(`/branch-sequences/${sequenceId}/status?status=${status}&userId=${userId}`);
    return {
      sequence: response.data.sequence,
      message: response.data.message,
      messageType: response.data.messageType
    };
  }

  async getBranchVisibleSequencesForUser(userId: number, activeRole?: string, discipline?: string): Promise<HuddleSequence[]> {
    // Backend uses SecurityHelper.getCurrentUserId() from auth context, so no userId parameter needed
    let url = `/branch-sequences/visible`;
    const params = new URLSearchParams();
    
    console.log('🎯 API CLIENT: getBranchVisibleSequencesForUser called with activeRole =', activeRole, 'discipline =', discipline);
    
    if (activeRole) {
      params.append('activeRole', activeRole);
      console.log('🎯 API CLIENT: Added activeRole param:', activeRole);
    }
    if (discipline) {
      params.append('discipline', discipline);
      console.log('🎯 API CLIENT: Added discipline param:', discipline);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('🎯 API CLIENT: Final URL =', url);
    
    const response = await this.api.get(url);
    return response.data;
  }

  async getSequencesForSpecificRole(role: string, discipline: string): Promise<HuddleSequence[]> {
    const url = `/branch-sequences/role-specific?role=${encodeURIComponent(role)}&discipline=${encodeURIComponent(discipline)}`;
    
    console.log('🔥 NEW API METHOD: getSequencesForSpecificRole called with role =', role, 'discipline =', discipline);
    console.log('🔥 NEW API METHOD: Final URL =', url);
    
    const response = await this.api.get(url);
    
    console.log('🔥 NEW API METHOD: Received', response.data.length, 'sequences for role', role);
    return response.data;
  }

  async updateBranchSequenceSchedule(sequenceId: number, scheduleData: any): Promise<void> {
    await this.api.put(`/branch-sequences/${sequenceId}/schedule`, scheduleData);
  }

  // ENHANCED BRANCH MANAGEMENT
  
  async getBranchDisciplines(branchId: number): Promise<Discipline[]> {
    const response = await this.api.get(`/branches/${branchId}/disciplines`);
    return response.data;
  }

  async checkBranchAccess(branchId: number): Promise<boolean> {
    const response = await this.api.get(`/branches/${branchId}/check-access`);
    return response.data;
  }

  async getBranchesAccessibleByEducator(educatorId: number, agencyId: number): Promise<Branch[]> {
    const response = await this.api.get(`/branches/agency/${agencyId}/accessible?educatorId=${educatorId}`);
    return response.data;
  }

  // PERSONALIZED CALENDAR & CONTENT FILTERING
  
  async getPersonalizedCalendarEvents(userId: number, filters?: PersonalizedCalendarFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'ALL') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await this.api.get(`/calendar/personalized/${userId}?${params.toString()}`);
    return response.data;
  }

  async getUpcomingPersonalizedEvents(userId: number, days: number = 30): Promise<CalendarEvent[]> {
    const response = await this.api.get(`/calendar/personalized/${userId}/upcoming?days=${days}`);
    return response.data;
  }

  async getOverduePersonalizedItems(userId: number): Promise<CalendarEvent[]> {
    const response = await this.api.get(`/calendar/personalized/${userId}/overdue`);
    return response.data;
  }

  // SIMPLIFIED HUDDLE EDITING
  
  async getHuddleForEdit(huddleId: number): Promise<any> {
    const response = await this.api.get(`/huddles/${huddleId}/edit`);
    return response.data;
  }

  async updateHuddleVoiceScript(huddleId: number, data: { voiceScript: string }): Promise<any> {
    const response = await this.api.put(`/huddles/${huddleId}/voice-script`, data);
    return response.data;
  }

  // USER BRANCH CONTEXT
  
  async getUserBranchContext(userId: number): Promise<{
    accessibleBranches: Branch[];
    currentAssignments: any[];
    roles: UserRole[];
    disciplines: Discipline[];
  }> {
    const response = await this.api.get(`/users/${userId}/branch-context`);
    return response.data;
  }

  async getUserAccessibleBranches(userId: number, agencyId: number): Promise<Branch[]> {
    const response = await this.api.get(`/educator-branch-assignments/educator/${userId}/accessible-branches/${agencyId}`);
    return response.data;
  }

  // PLATFORM ANALYTICS (Real Implementation)
  
  async getPlatformAnalytics(agencyId: number): Promise<PlatformAnalytics> {
    const response = await this.api.get(`/platform-analytics/agencies/${agencyId}/comprehensive`);
    return response.data;
  }

  async getBranchPlatformAnalytics(branchId: number): Promise<PlatformAnalytics> {
    const response = await this.api.get(`/platform-analytics/branches/${branchId}/performance`);
    return response.data;
  }

  async getUserLearningPath(userId: number): Promise<PlatformAnalytics> {
    const response = await this.api.get(`/platform-analytics/users/${userId}/learning-paths`);
    return response.data;
  }

  // Advanced Analytics Methods
  async getAdvancedAgencyAnalytics(agencyId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/agency/${agencyId}`, { filters });
    return response.data;
  }

  async getAdvancedBranchAnalytics(branchId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/branch/${branchId}`, { filters });
    return response.data;
  }

  async getAdvancedTeamAnalytics(teamId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/team/${teamId}`, { filters });
    return response.data;
  }

  async getAdvancedUserAnalytics(userId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/user/${userId}`, { filters });
    return response.data;
  }

  async getAnalyticsActivityFeed(scope: string, entityId: number, limit: number, offset: number): Promise<any> {
    const response = await this.api.get(`/analytics/activity/${scope}/${entityId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  async getAnalyticsUpcomingDeadlines(scope: string, entityId: number, daysAhead: number): Promise<any> {
    const response = await this.api.get(`/analytics/deadlines/${scope}/${entityId}`, {
      params: { daysAhead }
    });
    return response.data;
  }

  async getAnalyticsCompetencyTracking(scope: string, entityId: number): Promise<any> {
    const response = await this.api.get(`/analytics/competency/${scope}/${entityId}`);
    return response.data;
  }

  async getAnalyticsPerformanceComparison(scope: string, entityId: number, currentPeriod: any, comparisonPeriod: any): Promise<any> {
    const response = await this.api.post(`/analytics/comparison/${scope}/${entityId}`, {
      currentPeriod,
      comparisonPeriod
    });
    return response.data;
  }

  async exportAnalyticsReport(scope: string, entityId: number, options: any, filters?: any): Promise<any> {
    const response = await this.api.post(`/analytics/export/${scope}/${entityId}`, {
      options,
      filters
    });
    return response.data;
  }

  async getAnalyticsRealTimeMetrics(scope: string, entityId: number): Promise<any> {
    const response = await this.api.get(`/analytics/realtime/${scope}/${entityId}`);
    return response.data;
  }

  async getAnalyticsBulkData(scope: string, entityIds: number[], filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/bulk/${scope}`, {
      entityIds,
      filters
    });
    return response.data;
  }

  async getAnalyticsInsights(scope: string, entityId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/insights/${scope}/${entityId}`, { filters });
    return response.data;
  }

  async getAnalyticsSequencePerformance(sequenceId: number, scope: string, entityId: number): Promise<any> {
    const response = await this.api.get(`/analytics/sequence/${sequenceId}/${scope}/${entityId}`);
    return response.data;
  }

  async getAnalyticsAssessmentPerformance(assessmentId: number, scope: string, entityId: number): Promise<any> {
    const response = await this.api.get(`/analytics/assessment/${assessmentId}/${scope}/${entityId}`);
    return response.data;
  }

  async getAnalyticsLearningPath(userId: number): Promise<any> {
    const response = await this.api.get(`/analytics/learning-path/${userId}`);
    return response.data;
  }

  async getAnalyticsEngagement(scope: string, entityId: number, filters: any): Promise<any> {
    const response = await this.api.post(`/analytics/engagement/${scope}/${entityId}`, { filters });
    return response.data;
  }

  async getAnalyticsCompliance(scope: string, entityId: number): Promise<any> {
    const response = await this.api.get(`/analytics/compliance/${scope}/${entityId}`);
    return response.data;
  }

  // Engagement Tracking
  async recordHuddleEvent(
    userId: number,
    huddleId: number,
    eventType: string,
    sessionId: string
  ): Promise<void> {
    await this.api.post(`/engagement/huddle?userId=${userId}&huddleId=${huddleId}&eventType=${eventType}&sessionId=${sessionId}`);
  }

  async recordSequenceEvent(
    userId: number,
    sequenceId: number,
    eventType: string,
    sessionId: string
  ): Promise<void> {
    await this.api.post(`/engagement/sequence?userId=${userId}&sequenceId=${sequenceId}&eventType=${eventType}&sessionId=${sessionId}`);
  }

  // File Management
  async uploadFile(file: File, category: string): Promise<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await this.api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async generatePdf(title: string, content: string, category: string = 'generated'): Promise<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    const response = await this.api.post('/files/generate-pdf', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  getFileUrl(fileName: string): string {
    return `${this.api.defaults.baseURL}/files/${fileName}`;
  }

  // Role-based User Huddle Management
  async getUserHuddlesByRole(userId: number, role: UserRole): Promise<any[]> {
    const response = await this.api.get(`/users/${userId}/huddles/role/${role}`);
    return response.data;
  }

  async getAllUserHuddles(userId: number): Promise<any[]> {
    const response = await this.api.get(`/users/${userId}/huddles`);
    return response.data;
  }

  async getUserHuddleDetails(userId: number, sequenceId: number, role: UserRole): Promise<any> {
    const response = await this.api.get(`/users/${userId}/huddles/${sequenceId}/role/${role}`);
    return response.data;
  }

  async getUserRolesWithHuddles(userId: number): Promise<UserRole[]> {
    const response = await this.api.get(`/users/${userId}/huddles/roles`);
    return response.data;
  }

  async getRoleHuddleStats(userId: number, role: UserRole): Promise<any> {
    const response = await this.api.get(`/users/${userId}/huddles/role/${role}/stats`);
    return response.data;
  }

  async getRoleDashboardData(userId: number, role: UserRole): Promise<any> {
    const response = await this.api.get(`/users/${userId}/huddles/role/${role}/dashboard`);
    return response.data;
  }

  // HUDDLE RELEASE SCHEDULES
  
  async getHuddleReleaseSchedules(sequenceId: number): Promise<any[]> {
    try {
      const response = await this.api.get(`/huddle-release-schedules/sequence/${sequenceId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Release schedule API not available, using fallback');
      return []; // Graceful fallback for development
    }
  }

  async getHuddleUnlockStatus(userId: number, huddleId: number): Promise<{
    isUnlocked: boolean;
    unlockReason?: string;
    previousHuddleRequired?: number;
    assessmentRequired?: boolean;
  }> {
    try {
      const response = await this.api.get(`/huddle-progress/unlock-status?userId=${userId}&huddleId=${huddleId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Unlock status API not available, using fallback');
      return { isUnlocked: true }; // Graceful fallback for development
    }
  }
}

export const apiClient = new HopApiClient();