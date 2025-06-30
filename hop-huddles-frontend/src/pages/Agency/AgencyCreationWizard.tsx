// pages/Agency/AgencyCreationWizard.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { 
  Building, 
  GitBranch, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { AgencyType, SubscriptionPlan, CreateAgencyRequest } from '../../types';

interface AgencyCreationData {
  // Step 1: Agency Type Selection
  agencyStructure: 'SINGLE' | 'ENTERPRISE';
  
  // Step 2: Basic Info
  name: string;
  agencyType: AgencyType;
  subscriptionPlan: SubscriptionPlan;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  
  // Step 3: CCN Configuration
  ccn?: string; // Only for single agency
  
  // Step 4: Enterprise Setup (if enterprise)
  enterpriseSetup?: {
    headquarters: {
      name: string;
      location: string;
    };
    initialBranches: Array<{
      name: string;
      location: string;
      ccn: string;
    }>;
  };
}

const AgencyCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agencyData, setAgencyData] = useState<Partial<AgencyCreationData>>({});
  const { user, setCurrentAgency } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<AgencyCreationData>();

  const createAgencyMutation = useMutation(
    async (data: AgencyCreationData) => {
      // Create agency first
      const agencyRequest: CreateAgencyRequest = {
          name: data.name,
          ccn: data.agencyStructure === 'SINGLE' ? data.ccn! : '',
          agencyType: data.agencyType,
          subscriptionPlan: data.subscriptionPlan,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          address: data.address,
          agencyStructure: 'SINGLE'
      };
      
      const agency = await apiClient.createAgency(agencyRequest);
      
      // If enterprise, create branches
      if (data.agencyStructure === 'ENTERPRISE' && data.enterpriseSetup) {
        const branchPromises = data.enterpriseSetup.initialBranches.map(branch =>
          apiClient.createBranch({
            agencyId: agency.agencyId,
            name: branch.name,
            location: branch.location,
            ccn: branch.ccn
          })
        );
        
        await Promise.all(branchPromises);
      }
      
      return agency;
    },
    {
      onSuccess: (agency) => {
        toast.success('Agency created successfully!');
        setCurrentAgency(agency);
        // Redirect to dashboard or next step
      },
      onError: (error) => {
        toast.error('Failed to create agency');
        console.error(error);
      }
    }
  );

  const watchedAgencyStructure = watch('agencyStructure');

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: AgencyCreationData) => {
    createAgencyMutation.mutate(data);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? <Check size={16} /> : step}
          </div>
          {step < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Agency Structure</h2>
        <p className="text-gray-600">Select the structure that best fits your organization</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Agency Option */}
        <label className={`cursor-pointer block p-6 border-2 rounded-lg transition-all ${
          watchedAgencyStructure === 'SINGLE' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            value="SINGLE"
            {...register('agencyStructure', { required: 'Please select an agency structure' })}
            className="sr-only"
          />
          <div className="flex items-start space-x-3">
            <Building className={`h-6 w-6 mt-1 ${
              watchedAgencyStructure === 'SINGLE' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Single Agency</h3>
              <p className="text-sm text-gray-600 mt-1">
                One location with a single CCN number. Perfect for independent agencies or single-location operations.
              </p>
              <ul className="mt-3 text-sm text-gray-500 space-y-1">
                <li>• Single CCN registration</li>
                <li>• Centralized management</li>
                <li>• Team-based organization</li>
              </ul>
            </div>
          </div>
        </label>

        {/* Enterprise Option */}
        <label className={`cursor-pointer block p-6 border-2 rounded-lg transition-all ${
          watchedAgencyStructure === 'ENTERPRISE' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            value="ENTERPRISE"
            {...register('agencyStructure', { required: 'Please select an agency structure' })}
            className="sr-only"
          />
          <div className="flex items-start space-x-3">
            <GitBranch className={`h-6 w-6 mt-1 ${
              watchedAgencyStructure === 'ENTERPRISE' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enterprise (Multiple Branches)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Multiple locations, each with their own CCN. Ideal for agencies with multiple branches or franchises.
              </p>
              <ul className="mt-3 text-sm text-gray-500 space-y-1">
                <li>• Multiple branches with individual CCNs</li>
                <li>• Hierarchical management structure</li>
                <li>• Branch-specific teams and users</li>
              </ul>
            </div>
          </div>
        </label>
      </div>

      {errors.agencyStructure && (
        <p className="text-red-600 text-sm flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {errors.agencyStructure.message}
        </p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Information</h2>
        <p className="text-gray-600">Provide basic information about your agency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Agency Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Agency name is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your agency name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="agencyType" className="block text-sm font-medium text-gray-700">
            Agency Type *
          </label>
          <select
            id="agencyType"
            {...register('agencyType', { required: 'Agency type is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select agency type</option>
            <option value="HOME_HEALTH">Home Health</option>
            <option value="HOME_CARE">Home Care</option>
            <option value="HOSPICE">Hospice</option>
            <option value="SKILLED_NURSING">Skilled Nursing</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.agencyType && (
            <p className="mt-1 text-sm text-red-600">{errors.agencyType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">
            Subscription Plan *
          </label>
          <select
            id="subscriptionPlan"
            {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select plan</option>
            <option value="TRIAL">Trial</option>
            <option value="BASIC">Basic</option>
            <option value="PREMIUM">Premium</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
          {errors.subscriptionPlan && (
            <p className="mt-1 text-sm text-red-600">{errors.subscriptionPlan.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            {...register('contactEmail', { 
              required: 'Contact email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@agency.com"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
            Contact Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            {...register('contactPhone')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            {...register('address')}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your agency address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (watchedAgencyStructure === 'ENTERPRISE') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Setup</h2>
            <p className="text-gray-600">Enterprise agencies don't require a main CCN - each branch will have its own</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <GitBranch className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Enterprise Structure</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your agency will be set up as an enterprise with multiple branches. Each branch will have its own CCN number and can manage teams independently.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CCN Registration</h2>
          <p className="text-gray-600">Provide your CMS Certification Number</p>
        </div>

        <div className="max-w-md mx-auto">
          <label htmlFor="ccn" className="block text-sm font-medium text-gray-700">
            CMS Certification Number (CCN) *
          </label>
          <input
            type="text"
            id="ccn"
            {...register('ccn', {
              required: watchedAgencyStructure === 'SINGLE' ? 'CCN is required for single agencies' : false,
              pattern: {
                value: /^\d{6}$/,
                message: 'CCN must be exactly 6 digits',
              },
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
            placeholder="123456"
            maxLength={6}
          />
          {errors.ccn && (
            <p className="mt-1 text-sm text-red-600">{errors.ccn.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-500 text-center">
            Your 6-digit Medicare certification number
          </p>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600">Review your agency information and create your account</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Structure</h3>
          <p className="text-lg font-semibold">
            {watchedAgencyStructure === 'SINGLE' ? 'Single Agency' : 'Enterprise (Multiple Branches)'}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Agency Name</h3>
          <p className="text-lg font-semibold">{watch('name')}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Type</h3>
          <p className="text-lg font-semibold">
            {watch('agencyType')?.replace('_', ' ')}
          </p>
        </div>

        {watchedAgencyStructure === 'SINGLE' && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">CCN</h3>
            <p className="text-lg font-semibold">{watch('ccn')}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
          <p className="text-lg font-semibold">{watch('contactEmail')}</p>
        </div>
      </div>

      {watchedAgencyStructure === 'ENTERPRISE' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Next Steps:</strong> After creating your agency, you'll be able to add branches with their individual CCN numbers and create teams within each branch.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepIndicator()}
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createAgencyMutation.isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {createAgencyMutation.isLoading ? 'Creating...' : 'Create Agency'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgencyCreationWizard;