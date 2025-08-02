// pages/analytics/DirectorTeamAnalytics.tsx
import React, { useState } from 'react';
import { Users, Building2, TrendingUp, Activity, User, Award, BarChart3, Target, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api';
import { Team } from '../../types';
import { formatDate, getActiveStatus } from '../../utils/helpers';

interface DirectorTeamAnalyticsProps {
  branchId: number;
  branchName: string;
}

export const DirectorTeamAnalytics: React.FC<DirectorTeamAnalyticsProps> = ({ branchId, branchName }) => {
  const { currentAgency, currentAssignment } = useApp();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  // Fetch teams for the director's branch only
  const {
    data: teams,
    loading: teamsLoading,
  } = useAsync(
    async () => {
      if (!branchId) return [];
      return await apiClient.getTeamsByBranch(branchId);
    },
    [branchId]
  );

  // Fetch analytics data for the branch and teams
  const {
    data: analytics,
    loading: analyticsLoading,
  } = useAsync(
    async () => {
      if (!teams || teams.length === 0) return null;
      
      // TODO: Implement actual analytics API
      return {
        branchOverview: {
          totalTeams: teams.length,
          totalMembers: teams.reduce((sum, team) => sum + (team.userCount || 0), 0),
          averageCompletionRate: 87,
          averageScore: 89,
          activeSequences: 15,
          totalCompletedHuddles: 342,
        },
        teamAnalytics: teams.map(team => ({
          teamId: team.teamId,
          name: team.name,
          memberCount: team.userCount || 0,
          completionRate: Math.floor(Math.random() * 20) + 80,
          averageScore: Math.floor(Math.random() * 15) + 85,
          completedHuddles: Math.floor(Math.random() * 50) + 20,
          pendingAssessments: Math.floor(Math.random() * 8) + 2,
          engagementRate: Math.floor(Math.random() * 20) + 80,
          improvementTrend: Math.random() > 0.5 ? 'up' : 'down',
          improvementValue: Math.floor(Math.random() * 10) + 1,
        })),
        performanceComparison: {
          topPerformer: teams[0]?.name || 'N/A',
          mostImproved: teams[Math.floor(Math.random() * teams.length)]?.name || 'N/A',
          needsAttention: teams[Math.floor(Math.random() * teams.length)]?.name || 'N/A',
        },
        recentActivity: [
          { type: 'milestone', message: 'ICU Team reached 95% completion milestone', timestamp: '2 hours ago', teamName: 'ICU Team' },
          { type: 'completion', message: 'Emergency Team completed Safety Protocol series', timestamp: '4 hours ago', teamName: 'Emergency Team' },
          { type: 'assessment', message: 'Surgery Team passed Advanced Procedures assessment', timestamp: '6 hours ago', teamName: 'Surgery Team' },
          { type: 'progress', message: 'Pediatric Team is 90% through Communication Skills', timestamp: '1 day ago', teamName: 'Pediatric Team' },
        ],
        trends: {
          completionRateChange: 5.2,
          averageScoreChange: 3.1,
          engagementChange: 8.5,
        },
      };
    },
    [teams, selectedPeriod]
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

  const selectedTeam = teams?.find(t => t.teamId === selectedTeamId);
  const selectedTeamAnalytics = analytics?.teamAnalytics?.find(ta => ta.teamId === selectedTeamId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Branch Team Analytics - ${branchName}`}
        description={`Performance analytics for all teams in ${branchName}`}
      />

      {/* Branch Context Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Analytics for: {branchName}</h3>
              <p className="text-sm text-blue-700">Compare and analyze performance across all teams in your branch</p>
            </div>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-blue-300 rounded-md px-3 py-1 bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Branch Overview Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.branchOverview.totalTeams}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {analytics.branchOverview.totalMembers} total members
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.branchOverview.averageCompletionRate}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className={`text-sm ${analytics.trends.completionRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.trends.completionRateChange > 0 ? '+' : ''}{analytics.trends.completionRateChange}%
              </span>
              <span className="text-sm text-gray-500 ml-2">from last period</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.branchOverview.averageScore}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className={`text-sm ${analytics.trends.averageScoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.trends.averageScoreChange > 0 ? '+' : ''}{analytics.trends.averageScoreChange}%
              </span>
              <span className="text-sm text-gray-500 ml-2">from last period</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Huddles</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.branchOverview.totalCompletedHuddles}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {analytics.branchOverview.activeSequences} active sequences
            </div>
          </Card>
        </div>
      )}

      {/* Team Selection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Select Team for Details</h3>
            <Badge variant="info">
              {teams?.length || 0} team{teams?.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="w-full max-w-md">
            <select
              value={selectedTeamId?.toString() || ''}
              onChange={(e) => setSelectedTeamId(e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm"
            >
              <option value="">View all teams...</option>
              {teams?.map((team) => (
                <option key={team.teamId} value={team.teamId.toString()}>
                  {team.name} ({team.userCount || 0} members)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Team Comparison Table */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Huddles Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.teamAnalytics.map((team) => (
                  <tr 
                    key={team.teamId} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedTeamId === team.teamId ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedTeamId(team.teamId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.memberCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{team.completionRate}%</div>
                        <div className={`ml-2 w-16 bg-gray-200 rounded-full h-2`}>
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${team.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.averageScore}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.completedHuddles}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${team.improvementTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${team.improvementTrend === 'down' ? 'rotate-180' : ''}`} />
                        {team.improvementValue}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Selected Team Details */}
      {selectedTeam && selectedTeamAnalytics && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedTeam.name} - Detailed Analytics</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={getActiveStatus(selectedTeam) ? 'success' : 'error'}>
                {getActiveStatus(selectedTeam) ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setSelectedTeamId(null)}>
                Clear Selection
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedTeamAnalytics.memberCount}</div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedTeamAnalytics.completionRate}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedTeamAnalytics.averageScore}%</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedTeamAnalytics.engagementRate}%</div>
              <div className="text-sm text-gray-500">Engagement Rate</div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => window.location.href = `/teams/${selectedTeam.teamId}/manage`}>
              <Users className="h-4 w-4 mr-2" />
              Manage Team Members
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Branch Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-1 bg-gray-100 rounded-full">
                  <Activity className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-blue-600">{activity.teamName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Insights */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Top Performer</h4>
              <p className="text-lg font-semibold text-green-800">{analytics.performanceComparison.topPerformer}</p>
              <p className="text-sm text-green-600">Highest completion rate</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Most Improved</h4>
              <p className="text-lg font-semibold text-blue-800">{analytics.performanceComparison.mostImproved}</p>
              <p className="text-sm text-blue-600">Greatest improvement trend</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Needs Attention</h4>
              <p className="text-lg font-semibold text-yellow-800">{analytics.performanceComparison.needsAttention}</p>
              <p className="text-sm text-yellow-600">May need additional support</p>
            </div>
          </div>
        </Card>
      )}

      {!analytics && teamsLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      )}

      {!analytics && !teamsLoading && (!teams || teams.length === 0) && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
          <p className="text-gray-600">
            Create teams in {branchName} to view analytics and performance metrics.
          </p>
        </div>
      )}
    </div>
  );
};