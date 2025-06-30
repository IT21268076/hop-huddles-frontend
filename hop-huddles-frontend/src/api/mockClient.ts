// src/api/mockClient.ts - Fixed Mock API Client

import type {
  Agency,
  Branch,
  Team,
  User,
  UserAssignment,
  HuddleSequence,
  Huddle,
  UserProgress,
  CreateAgencyRequest,
  CreateBranchRequest,
  CreateTeamRequest,
  CreateUserRequest,
  CreateAssignmentRequest,
  CreateSequenceRequest,
  CreateHuddleRequest,
  DeliverySchedule,
  UserPreferences,
  SequenceTarget,
  AgencySettings,
  BranchSettings,
  AssignmentPermissions,
  VisibilitySettings,
  CreateScheduleRequest
} from '../types';

import mockData from '../data/mockData';

// Default values for optional settings
const defaultAgencySettings: AgencySettings = {
  allowMultipleRoles: true,
  requireDisciplineForRoles: ['FIELD_CLINICIAN', 'PRECEPTOR'],
  autoHuddleRelease: true,
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  }
};

const defaultBranchSettings: BranchSettings = {
  autoAssignNewUsers: true,
  defaultUserRoles: ['FIELD_CLINICIAN'],
  huddleVisibilityScope: 'AGENCY_WIDE'
};

