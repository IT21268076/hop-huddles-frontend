// pages/teams/TeamsPage.tsx
import React, { useState } from 'react';
import { Plus, Users, Building2, Search, Edit, UserPlus, BarChart3 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { Team, Branch } from '../../types';
import type { UserRole } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';
import { CreateTeamForm } from './CreateTeamForm';
import { TeamDetailModal } from './TeamDetailModal';
import { TeamUserManagement } from './TeamUserManagement';
import { TeamAnalytics } from './TeamAnalytics';
import { EditTeamForm } from './EditTeamForm';
import { ClinicalManagerTeamDashboard } from './ClinicalManagerTeamDashboard';
import { DirectorTeamManagement } from './DirectorTeamManagement';

export const TeamsPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  // Determine current user's role for UI logic
  const currentRole = currentAssignment?.activeRole || currentAssignment?.role;
  const currentUserRoles = currentAssignment?.roles || [];
  const isEducator = currentUserRoles.includes('EDUCATOR');
  const isDirector = currentRole === 'DIRECTOR';
  const isClinicalManager = currentRole === 'CLINICAL_MANAGER';
  const isAdmin = currentUserRoles.includes('ADMIN');

  const {
    data: branches,
    loading: branchesLoading,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      return await apiClient.getBranchesByAgency(currentAgency.agencyId);
    },
    [currentAgency?.agencyId]
  );

  const {
    data: teams,
    loading: teamsLoading,
    refetch: refetchTeams,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      if (selectedBranchId) {
        return await apiClient.getTeamsByBranch(selectedBranchId);
      }
      return await apiClient.getTeamsByAgency(currentAgency.agencyId);
    },
    [currentAgency?.agencyId, selectedBranchId]
  );

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agency Selected</h2>
        <p className="text-gray-600">Please select an agency to manage teams.</p>
      </div>
    );
  }

  if (!permissions.canManageTeam && !permissions.canManageBranchUsers) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage teams.</p>
      </div>
    );
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId ? parseInt(branchId) : null);
  };

  const handleCreateTeam = async () => {
    await refetchTeams();
    setIsCreateModalOpen(false);
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamDetailOpen(true);
  };

  const handleUserManagement = (team: Team) => {
    setSelectedTeam(team);
    setIsUserManagementOpen(true);
  };

  const handleAnalytics = (team: Team) => {
    setSelectedTeam(team);
    setIsAnalyticsOpen(true);
  };

  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedBranch = branches?.find(b => b.branchId === selectedBranchId);

  // Clinical Manager gets their own specialized dashboard
  if (isClinicalManager && currentAssignment?.teamId) {
    return (
      <>
        <PageHeader
          title="My Team"
          description={`Team management dashboard for ${currentAssignment.teamName || 'your team'}`}
        />
        
        <div className="space-y-6">
          <ClinicalManagerTeamDashboard teamId={currentAssignment.teamId} />
        </div>
      </>
    );
  }

  // Director gets their own specialized team management for their branch
  if (isDirector && currentAssignment?.branchId) {
    return (
      <DirectorTeamManagement 
        branchId={currentAssignment.branchId} 
        branchName={currentAssignment.branchName || 'Your Branch'}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Team Management"
        description={`Manage teams for ${currentAgency.name}`}
      />
      
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <select
                value={selectedBranchId?.toString() || ''}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm"
              >
                <option value="">All Branches</option>
                {branches?.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId.toString()}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedBranch && (
              <div className="text-sm text-gray-600">
                <Building2 className="h-4 w-4 inline mr-1" />
                {selectedBranch.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {permissions.canCreateBranchTeams && (
              <Button 
                size="sm" 
                disabled={!selectedBranchId}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            )}
          </div>
        </div>

        {/* Teams Grid */}
        {teamsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading teams...</p>
          </div>
        ) : filteredTeams && filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.teamId} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    </div>
                    <Badge variant={getActiveStatus(team) ? 'success' : 'error'}>
                      {getActiveStatus(team) ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {team.description && (
                    <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Branch: {team.branchName}</span>
                    </div>
                    <div>
                      <span>Created: {formatDate(team.createdAt)}</span>
                    </div>
                    <div>
                      <span>Members: {team.userCount || 0}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleTeamSelect(team)}
                    >
                      View Details
                    </Button>
                    {(isEducator || isDirector || isAdmin) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserManagement(team)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    {(isEducator || isDirector || isAdmin) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAnalytics(team)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
            <p className="text-gray-600 mb-4">
              {selectedBranchId 
                ? `No teams found in ${selectedBranch?.name}. Create your first team to organize users.`
                : 'No teams found. Select a branch and create your first team to organize users.'
              }
            </p>
            {permissions.canCreateBranchTeams && selectedBranchId && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Team"
      >
        {selectedBranch && (
          <CreateTeamForm
            branchId={selectedBranchId!}
            branchName={selectedBranch.name}
            onSuccess={handleCreateTeam}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </Modal>

      {/* Team Detail Modal */}
      <Modal
        isOpen={isTeamDetailOpen}
        onClose={() => setIsTeamDetailOpen(false)}
        title={selectedTeam ? `${selectedTeam.name} Details` : 'Team Details'}
        size="lg"
      >
        {selectedTeam && (
          <TeamDetailModal
            team={selectedTeam}
            onClose={() => setIsTeamDetailOpen(false)}
            onUserManagement={() => {
              setIsTeamDetailOpen(false);
              setIsUserManagementOpen(true);
            }}
          />
        )}
      </Modal>

      {/* User Management Modal */}
      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title={selectedTeam ? `Manage Users - ${selectedTeam.name}` : 'Manage Users'}
        size="xl"
      >
        {selectedTeam && (
          <TeamUserManagement
            team={selectedTeam}
            onClose={() => setIsUserManagementOpen(false)}
          />
        )}
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        title={selectedTeam ? `${selectedTeam.name} Analytics` : 'Team Analytics'}
        size="xl"
      >
        {selectedTeam && (
          <TeamAnalytics
            team={selectedTeam}
            onClose={() => setIsAnalyticsOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};