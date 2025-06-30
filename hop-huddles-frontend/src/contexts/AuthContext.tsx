import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Agency, AuthState } from '../types';
import { mockAgencies, mockUsers } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentAgency: (agency: Agency) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use the first user (Educator) as the logged-in user
const mockUser: User = mockUsers[0]; // Dr. James Thompson (Educator)
const mockAgency: Agency = mockAgencies[0]; // Premier Healthcare Network (Enterprise)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    currentAgency: null,
    loading: true,
    permissions: [] // ADD this
  });

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedAgency = localStorage.getItem('currentAgency');

    if (token && savedUser) {
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        currentAgency: mockAgency,
        loading: false,
        permissions: [] // ADD this - will be calculated from user roles
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Mock login - in production this would call your auth service
    if (email === 'educator@premierhealthcare.com' && password === 'password') {
      const token = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('currentAgency', JSON.stringify(mockAgency));

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        currentAgency: mockAgency,
        loading: false,
        permissions: [] // ADD this - will be calculated from user roles
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
      permissions: [] // ADD this
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