const defaultUserPreferences: UserPreferences = {
  notificationSettings: {
    email: true,
    sms: false,
    inApp: true,
    huddleReleases: true,
    completionReminders: true,
    achievementUnlocks: true,
    weeklyDigest: true,
    reminderTiming: 24
  },
  huddleSettings: {
    autoPlay: false,
    playbackSpeed: 1.0,
    preferredLanguage: 'en',
    showTranscripts: true,
    enableCaptions: false,
    playbackQuality: 'medium'
  },
  dashboardLayout: 'cards',
  dashboardSettings: {
    showQuickStats: true,
    showRecentProgress: true,
    showUpcomingHuddles: true,
    defaultView: 'overview',
    widgetOrder: ['stats', 'progress', 'upcoming', 'achievements']
  },
  appearance: {
    theme: 'auto',
    colorScheme: 'blue',
    fontSize: 'medium',
    density: 'comfortable'
  },
  privacy: {
    shareProgressWithTeam: true,
    allowPerformanceComparisons: false,
    shareAchievements: true,
    dataAnalyticsOptIn: true
  }
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

  async getBranchesByAgency(agencyId: number): Promise<Branch[]> {
    await this.delay();
    return mockData.branches.filter(b => b.agencyId === agencyId);
  }

  async updateBranch(branchId: number, branch: Partial<CreateBranchRequest>): Promise<Branch> {
    await this.delay();
    const existingBranch = mockData.branches.find(b => b.branchId === branchId);
    if (!existingBranch) throw new Error('Branch not found');
    
    Object.assign(existingBranch, branch, { updatedAt: new Date().toISOString() });
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

  async getTeamsByBranch(branchId: number): Promise<Team[]> {
    await this.delay();
    return mockData.teams.filter(t => t.branchId === branchId);
  }

  async updateTeam(teamId: number, team: Partial<CreateTeamRequest>): Promise<Team> {
    await this.delay();
    const existingTeam = mockData.teams.find(t => t.teamId === teamId);
    if (!existingTeam) throw new Error('Team not found');
    
    Object.assign(existingTeam, team, { updatedAt: new Date().toISOString() });
    return existingTeam;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.delay();
    const index = mockData.teams.findIndex(t => t.teamId === teamId);
    if (index === -1) throw new Error('Team not found');
    mockData.teams.splice(index, 1);
  }

  // User Management
  async createUser(user: CreateUserRequest): Promise<User> {
    await this.delay();
    const newUser: User = {
      userId: mockData.users.length + 1,
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      profilePictureUrl: user.profilePictureUrl,
      lastLogin: undefined,
      createdAt: new Date().toISOString(),
      assignments: [],
      isActive: true,
      preferences: user.preferences ? { ...defaultUserPreferences, ...user.preferences } : defaultUserPreferences
    };
    mockData.users.push(newUser);
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
    return mockData.users.filter(u => 
      u.assignments.some(a => a.agencyId === agencyId)
    );
  }

  async updateUser(userId: number, user: Partial<CreateUserRequest>): Promise<User> {
    await this.delay();
    const existingUser = mockData.users.find(u => u.userId === userId);
    if (!existingUser) throw new Error('User not found');
    
    Object.assign(existingUser, user);
    if (user.preferences) {
      existingUser.preferences = { ...defaultUserPreferences, ...existingUser.preferences, ...user.preferences };
    }
    return existingUser;
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    user.isActive = isActive;
    user.assignments.forEach(a => a.isActive = isActive);
    return user;
  }

  // User Assignment Management
  async createAssignment(assignment: CreateAssignmentRequest): Promise<UserAssignment> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === assignment.userId);
    if (!user) throw new Error('User not found');
    
    const agency = mockData.agencies.find(a => a.agencyId === assignment.agencyId);
    const branch = assignment.branchId ? mockData.branches.find(b => b.branchId === assignment.branchId) : undefined;
    const team = assignment.teamId ? mockData.teams.find(t => t.teamId === assignment.teamId) : undefined;
    
    const newAssignment: UserAssignment = {
      assignmentId: Date.now(), // Simple ID generation
      userId: assignment.userId,
      userName: user.name,
      agencyId: assignment.agencyId,
      agencyName: agency?.name || 'Unknown Agency',
      branchId: assignment.branchId,
      branchName: branch?.name,
      teamId: assignment.teamId,
      teamName: team?.name,
      role: assignment.role,
      roles: assignment.roles || [assignment.role],
      discipline: assignment.discipline,
      disciplines: assignment.disciplines || (assignment.discipline ? [assignment.discipline] : []),
      isPrimary: assignment.isPrimary,
      isLeader: assignment.isLeader,
      accessScope: assignment.teamId ? 'TEAM' : assignment.branchId ? 'BRANCH' : 'AGENCY',
      assignedAt: new Date().toISOString(),
      assignedBy: 1, // Assigned by educator
      isActive: true,
      permissions: assignment.permissions ? { ...defaultAssignmentPermissions, ...assignment.permissions } : defaultAssignmentPermissions
    };
    
    user.assignments.push(newAssignment);
    return newAssignment;
  }

  async getAssignmentsByUser(userId: number): Promise<UserAssignment[]> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    return user?.assignments || [];
  }

  async getAssignmentsByAgency(agencyId: number): Promise<UserAssignment[]> {
    await this.delay();
    const assignments: UserAssignment[] = [];
    mockData.users.forEach(user => {
      user.assignments.forEach(assignment => {
        if (assignment.agencyId === agencyId) {
          assignments.push(assignment);
        }
      });
    });
    return assignments;
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.delay();
    mockData.users.forEach(user => {
      const index = user.assignments.findIndex(a => a.assignmentId === assignmentId);
      if (index !== -1) {
        user.assignments.splice(index, 1);
      }
    });
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
    const branch = mockData.branches.find(b => b.branchId === branchId);
    if (!branch) throw new Error('Branch not found');
    
    branch.leaderId = userId;
    
    // Create or update assignment
    return this.createAssignment({
      userId,
      agencyId: branch.agencyId,
      branchId,
      role: 'DIRECTOR',
      roles: ['DIRECTOR'],
      disciplines: [],
      isPrimary: false,
      isLeader: true
    });
  }

  async assignTeamLeader(teamId: number, userId: number): Promise<UserAssignment> {
    await this.delay();
    const team = mockData.teams.find(t => t.teamId === teamId);
    if (!team) throw new Error('Team not found');
    
    team.leaderId = userId;
    
    const branch = mockData.branches.find(b => b.branchId === team.branchId);
    
    return this.createAssignment({
      userId,
      agencyId: branch?.agencyId || 0,
      branchId: team.branchId,
      teamId,
      role: 'CLINICAL_MANAGER',
      roles: ['CLINICAL_MANAGER'],
      disciplines: [],
      isPrimary: false,
      isLeader: true
    });
  }

  // Huddle Sequence Management
  async createSequence(sequence: CreateSequenceRequest, createdByUserId: number): Promise<HuddleSequence> {
    await this.delay();
    const creator = mockData.users.find(u => u.userId === createdByUserId);
    const agency = mockData.agencies.find(a => a.agencyId === sequence.agencyId);
    
    // Create complete schedule object if provided
    let completeSchedule: DeliverySchedule | undefined = undefined;
    if (sequence.schedule) {
      completeSchedule = {
        scheduleId: Date.now(), // Generate a unique ID
        sequenceId: mockData.sequences.length + 1, // This will be the new sequence ID
        frequencyType: sequence.schedule.frequencyType || 'WEEKLY',
        startDate: sequence.schedule.startDate || new Date().toISOString().split('T')[0],
        endDate: sequence.schedule.endDate,
        releaseTime: sequence.schedule.releaseTime || '09:00',
        daysOfWeek: sequence.schedule.daysOfWeek,
        timeZone: sequence.schedule.timeZone || 'America/New_York',
        autoPublish: sequence.schedule.autoPublish ?? true,
        sendNotifications: sequence.schedule.sendNotifications ?? true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notificationSettings: sequence.schedule.notificationSettings
      };
    }
    
    const newSequence: HuddleSequence = {
      sequenceId: mockData.sequences.length + 1,
      agencyId: sequence.agencyId,
      agencyName: agency?.name || 'Unknown Agency',
      title: sequence.title,
      description: sequence.description,
      topic: sequence.topic,
      totalHuddles: 0,
      estimatedDurationMinutes: sequence.estimatedDurationMinutes,
      sequenceStatus: 'DRAFT',
      generationPrompt: undefined,
      createdByUserId,
      createdByUserName: creator?.name || 'Unknown',
      publishedByUserId: undefined,
      publishedByUserName: undefined,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      huddles: [],
      targets: sequence.targets.map((t, index) => ({
        targetId: Date.now() + index,
        targetType: t.targetType,
        targetValue: t.targetValue,
        targetDisplayName: t.targetValue,
        priority: t.priority || 1,
        isRequired: t.isRequired || false
      })),
      schedule: completeSchedule,
      analytics: undefined,
      visibility: sequence.visibility ? { ...defaultVisibilitySettings, ...sequence.visibility } : defaultVisibilitySettings
    };
    
    mockData.sequences.push(newSequence);
    
    // If schedule was created, add it to the schedules array
    if (completeSchedule) {
      mockData.schedules.push(completeSchedule);
    }
    
    return newSequence;
  }

  async getSequencesByAgency(agencyId: number): Promise<HuddleSequence[]> {
    await this.delay();
    return mockData.sequences.filter(s => s.agencyId === agencyId);
  }

  async getSequence(sequenceId: number): Promise<HuddleSequence> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    return sequence;
  }

  async updateSequenceStatus(sequenceId: number, status: any, updatedByUserId: number): Promise<HuddleSequence> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    
    sequence.sequenceStatus = status;
    sequence.updatedAt = new Date().toISOString();
    
    if (status === 'PUBLISHED') {
      const publisher = mockData.users.find(u => u.userId === updatedByUserId);
      sequence.publishedByUserId = updatedByUserId;
      sequence.publishedByUserName = publisher?.name || 'Unknown';
      sequence.publishedAt = new Date().toISOString();
    }
    
    return sequence;
  }

  async publishSequence(sequenceId: number, publishedByUserId: number): Promise<HuddleSequence> {
    return this.updateSequenceStatus(sequenceId, 'PUBLISHED', publishedByUserId);
  }

  async deleteSequence(sequenceId: number): Promise<void> {
    await this.delay();
    const index = mockData.sequences.findIndex(s => s.sequenceId === sequenceId);
    if (index === -1) throw new Error('Sequence not found');
    mockData.sequences.splice(index, 1);
  }

  async updateSequenceTargets(sequenceId: number, targets: SequenceTarget[]): Promise<SequenceTarget[]> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    
    sequence.targets = targets;
    sequence.updatedAt = new Date().toISOString();
    return targets;
  }

  // Progress Management
  async getProgressByAgency(agencyId: number, filters?: any): Promise<UserProgress[]> {
    await this.delay();
    return mockData.userProgress.filter(p => {
      // Filter by agency (check if user belongs to agency)
      const user = mockData.users.find(u => u.userId === p.userId);
      const belongsToAgency = user?.assignments.some(a => a.agencyId === agencyId);
      
      if (!belongsToAgency) return false;
      
      // Apply additional filters if provided
      if (filters?.userId && p.userId !== filters.userId) return false;
      if (filters?.sequenceId && p.sequenceId !== filters.sequenceId) return false;
      if (filters?.status && p.progressStatus !== filters.status) return false;
      
      return true;
    });
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    await this.delay();
    return mockData.userProgress.filter(p => p.userId === userId);
  }

  // Analytics
  async getUserAnalytics(agencyId: number): Promise<Record<number, any>> {
    await this.delay();
    return mockData.userAnalytics;
  }

  async getHuddleAnalytics(agencyId: number): Promise<Record<number, any>> {
    await this.delay();
    return {}; // Placeholder for huddle analytics
  }

  async getBranchAnalytics(agencyId: number): Promise<Record<number, any>> {
    await this.delay();
    // Generate branch analytics from teams
    const branchAnalytics: Record<number, any> = {};
    mockData.branches.forEach(branch => {
      if (branch.agencyId === agencyId) {
        branchAnalytics[branch.branchId] = {
          teamCount: mockData.teams.filter(t => t.branchId === branch.branchId).length,
          userCount: mockData.users.filter(u => 
            u.assignments.some(a => a.branchId === branch.branchId)
          ).length
        };
      }
    });
    return branchAnalytics;
  }

  // Schedule Management
  async createSchedule(sequenceId: number, schedule: CreateScheduleRequest): Promise<DeliverySchedule> {
    await this.delay();
    const newSchedule: DeliverySchedule = {
      scheduleId: mockData.schedules.length + 1,
      sequenceId,
      frequencyType: schedule.frequencyType,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      releaseTime: schedule.releaseTime,
      daysOfWeek: schedule.daysOfWeek,
      timeZone: schedule.timeZone,
      autoPublish: schedule.autoPublish,
      sendNotifications: schedule.sendNotifications,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    //   notificationSettings: schedule.notificationSettings
    };
    mockData.schedules.push(newSchedule);
    return newSchedule;
  }

  async getSchedulesBySequence(sequenceId: number): Promise<DeliverySchedule[]> {
    await this.delay();
    return mockData.schedules.filter(s => s.sequenceId === sequenceId);
  }

  async pauseSchedule(scheduleId: number): Promise<void> {
    await this.delay();
    const schedule = mockData.schedules.find(s => s.scheduleId === scheduleId);
    if (schedule) {
      schedule.isActive = false;
      schedule.updatedAt = new Date().toISOString();
    }
  }

  async resumeSchedule(scheduleId: number): Promise<void> {
    await this.delay();
    const schedule = mockData.schedules.find(s => s.scheduleId === scheduleId);
    if (schedule) {
      schedule.isActive = true;
      schedule.updatedAt = new Date().toISOString();
    }
  }

  async getSequenceSchedule(sequenceId: number): Promise<DeliverySchedule | null> {
    await this.delay();
    return mockData.schedules.find(s => s.sequenceId === sequenceId) || null;
  }

  async createOrUpdateSchedule(sequenceId: number, schedule: Partial<DeliverySchedule>): Promise<DeliverySchedule> {
    await this.delay();
    const existingSchedule = mockData.schedules.find(s => s.sequenceId === sequenceId);
    
    if (existingSchedule) {
      Object.assign(existingSchedule, schedule, { updatedAt: new Date().toISOString() });
      return existingSchedule;
    } else {
      const newSchedule: DeliverySchedule = {
        scheduleId: mockData.schedules.length + 1,
        sequenceId,
        frequencyType: 'WEEKLY',
        startDate: new Date().toISOString().split('T')[0],
        releaseTime: '09:00',
        timeZone: 'America/New_York',
        autoPublish: true,
        sendNotifications: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...schedule
      };
      mockData.schedules.push(newSchedule);
      return newSchedule;
    }
  }

  // User Preferences
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    return user?.preferences || defaultUserPreferences;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    const userPref = user.preferences = { ...defaultUserPreferences, ...user.preferences, ...preferences };
    return userPref;
  }

  async resetUserPreferencesToDefaults(userId: number): Promise<UserPreferences> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    
    user.preferences = { ...defaultUserPreferences };
    return user.preferences;
  }

  // Huddle Management
  async createHuddle(huddle: CreateHuddleRequest): Promise<Huddle> {
    await this.delay();
    const sequence = mockData.sequences.find(s => s.sequenceId === huddle.sequenceId);
    
    const newHuddle: Huddle = {
      huddleId: mockData.huddles.length + 1,
      sequenceId: huddle.sequenceId,
      sequenceTitle: sequence?.title || 'Unknown Sequence',
      title: huddle.title,
      orderIndex: huddle.orderIndex,
      contentJson: huddle.contentJson,
      voiceScript: huddle.voiceScript,
      pdfUrl: undefined,
      audioUrl: undefined,
      durationMinutes: huddle.durationMinutes,
      huddleType: huddle.huddleType,
      isComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prerequisites: huddle.prerequisites,
    //   visibility: huddle.visibility
    };
    
    mockData.huddles.push(newHuddle);
    
    // Update sequence total huddles count
    if (sequence) {
      sequence.totalHuddles = mockData.huddles.filter(h => h.sequenceId === huddle.sequenceId).length;
      sequence.updatedAt = new Date().toISOString();
    }
    
    return newHuddle;
  }

  async updateHuddleContent(huddleId: number, content: { contentJson?: string; voiceScript?: string }): Promise<Huddle> {
    await this.delay();
    const huddle = mockData.huddles.find(h => h.huddleId === huddleId);
    if (!huddle) throw new Error('Huddle not found');
    
    if (content.contentJson !== undefined) huddle.contentJson = content.contentJson;
    if (content.voiceScript !== undefined) huddle.voiceScript = content.voiceScript;
    huddle.updatedAt = new Date().toISOString();
    
    return huddle;
  }

  async getHuddlesBySequence(sequenceId: number): Promise<Huddle[]> {
    await this.delay();
    return mockData.huddles.filter(h => h.sequenceId === sequenceId);
  }

  async getHuddle(huddleId: number): Promise<Huddle> {
    await this.delay();
    const huddle = mockData.huddles.find(h => h.huddleId === huddleId);
    if (!huddle) throw new Error('Huddle not found');
    return huddle;
  }

  // Progress tracking
  async startHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    await this.delay();
    const user = mockData.users.find(u => u.userId === userId);
    const huddle = mockData.huddles.find(h => h.huddleId === huddleId);
    const sequence = huddle ? mockData.sequences.find(s => s.sequenceId === huddle.sequenceId) : undefined;
    
    const newProgress: UserProgress = {
      progressId: mockData.userProgress.length + 1,
      userId,
      userName: user?.name || 'Unknown',
      huddleId,
      huddleTitle: huddle?.title || 'Unknown',
      sequenceId: huddle?.sequenceId || 0,
      sequenceTitle: sequence?.title || 'Unknown',
      progressStatus: 'IN_PROGRESS',
      completionPercentage: 0,
      timeSpentMinutes: 0,
      assessmentScore: undefined,
      assessmentAttempts: 0,
      startedAt: new Date().toISOString(),
      completedAt: undefined,
      lastAccessed: new Date().toISOString(),
      feedback: undefined
    };
    mockData.userProgress.push(newProgress);
    return newProgress;
  }

  async completeHuddle(userId: number, huddleId: number): Promise<UserProgress> {
    await this.delay();
    const progress = mockData.userProgress.find(p => p.userId === userId && p.huddleId === huddleId);
    if (progress) {
      progress.progressStatus = 'COMPLETED';
      progress.completionPercentage = 100;
      progress.completedAt = new Date().toISOString();
      progress.lastAccessed = new Date().toISOString();
      return progress;
    }
    
    // If no existing progress, create completed progress
    return this.startHuddle(userId, huddleId).then(newProgress => {
      newProgress.progressStatus = 'COMPLETED';
      newProgress.completionPercentage = 100;
      newProgress.completedAt = new Date().toISOString();
      return newProgress;
    });
  }
}

export const mockApiClient = new MockApiClient();