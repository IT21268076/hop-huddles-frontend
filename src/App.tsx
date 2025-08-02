// App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0ProviderWithConfig } from './contexts/Auth0Context';
import { AppProvider } from './contexts/AppContext';
import { BranchProvider } from './contexts/BranchContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { SuperAdminGuard } from './components/auth/SuperAdminGuard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageErrorBoundary } from './components/common/PageErrorBoundary';
import { FirstTimeUserFlow } from './components/auth/FirstTimeUserFlow';
import { PageLoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load page components for better performance
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AgenciesPage = React.lazy(() => import('./pages/agencies/AgenciesPage').then(m => ({ default: m.AgenciesPage })));
const UsersPage = React.lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const SequencesPage = React.lazy(() => import('./pages/sequences/SequencesPage').then(m => ({ default: m.SequencesPage })));
const BranchSequenceCreator = React.lazy(() => import('./pages/sequences/BranchSequenceCreator').then(m => ({ default: m.BranchSequenceCreator })));
const SequenceDetailPage = React.lazy(() => import('./pages/sequences/SequenceDetailPage').then(m => ({ default: m.SequenceDetailPage })));
const SequencePreviewPage = React.lazy(() => import('./pages/sequences/SequencePreviewPage').then(m => ({ default: m.SequencePreviewPage })));
const HuddleListPage = React.lazy(() => import('./pages/sequences/HuddleListPage').then(m => ({ default: m.HuddleListPage })));
const MyHuddlesPage = React.lazy(() => import('./pages/my-huddles/BranchBasedMyHuddles').then(m => ({ default: m.BranchBasedMyHuddles })));
const ProgressPage = React.lazy(() => import('./pages/progress/ProgressPage').then(m => ({ default: m.ProgressPage })));
const SchedulingPage = React.lazy(() => import('./pages/scheduling/SchedulingPage').then(m => ({ default: m.SchedulingPage })));
const AnalyticsPage = React.lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const BranchAnalyticsPage = React.lazy(() => import('./pages/analytics/BranchAnalyticsPage').then(m => ({ default: m.BranchAnalyticsPage })));
const TeamAnalyticsPage = React.lazy(() => import('./pages/analytics/TeamAnalyticsPage').then(m => ({ default: m.TeamAnalyticsPage })));
const BranchesPage = React.lazy(() => import('./pages/branches/BranchesPage').then(m => ({ default: m.BranchesPage })));
const TeamsPage = React.lazy(() => import('./pages/teams/TeamsPage').then(m => ({ default: m.TeamsPage })));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AssessmentsPage = React.lazy(() => import('./pages/assessments/AssessmentsPage').then(m => ({ default: m.AssessmentsPage })));
const CalendarPage = React.lazy(() => import('./pages/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
// const SuperAdminDashboard = React.lazy(() => import('./pages/superadmin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
const PlatformHomepage = React.lazy(() => import('./pages/platform/PlatformHomepage').then(m => ({ default: m.PlatformHomepage })));
const AgencyRegistrationWizard = React.lazy(() => import('./pages/auth/AgencyRegistrationWizard').then(m => ({ default: m.AgencyRegistrationWizard })));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppProvider>
            <BranchProvider>
              <Auth0ProviderWithConfig>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <FirstTimeUserFlow>
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Routes>
                <Route path="/" element={<AuthGuard><PlatformHomepage /></AuthGuard>} />
                <Route path="/platform" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<AuthGuard><Layout><PageErrorBoundary><DashboardPage /></PageErrorBoundary></Layout></AuthGuard>} />
                
                {/* Agency Registration */}
                <Route path="/agency-setup" element={<AuthGuard><AgencyRegistrationWizard /></AuthGuard>} />
                
                {/* Invitation Acceptance */}
                <Route path="/invitation/accept/:token" element={<AuthGuard><AgencyRegistrationWizard /></AuthGuard>} />
              
              {/* Agency Management */}
              <Route path="/agencies" element={<AuthGuard><Layout><AgenciesPage /></Layout></AuthGuard>} />
              
              {/* User Management */}
              <Route path="/users" element={<AuthGuard><Layout><PageErrorBoundary><UsersPage /></PageErrorBoundary></Layout></AuthGuard>} />
              
              {/* Huddle Sequences */}
              <Route path="/sequences" element={<AuthGuard><Layout><PageErrorBoundary><SequencesPage /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/sequences/new" element={<AuthGuard><Layout><PageErrorBoundary><BranchSequenceCreator /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/sequences/:sequenceId" element={<AuthGuard><Layout><PageErrorBoundary><SequenceDetailPage /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/sequences/:sequenceId/preview" element={<AuthGuard><Layout><PageErrorBoundary><SequencePreviewPage /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/sequences/:sequenceId/learn" element={<AuthGuard><Layout><PageErrorBoundary><HuddleListPage /></PageErrorBoundary></Layout></AuthGuard>} />
              
              {/* Learning Experience */}
              <Route path="/my-huddles" element={<AuthGuard><Layout><MyHuddlesPage /></Layout></AuthGuard>} />
              
              {/* Progress & Analytics */}
              <Route path="/progress" element={<AuthGuard><Layout><ProgressPage /></Layout></AuthGuard>} />
              <Route path="/analytics" element={<AuthGuard><Layout><AnalyticsPage /></Layout></AuthGuard>} />
              <Route path="/analytics/branch" element={<AuthGuard><Layout><PageErrorBoundary><BranchAnalyticsPage /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/analytics/team" element={<AuthGuard><Layout><PageErrorBoundary><TeamAnalyticsPage /></PageErrorBoundary></Layout></AuthGuard>} />
              
              {/* Branch & Team Management */}
              <Route path="/branches" element={<AuthGuard><Layout><PageErrorBoundary><BranchesPage /></PageErrorBoundary></Layout></AuthGuard>} />
              <Route path="/teams" element={<AuthGuard><Layout><PageErrorBoundary><TeamsPage /></PageErrorBoundary></Layout></AuthGuard>} />
              
              {/* Assessments */}
              <Route path="/assessments" element={<AuthGuard><Layout><AssessmentsPage /></Layout></AuthGuard>} />
              
              {/* Scheduling */}
              <Route path="/scheduling" element={<AuthGuard><Layout><SchedulingPage /></Layout></AuthGuard>} />
              
              {/* Calendar */}
              <Route path="/calendar" element={<AuthGuard><Layout><CalendarPage /></Layout></AuthGuard>} />
              
              {/* Settings */}
              <Route path="/settings" element={<AuthGuard><Layout><SettingsPage /></Layout></AuthGuard>} />
              
              {/* SuperAdmin */}
              <Route path="/superadmin" element={
                <AuthGuard>
                  <SuperAdminGuard>
                    <Layout>
                      <SuperAdminDashboard />
                    </Layout>
                  </SuperAdminGuard>
                </AuthGuard>
              } />
              
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </FirstTimeUserFlow>
            </Router>
              </Auth0ProviderWithConfig>
            </BranchProvider>
          </AppProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
