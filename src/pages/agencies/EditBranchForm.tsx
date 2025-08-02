// pages/agencies/EditBranchForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { Branch } from '../../types';

interface EditBranchFormProps {
  branch: Branch;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  location: string;
  ccn: string;
}

export const EditBranchForm: React.FC<EditBranchFormProps> = ({
  branch,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: branch.name,
      location: branch.location || '',
      ccn: branch.ccn || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.updateBranch(branch.branchId, {
        name: data.name,
        location: data.location || undefined,
        ccn: data.ccn || undefined,
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Branch Name *
        </label>
        <Input
          {...register('name', { required: 'Branch name is required' })}
          placeholder="Enter branch name"
          error={errors.name?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <Input
          {...register('location')}
          placeholder="Enter branch location"
          error={errors.location?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CCN (Certification Number)
        </label>
        <Input
          {...register('ccn')}
          placeholder="Enter CCN"
          error={errors.ccn?.message}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Branch'}
        </Button>
      </div>
    </form>
  );
};