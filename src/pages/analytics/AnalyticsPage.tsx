// pages/analytics/AnalyticsPage.tsx
import React, { useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp} from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { usePermissions } from '../../hooks/usePermissions';
import { apiClient } from '../../services/api';
import { AdvancedAnalyticsDashboard } from '../../components/analytics/AdvancedAnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const permissions = usePermissions({
    userRole: currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const {
    data: analytics,
    loading,
    refetch,
  } = useAsync(
    async () => {
      if (!currentAgency || !permissions.canViewAgencyAnalytics) return null;
      
      try {
        // Try to get platform analytics (enhanced data)
        return await apiClient.getPlatformAnalytics(currentAgency.agencyId);
      } catch (error) {
        console.warn('Platform analytics not available, falling back to basic analytics:', error);
        // Fallback to basic analytics
        return await apiClient.getAgencyAnalytics(currentAgency.agencyId);
      }
    },
    [currentAgency?.agencyId, permissions.canViewAgencyAnalytics, selectedPeriod]
  );

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    refetch();
  };

  const handleExport = () => {
    // Generate CSV/PDF export
    const csvData = generateAnalyticsCSV(analytics);
    downloadFile(csvData, `analytics-${currentAgency?.name}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const generateAnalyticsCSV = (data: any) => {
    if (!data?.metrics) return '';
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Users', data.metrics.totalUsers],
      ['Active Users', data.metrics.activeUsers],
      ['Completion Rate (%)', data.metrics.completionRate?.toFixed(2) || '0'],
      ['Total Views', data.metrics.totalViews],
      ['Total Downloads', data.metrics.totalDownloads],
      ['Total Assessments', data.metrics.totalAssessments],
      ['Completed Sequences', data.metrics.completedSequences],
      ['In Progress Sequences', data.metrics.inProgressSequences],
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!permissions.canViewAgencyAnalytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to view analytics.
        </p>
      </div>
    );
  }

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to view analytics.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Advanced insights and performance metrics for ${currentAgency.name}`}
        action={{
          label: 'Export Report',
          onClick: handleExport,
          icon: <Download className="h-4 w-4" />,
        }}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <AdvancedAnalyticsDashboard
          analytics={analytics}
          onExport={handleExport}
          onPeriodChange={handlePeriodChange}
        />
      )}
    </>
  );
};
