import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Agency, CreateAgencyRequest, AgencyType, SubscriptionPlan } from '../../types';

interface AgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgencyRequest | Partial<CreateAgencyRequest>) => void;
  agency?: Agency | null;
  isLoading: boolean;
}

const agencyTypes: { value: AgencyType; label: string }[] = [
  { value: 'HOME_HEALTH', label: 'Home Health' },
  { value: 'HOME_CARE', label: 'Home Care' },
  { value: 'HOSPICE', label: 'Hospice' },
  { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
  { value: 'OTHER', label: 'Other' },
];

const subscriptionPlans: { value: SubscriptionPlan; label: string }[] = [
  { value: 'TRIAL', label: 'Trial' },
  { value: 'BASIC', label: 'Basic' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];

const AgencyModal: React.FC<AgencyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  agency,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAgencyRequest>();

  useEffect(() => {
    if (agency) {
      reset({
        name: agency.name,
        ccn: agency.ccn,
        agencyType: agency.agencyType,
        subscriptionPlan: agency.subscriptionPlan,
        contactEmail: agency.contactEmail || '',
        contactPhone: agency.contactPhone || '',
        address: agency.address || '',
      });
    } else {
      reset({
        name: '',
        ccn: '',
        agencyType: 'HOME_HEALTH',
        subscriptionPlan: 'TRIAL',
        contactEmail: '',
        contactPhone: '',
        address: '',
      });
    }
  }, [agency, reset]);

  const handleFormSubmit = (data: CreateAgencyRequest) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {agency ? 'Edit Agency' : 'Create New Agency'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Agency Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Agency name is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter agency name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* CCN */}
                <div>
                  <label htmlFor="ccn" className="block text-sm font-medium text-gray-700">
                    CMS Certification Number (CCN) *
                  </label>
                  <input
                    type="text"
                    id="ccn"
                    {...register('ccn', {
                      required: 'CCN is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'CCN must be exactly 6 digits',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ccn ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="123456"
                    maxLength={6}
                  />
                  {errors.ccn && (
                    <p className="mt-1 text-sm text-red-600">{errors.ccn.message}</p>
                  )}
                </div>

                {/* Agency Type */}
                <div>
                  <label htmlFor="agencyType" className="block text-sm font-medium text-gray-700">
                    Agency Type *
                  </label>
                  <select
                    id="agencyType"
                    {...register('agencyType', { required: 'Agency type is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.agencyType ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    {agencyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.agencyType && (
                    <p className="mt-1 text-sm text-red-600">{errors.agencyType.message}</p>
                  )}
                </div>

                {/* Subscription Plan */}
                <div>
                  <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">
                    Subscription Plan *
                  </label>
                  <select
                    id="subscriptionPlan"
                    {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.subscriptionPlan ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                  {errors.subscriptionPlan && (
                    <p className="mt-1 text-sm text-red-600">{errors.subscriptionPlan.message}</p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    {...register('contactEmail', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="admin@agency.com"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    {...register('contactPhone')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    {...register('address')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="123 Healthcare Dr, Medical City, HC 12345"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {agency ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  agency ? 'Update Agency' : 'Create Agency'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgencyModal;