// Test data for role switcher
import { User, UserAssignment, UserRole, Discipline } from './types';

export const testUser: User = {
  userId: 1,
  auth0Id: 'test-auth0-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  assignments: []
};

export const testAssignments: UserAssignment[] = [
  {
    assignmentId: 1,
    userId: 1,
    userName: 'Test User',
    agencyId: 1,
    agencyName: 'Test Agency',
    branchId: 1,
    branchName: 'Main Branch',
    teamId: 1,
    teamName: 'Nursing Team',
    roles: ['EDUCATOR', 'ADMIN', 'DIRECTOR'],
    disciplines: ['RN', 'LPN'],
    primaryRole: 'EDUCATOR',
    activeRole: 'EDUCATOR',
    isPrimary: true,
    accessScope: 'AGENCY',
    assignedAt: new Date().toISOString(),
    role: 'EDUCATOR',
    discipline: 'RN'
  },
  {
    assignmentId: 2,
    userId: 1,
    userName: 'Test User',
    agencyId: 1,
    agencyName: 'Test Agency',
    branchId: 2,
    branchName: 'Secondary Branch',
    teamId: 2,
    teamName: 'Therapy Team',
    roles: ['CLINICAL_MANAGER', 'FIELD_CLINICIAN'],
    disciplines: ['PT', 'OT'],
    primaryRole: 'CLINICAL_MANAGER',
    activeRole: 'CLINICAL_MANAGER',
    isPrimary: false,
    accessScope: 'TEAM',
    assignedAt: new Date().toISOString(),
    role: 'CLINICAL_MANAGER',
    discipline: 'PT'
  }
];