import React, { useState } from 'react';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import { AppProvider } from '../../contexts/AppContext';
import { testUser, testAssignments } from '../../test-data';

const TestWrapper: React.FC = () => {
  const [currentUser] = useState(testUser);
  const [currentAssignment] = useState(testAssignments[0]);
  const [availableAssignments] = useState(testAssignments);
  const [currentAgency] = useState({ agencyId: 1, name: 'Test Agency' });

  const mockAppContext = {
    currentUser,
    setCurrentUser: () => {},
    currentAgency,
    setCurrentAgency: () => {},
    setCurrentAgencyById: async () => {},
    currentAssignment,
    setCurrentAssignment: () => {},
    availableAssignments,
    switchRole: (assignmentId: number, selectedRole?: string) => {
      console.log('Switching role:', { assignmentId, selectedRole });
    },
    agencies: [currentAgency],
    setAgencies: () => {},
    isLoading: false,
    setIsLoading: () => {},
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Role Switcher Test</h2>
      <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
        <RoleSwitcher />
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Test Data:</h3>
        <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({ currentUser, currentAssignment, availableAssignments }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const RoleSwitcherTest: React.FC = () => {
  return <TestWrapper />;
};