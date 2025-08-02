// pages/agencies/BranchUserManagement.tsx
import React, { useState } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { Branch, User, UserAssignment } from '../../types';
import { formatDate, getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { RoleDisciplineAssignmentForm } from '../users/RoleDisciplineAssignmentForm';

interface BranchUserManagementProps {
  branch: Branch;
  onClose: () => void;
}

export const BranchUserManagement: React.FC<BranchUserManagementProps> = ({
  branch,
  onClose,
}) => {
  const { currentAgency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Get users assigned to this branch
  const {
    data: branchUsers,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      const assignments = await apiClient.getAssignmentsByAgency(currentAgency.agencyId);
      return assignments.filter((assignment: UserAssignment) => 
        assignment.branchId === branch.branchId
      );
    },
    [branch.branchId, currentAgency?.agencyId]
  );

  // Get available users to add
  const {
    data: availableUsers,
    loading: availableUsersLoading,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      const users = await apiClient.getUsersByAgency(currentAgency.agencyId);
      const assignedUserIds = new Set(branchUsers?.map((assignment: UserAssignment) => assignment.userId) || []);
      return users.filter((user: User) => !assignedUserIds.has(user.userId));
    },
    [currentAgency?.agencyId, branchUsers]
  );

  const handleAddUser = async () => {
    await refetchUsers();
    setIsAddUserOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = branchUsers?.filter((assignment: UserAssignment) =>
    assignment.userName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (assignment: UserAssignment) => (
        <div>
          <div className="font-medium text-gray-900">{assignment.userName}</div>
          <div className="text-sm text-gray-500">{assignment.userId}</div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (assignment: UserAssignment) => (
        <div className="flex flex-wrap gap-1">
          {assignment.roles.map((role) => (
            <Badge key={role} variant="default" size="sm">
              {getRoleDisplayName(role)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      render: (assignment: UserAssignment) => (
        <div className="flex flex-wrap gap-1">
          {assignment.discipline ? (
            <Badge key={assignment.discipline} variant="info" size="sm">
              {getDisciplineDisplayName(assignment.discipline)}
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      render: (assignment: UserAssignment) => (
        <div className="text-sm text-gray-600">
          {assignment.teamName || 'No team assigned'}
        </div>
      ),
    },
    {
      key: 'assignedAt',
      header: 'Assigned',
      render: (assignment: UserAssignment) => (
        <span className="text-sm text-gray-500">
          {formatDate(assignment.assignedAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Users in {branch.name}</h3>
            <p className="text-sm text-gray-600">
              Manage users assigned to this branch and its teams
            </p>
          </div>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={usersLoading}
          emptyMessage="No users assigned to this branch yet."
          emptyIcon={<Users className="h-6 w-6" />}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title={`Add User to ${branch.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedUser?.userId || ''}
              onChange={(e) => {
                const userId = parseInt(e.target.value);
                const user = availableUsers?.find(u => u.userId === userId);
                setSelectedUser(user || null);
              }}
            >
              <option value="">Select a user...</option>
              {availableUsers?.map((user: User) => (
                <option key={user.userId} value={user.userId}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="border-t pt-4">
              <RoleDisciplineAssignmentForm
                user={selectedUser}
                agencyId={currentAgency?.agencyId || 0}
                onSuccess={handleAddUser}
                onCancel={() => setIsAddUserOpen(false)}
                preselectedBranch={{ branchId: branch.branchId, name: branch.name }}
              />
            </div>
          )}

          {!selectedUser && (
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};