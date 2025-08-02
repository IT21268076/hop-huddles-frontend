import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Download,
  RefreshCw,
  Award
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useApi } from '../../hooks/useApi';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatDuration } from '../../utils/helpers';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalHuddles: number;
    completedHuddles: number;
    totalAssessments: number;
    passedAssessments: number;
    averageCompletionTime: number;
    overallCompletionRate: number;
  };
  sequences: {
    id: number;
    title: string;
    totalAssigned: number;
    completed: number;
    completionRate: number;
    averageScore: number;
    averageTime: number;
  }[];
  users: {
    id: number;
    name: string;
    role: string;
    discipline: string;
    assignedHuddles: number;
    completedHuddles: number;
    completionRate: number;
    averageScore: number;
    lastActivity: string;
    branch?: string;
    team?: string;
  }[];
  branches: {
    id: number;
    name: string;
    userCount: number;
    completionRate: number;
    averageScore: number;
    activeUsers: number;
  }[];
  teams: {
    id: number;
    name: string;
    branchName: string;
    userCount: number;
    completionRate: number;
    averageScore: number;
    activeUsers: number;
  }[];
  timelineData: {
    date: string;
    completions: number;
    assessments: number;
    newAssignments: number;
  }[];
  rolePerformance: {
    role: string;
    userCount: number;
    completionRate: number;
    averageScore: number;
    engagementScore: number;
  }[];
  disciplinePerformance: {
    discipline: string;
    userCount: number;
    completionRate: number;
    averageScore: number;
    engagementScore: number;
  }[];
  lastUpdated: string;
}

