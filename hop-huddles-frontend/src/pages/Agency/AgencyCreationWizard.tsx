// pages/Agency/EnhancedAgencyCreationWizard.tsx - Enhanced wizard with agency registration tracking
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  GitBranch, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface AgencyCreationData {
  name: string;
  agencyStructure: 'SINGLE' | 'ENTERPRISE';
  agencyType: 'HOME_HEALTH' | 'HOME_CARE' | 'HOSPICE' | 'SKILLED_NURSING' | 'OTHER';
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  ccn?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

const EnhancedAgencyCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, setCurrentAgency, markAgencyAsRegistered } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<AgencyCreationData>({
    defaultValues: {
      contactEmail: user?.email || '',
    },
  });

  const createAgencyMutation = useMutation(apiClient.createAgency, {
    onSuccess: (agency) => {
      toast.success('Agency created successfully!');
      setCurrentAgency(agency);
      markAgencyAsRegistered(agency.agencyId);
      
      // Navigate to main platform after successful creation
      setTimeout(() => {
        navigate('/main-platform');
      }, 1500);
    },
    onError: (error) => {
      toast.error('Failed to create agency');
      console.error(error);
    }
  });

  const watchedAgencyStructure = watch('agencyStructure');

  const nextStep = async () => {
    let fieldsToValidate: (keyof AgencyCreationData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['agencyStructure'];
        break;
      case 2:
        fieldsToValidate = ['name', 'agencyType', 'subscriptionPlan', 'contactEmail'];
        break;
      case 3:
        if (watchedAgencyStructure === 'SINGLE') {
          fieldsToValidate = ['ccn'];
        }
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 4) {
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
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              step <= currentStep
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {step < currentStep ? <Check size={20} /> : step}
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Building className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Agency Structure</h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Select the structure that best fits your organization. You can always modify this later.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Single Agency Option */}
        <label className={`cursor-pointer block p-8 border-2 rounded-xl transition-all ${
          watchedAgencyStructure === 'SINGLE' 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}>
          <input
            type="radio"
            value="SINGLE"
            {...register('agencyStructure', { required: 'Please select an agency structure' })}
            className="sr-only"
          />
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              watchedAgencyStructure === 'SINGLE' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Building className={`h-8 w-8 ${
                watchedAgencyStructure === 'SINGLE' ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Single Agency</h3>
            <p className="text-gray-600 mb-4">
              One location with a single CCN number. Perfect for independent agencies or single-location operations.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Single CCN registration
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Centralized management
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Team-based organization
              </li>
            </ul>
          </div>
        </label>

        {/* Enterprise Option */}
        <label className={`cursor-pointer block p-8 border-2 rounded-xl transition-all ${
          watchedAgencyStructure === 'ENTERPRISE' 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}>
          <input
            type="radio"
            value="ENTERPRISE"
            {...register('agencyStructure', { required: 'Please select an agency structure' })}
            className="sr-only"
          />
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              watchedAgencyStructure === 'ENTERPRISE' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <GitBranch className={`h-8 w-8 ${
                watchedAgencyStructure === 'ENTERPRISE' ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise (Multiple Branches)</h3>
            <p className="text-gray-600 mb-4">
              Multiple locations, each with their own CCN. Ideal for agencies with multiple branches or franchises.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Multiple branches with individual CCNs
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Hierarchical management structure
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Branch-specific teams and users
              </li>
            </ul>
          </div>
        </label>
      </div>

      {errors.agencyStructure && (
        <div className="text-center">
          <p className="text-red-600 text-sm flex items-center justify-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.agencyStructure.message}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Information</h2>
        <p className="text-gray-600">Provide basic information about your agency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Agency Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Agency name is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your agency name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="agencyType" className="block text-sm font-medium text-gray-700 mb-2">
            Agency Type *
          </label>
          <select
            id="agencyType"
            {...register('agencyType', { required: 'Agency type is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.agencyType ? 'border-red-300' : 'border-gray-300'
            }`}
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
          <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Plan *
          </label>
          <select
            id="subscriptionPlan"
            {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.subscriptionPlan ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select plan</option>
            <option value="TRIAL">Trial (30 days)</option>
            <option value="BASIC">Basic</option>
            <option value="PREMIUM">Premium</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
          {errors.subscriptionPlan && (
            <p className="mt-1 text-sm text-red-600">{errors.subscriptionPlan.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            {...register('contactEmail', { 
              required: 'Contact email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.contactEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="contact@agency.com"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            {...register('contactPhone')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            {...register('address')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (watchedAgencyStructure === 'ENTERPRISE') {
      return (
        <div className="space-y-6 max-w-lg mx-auto text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Setup</h2>
          <p className="text-gray-600">
            For enterprise agencies, you can add branch-specific CCN numbers after creating your agency. 
            Each branch will have its own CCN number and can manage teams independently.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Next steps:</strong> After creating your agency, you'll be able to add branches 
              with their individual CCN numbers through the branch management interface.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CCN Registration</h2>
          <p className="text-gray-600">Provide your CMS Certification Number</p>
        </div>

        <div>
          <label htmlFor="ccn" className="block text-sm font-medium text-gray-700 mb-2">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg ${
              errors.ccn ? 'border-red-300' : 'border-gray-300'
            }`}
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600">Review your agency information and create your account</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-lg font-semibold">{watch('agencyType')?.replace('_', ' ')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Plan</h3>
            <p className="text-lg font-semibold">{watch('subscriptionPlan')}</p>
          </div>
          {watch('ccn') && (
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
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Ready to create your agency!
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Once created, you'll have access to all HOP platform features. 
                You can manage users, create educational content, and track progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createAgencyMutation.isLoading}
                className="flex items-center px-8 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {createAgencyMutation.isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Agency
                    <Sparkles size={16} className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedAgencyCreationWizard;