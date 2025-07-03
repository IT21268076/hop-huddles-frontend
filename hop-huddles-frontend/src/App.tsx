// App.tsx - Final integrated version with all new components and role-based routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useActiveRole } from './hooks/useActiveRole';
import { hasPermission, PERMISSIONS } from './utils/permissions';

// Layout Components
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';

// Main Platform Components
import MainPlatformHomepage from './pages/MainPlatform/Homepage';
import HuddlesDashboard from './pages/HOP/HuddlesDashboard';
import EnhancedAgencyCreationWizard from './pages/Agency/AgencyCreationWizard';

// Management Page Components
import Dashboard from './pages/Dashboard/Dashboard';
import AgencyManagement from './pages/Agency/AgencyManagement';
import BranchManagement from './pages/Branch/BranchManagement';
import TeamManagement from './pages/Team/TeamManagement';
import UserManagement from './pages/User/UserManagement';
import SequenceManagement from './pages/Sequence/SequenceManager';
import SequenceCreate from './pages/Sequence/SequenceCreate';
import ProgressManagement from './pages/Progress/ProgressManagement';
import PersonalizationSettings from './pages/Settings/PersonalizationSettings';

// NEW: Assessment Components
import AssessmentManagement from './pages/Assessment/AssessmentManagement';
import AssessmentCreate from './pages/Assessment/AssessmentCreate';

// NEW: Field Clinician Components
import MyHuddles from './pages/Huddle/MyHuddles';
import MyProgress from './pages/Progress/MyProgress';
import MyAssessments from './pages/Assessment/MyAssessments';

// Detail Page Components
import { HuddleDetail } from './pages/PlaceholderPages';
import SequenceDetailsPage from './pages/Sequence/SequenceDetailsPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced Protected Route Component with Role-Based Access
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string[];
  fallbackPath?: string;
  showFallback?: boolean;
}

function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallbackPath = '/main-platform',
  showFallback = true
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const { activeRole, capabilities } = useActiveRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (requiredRole && activeRole && !requiredRole.includes(activeRole)) {
    if (showFallback) {
      return <Navigate to={fallbackPath} />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Your current role doesn't have access to this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:text-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && user) {
    const hasAccess = hasPermission(user.assignments, requiredPermission);
    if (!hasAccess) {
      if (showFallback) {
        return <Navigate to={fallbackPath} />;
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Role-Specific Route Wrappers
const EducatorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['EDUCATOR']}>
    {children}
  </ProtectedRoute>
);

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['EDUCATOR', 'ADMIN']}>
    {children}
  </ProtectedRoute>
);

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['EDUCATOR', 'ADMIN', 'DIRECTOR', 'CLINICAL_MANAGER']}>
    {children}
  </ProtectedRoute>
);

const ClinicianRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['FIELD_CLINICIAN']}>
    {children}
  </ProtectedRoute>
);

const HuddleAccessRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.HUDDLE_VIEW}>
    {children}
  </ProtectedRoute>
);

// App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/main-platform" /> : <LoginPage />
        }
      />
      
      {/* Main Platform Homepage - Entry point after login */}
      <Route
        path="/main-platform"
        element={
          <ProtectedRoute>
            <MainPlatformHomepage />
          </ProtectedRoute>
        }
      />

      {/* Agency Creation Wizard - Only for users without agency */}
      <Route
        path="/agency-wizard"
        element={
          <ProtectedRoute>
            <EnhancedAgencyCreationWizard />
          </ProtectedRoute>
        }
      />

      {/* HOP Huddles Platform - Requires huddle view permission */}
      <Route
        path="/hop-huddles-dashboard"
        element={
          <HuddleAccessRoute>
            <HuddlesDashboard />
          </HuddleAccessRoute>
        }
      />

      {/* Individual Sequence Detail - Accessible outside layout */}
      <Route
        path="/sequences/:sequenceId"
        element={
          <HuddleAccessRoute>
            <SequenceDetailsPage />
          </HuddleAccessRoute>
        }
      />

      {/* Field Clinician Routes - Outside Layout for focused learning experience */}
      <Route
        path="/my-huddles"
        element={
          <ClinicianRoute>
            <MyHuddles />
          </ClinicianRoute>
        }
      />

      <Route
        path="/my-progress"
        element={
          <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_OWN}>
            <MyProgress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-assessments"
        element={
          <ClinicianRoute>
            <MyAssessments />
          </ClinicianRoute>
        }
      />

      {/* Management Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Root redirect to main platform */}
        <Route index element={<Navigate to="/main-platform" />} />
        
        {/* Legacy dashboard route */}
        <Route path="dashboard" element={<Navigate to="/main-platform" />} />
        <Route path="hud-dash" element={<Dashboard />} />
        
        {/* Agency Management - Admin/Educator only */}
        <Route 
          path="agencies" 
          element={
            <AdminRoute>
              <EnhancedAgencyCreationWizard />
            </AdminRoute>
          } 
        />
        <Route 
          path="agency" 
          element={
            <AdminRoute>
              <AgencyManagement />
            </AdminRoute>
          } 
        />
        
        {/* Branch Management - Manager level and above */}
        <Route 
          path="branches" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.BRANCH_VIEW}>
              <BranchManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Team Management - Manager level and above */}
        <Route 
          path="teams" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TEAM_VIEW}>
              <TeamManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* User Management - Manager level and above */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Sequence Management - Huddle access required */}
        <Route 
          path="sequences" 
          element={
            <HuddleAccessRoute>
              <SequenceManagement />
            </HuddleAccessRoute>
          } 
        />
        <Route 
          path="sequences/create" 
          element={
            <EducatorRoute>
              <SequenceCreate />
            </EducatorRoute>
          } 
        />
        <Route 
          path="sequences/:sequenceId/details" 
          element={
            <HuddleAccessRoute>
              <SequenceDetailsPage />
            </HuddleAccessRoute>
          } 
        />

        {/* NEW: Assessment Management Routes - Educator only */}
        <Route 
          path="assessments" 
          element={
            <EducatorRoute>
              <AssessmentManagement />
            </EducatorRoute>
          } 
        />
        <Route 
          path="assessments/create" 
          element={
            <EducatorRoute>
              <AssessmentCreate />
            </EducatorRoute>
          } 
        />
        <Route 
          path="assessments/:assessmentId/edit" 
          element={
            <EducatorRoute>
              <AssessmentCreate />
            </EducatorRoute>
          } 
        />
        <Route 
          path="assessments/:assessmentId/results" 
          element={
            <EducatorRoute>
              <AssessmentManagement />
            </EducatorRoute>
          } 
        />
        
        {/* Huddle Detail - Huddle access required */}
        <Route 
          path="huddles/:huddleId" 
          element={
            <HuddleAccessRoute>
              <HuddleDetail />
            </HuddleAccessRoute>
          } 
        />
        
        {/* Progress Management - Based on role capabilities */}
        <Route 
          path="progress" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_OWN}>
              <ProgressManagement />
            </ProtectedRoute>
          } 
        />

        {/* Individual Progress Views */}
        <Route 
          path="progress/user/:userId" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_TEAM}>
              <ProgressManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="analytics/agency" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_AGENCY}>
              <ProgressManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="analytics/branch/:branchId" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_BRANCH}>
              <ProgressManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="analytics/team/:teamId" 
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROGRESS_VIEW_TEAM}>
              <ProgressManagement />
            </ProtectedRoute>
          } 
        />

        {/* Settings - Always accessible */}
        <Route path="settings" element={<PersonalizationSettings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/main-platform" />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3B82F6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;