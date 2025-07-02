// api/mockClient.ts - Enhanced with user management mock implementations
import { 
  mockData, 
  mockAgencies, 
  mockUsers, 
  mockBranches, 
  mockTeams,
  mockSequences 
} from '../data/mockData';
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
  SequenceStatus,
  SequenceTarget,
  UserPreferences,
  VisibilitySettings,
  AgencySettings,
  BranchSettings,
  AssignmentPermissions,
  UserRole
} from '../types';

const defaultAgencySettings: AgencySettings = {
  allowMultipleRoles: true,
  requireDisciplineForRoles: ['FIELD_CLINICIAN'],
  autoHuddleRelease: false,
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  }
};

const defaultBranchSettings: BranchSettings = {
  autoAssignNewUsers: false,
  defaultUserRoles: ['FIELD_CLINICIAN'],
  huddleVisibilityScope: 'AGENCY_WIDE'
};

const defaultAssignmentPermissions: AssignmentPermissions = {
  canViewAllBranches: false,
  canViewAllTeams: false,
  canManageUsers: false,
  canCreateHuddles: false,
  canManageSchedules: false,
  restrictedActions: []
};

const defaultVisibilitySettings: VisibilitySettings = {
  isPublic: true,
  targetRules: [],
  accessConditions: [],
  releaseSchedule: undefined
};

// Mock API Client that returns mock data instead of making HTTP requests
export class MockApiClient {
  private delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  // Agency Management
  async createAgency(agency: CreateAgencyRequest): Promise<Agency> {
    await this.delay();
    const newAgency: Agency = {
      agencyId: mockData.agencies.length + 1,
      name: agency.name,
      ccn: agency.ccn,
      agencyType: agency.agencyType,
      agencyStructure: agency.agencyStructure,
      subscriptionPlan: agency.subscriptionPlan,
      contactEmail: agency.contactEmail,
      contactPhone: agency.contactPhone,
      address: agency.address,
      createdAt: new Date().toISOString(),
      userCount: 0,
      isActive: true,
      settings: agency.settings ? { ...defaultAgencySettings, ...agency.settings } : defaultAgencySettings
    };
    mockData.agencies.push(newAgency);
    return newAgency;
  }

  async getAgency(agencyId: number): Promise<Agency> {
    await this.delay();
    const agency = mockData.agencies.find(a => a.agencyId === agencyId);
    if (!agency) throw new Error('Agency not found');
    return agency;
  }

  async getAgencies(): Promise<Agency[]> {
    await this.delay();
    return [...mockData.agencies];
  }

  async updateAgency(agencyId: number, agency: Partial<CreateAgencyRequest>): Promise<Agency> {
    await this.delay();
    const existingAgency = mockData.agencies.find(a => a.agencyId === agencyId);
    if (!existingAgency) throw new Error('Agency not found');
    
    Object.assign(existingAgency, agency);
    if (agency.settings) {
      existingAgency.settings = { ...defaultAgencySettings, ...existingAgency.settings, ...agency.settings };
    }
    return existingAgency;
  }

  async deleteAgency(agencyId: number): Promise<void> {
    await this.delay();
    const index = mockData.agencies.findIndex(a => a.agencyId === agencyId);
    if (index === -1) throw new Error('Agency not found');
    mockData.agencies.splice(index, 1);
  }

  // Branch Management
  async createBranch(branch: CreateBranchRequest): Promise<Branch> {
    await this.delay();
    const newBranch: Branch = {
      branchId: mockData.branches.length + 1,
      agencyId: branch.agencyId,
      name: branch.name,
      location: branch.location,
      ccn: branch.ccn,
      leaderId: branch.leaderId,
      isActive: branch.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: branch.settings ? { ...defaultBranchSettings, ...branch.settings } : defaultBranchSettings
    };
    mockData.branches.push(newBranch);
    return newBranch;
  }

  async getBranch(branchId: number): Promise<Branch> {
    await this.delay();
    const branch = mockData.branches.find(b => b.branchId === branchId);
    if (!branch) throw new Error('Branch not found');
    return branch;
  }

  async getBranchesByAgency(agencyId: number): Promise<Branch[]> {
    await this.delay();
    return mockData.branches.filter(b => b.agencyId === agencyId);
  }

