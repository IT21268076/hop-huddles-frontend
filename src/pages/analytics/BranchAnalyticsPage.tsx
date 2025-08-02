// pages/analytics/BranchAnalyticsPage.tsx
import React, { useState } from 'react';
import { Building2, Users, TrendingUp, Activity, ChevronDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useBranchContext } from '../../contexts/BranchContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { apiClient } from '../../services/api';
import { Branch } from '../../types';
import { formatDate } from '../../utils/helpers';
import { DirectorBranchAnalytics } from './DirectorBranchAnalytics';

export const BranchAnalyticsPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const { availableBranches, currentBranch } = useBranchContext();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(currentBranch?.branchId || null);
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  // Determine current user's role for UI logic
  const currentRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isDirector = currentRole === 'DIRECTOR';

  // If Director, show their specific branch analytics
  if (isDirector && currentAssignment?.branchId) {
    return <DirectorBranchAnalytics branchId={currentAssignment.branchId} />;
  }

  // Use branches from branch context instead of fetching again
  const branches = availableBranches;

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

  const {
    data: branchAnalytics,
    loading: analyticsLoading,
  } = useAsync(
    async () => {
      if (!selectedBranchId) return null;
      try {
        return await apiClient.getBranchAnalytics(selectedBranchId);
      } catch (error) {
        console.warn('Branch analytics not available:', error);
        return null;
      }
    },
    [selectedBranchId]
  );

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agency Selected</h2>
        <p className="text-gray-600">Please select an agency to view branch analytics.</p>
      </div>
    );
  }

  if (!permissions.canViewBranchAnalytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view branch analytics.</p>
      </div>
    );
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId ? parseInt(branchId) : null);
  };

  const selectedBranch = branches?.find(b => b.branchId === selectedBranchId);

  return (
    <>
      <PageHeader
        title="Branch Analytics"
        description={`View analytics and performance metrics for branches in ${currentAgency.name}`}
      />
      
      <div className="space-y-6">
        {/* Branch Selection */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Branch</h3>
              <Badge variant="info">
                {branches?.length || 0} Branch{branches?.length !== 1 ? 'es' : ''}
              </Badge>
            </div>
            
            <div className="w-full max-w-md">
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
          </div>
        </Card>

        {selectedBranch && (
          <>
            {/* Branch Overview */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedBranch.name}</h3>
                      <p className="text-sm text-gray-500">{selectedBranch.location || 'No location specified'}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{teams?.length || 0}</div>
                    <div className="text-sm text-gray-500">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {branchAnalytics?.metrics?.totalUsers || selectedBranch.userCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {branchAnalytics?.metrics?.completionRate 
                        ? `${branchAnalytics.metrics.completionRate.toFixed(1)}%` 
                        : analyticsLoading ? '...' : '--'
                      }
                    </div>
                    <div className="text-sm text-gray-500">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {branchAnalytics?.metrics?.activeSequences || (analyticsLoading ? '...' : '--')}
                    </div>
                    <div className="text-sm text-gray-500">Active Sequences</div>
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
                  Branch-level analytics are currently being developed. This page will show:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                  <li>• Branch-wide progress and completion rates</li>
                  <li>• Team performance comparisons</li>
                  <li>• User engagement metrics</li>
                  <li>• Sequence performance data</li>
                  <li>• Compliance and assessment results</li>
                </ul>
              </div>
            </Card>

            {/* Teams in Branch */}
            {teams && teams.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Teams in {selectedBranch.name}</h3>
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{team.name}</div>
                            <div className="text-sm text-gray-500">{team.userCount || 0} members</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Team Analytics
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {!selectedBranch && (
          <Card>
            <div className="p-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Branch</h3>
              <p className="text-gray-600">
                Choose a branch from the dropdown above to view its analytics and performance metrics.
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};