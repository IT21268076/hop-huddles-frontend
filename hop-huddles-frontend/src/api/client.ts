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

  async getTeamsByBranch(branchId: number): Promise<Team[]> {
    const response = await this.client.get<Team[]>(`/teams/branch/${branchId}`);
    return response.data;
  }

  async updateTeam(teamId: number, team: Partial<CreateTeamRequest>): Promise<Team> {
    const response = await this.client.put<Team>(`/teams/${teamId}`, team);
    return response.data;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.client.delete(`/teams/${teamId}`);
  }

  // User Management
  async createUser(user: CreateUserRequest): Promise<User> {
    const response = await this.client.post<User>('/users', user);
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

  async updateUser(userId: number, user: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.client.put<User>(`/users/${userId}`, user);
    return response.data;
  }

  // User Assignment Management
  async createAssignment(assignment: CreateAssignmentRequest): Promise<UserAssignment> {
    const response = await this.client.post<UserAssignment>('/assignments', assignment);
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

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.client.delete(`/assignments/${assignmentId}`);
  }

  // Huddle Sequence Management
  async createSequence(sequence: CreateSequenceRequest, createdByUserId: number): Promise<HuddleSequence> {
    const response = await this.client.post<HuddleSequence>(`/sequences?createdByUserId=${createdByUserId}`, sequence);
    return response.data;
  }

  async getSequencesByAgency(agencyId: number): Promise<HuddleSequence[]> {
    const response = await this.client.get<HuddleSequence[]>(`/sequences/agency/${agencyId}`);
    return response.data;
  }

  async getSequence(sequenceId: number): Promise<HuddleSequence> {
    const response = await this.client.get<HuddleSequence>(`/sequences/${sequenceId}`);
    return response.data;
  }

  async updateSequenceStatus(sequenceId: number, status: SequenceStatus, updatedByUserId: number): Promise<HuddleSequence> {
    const response = await this.client.put<HuddleSequence>(`/sequences/${sequenceId}/status?status=${status}&updatedByUserId=${updatedByUserId}`);
    return response.data;
  }

  async publishSequence(sequenceId: number, publishedByUserId: number): Promise<HuddleSequence> {
    const response = await this.client.post<HuddleSequence>(`/sequences/${sequenceId}/publish?publishedByUserId=${publishedByUserId}`);
    return response.data;
  }

  async deleteSequence(sequenceId: number): Promise<void> {
    await this.client.delete(`/sequences/${sequenceId}`);
  }

  // Huddle Management
  async createHuddle(huddle: CreateHuddleRequest): Promise<Huddle> {
    const response = await this.client.post<Huddle>('/huddles', huddle);
    return response.data;
  }

  async getHuddlesBySequence(sequenceId: number): Promise<Huddle[]> {
    const response = await this.client.get<Huddle[]>(`/huddles/sequence/${sequenceId}`);
    return response.data;
  }

  async getHuddle(huddleId: number): Promise<Huddle> {
    const response = await this.client.get<Huddle>(`/huddles/${huddleId}`);
    return response.data;
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

  // User Management Enhancements
  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    const response = await this.client.patch<User>(`/users/${userId}/status`, { isActive });
    return response.data;
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
}

export const apiClient = new ApiClient();