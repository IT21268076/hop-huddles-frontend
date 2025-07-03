// contexts/AuthContext.tsx - Enhanced with role switching and agency isolation
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Agency, AuthState, UserRole } from '../types';
import { mockAgencies, mockUsers } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentAgency: (agency: Agency) => void;
  checkUserInvitation: (email: string) => Promise<UserInvitationResult>;
  getUserAgencyStatus: (userId: number) => Promise<AgencyRegistrationStatus>;
  markAgencyAsRegistered: (agencyId: number) => void;
  // NEW: Role switching functionality
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  canSwitchToRole: (role: UserRole) => boolean;
  getCurrentAccessScope: () => 'AGENCY' | 'BRANCH' | 'TEAM' | null;
  getFilteredDataContext: () => DataContext;
}

interface UserInvitationResult {
  isInvited: boolean;
  agencyId?: number;
  invitedBy?: string;
  invitedAt?: string;
  role?: string;
}

interface AgencyRegistrationStatus {
  hasRegisteredAgency: boolean;
  agencyId?: number;
  agencyName?: string;
  isFirstTime: boolean;
  registrationCompletedAt?: string;
}

interface DataContext {
  agencyId: number | null;
  branchIds: number[];
  teamIds: number[];
  userIds: number[];
  accessScope: 'AGENCY' | 'BRANCH' | 'TEAM' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock invitation database - In production, this would be API calls
const mockInvitations: Record<string, UserInvitationResult> = {
  'educator@premierhealthcare.com': {
    isInvited: true,
    agencyId: 1,
    invitedBy: 'Super Admin',
    invitedAt: '2024-01-15T08:00:00Z',
    role: 'EDUCATOR'
  },
  'monika@premierhealthcare.com': {
    isInvited: true,
    agencyId: 1,
    invitedBy: 'Dr. James Thompson',
    invitedAt: '2024-02-01T10:00:00Z',
    role: 'ADMIN'
  },
  'director@healthcarebranch.com': {
    isInvited: true,
    agencyId: 2,
    invitedBy: 'Agency Admin',
    invitedAt: '2024-01-20T09:00:00Z',
    role: 'DIRECTOR'
  }
};

// Track agency registration status
const agencyRegistrationStatus: Record<number, { completed: boolean, completedAt?: string }> = {
  1: { completed: true, completedAt: '2024-01-15T08:30:00Z' },
  // Add more agencies as they get registered
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    currentAgency: null,
    loading: true,
    permissions: []
  });

  // NEW: Role switching state
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedAgency = localStorage.getItem('currentAgency');
    const savedActiveRole = localStorage.getItem('activeRole');

    if (token && savedUser) {
      const user = JSON.parse(savedUser);
      const agency = savedAgency ? JSON.parse(savedAgency) : null;
      
      setAuthState({
        isAuthenticated: true,
        user: user,
        currentAgency: agency,
        loading: false,
        permissions: []
      });

      // Initialize role switching
      initializeRoles(user, agency, savedActiveRole);
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const initializeRoles = (user: User, agency: Agency | null, savedActiveRole?: string | null) => {
    if (!user || !agency) return;

    // Get all roles for current agency
    const agencyAssignments = user.assignments.filter(a => 
      a.agencyId === agency.agencyId && a.isActive
    );
    
    const roles = new Set<UserRole>();
    agencyAssignments.forEach(assignment => {
      if (assignment.roles && assignment.roles.length > 0) {
        assignment.roles.forEach(role => roles.add(role));
      } else if (assignment.role) {
        roles.add(assignment.role);
      }
    });

    const rolesArray = Array.from(roles);
    setAvailableRoles(rolesArray);

    // Set active role
    let initialRole: UserRole | null = null;
    if (savedActiveRole && rolesArray.includes(savedActiveRole as UserRole)) {
      initialRole = savedActiveRole as UserRole;
    } else if (rolesArray.length > 0) {
      // Default to highest hierarchy role
      const roleHierarchy: UserRole[] = ['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER', 'FIELD_CLINICIAN'];
      initialRole = roleHierarchy.find(role => rolesArray.includes(role)) || rolesArray[0];
    }

    setActiveRole(initialRole);
    if (initialRole) {
      localStorage.setItem('activeRole', initialRole);
    }
  };

  const checkUserInvitation = async (email: string): Promise<UserInvitationResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const invitation = mockInvitations[email.toLowerCase()];
    return invitation || { isInvited: false };
  };

  const getUserAgencyStatus = async (userId: number): Promise<AgencyRegistrationStatus> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.userId === userId);
    if (!user) {
      return { hasRegisteredAgency: false, isFirstTime: true };
    }

    const activeAssignments = user.assignments.filter(a => a.isActive);
    if (activeAssignments.length === 0) {
      return { hasRegisteredAgency: false, isFirstTime: true };
    }

    const primaryAssignment = activeAssignments.find(a => a.isPrimary) || activeAssignments[0];
    const agencyStatus = agencyRegistrationStatus[primaryAssignment.agencyId];
    
    return {
      hasRegisteredAgency: !!agencyStatus?.completed,
      agencyId: primaryAssignment.agencyId,
      agencyName: primaryAssignment.agencyName,
      isFirstTime: !agencyStatus?.completed,
      registrationCompletedAt: agencyStatus?.completedAt
    };
  };

  const markAgencyAsRegistered = (agencyId: number) => {
    agencyRegistrationStatus[agencyId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
  };

  const login = async (email: string, password: string) => {
    // Check invitation first
    const invitationResult = await checkUserInvitation(email);
    if (!invitationResult.isInvited) {
      throw new Error('User not invited to platform. Please contact your administrator.');
    }

    // Mock login validation - In production, this would use Auth0
    if (password === 'password') { // Simplified for demo
      const token = 'mock_jwt_token_' + Date.now();
      
      // Find the mock user based on email
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('User not found in system');
      }

      // Find the agency this user belongs to
      const primaryAssignment = user.assignments.find(a => a.isPrimary) || user.assignments[0];
      const agency = mockAgencies.find(a => a.agencyId === primaryAssignment.agencyId);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (agency) {
        localStorage.setItem('currentAgency', JSON.stringify(agency));
      }

      setAuthState({
        isAuthenticated: true,
        user: user,
        currentAgency: agency || null,
        loading: false,
        permissions: []
      });

      // Initialize roles after successful login
      initializeRoles(user, agency || null);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAgency');
    localStorage.removeItem('activeRole');

    setAuthState({
      isAuthenticated: false,
      user: null,
      currentAgency: null,
      loading: false,
      permissions: []
    });

    setActiveRole(null);
    setAvailableRoles([]);
  };

  const setCurrentAgency = (agency: Agency) => {
    localStorage.setItem('currentAgency', JSON.stringify(agency));
    setAuthState(prev => ({
      ...prev,
      currentAgency: agency,
    }));

    // Reinitialize roles for new agency
    if (authState.user) {
      initializeRoles(authState.user, agency);
    }
  };

  // NEW: Role switching functions
  const canSwitchToRole = (role: UserRole): boolean => {
    return availableRoles.includes(role);
  };

  const switchRole = (role: UserRole) => {
    if (!canSwitchToRole(role)) {
      throw new Error(`Cannot switch to role: ${role}. Role not available for user.`);
    }

    setActiveRole(role);
    localStorage.setItem('activeRole', role);
  };

  const getCurrentAccessScope = (): 'AGENCY' | 'BRANCH' | 'TEAM' | null => {
    if (!authState.user || !authState.currentAgency || !activeRole) return null;

    const agencyAssignments = authState.user.assignments.filter(a => 
      a.agencyId === authState.currentAgency?.agencyId && 
      a.isActive &&
      (a.roles?.includes(activeRole) || a.role === activeRole)
    );

    if (agencyAssignments.length === 0) return null;

    // Return the highest access scope for the active role
    const scopes = agencyAssignments.map(a => a.accessScope).filter(Boolean);
    if (scopes.includes('AGENCY')) return 'AGENCY';
    if (scopes.includes('BRANCH')) return 'BRANCH';
    if (scopes.includes('TEAM')) return 'TEAM';
    
    return null;
  };

  const getFilteredDataContext = (): DataContext => {
    const accessScope = getCurrentAccessScope();
    const currentAgencyId = authState.currentAgency?.agencyId || null;
    
    if (!authState.user || !currentAgencyId || !activeRole) {
      return {
        agencyId: null,
        branchIds: [],
        teamIds: [],
        userIds: [],
        accessScope: null
      };
    }

    const agencyAssignments = authState.user.assignments.filter(a => 
      a.agencyId === currentAgencyId && 
      a.isActive &&
      (a.roles?.includes(activeRole) || a.role === activeRole)
    );

    let branchIds: number[] = [];
    let teamIds: number[] = [];
    let userIds: number[] = [];

    switch (accessScope) {
      case 'AGENCY':
        // Agency level - access to all data in agency
        branchIds = []; // Will be populated by API calls
        teamIds = [];
        userIds = [];
        break;
      
      case 'BRANCH':
        // Branch level - access to specific branches
        branchIds = agencyAssignments
          .map(a => a.branchId)
          .filter((id): id is number => id !== undefined);
        break;
      
      case 'TEAM':
        // Team level - access to specific teams
        teamIds = agencyAssignments
          .map(a => a.teamId)
          .filter((id): id is number => id !== undefined);
        branchIds = agencyAssignments
          .map(a => a.branchId)
          .filter((id): id is number => id !== undefined);
        break;
    }

    return {
      agencyId: currentAgencyId,
      branchIds,
      teamIds,
      userIds,
      accessScope
    };
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    setCurrentAgency,
    checkUserInvitation,
    getUserAgencyStatus,
    markAgencyAsRegistered,
    // NEW: Role switching functionality
    activeRole,
    availableRoles,
    switchRole,
    canSwitchToRole,
    getCurrentAccessScope,
    getFilteredDataContext,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}