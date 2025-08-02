// pages/teams/CreateTeamForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { CreateTeamRequest } from '../../types';

interface CreateTeamFormProps {
  branchId: number;
  branchName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({
  branchId,
  branchName,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTeamRequest>({
    defaultValues: { branchId },
  });

  const onSubmit = async (data: CreateTeamRequest) => {
    try {
      await apiClient.createTeam(data);
      onSuccess();
    } catch (error: any) {
      setError('name', {
        type: 'server',
        message: error.response?.data?.message || 'Failed to create team',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Creating team for branch: <span className="font-medium">{branchName}</span>
        </p>
      </div>

      <Input
        label="Team Name"
        {...register('name', { required: 'Team name is required' })}
        error={errors.name?.message}
        placeholder="Enter team name"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter team description (optional)"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create Team
        </Button>
      </div>
    </form>
  );
};