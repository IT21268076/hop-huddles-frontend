// hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '../services/analyticsService';
import {
  AgencyAnalytics,
  BranchAnalytics,
  TeamAnalytics,
  UserPerformanceMetrics,
  AnalyticsFilters,
  AnalyticsTimeRange,
  ActivityEvent,
  DeadlineEvent,
  CompetencyTracking,
  PerformanceComparison,
  BaseAnalyticsMetrics,
} from '../types/analytics';

interface UseAnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  cacheHit: boolean;
}

interface UseAnalyticsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  filters?: AnalyticsFilters;
}

export const useAnalytics = <T>(
  fetcher: () => Promise<{ data: T; cacheHit: boolean }>,
  dependencies: any[] = [],
  options: UseAnalyticsOptions = {}
) => {
  const [state, setState] = useState<UseAnalyticsState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cacheHit: false,
  });

  const { enabled = true, refetchInterval, cacheTime = 300000 } = options; // 5 minutes default cache

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetcher();
      setState({
        data: result.data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        cacheHit: result.cacheHit,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
    }
  }, [enabled, fetcher]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const isStale = useCallback(() => {
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated.getTime() > cacheTime;
  }, [state.lastUpdated, cacheTime]);

  useEffect(() => {
    if (enabled && (!state.data || isStale())) {
      fetchData();
    }
  }, [enabled, fetchData, isStale, ...dependencies]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        if (isStale()) {
          fetchData();
        }
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData, isStale]);

  return {
    ...state,
    refetch,
    isStale: isStale(),
  };
};

// Specific hooks for different analytics types
export const useAgencyAnalytics = (
  agencyId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getAgencyAnalytics(agencyId, filters),
    [agencyId, filters],
    options
  );
};

export const useBranchAnalytics = (
  branchId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getBranchAnalytics(branchId, filters),
    [branchId, filters],
    options
  );
};

export const useTeamAnalytics = (
  teamId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getTeamAnalytics(teamId, filters),
    [teamId, filters],
    options
  );
};

export const useUserAnalytics = (
  userId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getUserAnalytics(userId, filters),
    [userId, filters],
    options
  );
};

export const useActivityFeed = (
  scope: 'agency' | 'branch' | 'team' | 'user',
  entityId: number,
  limit: number = 50,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getActivityFeed(scope, entityId, limit),
    [scope, entityId, limit],
    options
  );
};

export const useUpcomingDeadlines = (
  scope: 'agency' | 'branch' | 'team' | 'user',
  entityId: number,
  daysAhead: number = 30,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getUpcomingDeadlines(scope, entityId, daysAhead),
    [scope, entityId, daysAhead],
    options
  );
};

export const useCompetencyTracking = (
  scope: 'agency' | 'branch' | 'team' | 'user',
  entityId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getCompetencyTracking(scope, entityId),
    [scope, entityId],
    options
  );
};

export const usePerformanceComparison = (
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  currentPeriod: AnalyticsTimeRange,
  comparisonPeriod: AnalyticsTimeRange,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getPerformanceComparison(scope, entityId, currentPeriod, comparisonPeriod),
    [scope, entityId, currentPeriod, comparisonPeriod],
    options
  );
};

export const useRealTimeMetrics = (
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getRealTimeMetrics(scope, entityId),
    [scope, entityId],
    { ...options, refetchInterval: 30000 } // 30 seconds for real-time data
  );
};

export const useAnalyticsInsights = (
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getAnalyticsInsights(scope, entityId, filters),
    [scope, entityId, filters],
    options
  );
};

export const useSequencePerformance = (
  sequenceId: number,
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getSequencePerformance(sequenceId, scope, entityId),
    [sequenceId, scope, entityId],
    options
  );
};

export const useAssessmentPerformance = (
  assessmentId: number,
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getAssessmentPerformance(assessmentId, scope, entityId),
    [assessmentId, scope, entityId],
    options
  );
};

export const useLearningPathAnalytics = (
  userId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getLearningPathAnalytics(userId),
    [userId],
    options
  );
};

export const useEngagementAnalytics = (
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getEngagementAnalytics(scope, entityId, filters),
    [scope, entityId, filters],
    options
  );
};

export const useComplianceAnalytics = (
  scope: 'agency' | 'branch' | 'team',
  entityId: number,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getComplianceAnalytics(scope, entityId),
    [scope, entityId],
    options
  );
};

export const useBulkAnalytics = (
  scope: 'branches' | 'teams' | 'users',
  entityIds: number[],
  filters?: AnalyticsFilters,
  options?: UseAnalyticsOptions
) => {
  return useAnalytics(
    () => AnalyticsService.getBulkAnalytics(scope, entityIds, filters),
    [scope, entityIds, filters],
    options
  );
};

// Helper hook for analytics export
export const useAnalyticsExport = () => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  const exportAnalytics = useCallback(async (
    scope: 'agency' | 'branch' | 'team' | 'user',
    entityId: number,
    options: any,
    filters?: AnalyticsFilters
  ) => {
    setExporting(true);
    setExportError(null);

    try {
      const result = await AnalyticsService.exportAnalyticsReport(scope, entityId, options, filters);
      
      if (result.data.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = `analytics-report-${result.data.reportId}.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return result.data;
    } catch (error) {
      setExportError(error instanceof Error ? error : new Error('Export failed'));
      throw error;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportAnalytics,
    exporting,
    exportError,
  };
};

// Helper hook for time range management
export const useAnalyticsTimeRange = (initialPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  const [period, setPeriod] = useState(initialPeriod);
  const [customRange, setCustomRange] = useState<AnalyticsTimeRange | null>(null);

  const timeRange = customRange || AnalyticsService.createTimeRange(period);

  const setPeriodAndClearCustom = useCallback((newPeriod: typeof period) => {
    setPeriod(newPeriod);
    setCustomRange(null);
  }, []);

  const setCustomTimeRange = useCallback((range: AnalyticsTimeRange) => {
    setCustomRange(range);
  }, []);

  const resetToDefault = useCallback(() => {
    setPeriod('monthly');
    setCustomRange(null);
  }, []);

  return {
    period,
    timeRange,
    isCustomRange: customRange !== null,
    setPeriod: setPeriodAndClearCustom,
    setCustomRange: setCustomTimeRange,
    reset: resetToDefault,
    label: AnalyticsService.getTimeRangeLabel(timeRange),
  };
};

// Helper hook for analytics filters
export const useAnalyticsFilters = (initialFilters?: AnalyticsFilters) => {
  const [filters, setFilters] = useState<AnalyticsFilters>(
    initialFilters || AnalyticsService.getDefaultFilters()
  );

  const updateFilter = useCallback((key: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(AnalyticsService.getDefaultFilters());
  }, []);

  const clearFilter = useCallback((key: keyof AnalyticsFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
    setFilters,
  };
};