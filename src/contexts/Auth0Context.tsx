// contexts/Auth0Context.tsx
import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { Auth0Provider, useAuth0, User as Auth0User, RedirectLoginOptions } from '@auth0/auth0-react';
import { useApp } from './AppContext';
import { apiClient } from '../services/api';

interface Auth0ContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Auth0User | undefined;
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;
  logout: () => void;
  getAccessTokenSilently: () => Promise<string>;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

interface Auth0WrapperProps {
  children: ReactNode;
}

const Auth0Wrapper: React.FC<Auth0WrapperProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const { setCurrentUser, setIsLoading: setAppLoading } = useApp();

  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user?.email) {
        try {
          setAppLoading(true);
          
          // Set up API client with Auth0 token
          apiClient.setAccessTokenGetter(getAccessTokenSilently);
          
          // Check if user exists in our system
          const response = await apiClient.getUserByEmail(user.email);
          setCurrentUser(response);
          
          // Set user ID in API client for development mode user context
          apiClient.setCurrentUserId(response.userId);
        } catch (error) {
          console.error('Failed to load user data:', error);
          // User might be invited but not yet created
          // Check for invitation token in multiple places
          const urlParams = new URLSearchParams(window.location.search);
          let invitationToken = urlParams.get('token') || urlParams.get('invitation');
          
          // Check for path-based invitation tokens: /invitation/accept/{token}
          if (!invitationToken) {
            const pathMatch = window.location.pathname.match(/\/invitation\/accept\/([a-f0-9]+)/);
            if (pathMatch) {
              invitationToken = pathMatch[1];
            }
          }
          
          // Check localStorage for preserved invitation token (from before Auth0 redirect)
          if (!invitationToken) {
            invitationToken = localStorage.getItem('invitationToken');
          }
          
          console.log('URL search params:', window.location.search);
          console.log('URL pathname:', window.location.pathname);
          console.log('Invitation token found:', invitationToken);
          
          if (invitationToken) {
            try {
              // Validate invitation and store data for registration wizard
              const invitationData = await apiClient.validateInvitation(invitationToken);
              const invitationInfo = {
                token: invitationToken,
                email: invitationData.email,
                agencyName: invitationData.agencyName,
                roleName: invitationData.roleName,
                intendedAgencyName: invitationData.agencyName,
                isValid: invitationData.isValid
              };
              localStorage.setItem('pendingInvitation', JSON.stringify(invitationInfo));
              console.log('Invitation token stored for registration:', invitationInfo);
            } catch (invitationError) {
              console.error('Failed to validate invitation:', invitationError);
            }
          } else {
            console.log('No invitation token found in URL - user may need to create agency from scratch');
          }
          // This will be handled by the agency registration wizard
        } finally {
          setAppLoading(false);
        }
      } else if (!isAuthenticated && !isLoading) {
        setCurrentUser(null);
        apiClient.setCurrentUserId(undefined);
        setAppLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

interface Auth0ProviderWithConfigProps {
  children: ReactNode;
}

export const Auth0ProviderWithConfig: React.FC<Auth0ProviderWithConfigProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-2bcqxbprxonz42ic.us.auth0.com';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '9fZ7aOnG98gErQumOTbU57wEkYMW8jzq';

  // Check if we're on an invitation URL and preserve the token
  React.useEffect(() => {
    const pathMatch = window.location.pathname.match(/\/invitation\/accept\/([a-f0-9]+)/);
    if (pathMatch) {
      const invitationToken = pathMatch[1];
      // Store the invitation token before Auth0 authentication
      localStorage.setItem('invitationToken', invitationToken);
      console.log('Invitation token stored from URL path:', invitationToken);
    }
  }, []);

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.hop-huddles.com',
      }}
    >
      <Auth0Wrapper>{children}</Auth0Wrapper>
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth must be used within an Auth0ProviderWithConfig');
  }
  return context;
};