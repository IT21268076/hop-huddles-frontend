// src/data/mockData.ts - Comprehensive Mock Data for Testing

import type {
  Agency,
  Branch,
  Team,
  User,
  UserAssignment,
  HuddleSequence,
  Huddle,
  SequenceTarget,
  UserProgress,
  DeliverySchedule,
  UserPreferences,
  UserAnalytics,
  AgencyAnalytics
} from '../types';

// ===========================================
// MOCK AGENCIES (Single vs Enterprise)
// ===========================================
export const mockAgencies: Agency[] = [
  // Enterprise Agency (where our educator works)
  {
    agencyId: 1,
    name: 'Premier Healthcare Network',
    ccn: undefined, // Enterprise doesn't have main CCN
    agencyType: 'HOME_HEALTH',
    subscriptionPlan: 'ENTERPRISE',
    contactEmail: 'admin@premierhealthcare.com',
    contactPhone: '555-0100',
    address: '123 Healthcare Plaza, Medical City, HC 12345',
    createdAt: '2024-01-15T08:00:00Z',
    userCount: 156,
    agencyStructure: 'ENTERPRISE',
    isActive: true,
    settings: {
      allowMultipleRoles: true,
      requireDisciplineForRoles: ['FIELD_CLINICIAN', 'PRECEPTOR'],
      autoHuddleRelease: true,
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        inAppNotifications: true
      }
    }
  },
  // Single Agency for comparison
  {
    agencyId: 2,
    name: 'Community Care Services',
    ccn: '987654',
    agencyType: 'HOME_CARE',
    subscriptionPlan: 'PREMIUM',
    contactEmail: 'contact@communitycare.com',
    contactPhone: '555-0200',
    address: '456 Care Street, Community Town, CT 67890',
    createdAt: '2024-02-10T09:00:00Z',
    userCount: 32,
    agencyStructure: 'SINGLE',
    isActive: true,
    settings: {
      allowMultipleRoles: false,
      requireDisciplineForRoles: ['FIELD_CLINICIAN'],
      autoHuddleRelease: false,
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true
      }
    }
  }
];

// ===========================================
// MOCK BRANCHES (Enterprise Agency)
// ===========================================
export const mockBranches: Branch[] = [
  {
    branchId: 1,
    agencyId: 1,
    name: 'Downtown Medical Branch',
    location: 'Downtown Medical District',
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    ccn: '123456', // Each branch has its own CCN
    leaderId: 3, // Sarah Johnson (Director)
    settings: {
      autoAssignNewUsers: true,
      defaultUserRoles: ['FIELD_CLINICIAN'],
      huddleVisibilityScope: 'AGENCY_WIDE'
    }
  },
];

// ===========================================
// MOCK TEAMS (Within Branches)
// ===========================================
export const mockTeams: Team[] = [
  // Teams in Downtown Medical Branch
  {
    teamId: 1,
    branchId: 1,
    name: 'Critical Care Team',
    description: 'Specialized team for high-acuity patients',
    isActive: true,
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z',
    leaderId: 4, // Emma Wilson (Clinical Manager)
    targetDisciplines: ['RN', 'PT'],
    maxMembers: 12
  },
  {
    teamId: 2,
    branchId: 1,
    name: 'Rehabilitation Team',
    description: 'Physical and occupational therapy specialists',
    isActive: true,
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    leaderId: 8, // Lisa Chen (Clinical Manager)
    targetDisciplines: ['PT', 'OT', 'SLP'],
    maxMembers: 8
  },
  // Teams in Suburban Care Center
  {
    teamId: 3,
    branchId: 2,
    name: 'Home Care Support',
    description: 'General home care and assistance',
    isActive: true,
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    leaderId: 11, // David Rodriguez (Clinical Manager)
    targetDisciplines: ['HHA', 'LPN', 'RN'],
    maxMembers: 15
  },
  {
    teamId: 4,
    branchId: 2,
    name: 'Mental Health Support',
    description: 'Social work and mental health services',
    isActive: true,
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
    leaderId: 13, // Jennifer Kim (Clinical Manager)
    targetDisciplines: ['MSW'],
    maxMembers: 6
  }
];

// ===========================================
// MOCK USERS WITH COMPREHENSIVE ROLE/DISCIPLINE ASSIGNMENTS
// ===========================================
export const mockUsers: User[] = [
  // 1. Main Educator (Full Access)
  {
    userId: 1,
    auth0Id: 'educator_001',
    email: 'educator@premierhealthcare.com',
    name: 'Dr. James Thompson',
    phone: '555-1001',
    profilePictureUrl: 'https://via.placeholder.com/150/0066CC/FFFFFF?text=JT',
    lastLogin: '2024-03-15T14:30:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 1,
        userId: 1,
        userName: 'Dr. James Thompson',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: undefined,
        branchName: undefined,
        teamId: undefined,
        teamName: undefined,
        role: 'EDUCATOR', // Primary role
        roles: ['EDUCATOR', 'ADMIN'], // Multiple roles
        discipline: 'RN', // Primary discipline
        disciplines: ['RN'], // Multiple disciplines
        isPrimary: true,
        isLeader: false,
        accessScope: 'AGENCY',
        assignedAt: '2024-01-15T08:00:00Z',
        assignedBy: 1,
        isActive: true,
        permissions: {
          canViewAllBranches: true,
          canViewAllTeams: true,
          canManageUsers: true,
          canCreateHuddles: true,
          canManageSchedules: true,
          restrictedActions: []
        }
      }
    ],
    preferences: {
      notificationSettings: {
        email: true,
        sms: true,
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
        playbackQuality: 'high'
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
    }
  },

  // 2. Agency Administrator
  {
    userId: 2,
    auth0Id: 'admin_001',
    email: 'admin@premierhealthcare.com',
    name: 'Maria Rodriguez',
    phone: '555-1002',
    profilePictureUrl: 'https://via.placeholder.com/150/FF6600/FFFFFF?text=MR',
    lastLogin: '2024-03-15T13:45:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 2,
        userId: 2,
        userName: 'Maria Rodriguez',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: undefined,
        branchName: undefined,
        teamId: undefined,
        teamName: undefined,
        role: 'ADMIN',
        roles: ['ADMIN'],
        discipline: 'MSW',
        disciplines: ['MSW'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'AGENCY',
        assignedAt: '2024-01-15T09:00:00Z',
        assignedBy: 1,
        isActive: true,
        permissions: {
          canViewAllBranches: true,
          canViewAllTeams: true,
          canManageUsers: true,
          canCreateHuddles: false, // Admin restriction
          canManageSchedules: true,
          restrictedActions: ['create_huddles']
        }
      }
    ]
  },

  // 4. Clinical Manager (Critical Care Team)
  {
    userId: 4,
    auth0Id: 'clinical_mgr_001',
    email: 'emma.wilson@premierhealthcare.com',
    name: 'Emma Wilson',
    phone: '555-1004',
    profilePictureUrl: 'https://via.placeholder.com/150/CC0066/FFFFFF?text=EW',
    lastLogin: '2024-03-15T11:15:00Z',
    createdAt: '2024-01-17T08:30:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 4,
        userId: 4,
        userName: 'Emma Wilson',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 1,
        teamName: 'Critical Care Team',
        role: 'CLINICAL_MANAGER',
        roles: ['CLINICAL_MANAGER'],
        discipline: 'RN',
        disciplines: ['RN'],
        isPrimary: true,
        isLeader: true, // Team leader
        accessScope: 'TEAM',
        assignedAt: '2024-01-17T08:30:00Z',
        assignedBy: 3,
        isActive: true,
        permissions: {
          canViewAllBranches: false,
          canViewAllTeams: false,
          canManageUsers: true,
          canCreateHuddles: false,
          canManageSchedules: false,
          restrictedActions: []
        }
      }
    ]
  },


  // 6. Branch Director (Suburban)
  {
    userId: 6,
    auth0Id: 'director_002',
    email: 'mike.davis@premierhealthcare.com',
    name: 'Mike Davis',
    phone: '555-1006',
    profilePictureUrl: 'https://via.placeholder.com/150/CC6600/FFFFFF?text=MD',
    lastLogin: '2024-03-15T09:45:00Z',
    createdAt: '2024-01-18T11:30:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 6,
        userId: 6,
        userName: 'Mike Davis',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 2,
        branchName: 'Suburban Care Center',
        teamId: undefined,
        teamName: undefined,
        role: 'DIRECTOR',
        roles: ['DIRECTOR'],
        discipline: 'MSW',
        disciplines: ['MSW'],
        isPrimary: true,
        isLeader: true,
        accessScope: 'BRANCH',
        assignedAt: '2024-01-18T11:30:00Z',
        assignedBy: 1,
        isActive: true,
        permissions: {
          canViewAllBranches: false,
          canViewAllTeams: false,
          canManageUsers: true,
          canCreateHuddles: false,
          canManageSchedules: true,
          restrictedActions: []
        }
      }
    ]
  },

  // Additional users for testing (7-15)
  // 7. Physical Therapist
  {
    userId: 7,
    auth0Id: 'therapist_001',
    email: 'alex.brown@premierhealthcare.com',
    name: 'Alex Brown',
    phone: '555-1007',
    profilePictureUrl: 'https://via.placeholder.com/150/00CCCC/FFFFFF?text=AB',
    lastLogin: '2024-03-15T08:20:00Z',
    createdAt: '2024-01-17T10:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 7,
        userId: 7,
        userName: 'Alex Brown',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 2,
        teamName: 'Rehabilitation Team',
        role: 'FIELD_CLINICIAN',
        roles: ['FIELD_CLINICIAN'],
        discipline: 'PT',
        disciplines: ['PT'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-01-17T10:00:00Z',
        assignedBy: 3,
        isActive: true
      }
    ]
  },

  // 8. Clinical Manager (Rehabilitation Team)
  {
    userId: 8,
    auth0Id: 'clinical_mgr_002',
    email: 'lisa.chen@premierhealthcare.com',
    name: 'Lisa Chen',
    phone: '555-1008',
    profilePictureUrl: 'https://via.placeholder.com/150/CC0099/FFFFFF?text=LC',
    lastLogin: '2024-03-15T07:50:00Z',
    createdAt: '2024-01-17T11:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 8,
        userId: 8,
        userName: 'Lisa Chen',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 2,
        teamName: 'Rehabilitation Team',
        role: 'CLINICAL_MANAGER',
        roles: ['CLINICAL_MANAGER'],
        discipline: 'OT',
        disciplines: ['OT', 'PT'],
        isPrimary: true,
        isLeader: true,
        accessScope: 'TEAM',
        assignedAt: '2024-01-17T11:00:00Z',
        assignedBy: 3,
        isActive: true
      }
    ]
  },

  // 9. Home Health Aide
  {
    userId: 9,
    auth0Id: 'aide_001',
    email: 'mary.garcia@premierhealthcare.com',
    name: 'Mary Garcia',
    phone: '555-1009',
    profilePictureUrl: 'https://via.placeholder.com/150/99CC00/FFFFFF?text=MG',
    lastLogin: '2024-03-14T16:30:00Z',
    createdAt: '2024-01-19T12:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 9,
        userId: 9,
        userName: 'Mary Garcia',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 2,
        branchName: 'Suburban Care Center',
        teamId: 3,
        teamName: 'Home Care Support',
        role: 'FIELD_CLINICIAN',
        roles: ['FIELD_CLINICIAN'],
        discipline: 'HHA',
        disciplines: ['HHA'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-01-19T12:00:00Z',
        assignedBy: 6,
        isActive: true
      }
    ]
  },
  // 13. Clinical Manager (Mental Health Support)
  {
    userId: 13,
    auth0Id: 'clinical_mgr_004',
    email: 'jennifer.kim@premierhealthcare.com',
    name: 'Jennifer Kim',
    phone: '555-1013',
    profilePictureUrl: 'https://via.placeholder.com/150/996633/FFFFFF?text=JK',
    lastLogin: '2024-03-15T04:15:00Z',
    createdAt: '2024-01-19T14:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 13,
        userId: 13,
        userName: 'Jennifer Kim',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 2,
        branchName: 'Suburban Care Center',
        teamId: 4,
        teamName: 'Mental Health Support',
        role: 'CLINICAL_MANAGER',
        roles: ['CLINICAL_MANAGER'],
        discipline: 'MSW',
        disciplines: ['MSW'],
        isPrimary: true,
        isLeader: true,
        accessScope: 'TEAM',
        assignedAt: '2024-01-19T14:00:00Z',
        assignedBy: 6,
        isActive: true
      }
    ]
  },

  // 14. Speech-Language Pathologist
  {
    userId: 14,
    auth0Id: 'slp_001',
    email: 'amanda.taylor@premierhealthcare.com',
    name: 'Amanda Taylor',
    phone: '555-1014',
    profilePictureUrl: 'https://via.placeholder.com/150/CC9900/FFFFFF?text=AT',
    lastLogin: '2024-03-14T20:45:00Z',
    createdAt: '2024-01-22T10:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 14,
        userId: 14,
        userName: 'Amanda Taylor',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 2,
        teamName: 'Rehabilitation Team',
        role: 'FIELD_CLINICIAN',
        roles: ['FIELD_CLINICIAN'],
        discipline: 'SLP',
        disciplines: ['SLP'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-01-22T10:00:00Z',
        assignedBy: 8,
        isActive: true
      }
    ]
  },

  // 15. Inactive User (for testing user status management)
  {
    userId: 15,
    auth0Id: 'inactive_001',
    email: 'former.employee@premierhealthcare.com',
    name: 'Former Employee',
    phone: '555-1015',
    profilePictureUrl: 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=FE',
    lastLogin: '2024-02-15T12:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    isActive: false, // Inactive user
    assignments: [
      {
        assignmentId: 15,
        userId: 15,
        userName: 'Former Employee',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 1,
        teamName: 'Critical Care Team',
        role: 'FIELD_CLINICIAN',
        roles: ['FIELD_CLINICIAN'],
        discipline: 'RN',
        disciplines: ['RN'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-01-10T08:00:00Z',
        assignedBy: 4,
        isActive: false // Inactive assignment
      }
    ]
  }
];

