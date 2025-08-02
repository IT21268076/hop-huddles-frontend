// pages/teams/DirectorTeamManagement.tsx
import React, { useState } from 'react';
import { Plus, Users, Building2, Search, Edit, UserPlus, BarChart3, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { Team } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';
import { CreateTeamForm } from './CreateTeamForm';
import { TeamDetailModal } from './TeamDetailModal';
import { TeamUserManagement } from './TeamUserManagement';
import { TeamAnalytics } from './TeamAnalytics';
import { EditTeamForm } from './EditTeamForm';

interface DirectorTeamManagementProps {
  branchId: number;
  branchName: string;
}

export const DirectorTeamManagement: React.FC<DirectorTeamManagementProps> = ({ branchId, branchName }) => {
  const { currentAgency, currentAssignment } = useApp();
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

  // Fetch teams for the director's branch only
  const {
    data: teams,
    loading: teamsLoading,
    refetch: refetchTeams,
  } = useAsync(
    async () => {
      if (!branchId) return [];
      return await apiClient.getTeamsByBranch(branchId);
    },
    [branchId]
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Branch Teams - ${branchName}`}
        description={`Manage teams in ${branchName}`}
      />

      {/* Branch Context Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Managing Teams for: {branchName}</h3>
            <p className="text-sm text-blue-700">You can create, edit, and manage teams within your branch</p>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
          </div>
          {permissions.canCreateBranchTeams && (
            <Button 
              size="sm" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
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
                    <span>Branch: {branchName}</span>
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
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUserManagement(team)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAnalytics(team)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
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
            {searchTerm 
              ? `No teams found matching "${searchTerm}" in ${branchName}`
              : `No teams found in ${branchName}. Create your first team to organize users.`
            }
          </p>
          {permissions.canCreateBranchTeams && !searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>
      )}

      {/* Performance Summary */}
      {filteredTeams && filteredTeams.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Team Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTeams.length}</div>
              <div className="text-sm text-gray-500">Total Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTeams.filter(team => getActiveStatus(team)).length}
              </div>
              <div className="text-sm text-gray-500">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredTeams.reduce((sum, team) => sum + (team.userCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredTeams.length > 0 ? Math.round(filteredTeams.reduce((sum, team) => sum + (team.userCount || 0), 0) / filteredTeams.length) : 0}
              </div>
              <div className="text-sm text-gray-500">Avg Team Size</div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Create New Team in ${branchName}`}
      >
        <CreateTeamForm
          branchId={branchId}
          branchName={branchName}
          onSuccess={handleCreateTeam}
          onCancel={() => setIsCreateModalOpen(false)}
        />
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
    </div>
  );
};