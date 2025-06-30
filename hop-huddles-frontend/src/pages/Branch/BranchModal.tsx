// src/pages/Branch/BranchModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Branch, CreateBranchRequest } from '../../types';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBranchRequest | Partial<CreateBranchRequest>) => void;
  branch: Branch | null;
  isLoading: boolean;
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  branch,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateBranchRequest>({
    defaultValues: branch ? {
      agencyId: branch.agencyId,
      name: branch.name,
      location: branch.location || '',
      ccn: branch.ccn
    } : {}
  });

  React.useEffect(() => {
    if (branch) {
      reset({
        agencyId: branch.agencyId,
        name: branch.name,
        location: branch.location || '',
        ccn: branch.ccn
      });
    } else {
      reset({});
    }
  }, [branch, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {branch ? 'Edit Branch' : 'Create New Branch'}
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
                  Branch Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Branch name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter branch name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ccn" className="block text-sm font-medium text-gray-700">
                  CCN *
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456"
                  maxLength={6}
                />
                {errors.ccn && (
                  <p className="mt-1 text-sm text-red-600">{errors.ccn.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter branch location"
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
                {isLoading ? 'Saving...' : branch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;