// pages/agencies/BranchDetailModal.tsx
import React, { useState } from 'react';
import { Edit, UserMinus, Users, MapPin, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Branch } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';
import { EditBranchForm } from './EditBranchForm';

interface BranchDetailModalProps {
  branch: Branch;
  onClose: () => void;
  onUserManagement: () => void;
}

export const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  branch,
  onClose,
  onUserManagement,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);

  const handleInactivate = async () => {
    // TODO: Implement branch inactivation
    console.log('Inactivating branch:', branch.branchId);
    setIsInactivateModalOpen(false);
    onClose();
  };

  if (isEditMode) {
    return (
      <EditBranchForm
        branch={branch}
        onSuccess={() => {
          setIsEditMode(false);
          onClose();
        }}
        onCancel={() => setIsEditMode(false)}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Branch Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
              <p className="text-sm text-gray-600">{branch.location || 'No location specified'}</p>
            </div>
          </div>
          <Badge variant={getActiveStatus(branch) ? 'success' : 'error'}>
            {getActiveStatus(branch) ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Branch Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Branch Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium text-gray-900">{branch.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CCN:</span>
                  <span className="text-sm font-medium text-gray-900">{branch.ccn || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(branch.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Teams:</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Users:</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getActiveStatus(branch) ? 'success' : 'error'} size="sm">
                    {getActiveStatus(branch) ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={() => setIsEditMode(true)}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Branch Details
          </Button>
          
          <Button
            onClick={onUserManagement}
          >
            <Users className="h-4 w-4 mr-2" />
            Add Users to Branch
          </Button>
          
          <Button
            onClick={() => setIsInactivateModalOpen(true)}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Inactive Branch
          </Button>
        </div>
      </div>

      {/* Inactivate Confirmation Modal */}
      <Modal
        isOpen={isInactivateModalOpen}
        onClose={() => setIsInactivateModalOpen(false)}
        title="Confirm Branch Inactivation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to inactivate "{branch.name}"? This action will disable the branch 
            and affect all associated teams and users.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsInactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleInactivate}
            >
              Inactivate Branch
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};