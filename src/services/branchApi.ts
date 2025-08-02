// services/branchApi.ts
// Extension to main API client for branch-specific operations
import axios from 'axios';
import type {
  Branch,
  HuddleSequence,
  SequenceStatus,
  UserRole,
  Discipline,
  CalendarEvent,
  User,
  Huddle
} from '../types';

interface BranchCreateRequest {
  name: string;
  state: string;
  city: string;
  zipCode: string;
  ccn?: string;
  selectedDisciplines: Discipline[];
  createdByUserId?: number;
}

interface BranchSequenceCreateRequest {
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

interface VoiceScriptUpdateRequest {
  voiceScript: string;
}

interface HuddleEditData {
  huddleId: number;
  title: string;
  description?: string;
  voiceScript: string;
  pdfUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  roleDisciplineDisplay: string;
  combinationKey: string;
  sequenceTitle: string;
  sequenceStatus: string;
  canEdit: boolean;
}

interface PersonalizedCalendarFilters {
  branch?: string;
  role?: UserRole | 'ALL';
  discipline?: Discipline | 'ALL';
  eventType?: string;
  showCompleted?: boolean;
}

export class BranchApiExtension {
  private baseURL: string;
  private getAuthHeaders: () => Promise<{ Authorization?: string }>;

  constructor(baseURL: string = 'http://localhost:8080/api', getAuthHeaders: () => Promise<{ Authorization?: string }>) {
    this.baseURL = baseURL;
    this.getAuthHeaders = getAuthHeaders;
  }

  // Branch Management for EDUCATORs
  async createBranch(request: BranchCreateRequest): Promise<Branch> {
    const headers = await this.getAuthHeaders();
    const response = await axios.post(`${this.baseURL}/branches`, request, { headers });
    return response.data;
  }

  async getEducatorAssignedBranches(educatorId: number): Promise<Branch[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/educator-branch-assignments/educator/${educatorId}/branches`,
      { headers }
    );
    return response.data;
  }

  async getUserAccessibleBranches(userId: number): Promise<Branch[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/users/${userId}/accessible-branches`,
      { headers }
    );
    return response.data;
  }

  // Branch-Specific Sequence Operations
  async createBranchSequence(request: BranchSequenceCreateRequest): Promise<HuddleSequence> {
    const headers = await this.getAuthHeaders();
    const response = await axios.post(`${this.baseURL}/branch-sequences`, request, { headers });
    return response.data;
  }

  async getSequenceWithCombinations(sequenceId: number): Promise<HuddleSequence> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/branch-sequences/${sequenceId}/full`,
      { headers }
    );
    return response.data;
  }

  async updateBranchSequenceStatus(sequenceId: number, status: SequenceStatus, userId: number): Promise<HuddleSequence> {
    const headers = await this.getAuthHeaders();
    const response = await axios.put(
      `${this.baseURL}/branch-sequences/${sequenceId}/status?status=${status}&userId=${userId}`,
      {},
      { headers }
    );
    return response.data;
  }

  async getMyBranchSequences(): Promise<HuddleSequence[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseURL}/branch-sequences/my-sequences`, { headers });
    return response.data;
  }

  // Branch-Based Visibility
  async getBranchVisibleSequencesForUser(userId: number): Promise<HuddleSequence[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/branch-sequences/visible?userId=${userId}`,
      { headers }
    );
    return response.data;
  }

  // Simplified Huddle Editing
  async getHuddleForEdit(huddleId: number): Promise<HuddleEditData> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseURL}/huddles/${huddleId}/edit`, { headers });
    return response.data;
  }

  async updateHuddleVoiceScript(huddleId: number, request: VoiceScriptUpdateRequest): Promise<HuddleEditData> {
    const headers = await this.getAuthHeaders();
    const response = await axios.put(
      `${this.baseURL}/huddles/${huddleId}/voice-script`,
      request,
      { headers }
    );
    return response.data;
  }

  // Personalized Calendar
  async getPersonalizedCalendarEvents(userId: number, filters?: PersonalizedCalendarFilters): Promise<CalendarEvent[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'ALL') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get(
      `${this.baseURL}/calendar/personalized/${userId}?${params.toString()}`,
      { headers }
    );
    return response.data;
  }

  async getUpcomingPersonalizedEvents(userId: number, days: number = 30): Promise<CalendarEvent[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/calendar/personalized/${userId}/upcoming?days=${days}`,
      { headers }
    );
    return response.data;
  }

  async getOverduePersonalizedItems(userId: number): Promise<CalendarEvent[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/calendar/personalized/${userId}/overdue`,
      { headers }
    );
    return response.data;
  }

  // Schedule Management (editable in all statuses)
  async updateSequenceSchedule(sequenceId: number, scheduleData: any): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.put(
      `${this.baseURL}/branch-sequences/${sequenceId}/schedule`,
      scheduleData,
      { headers }
    );
  }

  // Educator Branch Assignment Management
  async assignEducatorToBranch(educatorId: number, branchId: number, notes?: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.post(
      `${this.baseURL}/educator-branch-assignments`,
      {
        educatorId,
        branchId,
        assignmentNotes: notes,
      },
      { headers }
    );
  }

  async removeEducatorFromBranch(educatorId: number, branchId: number): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.delete(
      `${this.baseURL}/educator-branch-assignments/educator/${educatorId}/branch/${branchId}`,
      { headers }
    );
  }

  async getEducatorBranchAssignments(educatorId: number): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseURL}/educator-branch-assignments/educator/${educatorId}`,
      { headers }
    );
    return response.data;
  }

  // Branch discipline validation
  async getBranchDisciplines(branchId: number): Promise<Discipline[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseURL}/branches/${branchId}/disciplines`, { headers });
    return response.data;
  }

  // User context for branch filtering
  async getUserBranchContext(userId: number): Promise<{
    accessibleBranches: Branch[];
    currentAssignments: any[];
    roles: UserRole[];
    disciplines: Discipline[];
  }> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseURL}/users/${userId}/branch-context`, { headers });
    return response.data;
  }
}