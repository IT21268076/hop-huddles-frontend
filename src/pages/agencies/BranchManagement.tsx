// pages/agencies/BranchManagement.tsx
import React, { useState } from 'react';
import { Plus, MapPin, Users, Edit, UserMinus, BarChart3, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAsync } from '@/hooks/useAsync';
import { apiClient } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { Branch } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';
import { CreateBranchForm } from './CreateBranchForm';
import { BranchUserManagement } from './BranchUserManagement';
import { BranchDetailModal } from './BranchDetailModal';
import { BranchAnalytics } from './BranchAnalytics';

interface BranchManagementProps {
  agencyId: number;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({ agencyId }) => {
  const { currentAssignment } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isBranchDetailOpen, setIsBranchDetailOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const currentRole = currentAssignment?.primaryRole || currentAssignment?.role;
  const isDirector = currentRole === 'DIRECTOR';
  const isEducator = currentRole === 'EDUCATOR';

  const {
    data: branches,
    loading,
    refetch,
  } = useAsync(
    async () => {
      const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
      
      if (activeRole === 'DIRECTOR' && currentAssignment?.branchId) {
        // Director sees only their assigned branch
        console.log('🎯 DIRECTOR: Loading assigned branch', currentAssignment.branchId);
        const branch = await apiClient.getBranchById(currentAssignment.branchId);
        return branch ? [branch] : [];
      } else if (activeRole === 'EDUCATOR') {
        // EDUCATOR sees only branches they created (creator-based filtering)
        console.log('🎯 EDUCATOR: Loading branches they created');
        return await apiClient.getBranchesCreatedByMe();
      } else {
        // Fallback for other roles - no branches
        console.log('🎯 Other role: No branch access');
        return [];
      }
    },
    [agencyId, currentAssignment?.activeRole, currentAssignment?.role, currentAssignment?.branchId]
  );

  const handleCreateBranch = async () => {
    await refetch();
    setIsCreateModalOpen(false);
  };

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsBranchDetailOpen(true);
  };

  const handleUserManagement = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsUserManagementOpen(true);
  };

  const columns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (branch: Branch) => (
        <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" 
             onClick={() => handleBranchClick(branch)}>
          {branch.name}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (branch: Branch) => (
        <div className="text-sm text-gray-500">
          {branch.fullAddress || (branch.city && branch.state && branch.zipCode) 
            ? `${branch.city}, ${branch.state} ${branch.zipCode}` 
            : branch.location || 'No location specified'}
        </div>
      ),
    },
    {
      key: 'ccn',
      header: 'CCN',
      render: (branch: Branch) => (
        <div className="text-sm text-gray-500">
          {branch.ccn || 'No CCN specified'}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (branch: Branch) => (
        <Badge variant={getActiveStatus(branch) ? 'success' : 'error'}>
          {getActiveStatus(branch) ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (branch: Branch) => (
        <span className="text-sm text-gray-500">{formatDate(branch.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (branch: Branch) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUserManagement(branch)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBranchClick(branch)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // For Director: Show detailed view of their assigned branch
  if (isDirector && branches && branches.length > 0) {
    const branch = branches[0];
    return (
      <>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{branch.name}</h2>
                <Badge variant={getActiveStatus(branch) ? 'success' : 'error'}>
                  {getActiveStatus(branch) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                  <p className="text-sm text-gray-600">
                    {branch.fullAddress || (branch.city && branch.state && branch.zipCode) 
                      ? `${branch.city}, ${branch.state} ${branch.zipCode}` 
                      : branch.location || 'No location specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">CCN</h4>
                  <p className="text-sm text-gray-600">{branch.ccn || 'No CCN specified'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleUserManagement(branch)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => setSelectedBranch(branch)}
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>

          {selectedBranch && (
            <BranchAnalytics branch={selectedBranch} />
          )}
        </div>

        {/* Modals */}
        <Modal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          title={`Manage Users - ${selectedBranch?.name}`}
          size="xl"
        >
          {selectedBranch && (
            <BranchUserManagement
              branch={selectedBranch}
              onClose={() => setIsUserManagementOpen(false)}
            />
          )}
        </Modal>
      </>
    );
  }

  // For Educator: Show list view of all branches
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Branches</h3>
        {isEducator && (
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        )}
      </div>

      <DataTable
        data={branches || []}
        columns={columns}
        loading={loading}
        emptyMessage="No branches found. Create your first branch to organize teams."
        emptyIcon={<MapPin className="h-6 w-6" />}
      />

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Branch"
        size="lg"
      >
        <CreateBranchForm
          agencyId={agencyId}
          onSuccess={handleCreateBranch}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isBranchDetailOpen}
        onClose={() => setIsBranchDetailOpen(false)}
        title={`Branch Details - ${selectedBranch?.name}`}
        size="xl"
      >
        {selectedBranch && (
          <BranchDetailModal
            branch={selectedBranch}
            onClose={() => setIsBranchDetailOpen(false)}
            onUserManagement={() => {
              setIsBranchDetailOpen(false);
              setIsUserManagementOpen(true);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title={`Manage Users - ${selectedBranch?.name}`}
        size="xl"
      >
        {selectedBranch && (
          <BranchUserManagement
            branch={selectedBranch}
            onClose={() => setIsUserManagementOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};