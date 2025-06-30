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
  {
    branchId: 2,
    agencyId: 1,
    name: 'Suburban Care Center',
    location: 'Suburban District',
    isActive: true,
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
    ccn: '234567',
    leaderId: 6, // Mike Davis (Director)
    settings: {
      autoAssignNewUsers: false,
      defaultUserRoles: ['LEARNER'],
      huddleVisibilityScope: 'BRANCH_ONLY'
    }
  },
  {
    branchId: 3,
    agencyId: 1,
    name: 'Regional Wellness Hub',
    location: 'Regional Medical Campus',
    isActive: true,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    ccn: '345678',
    leaderId: undefined, // No director assigned yet
    settings: {
      autoAssignNewUsers: true,
      defaultUserRoles: ['FIELD_CLINICIAN', 'LEARNER'],
      huddleVisibilityScope: 'AGENCY_WIDE'
    }
  }
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

  // 3. Branch Director (Downtown)
  {
    userId: 3,
    auth0Id: 'director_001',
    email: 'sarah.johnson@premierhealthcare.com',
    name: 'Sarah Johnson',
    phone: '555-1003',
    profilePictureUrl: 'https://via.placeholder.com/150/00CC66/FFFFFF?text=SJ',
    lastLogin: '2024-03-15T12:20:00Z',
    createdAt: '2024-01-16T10:30:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 3,
        userId: 3,
        userName: 'Sarah Johnson',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: undefined,
        teamName: undefined,
        role: 'DIRECTOR',
        roles: ['DIRECTOR', 'BRANCH_MANAGER'],
        discipline: 'RN',
        disciplines: ['RN'],
        isPrimary: true,
        isLeader: true, // Leader role
        accessScope: 'BRANCH',
        assignedAt: '2024-01-16T10:30:00Z',
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

  // 5. Field Clinician with Multiple Roles/Disciplines
  {
    userId: 5,
    auth0Id: 'clinician_001',
    email: 'john.smith@premierhealthcare.com',
    name: 'John Smith',
    phone: '555-1005',
    profilePictureUrl: 'https://via.placeholder.com/150/6600CC/FFFFFF?text=JS',
    lastLogin: '2024-03-15T10:30:00Z',
    createdAt: '2024-01-17T09:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 5,
        userId: 5,
        userName: 'John Smith',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 1,
        teamName: 'Critical Care Team',
        role: 'FIELD_CLINICIAN',
        roles: ['FIELD_CLINICIAN', 'PRECEPTOR'], // Multiple roles
        discipline: 'RN',
        disciplines: ['RN', 'PT'], // Multiple disciplines
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-01-17T09:00:00Z',
        assignedBy: 4,
        isActive: true,
        permissions: {
          canViewAllBranches: false,
          canViewAllTeams: false,
          canManageUsers: false,
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

  // 10. Learner/Student
  {
    userId: 10,
    auth0Id: 'student_001',
    email: 'jessica.williams@premierhealthcare.com',
    name: 'Jessica Williams',
    phone: '555-1010',
    profilePictureUrl: 'https://via.placeholder.com/150/FF9900/FFFFFF?text=JW',
    lastLogin: '2024-03-15T06:45:00Z',
    createdAt: '2024-02-01T09:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 10,
        userId: 10,
        userName: 'Jessica Williams',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 1,
        branchName: 'Downtown Medical Branch',
        teamId: 1,
        teamName: 'Critical Care Team',
        role: 'LEARNER',
        roles: ['LEARNER'],
        discipline: 'RN',
        disciplines: ['RN'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'TEAM',
        assignedAt: '2024-02-01T09:00:00Z',
        assignedBy: 4,
        isActive: true
      }
    ]
  },

  // 11. Clinical Manager (Home Care Support)
  {
    userId: 11,
    auth0Id: 'clinical_mgr_003',
    email: 'david.rodriguez@premierhealthcare.com',
    name: 'David Rodriguez',
    phone: '555-1011',
    profilePictureUrl: 'https://via.placeholder.com/150/009966/FFFFFF?text=DR',
    lastLogin: '2024-03-15T05:30:00Z',
    createdAt: '2024-01-19T13:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 11,
        userId: 11,
        userName: 'David Rodriguez',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 2,
        branchName: 'Suburban Care Center',
        teamId: 3,
        teamName: 'Home Care Support',
        role: 'CLINICAL_MANAGER',
        roles: ['CLINICAL_MANAGER', 'SCHEDULER'],
        discipline: 'LPN',
        disciplines: ['LPN', 'HHA'],
        isPrimary: true,
        isLeader: true,
        accessScope: 'TEAM',
        assignedAt: '2024-01-19T13:00:00Z',
        assignedBy: 6,
        isActive: true
      }
    ]
  },

  // 12. Intake Coordinator
  {
    userId: 12,
    auth0Id: 'coordinator_001',
    email: 'robert.lee@premierhealthcare.com',
    name: 'Robert Lee',
    phone: '555-1012',
    profilePictureUrl: 'https://via.placeholder.com/150/663399/FFFFFF?text=RL',
    lastLogin: '2024-03-14T18:00:00Z',
    createdAt: '2024-01-20T08:00:00Z',
    isActive: true,
    assignments: [
      {
        assignmentId: 12,
        userId: 12,
        userName: 'Robert Lee',
        agencyId: 1,
        agencyName: 'Premier Healthcare Network',
        branchId: 2,
        branchName: 'Suburban Care Center',
        teamId: undefined,
        teamName: undefined,
        role: 'INTAKE_COORDINATOR',
        roles: ['INTAKE_COORDINATOR'],
        discipline: 'OTHER',
        disciplines: ['OTHER'],
        isPrimary: true,
        isLeader: false,
        accessScope: 'BRANCH',
        assignedAt: '2024-01-20T08:00:00Z',
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
        roles: ['FIELD_CLINICIAN', 'PRECEPTOR'],
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