// ===========================================
// MOCK HUDDLE SEQUENCES WITH TARGETING
// ===========================================
export const mockSequences: HuddleSequence[] = [
  // 1. For RN Discipline - Critical Care Focus
  {
    sequenceId: 1,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Advanced Critical Care Protocols',
    description: 'Comprehensive training on critical care protocols for registered nurses',
    topic: 'Critical Care Management',
    totalHuddles: 8,
    estimatedDurationMinutes: 45,
    sequenceStatus: 'PUBLISHED',
    generationPrompt: 'Create training focused on critical care protocols for experienced RNs',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: 1,
    publishedByUserName: 'Dr. James Thompson',
    publishedAt: '2024-02-01T10:00:00Z',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    huddles: [], // Will be populated separately
    targets: [
      {
        targetId: 1,
        targetType: 'DISCIPLINE',
        targetValue: 'RN',
        targetDisplayName: 'Registered Nurse',
        priority: 1,
        isRequired: true
      }
    ],
    analytics: {
      totalUsers: 25,
      completedUsers: 18,
      inProgressUsers: 5,
      notStartedUsers: 2,
      averageCompletionTime: 42,
      completionRate: 72,
      engagementMetrics: {
        totalViews: 156,
        averageSessionTime: 38,
        dropOffPoints: [2, 5]
      }
    },
    visibility: {
      isPublic: true,
      targetRules: [
        {
          ruleId: 'rule_1',
          type: 'INCLUDE',
          targetType: 'DISCIPLINE',
          targetValues: ['RN']
        }
      ]
    }
  },

  // 2. For DIRECTOR Role - Leadership Training
  {
    sequenceId: 2,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Healthcare Leadership Excellence',
    description: 'Leadership development program for healthcare directors and managers',
    topic: 'Leadership Development',
    totalHuddles: 12,
    estimatedDurationMinutes: 60,
    sequenceStatus: 'PUBLISHED',
    generationPrompt: 'Create leadership training for healthcare directors',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: 1,
    publishedByUserName: 'Dr. James Thompson',
    publishedAt: '2024-02-05T11:00:00Z',
    createdAt: '2024-01-28T09:00:00Z',
    updatedAt: '2024-02-05T11:00:00Z',
    huddles: [],
    targets: [
      {
        targetId: 2,
        targetType: 'ROLE',
        targetValue: 'DIRECTOR',
        targetDisplayName: 'Director',
        priority: 1,
        isRequired: true
      },
      {
        targetId: 3,
        targetType: 'ROLE',
        targetValue: 'CLINICAL_MANAGER',
        targetDisplayName: 'Clinical Manager',
        priority: 2,
        isRequired: false
      }
    ],
    analytics: {
      totalUsers: 8,
      completedUsers: 6,
      inProgressUsers: 2,
      notStartedUsers: 0,
      averageCompletionTime: 58,
      completionRate: 75,
      engagementMetrics: {
        totalViews: 48,
        averageSessionTime: 52,
        dropOffPoints: [7, 10]
      }
    },
    visibility: {
      isPublic: true,
      targetRules: [
        {
          ruleId: 'rule_2',
          type: 'INCLUDE',
          targetType: 'ROLE',
          targetValues: ['DIRECTOR', 'CLINICAL_MANAGER']
        }
      ]
    }
  },

  // 3. For Specific Branch - Downtown Medical
  {
    sequenceId: 3,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Downtown Branch Protocols',
    description: 'Specific protocols and procedures for Downtown Medical Branch',
    topic: 'Branch-Specific Training',
    totalHuddles: 6,
    estimatedDurationMinutes: 30,
    sequenceStatus: 'PUBLISHED',
    generationPrompt: 'Create branch-specific training for downtown medical branch',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: 1,
    publishedByUserName: 'Dr. James Thompson',
    publishedAt: '2024-02-10T08:00:00Z',
    createdAt: '2024-02-05T16:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
    huddles: [],
    targets: [
      {
        targetId: 4,
        targetType: 'BRANCH',
        targetValue: '1',
        targetDisplayName: 'Downtown Medical Branch',
        priority: 1,
        isRequired: true
      }
    ],
    analytics: {
      totalUsers: 45,
      completedUsers: 32,
      inProgressUsers: 8,
      notStartedUsers: 5,
      averageCompletionTime: 28,
      completionRate: 71,
      engagementMetrics: {
        totalViews: 234,
        averageSessionTime: 26,
        dropOffPoints: [3]
      }
    },
    visibility: {
      isPublic: false,
      targetRules: [
        {
          ruleId: 'rule_3',
          type: 'INCLUDE',
          targetType: 'BRANCH',
          targetValues: ['1']
        }
      ]
    }
  },

  // 4. For Rehabilitation Team
  {
    sequenceId: 4,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Rehabilitation Best Practices',
    description: 'Advanced rehabilitation techniques for PT, OT, and SLP professionals',
    topic: 'Rehabilitation Therapy',
    totalHuddles: 10,
    estimatedDurationMinutes: 50,
    sequenceStatus: 'PUBLISHED',
    generationPrompt: 'Create rehabilitation training for therapy team',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: 1,
    publishedByUserName: 'Dr. James Thompson',
    publishedAt: '2024-02-12T09:00:00Z',
    createdAt: '2024-02-08T11:00:00Z',
    updatedAt: '2024-02-12T09:00:00Z',
    huddles: [],
    targets: [
      {
        targetId: 5,
        targetType: 'TEAM',
        targetValue: '2',
        targetDisplayName: 'Rehabilitation Team',
        priority: 1,
        isRequired: true
      }
    ],
    analytics: {
      totalUsers: 12,
      completedUsers: 9,
      inProgressUsers: 2,
      notStartedUsers: 1,
      averageCompletionTime: 48,
      completionRate: 75,
      engagementMetrics: {
        totalViews: 86,
        averageSessionTime: 45,
        dropOffPoints: [6]
      }
    },
    visibility: {
      isPublic: true,
      targetRules: [
        {
          ruleId: 'rule_4',
          type: 'INCLUDE',
          targetType: 'TEAM',
          targetValues: ['2']
        }
      ]
    }
  },

  // 5. Multi-Discipline Training
  {
    sequenceId: 5,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Infection Control & Safety',
    description: 'Universal infection control protocols for all healthcare disciplines',
    topic: 'Infection Control',
    totalHuddles: 5,
    estimatedDurationMinutes: 25,
    sequenceStatus: 'PUBLISHED',
    generationPrompt: 'Create infection control training for all disciplines',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: 1,
    publishedByUserName: 'Dr. James Thompson',
    publishedAt: '2024-02-15T10:00:00Z',
    createdAt: '2024-02-12T14:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    huddles: [],
    targets: [
      {
        targetId: 6,
        targetType: 'DISCIPLINE',
        targetValue: 'RN',
        targetDisplayName: 'Registered Nurse',
        priority: 1,
        isRequired: false
      },
      {
        targetId: 7,
        targetType: 'DISCIPLINE',
        targetValue: 'PT',
        targetDisplayName: 'Physical Therapist',
        priority: 2,
        isRequired: false
      },
      {
        targetId: 8,
        targetType: 'DISCIPLINE',
        targetValue: 'OT',
        targetDisplayName: 'Occupational Therapist',
        priority: 3,
        isRequired: false
      },
      {
        targetId: 9,
        targetType: 'DISCIPLINE',
        targetValue: 'HHA',
        targetDisplayName: 'Home Health Aide',
        priority: 4,
        isRequired: false
      },
      {
        targetId: 10,
        targetType: 'DISCIPLINE',
        targetValue: 'LPN',
        targetDisplayName: 'Licensed Practical Nurse',
        priority: 5,
        isRequired: false
      }
    ],
    analytics: {
      totalUsers: 89,
      completedUsers: 67,
      inProgressUsers: 15,
      notStartedUsers: 7,
      averageCompletionTime: 23,
      completionRate: 75,
      engagementMetrics: {
        totalViews: 445,
        averageSessionTime: 22,
        dropOffPoints: []
      }
    },
    visibility: {
      isPublic: true,
      targetRules: [
        {
          ruleId: 'rule_5',
          type: 'INCLUDE',
          targetType: 'DISCIPLINE',
          targetValues: ['RN', 'PT', 'OT', 'HHA', 'LPN']
        }
      ]
    }
  },

  // 6. Scheduled Sequence (Future Release)
  {
    sequenceId: 6,
    agencyId: 1,
    agencyName: 'Premier Healthcare Network',
    title: 'Quality Improvement Initiative 2024',
    description: 'Quarterly quality improvement training program',
    topic: 'Quality Improvement',
    totalHuddles: 15,
    estimatedDurationMinutes: 75,
    sequenceStatus: 'SCHEDULED',
    generationPrompt: 'Create quality improvement training for all staff',
    createdByUserId: 1,
    createdByUserName: 'Dr. James Thompson',
    publishedByUserId: undefined,
    publishedByUserName: undefined,
    publishedAt: undefined,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    huddles: [],
    targets: [
      {
        targetId: 11,
        targetType: 'ROLE',
        targetValue: 'FIELD_CLINICIAN',
        targetDisplayName: 'Field Clinician',
        priority: 1,
        isRequired: true
      },
      {
        targetId: 12,
        targetType: 'ROLE',
        targetValue: 'PRECEPTOR',
        targetDisplayName: 'Preceptor',
        priority: 2,
        isRequired: true
      },
      {
        targetId: 13,
        targetType: 'ROLE',
        targetValue: 'CLINICAL_MANAGER',
        targetDisplayName: 'Clinical Manager',
        priority: 3,
        isRequired: true
      }
    ],
    schedule: {
      scheduleId: 1,
      sequenceId: 6,
      frequencyType: 'WEEKLY',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      releaseTime: '09:00',
      daysOfWeek: ['MONDAY'],
      timeZone: 'America/New_York',
      autoPublish: true,
      sendNotifications: true,
      isActive: true,
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
      notificationSettings: {
        emailReminders: true,
        smsReminders: false,
        inAppNotifications: true,
        reminderTiming: 24
      }
    },
    visibility: {
      isPublic: true,
      targetRules: [
        {
          ruleId: 'rule_6',
          type: 'INCLUDE',
          targetType: 'ROLE',
          targetValues: ['FIELD_CLINICIAN', 'PRECEPTOR', 'CLINICAL_MANAGER']
        }
      ],
      releaseSchedule: {
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        releasePattern: 'SEQUENTIAL',
        intervalDays: 7,
        timeOfDay: '09:00',
        timezone: 'America/New_York'
      }
    }
  }
];

