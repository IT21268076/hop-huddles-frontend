// pages/User/UserManagement.tsx - FIXED: Proper agency isolation and role-based access
import React, { useState, useMemo } from 'react';
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
  Award,
  Search,
  Filter
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { User, UserAssignment, Branch, Team, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assignmentUser, setAssignmentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const { currentAgency, user: currentUser, activeRole, currentAccessScope } = useAuth();
  const queryClient = useQueryClient();

  // FIXED: Permission checks based on active role
  const permissions = useMemo(() => {
    if (!currentUser) return {};
    
    const context = { agencyId: currentAgency?.agencyId };
    
    return {
      canCreateUser: hasPermission(currentUser.assignments, PERMISSIONS.USER_CREATE, context),
      canEditUser: hasPermission(currentUser.assignments, PERMISSIONS.USER_UPDATE, context),
      canAssignUser: hasPermission(currentUser.assignments, PERMISSIONS.USER_ASSIGN, context),
      canActivateUser: hasPermission(currentUser.assignments, PERMISSIONS.USER_ACTIVATE, context),
      canViewUsers: hasPermission(currentUser.assignments, PERMISSIONS.USER_VIEW, context)
    };
  }, [currentUser, currentAgency, activeRole]);

  // FIXED: Fetch users with proper agency isolation
  const { data: users, isLoading: usersLoading } = useQuery(
    ['users', currentAgency?.agencyId, currentAccessScope],
    async () => {
      if (!currentAgency || !permissions.canViewUsers) {
        return [];
      }

      const allUsers = await apiClient.getUsersByAgency(currentAgency.agencyId);
      
      // FIXED: Apply role-based filtering based on access scope
      return allUsers.filter(user => {
        // Ensure user belongs to current agency
        const hasAgencyAssignment = user.assignments.some(a => 
          a.agencyId === currentAgency.agencyId && a.isActive
        );
        
        if (!hasAgencyAssignment) return false;

        // Apply scope-based filtering
        switch (currentAccessScope) {
          case 'AGENCY':
            // Agency-level users can see all users in the agency
            return true;
            
          case 'BRANCH':
            // Branch-level users can only see users in their branch
            const currentUserAssignment = currentUser?.assignments.find(a => 
              a.agencyId === currentAgency.agencyId && 
              a.roles?.includes(activeRole || '') || a.role === activeRole
            );
            
            return user.assignments.some(a => 
              a.branchId === currentUserAssignment?.branchId
            );
            
          case 'TEAM':
            // Team-level users can only see users in their team
            const currentTeamAssignment = currentUser?.assignments.find(a => 
              a.agencyId === currentAgency.agencyId && 
              a.roles?.includes(activeRole || '') || a.role === activeRole
            );
            
            return user.assignments.some(a => 
              a.teamId === currentTeamAssignment?.teamId
            );
            
          default:
            return false;
        }
      });
    },
    { 
      enabled: !!currentAgency && permissions.canViewUsers,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch context data for assignments
  const { data: branches } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  const { data: teams } = useQuery(
    ['teams', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getTeamsByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // FIXED: Filter users based on search and role filter
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const matchesRole = filterRole === 'all' || 
        user.assignments.some(a => 
          a.agencyId === currentAgency?.agencyId && 
          (a.roles?.includes(filterRole as UserRole) || a.role === (filterRole as UserRole))
        );
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole, currentAgency]);

  // Mutation for user status updates
  const updateUserStatusMutation = useMutation(
    async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return apiClient.updateUserStatus(userId, isActive);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update user status');
        console.error(error);
      }
    }
  );

  const handleStatusToggle = (user: User) => {
    if (!permissions.canActivateUser) {
      toast.error('You do not have permission to change user status');
      return;
    }

    const newStatus = !user.isActive;
    updateUserStatusMutation.mutate({ 
      userId: user.userId, 
      isActive: newStatus 
    });
  };

  const handleEditUser = (user: User) => {
    if (!permissions.canEditUser) {
      toast.error('You do not have permission to edit users');
      return;
    }
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleAssignUser = (user: User) => {
    if (!permissions.canAssignUser) {
      toast.error('You do not have permission to assign users');
      return;
    }
    setAssignmentUser(user);
    setIsAssignmentModalOpen(true);
  };

  const getRoleDisplay = (assignments: UserAssignment[]) => {
    const agencyAssignments = assignments.filter(a => 
      a.agencyId === currentAgency?.agencyId && a.isActive
    );
    
    const roles = new Set<string>();
    agencyAssignments.forEach(assignment => {
      if (assignment.roles && assignment.roles.length > 0) {
        assignment.roles.forEach(role => roles.add(role));
      } else if (assignment.role) {
        roles.add(assignment.role);
      }
    });
    
    return Array.from(roles).join(', ') || 'No roles assigned';
  };

  const getAssignmentDisplay = (assignments: UserAssignment[]) => {
    const agencyAssignments = assignments.filter(a => 
      a.agencyId === currentAgency?.agencyId && a.isActive
    );
    
    if (agencyAssignments.length === 0) return 'No assignments';
    
    const assignment = agencyAssignments[0]; // Primary assignment
    const parts = [];
    
    if (assignment.branchName) parts.push(assignment.branchName);
    if (assignment.teamName) parts.push(assignment.teamName);
    
    return parts.length > 0 ? parts.join(' → ') : 'Agency level';
  };

  if (!permissions.canViewUsers) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage users and their assignments within {currentAgency?.name || 'your organization'}.
            Current scope: <span className="font-medium capitalize">{currentAccessScope?.toLowerCase()}</span>
          </p>
        </div>
        
        {permissions.canCreateUser && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add User
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="EDUCATOR">Educator</option>
            <option value="ADMIN">Admin</option>
            <option value="DIRECTOR">Director</option>
            <option value="CLINICAL_MANAGER">Clinical Manager</option>
            <option value="FIELD_CLINICIAN">Field Clinician</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-end text-sm text-gray-500">
          {filteredUsers.length} of {users?.length || 0} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {usersLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first user.'
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.userId}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          {user.assignments.some(a => a.isPrimary && a.agencyId === currentAgency?.agencyId) && (
                            <Star className="ml-1 h-4 w-4 text-yellow-400" fill="currentColor" />
                          )}
                          {!user.isActive && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {user.email}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Shield className="h-4 w-4 mr-1" />
                          {getRoleDisplay(user.assignments)}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {getAssignmentDisplay(user.assignments)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {permissions.canAssignUser && (
                        <button
                          onClick={() => handleAssignUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Manage Assignments"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      
                      {permissions.canEditUser && (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      
                      {permissions.canActivateUser && (
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`p-1 ${
                            user.isActive 
                              ? 'text-red-400 hover:text-red-600' 
                              : 'text-green-400 hover:text-green-600'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          disabled={updateUserStatusMutation.isLoading}
                        >
                          {user.isActive ? <Trash2 size={16} /> : <UserCheck size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals would be rendered here */}
      {/* Note: UserModal and AssignmentModal components would need to be created/fixed separately */}
    </div>
  );
};

export default UserManagement;