export const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const permissions = usePermissions();
  const api = useApi();
  
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  // Fetch analytics data based on user's access level
  const {
    data: analytics,
    loading,
    refetch,
  } = useAsync(
    async (): Promise<AnalyticsData | null> => {
      if (!currentAgency || !currentAssignment) return null;
      
      try {
        let analyticsData;
        
        // Fetch data based on access level
        switch (permissions.accessLevel) {
          case 'platform':
            analyticsData = await api.getAgencyAnalytics(currentAgency.agencyId);
            break;
            
          case 'agency':
            analyticsData = await api.getAgencyAnalytics(currentAgency.agencyId);
            break;
            
          case 'branch':
            analyticsData = await api.getAgencyAnalytics(currentAgency.agencyId);
            break;
            
          case 'team':
            analyticsData = await api.getUserAnalytics(currentAssignment.userId);
            break;
            
          case 'personal':
            analyticsData = await api.getUserAnalytics(currentAssignment.userId);
            break;
            
          default:
            return null;
        }

        // Transform Analytics to AnalyticsData format
        const transformedData: AnalyticsData = {
          overview: {
            totalUsers: analyticsData.metrics.totalUsers,
            activeUsers: analyticsData.metrics.activeUsers,
            totalHuddles: analyticsData.metrics.totalSequences,
            completedHuddles: analyticsData.metrics.completedSequences,
            totalAssessments: analyticsData.metrics.totalAssessments,
            passedAssessments: Math.round(analyticsData.metrics.totalAssessments * analyticsData.metrics.completionRate / 100),
            averageCompletionTime: 0, // Not available in Analytics type
            overallCompletionRate: analyticsData.metrics.completionRate,
          },
          sequences: [],
          users: [],
          branches: [],
          teams: [],
          timelineData: analyticsData.metrics.dailyEngagement?.map(([date, completions]) => ({
            date,
            completions,
            assessments: 0,
            newAssignments: 0,
          })) || [],
          rolePerformance: [
            {
              role: 'EDUCATOR',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              role: 'ADMIN',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              role: 'DIRECTOR',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              role: 'CLINICAL_MANAGER',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              role: 'FIELD_CLINICIAN',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
          ],
          disciplinePerformance: [
            {
              discipline: 'RN',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'PT',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'OT',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'SLP',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'LPN',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'HHA',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'MSW',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
            {
              discipline: 'OTHER',
              userCount: 0,
              completionRate: 0,
              averageScore: 0,
              engagementScore: 0,
            },
          ],
          lastUpdated: analyticsData.generatedAt,
        };
        
        return transformedData;
      } catch (error) {
        console.error('Failed to load analytics:', error);
        return null;
      }
    },
    [
      currentAgency?.agencyId,
      currentAssignment,
      permissions.accessLevel,
      timeRange,
      selectedBranch,
      selectedTeam,
      selectedRole,
      selectedDiscipline,
    ]
  );

  const handleExportReport = async () => {
    try {
      // TODO: Implement analytics report generation
      const reportData = 'Mock analytics report data';

      // Create and download file
      const blob = new Blob([reportData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
  ];

  const renderOverviewCards = () => {
    if (!analytics) return null;

    const { overview } = analytics;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overview.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users</div>
                <div className="text-xs text-gray-400">of {overview.totalUsers} total</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overview.completedHuddles}</div>
                <div className="text-sm text-gray-500">Huddles Completed</div>
                <div className="text-xs text-gray-400">of {overview.totalHuddles} assigned</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overview.passedAssessments}</div>
                <div className="text-sm text-gray-500">Assessments Passed</div>
                <div className="text-xs text-gray-400">of {overview.totalAssessments} taken</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(overview.overallCompletionRate)}%
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
                <div className="text-xs text-gray-400">
                  Avg time: {formatDuration(overview.averageCompletionTime)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSequencePerformance = () => {
    if (!analytics?.sequences.length) return null;

    return (
      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sequence Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Sequence</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Assigned</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Completed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Completion Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Avg Score</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sequences.map((sequence) => (
                  <tr key={sequence.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{sequence.title}</div>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {sequence.totalAssigned}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {sequence.completed}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${sequence.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(sequence.completionRate)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={sequence.averageScore >= 80 ? 'success' : 'default'}>
                        {Math.round(sequence.averageScore)}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {formatDuration(sequence.averageTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  };

  const renderRolePerformance = () => {
    if (!analytics?.rolePerformance.length) return null;

    return (
      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Role</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.rolePerformance.map((role) => (
              <div key={role.role} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {role.role.replace('_', ' ')}
                  </h4>
                  <Badge variant="default">{role.userCount} users</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{Math.round(role.completionRate)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${role.completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Score</span>
                    <span className="font-medium">{Math.round(role.averageScore)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium">{Math.round(role.engagementScore)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const renderUserPerformance = () => {
    if (!analytics?.users.length) return null;

    return (
      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Individual Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Role</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Discipline</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Avg Score</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {analytics.users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        {user.branch && (
                          <div className="text-sm text-gray-500">{user.branch}</div>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="default" className="text-xs">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="default" className="text-xs">
                        {user.discipline}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${user.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {user.completedHuddles}/{user.assignedHuddles}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={user.averageScore >= 80 ? 'success' : 'default'}>
                        {Math.round(user.averageScore)}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600 text-sm">
                      {formatDate(user.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {analytics.users.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Users ({analytics.users.length})
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const getAccessLevelTitle = () => {
    switch (permissions.accessLevel) {
      case 'platform': return 'Platform Analytics';
      case 'agency': return `${currentAgency?.name} Analytics`;
      case 'branch': return `${currentAssignment?.branchName} Branch Analytics`;
      case 'team': return `${currentAssignment?.teamName} Team Analytics`;
      case 'personal': return 'My Performance';
      default: return 'Analytics Dashboard';
    }
  };

  const getAccessLevelDescription = () => {
    switch (permissions.accessLevel) {
      case 'platform': return 'System-wide performance metrics and insights';
      case 'agency': return 'Agency-wide learning progress and engagement metrics';
      case 'branch': return 'Branch performance and team collaboration insights';
      case 'team': return 'Team progress and individual member performance';
      case 'personal': return 'Your personal learning journey and achievements';
      default: return 'Performance analytics and insights';
    }
  };

  return (
    <>
      <PageHeader
        title={getAccessLevelTitle()}
        description={getAccessLevelDescription()}
        action={{
          label: 'Export Report',
          onClick: handleExportReport,
          icon: <Download className="h-4 w-4" />,
        }}
      />

      {/* Filters */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex flex-wrap items-center space-x-4 space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                options={timeRangeOptions}
                className="w-40"
              />
            </div>

            {permissions.accessLevel === 'agency' && (
              <>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Branch:</label>
                  <Select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    options={[{ value: '', label: 'All Branches' }]} // Would be populated from API
                    className="w-40"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Team:</label>
                  <Select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    options={[{ value: '', label: 'All Teams' }]} // Would be populated from API
                    className="w-40"
                  />
                </div>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !analytics ? (
        <Card>
          <div className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analytics data available
            </h3>
            <p className="text-gray-500">
              Analytics will appear here once users start completing huddles and assessments.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {renderOverviewCards()}
          {renderSequencePerformance()}
          {renderRolePerformance()}
          {renderUserPerformance()}
        </>
      )}
    </>
  );
};