// ===========================================
// MOCK HUDDLES (Individual Huddles within Sequences)
// ===========================================
export const mockHuddles: Huddle[] = [
  // Huddles for Sequence 1 (Critical Care Protocols)
  {
    huddleId: 1,
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    title: 'Introduction to Critical Care',
    orderIndex: 1,
    contentJson: JSON.stringify({
      introduction: 'Welcome to the Critical Care Protocols training series.',
      keyPoints: ['Patient assessment', 'Vital sign monitoring', 'Emergency protocols'],
      conclusion: 'This foundational knowledge will prepare you for advanced protocols.'
    }),
    voiceScript: 'Welcome to our comprehensive critical care training program...',
    pdfUrl: 'https://example.com/huddles/1/content.pdf',
    audioUrl: 'https://example.com/huddles/1/audio.mp3',
    durationMinutes: 5,
    huddleType: 'INTRO',
    isComplete: true,
    createdAt: '2024-01-25T14:15:00Z',
    updatedAt: '2024-01-25T14:15:00Z',
    visibility: {
      isReleased: true,
      releaseDate: '2024-02-01T10:00:00Z',
      visibleToUsers: [1, 3, 4, 5, 10, 15],
      restrictedUsers: []
    },
    analytics: {
      totalViews: 45,
      totalCompletions: 38,
      averageCompletionTime: 4.8,
      averageScore: 92,
      engagementRate: 84
    }
  },
  {
    huddleId: 2,
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    title: 'Patient Assessment Techniques',
    orderIndex: 2,
    contentJson: JSON.stringify({
      introduction: 'Learn advanced patient assessment techniques.',
      keyPoints: ['Systematic assessment', 'Critical indicators', 'Documentation'],
      activities: ['Assessment checklist', 'Practice scenarios']
    }),
    voiceScript: 'Patient assessment is the cornerstone of critical care...',
    pdfUrl: 'https://example.com/huddles/2/content.pdf',
    audioUrl: 'https://example.com/huddles/2/audio.mp3',
    durationMinutes: 8,
    huddleType: 'STANDARD',
    isComplete: true,
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
    prerequisites: [1],
    visibility: {
      isReleased: true,
      releaseDate: '2024-02-01T10:00:00Z',
      visibleToUsers: [1, 3, 4, 5, 10, 15],
      restrictedUsers: []
    }
  },

  // Huddles for Sequence 2 (Leadership Training)
  {
    huddleId: 3,
    sequenceId: 2,
    sequenceTitle: 'Healthcare Leadership Excellence',
    title: 'Fundamentals of Healthcare Leadership',
    orderIndex: 1,
    contentJson: JSON.stringify({
      introduction: 'Understanding leadership in healthcare settings.',
      keyPoints: ['Leadership styles', 'Team dynamics', 'Communication strategies']
    }),
    voiceScript: 'Effective leadership in healthcare requires...',
    pdfUrl: 'https://example.com/huddles/3/content.pdf',
    audioUrl: 'https://example.com/huddles/3/audio.mp3',
    durationMinutes: 6,
    huddleType: 'INTRO',
    isComplete: true,
    createdAt: '2024-01-28T09:15:00Z',
    updatedAt: '2024-01-28T09:15:00Z',
    visibility: {
      isReleased: true,
      releaseDate: '2024-02-05T11:00:00Z',
      visibleToUsers: [1, 2, 3, 4, 6, 8, 11, 13],
      restrictedUsers: []
    }
  }
];

