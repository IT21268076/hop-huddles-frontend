// pages/calendar/PersonalizedCalendar.tsx
import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, AlertCircle, MapPin, Users, Eye, Filter } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Calendar as CalendarComponent } from '../../components/ui/Calendar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { CalendarEvent, ScheduledHuddle, UserRole, Discipline } from '../../types';
import { cn, formatDate, formatTime } from '../../utils/helpers';
import { createSelectOptionsWithAll, createSelectOptionsFromObjects } from '../../utils/selectUtils';

interface PersonalizedCalendarProps {
  // Branch-based calendar personalized to user's assignments
}

interface CalendarFilters {
  branch?: string;
  role?: UserRole | 'ALL';
  discipline?: Discipline | 'ALL';
  eventType?: string;
  showCompleted?: boolean;
}

export const PersonalizedCalendar: React.FC<PersonalizedCalendarProps> = () => {
  const { currentUser, currentAssignment } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    role: 'ALL',
    discipline: 'ALL',
    showCompleted: false,
  });

  // Load personalized calendar data
  const {
    data: calendarData,
    loading: calendarLoading,
    refetch: refetchCalendar,
  } = useAsync(
    async () => {
      if (!currentUser) return { events: [], branches: [], upcomingEvents: [], overdueItems: [] };
      
      try {
        // Get events for next 30 days by default
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const events = await apiClient.getCalendarEvents(
          currentUser.userId,
          now.toISOString().slice(0, -1), // Remove 'Z' for LocalDateTime format
          thirtyDaysFromNow.toISOString().slice(0, -1) // Remove 'Z' for LocalDateTime format
        );
        const branches = await apiClient.getUserAccessibleBranches(currentUser.userId, currentUser.agencyId || 1);
        
        // Filter for upcoming events (next 30 days)
        const upcoming = events.filter(event => {
          const eventDate = new Date(event.eventDate || event.date);
          return eventDate >= now && eventDate <= thirtyDaysFromNow;
        });
        
        // Filter for overdue events
        const overdue = events.filter(event => {
          const eventDate = new Date(event.eventDate || event.date);
          return eventDate < now && !event.completed;
        });
        
        return { events, branches, upcomingEvents: upcoming, overdueItems: overdue };
      } catch (error) {
        console.error('Error loading calendar data:', error);
        return { events: [], branches: [], upcomingEvents: [], overdueItems: [] };
      }
    },
    [currentUser?.userId, filters]
  );

  // Filter options based on user assignments
  const filterOptions = React.useMemo(() => {
    if (!currentAssignment || !calendarData?.branches) {
      return { roles: [], disciplines: [], branches: [] };
    }

    return {
      roles: Array.from(new Set(currentAssignment.roles)),
      disciplines: Array.from(new Set(currentAssignment.disciplines)),
      branches: calendarData.branches,
    };
  }, [currentAssignment, calendarData?.branches]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    if (!calendarData?.events) return [];

    return calendarData.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.huddleId && event.sequenceId) {
      window.location.href = `/sequences/${event.sequenceId}`;
    } else if (event.type === 'assessment_due') {
      window.location.href = '/assessments';
    }
  };

  const handleFilterChange = (key: keyof CalendarFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'huddle_release':
        return <BookOpen className="h-4 w-4" />;
      case 'assessment_due':
        return <AlertCircle className="h-4 w-4" />;
      case 'sequence_start':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'huddle_release':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'assessment_due':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'sequence_start':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'sequence_end':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // **MULTI-ROLE SEPARATION**: Check active role, not all roles
  const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isEducator = activeRole === 'EDUCATOR';

  if (!currentUser || !currentAssignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have proper assignments.</p>
      </div>
    );
  }

  if (calendarLoading) {
    return <LoadingSpinner text="Loading your personalized calendar..." className="py-12" />;
  }

  const events = calendarData?.events || [];
  const branches = calendarData?.branches || [];
  const upcomingEvents = calendarData?.upcomingEvents || [];
  const overdueItems = calendarData?.overdueItems || [];

  return (
    <>
      <PageHeader
        title="My Calendar"
        description="Personalized schedule showing huddle releases and deadlines for your assignments"
        action={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            >
              {viewMode === 'calendar' ? <Eye className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              <span className="ml-2">
                {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
              </span>
            </Button>
          </div>
        }
      />

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Personalized Filters</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({
                role: 'ALL',
                discipline: 'ALL',
                showCompleted: false,
              })}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {filterOptions.roles.length > 1 && (
              <Select
                label="Filter by Role"
                value={filters.role || 'ALL'}
                onChange={(e) => handleFilterChange('role', e.target.value as UserRole | 'ALL')}
                options={createSelectOptionsWithAll(filterOptions.roles, 'All My Roles')}
              />
            )}

            {filterOptions.disciplines.length > 1 && (
              <Select
                label="Filter by Discipline"
                value={filters.discipline || 'ALL'}
                onChange={(e) => handleFilterChange('discipline', e.target.value as Discipline | 'ALL')}
                options={createSelectOptionsWithAll(filterOptions.disciplines, 'All My Disciplines')}
              />
            )}

            {branches.length > 1 && (
              <Select
                label="Filter by Branch"
                value={filters.branch || 'ALL'}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                options={[
                  { value: 'ALL', label: 'All My Branches' },
                  ...createSelectOptionsFromObjects(branches, 'branchId', 'name')
                ]}
              />
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.showCompleted || false}
                  onChange={(e) => handleFilterChange('showCompleted', e.target.checked)}
                  className="mr-2 rounded"
                />
                Show Completed
              </label>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card>
            {viewMode === 'calendar' ? (
              <CalendarComponent
                events={getEventsForDate}
                onDateSelect={setSelectedDate}
                onEventClick={handleEventClick}
                compact={false}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
                          getEventTypeColor(event.type)
                        )}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {/* Branch badge for EDUCATORs */}
                              {isEducator && event.branchName && (
                                <Badge variant="info" size="sm">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.branchName}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  event.status === 'completed' ? 'success' :
                                  event.status === 'overdue' ? 'destructive' :
                                  event.status === 'active' ? 'info' : 'default'
                                }
                                size="sm"
                              >
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatTime(event.date)}
                            </span>
                            {event.durationMinutes && (
                              <span className="text-sm text-gray-600">
                                ({event.durationMinutes} min)
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No upcoming events in the next 30 days</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overdue Items */}
          {overdueItems.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Overdue Items</h3>
              </div>
              <div className="space-y-2">
                {overdueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => {
                      if ('huddleId' in item && item.huddleId) {
                        window.location.href = `/sequences/${item.sequenceId}`;
                      }
                    }}
                  >
                    <div className="text-sm font-medium text-red-900">{item.title}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-red-700">
                        Due: {'date' in item ? 
                          formatDate(item.date) : 
                          formatDate((item as any).dueDate)
                        }
                      </div>
                      {isEducator && item.branchName && (
                        <Badge variant="destructive" size="sm">
                          {item.branchName}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Calendar Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="text-sm font-medium text-gray-900">
                  {events.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Upcoming Huddles</span>
                <span className="text-sm font-medium text-gray-900">
                  {upcomingEvents.filter(e => e.type === 'huddle_release').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Upcoming Assessments</span>
                <span className="text-sm font-medium text-gray-900">
                  {upcomingEvents.filter(e => e.type === 'assessment_due').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue Items</span>
                <span className="text-sm font-medium text-red-600">
                  {overdueItems.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Branches</span>
                <span className="text-sm font-medium text-gray-900">
                  {branches.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-md border cursor-pointer hover:shadow-sm transition-shadow',
                        getEventTypeColor(event.type)
                      )}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>{formatTime(event.date)}</span>
                          {isEducator && event.branchName && (
                            <Badge variant="info" size="sm">
                              {event.branchName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No events scheduled</p>
              )}
            </Card>
          )}

          {/* User Context */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Context</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Roles:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {currentAssignment.roles.map((role) => (
                    <Badge key={role} variant="info" size="sm">{role}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Disciplines:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {currentAssignment.disciplines?.map((discipline) => (
                    <Badge key={discipline} variant="success" size="sm">{discipline}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};