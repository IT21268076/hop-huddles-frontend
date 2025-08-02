// pages/auth/AgencyRegistrationWizard.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Building2, 
  User, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/Auth0Context';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { CreateAgencyRequest, AgencyType, SubscriptionPlan } from '../../types';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Welcome to HOP Huddles',
    icon: Sparkles,
  },
  {
    id: 'tier',
    title: 'Organization Type',
    description: 'Choose your setup type',
    icon: Users,
  },
  {
    id: 'agency',
    title: 'Agency Setup',
    description: 'Configure your agency details',
    icon: Building2,
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Setup complete',
    icon: CheckCircle,
  },
];

export const AgencyRegistrationWizard: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentUser, currentAgency, setCurrentAgency } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [organizationType, setOrganizationType] = useState<'single' | 'enterprise' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<CreateAgencyRequest>({
    defaultValues: {
      name: '',
      ccn: '',
      agencyType: 'HOME_HEALTH',
      subscriptionPlan: 'BASIC',
      contactEmail: '',
      contactPhone: '',
      address: '',
    },
  });

  useEffect(() => {
    // Check if user was invited
    const pendingInvitation = localStorage.getItem('pendingInvitation');
    if (pendingInvitation) {
      const invitation = JSON.parse(pendingInvitation);
      setInvitationData(invitation);
      
      // Pre-populate form with intended agency data from invitation
      if (invitation.intendedAgencyName) {
        setValue('name', invitation.intendedAgencyName);
      }
      if (invitation.intendedAgencyType) {
        setValue('agencyType', invitation.intendedAgencyType);
      }
    }
  }, [setValue]);

  // Update subscription plan based on organization type
  useEffect(() => {
    if (organizationType === 'enterprise') {
      setValue('subscriptionPlan', 'ENTERPRISE');
      // Clear CCN for enterprise organizations
      setValue('ccn', '');
    } else if (organizationType === 'single') {
      setValue('subscriptionPlan', 'BASIC');
    }
  }, [organizationType, setValue]);

  const handleAgencySubmit = async (data: CreateAgencyRequest) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Prepare agency data - remove CCN for enterprise organizations
      const agencyData = { ...data };
      if (organizationType === 'enterprise') {
        // Enterprise organizations don't need CCN
        delete agencyData.ccn;
      }
      
      // Create the agency
      const agency = await apiClient.createAgency(agencyData);
      setCurrentAgency(agency);

      // If user was invited, link the created agency to the invitation BEFORE creating user
      if (invitationData?.token) {
        try {
          await apiClient.linkAgencyToInvitation(invitationData.token, agency.agencyId);
          console.log('SUCCESS: Agency linked to invitation before user creation');
        } catch (linkError: any) {
          console.error('ERROR: Failed to link agency to invitation:', linkError);
          throw new Error(`Failed to link agency to invitation: ${linkError.response?.data?.message || linkError.message}`);
        }
      }

      // Create or update the user - this should now find the linked agency in invitation
      const userData = {
        email: user.email!,
        name: user.name || user.email!,
        auth0Id: user.sub!,
        invitationToken: invitationData?.token,
      };

      const createdUser = await apiClient.createInvitedUser(userData);
      
      // Mark agency setup as complete via API and link to the created agency
      const updatedUser = await apiClient.completeAgencySetup(createdUser.userId, agency.agencyId);
      
      setCurrentUser(updatedUser);
      
      // Clean up invitation data
      localStorage.removeItem('pendingInvitation');
      localStorage.removeItem('invitationToken');
      
      setCurrentStep(3); // Move to completion step
    } catch (error: any) {
      console.error('Failed to create agency:', error);
      
      // Handle validation errors
      if (error.response?.data?.fieldErrors) {
        const fieldErrors = error.response.data.fieldErrors;
        
        // Set specific field errors
        Object.entries(fieldErrors).forEach(([fieldName, errorMessage]: [string, any]) => {
          setError(fieldName as any, {
            type: 'server',
            message: errorMessage,
          });
        });
      } else {
        // Set general error
        setError('name', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to create agency',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const agencyTypeOptions = [
    { value: 'HOME_HEALTH', label: 'Home Health' },
    { value: 'HOME_CARE', label: 'Home Care' },
    { value: 'HOSPICE', label: 'Hospice' },
    { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
    { value: 'OTHER', label: 'Other' },
  ];

  const getSubscriptionPlanOptions = () => {
    if (organizationType === 'enterprise') {
      return [
        { value: 'ENTERPRISE', label: 'Enterprise Plan' },
        { value: 'PREMIUM', label: 'Premium Plan' },
      ];
    }
    return [
      { value: 'TRIAL', label: 'Trial (30 days)' },
      { value: 'BASIC', label: 'Basic Plan' },
      { value: 'PREMIUM', label: 'Premium Plan' },
    ];
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Sparkles className="h-12 w-12" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to HOP Huddles!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {invitationData ? 
            `You've been invited to create and manage ${invitationData.intendedAgencyName || invitationData.agencyName} as a ${invitationData.roleName}.` :
            "Let's get you set up with your agency's AI-powered healthcare education platform."
          }
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll get:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 bg-blue-600 rounded-full" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI-Generated Content</p>
              <p className="text-sm text-gray-600">Personalized huddles for your role and discipline</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 bg-purple-600 rounded-full" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Progress Tracking</p>
              <p className="text-sm text-gray-600">Monitor learning progress and assessments</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 bg-blue-600 rounded-full" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Team Management</p>
              <p className="text-sm text-gray-600">Organize users by branches and teams</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 bg-purple-600 rounded-full" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Analytics & Insights</p>
              <p className="text-sm text-gray-600">Detailed reporting and performance metrics</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleNext} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
        Let's Get Started
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  const renderTierStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-600 text-white mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Organization Type
        </h2>
        <p className="text-gray-600">
          Select the option that best describes your healthcare organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Agency Option */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            organizationType === 'single' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:border-gray-400'
          }`}
          onClick={() => setOrganizationType('single')}
        >
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Single Agency
            </h3>
            <p className="text-gray-600 mb-4">
              Perfect for individual healthcare agencies with one location or single branch operations.
            </p>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">Best for:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Single location agencies</li>
                <li>• Small to medium healthcare providers</li>
                <li>• Independent practices</li>
                <li>• Agencies with one main branch</li>
                <li>• Requires CMS Certification Number (CCN)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Enterprise/Corporation Option */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            organizationType === 'enterprise' 
              ? 'ring-2 ring-purple-500 bg-purple-50' 
              : 'hover:border-gray-400'
          }`}
          onClick={() => setOrganizationType('enterprise')}
        >
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-600 text-white mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Enterprise/Corporation
            </h3>
            <p className="text-gray-600 mb-4">
              Ideal for large healthcare organizations with multiple branches, locations, or subsidiaries.
            </p>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">Best for:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-branch organizations</li>
                <li>• Healthcare corporations</li>
                <li>• Franchise operations</li>
                <li>• Regional healthcare networks</li>
                <li>• Centralized branch management</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!organizationType}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderAgencyStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white mb-4">
          <Building2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {invitationData ? 'Complete Agency Setup' : 'Create Your Agency'}
        </h2>
        <p className="text-gray-600">
          {invitationData ? 
            'Complete the setup to access your agency dashboard.' :
            `Setting up your ${organizationType === 'enterprise' ? 'Enterprise' : 'Single Agency'} account.`
          }
        </p>
        {organizationType && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            <Users className="h-4 w-4 mr-1" />
            {organizationType === 'enterprise' ? 'Enterprise Setup' : 'Single Agency Setup'}
          </div>
        )}
      </div>

      <Card>
        <form onSubmit={handleSubmit(handleAgencySubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Agency Name"
              {...register('name', { required: 'Agency name is required' })}
              error={errors.name?.message}
              placeholder="ABC Healthcare Services"
            />

            {organizationType === 'single' && (
              <div>
                <Input
                  label="CCN (CMS Certification Number)"
                  {...register('ccn', {
                    required: organizationType === 'single' ? 'CCN is required for single agencies' : false,
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'CCN must be exactly 6 digits',
                    },
                  })}
                  error={errors.ccn?.message}
                  placeholder="123456"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 6-digit CMS Certification Number (e.g. 123456)
                </p>
              </div>
            )}

            <Select
              label="Agency Type"
              {...register('agencyType', { required: 'Agency type is required' })}
              error={errors.agencyType?.message}
              options={agencyTypeOptions}
              placeholder="Select agency type"
              value={watch('agencyType')}
            />

            <Select
              label="Subscription Plan"
              {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
              error={errors.subscriptionPlan?.message}
              options={getSubscriptionPlanOptions()}
              placeholder="Select subscription plan"
              value={watch('subscriptionPlan')}
            />

            <Input
              label="Contact Email"
              type="email"
              {...register('contactEmail', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              error={errors.contactEmail?.message}
              placeholder="admin@agency.com"
            />

            <Input
              label="Contact Phone"
              {...register('contactPhone')}
              error={errors.contactPhone?.message}
              placeholder="(555) 123-4567"
            />
          </div>

          <Textarea
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Enter agency address"
            rows={3}
          />

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              type="submit"
              loading={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {invitationData ? 'Complete Setup' : 'Create Agency'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-600 text-white">
        <CheckCircle className="h-12 w-12" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Agency!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Your agency setup is complete. You can now access the full HOP Huddles platform.
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps:</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Invite Your Team</p>
              <p className="text-sm text-gray-600">Add users and assign them to branches and teams</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Set Up Branches</p>
              <p className="text-sm text-gray-600">Organize your agency structure with branches and teams</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Create Your First Huddle</p>
              <p className="text-sm text-gray-600">Generate AI-powered content for your team</p>
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => {
          // Small delay to ensure backend has processed the setup completion
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }} 
        size="lg"
        className="bg-gradient-to-r from-green-600 to-blue-600"
      >
        Enter Dashboard
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  const stepContent = [renderWelcomeStep, renderTierStep, renderAgencyStep, renderCompleteStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-full border-2 ${
                      index <= currentStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {stepContent[currentStep]()}
        </div>
      </div>
    </div>
  );
};