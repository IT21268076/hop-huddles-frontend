// pages/Branch/EnhancedBranchManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  Users, 
  Shield, 
  MapPin,
  UserCheck,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Branch, CreateBranchRequest, User, UserAssignment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import BranchModal from './BranchModal';
import LeaderAssignmentModal from './LeaderAssignmentModal';
import toast from 'react-hot-toast';

const EnhancedBranchManagement: React.FC = () => {
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const { currentAgency, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branches, isLoading: branchesLoading } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch all users for leader assignment
  const { data: allUsers } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch branch analytics
  const { data: branchAnalytics } = useQuery(
    ['branch-analytics', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchAnalytics(currentAgency.agencyId) : Promise.resolve({}),
    { enabled: !!currentAgency }
  );

  const createBranchMutation = useMutation(
    (data: CreateBranchRequest) => apiClient.createBranch(data),
    {
      onSuccess: () => {
        toast.success('Branch created successfully');
        queryClient.invalidateQueries(['branches']);
        setIsBranchModalOpen(false);
      },
      onError: () => {
        toast.error('Failed to create branch');
      }
    }
  );

  const updateBranchMutation = useMutation(
    ({ branchId, data }: { branchId: number; data: Partial<CreateBranchRequest> }) =>
      apiClient.updateBranch(branchId, data),
    {
      onSuccess: () => {
        toast.success('Branch updated successfully');
        queryClient.invalidateQueries(['branches']);
        setIsBranchModalOpen(false);
        setEditingBranch(null);
      },
      onError: () => {
        toast.error('Failed to update branch');
      }
    }
  );

  const deleteBranchMutation = useMutation(
    (branchId: number) => apiClient.deleteBranch(branchId),
    {
      onSuccess: () => {
        toast.success('Branch deleted successfully');
        queryClient.invalidateQueries(['branches']);
      },
      onError: () => {
        toast.error('Failed to delete branch');
      }
    }
  );

  const assignLeaderMutation = useMutation(
    ({ branchId, userId }: { branchId: number; userId: number }) =>
      apiClient.assignBranchLeader(branchId, userId),
    {
      onSuccess: () => {
        toast.success('Branch leader assigned successfully');
        queryClient.invalidateQueries(['branches']);
        setIsLeaderModalOpen(false);
      },
      onError: () => {
        toast.error('Failed to assign branch leader');
      }
    }
  );

  const toggleBranchStatus = useMutation(
    ({ branchId, isActive }: { branchId: number; isActive: boolean }) =>
      apiClient.updateBranch(branchId, { isActive }),
    {
      onSuccess: (_data, variables) => {
        toast.success(`Branch ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
        queryClient.invalidateQueries(['branches']);
      },
      onError: () => {
        toast.error('Failed to update branch status');
      }
    }
  );

  const canCreateBranch = hasPermission(user?.assignments || [], PERMISSIONS.BRANCH_CREATE);
  const canEditBranch = hasPermission(user?.assignments || [], PERMISSIONS.BRANCH_UPDATE);
  const canDeleteBranch = hasPermission(user?.assignments || [], PERMISSIONS.BRANCH_DELETE);
  const canAssignLeader = hasPermission(user?.assignments || [], PERMISSIONS.USER_ASSIGN);

  const handleCreate = (data: CreateBranchRequest | Partial<CreateBranchRequest>) => {
    createBranchMutation.mutate({
      ...data,
      agencyId: currentAgency?.agencyId ?? 0
    } as CreateBranchRequest);
  };

  const handleUpdate = (data: Partial<CreateBranchRequest>) => {
    if (editingBranch) {
      updateBranchMutation.mutate({
        branchId: editingBranch.branchId,
        data
      });
    }
  };

  const handleDelete = (branchId: number) => {
    if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      deleteBranchMutation.mutate(branchId);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsBranchModalOpen(true);
  };

  const handleAssignLeader = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsLeaderModalOpen(true);
  };

  const handleToggleStatus = (branch: Branch) => {
    toggleBranchStatus.mutate({
      branchId: branch.branchId,
      isActive: !branch.isActive
    });
  };

  const getBranchLeader = (branch: Branch) => {
    return allUsers?.find(user => 
      user.assignments.some(assignment => 
        assignment.branchId === branch.branchId && 
        assignment.isLeader && 
        assignment.role === 'DIRECTOR'
      )
    );
  };

  const getBranchUserCount = (branchId: number) => {
    return allUsers?.filter(user => 
      user.assignments.some(assignment => assignment.branchId === branchId)
    ).length || 0;
  };

  const getBranchTeamCount = (branchId: number) => {
    return branchAnalytics?.[branchId]?.teamCount || 0;
  };

  if (branchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if agency is enterprise to show appropriate messaging
  const isEnterpriseAgency = currentAgency?.agencyStructure === 'ENTERPRISE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600">
            {isEnterpriseAgency 
              ? 'Manage your enterprise branches, each with their own CCN and leadership structure.'
              : 'Your agency is configured as a single location. Consider upgrading to Enterprise for multiple branches.'
            }
          </p>
        </div>
        
        {canCreateBranch && isEnterpriseAgency && (
          <button
            onClick={() => setIsBranchModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Add Branch
          </button>
        )}
      </div>

      {/* Enterprise vs Single Agency Alert */}
      {!isEnterpriseAgency && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Building className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Single Agency Configuration</h3>
              <p className="text-sm text-amber-700 mt-1">
                Your agency is configured as a single location. To manage multiple branches with individual CCNs, 
                please contact support to upgrade to Enterprise configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Branches Grid */}
      {branches && branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => {
            const leader = getBranchLeader(branch);
            const userCount = getBranchUserCount(branch.branchId);
            const teamCount = getBranchTeamCount(branch.branchId);

            return (
              <div
                key={branch.branchId}
                className={`bg-white rounded-lg shadow border-2 transition-all duration-200 hover:shadow-md ${
                  branch.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="p-6">
                  {/* Branch Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        branch.isActive ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Building size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                        <p className="text-sm text-gray-600">CCN: {branch.ccn}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        className={`p-1 rounded ${
                          branch.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={branch.isActive ? 'Deactivate Branch' : 'Activate Branch'}
                      >
                        {branch.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      {canEditBranch && (
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                          title="Edit Branch"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      
                      {canDeleteBranch && (
                        <button
                          onClick={() => handleDelete(branch.branchId)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete Branch"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  {branch.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin size={14} className="mr-1" />
                      {branch.location}
                    </div>
                  )}

                  {/* Branch Leader */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Branch Director</span>
                      {canAssignLeader && (
                        <button
                          onClick={() => handleAssignLeader(branch)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {leader ? 'Change' : 'Assign'}
                        </button>
                      )}
                    </div>
                    {leader ? (
                      <div className="flex items-center mt-1">
                        <UserCheck size={14} className="text-green-600 mr-2" />
                        <span className="text-sm text-gray-900">{leader.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <Shield size={14} className="text-amber-600 mr-2" />
                        <span className="text-sm text-amber-700">No director assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Branch Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{userCount}</div>
                      <div className="text-xs text-gray-600">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{teamCount}</div>
                      <div className="text-xs text-gray-600">Teams</div>
                    </div>
                  </div>

                  {/* Branch Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* Navigate to branch users */}}
                        className="flex-1 text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <Users size={12} className="inline mr-1" />
                        View Users
                      </button>
                      <button
                        onClick={() => {/* Navigate to branch teams */}}
                        className="flex-1 text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <Building size={12} className="inline mr-1" />
                        Manage Teams
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isEnterpriseAgency ? 'No branches created yet' : 'Single Agency Configuration'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEnterpriseAgency 
              ? 'Get started by creating your first branch location.'
              : 'Your agency operates as a single location. Upgrade to Enterprise to manage multiple branches.'
            }
          </p>
          {canCreateBranch && isEnterpriseAgency && (
            <div className="mt-6">
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Create First Branch
              </button>
            </div>
          )}
        </div>
      )}

      {/* Branch Modal */}
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => {
          setIsBranchModalOpen(false);
          setEditingBranch(null);
        }}
        onSubmit={editingBranch ? handleUpdate : handleCreate}
        branch={editingBranch}
        isLoading={createBranchMutation.isLoading || updateBranchMutation.isLoading}
      />

      {/* Leader Assignment Modal */}
      <LeaderAssignmentModal
        isOpen={isLeaderModalOpen}
        onClose={() => {
          setIsLeaderModalOpen(false);
          setSelectedBranch(null);
        }}
        onAssign={(userId) => {
          if (selectedBranch) {
            assignLeaderMutation.mutate({
              branchId: selectedBranch.branchId,
              userId
            });
          }
        }}
        branch={selectedBranch}
        availableUsers={allUsers?.filter(user => 
          user.assignments.some(assignment => 
            assignment.roles?.includes('DIRECTOR') || assignment.role === 'DIRECTOR'
          )
        ) || []}
        isLoading={assignLeaderMutation.isLoading}
      />
    </div>
  );
};

export default EnhancedBranchManagement;