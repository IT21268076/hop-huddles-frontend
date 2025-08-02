// pages/teams/TeamAnalytics.tsx
import React from 'react';
import { BarChart3, Users, Building, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { Team } from '../../types';

interface TeamAnalyticsProps {
  team: Team;
  onClose: () => void;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ team, onClose }) => {
  const {
    data: analytics,
    loading,
  } = useAsync(
    async () => {
      // TODO: Implement actual analytics API call
      return {
        totalUsers: 12,
        activeUsers: 11,
        completionRate: 92,
        averageProgress: 88,
        recentActivity: [
          { type: 'huddle_completed', message: 'Jane Smith completed Infection Control Training', timestamp: '1 hour ago' },
          { type: 'assessment_passed', message: 'Mike Johnson passed Safety Assessment', timestamp: '3 hours ago' },
          { type: 'user_joined', message: 'Emma Wilson joined the team', timestamp: '1 day ago' },
        ]
      };
    },
    [team.teamId]
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team Analytics</h3>
        </div>
        <Badge variant="info" size="sm">
          {team.branchName}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">
              {analytics?.activeUsers || 0} active
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.completionRate || 0}%</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${analytics?.completionRate || 0}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.averageProgress || 0}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${analytics?.averageProgress || 0}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
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

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};