import React from 'react';
import { AppProvider } from '../../contexts/AppContext';
import { Header } from '../layout/Header';
import { testUser, testAssignments } from '../../test-data';

// Mock the AppProvider for testing
const MockAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockContextValue = {
    currentUser: testUser,
    setCurrentUser: () => {},
    currentAgency: { agencyId: 1, name: 'Test Agency', ccn: '123456', agencyType: 'HOME_HEALTH' as const, subscriptionPlan: 'ENTERPRISE' as const, createdAt: new Date().toISOString(), userCount: 5, isActive: true },
    setCurrentAgency: () => {},
    setCurrentAgencyById: async () => {},
    currentAssignment: testAssignments[0],
    setCurrentAssignment: () => {},
    availableAssignments: testAssignments,
    switchRole: (assignmentId: number, selectedRole?: string) => {
      console.log('Mock switchRole called:', { assignmentId, selectedRole });
    },
    agencies: [],
    setAgencies: () => {},
    isLoading: false,
    setIsLoading: () => {},
  };

  return (
    <div style={{ display: 'contents' }}>
      {React.cloneElement(children as React.ReactElement, mockContextValue)}
    </div>
  );
};

export const TestApp: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MockAppProvider>
        <Header />
      </MockAppProvider>
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Role Switcher Test</h1>
        <p>Check the header for the role switcher component</p>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Test Data:</h3>
          <pre style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify({ testUser, testAssignments }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};