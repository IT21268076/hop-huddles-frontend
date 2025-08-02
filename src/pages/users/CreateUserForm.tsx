// pages/users/CreateUserForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { CreateUserRequest } from '../../types';

interface CreateUserFormProps {
  agencyId: number;
  onSuccess: (user?: any) => void;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateUserRequest>();

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      // Generate a temporary auth0Id for demo purposes
      const auth0IdData = {
        ...data,
        auth0Id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Create the user first
      const createdUser = await apiClient.createUser(auth0IdData);
      console.log('User created successfully:', createdUser);
      
      // Create a default assignment to ensure data integrity
      // This prevents the user from disappearing from lists if assignment modal is closed
      try {
        await apiClient.createAssignment({
          userId: createdUser.userId,
          agencyId: agencyId,
          roles: ['FIELD_CLINICIAN'], // Default role
          discipline: 'RN', // Default discipline
          isPrimary: true,
        });
        console.log('Default assignment created for user:', createdUser.userId);
      } catch (assignmentError) {
        console.warn('Failed to create default assignment, user will need manual assignment:', assignmentError);
      }
      
      // Show success message
      setSuccessMessage(`User "${createdUser.name}" created successfully with default assignment! You can now customize their roles and access.`);
      
      // Auto-close after 1.5 seconds and pass the created user for assignment
      setTimeout(() => {
        onSuccess(createdUser);
      }, 1500);
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateUserRequest, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        setError('email', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to create user',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-600">{successMessage}</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          {...register('name', { required: 'Full name is required' })}
          error={errors.name?.message}
          placeholder="John Doe"
        />

        <Input
          label="Email Address"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address',
            },
          })}
          error={errors.email?.message}
          placeholder="john.doe@example.com"
        />

        <Input
          label="Phone Number"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(555) 123-4567"
        />

        <Input
          label="Profile Picture URL"
          {...register('profilePictureUrl')}
          error={errors.profilePictureUrl?.message}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Assignment Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                After creating the user, you'll be prompted to assign roles, disciplines, 
                and access levels. Users need at least one assignment to access the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create User
        </Button>
      </div>
    </form>
  );
};