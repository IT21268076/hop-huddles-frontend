import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { HopApiClient } from '../services/api';

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const api = useMemo(() => {
    const client = new HopApiClient();
    
    // Set up the access token getter for authenticated requests
    client.setAccessTokenGetter(async () => {
      try {
        return await getAccessTokenSilently();
      } catch (error) {
        console.error('Failed to get access token:', error);
        return '';
      }
    });

    return client;
  }, [getAccessTokenSilently]);

  return api;
};