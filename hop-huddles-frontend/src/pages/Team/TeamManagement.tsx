import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Building2, Users, Calendar, GitBranch } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Team, CreateTeamRequest, Branch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TeamModal from './TeamModal';
import toast from 'react-hot-toast';

const TeamManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const { currentAgency } = useAuth();
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branches, isLoading: branchesLoading } = useQuery(
    ['branches', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch teams for selected branch
  const { data: teams, isLoading: teamsLoading } = useQuery(
    ['teams', selectedBranchId],
    () => selectedBranchId ? apiClient.getTeamsByBranch(selectedBranchId) : Promise.resolve([]),
    { enabled: !!selectedBranchId }
  );

  // Create team mutation
  const createMutation = useMutation(apiClient.createTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams', selectedBranchId]);
      setIsModalOpen(false);
      toast.success('Team created successfully');
    },
    onError: () => {
      toast.error('Failed to create team');
    }
  });

  // Update team mutation
  const updateMutation = useMutation(
    ({ teamId, data }: { teamId: number; data: Partial<CreateTeamRequest> }) =>
      apiClient.updateTeam(teamId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams', selectedBranchId]);
        setIsModalOpen(false);
        setEditingTeam(null);
        toast.success('Team updated successfully');
      },
      onError: () => {
        toast.error('Failed to update team');
      }
    }
  );

  // Delete team mutation
  const deleteMutation = useMutation(apiClient.deleteTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams', selectedBranchId]);
      toast.success('Team deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete team');
    }
  });

  const handleCreate = (data: CreateTeamRequest | Partial<CreateTeamRequest>) => {
    // Ensure branchId is set and is a number
    if (!selectedBranchId) {
      toast.error('Please select a branch first');
      return;
    }
    // Merge selectedBranchId if not present
    const payload: CreateTeamRequest = {
      ...(data as CreateTeamRequest),
      branchId: selectedBranchId,
    };
    createMutation.mutate(payload);
  };

  const handleUpdate = (data: Partial<CreateTeamRequest>) => {
    if (editingTeam) {
      updateMutation.mutate({ teamId: editingTeam.teamId, data });
    }
  };

  const handleDelete = (teamId: number) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteMutation.mutate(teamId);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    if (!selectedBranchId) {
      toast.error('Please select a branch first');
      return;
    }
    setIsModalOpen(true);
  };

  if (branchesLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Organize users into teams within branches for better management and targeted training.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={!selectedBranchId}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} className="mr-2" />
          Create Team
        </button>
      </div>

      {/* Branch Selection */}
      {branches && branches.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <GitBranch size={20} className="text-gray-400" />
            <div className="flex-1">
              <label htmlFor="branchSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Branch to Manage Teams
              </label>
              <select
                id="branchSelect"
                value={selectedBranchId || ''}
                onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : null)}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Choose a branch...</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.name} {branch.location && `(${branch.location})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No branches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to create branches before you can manage teams.
          </p>
          <div className="mt-6">
            <a
              href="/branches"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Create Branch
            </a>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {selectedBranchId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Teams in {branches?.find(b => b.branchId === selectedBranchId)?.name}
            </h2>
          </div>

          {teamsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.teamId}
                  className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              team.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {team.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(team.teamId)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {team.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-gray-400" />
                        <span>0 members</span> {/* Would be populated from actual data */}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
                      </div>
                      {team.updatedAt !== team.createdAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>Updated: {new Date(team.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first team in this branch.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Create Team
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
        }}
        onSubmit={editingTeam ? handleUpdate : handleCreate}
        team={editingTeam}
        branchId={selectedBranchId || 0}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default TeamManagement;