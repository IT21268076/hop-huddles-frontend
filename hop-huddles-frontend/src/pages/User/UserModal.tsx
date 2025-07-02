// pages/User/EnhancedUserModal.tsx - Simplified user modal for basic info only
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, User, Mail, Phone, Save } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { User as UserType, CreateUserRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserFormData {
  name: string;
  email: string;
  phone?: string;
}

interface EnhancedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null;
  onUserCreated?: (user: UserType) => void; // Callback for when user is created
  onSuccess?: () => void;
}

const EnhancedUserModal: React.FC<EnhancedUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserCreated,
  onSuccess
}) => {
  const { currentAgency } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  // Create user mutation
  const createUserMutation = useMutation(
    (userData: CreateUserRequest) => apiClient.createUser(userData),
    {
      onSuccess: (newUser: UserType) => {
        queryClient.invalidateQueries(['users']);
        toast.success('User created successfully');
        reset();
        
        if (onUserCreated) {
          // Callback to parent to open assignment modal
          onUserCreated(newUser);
        }
        
        onClose();
      },
      onError: (error: any) => {
        toast.error('Failed to create user');
        console.error(error);
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    (userData: Partial<UserFormData>) => 
      user ? apiClient.updateUser(user.userId, userData) : Promise.reject(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User updated successfully');
        reset();
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        toast.error('Failed to update user');
        console.error(error);
      }
    }
  );

  const onSubmit = (data: UserFormData) => {
    if (user) {
      // Update existing user
      updateUserMutation.mutate(data);
    } else {
      // Create new user
      const createRequest: CreateUserRequest = {
        auth0Id: `user_${Date.now()}`, // Mock auth0Id - in production this would come from Auth0
        email: data.email,
        name: data.name,
        phone: data.phone
      };
      createUserMutation.mutate(createRequest);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const isCreating = !user;
  const isLoading = createUserMutation.isLoading || updateUserMutation.isLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isCreating ? 'Add New User' : 'Edit User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isCreating 
                        ? 'Enter basic user information. You\'ll assign roles and permissions next.'
                        : 'Update user information'
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Agency Context */}
              {currentAgency && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Agency:</strong> {currentAgency.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    User will be added to this agency
                  </p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Enter full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="user@company.com"
                      disabled={isLoading || !!user} // Disable email editing for existing users
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                  {user && (
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed for existing users
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="(555) 123-4567"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Next Steps Info (for creation) */}
              {isCreating && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps</h4>
                  <p className="text-sm text-gray-600">
                    After creating the user, you'll be able to assign roles, disciplines, branches, and teams.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    {isCreating ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isCreating ? 'Create User' : 'Update User'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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

export default EnhancedUserModal;