// components/management/LeaderAssignmentManager.tsx
import React, { useState } from 'react';
import { Users, Building2, Crown, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { useAsync } from '../../hooks/useAsync';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { createSelectOptionsFromObjects } from '../../utils/selectUtils';
import type { User, UserAssignment } from '../../types';

interface LeaderAssignmentManagerProps {
  agencyId: number;
}

export const LeaderAssignmentManager: React.FC<LeaderAssignmentManagerProps> = ({ 
  agencyId 
}) => {
  const { currentUser } = useApp();
  const permissions = usePermissions();
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Load branches for this agency
  const { data: branches } = useAsync(
    async () => await apiClient.getBranchesByAgency(agencyId),
    [agencyId]
  );

  // Load teams for selected branch
  const { data: teams } = useAsync(
    async () => {
      if (selectedBranch) {
        return await apiClient.getTeamsByBranch(selectedBranch);
      }
      return [];
    },
    [selectedBranch]
  );

  // Load users for this agency
  const { data: users } = useAsync(
    async () => await apiClient.getUsersByAgency(agencyId),
    [agencyId]
  );

  // Load current branch leaders
  const { data: branchLeaders, refetch: refetchBranchLeaders } = useAsync(
    async () => await apiClient.getBranchLeadersByAgency(agencyId),
    [agencyId]
  );

  // Load current team leaders
  const { data: teamLeaders, refetch: refetchTeamLeaders } = useAsync(
    async () => await apiClient.getTeamLeadersByAgency(agencyId),
    [agencyId]
  );

  const handleAssignBranchLeader = async (branchId: number, userId: number) => {
    if (!currentUser) return;
    
    setIsAssigning(true);
    try {
      await apiClient.assignBranchLeader(branchId, userId, agencyId);
      await refetchBranchLeaders();
      alert('Branch leader assigned successfully!');
    } catch (error: any) {
      alert(`Failed to assign branch leader: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignTeamLeader = async (teamId: number, userId: number) => {
    if (!currentUser) return;
    
    setIsAssigning(true);
    try {
      await apiClient.assignTeamLeader(teamId, userId, agencyId);
      await refetchTeamLeaders();
      alert('Team leader assigned successfully!');
    } catch (error: any) {
      alert(`Failed to assign team leader: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveBranchLeader = async (branchId: number) => {
    if (!confirm('Are you sure you want to remove this branch leader?')) return;
    
    setIsAssigning(true);
    try {
      await apiClient.removeBranchLeader(branchId, agencyId);
      await refetchBranchLeaders();
      alert('Branch leader removed successfully!');
    } catch (error: any) {
      alert(`Failed to remove branch leader: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveTeamLeader = async (teamId: number) => {
    if (!confirm('Are you sure you want to remove this team leader?')) return;
    
    setIsAssigning(true);
    try {
      await apiClient.removeTeamLeader(teamId, agencyId);
      await refetchTeamLeaders();
      alert('Team leader removed successfully!');
    } catch (error: any) {
      alert(`Failed to remove team leader: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const getBranchLeader = (branchId: number): UserAssignment | undefined => {
    return branchLeaders?.find(leader => leader.branchId === branchId);
  };

  const getTeamLeader = (teamId: number): UserAssignment | undefined => {
    return teamLeaders?.find(leader => leader.teamId === teamId);
  };

  const getAvailableUsers = (excludeUserIds: number[] = []): User[] => {
    return users?.filter(user => !excludeUserIds.includes(user.userId)) || [];
  };

  if (!permissions.canManageAgencyUsers) {
    return (
      <Card>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to manage leaders.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Crown className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-semibold text-gray-900">Leadership Management</h2>
      </div>

      {/* Branch Leaders Section */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Branch Leaders (Directors)</h3>
        </div>

        <div className="space-y-4">
          {branches?.map(branch => {
            const leader = getBranchLeader(branch.branchId);
            const excludedUsers = leader ? [leader.userId] : [];
            const availableUsers = getAvailableUsers(excludedUsers);

            return (
              <div key={branch.branchId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{branch.name}</h4>
                    <p className="text-sm text-gray-500">{branch.location}</p>
                  </div>
                  
                  {leader ? (
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{leader.userName}</p>
                        <p className="text-sm text-gray-500">Director</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveBranchLeader(branch.branchId)}
                        disabled={isAssigning}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Select
                        placeholder="Select Director"
                        options={createSelectOptionsFromObjects(availableUsers, 'userId', 'name')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            handleAssignBranchLeader(branch.branchId, parseInt(value));
                          }
                        }}
                        className="w-48"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Team Leaders Section */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <UserCheck className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Team Leaders (Clinical Managers)</h3>
        </div>

        {/* Branch Selection */}
        <div className="mb-6">
          <Select
            label="Select Branch to View Teams"
            placeholder="Choose a branch"
            options={branches?.map(branch => ({
              value: branch.branchId.toString(),
              label: branch.name
            })) || []}
            value={selectedBranch?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedBranch(value ? parseInt(value) : null);
            }}
          />
        </div>

        {selectedBranch && teams && (
          <div className="space-y-4">
            {teams.map(team => {
              const leader = getTeamLeader(team.teamId);
              const excludedUsers = leader ? [leader.userId] : [];
              const availableUsers = getAvailableUsers(excludedUsers);

              return (
                <div key={team.teamId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-500">{team.description}</p>
                    </div>
                    
                    {leader ? (
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{leader.userName}</p>
                          <p className="text-sm text-gray-500">Clinical Manager</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTeamLeader(team.teamId)}
                          disabled={isAssigning}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Select
                          placeholder="Select Clinical Manager"
                          options={createSelectOptionsFromObjects(availableUsers, 'userId', 'name')}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              handleAssignTeamLeader(team.teamId, parseInt(value));
                            }
                          }}
                          className="w-48"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Summary Section */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Branch Leaders</h4>
            <p className="text-gray-600 mb-2">
              {branchLeaders?.length || 0} of {branches?.length || 0} branches have assigned leaders
            </p>
            <div className="space-y-1">
              {branchLeaders?.map(leader => (
                <div key={leader.assignmentId} className="text-sm text-gray-600">
                  • {leader.userName} leads {leader.branchName}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Team Leaders</h4>
            <p className="text-gray-600 mb-2">
              {teamLeaders?.length || 0} teams have assigned leaders
            </p>
            <div className="space-y-1">
              {teamLeaders?.map(leader => (
                <div key={leader.assignmentId} className="text-sm text-gray-600">
                  • {leader.userName} leads {leader.teamName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};