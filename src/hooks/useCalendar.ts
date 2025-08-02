// hooks/useCalendar.ts
import { useState, useEffect, useCallback } from 'react';
import { useAsync } from './useAsync';
import { useApp } from '../contexts/AppContext';
import { useBranchContext } from '../contexts/BranchContext';
import { apiClient } from '../services/api';
import { CalendarEvent, ScheduledHuddle, UserDeadline } from '../types';

export interface CalendarData {
  events: CalendarEvent[];
  scheduledHuddles: ScheduledHuddle[];
  deadlines: UserDeadline[];
  loading: boolean;
  error: string | null;
}

export interface CalendarFilters {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  showCompleted?: boolean;
  branch?: string;
  role?: string;
  discipline?: string;
}

export interface UseCalendarReturn {
  calendarData: CalendarData;
  filters: CalendarFilters;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  setFilters: (filters: CalendarFilters) => void;
  refreshCalendar: () => Promise<void>;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getScheduledHuddlesForDate: (date: Date) => ScheduledHuddle[];
  getDeadlinesForDate: (date: Date) => UserDeadline[];
  hasEventsForDate: (date: Date) => boolean;
  getUpcomingEvents: (days?: number) => CalendarEvent[];
  getOverdueItems: () => (CalendarEvent | UserDeadline)[];
}

export const useCalendar = (): UseCalendarReturn => {
  const { currentUser, currentAssignment } = useApp();
  const { currentBranch } = useBranchContext();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({
    showCompleted: false,
    branch: currentBranch?.name,
    role: currentAssignment?.activeRole || currentAssignment?.role,
    discipline: currentAssignment?.discipline,
  });

  // Calculate date range for API calls
  const getDateRange = useCallback(() => {
    const now = new Date();
    const startDate = filters.startDate || new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = filters.endDate || new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [filters.startDate, filters.endDate]);

  // Fetch personalized calendar events
  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      
      try {
        // Use new personalized calendar API with branch filtering
        const personalizedFilters = {
          branch: filters.branch,
          role: (filters.role as any) || 'ALL',
          discipline: (filters.discipline as any) || 'ALL',
          eventType: filters.eventTypes?.join(','),
          showCompleted: filters.showCompleted,
        };
        
        const calendarEvents = await apiClient.getPersonalizedCalendarEvents(
          currentUser.userId,
          personalizedFilters
        );
        
        // Convert date strings to Date objects
        return calendarEvents.map(event => ({
          ...event,
          date: new Date(event.date),
        }));
      } catch (error) {
        console.warn('Personalized calendar not available, falling back to basic calendar:', error);
        
        // Fallback to basic calendar API
        const { startDate, endDate } = getDateRange();
        const calendarEvents = await apiClient.getCalendarEvents(
          currentUser.userId,
          startDate,
          endDate
        );
        
        return calendarEvents.map(event => ({
          ...event,
          date: new Date(event.date),
        }));
      }
    },
    [currentUser?.userId, filters, currentBranch?.branchId]
  );

  // Fetch scheduled huddles
  const {
    data: scheduledHuddles,
    loading: huddlesLoading,
    error: huddlesError,
    refetch: refetchHuddles,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      
      const huddles = await apiClient.getScheduledHuddles(currentUser.userId);
      
      // Convert date strings to Date objects
      return huddles.map(huddle => ({
        ...huddle,
        scheduledDate: new Date(huddle.scheduledDate),
        releaseDate: new Date(huddle.releaseDate),
      }));
    },
    [currentUser?.userId]
  );

  // Fetch user deadlines
  const {
    data: deadlines,
    loading: deadlinesLoading,
    error: deadlinesError,
    refetch: refetchDeadlines,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      
      const userDeadlines = await apiClient.getUserUpcomingDeadlines(currentUser.userId);
      
      // Convert date strings to Date objects
      return userDeadlines.map(deadline => ({
        ...deadline,
        dueDate: new Date(deadline.dueDate),
      }));
    },
    [currentUser?.userId]
  );

  // Combine and filter all data
  const calendarData: CalendarData = {
    events: events || [],
    scheduledHuddles: scheduledHuddles || [],
    deadlines: deadlines || [],
    loading: eventsLoading || huddlesLoading || deadlinesLoading,
    error: eventsError || huddlesError || deadlinesError,
  };

  // Filter events based on current filters
  const getFilteredEvents = useCallback((eventList: CalendarEvent[]) => {
    let filtered = eventList;

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => filters.eventTypes!.includes(event.type));
    }

    if (!filters.showCompleted) {
      filtered = filtered.filter(event => event.status !== 'completed');
    }

    return filtered;
  }, [filters]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const filtered = getFilteredEvents(calendarData.events);
    return filtered.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [calendarData.events, getFilteredEvents]);

  // Get scheduled huddles for a specific date
  const getScheduledHuddlesForDate = useCallback((date: Date): ScheduledHuddle[] => {
    return calendarData.scheduledHuddles.filter(huddle => {
      const huddleDate = new Date(huddle.scheduledDate);
      return huddleDate.toDateString() === date.toDateString();
    });
  }, [calendarData.scheduledHuddles]);

  // Get deadlines for a specific date
  const getDeadlinesForDate = useCallback((date: Date): UserDeadline[] => {
    return calendarData.deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.dueDate);
      return deadlineDate.toDateString() === date.toDateString();
    });
  }, [calendarData.deadlines]);

  // Check if date has any events
  const hasEventsForDate = useCallback((date: Date): boolean => {
    return (
      getEventsForDate(date).length > 0 ||
      getScheduledHuddlesForDate(date).length > 0 ||
      getDeadlinesForDate(date).length > 0
    );
  }, [getEventsForDate, getScheduledHuddlesForDate, getDeadlinesForDate]);

  // Get upcoming events within specified days
  const getUpcomingEvents = useCallback((days: number = 7): CalendarEvent[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const filtered = getFilteredEvents(calendarData.events);
    return filtered
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= futureDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [calendarData.events, getFilteredEvents]);

  // Get overdue items
  const getOverdueItems = useCallback((): (CalendarEvent | UserDeadline)[] => {
    const now = new Date();
    const overdueEvents = calendarData.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now && event.status !== 'completed';
    });

    const overdueDeadlines = calendarData.deadlines.filter(deadline => {
      const dueDate = new Date(deadline.dueDate);
      return dueDate < now && deadline.status !== 'completed';
    });

    return [...overdueEvents, ...overdueDeadlines]
      .sort((a, b) => {
        const dateA = 'date' in a ? new Date(a.date) : new Date(a.dueDate);
        const dateB = 'date' in b ? new Date(b.date) : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });
  }, [calendarData.events, calendarData.deadlines]);

  // Refresh all calendar data
  const refreshCalendar = useCallback(async () => {
    await Promise.all([
      refetchEvents(),
      refetchHuddles(),
      refetchDeadlines(),
    ]);
  }, [refetchEvents, refetchHuddles, refetchDeadlines]);

  return {
    calendarData,
    filters,
    selectedDate,
    setSelectedDate,
    setFilters,
    refreshCalendar,
    getEventsForDate,
    getScheduledHuddlesForDate,
    getDeadlinesForDate,
    hasEventsForDate,
    getUpcomingEvents,
    getOverdueItems,
  };
};