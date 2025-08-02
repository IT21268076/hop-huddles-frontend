// pages/analytics/TeamAnalyticsPage.tsx
import React, { useState } from 'react';
import { Users, Building2, TrendingUp, Activity, User, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { apiClient } from '../../services/api';
import { Team, Branch } from '../../types';
import { formatDate } from '../../utils/helpers';
import { ClinicalManagerTeamAnalytics } from './ClinicalManagerTeamAnalytics';
import { DirectorTeamAnalytics } from './DirectorTeamAnalytics';

export const TeamAnalyticsPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  // Determine current user's role for UI logic
  const currentRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isClinicalManager = currentRole === 'CLINICAL_MANAGER';
  const isDirector = currentRole === 'DIRECTOR';

  // If Clinical Manager, show their specific team analytics
  if (isClinicalManager && currentAssignment?.teamId) {
    return <ClinicalManagerTeamAnalytics teamId={currentAssignment.teamId} />;
  }

  // If Director, show their branch team analytics
  if (isDirector && currentAssignment?.branchId) {
    return <DirectorTeamAnalytics branchId={currentAssignment.branchId} branchName={currentAssignment.branchName || 'Your Branch'} />;
  }

  const {
    data: branches,
    loading: branchesLoading,
  } = useAsync(
    async () => {
      console.log('TeamAnalyticsPage - currentAgency:', currentAgency);
      if (!currentAgency) {
        console.log('TeamAnalyticsPage - No currentAgency, returning empty array');
        return [];
      }
      console.log('TeamAnalyticsPage - Fetching branches for agency:', currentAgency.agencyId);
      try {
        const result = await apiClient.getBranchesByAgency(currentAgency.agencyId);
        console.log('TeamAnalyticsPage - Branches fetched:', result);
        return result;
      } catch (error) {
        console.error('TeamAnalyticsPage - Error fetching branches:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  const {
    data: teams,
    loading: teamsLoading,
  } = useAsync(
    async () => {
      if (!selectedBranchId) return [];
      return await apiClient.getTeamsByBranch(selectedBranchId);
    },
    [selectedBranchId]
  );

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agency Selected</h2>
        <p className="text-gray-600">Please select an agency to view team analytics.</p>
      </div>
    );
  }

  if (!permissions.canViewTeamAnalytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view team analytics.</p>
      </div>
    );
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId ? parseInt(branchId) : null);
    setSelectedTeamId(null); // Reset team selection when branch changes
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId ? parseInt(teamId) : null);
  };

  const selectedBranch = branches?.find(b => b.branchId === selectedBranchId);
  const selectedTeam = teams?.find(t => t.teamId === selectedTeamId);

  return (
    <>
      <PageHeader
        title="Team Analytics"
        description={`View analytics and performance metrics for teams in ${currentAgency.name}`}
      />
      
      <div className="space-y-6">
        {/* Branch and Team Selection */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Team</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="info">
                  {branches?.length || 0} Branch{branches?.length !== 1 ? 'es' : ''}
                </Badge>
                {selectedBranchId && (
                  <Badge variant="info">
                    {teams?.length || 0} Team{teams?.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select
                  value={selectedBranchId?.toString() || ''}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm"
                >
                  <option value="">Select a branch...</option>
                  {branches?.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId.toString()}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                <select
                  value={selectedTeamId?.toString() || ''}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  disabled={!selectedBranchId}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select a team...</option>
                  {teams?.map((team) => (
                    <option key={team.teamId} value={team.teamId.toString()}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {selectedTeam && (
          <>
            {/* Team Overview */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedTeam.name}</h3>
                      <p className="text-sm text-gray-500">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        {selectedBranch?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                
                {selectedTeam.description && (
                  <p className="text-gray-600 mb-4">{selectedTeam.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedTeam.userCount || 0}</div>
                    <div className="text-sm text-gray-500">Team Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="text-sm text-gray-500">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="text-sm text-gray-500">Active Sequences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="text-sm text-gray-500">Avg. Score</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analytics Notice */}
            <Card>
              <div className="p-6 text-center">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Team-level analytics are currently being developed. This page will show:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                  <li>• Individual team member progress</li>
                  <li>• Team completion rates and performance</li>
                  <li>• Engagement metrics and activity logs</li>
                  <li>• Assessment results and scores</li>
                  <li>• Compliance tracking and reporting</li>
                </ul>
              </div>
            </Card>

            {/* Team Members Preview */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </div>
                
                {selectedTeam.userCount && selectedTeam.userCount > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Team member details will be displayed here</p>
                      <p className="text-sm">Including progress, roles, and performance metrics</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No team members assigned yet</p>
                    <p className="text-sm">Add users to this team to view their analytics</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {!selectedTeam && (
          <Card>
            <div className="p-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team</h3>
              <p className="text-gray-600">
                Choose a branch and team from the dropdowns above to view detailed analytics and performance metrics.
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};