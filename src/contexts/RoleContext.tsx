// contexts/RoleContext.tsx
// This provides role-specific functionality using AppContext
import React, { createContext, useContext, useMemo } from 'react';
import { useApp } from './AppContext';
import { UserRole } from '../types';

interface RoleContextType {
  currentRole: UserRole | null;
  roles: UserRole[];
  switchRole: (role: UserRole) => void;
  setCurrentRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  isEducator: boolean;
  isDirector: boolean;
  isClinicalManager: boolean;
  isFieldClinician: boolean;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentAssignment, switchAssignment, userAssignments } = useApp();

  const contextValue = useMemo(() => {
    const currentRole = currentAssignment?.role || null;
    const roles = currentAssignment?.roles || [];

    return {
      currentRole,
      roles,
      switchRole: (role: UserRole) => {
        // Find assignment with this role and switch to it
        const targetAssignment = userAssignments?.find((assignment: any) => 
          assignment.role === role || assignment.roles?.includes(role)
        );
        if (targetAssignment && switchAssignment) {
          switchAssignment(targetAssignment);
        }
      },
      setCurrentRole: (role: UserRole) => {
        // Find assignment with this role and switch to it
        const targetAssignment = userAssignments?.find((assignment: any) => 
          assignment.role === role || assignment.roles?.includes(role)
        );
        if (targetAssignment && switchAssignment) {
          switchAssignment(targetAssignment);
        }
      },
      hasRole: (role: UserRole) => roles.includes(role) || currentRole === role,
      isEducator: currentRole === 'EDUCATOR',
      isDirector: currentRole === 'DIRECTOR', 
      isClinicalManager: currentRole === 'CLINICAL_MANAGER',
      isFieldClinician: currentRole === 'FIELD_CLINICIAN',
      isAdmin: currentRole === 'ADMIN' || currentRole === 'SUPERADMIN',
    };
  }, [currentAssignment, switchAssignment, userAssignments]);

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};