// pages/users/InviteUserForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { CreateUserInvitationRequest, UserRole } from '../../types';

interface InviteUserFormProps {
  agencyId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface InvitationFormData {
  email: string;
  name: string;
  role: UserRole;
}

export const InviteUserForm: React.FC<InviteUserFormProps> = ({
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const { currentUser } = useApp();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<InvitationFormData>();

  const onSubmit = async (data: InvitationFormData) => {
    if (!currentUser) {
      setError('email', { type: 'server', message: 'User not found' });
      return;
    }

    try {
      const invitationData: CreateUserInvitationRequest = {
        email: data.email,
        name: data.name,
        agencyId,
        role: data.role,
        invitedByUserId: currentUser.userId,
      };

      const result = await apiClient.sendUserInvitation(invitationData);
      
      // Show success message with invitation URL
      alert(`Invitation sent successfully!\n\nInvitation URL: ${result.invitationUrl}\n\nThe user will receive an email with this link.`);
      
      reset();
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof InvitationFormData, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        setError('email', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to send invitation',
        });
      }
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'DIRECTOR', label: 'Director (Branch Leader)' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager (Team Leader)' },
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
  ];

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Invite User to Join Agency
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Send an email invitation to a new user to join your agency
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="john.doe@agency.com"
          />
        </div>

        <Select
          label="Initial Role"
          {...register('role', { required: 'Role is required' })}
          error={errors.role?.message}
          options={roleOptions}
          placeholder="Select a role for this user"
          helper="This user can be assigned additional roles later"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                How Invitations Work
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>The user will receive an email with a secure invitation link</li>
                  <li>They'll be redirected to Auth0 to authenticate with their email</li>
                  <li>After authentication, they'll complete agency registration</li>
                  <li>You can assign additional roles and manage permissions later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </form>
    </Card>
  );
};