  async updateBranch(branchId: number, branch: Partial<CreateBranchRequest>): Promise<Branch> {
    await this.delay();
    const existingBranch = mockData.branches.find(b => b.branchId === branchId);
    if (!existingBranch) throw new Error('Branch not found');
    
    Object.assign(existingBranch, branch);
    existingBranch.updatedAt = new Date().toISOString();
    if (branch.settings) {
      existingBranch.settings = { ...defaultBranchSettings, ...existingBranch.settings, ...branch.settings };
    }
    return existingBranch;
  }

  async deleteBranch(branchId: number): Promise<void> {
    await this.delay();
    const index = mockData.branches.findIndex(b => b.branchId === branchId);
    if (index === -1) throw new Error('Branch not found');
    mockData.branches.splice(index, 1);
  }

  // Team Management
  async createTeam(team: CreateTeamRequest): Promise<Team> {
    await this.delay();
    const newTeam: Team = {
      teamId: mockData.teams.length + 1,
      branchId: team.branchId,
      name: team.name,
      description: team.description,
      leaderId: team.leaderId,
      targetDisciplines: team.targetDisciplines,
      maxMembers: team.maxMembers,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.teams.push(newTeam);
    return newTeam;
  }

  async getTeam(teamId: number): Promise<Team> {
    await this.delay();
    const team = mockData.teams.find(t => t.teamId === teamId);
    if (!team) throw new Error('Team not found');
    return team;
  }

  async getTeamsByBranch(branchId: number): Promise<Team[]> {
    await this.delay();
    return mockData.teams.filter(t => t.branchId === branchId);
  }

  // NEW: Get teams by agency
  async getTeamsByAgency(agencyId: number): Promise<Team[]> {
    await this.delay();
    // Find all branches for this agency, then get teams for those branches
    const agencyBranches = mockData.branches.filter(b => b.agencyId === agencyId);
    const branchIds = agencyBranches.map(b => b.branchId);
    return mockData.teams.filter(t => branchIds.includes(t.branchId));
  }

  async updateTeam(teamId: number, team: Partial<CreateTeamRequest>): Promise<Team> {
    await this.delay();
    const existingTeam = mockData.teams.find(t => t.teamId === teamId);
    if (!existingTeam) throw new Error('Team not found');
    
    Object.assign(existingTeam, team);
    existingTeam.updatedAt = new Date().toISOString();
    return existingTeam;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.delay();
    const index = mockData.teams.findIndex(t => t.teamId === teamId);
    if (index === -1) throw new Error('Team not found');
    mockData.teams.splice(index, 1);
  }

  // ===== ENHANCED USER MANAGEMENT METHODS =====

  // User Management
  async createUser(userData: CreateUserRequest): Promise<User> {
    await this.delay();
    const newUser: User = {
      userId: mockData.users.length + 1,
      auth0Id: userData.auth0Id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      profilePictureUrl: userData.profilePictureUrl,
      lastLogin: undefined,
      createdAt: new Date().toISOString(),
      assignments: [], // Will be added via separate assignment calls
      isActive: true,
      preferences: userData.preferences
        ? {
            notificationSettings: {
              email: userData.preferences.notificationSettings?.email ?? true,
              sms: userData.preferences.notificationSettings?.sms ?? false,
              inApp: userData.preferences.notificationSettings?.inApp ?? true,
              huddleReleases: userData.preferences.notificationSettings?.huddleReleases,
              completionReminders: userData.preferences.notificationSettings?.completionReminders,
              achievementUnlocks: userData.preferences.notificationSettings?.achievementUnlocks,
              weeklyDigest: userData.preferences.notificationSettings?.weeklyDigest,
              reminderTiming: userData.preferences.notificationSettings?.reminderTiming,
            },
            huddleSettings: {
              autoPlay: userData.preferences.huddleSettings?.autoPlay ?? false,
              playbackSpeed: userData.preferences.huddleSettings?.playbackSpeed ?? 1.0,
              preferredLanguage: userData.preferences.huddleSettings?.preferredLanguage ?? 'en',
            },
            dashboardLayout: userData.preferences.dashboardLayout ?? 'cards'
          }
        : undefined
    };
    mockData.users.push(newUser);
    console.log('Created user:', newUser);
    return newUser;
  }

  async getUser(userId: number): Promise<User> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async getUsersByAgency(agencyId: number): Promise<User[]> {
    await this.delay();
    // Filter users who have assignments in this agency
    return mockData.users.filter(user => 
      user.assignments.some(assignment => assignment.agencyId === agencyId)
    );
  }

  async updateUser(userId: number, userData: Partial<CreateUserRequest>): Promise<User> {
    await this.delay();
    const existingUser = mockData.users.find(u => u.userId === userId);
    if (!existingUser) throw new Error('User not found');
    
    // Update user properties
    Object.assign(existingUser, userData);
    console.log('Updated user:', existingUser);
    return existingUser;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.delay();
    const index = mockData.users.findIndex(u => u.userId === userId);
    if (index === -1) throw new Error('User not found');
    
    // Also remove all assignments for this user
    mockData.users[index].assignments = [];
    
    mockData.users.splice(index, 1);
    console.log('Deleted user:', userId);
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    user.isActive = isActive;
    console.log('Updated user status:', userId, isActive);
    return user;
  }

  // Assignment Management
  async createAssignment(assignmentData: CreateAssignmentRequest): Promise<UserAssignment> {
    await this.delay();
    
    // Find the user
    const user = mockData.users.find(u => u.userId === assignmentData.userId);
    if (!user) throw new Error('User not found');

    // Find agency name
    const agency = mockData.agencies.find(a => a.agencyId === assignmentData.agencyId);
    const branch = assignmentData.branchId ? mockData.branches.find(b => b.branchId === assignmentData.branchId) : undefined;
    const team = assignmentData.teamId ? mockData.teams.find(t => t.teamId === assignmentData.teamId) : undefined;

    const newAssignment: UserAssignment = {
      assignmentId: Date.now(), // Simple ID generation
      userId: assignmentData.userId,
      userName: user.name,
      agencyId: assignmentData.agencyId,
      agencyName: agency?.name || 'Unknown Agency',
      branchId: assignmentData.branchId,
      branchName: branch?.name,
      teamId: assignmentData.teamId,
      teamName: team?.name,
      role: assignmentData.role,
      roles: assignmentData.roles,
      discipline: assignmentData.disciplines[0], // First discipline as primary
      disciplines: assignmentData.disciplines,
      isPrimary: assignmentData.isPrimary,
      isLeader: assignmentData.isLeader,
      accessScope: assignmentData.teamId ? 'TEAM' : assignmentData.branchId ? 'BRANCH' : 'AGENCY',
      assignedAt: new Date().toISOString(),
      assignedBy: 1, // Mock assigned by current user
      isActive: true,
      permissions: assignmentData.permissions
        ? { ...defaultAssignmentPermissions, ...assignmentData.permissions }
        : defaultAssignmentPermissions
    };

    // Add assignment to user
    user.assignments.push(newAssignment);
    console.log('Created assignment:', newAssignment);
    return newAssignment;
  }

  async getAssignment(assignmentId: number): Promise<UserAssignment> {
    await this.delay();
    for (const user of mockData.users) {
      const assignment = user.assignments.find(a => a.assignmentId === assignmentId);
      if (assignment) return assignment;
    }
    throw new Error('Assignment not found');
  }

  async getAssignmentsByUser(userId: number): Promise<UserAssignment[]> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    return user.assignments;
  }

