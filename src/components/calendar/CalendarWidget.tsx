// components/calendar/CalendarWidget.tsx
import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar as CalendarComponent } from '../ui/Calendar';
import { useCalendar } from '../../hooks/useCalendar';
import { cn } from '../../utils/helpers';
import { CalendarEvent, ScheduledHuddle, UserDeadline } from '../../types';

interface CalendarWidgetProps {
  className?: string;
  compact?: boolean;
  showUpcoming?: boolean;
  onEventClick?: (event: CalendarEvent | ScheduledHuddle | UserDeadline) => void;
  onViewAllClick?: () => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  className,
  compact = false,
  showUpcoming = true,
  onEventClick,
  onViewAllClick,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'upcoming'>('calendar');
  const {
    calendarData,
    selectedDate,
    setSelectedDate,
    getEventsForDate,
    getScheduledHuddlesForDate,
    getDeadlinesForDate,
    getUpcomingEvents,
    getOverdueItems,
  } = useCalendar();

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Find the original event data
    const originalEvent = calendarData.events.find(e => e.id === event.id);
    const originalHuddle = calendarData.scheduledHuddles.find(h => `huddle-${h.id}` === event.id);
    const originalDeadline = calendarData.deadlines.find(d => `deadline-${d.id}` === event.id);

    if (originalEvent) {
      onEventClick?.(originalEvent);
    } else if (originalHuddle) {
      onEventClick?.(originalHuddle);
    } else if (originalDeadline) {
      onEventClick?.(originalDeadline);
    }
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'huddle_release':
        return <BookOpen className="h-3 w-3" />;
      case 'assessment_due':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'huddle_release':
        return 'bg-blue-500';
      case 'assessment_due':
        return 'bg-red-500';
      case 'sequence_start':
        return 'bg-green-500';
      case 'sequence_end':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const upcomingEvents = getUpcomingEvents(7);
  const overdueItems = getOverdueItems();

  if (calendarData.loading) {
    return (
      <Card className={cn('w-full animate-pulse', className)} padding="sm">
        <div className="h-64 bg-gray-200 rounded" />
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)} padding="sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Calendar</h3>
        </div>
        
        {showUpcoming && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={cn(
                'h-6 px-2 text-xs',
                viewMode === 'calendar' && 'bg-gray-100'
              )}
            >
              Calendar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('upcoming')}
              className={cn(
                'h-6 px-2 text-xs',
                viewMode === 'upcoming' && 'bg-gray-100'
              )}
            >
              Upcoming
            </Button>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarComponent
          events={getAllEventsForDate}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          compact={compact}
        />
      )}

      {/* Upcoming Events View */}
      {viewMode === 'upcoming' && (
        <div className="space-y-4">
          {/* Overdue Items */}
          {overdueItems.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-red-600 mb-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue ({overdueItems.length})
              </h4>
              <div className="space-y-2">
                {overdueItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => onEventClick?.(item)}
                  >
                    <div className={cn('w-2 h-2 rounded-full', getEventTypeColor(
                      'date' in item ? item.type : item.type
                    ))} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-red-800 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-red-600">
                        Due: {'date' in item ? 
                          formatEventTime(new Date(item.date)) : 
                          formatEventTime(new Date(item.dueDate))
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Next 7 Days ({upcomingEvents.length})
            </h4>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center space-x-1">
                      {getEventIcon(event.type)}
                      <div className={cn('w-2 h-2 rounded-full', getEventTypeColor(event.type))} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {event.date.toLocaleDateString()} • {formatEventTime(event.date)}
                      </div>
                    </div>
                    {event.status && (
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
                    )}
                  </div>
                ))}
                
                {upcomingEvents.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewAllClick}
                    className="w-full text-xs"
                  >
                    View All ({upcomingEvents.length - 5} more)
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-4">
                No upcoming events
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {onViewAllClick && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllClick}
            className="w-full text-xs"
          >
            View Full Calendar
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};