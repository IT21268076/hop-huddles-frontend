// pages/users/UsersPage.tsx
import React, { useState } from 'react';
import { Plus, Users, Search, UserCheck, UserPlus, Settings } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { User, UserAssignment, UserRole, Discipline } from '../../types';
import { formatDate, getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { CreateUserForm } from './CreateUserForm';
import { UserAssignmentForm } from './UserAssignmentForm';
import { InviteUserForm } from './InviteUserForm';
import { UserAssignmentManager } from './UserAssignmentManager';
import { BulkAssignmentForm } from './BulkAssignmentForm';
import { RoleDisciplineAssignmentForm } from './RoleDisciplineAssignmentForm';

export const UsersPage: React.FC = () => {
  const { currentAgency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isBulkAssignmentModalOpen, setIsBulkAssignmentModalOpen] = useState(false);
  const [isManageAssignmentsModalOpen, setIsManageAssignmentsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: usersResponse,
    loading,
    refetch,
  } = useAsync(
    async () => {
      if (!currentAgency) return { content: [], totalElements: 0, totalPages: 0 };
      
      return await apiClient.searchUsersInAgency(currentAgency.agencyId, {
        searchTerm: searchTerm || undefined,
        page: currentPage - 1,
        size: pageSize,
      });
    },
    [currentAgency?.agencyId, searchTerm, currentPage]
  );

  const {
    data: assignments,
    refetch: refetchAssignments,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      return await apiClient.getAssignmentsByAgency(currentAgency.agencyId);
    },
    [currentAgency?.agencyId]
  );

  const handleCreateUser = async (createdUser?: User) => {
    // Refetch both users and assignments to ensure default assignment is reflected
    await Promise.all([refetch(), refetchAssignments()]);
    setIsCreateModalOpen(false);
    
    // If user was created, immediately open assignment modal
    if (createdUser) {
      setSelectedUser(createdUser);
      setIsAssignmentModalOpen(true);
    }
  };

  const handleInviteUser = async () => {
    await refetch();
    setIsInviteModalOpen(false);
  };

  const handleCreateAssignment = async () => {
    await refetchAssignments();
    await refetch();
    setIsAssignmentModalOpen(false);
    setSelectedUser(null);
  };

  const handleBulkAssignment = async () => {
    await refetchAssignments();
    await refetch();
    setIsBulkAssignmentModalOpen(false);
    setSelectedUser(null);
  };

  const handleManageAssignments = async () => {
    await refetchAssignments();
    await refetch();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getUserAssignments = (userId: number): UserAssignment[] => {
    return assignments?.filter(a => a.userId === userId) || [];
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'roles_disciplines',
      header: 'Roles & Disciplines',
      render: (user: User) => {
        const userAssignments = getUserAssignments(user.userId);
        return (
          <div className="space-y-1">
            {userAssignments.map((assignment) => (
              <div key={assignment.assignmentId} className="flex flex-wrap gap-1">
                {/* Show all roles for this assignment */}
                {assignment.roles.map((role) => (
                  <Badge 
                    key={`${assignment.assignmentId}-role-${role}`} 
                    variant="default" 
                    size="sm"
                  >
                    {getRoleDisplayName(role)}
                  </Badge>
                ))}
                {/* Show all disciplines for this assignment */}
                {assignment.disciplines && assignment.disciplines.map((discipline) => (
                  <Badge key={`${assignment.assignmentId}-discipline-${discipline}`} variant="info" size="sm">
                    {getDisciplineDisplayName(discipline)}
                  </Badge>
                ))}
                {assignment.isPrimary && (
                  <Badge key={`${assignment.assignmentId}-primary`} variant="success" size="sm">
                    Primary Assignment
                  </Badge>
                )}
              </div>
            ))}
            {userAssignments.length === 0 && (
              <span className="text-sm text-gray-400">No assignments</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'access_scope',
      header: 'Access Scope',
      render: (user: User) => {
        const userAssignments = getUserAssignments(user.userId);
        return (
          <div className="space-y-1">
            {userAssignments.map((assignment) => (
              <div key={assignment.assignmentId} className="text-sm">
                <div className="font-medium">{assignment.accessScope}</div>
                {assignment.branchName && (
                  <div className="text-gray-500">{assignment.branchName}</div>
                )}
                {assignment.teamName && (
                  <div className="text-gray-500">{assignment.teamName}</div>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (user: User) => (
        <span className="text-sm text-gray-500">
          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user: User) => (
        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => {
        const userAssignments = getUserAssignments(user.userId);
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
                setIsManageAssignmentsModalOpen(true);
              }}
            >
              <Users className="h-4 w-4 mr-1" />
              Manage ({userAssignments.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
                setIsAssignmentModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {userAssignments.length > 0 ? 'Update' : 'Assign'}
            </Button>
          </div>
        );
      },
    },
  ];

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to manage users.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Users"
        description={`Manage users and their assignments for ${currentAgency.name}`}
        action={{
          label: 'Invite User',
          onClick: () => setIsInviteModalOpen(true),
          icon: <UserPlus className="h-4 w-4" />,
        }}
        secondaryAction={{
          label: 'Add User',
          onClick: () => setIsCreateModalOpen(true),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">
                {usersResponse?.totalElements || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Assigned Users</div>
              <div className="text-2xl font-bold text-gray-900">
                {assignments?.length || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={usersResponse?.content || []}
        columns={columns}
        loading={loading}
        emptyMessage="No users found. Create your first user to get started."
        emptyIcon={<Users className="h-6 w-6" />}
        pagination={
          usersResponse && usersResponse.totalPages > 1
            ? {
                currentPage,
                totalPages: usersResponse.totalPages,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
      />

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New User"
        size="lg"
      >
        {currentAgency && (
          <InviteUserForm
            agencyId={currentAgency.agencyId}
            onSuccess={handleInviteUser}
            onCancel={() => setIsInviteModalOpen(false)}
          />
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="lg"
      >
        {currentAgency && (
          <CreateUserForm
            agencyId={currentAgency.agencyId}
            onSuccess={handleCreateUser}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </Modal>

      {/* Role & Discipline Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setSelectedUser(null);
        }}
        title={`${getUserAssignments(selectedUser?.userId || 0).length > 0 ? 'Update' : 'Assign'} Roles & Disciplines for ${selectedUser?.name}`}
        size="xl"
      >
        {selectedUser && currentAgency && (
          <RoleDisciplineAssignmentForm
            user={selectedUser}
            agencyId={currentAgency.agencyId}
            existingAssignment={getUserAssignments(selectedUser.userId)[0]} // Use first assignment for now
            onSuccess={handleCreateAssignment}
            onCancel={() => {
              setIsAssignmentModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkAssignmentModalOpen}
        onClose={() => {
          setIsBulkAssignmentModalOpen(false);
          setSelectedUser(null);
        }}
        title={`Bulk Assign Roles to ${selectedUser?.name}`}
        size="xl"
      >
        {selectedUser && currentAgency && (
          <BulkAssignmentForm
            user={selectedUser}
            agencyId={currentAgency.agencyId}
            onSuccess={handleBulkAssignment}
            onCancel={() => {
              setIsBulkAssignmentModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>

      {/* Manage Assignments Modal */}
      <Modal
        isOpen={isManageAssignmentsModalOpen}
        onClose={() => {
          setIsManageAssignmentsModalOpen(false);
          setSelectedUser(null);
        }}
        title={`Manage Assignments - ${selectedUser?.name}`}
        size="xl"
      >
        {selectedUser && currentAgency && (
          <UserAssignmentManager
            user={selectedUser}
            agencyId={currentAgency.agencyId}
            onUpdate={handleManageAssignments}
          />
        )}
      </Modal>
    </>
  );
};