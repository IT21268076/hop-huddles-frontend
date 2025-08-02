// pages/dashboard/EnhancedDashboard.tsx
import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  Calendar,
  Users,
  Activity,
  Target
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { UpcomingReleasesWidget } from '../../components/notifications/UpcomingReleasesWidget';
import { formatDuration } from '../../utils/helpers';

export const EnhancedDashboard: React.FC = () => {
  const { currentUser, currentAssignment, currentAgency } = useApp();

  // Get user's progress overview
  const {
    data: progressOverview,
    loading: progressLoading,
  } = useAsync(
    async () => {
      if (!currentUser) return null;
      return await apiClient.getUserSequenceProgressOverview(currentUser.userId);
    },
    [currentUser?.userId]
  );

  // Get role-specific sequences
  const {
    data: availableSequences,
    loading: sequencesLoading,
  } = useAsync(
    async () => {
      if (!currentUser || !currentAssignment) return [];
      
      const activeRole = currentAssignment.activeRole || currentAssignment.role;
      const userDiscipline = currentAssignment.discipline;
      
      if (activeRole === 'EDUCATOR') {
        return await apiClient.getSequencesCreatedByMe();
      } else {
        return await apiClient.getSequencesForSpecificRole(activeRole, userDiscipline);
      }
    },
    [currentUser?.userId, currentAssignment?.activeRole, currentAssignment?.role, currentAssignment?.discipline]
  );

  if (!currentUser || !currentAssignment || !currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have an assignment.</p>
      </div>
    );
  }

  const activeRole = currentAssignment.activeRole || currentAssignment.role;
  const sequences = availableSequences || [];
  const progress = progressOverview || [];

  // Calculate dashboard metrics
  const totalSequences = sequences.length;
  const completedSequences = progress.filter(p => p.sequenceStatus === 'COMPLETED').length;
  const inProgressSequences = progress.filter(p => p.sequenceStatus === 'IN_PROGRESS').length;
  const completionRate = totalSequences > 0 ? Math.round((completedSequences / totalSequences) * 100) : 0;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.totalTimeSpentMinutes || 0), 0);
  const averageScore = progress.length > 0 
    ? progress.reduce((sum, p) => sum + (p.averageScore || 0), 0) / progress.length 
    : 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${currentUser.firstName || 'User'}!`}
        description={`Dashboard for ${activeRole}${currentAssignment.branchName ? ` in ${currentAssignment.branchName}` : ''}`}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Completion Rate</div>
              <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Time Spent</div>
              <div className="text-2xl font-bold text-gray-900">{formatDuration(totalTimeSpent)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Average Score</div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(averageScore)}%</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Overview */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
              <div className="text-sm text-gray-500">
                {completedSequences} of {totalSequences} sequences completed
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Progress Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedSequences}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{inProgressSequences}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{totalSequences - completedSequences - inProgressSequences}</div>
                <div className="text-sm text-gray-500">Not Started</div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>

            {progress.length > 0 ? (
              <div className="space-y-4">
                {progress
                  .filter(p => p.lastAccessed)
                  .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.sequenceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          item.sequenceStatus === 'COMPLETED' ? 'bg-green-500' : 
                          item.sequenceStatus === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.sequenceTitle}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(item.completionPercentage)}% complete • Last accessed {new Date(item.lastAccessed).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.sequenceStatus === 'COMPLETED' ? 'Completed' : `${Math.round(item.completionPercentage)}%`}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Releases */}
          <UpcomingReleasesWidget daysAhead={14} maxItems={5} />

          {/* Role Context */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Context</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Active Role</div>
                <div className="text-lg font-medium text-gray-900">{activeRole}</div>
              </div>

              {currentAssignment.discipline && (
                <div>
                  <div className="text-sm text-gray-500">Discipline</div>
                  <div className="text-lg font-medium text-gray-900">{currentAssignment.discipline}</div>
                </div>
              )}

              {currentAssignment.branchName && (
                <div>
                  <div className="text-sm text-gray-500">Branch</div>
                  <div className="text-lg font-medium text-gray-900">{currentAssignment.branchName}</div>
                </div>
              )}

              {currentAssignment.roles && currentAssignment.roles.length > 1 && (
                <div>
                  <div className="text-sm text-gray-500">Available Roles</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentAssignment.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-1 text-xs rounded-full ${
                          role === activeRole
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Learning Goals */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Completion Goal</span>
                  <span>2/3 sequences</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Learning Time</span>
                  <span>{Math.floor(totalTimeSpent / 60)}h / 20h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((totalTimeSpent / 1200) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assessment Average</span>
                  <span>{Math.round(averageScore)}% / 85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${Math.min((averageScore / 85) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};