  async getAssignmentsByAgency(agencyId: number): Promise<UserAssignment[]> {
    await this.delay();
    const assignments: UserAssignment[] = [];
    for (const user of mockData.users) {
      const agencyAssignments = user.assignments.filter(a => a.agencyId === agencyId);
      assignments.push(...agencyAssignments);
    }
    return assignments;
  }

  async updateAssignment(assignmentId: number, assignmentData: Partial<CreateAssignmentRequest>): Promise<UserAssignment> {
    await this.delay();
    
    // Find the assignment across all users
    let targetAssignment: UserAssignment | null = null;
    for (const user of mockData.users) {
      const assignment = user.assignments.find(a => a.assignmentId === assignmentId);
      if (assignment) {
        targetAssignment = assignment;
        break;
      }
    }

    if (!targetAssignment) throw new Error('Assignment not found');

    // Update assignment properties
    if (assignmentData.role !== undefined) {
      targetAssignment.role = assignmentData.role;
      targetAssignment.roles = assignmentData.roles || [assignmentData.role];
    }
    if (assignmentData.disciplines !== undefined) {
      targetAssignment.disciplines = assignmentData.disciplines;
      targetAssignment.discipline = assignmentData.disciplines[0];
    }
    if (assignmentData.branchId !== undefined) {
      targetAssignment.branchId = assignmentData.branchId;
      const branch = mockData.branches.find(b => b.branchId === assignmentData.branchId);
      targetAssignment.branchName = branch?.name;
    }
    if (assignmentData.teamId !== undefined) {
      targetAssignment.teamId = assignmentData.teamId;
      const team = mockData.teams.find(t => t.teamId === assignmentData.teamId);
      targetAssignment.teamName = team?.name;
    }
    if (assignmentData.isPrimary !== undefined) {
      targetAssignment.isPrimary = assignmentData.isPrimary;
    }
    if (assignmentData.isLeader !== undefined) {
      targetAssignment.isLeader = assignmentData.isLeader;
    }

    // Update access scope based on assignment level
    targetAssignment.accessScope = targetAssignment.teamId ? 'TEAM' : 
                                   targetAssignment.branchId ? 'BRANCH' : 'AGENCY';

    console.log('Updated assignment:', targetAssignment);
    return targetAssignment;
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.delay();
    
    // Find and remove the assignment across all users
    for (const user of mockData.users) {
      const index = user.assignments.findIndex(a => a.assignmentId === assignmentId);
      if (index !== -1) {
        user.assignments.splice(index, 1);
        console.log('Deleted assignment:', assignmentId);
        return;
      }
    }
    throw new Error('Assignment not found');
  }

