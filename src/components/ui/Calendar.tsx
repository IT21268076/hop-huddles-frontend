// components/ui/Calendar.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'huddle_release' | 'assessment_due' | 'sequence_start' | 'sequence_end';
  huddleId?: number;
  sequenceId?: number;
  sequenceTitle?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'overdue';
}

interface CalendarProps {
  events?: CalendarEvent[] | ((date: Date) => CalendarEvent[]);
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateSelect,
  onEventClick,
  compact = false,
  className,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's last days to fill the calendar
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create calendar grid
  const calendarDays: (Date | null)[] = [];

  // Add previous month's days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push(new Date(currentYear, currentMonth - 1, lastDayOfPrevMonth - i));
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  // Add next month's days to complete the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(new Date(currentYear, currentMonth + 1, day));
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    if (typeof events === 'function') {
      return events(date);
    }
    return (events || []).filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Format month/year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get event type styling
  const getEventTypeStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'huddle_release':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assessment_due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sequence_start':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sequence_end':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'huddle_release':
        return <BookOpen className="h-3 w-3" />;
      case 'assessment_due':
        return <Clock className="h-3 w-3" />;
      case 'sequence_start':
        return <CalendarIcon className="h-3 w-3" />;
      case 'sequence_end':
        return <CalendarIcon className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  return (
    <Card className={cn('w-full', className)} padding="sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          'font-semibold text-gray-900',
          compact ? 'text-sm' : 'text-base'
        )}>
          {formatMonthYear(currentDate)}
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className={cn(
              'text-center font-medium text-gray-500',
              compact ? 'text-xs py-1' : 'text-sm py-2'
            )}
          >
            {compact ? day.charAt(0) : day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} />;
          
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={index}
              className={cn(
                'relative cursor-pointer rounded-md text-center transition-colors',
                compact ? 'h-8 text-xs' : 'h-10 text-sm',
                isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-400',
                isToday(date) && 'bg-blue-50 text-blue-600 font-semibold',
                isSelected(date) && 'bg-blue-100 text-blue-900',
                !isSelected(date) && !isToday(date) && 'hover:bg-gray-100',
                hasEvents && 'font-medium'
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className={cn(
                'flex items-center justify-center',
                compact ? 'h-8' : 'h-10'
              )}>
                {date.getDate()}
              </div>
              
              {/* Event indicators */}
              {hasEvents && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={cn(
                        'w-1 h-1 rounded-full',
                        event.type === 'huddle_release' && 'bg-blue-500',
                        event.type === 'assessment_due' && 'bg-red-500',
                        event.type === 'sequence_start' && 'bg-green-500',
                        event.type === 'sequence_end' && 'bg-gray-500'
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Events for selected date */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </h4>
          
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-md border cursor-pointer hover:shadow-sm transition-shadow',
                    getEventTypeStyle(event.type)
                  )}
                  onClick={() => onEventClick?.(event)}
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {event.title}
                    </div>
                    {event.sequenceTitle && (
                      <div className="text-xs opacity-75 truncate">
                        {event.sequenceTitle}
                      </div>
                    )}
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
            </div>
          ) : (
            <p className="text-sm text-gray-500">No events scheduled</p>
          )}
        </div>
      )}
    </Card>
  );
};