import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Branch, User, UserAssignment } from '../types';
import { apiClient } from '../services/api';
import { useApp } from './AppContext';

interface BranchContextType {
  currentBranch: Branch | null;
  availableBranches: Branch[];
  isMultiBranch: boolean;
  isLoading: boolean;
  error: string | null;
  switchBranch: (branchId: number) => Promise<void>;
  refreshBranches: () => Promise<void>;
  canAccessBranch: (branchId: number) => boolean;
  getBranchAssignments: (branchId: number) => UserAssignment[];
  clearBranchContext: () => void;
}

const BranchContext = createContext<BranchContextType | null>(null);

interface BranchProviderProps {
  children: ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const { currentUser, currentAssignment, currentAgency } = useApp();
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has multi-branch access
  const isMultiBranch = availableBranches.length > 1;

  // Get assignments for a specific branch
  const getBranchAssignments = (branchId: number): UserAssignment[] => {
    if (!currentUser?.assignments) return [];
    return currentUser.assignments.filter(assignment => assignment.branchId === branchId);
  };

  // Check if user can access a specific branch
  const canAccessBranch = (branchId: number): boolean => {
    if (!currentUser?.assignments) return false;
    
    // SUPERADMIN can access all branches
    if (currentUser.assignments.some(a => a.roles.includes('SUPERADMIN'))) {
      return true;
    }

    // Check if user has assignment to this branch
    return currentUser.assignments.some(assignment => assignment.branchId === branchId);
  };

  // Load available branches for the current user
  const refreshBranches = async (): Promise<void> => {
    console.log('BranchContext - refreshBranches called, currentUser:', currentUser, 'currentAgency:', currentAgency);
    
    if (!currentUser && currentAgency) {
      console.log('BranchContext - No currentUser but have currentAgency, loading branches for development');
      setIsLoading(true);
      setError(null);
      try {
        const branches = await apiClient.getBranchesByAgency(currentAgency.agencyId);
        console.log('BranchContext - Branches loaded in dev mode:', branches);
        setAvailableBranches(branches);
      } catch (error) {
        console.error('BranchContext - Failed to load branches in dev mode:', error);
        setError('Failed to load branches');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (!currentUser) {
      console.log('BranchContext - No currentUser and no currentAgency, returning');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let branches: Branch[] = [];

      // For EDUCATOR and ADMIN roles, get their assigned branches if they have branch assignments
      const isEducatorOrAdmin = currentUser.assignments.some(a => 
        a.roles.includes('EDUCATOR') || a.roles.includes('ADMIN')
      );

      if (isEducatorOrAdmin) {
        // Get agencyId from user's primary assignment
        const primaryAssignment = currentUser.assignments.find(a => a.isPrimary) || currentUser.assignments[0];
        if (primaryAssignment) {
          try {
            branches = await apiClient.getUserAccessibleBranches(currentUser.userId, primaryAssignment.agencyId);
          } catch (error: any) {
            // If user has no branch assignments yet (newly created user), this is expected
            console.log('No accessible branches found for user - this is normal for newly created users');
            branches = [];
          }
        }
      } else {
        // For other roles, get branches from their assignments
        const branchIds = currentUser.assignments
          .map(a => a.branchId)
          .filter((id): id is number => id !== undefined && id !== null);
        
        if (branchIds.length > 0) {
          try {
            // Get unique branch IDs and fetch branch details
            const uniqueBranchIds = [...new Set(branchIds)];
            branches = await Promise.all(
              uniqueBranchIds.map(id => apiClient.getBranchById(id))
            );
          } catch (error: any) {
            console.log('Error fetching branch details - user may not have valid branch assignments yet');
            branches = [];
          }
        }
      }

      setAvailableBranches(branches);

      // Set current branch if not already set
      if (!currentBranch && branches.length > 0) {
        // Try to use branch from current assignment first
        if (currentAssignment?.branchId) {
          const assignmentBranch = branches.find(b => b.branchId === currentAssignment.branchId);
          if (assignmentBranch) {
            setCurrentBranch(assignmentBranch);
          } else {
            setCurrentBranch(branches[0]);
          }
        } else {
          setCurrentBranch(branches[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load available branches:', error);
      setError('Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different branch
  const switchBranch = async (branchId: number): Promise<void> => {
    if (!canAccessBranch(branchId)) {
      throw new Error('Access denied to this branch');
    }

    const branch = availableBranches.find(b => b.branchId === branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    setCurrentBranch(branch);

    // Store in localStorage for persistence
    localStorage.setItem('selectedBranchId', branchId.toString());

    // Trigger any necessary data refreshes in other parts of the app
    // This could trigger a custom event or callback
    window.dispatchEvent(new CustomEvent('branchChanged', { 
      detail: { branchId, branch } 
    }));
  };

  // Clear branch context (on logout)
  const clearBranchContext = () => {
    setCurrentBranch(null);
    setAvailableBranches([]);
    setError(null);
    localStorage.removeItem('selectedBranchId');
  };

  // Initialize branches when user or agency changes
  useEffect(() => {
    if (currentUser || currentAgency) {
      refreshBranches();
    } else {
      clearBranchContext();
    }
  }, [currentUser, currentAgency]);

  // Restore selected branch from localStorage
  useEffect(() => {
    const savedBranchId = localStorage.getItem('selectedBranchId');
    if (savedBranchId && availableBranches.length > 0 && !currentBranch) {
      const branchId = parseInt(savedBranchId, 10);
      const branch = availableBranches.find(b => b.branchId === branchId);
      if (branch && canAccessBranch(branchId)) {
        setCurrentBranch(branch);
      }
    }
  }, [availableBranches]);

  const value: BranchContextType = {
    currentBranch,
    availableBranches,
    isMultiBranch,
    isLoading,
    error,
    switchBranch,
    refreshBranches,
    canAccessBranch,
    getBranchAssignments,
    clearBranchContext,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranchContext(): BranchContextType {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
}

export { BranchContext };