  async bulkAssignUsers(assignments: CreateAssignmentRequest[]): Promise<UserAssignment[]> {
    await this.delay();
    const results: UserAssignment[] = [];
    for (const assignment of assignments) {
      const result = await this.createAssignment(assignment);
      results.push(result);
    }
    return results;
  }

  // Branch Leader Management
  async assignBranchLeader(branchId: number, userId: number): Promise<UserAssignment> {
    await this.delay();
    
    // Find the branch
    const branch = mockData.branches.find(b => b.branchId === branchId);
    if (!branch) throw new Error('Branch not found');

    // Update branch leader
    branch.leaderId = userId;

    // Create or update assignment with Director role and leader status
    const assignmentData: CreateAssignmentRequest = {
      userId: userId,
      agencyId: branch.agencyId,
      branchId: branchId,
      role: 'DIRECTOR',
      roles: ['DIRECTOR'],
      disciplines: ['RN'], // Default discipline
      isPrimary: true,
      isLeader: true
    };

    return await this.createAssignment(assignmentData);
  }

  async assignTeamLeader(teamId: number, userId: number): Promise<UserAssignment> {
    await this.delay();
    
    // Find the team
    const team = mockData.teams.find(t => t.teamId === teamId);
    if (!team) throw new Error('Team not found');

    // Update team leader
    team.leaderId = userId;

    // Find the branch for this team
    const branch = mockData.branches.find(b => b.branchId === team.branchId);
    if (!branch) throw new Error('Branch not found for team');

    // Create or update assignment with Clinical Manager role and leader status
    const assignmentData: CreateAssignmentRequest = {
      userId: userId,
      agencyId: branch.agencyId,
      branchId: team.branchId,
      teamId: teamId,
      role: 'CLINICAL_MANAGER',
      roles: ['CLINICAL_MANAGER'],
      disciplines: ['RN'], // Default discipline
      isPrimary: true,
      isLeader: true
    };

    return await this.createAssignment(assignmentData);
  }

  // ===== END ENHANCED USER MANAGEMENT METHODS =====

  // Sequence Management
  async createSequence(sequence: CreateSequenceRequest): Promise<HuddleSequence> {
    await this.delay();
    const newSequence: HuddleSequence = {
      sequenceId: mockData.sequences.length + 1,
      agencyId: sequence.agencyId,
      agencyName: mockData.agencies.find(a => a.agencyId === sequence.agencyId)?.name || 'Unknown',
      title: sequence.title,
      description: sequence.description,
      topic: sequence.topic,
      totalHuddles: 0,
      estimatedDurationMinutes: sequence.estimatedDurationMinutes,
      sequenceStatus: 'DRAFT',
      createdByUserId: 1, // Mock current user
      createdByUserName: 'Mock User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      huddles: [],
      targets: sequence.targets.map((target, index) => ({
        targetId: index + 1,
        targetType: target.targetType,
        targetValue: target.targetValue,
        targetDisplayName: target.targetValue,
        priority: target.priority || index + 1,
        isRequired: target.isRequired || false
      })),
      visibility: { ...defaultVisibilitySettings, ...sequence.visibility }
    };
    mockData.sequences.push(newSequence);
    return newSequence;
  }

