// src/pages/Team/TeamModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Team, CreateTeamRequest } from '../../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest | Partial<CreateTeamRequest>) => void;
  team: Team | null;
  branchId: number;
  isLoading: boolean;
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  team,
  branchId,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateTeamRequest>({
    defaultValues: team ? {
      branchId: team.branchId,
      name: team.name,
      description: team.description || ''
    } : { branchId }
  });

  React.useEffect(() => {
    if (team) {
      reset({
        branchId: team.branchId,
        name: team.name,
        description: team.description || ''
      });
    } else {
      reset({ branchId });
    }
  }, [team, branchId, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {team ? 'Edit Team' : 'Create New Team'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Team name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;