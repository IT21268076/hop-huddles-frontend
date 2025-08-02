// components/calendar/UserFilteredCalendar.tsx
// ⭐ USER-FILTERED CALENDAR FOR SERIES-EPISODE MODEL
// Shows only episodes relevant to the user's role-discipline combination

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Filter, Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { useApp } from '../../contexts/AppContext';
import { useUserScheduleFilter, useUserEpisodeAccess } from '../../hooks/useUserScheduleFilter';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { 
  CombinationSchedule,
  CalendarEvent,
  UserRole,
  Discipline
} from '../../types';
import { formatDate, formatDateTime } from '../../utils/helpers';

interface UserFilteredCalendarProps {
  agencyId?: number;
  showFilterControls?: boolean;
  defaultView?: 'month' | 'week' | 'day';
  className?: string;
}

export const UserFilteredCalendar: React.FC<UserFilteredCalendarProps> = ({
  agencyId,
  showFilterControls = true,
  defaultView = 'month',
  className = ''
}) => {
  const { currentUser, currentAssignment } = useApp();
  const { canAccessEpisode, getAccessReason, currentRole, currentDiscipline } = useUserEpisodeAccess();
  
  // Filter states
  const [showAllSeries, setShowAllSeries] = useState(false);
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string, end: string}>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  // Load user-filtered schedules
  const {
    schedules,
    userRole,
    userDiscipline,
    canSeeAllSeries,
    loading: schedulesLoading
  } = useUserScheduleFilter(agencyId, {
    showAllSeries: canSeeAllSeries && showAllSeries,
    includeCompleted,
    branchId: currentAssignment?.branchId
  });

  // Load upcoming calendar events for the user
  const {
    data: calendarEvents,
    loading: eventsLoading
  } = useAsync(
    async () => {
      if (!currentUser || !agencyId) return [];
      
      try {
        const startDate = selectedDateRange.start + 'T00:00:00';
        const endDate = selectedDateRange.end + 'T23:59:59';
        
        // Get upcoming combination schedule releases
        const upcomingSchedules = await apiClient.getUpcomingCombinationSchedules(startDate, endDate);
        
        // Filter by user access
        const accessibleSchedules = upcomingSchedules.filter(canAccessEpisode);
        
        // Convert to calendar events
        return accessibleSchedules.map(schedule => ({
          id: `episode-${schedule.combinationScheduleId}`,
          title: `${schedule.seriesTitle} - Episode ${schedule.currentHuddleIndex + 1}`,
          start: schedule.nextExecutionTime,
          end: schedule.nextExecutionTime,
          type: 'episode_release' as const,
          status: 'upcoming' as const,
          description: `Next episode in the ${schedule.seriesTitle} series`,
          metadata: {
            scheduleId: schedule.combinationScheduleId,
            seriesTitle: schedule.seriesTitle,
            episodeNumber: schedule.currentHuddleIndex + 1,
            totalEpisodes: schedule.totalHuddlesInCombination,
            userRole: schedule.userRole,
            discipline: schedule.discipline
          }
        }));
      } catch (error) {
        console.error('Error loading calendar events:', error);
        return [];
      }
    },
    [currentUser?.userId, agencyId, selectedDateRange, schedules]
  );

  // Group events by date for calendar display
  const eventsByDate = useMemo(() => {
    if (!calendarEvents) return {};
    
    return calendarEvents.reduce((acc, event) => {
      const date = event.start?.split('T')[0];
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
      }
      return acc;
    }, {} as Record<string, typeof calendarEvents>);
  }, [calendarEvents]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const start = new Date(selectedDateRange.start);
    const end = new Date(selectedDateRange.end);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayOfMonth: d.getDate(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        events: eventsByDate[dateStr] || []
      });
    }
    
    return days;
  }, [selectedDateRange, eventsByDate]);

  // User context display
  const userContextDisplay = useMemo(() => {
    if (!currentAssignment) return 'Not authenticated';
    
    const role = currentAssignment.activeRole || currentAssignment.roles[0];
    const discipline = currentAssignment.discipline;
    
    if (role === 'SUPERADMIN') return 'All content (Super Admin)';
    if (role === 'ADMIN') return 'All agency content (Admin)';
    if (role === 'EDUCATOR') return `All branch content (Educator)`;
    
    return discipline ? `${role} - ${discipline} episodes only` : `${role} episodes`;
  }, [currentAssignment]);

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderEventBadge = (event: any) => {
    const isUserSeries = event.metadata?.userRole === currentRole && 
                        event.metadata?.discipline === currentDiscipline;
    
    return (
      <div 
        key={event.id}
        className={`p-1 text-xs rounded ${
          isUserSeries 
            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
        title={`${event.title}\n${event.description}\nAccess: ${getAccessReason(event.metadata)}`}
      >
        <div className="flex items-center space-x-1">
          {isUserSeries && <User size={10} />}
          <span className="truncate">{event.metadata?.seriesTitle?.split(' - ')[1] || 'Unknown'}</span>
        </div>
        <div className="text-xs opacity-75">
          Ep {event.metadata?.episodeNumber}/{event.metadata?.totalEpisodes}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Please sign in to view your personalized episode calendar.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Context Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Your Episode Calendar</p>
              <p className="text-sm text-blue-700">{userContextDisplay}</p>
            </div>
          </div>
          {currentAssignment && (
            <Badge color="blue">
              {currentAssignment.roles.length > 1 
                ? `${currentRole} (+${currentAssignment.roles.length - 1} more)` 
                : currentRole}
            </Badge>
          )}
        </div>
      </Card>

      {/* Filter Controls */}
      {showFilterControls && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {canSeeAllSeries && (
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={showAllSeries}
                  onChange={setShowAllSeries}
                />
                <span className="text-sm">Show all series</span>
              </label>
            )}

            <label className="flex items-center space-x-2">
              <Checkbox
                checked={includeCompleted}
                onChange={setIncludeCompleted}
              />
              <span className="text-sm">Include completed</span>
            </label>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">From:</span>
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">To:</span>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Episode Release Calendar</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Eye className="h-4 w-4" />
            <span>{calendarEvents?.length || 0} upcoming episodes</span>
          </div>
        </div>

        {schedulesLoading || eventsLoading ? (
          <div className="grid grid-cols-7 gap-2 h-96">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="border rounded p-2 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Calendar Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map(day => (
              <div
                key={day.date}
                className={`min-h-[80px] border rounded p-1 ${
                  day.isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.dayOfMonth}
                </div>
                
                <div className="space-y-1">
                  {day.events.slice(0, 2).map(event => renderEventBadge(event))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500 p-1">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upcoming Episodes Summary */}
      {calendarEvents && calendarEvents.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Next Episodes for You</h4>
          <div className="space-y-2">
            {calendarEvents.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {formatDateTime(event.start || '')}
                  </p>
                  <Badge 
                    color={event.metadata?.userRole === currentRole ? 'blue' : 'gray'}
                    size="sm"
                  >
                    {event.metadata?.userRole} - {event.metadata?.discipline}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!schedulesLoading && !eventsLoading && (!calendarEvents || calendarEvents.length === 0) && (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Episodes Scheduled</h3>
          <p className="text-gray-600 mb-4">
            There are no upcoming episodes for your role and discipline combination.
          </p>
          {!canSeeAllSeries && (
            <p className="text-sm text-gray-500">
              Your current access: {userContextDisplay}
            </p>
          )}
        </Card>
      )}
    </div>
  );
};