// pages/teams/TeamDetailModal.tsx
import React, { useState } from 'react';
import { Edit, UserMinus, Users, Building2, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Team } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';
import { EditTeamForm } from './EditTeamForm';

interface TeamDetailModalProps {
  team: Team;
  onClose: () => void;
  onUserManagement: () => void;
  isDetailedView?: boolean; // For Clinical Manager role view
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  onClose,
  onUserManagement,
  isDetailedView = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);

  const handleInactivate = async () => {
    // TODO: Implement team inactivation
    console.log('Inactivating team:', team.teamId);
    setIsInactivateModalOpen(false);
    onClose();
  };

  if (isEditMode) {
    return (
      <EditTeamForm
        team={team}
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
        {/* Team Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.description || 'No description provided'}</p>
            </div>
          </div>
          <Badge variant={getActiveStatus(team) ? 'success' : 'error'}>
            {getActiveStatus(team) ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Team Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Team Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{team.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium text-gray-900">{team.description || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <span className="text-sm font-medium text-gray-900">{team.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(team.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Members:</span>
                  <span className="text-sm font-medium text-gray-900">{team.userCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Huddles:</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getActiveStatus(team) ? 'success' : 'error'} size="sm">
                    {getActiveStatus(team) ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {!isDetailedView && (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Team Details
            </Button>
          )}
          
          <Button
            onClick={onUserManagement}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Team Members
          </Button>
          
          {!isDetailedView && (
            <Button
              onClick={() => setIsInactivateModalOpen(true)}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Inactivate Team
            </Button>
          )}
        </div>
      </div>

      {/* Inactivate Confirmation Modal */}
      <Modal
        isOpen={isInactivateModalOpen}
        onClose={() => setIsInactivateModalOpen(false)}
        title="Confirm Team Inactivation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to inactivate "{team.name}"? This action will disable the team 
            and affect all associated users.
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
              Inactivate Team
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};