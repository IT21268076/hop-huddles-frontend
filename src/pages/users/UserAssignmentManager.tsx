// pages/users/UserAssignmentManager.tsx
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Shield, Users, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { User, UserAssignment } from '../../types';
import { getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { RoleDisciplineAssignmentForm } from './RoleDisciplineAssignmentForm';

interface UserAssignmentManagerProps {
  user: User;
  agencyId: number;
  onUpdate: () => void;
}

export const UserAssignmentManager: React.FC<UserAssignmentManagerProps> = ({
  user,
  agencyId,
  onUpdate,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<UserAssignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: assignments,
    loading,
    refetch,
  } = useAsync(
    async () => await apiClient.getAssignmentsByUser(user.userId),
    [user.userId]
  );

  const handleCreateAssignment = async () => {
    await refetch();
    setIsCreateModalOpen(false);
    onUpdate();
  };

  const handleDeleteAssignment = async () => {
    if (selectedAssignment) {
      try {
        await apiClient.deleteAssignment(selectedAssignment.assignmentId);
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedAssignment(null);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  const getPrimaryAssignment = () => {
    return assignments?.find((a: UserAssignment) => a.isPrimary);
  };

  const getAccessScopeIcon = (scope: string) => {
    switch (scope) {
      case 'AGENCY':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'BRANCH':
        return <Building2 className="h-4 w-4 text-green-600" />;
      case 'TEAM':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccessScopeColor = (scope: string) => {
    switch (scope) {
      case 'AGENCY':
        return 'bg-blue-50 border-blue-200';
      case 'BRANCH':
        return 'bg-green-50 border-green-200';
      case 'TEAM':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Primary Assignment Highlight */}
      {getPrimaryAssignment() && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Primary Assignment</div>
                <div className="text-sm text-blue-700">
                  {(() => {
                    const primary = getPrimaryAssignment();
                    return (
                      <>
                        {primary?.roles?.[0] && getRoleDisplayName(primary.roles[0])}
                        {primary?.disciplines && primary.disciplines.length > 0 && (
                          <span> • {primary.disciplines.map(d => getDisciplineDisplayName(d)).join(', ')}</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            <Badge variant="success">Primary</Badge>
          </div>
        </Card>
      )}

      {/* All Assignments */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          All Assignments ({assignments?.length || 0})
        </h4>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading assignments...</p>
          </div>
        ) : assignments && assignments.length > 0 ? (
          <div className="grid gap-4">
            {assignments.map((assignment: UserAssignment) => (
              <Card 
                key={assignment.assignmentId} 
                className={`transition-all hover:shadow-md ${getAccessScopeColor(assignment.accessScope)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getAccessScopeIcon(assignment.accessScope)}
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {/* Show all roles for this assignment */}
                        {assignment.roles.map((role) => (
                          <Badge 
                            key={role} 
                            variant="default"
                          >
                            {getRoleDisplayName(role)}
                          </Badge>
                        ))}
                        {/* Show all disciplines for this assignment */}
                        {assignment.disciplines && assignment.disciplines.map((discipline) => (
                          <Badge key={discipline} variant="info">
                            {getDisciplineDisplayName(discipline)}
                          </Badge>
                        ))}
                        {assignment.isPrimary && (
                          <Badge variant="success">Primary Assignment</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{assignment.accessScope}</span>
                        {assignment.branchName && (
                          <span> • {assignment.branchName}</span>
                        )}
                        {assignment.teamName && (
                          <span> • {assignment.teamName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600 mb-4">
                This user has no role assignments yet. Create their first assignment to get started.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assignment
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Add Assignment for ${user.name}`}
        size="xl"
      >
        <RoleDisciplineAssignmentForm
          user={user}
          agencyId={agencyId}
          onSuccess={handleCreateAssignment}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Delete Assignment Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this assignment? This action cannot be undone.
          </p>
          
          {selectedAssignment && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                {getAccessScopeIcon(selectedAssignment.accessScope)}
                <div>
                  <div className="font-medium text-red-900">
                    {selectedAssignment.roles?.[0] && getRoleDisplayName(selectedAssignment.roles[0])}
                    {selectedAssignment.disciplines && selectedAssignment.disciplines.length > 0 && (
                      <span> • {selectedAssignment.disciplines.map(d => getDisciplineDisplayName(d)).join(', ')}</span>
                    )}
                  </div>
                  <div className="text-sm text-red-700">
                    {selectedAssignment.accessScope}
                    {selectedAssignment.branchName && (
                      <span> • {selectedAssignment.branchName}</span>
                    )}
                    {selectedAssignment.teamName && (
                      <span> • {selectedAssignment.teamName}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedAssignment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAssignment}
            >
              Delete Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};