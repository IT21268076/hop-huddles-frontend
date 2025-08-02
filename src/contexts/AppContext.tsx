// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Agency, UserAssignment } from '../types';
import { apiClient } from '../services/api';

export interface AppContextType {
  currentUser: User | null;
  user: User | null; // Alias for backward compatibility
  setCurrentUser: (user: User | null) => void;
  currentAgency: Agency | null;
  setCurrentAgency: (agency: Agency | null) => void;
  setCurrentAgencyById: (agencyId: number) => Promise<void>;
  currentAssignment: UserAssignment | null;
  setCurrentAssignment: (assignment: UserAssignment | null) => void;
  switchAssignment: (assignment: UserAssignment) => void;
  availableAssignments: UserAssignment[];
  userAssignments: UserAssignment[]; // Alias for backward compatibility
  switchRole: (assignmentId: number, selectedRole?: string) => void;
  agencies: Agency[];
  setAgencies: (agencies: Agency[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<UserAssignment | null>(null);
  const [availableAssignments, setAvailableAssignments] = useState<UserAssignment[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user assignments when user changes
  useEffect(() => {
    const loadUserAssignments = async () => {
      console.log('AppContext - loadUserAssignments called, currentUser:', currentUser);
      if (currentUser && currentUser.userId) {
        try {
          console.log('AppContext - Loading assignments for user:', currentUser.userId);
          const assignments = await apiClient.getAssignmentsByUser(currentUser.userId);
          console.log('AppContext - Assignments loaded:', assignments);
          setAvailableAssignments(assignments);
          
          // Set primary assignment or first available assignment as current
          const primaryAssignment = assignments.find(a => a.isPrimary);
          const defaultAssignment = primaryAssignment || assignments[0];
          
          // If the assignment has multiple roles, set the first role as active
          if (defaultAssignment && defaultAssignment.roles && defaultAssignment.roles.length > 0) {
            // Check if there's a stored active role
            const storedActiveRole = localStorage.getItem('currentActiveRole');
            const storedAssignmentId = localStorage.getItem('currentAssignmentId');
            
            if (storedActiveRole && storedAssignmentId && 
                parseInt(storedAssignmentId) === defaultAssignment.assignmentId &&
                defaultAssignment.roles.includes(storedActiveRole as any)) {
              defaultAssignment.activeRole = storedActiveRole as any;
              defaultAssignment.role = storedActiveRole as any;
            } else {
              defaultAssignment.activeRole = defaultAssignment.roles[0];
              defaultAssignment.role = defaultAssignment.roles[0]; // For backward compatibility
            }
          }
          
          if (defaultAssignment) {
            setCurrentAssignment(defaultAssignment);
            
            // Load agencies if not already loaded
            if (agencies.length === 0) {
              try {
                console.log('AppContext - Loading agencies...');
                const agenciesData = await apiClient.getAgencies();
                console.log('AppContext - Agencies loaded:', agenciesData);
                setAgencies(agenciesData);
                
                // Set current agency based on assignment
                const userAgency = agenciesData.find(a => a.agencyId === defaultAssignment.agencyId);
                console.log('AppContext - Looking for agency ID:', defaultAssignment.agencyId, 'Found:', userAgency);
                if (userAgency) {
                  setCurrentAgency(userAgency);
                  console.log('AppContext - Set current agency:', userAgency);
                }
              } catch (agencyError) {
                console.error('Failed to load agencies:', agencyError);
                // Continue without agencies - user can still access the dashboard
              }
            } else {
              // Set current agency based on assignment if agencies are already loaded
              const userAgency = agencies.find(a => a.agencyId === defaultAssignment.agencyId);
              if (userAgency) {
                setCurrentAgency(userAgency);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load user assignments:', error);
          // Set fallback state to allow navigation to proceed
          setAvailableAssignments([]);
          setCurrentAssignment(null);
        }
      } else {
        setAvailableAssignments([]);
        setCurrentAssignment(null);
      }
    };

    loadUserAssignments();
  }, [currentUser, agencies]);

  // Load agencies initially
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('AppContext - Loading initial agencies...');
        setIsLoading(true);
        const agenciesData = await apiClient.getAgencies();
        console.log('AppContext - Initial agencies loaded:', agenciesData);
        setAgencies(agenciesData);
        
        // If no currentUser, set first agency as current for development
        if (!currentUser && agenciesData.length > 0 && !currentAgency) {
          console.log('AppContext - No user, setting first agency as current for development');
          setCurrentAgency(agenciesData[0]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Continue without agencies - user can still access the dashboard
        setAgencies([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!currentUser) {
      loadInitialData();
    } else {
      // If user is already loaded, don't block with loading state
      setIsLoading(false);
    }
  }, [currentUser]);

  const setCurrentAgencyById = useCallback(async (agencyId: number) => {
    // First check if agency is already in agencies list
    let agency = agencies.find(a => a.agencyId === agencyId);
    
    if (!agency) {
      // If not found, fetch it from API
      try {
        agency = await apiClient.getAgencyById(agencyId);
        if (agency) {
          setAgencies(prev => [...prev, agency!]);
        }
      } catch (error) {
        console.error('Failed to fetch agency:', error);
        return;
      }
    }
    
    if (agency) {
      setCurrentAgency(agency);
    }
  }, [agencies]);

  const switchAssignment = useCallback((assignment: UserAssignment) => {
    setCurrentAssignment(assignment);
    
    // Switch to the assignment's agency if different
    if (assignment.agencyId !== currentAgency?.agencyId) {
      const agency = agencies.find(a => a.agencyId === assignment.agencyId);
      if (agency) {
        setCurrentAgency(agency);
      }
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('currentAssignmentId', assignment.assignmentId.toString());
  }, [agencies, currentAgency]);

  const switchRole = useCallback((assignmentId: number, selectedRole?: string) => {
    const assignment = availableAssignments.find(a => a.assignmentId === assignmentId);
    
    if (assignment) {
      console.log('🔄 ROLE SWITCH: User', currentUser?.userId, 'switching from', currentAssignment?.activeRole || currentAssignment?.role, 'to', selectedRole || 'default role');
      
      // If a specific role is selected, update the assignment context
      if (selectedRole && assignment.roles?.includes(selectedRole as any)) {
        // Create a modified assignment with the selected role as active
        const modifiedAssignment = {
          ...assignment,
          activeRole: selectedRole as any,
          role: selectedRole as any // For backward compatibility
        };
        console.log('🔄 ROLE SWITCH COMPLETE: User', currentUser?.userId, 'now has activeRole =', selectedRole, 'in assignment', assignmentId);
        setCurrentAssignment(modifiedAssignment);
        
        // Also update the assignment in availableAssignments for consistency
        const updatedAssignments = availableAssignments.map(a => 
          a.assignmentId === assignmentId ? modifiedAssignment : a
        );
        setAvailableAssignments(updatedAssignments);
      } else {
        console.log('🔄 ROLE SWITCH FALLBACK: Using default role for assignment', assignmentId);
        setCurrentAssignment(assignment);
      }
      
      // Switch agency if needed
      const agency = agencies.find(a => a.agencyId === assignment.agencyId);
      if (agency && agency.agencyId !== currentAgency?.agencyId) {
        setCurrentAgency(agency);
      }
      
      // Store in localStorage for persistence
      localStorage.setItem('currentAssignmentId', assignmentId.toString());
      if (selectedRole) {
        localStorage.setItem('currentActiveRole', selectedRole);
      }
    }
  }, [availableAssignments, agencies, currentAgency]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        user: currentUser, // Alias for backward compatibility
        setCurrentUser,
        currentAgency,
        setCurrentAgency,
        setCurrentAgencyById,
        currentAssignment,
        setCurrentAssignment,
        switchAssignment,
        availableAssignments,
        userAssignments: availableAssignments, // Alias for backward compatibility
        switchRole,
        agencies,
        setAgencies,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Custom hooks for specific functionality
export const useCurrentAgency = () => {
  const { currentAgency, setCurrentAgency } = useApp();
  return { currentAgency, setCurrentAgency };
};

export const useCurrentUser = () => {
  const { currentUser, setCurrentUser } = useApp();
  return { currentUser, setCurrentUser };
};