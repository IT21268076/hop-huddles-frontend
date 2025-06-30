import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, GitBranch, MapPin, Calendar } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Branch, CreateBranchRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import BranchModal from './BranchModal';
import toast from 'react-hot-toast';

const BranchManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { currentAgency } = useAuth();
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branches, isLoading } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Create branch mutation
  const createMutation = useMutation(apiClient.createBranch, {
    onSuccess: () => {
      queryClient.invalidateQueries(['branches', currentAgency?.agencyId]);
      setIsModalOpen(false);
      toast.success('Branch created successfully');
    },
    onError: () => {
      toast.error('Failed to create branch');
    }
  });

  // Update branch mutation
  const updateMutation = useMutation(
    ({ branchId, data }: { branchId: number; data: Partial<CreateBranchRequest> }) =>
      apiClient.updateBranch(branchId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['branches', currentAgency?.agencyId]);
        setIsModalOpen(false);
        setEditingBranch(null);
        toast.success('Branch updated successfully');
      },
      onError: () => {
        toast.error('Failed to update branch');
      }
    }
  );

  // Delete branch mutation
  const deleteMutation = useMutation(apiClient.deleteBranch, {
    onSuccess: () => {
      queryClient.invalidateQueries(['branches', currentAgency?.agencyId]);
      toast.success('Branch deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete branch');
    }
  });

//   const handleCreate = (data: CreateBranchRequest | Partial<CreateBranchRequest>) => {
//     // Ensure agencyId is always a number
//     const agencyId = currentAgency?.agencyId || 0;
//     createMutation.mutate({ ...data, agencyId } as CreateBranchRequest);
//   };

  const handleCreate = (data: CreateBranchRequest | Partial<CreateBranchRequest>) => {
    // Ensure agencyId is present and is a number
    if (!('agencyId' in data) || typeof data.agencyId !== 'number') {
      if (currentAgency?.agencyId) {
        createMutation.mutate({ ...data, agencyId: currentAgency.agencyId } as CreateBranchRequest);
      } else {
        toast.error('Agency ID is missing');
      }
    } else {
      createMutation.mutate(data as CreateBranchRequest);
    }
  };

  const handleUpdate = (data: Partial<CreateBranchRequest>) => {
    if (editingBranch) {
      updateMutation.mutate({ branchId: editingBranch.branchId, data });
    }
  };

  const handleDelete = (branchId: number) => {
    if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      deleteMutation.mutate(branchId);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600">
            Manage branches within {currentAgency?.name || 'your agency'}.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={16} className="mr-2" />
          Create Branch
        </button>
      </div>

      {/* Branches Grid */}
      {branches && branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.branchId}
              className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <GitBranch size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          branch.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.branchId)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Location */}
                {branch.location && (
                  <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{branch.location}</span>
                  </div>
                )}

                {/* Timestamps */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Created: {new Date(branch.createdAt).toLocaleDateString()}</span>
                  </div>
                  {branch.updatedAt !== branch.createdAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Updated: {new Date(branch.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No branches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first branch.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Create Branch
            </button>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        onSubmit={editingBranch ? handleUpdate : handleCreate}
        branch={editingBranch}
        agencyId={currentAgency?.agencyId || 0}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default BranchManagement;