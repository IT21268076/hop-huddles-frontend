// pages/dashboard/DashboardPage.tsx
import React from 'react';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Award,
  Bell,
  ArrowRight,
  Play,
  Plus
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { formatDate, formatDuration } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  //console.log('DashboardPage component rendered');
  const navigate = useNavigate();
  const { currentUser, currentAgency, currentAssignment } = useApp();
  
  //console.log('Dashboard context:', { currentUser, currentAgency, currentAssignment });
  // Use active role for multi-role separation
  const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
  
  const permissions = usePermissions({
    userRole: activeRole,
    userDiscipline: currentAssignment?.discipline,
  });

  const currentRole = activeRole;
  const isFieldClinician = currentRole === 'FIELD_CLINICIAN';
  const isManager = ['ADMIN', 'EDUCATOR', 'DIRECTOR', 'CLINICAL_MANAGER'].includes(currentRole || '');
  const isEducator = currentRole === 'EDUCATOR';

  // Get dashboard data based on user role
  const {
    data: sequences,
    loading: sequencesLoading,
    error: sequencesError,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      try {
        const allSequences = await apiClient.getSequencesByAgency(currentAgency.agencyId);
        return allSequences.filter(seq => seq.sequenceStatus === 'PUBLISHED');
      } catch (error) {
        console.error('Failed to load sequences:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  const {
    data: userProgress,
    loading: progressLoading,
    error: progressError,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      try {
        return await apiClient.getUserSequenceProgressOverview(currentUser.userId);
      } catch (error) {
        console.error('Failed to load user progress:', error);
        return [];
      }
    },
    [currentUser?.userId]
  );

  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAsync(
    async () => {
      if (!currentAgency || !permissions.canViewAgencyAnalytics) return null;
      try {
        return await apiClient.getAgencyAnalytics(currentAgency.agencyId);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        return null;
      }
    },
    [currentAgency?.agencyId, permissions.canViewAgencyAnalytics]
  );

  // Calculate user stats
  const totalSequences = sequences?.length || 0;
  const completedSequences = userProgress?.filter(p => p.sequenceStatus === 'COMPLETED').length || 0;
  const inProgressSequences = userProgress?.filter(p => p.sequenceStatus === 'IN_PROGRESS').length || 0;
  const averageCompletion = userProgress && userProgress.length > 0
    ? userProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / userProgress.length
    : 0;

  // Get recent sequences for quick access
  const recentSequences = sequences?.slice(0, 3) || [];

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to HOP Huddles</h2>
          <p className="text-gray-600 mb-6">
            AI-powered micro-education platform for healthcare compliance training
          </p>
          <Button onClick={() => navigate('/agencies')}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  // Handle superadmin case - they might not have agency assignments
  if (!currentAgency && currentUser?.email === 'superadmin@hophuddles.com') {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Superadmin</h2>
          <p className="text-gray-600 mb-6">
            Platform administration dashboard for managing agencies and users
          </p>
          <Button onClick={() => navigate('/superadmin')}>
            Go to SuperAdmin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to HOP Huddles</h2>
          <p className="text-gray-600 mb-6">
            AI-powered micro-education platform for healthcare compliance training
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/agencies')}>
              Get Started
            </Button>
            <p className="text-sm text-gray-500">
              Loading agency information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBasedWelcomeMessage = () => {
    const firstName = currentUser.name.split(' ')[0];
    switch (currentRole) {
      case 'FIELD_CLINICIAN':
        return `Ready to learn, ${firstName}?`;
      case 'EDUCATOR':
        return `Good ${getTimeOfDay()}, ${firstName}!`;
      case 'ADMIN':
        return `Welcome back, ${firstName}!`;
      case 'DIRECTOR':
        return `Managing excellence, ${firstName}!`;
      case 'CLINICAL_MANAGER':
        return `Leading the way, ${firstName}!`;
      default:
        return `Welcome back, ${firstName}!`;
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getRoleDescription = () => {
    if (!currentAssignment) return '';
    
    const parts = [currentAgency.name];
    
    // **BRANCH DISPLAY RULE**: Only EDUCATORs see branch names
    if (isEducator && currentAssignment.branchName) {
      parts.push(currentAssignment.branchName);
    }
    
    if (currentAssignment.teamName) {
      parts.push(currentAssignment.teamName);
    }
    
    return parts.join(' • ');
  };

  return (
    <>
      <PageHeader
        title={getRoleBasedWelcomeMessage()}
        description={getRoleDescription()}
      />

      <div className="space-y-8">
        {/* Personal Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Available Sequences</div>
                <div className="text-2xl font-bold text-gray-900">{totalSequences}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Completed</div>
                <div className="text-2xl font-bold text-gray-900">{completedSequences}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">In Progress</div>
                <div className="text-2xl font-bold text-gray-900">{inProgressSequences}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Avg. Progress</div>
                <div className="text-2xl font-bold text-gray-900">
                  {averageCompletion.toFixed(0)}%
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Role-specific content */}
          {isFieldClinician ? (
            /* Field Clinician View - Focus on Learning */
            <>
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">My Learning Path</h3>
                    <Button variant="outline" size="sm" onClick={() => navigate('/my-huddles')}>
                      View All Huddles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentSequences.length > 0 ? (
                      recentSequences.map((sequence) => {
                        const progress = userProgress?.find(p => p.sequenceId === sequence.sequenceId);
                        return (
                          <div
                            key={sequence.sequenceId}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/sequences/${sequence.sequenceId}`)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{sequence.title}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {sequence.totalHuddles} huddles
                                {sequence.estimatedDurationMinutes && (
                                  <span> • {formatDuration(sequence.estimatedDurationMinutes)}</span>
                                )}
                              </div>
                              {progress && (
                                <div className="mt-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-600 h-1.5 rounded-full"
                                        style={{ width: `${progress.completionPercentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {progress.completionPercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              {progress ? (
                                <Badge variant={progress.sequenceStatus === 'COMPLETED' ? 'success' : 'info'}>
                                  {progress.sequenceStatus === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                </Badge>
                              ) : (
                                <Button size="sm">
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No learning content assigned yet.</p>
                        <p className="text-sm">Contact your supervisor for assignments.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </>
          ) : (
            /* Manager/Educator View - Focus on Management */
            <>
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isEducator ? 'Content Management' : 'Team Overview'}
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => navigate('/sequences')}>
                      {isEducator ? 'Manage Content' : 'View Details'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentSequences.length > 0 ? (
                      recentSequences.map((sequence) => {
                        const progress = userProgress?.find(p => p.sequenceId === sequence.sequenceId);
                        return (
                          <div
                            key={sequence.sequenceId}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/sequences/${sequence.sequenceId}`)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{sequence.title}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {sequence.totalHuddles} huddles • {sequence.sequenceStatus}
                                {sequence.estimatedDurationMinutes && (
                                  <span> • {formatDuration(sequence.estimatedDurationMinutes)}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="default" size="sm">
                                  {sequence.targets?.length || 0} target audience{(sequence.targets?.length || 0) !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge variant={sequence.sequenceStatus === 'PUBLISHED' ? 'success' : 'warning'}>
                                {sequence.sequenceStatus}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No sequences created yet.</p>
                        {isEducator && (
                          <p className="text-sm">Create your first huddle sequence to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Quick Actions & Agency Stats */}
          <div className="space-y-6">
            {/* Role-specific Quick Actions */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isFieldClinician ? 'Learning Tools' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                {isFieldClinician ? (
                  /* Field Clinician Actions */
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/my-huddles')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      My Huddles
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/progress')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      My Progress
                    </Button>
                  </>
                ) : (
                  /* Manager/Educator Actions */
                  <>
                    {permissions.canCreateSequence && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/sequences/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Sequence
                      </Button>
                    )}

                    {permissions.canManageAgencyUsers && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/users')}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    )}

                    {permissions.canEditHuddles && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/assessments')}>
                        <Award className="h-4 w-4 mr-2" />
                        Create Assessment
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/progress')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Team Progress
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Agency Stats (for managers) */}
            {permissions.canViewAgencyAnalytics && analytics && (
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agency Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Users</span>
                    <span className="font-medium">{analytics.metrics.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Active Users</span>
                    <span className="font-medium">{analytics.metrics.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Completion Rate</span>
                    <span className="font-medium">{(analytics.metrics.completionRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Views</span>
                    <span className="font-medium">{analytics.metrics.totalViews}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/analytics')}>
                    View Detailed Analytics
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {userProgress?.slice(0, 3).map((progress) => (
                  <div key={progress.sequenceProgressId} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {progress.sequenceTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {progress.completionPercentage.toFixed(0)}% complete • {formatDate(progress.lastAccessed)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!userProgress || userProgress.length === 0) && (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};