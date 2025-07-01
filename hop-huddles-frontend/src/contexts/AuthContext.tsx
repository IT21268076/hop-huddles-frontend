// contexts/AuthContext.tsx - Enhanced with invitation system and agency registration checking
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Agency, AuthState } from '../types';
import { mockAgencies, mockUsers } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentAgency: (agency: Agency) => void;
  checkUserInvitation: (email: string) => Promise<UserInvitationResult>;
  getUserAgencyStatus: (userId: number) => Promise<AgencyRegistrationStatus>;
  markAgencyAsRegistered: (agencyId: number) => void;
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

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedAgency = localStorage.getItem('currentAgency');

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
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const checkUserInvitation = async (email: string): Promise<UserInvitationResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const invitation = mockInvitations[email];
    return invitation || { isInvited: false };
  };

  const getUserAgencyStatus = async (userId: number): Promise<AgencyRegistrationStatus> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find user's agency assignment
    const user = mockUsers.find(u => u.userId === userId);
    if (!user || !user.assignments.length) {
      return { hasRegisteredAgency: false, isFirstTime: true };
    }

    const primaryAssignment = user.assignments.find(a => a.isPrimary) || user.assignments[0];
    const agencyId = primaryAssignment.agencyId;
    const agency = mockAgencies.find(a => a.agencyId === agencyId);
    
    const registrationInfo = agencyRegistrationStatus[agencyId];
    
    return {
      hasRegisteredAgency: registrationInfo?.completed || false,
      agencyId: agencyId,
      agencyName: agency?.name,
      isFirstTime: !registrationInfo?.completed,
      registrationCompletedAt: registrationInfo?.completedAt
    };
  };

  const markAgencyAsRegistered = (agencyId: number) => {
    agencyRegistrationStatus[agencyId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    // Update localStorage to persist
    localStorage.setItem('agencyRegistrationStatus', JSON.stringify(agencyRegistrationStatus));
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Check if user is invited first
    const invitationResult = await checkUserInvitation(email);
    
    if (!invitationResult.isInvited) {
      throw new Error('User not invited. Please contact your administrator.');
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
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAgency');

    setAuthState({
      isAuthenticated: false,
      user: null,
      currentAgency: null,
      loading: false,
      permissions: []
    });
  };

  const setCurrentAgency = (agency: Agency) => {
    localStorage.setItem('currentAgency', JSON.stringify(agency));
    setAuthState(prev => ({
      ...prev,
      currentAgency: agency,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    setCurrentAgency,
    checkUserInvitation,
    getUserAgencyStatus,
    markAgencyAsRegistered,
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