// ===========================================
// MOCK USER PROGRESS DATA
// ===========================================
export const mockUserProgress: UserProgress[] = [
  // Progress for Dr. James Thompson (Educator)
  {
    progressId: 1,
    userId: 1,
    userName: 'Dr. James Thompson',
    huddleId: 1,
    huddleTitle: 'Introduction to Critical Care',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'COMPLETED',
    completionPercentage: 100,
    timeSpentMinutes: 5,
    assessmentScore: 95,
    assessmentAttempts: 1,
    startedAt: '2024-02-01T10:30:00Z',
    completedAt: '2024-02-01T10:35:00Z',
    lastAccessed: '2024-02-01T10:35:00Z',
    feedback: 'Excellent overview of critical care protocols',
    interactions: [
      {
        interactionId: 1,
        interactionType: 'VIEW',
        timestamp: '2024-02-01T10:30:00Z',
        metadata: { duration: 5 }
      },
      {
        interactionId: 2,
        interactionType: 'COMPLETE',
        timestamp: '2024-02-01T10:35:00Z',
        metadata: { score: 95 }
      }
    ]
  },
  {
    progressId: 2,
    userId: 1,
    userName: 'Dr. James Thompson',
    huddleId: 3,
    huddleTitle: 'Fundamentals of Healthcare Leadership',
    sequenceId: 2,
    sequenceTitle: 'Healthcare Leadership Excellence',
    progressStatus: 'COMPLETED',
    completionPercentage: 100,
    timeSpentMinutes: 6,
    assessmentScore: 88,
    assessmentAttempts: 1,
    startedAt: '2024-02-05T11:15:00Z',
    completedAt: '2024-02-05T11:21:00Z',
    lastAccessed: '2024-02-05T11:21:00Z',
    feedback: 'Great foundation for leadership development'
  },

  // Progress for Sarah Johnson (Director)
  {
    progressId: 3,
    userId: 3,
    userName: 'Sarah Johnson',
    huddleId: 3,
    huddleTitle: 'Fundamentals of Healthcare Leadership',
    sequenceId: 2,
    sequenceTitle: 'Healthcare Leadership Excellence',
    progressStatus: 'COMPLETED',
    completionPercentage: 100,
    timeSpentMinutes: 7,
    assessmentScore: 92,
    assessmentAttempts: 1,
    startedAt: '2024-02-05T12:00:00Z',
    completedAt: '2024-02-05T12:07:00Z',
    lastAccessed: '2024-02-05T12:07:00Z',
    feedback: 'Very applicable to my current role'
  },

  // Progress for Emma Wilson (Clinical Manager)
  {
    progressId: 4,
    userId: 4,
    userName: 'Emma Wilson',
    huddleId: 1,
    huddleTitle: 'Introduction to Critical Care',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'IN_PROGRESS',
    completionPercentage: 75,
    timeSpentMinutes: 4,
    assessmentScore: undefined,
    assessmentAttempts: 0,
    startedAt: '2024-02-01T11:00:00Z',
    completedAt: undefined,
    lastAccessed: '2024-02-03T14:30:00Z',
    feedback: undefined
  },
  {
    progressId: 5,
    userId: 4,
    userName: 'Emma Wilson',
    huddleId: 3,
    huddleTitle: 'Fundamentals of Healthcare Leadership',
    sequenceId: 2,
    sequenceTitle: 'Healthcare Leadership Excellence',
    progressStatus: 'COMPLETED',
    completionPercentage: 100,
    timeSpentMinutes: 6,
    assessmentScore: 89,
    assessmentAttempts: 2,
    startedAt: '2024-02-05T13:00:00Z',
    completedAt: '2024-02-05T13:06:00Z',
    lastAccessed: '2024-02-05T13:06:00Z',
    feedback: 'Needed to review team dynamics section'
  },

  // Progress for John Smith (Field Clinician/Preceptor)
  {
    progressId: 6,
    userId: 5,
    userName: 'John Smith',
    huddleId: 1,
    huddleTitle: 'Introduction to Critical Care',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'COMPLETED',
    completionPercentage: 100,
    timeSpentMinutes: 5,
    assessmentScore: 91,
    assessmentAttempts: 1,
    startedAt: '2024-02-02T08:00:00Z',
    completedAt: '2024-02-02T08:05:00Z',
    lastAccessed: '2024-02-02T08:05:00Z',
    feedback: 'Good refresher on critical care basics'
  },
  {
    progressId: 7,
    userId: 5,
    userName: 'John Smith',
    huddleId: 2,
    huddleTitle: 'Patient Assessment Techniques',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'IN_PROGRESS',
    completionPercentage: 50,
    timeSpentMinutes: 4,
    assessmentScore: undefined,
    assessmentAttempts: 0,
    startedAt: '2024-02-02T08:10:00Z',
    completedAt: undefined,
    lastAccessed: '2024-02-04T09:15:00Z',
    feedback: undefined
  },

  // Progress for Jessica Williams (Learner)
  {
    progressId: 8,
    userId: 10,
    userName: 'Jessica Williams',
    huddleId: 1,
    huddleTitle: 'Introduction to Critical Care',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'NOT_STARTED',
    completionPercentage: 0,
    timeSpentMinutes: 0,
    assessmentScore: undefined,
    assessmentAttempts: 0,
    startedAt: undefined,
    completedAt: undefined,
    lastAccessed: '2024-02-01T10:00:00Z', // Just viewed the assignment
    feedback: undefined
  },

  // Progress for Alex Brown (PT)
  {
    progressId: 9,
    userId: 7,
    userName: 'Alex Brown',
    huddleId: 1,
    huddleTitle: 'Introduction to Critical Care',
    sequenceId: 1,
    sequenceTitle: 'Advanced Critical Care Protocols',
    progressStatus: 'SKIPPED',
    completionPercentage: 0,
    timeSpentMinutes: 1,
    assessmentScore: undefined,
    assessmentAttempts: 0,
    startedAt: '2024-02-01T15:00:00Z',
    completedAt: undefined,
    lastAccessed: '2024-02-01T15:01:00Z',
    feedback: 'Not applicable to PT role'
  }
];

