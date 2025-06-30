import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Team, CreateTeamRequest } from '../../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest | Partial<CreateTeamRequest>) => void;
  team?: Team | null;
  branchId: number;
  isLoading: boolean;
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  team,
  branchId,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamRequest>();

  useEffect(() => {
    if (team) {
      reset({
        branchId: team.branchId,
        name: team.name,
        description: team.description || '',
      });
    } else {
      reset({
        branchId,
        name: '',
        description: '',
      });
    }
  }, [team, branchId, reset]);

  const handleFormSubmit = (data: CreateTeamRequest) => {
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

              <div className="space-y-4">
                {/* Hidden branch ID field */}
                <input
                  type="hidden"
                  {...register('branchId')}
                  value={branchId}
                />

                {/* Team Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Team name is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter team name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    {...register('description')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter team description (optional)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Briefly describe the team's purpose or focus area.
                  </p>
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
                    {team ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  team ? 'Update Team' : 'Create Team'
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

export default TeamModal;