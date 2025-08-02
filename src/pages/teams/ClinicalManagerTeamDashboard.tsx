// pages/teams/ClinicalManagerTeamDashboard.tsx
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  Calendar, 
  TrendingUp,
  Activity,
  Edit,
  Eye,
  Building2,
  MapPin,
  Award,
  BookOpen,
  ClipboardList,
  Bell,
  Target
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAsync } from '../../hooks/useAsync';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../services/api';
import { Team, UserAssignment, User } from '../../types';
import { formatDate, getRoleDisplayName, getDisciplineDisplayName } from '../../utils/helpers';
import { TeamUserManagement } from './TeamUserManagement';
import { EditTeamForm } from './EditTeamForm';

interface ClinicalManagerTeamDashboardProps {
  teamId: number;
}

export const ClinicalManagerTeamDashboard: React.FC<ClinicalManagerTeamDashboardProps> = ({ teamId }) => {
  const { currentAgency, currentAssignment } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch team details
  const {
    data: team,
    loading: teamLoading,
    refetch: refetchTeam,
    error: teamError,
  } = useAsync(
    async () => {
      const teams = await apiClient.getTeamsByBranch(currentAssignment?.branchId || 0);
      return teams.find(t => t.teamId === teamId);
    },
    [teamId, currentAssignment?.branchId]
  );

  // Fetch team users
  const {
    data: teamUsers,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      const assignments = await apiClient.getAssignmentsByAgency(currentAgency.agencyId);
      return assignments.filter((assignment: UserAssignment) => 
        assignment.teamId === teamId
      );
    },
    [teamId, currentAgency?.agencyId]
  );

  // Fetch team analytics
  const {
    data: analytics,
    loading: analyticsLoading,
  } = useAsync(
    async () => {
      // TODO: Implement actual analytics API
      return {
        totalUsers: teamUsers?.length || 0,
        activeUsers: teamUsers?.filter(u => u.isPrimary).length || 0,
        completionRate: 89,
        averageProgress: 82,
        pendingAssessments: 3,
        upcomingHuddles: 2,
        recentActivity: [
          { type: 'huddle_completed', message: 'Sarah Johnson completed Wound Care Training', timestamp: '30 minutes ago' },
          { type: 'assessment_passed', message: 'Mike Davis passed Medication Safety Assessment', timestamp: '2 hours ago' },
          { type: 'user_progress', message: 'Emma Wilson is 85% through Communication Skills', timestamp: '4 hours ago' },
          { type: 'huddle_assigned', message: 'New huddle assigned: Fall Prevention Protocol', timestamp: '1 day ago' },
        ],
        upcomingDeadlines: [
          { type: 'assessment', title: 'Infection Control Assessment', deadline: '2024-01-15', assignedTo: 'Sarah Johnson' },
          { type: 'huddle', title: 'Patient Safety Update', deadline: '2024-01-18', assignedTo: 'All team members' },
        ]
      };
    },
    [teamUsers]
  );

  const handleEditSuccess = () => {
    refetchTeam();
    setIsEditModalOpen(false);
  };

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    // Could open user profile modal here
  };

  if (teamLoading) {
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

  if (teamError) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Team</h2>
        <p className="text-gray-600">There was an error loading your team information. Please try again.</p>
        <Button className="mt-4" onClick={() => refetchTeam()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Not Found</h2>
        <p className="text-gray-600">The team you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Building2 className="h-4 w-4 mr-1" />
                {team.branchName}
              </p>
              {team.description && (
                <p className="text-sm text-gray-500 mt-1">{team.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={team.isActive ? 'success' : 'error'}>
              {team.isActive ? 'Active' : 'Inactive'}
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

        {/* Team Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Team Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(team.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={team.isActive ? 'success' : 'error'} size="sm">
                  {team.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Members:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Members:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.activeUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.completionRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Progress:</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.averageProgress || 0}%</span>
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
              <h3 className="text-sm font-medium text-gray-700">Manage Members</h3>
              <p className="text-xs text-gray-500 mt-1">Add & manage team members</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/analytics/team'}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">My Team Analytics</h3>
              <p className="text-xs text-gray-500 mt-1">View performance metrics</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/my-huddles'}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Assignments</h3>
              <p className="text-xs text-gray-500 mt-1">View team huddle assignments</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Assessments</h3>
              <p className="text-xs text-gray-500 mt-1">Review assessment results</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Completion Rate</span>
              <span className="text-sm font-medium text-gray-900">{analytics?.completionRate || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${analytics?.completionRate || 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Progress</span>
              <span className="text-sm font-medium text-gray-900">{analytics?.averageProgress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${analytics?.averageProgress || 0}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics?.pendingAssessments || 0}</div>
                <div className="text-xs text-gray-500">Pending Assessments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics?.upcomingHuddles || 0}</div>
                <div className="text-xs text-gray-500">Upcoming Huddles</div>
              </div>
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

      {/* Team Members & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUserManagementOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage All
            </Button>
          </div>

          {usersLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {teamUsers?.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(assignment.userId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{assignment.userName}</h4>
                      <div className="flex space-x-1 mt-1">
                        {assignment.roles.slice(0, 2).map((role) => (
                          <Badge key={role} variant="default" size="sm">
                            {getRoleDisplayName(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {assignment.discipline ? '1 discipline' : '0 disciplines'}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">No team members assigned yet</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsUserManagementOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Team Members
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {analytics?.upcomingDeadlines?.map((deadline, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="p-1 bg-yellow-100 rounded-full">
                  <Target className="h-3 w-3 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{deadline.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Assigned to: {deadline.assignedTo}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Due: {formatDate(deadline.deadline)}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Team Details"
        size="lg"
      >
        <EditTeamForm
          team={team}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title={`Manage Team Members - ${team.name}`}
        size="xl"
      >
        <TeamUserManagement
          team={team}
          onClose={() => setIsUserManagementOpen(false)}
        />
      </Modal>
    </div>
  );
};