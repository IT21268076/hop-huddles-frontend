// pages/calendar/CalendarPage.tsx
import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, AlertCircle, Filter, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar as CalendarComponent } from '../../components/ui/Calendar';
import { useCalendar } from '../../hooks/useCalendar';
import { useBranchContext } from '../../contexts/BranchContext';
import { CalendarEvent, ScheduledHuddle, UserDeadline, UserRole, Discipline } from '../../types';
import { cn } from '../../utils/helpers';

export const CalendarPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { currentBranch, availableBranches } = useBranchContext();
  const {
    calendarData,
    filters,
    selectedDate,
    setSelectedDate,
    setFilters,
    getEventsForDate,
    getScheduledHuddlesForDate,
    getDeadlinesForDate,
    getUpcomingEvents,
    getOverdueItems,
    refreshCalendar,
  } = useCalendar();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Combine all events for calendar display
  const getAllEventsForDate = (date: Date) => {
    const events = getEventsForDate(date);
    const huddles = getScheduledHuddlesForDate(date);
    const deadlines = getDeadlinesForDate(date);

    // Convert to calendar events format
    const huddleEvents: CalendarEvent[] = huddles.map(huddle => ({
      id: `huddle-${huddle.id}`,
      title: huddle.title,
      date: huddle.scheduledDate,
      type: 'huddle_release',
      huddleId: huddle.huddleId,
      sequenceId: huddle.sequenceId,
      sequenceTitle: huddle.sequenceTitle,
      status: huddle.status,
      description: huddle.description,
      durationMinutes: huddle.durationMinutes,
    }));

    const deadlineEvents: CalendarEvent[] = deadlines.map(deadline => ({
      id: `deadline-${deadline.id}`,
      title: deadline.title,
      date: deadline.dueDate,
      type: deadline.type === 'assessment' ? 'assessment_due' : 'huddle_release',
      huddleId: deadline.huddleId,
      sequenceId: deadline.sequenceId,
      status: deadline.status,
      description: deadline.description,
    }));

    return [...events, ...huddleEvents, ...deadlineEvents];
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Navigate to appropriate page based on event type
    if (event.huddleId && event.sequenceId) {
      window.location.href = `/sequences/${event.sequenceId}`;
    } else if (event.type === 'assessment_due') {
      window.location.href = '/assessments';
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
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
        return 'text-blue-600 bg-blue-50';
      case 'assessment_due':
        return 'text-red-600 bg-red-50';
      case 'sequence_start':
        return 'text-green-600 bg-green-50';
      case 'sequence_end':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const upcomingEvents = getUpcomingEvents(30);
  const overdueItems = getOverdueItems();

  return (
    <>
      <PageHeader
        title="Calendar"
        description="View your huddle schedule and upcoming deadlines"
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
              {viewMode === 'calendar' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-2">
                {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
              </span>
            </Button>
          </div>
        }
      />

      {/* Enhanced Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Branch and Role Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableBranches.length > 1 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Branch:</label>
                  <select
                    value={filters.branch || ''}
                    onChange={(e) => handleFilterChange('branch', e.target.value || undefined)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All Branches</option>
                    {availableBranches.map((branch) => (
                      <option key={branch.branchId} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700">Role:</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="EDUCATOR">Educator</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="CLINICAL_MANAGER">Clinical Manager</option>
                  <option value="FIELD_CLINICIAN">Field Clinician</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Discipline:</label>
                <select
                  value={filters.discipline || ''}
                  onChange={(e) => handleFilterChange('discipline', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Disciplines</option>
                  <option value="RN">Registered Nurse</option>
                  <option value="PT">Physical Therapist</option>
                  <option value="OT">Occupational Therapist</option>
                  <option value="SLP">Speech Language Pathologist</option>
                  <option value="MSW">Medical Social Worker</option>
                  <option value="LPN">Licensed Practical Nurse</option>
                  <option value="HHA">Home Health Aide</option>
                </select>
              </div>
            </div>
            
            {/* Event Type Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Event Types:</label>
                <div className="flex space-x-2">
                  {['huddle_release', 'assessment_due', 'sequence_start', 'sequence_end'].map(type => (
                    <Button
                      key={type}
                      variant={filters.eventTypes?.includes(type) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const currentTypes = filters.eventTypes || [];
                        const newTypes = currentTypes.includes(type)
                          ? currentTypes.filter(t => t !== type)
                          : [...currentTypes, type];
                        handleFilterChange('eventTypes', newTypes);
                      }}
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={filters.showCompleted || false}
                    onChange={(e) => handleFilterChange('showCompleted', e.target.checked)}
                    className="mr-2"
                  />
                  Show Completed
                </label>
              </div>
            </div>
            
            {currentBranch && (
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
                <strong>Current Branch:</strong> {currentBranch.name} ({currentBranch.city}, {currentBranch.state})
                {currentBranch.disciplines && currentBranch.disciplines.length > 0 && (
                  <span className="ml-2">
                    • Disciplines: {currentBranch.disciplines.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card>
            {viewMode === 'calendar' ? (
              <CalendarComponent
                events={getAllEventsForDate}
                onDateSelect={setSelectedDate}
                onEventClick={handleEventClick}
                compact={false}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
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
                            <Badge
                              variant={
                                event.status === 'completed' ? 'success' :
                                event.status === 'overdue' ? 'destructive' :
                                event.status === 'active' ? 'info' : 'default'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">
                              {event.date.toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    No events scheduled for the next 30 days
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
                      // Navigate to item
                      if ('huddleId' in item && item.huddleId) {
                        window.location.href = `/sequences/${item.sequenceId}`;
                      }
                    }}
                  >
                    <div className="text-sm font-medium text-red-900">{item.title}</div>
                    <div className="text-xs text-red-700">
                      Due: {'date' in item ? 
                        item.date.toLocaleDateString() : 
                        item.dueDate.toLocaleDateString()
                      }
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="text-sm font-medium text-gray-900">
                  {calendarData.events.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled Huddles</span>
                <span className="text-sm font-medium text-gray-900">
                  {calendarData.scheduledHuddles.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Upcoming Deadlines</span>
                <span className="text-sm font-medium text-gray-900">
                  {calendarData.deadlines.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue Items</span>
                <span className="text-sm font-medium text-red-600">
                  {overdueItems.length}
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
              
              {getAllEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getAllEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'flex items-center space-x-2 p-2 rounded-md border cursor-pointer hover:shadow-sm transition-shadow',
                        getEventTypeColor(event.type)
                      )}
                      onClick={() => handleEventClick(event)}
                    >
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </div>
      </div>
    </>
  );
};