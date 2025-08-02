// components/auth/AuthGuard.tsx
import React, { type ReactNode } from 'react';
import { useAuth } from '../../contexts/Auth0Context';
import { useApp } from '../../contexts/AppContext';
import { LoginPage } from '../../pages/auth/LoginPage';
import { AgencyRegistrationWizard } from '../../pages/auth/AgencyRegistrationWizard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { isSuperAdmin } from '../../utils/helpers';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  //console.log('AuthGuard rendered');
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { currentUser, isLoading: appLoading, availableAssignments } = useApp();

  // Show loading while auth is being determined
  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show agency registration wizard for new invited users, but not for superadmins
  // Skip wizard if user already has agency assignments
  if (currentUser && !currentUser.hasCompletedAgencySetup && !isSuperAdmin(currentUser, user)) {
    // If user has existing assignments, they don't need the agency registration wizard
    if (availableAssignments && availableAssignments.length > 0) {
      console.log('AuthGuard: User has existing assignments, skipping agency wizard:', availableAssignments.length);
    } else {
      return <AgencyRegistrationWizard />;
    }
  }

  // User is authenticated and has completed setup (or is superadmin)
  return <>{children}</>;
};