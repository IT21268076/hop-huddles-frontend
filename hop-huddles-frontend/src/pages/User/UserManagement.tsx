// pages/User/EnhancedUserManagement.tsx - Enhanced with agency isolation and invitation system
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Users, Mail, Phone, UserCheck, Badge, Calendar, Send, Shield } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { User, CreateUserRequest, UserAssignment, Branch, UserRole, Discipline } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import UserModal from './UserModal';
import AssignmentModal from './AssignmentModal';
import UserInvitationModal from './UserInvitationModal';
import toast from 'react-hot-toast';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const EnhancedUserManagement: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const { currentAgency, user } = useAuth();
  const queryClient = useQueryClient();

  // Permission checks
  const canCreateUser = hasPermission(user?.assignments || [], PERMISSIONS.USER_CREATE);
  const canEditUser = hasPermission(user?.assignments || [], PERMISSIONS.USER_UPDATE);
  const canAssignUser = hasPermission(user?.assignments || [], PERMISSIONS.USER_ASSIGN);
  const canActivateUser = hasPermission(user?.assignments || [], PERMISSIONS.USER_ACTIVATE);

  // Fetch users - ONLY from current agency
  const { data: users, isLoading: usersLoading } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { 
      enabled: !!currentAgency,
      select: (data) => {
        // Additional filtering to ensure agency isolation
        return data.filter(u => 
          u.assignments.some(assignment => assignment.agencyId === currentAgency?.agencyId)
        );
      }
    }
  );

  // Fetch branches for assignment (only current agency)
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // // Create user invitation mutation
  // const inviteUserMutation = useMutation(
  //   (invitationData: {
  //     email: string;
  //     name: string;
  //     role: UserRole;
  //     disciplines: Discipline[];
  //     branchId?: number;
  //     teamId?: number;
  //   }) => {
  //     // In production, this would call an invitation API
  //     return apiClient.inviteUser({
  //       ...invitationData,
  //       agencyId: currentAgency!.agencyId,
  //       invitedBy: user!.userId
  //     });
  //   },
  //   {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries(['users']);
  //       setIsInvitationModalOpen(false);
  //       toast.success('User invitation sent successfully');
  //     },
  //     onError: (error: any) => {
  //       toast.error('Failed to send invitation');
  //       console.error(error);
  //     }
  //   }
  // );

  // // Activate/Deactivate user mutation
  // const toggleUserStatusMutation = useMutation(
  //   ({ userId, isActive }: { userId: number; isActive: boolean }) =>
  //     apiClient.updateUserStatus(userId, isActive),
  //   {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries(['users']);
  //       toast.success('User status updated successfully');
  //     },
  //     onError: () => {
  //       toast.error('Failed to update user status');
  //     }
  //   }
  // );

  // User creation/update handler
  const handleUserSubmit = async (data: CreateUserRequest | Partial<CreateUserRequest>) => {
    setIsSubmittingUser(true);
    try {
      if (editingUser) {
        // Update existing user
        await apiClient.updateUser(editingUser.userId, data);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await apiClient.createUser(data as CreateUserRequest);
        toast.success('User created successfully');
      }
      
      // Refresh the users list
      queryClient.invalidateQueries(['users']);
      
      // Close modal and reset state
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(editingUser ? 'Failed to update user' : 'Failed to create user');
      console.error(error);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const inviteUser = async (invitationData: {
    email: string;
    name: string;
    role: UserRole;
    disciplines: Discipline[];
    agencyId: number;
    branchId?: number;
    teamId?: number;
    invitedBy: number;
    personalMessage?: string;
  }): Promise<{ success: boolean; invitationId?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock invitation creation
    console.log('Invitation sent:', invitationData);
    
    // In a real implementation, this would:
    // 1. Create invitation record in database
    // 2. Send email to the user
    // 3. Return invitation ID
    
    return {
      success: true,
      invitationId: `inv_${Date.now()}`
    };
  };

  // Create user invitation mutation
  const inviteUserMutation = useMutation(
    (invitationData: {
      email: string;
      name: string;
      role: UserRole;
      disciplines: Discipline[];
      branchId?: number;
      teamId?: number;
    }) => {
      return inviteUser({
        ...invitationData,
        agencyId: currentAgency!.agencyId,
        invitedBy: user!.userId
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        setIsInvitationModalOpen(false);
        toast.success('User invitation sent successfully');
      },
      onError: (error: any) => {
        toast.error('Failed to send invitation');
        console.error(error);
      }
    }
  );

  // Activate/Deactivate user mutation  
  const toggleUserStatusMutation = useMutation(
    ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      apiClient.updateUserStatus(userId, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user status');
      }
    }
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleAssignUser = (user: User) => {
    setSelectedUser(user);
    setIsAssignmentModalOpen(true);
  };

  const handleToggleUserStatus = (user: User) => {
    if (!canActivateUser) {
      toast.error('You do not have permission to activate/deactivate users');
      return;
    }

    toggleUserStatusMutation.mutate({
      userId: user.userId,
      isActive: !user.isActive
    });
  };

  const handleSendInvitation = (invitationData: any) => {
    inviteUserMutation.mutate(invitationData);
  };

  const getUserRoleDisplay = (assignments: UserAssignment[]) => {
    const agencyAssignments = assignments.filter(a => a.agencyId === currentAgency?.agencyId);
    if (agencyAssignments.length === 0) return 'No Role';
    
    const roles = agencyAssignments.flatMap(a => a.roles || [a.role]);
    const uniqueRoles = [...new Set(roles)];
    return uniqueRoles.join(', ').replace(/_/g, ' ');
  };

  const getUserBranchDisplay = (assignments: UserAssignment[]) => {
    const agencyAssignments = assignments.filter(a => a.agencyId === currentAgency?.agencyId);
    const branchNames = agencyAssignments
      .filter(a => a.branchName)
      .map(a => a.branchName)
      .filter((name, index, arr) => arr.indexOf(name) === index);
    
    return branchNames.length > 0 ? branchNames.join(', ') : 'Agency Level';
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }

    const hasAssignments = user.assignments.some(a => a.agencyId === currentAgency?.agencyId && a.isActive);
    if (!hasAssignments) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Assignment
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage users for {currentAgency?.name}
          </p>
        </div>
        <div className="flex space-x-3">
          {canCreateUser && (
            <>
              <button
                onClick={() => setIsInvitationModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Send size={16} className="mr-2" />
                Invite User
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add User
              </button>
            </>
          )}
        </div>
      </div>

      {/* Agency Info */}
      {currentAgency && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Agency Isolation Active
              </p>
              <p className="text-xs text-blue-600">
                Only users from {currentAgency.name} are displayed and can be managed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Users ({users?.length || 0})
          </h3>
        </div>

        {users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {userItem.profilePictureUrl ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={userItem.profilePictureUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {userItem.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                          {userItem.phone && (
                            <div className="text-xs text-gray-400">
                              {userItem.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserRoleDisplay(userItem.assignments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getUserBranchDisplay(userItem.assignments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userItem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.lastLogin 
                        ? new Date(userItem.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canAssignUser && (
                          <button
                            onClick={() => handleAssignUser(userItem)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Manage Assignments"
                          >
                            <Badge size={16} />
                          </button>
                        )}
                        {canEditUser && (
                          <button
                            onClick={() => handleEditUser(userItem)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canActivateUser && (
                          <button
                            onClick={() => handleToggleUserStatus(userItem)}
                            className={`${
                              userItem.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding or inviting your first user.
            </p>
            {canCreateUser && (
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setIsInvitationModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  <Send size={16} className="mr-2" />
                  Invite User
                </button>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUserSubmit}
          user={editingUser}
          isLoading={isSubmittingUser}
        />
      )}

      {isAssignmentModalOpen && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            queryClient.invalidateQueries(['users']);
            setIsAssignmentModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {isInvitationModalOpen && (
        <UserInvitationModal
          isOpen={isInvitationModalOpen}
          onClose={() => setIsInvitationModalOpen(false)}
          onSendInvitation={handleSendInvitation}
          agencyId={currentAgency?.agencyId}
          branches={branches || []}
        />
      )}
    </div>
  );
};

export default EnhancedUserManagement;