// components/notifications/UpcomingReleasesWidget.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Bell, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { formatDate, formatDuration } from '../../utils/helpers';

interface UpcomingRelease {
  id: number;
  title: string;
  sequenceTitle: string;
  scheduledReleaseTime: string;
  timeUntilRelease: {
    status: 'pending' | 'released';
    days: number;
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
  huddleId: number;
  sequenceId: number;
}

interface UpcomingReleasesWidgetProps {
  daysAhead?: number;
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export const UpcomingReleasesWidget: React.FC<UpcomingReleasesWidgetProps> = ({
  daysAhead = 7,
  maxItems = 5,
  showTitle = true,
  compact = false,
}) => {
  const [showAll, setShowAll] = useState(false);

  const {
    data: upcomingReleases,
    loading,
    error,
  } = useAsync(
    async () => {
      try {
        const releases = await apiClient.getHuddleReleaseSchedules(0); // This would need to be updated for user-specific releases
        return releases.slice(0, showAll ? undefined : maxItems);
      } catch (err) {
        console.warn('Failed to load upcoming releases:', err);
        return [];
      }
    },
    [daysAhead, showAll, maxItems]
  );

  const getTimeUntilText = (timeUntil: UpcomingRelease['timeUntilRelease']) => {
    if (timeUntil.status === 'released') {
      return 'Available now';
    }

    if (timeUntil.days > 0) {
      return `${timeUntil.days} day${timeUntil.days > 1 ? 's' : ''}`;
    } else if (timeUntil.hours > 0) {
      return `${timeUntil.hours} hour${timeUntil.hours > 1 ? 's' : ''}`;
    } else if (timeUntil.minutes > 0) {
      return `${timeUntil.minutes} minute${timeUntil.minutes > 1 ? 's' : ''}`;
    } else {
      return 'Very soon';
    }
  };

  const getUrgencyColor = (timeUntil: UpcomingRelease['timeUntilRelease']) => {
    if (timeUntil.status === 'released') {
      return 'bg-green-100 text-green-800 border-green-200';
    }

    const totalHours = timeUntil.totalMinutes / 60;
    if (totalHours <= 1) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (totalHours <= 24) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (totalHours <= 72) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleNavigateToSequence = (sequenceId: number) => {
    window.location.href = `/sequences/${sequenceId}/learn`;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error || !upcomingReleases || upcomingReleases.length === 0) {
    return (
      <Card className="text-center py-6">
        <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No upcoming releases</p>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {upcomingReleases.slice(0, 3).map((release: any) => (
          <div
            key={release.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => handleNavigateToSequence(release.sequenceId)}
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {release.title}
                </div>
                <div className="text-xs text-gray-500">
                  {getTimeUntilText(release.timeUntilRelease)}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Releases</h3>
          </div>
          <Badge variant="info">
            Next {daysAhead} days
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        {upcomingReleases.map((release: any) => (
          <div
            key={release.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
            onClick={() => handleNavigateToSequence(release.sequenceId)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`h-3 w-3 rounded-full ${
                  release.timeUntilRelease?.status === 'released' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {release.title}
                  </h4>
                  {release.timeUntilRelease?.totalMinutes <= 60 && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="truncate max-w-32">{release.sequenceTitle}</span>
                  <span>•</span>
                  <span>{formatDate(release.scheduledReleaseTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                getUrgencyColor(release.timeUntilRelease)
              }`}>
                {getTimeUntilText(release.timeUntilRelease)}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
        
        {upcomingReleases.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No upcoming releases in the next {daysAhead} days</p>
          </div>
        )}
      </div>

      {upcomingReleases.length > maxItems && !showAll && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Show {upcomingReleases.length - maxItems} more
          </Button>
        </div>
      )}

      {showAll && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        </div>
      )}
    </Card>
  );
};