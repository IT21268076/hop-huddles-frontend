// pages/branches/DirectorBranchDashboard.tsx
import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Activity,
  Edit,
  Plus,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAsync } from '../../hooks/useAsync';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { Branch, Team, UserAssignment } from '../../types';
import { formatDate, getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { BranchUserManagement } from '../agencies/BranchUserManagement';
import { EditBranchForm } from '../agencies/EditBranchForm';
import { CreateTeamForm } from '../teams/CreateTeamForm';
import { TeamDetailModal } from '../teams/TeamDetailModal';

interface DirectorBranchDashboardProps {
  branchId: number;
}

export const DirectorBranchDashboard: React.FC<DirectorBranchDashboardProps> = ({ branchId }) => {
  const { currentAgency, currentAssignment } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);

  // Fetch branch details
  const {
    data: branch,
    loading: branchLoading,
    refetch: refetchBranch,
    error: branchError,
  } = useAsync(
    async () => {
      return await apiClient.getBranchById(branchId);
    },
    [branchId]
  );

  // Fetch teams in the branch
  const {
    data: teams,
    loading: teamsLoading,
    refetch: refetchTeams,
  } = useAsync(
    async () => {
      return await apiClient.getTeamsByBranch(branchId);
    },
    [branchId]
  );

  // Fetch branch users
  const {
    data: branchUsers,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      const assignments = await apiClient.getAssignmentsByAgency(currentAgency.agencyId);
      return assignments.filter((assignment: UserAssignment) => 
        assignment.branchId === branchId
      );
    },
    [branchId, currentAgency?.agencyId]
  );

  // Fetch branch analytics
  const {
    data: analytics,
    loading: analyticsLoading,
  } = useAsync(
    async () => {
      // TODO: Implement actual analytics API
      return {
        totalUsers: branchUsers?.length || 0,
        activeUsers: branchUsers?.filter(u => u.isPrimary).length || 0,
        totalTeams: teams?.length || 0,
        activeTeams: teams?.filter(t => t.isActive).length || 0,
        completionRate: 82,
        averageProgress: 75,
        recentActivity: [
          { type: 'user_assigned', message: 'New user assigned to Therapy Team', timestamp: '2 hours ago' },
          { type: 'team_created', message: 'New team "Home Care Alpha" created', timestamp: '1 day ago' },
          { type: 'huddle_completed', message: 'Safety training completed by 5 users', timestamp: '2 days ago' },
        ]
      };
    },
    [branchUsers, teams]
  );

  const handleEditSuccess = () => {
    refetchBranch();
    setIsEditModalOpen(false);
  };

  const handleTeamCreated = () => {
    refetchTeams();
    setIsCreateTeamOpen(false);
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamDetailOpen(true);
  };

  if (branchLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Branch</h2>
        <p className="text-gray-600">There was an error loading your branch information. Please try again.</p>
        <Button className="mt-4" onClick={() => refetchBranch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Branch Not Found</h2>
        <p className="text-gray-600">The branch you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branch Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {branch.location || 'No location specified'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={branch.isActive ? 'success' : 'error'}>
              {branch.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </div>

        {/* Branch Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Branch Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CCN:</span>
                <span className="text-sm font-medium text-gray-900">{branch.ccn || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(branch.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Team Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Teams:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.totalTeams || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Teams:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.activeTeams || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Staff Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Users:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.activeUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsUserManagementOpen(true)}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Manage Users</h3>
              <p className="text-xs text-gray-500 mt-1">Add & manage branch staff</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/teams'}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">My Branch Teams</h3>
              <p className="text-xs text-gray-500 mt-1">Manage teams in your branch</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/analytics/branch'}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">My Branch Analytics</h3>
              <p className="text-xs text-gray-500 mt-1">View branch performance</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/analytics/team'}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Team Analytics</h3>
              <p className="text-xs text-gray-500 mt-1">Compare team performance</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Completion Rate</span>
              <span className="text-sm font-medium text-gray-900">{analytics?.completionRate || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${analytics?.completionRate || 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Progress</span>
              <span className="text-sm font-medium text-gray-900">{analytics?.averageProgress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${analytics?.averageProgress || 0}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-1 bg-gray-100 rounded-full">
                  <Activity className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      {/* Teams Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
          <Button
            size="sm"
            onClick={() => setIsCreateTeamOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {teamsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {teams?.map((team) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{team.name}</h4>
                    <p className="text-xs text-gray-500">{team.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={team.isActive ? 'success' : 'error'} size="sm">
                    {team.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No teams created yet</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsCreateTeamOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch Details"
        size="lg"
      >
        <EditBranchForm
          branch={branch}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title={`Manage Users - ${branch.name}`}
        size="xl"
      >
        <BranchUserManagement
          branch={branch}
          onClose={() => setIsUserManagementOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        title="Create New Team"
        size="lg"
      >
        <CreateTeamForm
          branchId={branchId}
          branchName={branch?.name || 'Branch'}
          onSuccess={handleTeamCreated}
          onCancel={() => setIsCreateTeamOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isTeamDetailOpen}
        onClose={() => setIsTeamDetailOpen(false)}
        title={`Team Details - ${selectedTeam?.name}`}
        size="xl"
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
    </div>
  );
};