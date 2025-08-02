import React, { useState } from 'react';
import { X, Mail, Building2, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useApi } from '../../hooks/useApi';
import { useApp } from '../../contexts/AppContext';
import type { AgencyType, UserRole } from '../../types';

interface InviteAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InvitationFormData {
  email: string;
  name: string;
  intendedAgencyName: string;
  intendedAgencyType: AgencyType;
  role: UserRole;
}

const AGENCY_TYPES: { value: AgencyType; label: string }[] = [
  { value: 'HOME_HEALTH', label: 'Home Health' },
  { value: 'HOSPICE', label: 'Hospice' },
  { value: 'HOME_CARE', label: 'Home Care' },
  { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
  { value: 'OTHER', label: 'Other' },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'EDUCATOR', label: 'Educator' },
];

export const InviteAgencyModal: React.FC<InviteAgencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const api = useApi();
  const { currentUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    name: '',
    intendedAgencyName: '',
    intendedAgencyType: 'HOME_HEALTH',
    role: 'ADMIN',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Send invitation with intended agency data (agency will be created when user completes wizard)
      await api.createInvitation({
        email: formData.email,
        name: formData.name,
        intendedAgencyName: formData.intendedAgencyName,
        intendedAgencyType: formData.intendedAgencyType,
        role: formData.role,
        invitedByUserId: currentUser?.userId || 1, // Current user ID or fallback
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      intendedAgencyName: '',
      intendedAgencyType: 'HOME_HEALTH',
      role: 'ADMIN',
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Invite New Agency</h3>
            <p className="text-sm text-gray-500">
              Invite an admin/educator to create and manage their agency
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Agency Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900">Agency Information</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name *
            </label>
            <Input
              type="text"
              value={formData.intendedAgencyName}
              onChange={(e) => setFormData({ ...formData, intendedAgencyName: e.target.value })}
              placeholder="Enter agency name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Type *
            </label>
            <select
              value={formData.intendedAgencyType}
              onChange={(e) => setFormData({ ...formData, intendedAgencyType: e.target.value as AgencyType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {AGENCY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Admin User Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900">Admin User Information</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};