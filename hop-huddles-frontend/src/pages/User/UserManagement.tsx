// pages/User/CompleteUserManagement.tsx - Complete user management with new flow
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Shield, 
  Building, 
  UserCheck, 
  Star,
  Mail,
  Phone,
  Calendar,
  Award
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { User, UserAssignment, Branch, Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedUserModal from './UserModal';
import EnhancedAssignmentModal from './AssignmentModal';
import toast from 'react-hot-toast';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const CompleteUserManagement: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assignmentUser, setAssignmentUser] = useState<User | null>(null);
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

  // Fetch branches for context
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch teams for context
  const { data: teams } = useQuery(
    ['teams', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getTeamsByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId: number) => apiClient.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete user');
      }
    }
  );

  // Toggle user status mutation
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

  // Handler for when user is created - immediately open assignment modal
  const handleUserCreated = (newUser: User) => {
    setAssignmentUser(newUser);
    setIsAssignmentModalOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsUserModalOpen(true);
  };

  const handleManageAssignments = (userToAssign: User) => {
    setAssignmentUser(userToAssign);
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userToDelete.userId);
    }
  };

  const handleToggleUserStatus = (userToToggle: User) => {
    if (!canActivateUser) {
      toast.error('You do not have permission to activate/deactivate users');
      return;
    }

    toggleUserStatusMutation.mutate({
      userId: userToToggle.userId,
      isActive: !userToToggle.isActive
    });
  };

  // Utility functions for display
  const getUserRoleDisplay = (assignments: UserAssignment[]): string => {
    const agencyAssignments = assignments.filter(a => a.agencyId === currentAgency?.agencyId && a.isActive);
    if (agencyAssignments.length === 0) return 'No Active Role';
    
    const roles = agencyAssignments.map(a => a.role.replace('_', ' '));
    return roles.join(', ');
  };

  const getUserPrimaryAssignment = (assignments: UserAssignment[]): UserAssignment | null => {
    const agencyAssignments = assignments.filter(a => a.agencyId === currentAgency?.agencyId && a.isActive);
    return agencyAssignments.find(a => a.isPrimary) || agencyAssignments[0] || null;
  };

  const getUserAssignmentLocation = (assignments: UserAssignment[]): string => {
    const primaryAssignment = getUserPrimaryAssignment(assignments);
    if (!primaryAssignment) return 'No Assignment';
    
    if (primaryAssignment.teamName) {
      return `${primaryAssignment.teamName} (${primaryAssignment.branchName || 'Branch'})`;
    } else if (primaryAssignment.branchName) {
      return primaryAssignment.branchName;
    } else {
      return 'Agency Level';
    }
  };

  const getStatusBadge = (userItem: User) => {
    if (!userItem.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }

    const hasActiveAssignments = userItem.assignments.some(a => 
      a.agencyId === currentAgency?.agencyId && a.isActive
    );
    
    if (!hasActiveAssignments) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          No Assignments
        </span>
      );
    }

    const isLeader = userItem.assignments.some(a => 
      a.agencyId === currentAgency?.agencyId && a.isActive && a.isLeader
    );

    if (isLeader) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Award size={12} className="mr-1" />
          Leader
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const getPrimaryBadge = (assignments: UserAssignment[]) => {
    const primaryAssignment = getUserPrimaryAssignment(assignments);
    if (!primaryAssignment?.isPrimary) return null;

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
        <Star size={10} className="mr-1" />
        Primary
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
        {canCreateUser && (
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
        )}
      </div>

      {/* Agency Info Banner */}
      {currentAgency && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Agency Isolation Active
              </p>
              <p className="text-xs text-blue-600">
                Only users from {currentAgency.name} are displayed. 
                {branches && branches.length > 0 && ` Agency has ${branches.length} branch${branches.length !== 1 ? 'es' : ''}.`}
                {teams && teams.length > 0 && ` ${teams.length} team${teams.length !== 1 ? 's' : ''} available.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{users?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users?.filter(u => u.isActive).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Leaders</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users?.filter(u => u.assignments.some(a => 
                      a.agencyId === currentAgency?.agencyId && a.isLeader && a.isActive
                    )).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Branches</dt>
                  <dd className="text-lg font-medium text-gray-900">{branches?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    Role & Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
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
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.name}
                            </div>
                            {getPrimaryBadge(userItem.assignments)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {userItem.email}
                          </div>
                          {userItem.phone && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <Phone size={10} className="mr-1" />
                              {userItem.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getUserRoleDisplay(userItem.assignments)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {userItem.assignments.filter(a => 
                          a.agencyId === currentAgency?.agencyId && a.isActive
                        ).length} assignment{userItem.assignments.filter(a => 
                          a.agencyId === currentAgency?.agencyId && a.isActive
                        ).length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserAssignmentLocation(userItem.assignments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userItem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.lastLogin ? (
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {new Date(userItem.lastLogin).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canAssignUser && (
                          <button
                            onClick={() => handleManageAssignments(userItem)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Manage Assignments"
                          >
                            <Shield size={16} />
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
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        {canEditUser && (
                          <button
                            onClick={() => handleDeleteUser(userItem)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
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
              Get started by adding your first user to {currentAgency?.name}.
            </p>
            {canCreateUser && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add First User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EnhancedUserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onUserCreated={handleUserCreated} // This triggers assignment modal for new users
        onSuccess={() => {
          queryClient.invalidateQueries(['users']);
        }}
      />

      <EnhancedAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setAssignmentUser(null);
        }}
        user={assignmentUser}
        onSuccess={() => {
          queryClient.invalidateQueries(['users']);
        }}
      />
    </div>
  );
};

export default CompleteUserManagement;