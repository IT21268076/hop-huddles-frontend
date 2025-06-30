import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Users, Mail, Phone, UserCheck, Badge, Calendar } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { User, CreateUserRequest, UserAssignment, Branch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import UserModal from './UserModal';
import AssignmentModal from './AssignmentModal';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { currentAgency } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch branches for assignment
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch assignments
  const { data: assignments } = useQuery(
    ['assignments', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getAssignmentsByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Create user mutation
  const createUserMutation = useMutation(apiClient.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users', currentAgency?.agencyId]);
      setIsUserModalOpen(false);
      toast.success('User created successfully');
    },
    onError: () => {
      toast.error('Failed to create user');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ userId, data }: { userId: number; data: Partial<CreateUserRequest> }) =>
      apiClient.updateUser(userId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', currentAgency?.agencyId]);
        setIsUserModalOpen(false);
        setEditingUser(null);
        toast.success('User updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user');
      }
    }
  );

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation(apiClient.deleteAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments', currentAgency?.agencyId]);
      queryClient.invalidateQueries(['users', currentAgency?.agencyId]);
      toast.success('Assignment removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove assignment');
    }
  });

  const handleCreateUser = (data: CreateUserRequest | Partial<CreateUserRequest>) => {
    // Ensure all required fields are present before creating a user
    if (
      typeof data.auth0Id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.email === 'string'
    ) {
      createUserMutation.mutate(data as CreateUserRequest);
    } else {
      toast.error('Missing required user fields');
    }
  };

  const handleUpdateUser = (data: Partial<CreateUserRequest>) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.userId, data });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleManageAssignments = (user: User) => {
    setSelectedUser(user);
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      deleteAssignmentMutation.mutate(assignmentId);
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDisciplineColor = (discipline?: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      SLP: 'bg-orange-100 text-orange-800',
      LPN: 'bg-indigo-100 text-indigo-800',
      HHA: 'bg-pink-100 text-pink-800',
      MSW: 'bg-yellow-100 text-yellow-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[discipline || 'OTHER'] || colors.OTHER;
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
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
            Manage users, their roles, and discipline assignments for {currentAgency?.name || 'your agency'}.
          </p>
        </div>
        <button
          onClick={() => setIsUserModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={16} className="mr-2" />
          Add User
        </button>
      </div>

      {/* Users List */}
      {users && users.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {users.map((user) => (
                <div
                  key={user.userId}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          {user.assignments.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.assignments.length} assignment{user.assignments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail size={14} className="text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone size={14} className="text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center space-x-2">
                              <UserCheck size={14} className="text-gray-400" />
                              <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Assignments */}
                        {user.assignments.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignments:</h4>
                            <div className="space-y-2">
                              {user.assignments.map((assignment) => (
                                <div
                                  key={assignment.assignmentId}
                                  className="flex items-center justify-between bg-gray-50 rounded-md p-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {getRoleDisplay(assignment.role)}
                                    </span>
                                    {assignment.discipline && (
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getDisciplineColor(assignment.discipline)}`}>
                                        {assignment.discipline}
                                      </span>
                                    )}
                                    {assignment.branchName && (
                                      <span className="text-xs text-gray-500">
                                        @ {assignment.branchName}
                                      </span>
                                    )}
                                    {assignment.isPrimary && (
                                      <Badge size={12} className="text-yellow-600" />
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteAssignment(assignment.assignmentId)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageAssignments(user)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Plus size={12} className="mr-1" />
                        Assign
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first user.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add User
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
        isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        agencyId={currentAgency?.agencyId || 0}
        branches={branches || []}
        onSuccess={() => {
          queryClient.invalidateQueries(['assignments', currentAgency?.agencyId]);
          queryClient.invalidateQueries(['users', currentAgency?.agencyId]);
        }}
      />
    </div>
  );
};

export default UserManagement;