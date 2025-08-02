// pages/agencies/CreateAgencyForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { apiClient } from '../../services/api';
import { CreateAgencyRequest, AgencyType, SubscriptionPlan } from '../../types';

interface CreateAgencyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateAgencyForm: React.FC<CreateAgencyFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateAgencyRequest>();

  const onSubmit = async (data: CreateAgencyRequest) => {
    try {
      await apiClient.createAgency(data);
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateAgencyRequest, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        setError('name', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to create agency',
        });
      }
    }
  };

  const agencyTypeOptions = [
    { value: 'HOME_HEALTH', label: 'Home Health' },
    { value: 'HOME_CARE', label: 'Home Care' },
    { value: 'HOSPICE', label: 'Hospice' },
    { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
    { value: 'OTHER', label: 'Other' },
  ];

  const subscriptionPlanOptions = [
    { value: 'TRIAL', label: 'Trial' },
    { value: 'BASIC', label: 'Basic' },
    { value: 'PREMIUM', label: 'Premium' },
    { value: 'ENTERPRISE', label: 'Enterprise' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Agency Name"
          {...register('name', { required: 'Agency name is required' })}
          error={errors.name?.message}
          placeholder="Enter agency name"
        />

        <Input
          label="CCN (CMS Certification Number)"
          {...register('ccn', {
            required: 'CCN is required',
            pattern: {
              value: /^\d{6}$/,
              message: 'CCN must be exactly 6 digits',
            },
          })}
          error={errors.ccn?.message}
          placeholder="123456"
          maxLength={6}
        />

        <Select
          label="Agency Type"
          {...register('agencyType', { required: 'Agency type is required' })}
          error={errors.agencyType?.message}
          options={agencyTypeOptions}
          placeholder="Select agency type"
        />

        <Select
          label="Subscription Plan"
          {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
          error={errors.subscriptionPlan?.message}
          options={subscriptionPlanOptions}
          placeholder="Select subscription plan"
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create Agency
        </Button>
      </div>
    </form>
  );
};