// ===========================================
// MOCK ANALYTICS DATA
// ===========================================
export const mockUserAnalytics: Record<number, UserAnalytics> = {
  1: { // Dr. James Thompson (Educator)
    totalAssignedHuddles: 15,
    completedHuddles: 12,
    inProgressHuddles: 2,
    averageScore: 91.5,
    totalTimeSpent: 180,
    streakDays: 14,
    achievements: [
      {
        achievementId: 1,
        name: 'Course Creator',
        description: 'Created your first huddle sequence',
        iconUrl: 'https://example.com/achievements/creator.png',
        unlockedAt: '2024-01-25T14:00:00Z',
        category: 'COMPLETION'
      },
      {
        achievementId: 2,
        name: 'Learning Leader',
        description: 'Completed 10+ huddles',
        iconUrl: 'https://example.com/achievements/leader.png',
        unlockedAt: '2024-02-10T16:00:00Z',
        category: 'COMPLETION'
      }
    ]
  },
  3: { // Sarah Johnson (Director)
    totalAssignedHuddles: 18,
    completedHuddles: 16,
    inProgressHuddles: 1,
    averageScore: 89.2,
    totalTimeSpent: 240,
    streakDays: 21,
    achievements: [
      {
        achievementId: 3,
        name: 'Leadership Excellence',
        description: 'Completed all leadership training modules',
        iconUrl: 'https://example.com/achievements/leadership.png',
        unlockedAt: '2024-02-20T12:00:00Z',
        category: 'COMPLETION'
      }
    ]
  },
  5: { // John Smith (Field Clinician/Preceptor)
    totalAssignedHuddles: 22,
    completedHuddles: 18,
    inProgressHuddles: 3,
    averageScore: 87.8,
    totalTimeSpent: 320,
    streakDays: 8,
    achievements: [
      {
        achievementId: 4,
        name: 'Consistent Learner',
        description: 'Maintained a 7-day learning streak',
        iconUrl: 'https://example.com/achievements/streak.png',
        unlockedAt: '2024-02-15T10:00:00Z',
        category: 'STREAK'
      }
    ]
  },
  10: { // Jessica Williams (Learner)
    totalAssignedHuddles: 15,
    completedHuddles: 8,
    inProgressHuddles: 4,
    averageScore: 82.3,
    totalTimeSpent: 145,
    streakDays: 3,
    achievements: [
      {
        achievementId: 5,
        name: 'Getting Started',
        description: 'Completed your first huddle',
        iconUrl: 'https://example.com/achievements/first.png',
        unlockedAt: '2024-02-05T14:00:00Z',
        category: 'COMPLETION'
      }
    ]
  }
};

export const mockAgencyAnalytics: AgencyAnalytics = {
  totalUsers: 156,
  activeUsers: 142,
  totalSequences: 6,
  publishedSequences: 5,
  totalHuddles: 56,
  completedHuddles: 1247,
  averageEngagement: 78.5,
  topPerformingSequences: mockSequences.slice(0, 3),
  userProgressOverview: {
    completed: 1247,
    inProgress: 234,
    notStarted: 89
  }
};

// ===========================================
// MOCK SCHEDULES
// ===========================================
export const mockSchedules: DeliverySchedule[] = [
  {
    scheduleId: 1,
    sequenceId: 6,
    frequencyType: 'WEEKLY',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    releaseTime: '09:00',
    daysOfWeek: ['MONDAY'],
    timeZone: 'America/New_York',
    autoPublish: true,
    sendNotifications: true,
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    notificationSettings: {
      emailReminders: true,
      smsReminders: false,
      inAppNotifications: true,
      reminderTiming: 24,
      escalationSettings: {
        enabled: true,
        escalateAfterHours: 72,
        escalateToRoles: ['CLINICAL_MANAGER', 'DIRECTOR']
      }
    }
  }
];


// api/sequenceApi.ts - Mock API functions for sequence details functionality
import type { CreateSequenceRequest } from '../types';

// Enhanced mock sequence data with huddles
export const mockSequenceWithHuddles: HuddleSequence = {
  sequenceId: 1,
  agencyId: 1,
  agencyName: 'Premier Healthcare Network',
  title: 'Advanced Wound Care Management',
  description: 'Comprehensive training on advanced wound care techniques, assessment protocols, and evidence-based treatment approaches for healthcare professionals.',
  topic: 'Clinical Skills - Wound Care',
  totalHuddles: 8,
  estimatedDurationMinutes: 45,
  sequenceStatus: 'PUBLISHED',
  generationPrompt: 'Create a comprehensive wound care training sequence covering assessment, treatment, and documentation',
  createdByUserId: 1,
  createdByUserName: 'Dr. James Thompson',
  publishedByUserId: 1,
  publishedByUserName: 'Dr. James Thompson',
  publishedAt: '2024-02-01T10:00:00Z',
  createdAt: '2024-01-20T08:00:00Z',
  updatedAt: '2024-02-15T14:30:00Z',
  
  // Enhanced huddles array
  huddles: [
    {
      huddleId: 101,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Introduction to Wound Assessment',
      orderIndex: 1,
      contentJson: '{"sections": [{"title": "Overview", "content": "Introduction to systematic wound assessment"}]}',
      voiceScript: 'Welcome to our comprehensive wound care series. Today we begin with the fundamentals of wound assessment...',
      pdfUrl: '/mock-pdfs/wound-assessment-intro.pdf',
      audioUrl: '/mock-audio/wound-assessment-intro.mp3',
      durationMinutes: 5,
      huddleType: 'INTRO',
      isComplete: true,
      createdAt: '2024-01-20T08:30:00Z',
      updatedAt: '2024-01-20T08:30:00Z',
      prerequisites: [],
      visibility: {
        isReleased: true,
        releaseDate: '2024-02-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 145,
        totalCompletions: 132,
        averageCompletionTime: 4.8,
        averageScore: 8.9,
        engagementRate: 0.91
      }
    },
    {
      huddleId: 102,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Wound Classification and Staging',
      orderIndex: 2,
      contentJson: '{"sections": [{"title": "Classification Systems", "content": "Understanding different wound classification methods"}]}',
      voiceScript: 'In this session, we\'ll explore the various wound classification systems used in healthcare...',
      pdfUrl: '/mock-pdfs/wound-classification.pdf',
      audioUrl: '/mock-audio/wound-classification.mp3',
      durationMinutes: 8,
      huddleType: 'STANDARD',
      isComplete: true,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
      prerequisites: [101],
      visibility: {
        isReleased: true,
        releaseDate: '2024-02-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 138,
        totalCompletions: 125,
        averageCompletionTime: 7.5,
        averageScore: 8.7,
        engagementRate: 0.88
      }
    },
    {
      huddleId: 103,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Assessment Documentation Standards',
      orderIndex: 3,
      contentJson: '{"sections": [{"title": "Documentation Requirements", "content": "Proper documentation techniques for wound assessment"}]}',
      voiceScript: 'Accurate documentation is crucial for wound care continuity. Let\'s review the essential elements...',
      pdfUrl: '/mock-pdfs/documentation-standards.pdf',
      audioUrl: '/mock-audio/documentation-standards.mp3',
      durationMinutes: 6,
      huddleType: 'STANDARD',
      isComplete: true,
      createdAt: '2024-01-20T09:30:00Z',
      updatedAt: '2024-01-20T09:30:00Z',
      prerequisites: [102],
      visibility: {
        isReleased: true,
        releaseDate: '2024-02-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 134,
        totalCompletions: 121,
        averageCompletionTime: 6.2,
        averageScore: 9.1,
        engagementRate: 0.90
      }
    },
    {
      huddleId: 104,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Dressing Selection Principles',
      orderIndex: 4,
      contentJson: '{"sections": [{"title": "Dressing Types", "content": "Comprehensive guide to modern wound dressings"}]}',
      voiceScript: 'Selecting the appropriate dressing is critical for optimal wound healing. We\'ll explore...',
      pdfUrl: '/mock-pdfs/dressing-selection.pdf',
      audioUrl: '/mock-audio/dressing-selection.mp3',
      durationMinutes: 10,
      huddleType: 'STANDARD',
      isComplete: false,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      prerequisites: [103],
      visibility: {
        isReleased: true,
        releaseDate: '2024-02-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 128,
        totalCompletions: 98,
        averageCompletionTime: 9.8,
        averageScore: 8.4,
        engagementRate: 0.85
      }
    },
    {
      huddleId: 105,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Infection Prevention Protocols',
      orderIndex: 5,
      contentJson: '{"sections": [{"title": "Sterile Technique", "content": "Best practices for infection prevention"}]}',
      voiceScript: 'Preventing wound infections is paramount. In this critical session, we\'ll review...',
      pdfUrl: '/mock-pdfs/infection-prevention.pdf',
      audioUrl: '/mock-audio/infection-prevention.mp3',
      durationMinutes: 7,
      huddleType: 'STANDARD',
      isComplete: false,
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      prerequisites: [104],
      visibility: {
        isReleased: true,
        releaseDate: '2024-02-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 115,
        totalCompletions: 87,
        averageCompletionTime: 6.9,
        averageScore: 8.8,
        engagementRate: 0.82
      }
    },
    {
      huddleId: 106,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Advanced Treatment Modalities',
      orderIndex: 6,
      contentJson: '{"sections": [{"title": "Modern Treatments", "content": "Cutting-edge wound care technologies"}]}',
      voiceScript: 'Modern wound care incorporates advanced technologies and treatment modalities...',
      pdfUrl: '/mock-pdfs/advanced-treatments.pdf',
      audioUrl: '/mock-audio/advanced-treatments.mp3',
      durationMinutes: 12,
      huddleType: 'INTERACTIVE',
      isComplete: false,
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-20T11:00:00Z',
      prerequisites: [105],
      visibility: {
        isReleased: false,
        releaseDate: '2024-03-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 89,
        totalCompletions: 62,
        averageCompletionTime: 11.5,
        averageScore: 8.2,
        engagementRate: 0.78
      }
    },
    {
      huddleId: 107,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Assessment Competency Check',
      orderIndex: 7,
      contentJson: '{"sections": [{"title": "Practical Assessment", "content": "Hands-on competency evaluation"}]}',
      voiceScript: 'This assessment will evaluate your wound care competency. Please review the case scenarios...',
      pdfUrl: '/mock-pdfs/competency-assessment.pdf',
      audioUrl: '/mock-audio/competency-assessment.mp3',
      durationMinutes: 15,
      huddleType: 'ASSESSMENT',
      isComplete: false,
      createdAt: '2024-01-20T11:30:00Z',
      updatedAt: '2024-01-20T11:30:00Z',
      prerequisites: [106],
      visibility: {
        isReleased: false,
        releaseDate: '2024-03-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 67,
        totalCompletions: 45,
        averageCompletionTime: 14.2,
        averageScore: 7.9,
        engagementRate: 0.75
      }
    },
    {
      huddleId: 108,
      sequenceId: 1,
      sequenceTitle: 'Advanced Wound Care Management',
      title: 'Course Summary and Next Steps',
      orderIndex: 8,
      contentJson: '{"sections": [{"title": "Key Takeaways", "content": "Summary of critical wound care concepts"}]}',
      voiceScript: 'Congratulations on completing this comprehensive wound care training. Let\'s review...',
      pdfUrl: '/mock-pdfs/course-summary.pdf',
      audioUrl: '/mock-audio/course-summary.mp3',
      durationMinutes: 5,
      huddleType: 'SUMMARY',
      isComplete: false,
      createdAt: '2024-01-20T12:00:00Z',
      updatedAt: '2024-01-20T12:00:00Z',
      prerequisites: [107],
      visibility: {
        isReleased: false,
        releaseDate: '2024-03-01T10:00:00Z',
        visibleToUsers: [],
        restrictedUsers: []
      },
      analytics: {
        totalViews: 45,
        totalCompletions: 32,
        averageCompletionTime: 4.8,
        averageScore: 9.3,
        engagementRate: 0.89
      }
    }
  ],

  // Targeting information
  targets: [
    {
      targetId: 1,
      targetType: 'DISCIPLINE',
      targetValue: 'RN',
      targetDisplayName: 'Registered Nurse',
      priority: 1,
      isRequired: true
    },
    {
      targetId: 2,
      targetType: 'DISCIPLINE',
      targetValue: 'LPN',
      targetDisplayName: 'Licensed Practical Nurse',
      priority: 2,
      isRequired: true
    },
    {
      targetId: 3,
      targetType: 'ROLE',
      targetValue: 'FIELD_CLINICIAN',
      targetDisplayName: 'Field Clinician',
      priority: 1,
      isRequired: true
    },
    {
      targetId: 4,
      targetType: 'ROLE',
      targetValue: 'CLINICAL_MANAGER',
      targetDisplayName: 'Clinical Manager',
      priority: 2,
      isRequired: false
    }
  ],

  // Analytics data
  analytics: {
    totalUsers: 152,
    completedUsers: 98,
    inProgressUsers: 34,
    notStartedUsers: 20,
    averageCompletionTime: 42.5,
    completionRate: 64.5,
    engagementMetrics: {
      totalViews: 1247,
      averageSessionTime: 18.3,
      dropOffPoints: [4, 6, 7]
    }
  },

  // Visibility settings
  visibility: {
    isPublic: false,
    targetRules: [
      {
        ruleId: 'rule_1',
        type: 'INCLUDE',
        targetType: 'DISCIPLINE',
        targetValues: ['RN', 'LPN'],
        conditions: {
          minExperience: 6
        }
      },
      {
        ruleId: 'rule_2',
        type: 'INCLUDE',
        targetType: 'ROLE',
        targetValues: ['FIELD_CLINICIAN', 'CLINICAL_MANAGER']
      }
    ],
    releaseSchedule: {
      startDate: '2024-02-01T10:00:00Z',
      releasePattern: 'SEQUENTIAL',
      intervalDays: 7,
      timeOfDay: '09:00',
      timezone: 'America/New_York'
    }
  }
};

