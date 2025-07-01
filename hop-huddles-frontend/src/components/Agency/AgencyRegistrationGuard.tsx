// components/Agency/AgencyRegistrationGuard.tsx - Prevents duplicate agency creation
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AgencyRegistrationGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AgencyRegistrationGuard: React.FC<AgencyRegistrationGuardProps> = ({ 
  children, 
  redirectTo = '/main-platform' 
}) => {
  const { user, getUserAgencyStatus } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [canCreateAgency, setCanCreateAgency] = useState(false);
  const [agencyStatus, setAgencyStatus] = useState<{
    hasRegisteredAgency: boolean;
    agencyName?: string;
  } | null>(null);

  useEffect(() => {
    const checkAgencyRegistration = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const status = await getUserAgencyStatus(user.userId);
        setAgencyStatus(status);
        
        if (status.hasRegisteredAgency) {
          // Agency already registered, don't allow creation
          setCanCreateAgency(false);
          toast.error('Agency already registered for this user', {
            id: 'agency-already-registered',
          });
        } else {
          // No agency registered, allow creation
          setCanCreateAgency(true);
        }
      } catch (error) {
        console.error('Error checking agency status:', error);
        toast.error('Failed to check agency registration status');
        setCanCreateAgency(false);
      } finally {
        setChecking(false);
      }
    };

    checkAgencyRegistration();
  }, [user, getUserAgencyStatus]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking agency registration status...</p>
        </div>
      </div>
    );
  }

  if (!canCreateAgency && agencyStatus?.hasRegisteredAgency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Agency Already Registered
          </h1>
          
          <p className="text-gray-600 mb-2">
            Your agency <strong>{agencyStatus.agencyName}</strong> is already registered.
          </p>
          
          <p className="text-gray-600 mb-8">
            You can access all platform features from the main dashboard.
          </p>
          
          <button
            onClick={() => navigate(redirectTo)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Go to Platform
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Need help? Contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  // Allow agency creation
  return <>{children}</>;
};

export default AgencyRegistrationGuard;

// Enhanced wrapper for agency creation routes
export const withAgencyRegistrationGuard = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <AgencyRegistrationGuard>
      <Component {...props} />
    </AgencyRegistrationGuard>
  );
};