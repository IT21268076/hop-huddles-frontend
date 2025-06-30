import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Agency, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentAgency: (agency: Agency) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  userId: 1,
  auth0Id: 'mock_user_123',
  email: 'admin@example.com',
  name: 'John Doe',
  phone: '555-0123',
  profilePictureUrl: undefined,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  assignments: [
    {
      assignmentId: 1,
      userId: 1,
      userName: 'John Doe',
      agencyId: 1,
      agencyName: 'ABC Home Health',
      branchId: undefined,
      branchName: undefined,
      teamId: undefined,
      teamName: undefined,
      discipline: 'RN',
      role: 'ADMIN',
      isPrimary: true,
      accessScope: 'AGENCY',
      assignedAt: new Date().toISOString(),
      roles: [],
      isLeader: false
    },
  ],
};

const mockAgency: Agency = {
  agencyId: 1,
  name: 'ABC Home Health',
  ccn: '123456',
  agencyType: 'HOME_HEALTH',
  subscriptionPlan: 'PREMIUM',
  contactEmail: 'admin@abc.com',
  contactPhone: '555-0123',
  address: '123 Healthcare Dr, Medical City, HC 12345',
  createdAt: new Date().toISOString(),
  userCount: 25,
  agencyStructure: 'ENTERPRISE'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    currentAgency: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedAgency = localStorage.getItem('currentAgency');

    if (token && savedUser) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(savedUser),
        currentAgency: savedAgency ? JSON.parse(savedAgency) : null,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Mock login - in production this would call your auth service
    if (email === 'admin@example.com' && password === 'password') {
      const token = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('currentAgency', JSON.stringify(mockAgency));

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        currentAgency: mockAgency,
        loading: false,
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