// Mock API functions
export const sequenceApi = {
  // Get sequence by ID with full details
  getSequenceById: async (sequenceId: number): Promise<HuddleSequence> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (sequenceId === 1) {
      return mockSequenceWithHuddles;
    } else {
      // Return a different mock sequence for other IDs
      return {
        ...mockSequenceWithHuddles,
        sequenceId,
        title: `Sample Sequence ${sequenceId}`,
        description: `This is a sample sequence with ID ${sequenceId}`,
        huddles: mockSequenceWithHuddles.huddles.map(huddle => ({
          ...huddle,
          sequenceId,
          huddleId: huddle.huddleId + (sequenceId - 1) * 100
        })),
        targets: mockSequenceWithHuddles.targets.map((target, idx) => ({
          ...target,
          targetId: target.targetId ?? idx + 1,
          targetDisplayName: target.targetDisplayName ?? String(target.targetValue)
        }))
      };
    }
  },

  // Update sequence
  updateSequence: async (sequenceId: number, updates: Partial<CreateSequenceRequest>): Promise<HuddleSequence> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real API, this would update the sequence in the database
    return {
      ...mockSequenceWithHuddles,
      ...updates,
      sequenceId,
      updatedAt: new Date().toISOString()
    };
  },

  // Get huddle by ID
  getHuddleById: async (huddleId: number): Promise<Huddle> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const huddle = mockSequenceWithHuddles.huddles.find(h => h.huddleId === huddleId);
    if (!huddle) {
      throw new Error('Huddle not found');
    }
    
    return huddle;
  },

  // Update huddle
  updateHuddle: async (huddleId: number, updates: Partial<Huddle>): Promise<Huddle> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const huddle = mockSequenceWithHuddles.huddles.find(h => h.huddleId === huddleId);
    if (!huddle) {
      throw new Error('Huddle not found');
    }
    
    return {
      ...huddle,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },

  // Get sequence analytics
  getSequenceAnalytics: async (sequenceId: number) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      sequenceId,
      totalUsers: 152,
      completedUsers: 98,
      inProgressUsers: 34,
      notStartedUsers: 20,
      averageCompletionTime: 42.5,
      completionRate: 64.5,
      engagementMetrics: {
        totalViews: 1247,
        averageSessionTime: 18.3,
        dropOffPoints: [4, 6, 7]
      },
      huddleMetrics: mockSequenceWithHuddles.huddles.map(huddle => ({
        huddleId: huddle.huddleId,
        title: huddle.title,
        views: huddle.analytics?.totalViews || 0,
        completions: huddle.analytics?.totalCompletions || 0,
        averageTime: huddle.analytics?.averageCompletionTime || 0,
        engagementRate: huddle.analytics?.engagementRate || 0
      }))
    };
  },

  // Duplicate sequence
  duplicateSequence: async (sequenceId: number): Promise<HuddleSequence> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const originalSequence = await sequenceApi.getSequenceById(sequenceId);
    const newSequenceId = Date.now(); // Mock new ID
    
    return {
      ...originalSequence,
      sequenceId: newSequenceId,
      title: `${originalSequence.title} (Copy)`,
      sequenceStatus: 'DRAFT',
      publishedAt: undefined,
      publishedByUserId: undefined,
      publishedByUserName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      huddles: originalSequence.huddles.map((huddle, index) => ({
        ...huddle,
        huddleId: newSequenceId * 100 + index + 1,
        sequenceId: newSequenceId,
        isComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
  },

  // Export sequence
  exportSequence: async (sequenceId: number, format: 'PDF' | 'DOCX' | 'JSON') => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would generate and return a download link
    return {
      downloadUrl: `/api/sequences/${sequenceId}/export?format=${format.toLowerCase()}`,
      fileName: `sequence_${sequenceId}_export.${format.toLowerCase()}`,
      fileSize: '2.4 MB'
    };
  },

  // Get teams for branch (for assignment filtering)
  getTeamsByAgency: async (agencyId: number) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        teamId: 1,
        branchId: 1,
        name: 'Clinical Team Alpha',
        description: 'Primary clinical care team',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        leaderId: 2,
        targetDisciplines: ['RN', 'LPN'],
        maxMembers: 15
      },
      {
        teamId: 2,
        branchId: 1,
        name: 'Therapy Team',
        description: 'Physical and occupational therapy specialists',
        isActive: true,
        createdAt: '2024-01-16T09:00:00Z',
        updatedAt: '2024-01-16T09:00:00Z',
        leaderId: 3,
        targetDisciplines: ['PT', 'OT', 'SLP'],
        maxMembers: 8
      }
    ];
  }
};

// Integration with existing API client
export const extendApiClient = (apiClient: any) => {
  return {
    ...apiClient,
    ...sequenceApi
  };
};

// ===========================================
// EXPORT ALL MOCK DATA
// ===========================================
export const mockData = {
  agencies: mockAgencies,
  branches: mockBranches,
  teams: mockTeams,
  users: mockUsers,
  sequences: mockSequences,
  huddles: mockHuddles,
  userProgress: mockUserProgress,
  userAnalytics: mockUserAnalytics,
  agencyAnalytics: mockAgencyAnalytics,
  schedules: mockSchedules
};

export default mockData;