  async getSequence(sequenceId: number): Promise<HuddleSequence> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    return sequence;
  }

  async getSequencesByAgency(agencyId: number): Promise<HuddleSequence[]> {
    await this.delay();
    return mockData.sequences.filter(s => s.agencyId === agencyId);
  }

  async updateSequence(sequenceId: number, sequence: Partial<CreateSequenceRequest>): Promise<HuddleSequence> {
    await this.delay();
    const existingSequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!existingSequence) throw new Error('Sequence not found');
    
    Object.assign(existingSequence, sequence);
    existingSequence.updatedAt = new Date().toISOString();
    return existingSequence;
  }

  async deleteSequence(sequenceId: number): Promise<void> {
    await this.delay();
    const index = mockData.sequences.findIndex(s => s.sequenceId === sequenceId);
    if (index === -1) throw new Error('Sequence not found');
    mockData.sequences.splice(index, 1);
  }

  async updateSequenceStatus(sequenceId: number, status: SequenceStatus): Promise<HuddleSequence> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    
    sequence.sequenceStatus = status;
    sequence.updatedAt = new Date().toISOString();
    return sequence;
  }

  // Additional mock methods for completeness...
  // (Huddle management, progress, scheduling, etc. - keeping existing implementations)

  // User Preferences
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    return user.preferences || {
      notificationSettings: { email: true, sms: false, inApp: true },
      huddleSettings: { autoPlay: false, playbackSpeed: 1.0, preferredLanguage: 'en' },
      dashboardLayout: 'cards'
    };
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    user.preferences = { ...user.preferences, ...preferences };
    return user.preferences!;
  }

  async resetUserPreferencesToDefaults(userId: number): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    const defaultPreferences: UserPreferences = {
      notificationSettings: { email: true, sms: false, inApp: true },
      huddleSettings: { autoPlay: false, playbackSpeed: 1.0, preferredLanguage: 'en' },
      dashboardLayout: 'cards'
    };
    
    user.preferences = defaultPreferences;
    return defaultPreferences;
  }

  // User Invitation (mock implementation)
  async inviteUser(invitationData: {
    email: string;
    name: string;
    agencyId: number;
    invitedBy: number;
    role?: string;
    personalMessage?: string;
  }): Promise<{ success: boolean; invitationId: string }> {
    await this.delay();
    
    // Mock invitation logic
    console.log('Mock invitation sent:', invitationData);
    
    return {
      success: true,
      invitationId: `inv_${Date.now()}`
    };
  }

  // Placeholder methods to maintain compatibility
  async startHuddle(userId: number, huddleId: number): Promise<any> {
    await this.delay();
    return { userId, huddleId, status: 'started' };
  }

  async getUserProgress(userId: number): Promise<any[]> {
    await this.delay();
    return [];
  }

  async getProgressByAgency(agencyId: number): Promise<any[]> {
    await this.delay();
    return [];
  }

  // Add other required methods as placeholders...
  async createHuddle(): Promise<any> { await this.delay(); return {}; }
  async getHuddle(): Promise<any> { await this.delay(); return {}; }
  async getHuddlesBySequence(): Promise<any[]> { await this.delay(); return []; }
  async updateHuddle(): Promise<any> { await this.delay(); return {}; }
  async deleteHuddle(): Promise<void> { await this.delay(); }
  async updateHuddleContent(): Promise<any> { await this.delay(); return {}; }
  async updateProgress(): Promise<any> { await this.delay(); return {}; }
  async completeHuddle(): Promise<any> { await this.delay(); return {}; }
  async createSchedule(): Promise<any> { await this.delay(); return {}; }
  async getSchedulesBySequence(): Promise<any[]> { await this.delay(); return []; }
  async pauseSchedule(): Promise<void> { await this.delay(); }
  async resumeSchedule(): Promise<void> { await this.delay(); }
  async getUserAnalytics(): Promise<any> { await this.delay(); return {}; }
  async getHuddleAnalytics(): Promise<any> { await this.delay(); return {}; }
  async getBranchAnalytics(): Promise<any> { await this.delay(); return {}; }
  async updateSequenceTargets(): Promise<any[]> { await this.delay(); return []; }
  async createOrUpdateSchedule(): Promise<any> { await this.delay(); return {}; }
  async getSequenceSchedule(): Promise<any> { await this.delay(); return null; }
  async publishSequence(sequenceId: number): Promise<any> {}
}

export const mockApiClient = new MockApiClient();