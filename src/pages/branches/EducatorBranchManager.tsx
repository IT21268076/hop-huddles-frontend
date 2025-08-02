// pages/branches/EducatorBranchManager.tsx
import React, { useState } from 'react';
import { Plus, MapPin, Users, Building, Edit3, Eye, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { Branch, Discipline, UserRole } from '../../types';
import { CreateBranchForm } from './CreateBranchForm';

interface EducatorBranchManagerProps {
  // Only for EDUCATORs who can manage multiple branches
}

export const EducatorBranchManager: React.FC<EducatorBranchManagerProps> = () => {
  const { currentUser, currentAssignment } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Get branches assigned to current EDUCATOR
  const {
    data: assignedBranches,
    loading: branchesLoading,
    refetch: refetchBranches,
  } = useAsync(
    async () => {
      if (!currentUser || !currentAssignment) return [];
      
      // Only EDUCATORs can access this
      if (!currentAssignment.roles.includes('EDUCATOR' as UserRole)) {
        throw new Error('Access denied: Only EDUCATORs can manage branches');
      }

      return await apiClient.getEducatorAccessibleBranches(currentUser.userId, currentUser.agencyId || 1);
    },
    [currentUser?.userId, currentAssignment?.roles]
  );

  const handleCreateBranch = async () => {
    await refetchBranches();
    setIsCreateModalOpen(false);
  };

  const getDisciplinesBadges = (disciplines: Discipline[]) => {
    const maxShow = 3;
    const disciplinesToShow = disciplines.slice(0, maxShow);
    const remainingCount = disciplines.length - maxShow;

    return (
      <div className="flex flex-wrap gap-1">
        {disciplinesToShow.map((discipline) => (
          <Badge key={discipline} variant="info" size="sm">
            {discipline}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="default" size="sm">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };

  if (!currentUser || !currentAssignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in with proper assignments.</p>
      </div>
    );
  }

  if (!currentAssignment.roles.includes('EDUCATOR' as UserRole)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Access Denied</p>
        <p className="text-gray-500">Only EDUCATORs can manage branches.</p>
      </div>
    );
  }

  if (branchesLoading) {
    return <LoadingSpinner text="Loading your branches..." className="py-12" />;
  }

  return (
    <>
      <PageHeader
        title="Branch Management"
        description="Manage branches assigned to you as an EDUCATOR"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        }
      />

      {/* Branch Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Assigned Branches</div>
              <div className="text-2xl font-bold text-gray-900">
                {assignedBranches?.length || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Disciplines</div>
              <div className="text-2xl font-bold text-gray-900">
                {assignedBranches?.reduce((acc, branch) => acc + branch.disciplines.length, 0) || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Branches</div>
              <div className="text-2xl font-bold text-gray-900">
                {assignedBranches?.filter(branch => branch.isActive).length || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Branches Grid */}
      {assignedBranches && assignedBranches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedBranches.map((branch) => (
            <Card key={branch.branchId} className="hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {branch.name}
                  </h3>
                  <Badge variant={branch.isActive ? 'success' : 'destructive'}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {/* Geographic Information */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{branch.city}, {branch.state} {branch.zipCode}</span>
                </div>

                {/* CCN if available */}
                {(branch.ccn || branch.ccnNumber) && (
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>CCN:</strong> {branch.ccn || branch.ccnNumber}
                  </div>
                )}

                {/* Disciplines */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Disciplines ({branch.disciplines.length})
                  </div>
                  {getDisciplinesBadges(branch.disciplines)}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {branch.userCount || 0} users
                  </span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1">
                    {branch.disciplines.length} disciplines
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedBranch(branch)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Navigate to branch edit
                    console.log('Edit branch', branch.branchId);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Assigned</h3>
          <p className="text-gray-500 mb-4">
            As an EDUCATOR, you need to be assigned to branches to manage them. Create a new branch or contact your administrator.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Branch
          </Button>
        </Card>
      )}

      {/* Create Branch Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Branch"
        size="lg"
      >
        <CreateBranchForm
          onSuccess={handleCreateBranch}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Branch Details Modal */}
      <Modal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        title={selectedBranch?.name || 'Branch Details'}
        size="xl"
      >
        {selectedBranch && (
          <div className="space-y-6">
            {/* Geographic Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Geographic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <p className="text-sm text-gray-900">{selectedBranch.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <p className="text-sm text-gray-900">{selectedBranch.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                  <p className="text-sm text-gray-900">{selectedBranch.zipCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CCN</label>
                  <p className="text-sm text-gray-900">{selectedBranch.ccn || selectedBranch.ccnNumber || 'Not set'}</p>
                </div>
                {selectedBranch.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">{selectedBranch.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Disciplines */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Branch Disciplines ({selectedBranch.disciplines.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {selectedBranch.disciplines.map((discipline) => (
                  <Badge key={discipline} variant="info" className="justify-center">
                    {discipline}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Branch-Specific Disciplines</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Only these disciplines will be available when creating huddle sequences for this branch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};