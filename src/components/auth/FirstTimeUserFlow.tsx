import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth0Context';
import { useApi } from '../../hooks/useApi';
import { AgencyRegistrationWizard } from '../../pages/auth/AgencyRegistrationWizard';
import { PlatformHomepage } from '../../pages/platform/PlatformHomepage';
import { useApp } from '../../contexts/AppContext';
import { isSuperAdmin } from '../../utils/helpers';

interface FirstTimeUserFlowProps {
  children?: React.ReactNode;
}

export const FirstTimeUserFlow: React.FC<FirstTimeUserFlowProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentUser, availableAssignments, isLoading: appLoading } = useApp();
  const api = useApi();
  const location = useLocation();
  const [userStatus, setUserStatus] = useState<'new' | 'invited' | 'existing' | 'agency_needed' | 'loading'>('loading');
  
  const isUserSuperAdmin = isSuperAdmin(currentUser, user);
  
  //console.log('FirstTimeUserFlow - userStatus:', userStatus);
  //console.log('FirstTimeUserFlow - currentUser:', currentUser);
  //console.log('FirstTimeUserFlow - availableAssignments:', availableAssignments);
  //console.log('FirstTimeUserFlow - authLoading:', authLoading);
  //console.log('FirstTimeUserFlow - appLoading:', appLoading);
  //console.log('FirstTimeUserFlow - isAuthenticated:', isAuthenticated);
  //console.log('FirstTimeUserFlow - isUserSuperAdmin:', isUserSuperAdmin);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user || authLoading || appLoading) {
        //console.log('FirstTimeUserFlow - waiting for auth/app to load');
        return;
      }

      try {
        if (currentUser) {
          // User exists in our system
          // Special case for superadmin - they don't have agency assignments
          if (isUserSuperAdmin) {
            console.log('Setting superadmin user status to existing');
            setUserStatus('existing');
          } else if (availableAssignments && availableAssignments.length > 0) {
            // User has agency assignment
            console.log('Setting user status to existing');
            setUserStatus('existing');
          } else {
            // User exists but no agency assignment - might be invited
            console.log('Setting user status to agency_needed');
            setUserStatus('agency_needed');
          }
        } else {
          // Check if there's a pending invitation
          const urlParams = new URLSearchParams(window.location.search);
          const invitationToken = urlParams.get('invitation');
          
          if (invitationToken) {
            try {
              const invitation = await api.validateInvitation(invitationToken);
              localStorage.setItem('pendingInvitation', JSON.stringify({
                token: invitationToken,
                ...invitation
              }));
              setUserStatus('invited');
            } catch {
              setUserStatus('new');
            }
          } else {
            setUserStatus('new');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setUserStatus('new');
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, authLoading, appLoading, currentUser, availableAssignments, isUserSuperAdmin]);

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return children || null;
  }

  // Show different flows based on user status
  switch (userStatus) {
    case 'loading':
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your workspace...</p>
          </div>
        </div>
      );
    
    case 'invited':
    case 'new':
    case 'agency_needed':
      // Never show AgencyRegistrationWizard to superadmin
      if (isUserSuperAdmin) {
        ////console.log('FirstTimeUserFlow - superadmin bypassing AgencyRegistrationWizard');
        return children || null;
      }
      return <AgencyRegistrationWizard />;
    
    case 'existing':
      // Check the current route to determine what to show
      const currentPath = location.pathname;
      //console.log('FirstTimeUserFlow existing case - currentPath:', currentPath);
      
      // Special handling for superadmin routes
      if (isUserSuperAdmin) {
        if (currentPath === '/' || currentPath === '/platform') {
          return <PlatformHomepage />;
        }
        // For superadmin, allow access to all routes including /superadmin
        //console.log('FirstTimeUserFlow - showing children for superadmin path:', currentPath);
        return children || null;
      }
      
      if (currentPath === '/' || currentPath === '/platform') {
        return <PlatformHomepage />;
      }
      
      // For all other routes, show the normal app
      //console.log('FirstTimeUserFlow - showing children for path:', currentPath);
      return children || null;
    
    default:
      return children || null;
  }
};