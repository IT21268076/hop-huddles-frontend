import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/Auth0Context';
import { isSuperAdmin } from '../../utils/helpers';

interface SuperAdminGuardProps {
  children: ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const { currentUser } = useApp();
  const { user } = useAuth();

  // Check if user is superadmin
  if (!isSuperAdmin(currentUser, user)) {
    // Redirect to main platform if not superadmin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};