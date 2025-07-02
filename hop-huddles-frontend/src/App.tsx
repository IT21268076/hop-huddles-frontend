// App.tsx - Updated with new educator workflow routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';

// New Main Platform Components
import MainPlatformHomepage from './pages/MainPlatform/Homepage';
import HuddlesDashboard from './pages/HOP/HuddlesDashboard';
import EnhancedAgencyCreationWizard from './pages/Agency/AgencyCreationWizard';

// Existing Page Components
import Dashboard from './pages/Dashboard/Dashboard';
import AgencyManagement from './pages/Agency/AgencyManagement';
import BranchManagement from './pages/Branch/BranchManagement';
import TeamManagement from './pages/Team/TeamManagement';
import UserManagement from './pages/User/UserManagement';
import SequenceManagement from './pages/Sequence/SequenceManager';
import SequenceCreate from './pages/Sequence/SequenceCreate';
import ProgressManagement from './pages/Progress/ProgressManagement';
import { HuddleDetail } from './pages/PlaceholderPages';
import { SequenceDetail } from './pages/PlaceholderPages';
import AgencyCreationWizard from './pages/Agency/AgencyCreationWizard';
import EnhancedBranchManagement from './pages/Branch/BranchManagement';
import PersonalizationSettings from './pages/Settings/PersonalizationSettings';
import HuddleVisibilityManager from './components/Huddle/HuddleVisibilityManager';
import SequenceDetailPage from './pages/Sequence/SequenceDetailsPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

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

  return <>{children}</>;
}

// App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/main-platform" /> : <LoginPage />
        }
      />
      
      {/* Main Platform Homepage (NEW) - This is the main entry point after login */}
      <Route
        path="/main-platform"
        element={
          <ProtectedRoute>
            <MainPlatformHomepage />
          </ProtectedRoute>
        }
      />

      {/* Agency Creation Wizard (ENHANCED) - Used when agency setup is needed */}
      <Route
        path="/agency-wizard"
        element={
          <ProtectedRoute>
            <EnhancedAgencyCreationWizard />
          </ProtectedRoute>
        }
      />

      {/* HOP Huddles Dashboard (NEW) - The main huddles platform */}
      <Route
        path="/hop-huddles-dashboard"
        element={
          <ProtectedRoute>
            <HuddlesDashboard />
          </ProtectedRoute>
        }
      />

      {/* Sequence Detail Page - NEW ROUTE */}
      <Route
        path="/sequences/:sequenceId"
        element={
          <ProtectedRoute>
            <SequenceDetailPage />
          </ProtectedRoute>
        }
      />
      
      {/* Traditional Dashboard Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirect root to main platform */}
        <Route index element={<Navigate to="/main-platform" />} />
        
        {/* Legacy dashboard route - now redirects to main platform */}
        <Route path="dashboard" element={<Navigate to="/main-platform" />} />

        <Route path="hud-dash" element={<Dashboard/>} />
        
        {/* Agency Management - Keep existing for backward compatibility */}
        <Route path="agencies" element={<AgencyCreationWizard />} />

        <Route path="agency" element={<AgencyManagement />} />
        
        {/* Branch Management */}
        <Route path="branches" element={<EnhancedBranchManagement />} />
        
        {/* Team Management */}
        <Route path="teams" element={<TeamManagement />} />
        
        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
        
        {/* Sequence Management */}
        <Route path="sequences" element={<SequenceManagement />} />
        <Route path="sequences/create" element={<SequenceCreate />} />
        <Route path="sequences/:sequenceId" element={<SequenceDetail />} />
        
        {/* Huddle Management */}
        <Route path="huddles/:huddleId" element={<HuddleDetail />} />
        
        {/* Progress Management */}
        <Route path="progress" element={<ProgressManagement />} />

        {/* Settings */}
        <Route path="settings" element={<PersonalizationSettings />} />
        <Route path="settings/personalization" element={<PersonalizationSettings />} />

        {/* Future HOP Platform Routes (Coming Soon) */}
        <Route path="hop-care-dashboard" element={<ComingSoonPage platform="HOP Care" />} />
        <Route path="hop-analytics-dashboard" element={<ComingSoonPage platform="HOP Analytics" />} />
        <Route path="hop-compliance-dashboard" element={<ComingSoonPage platform="HOP Compliance" />} />
        <Route path="hop-connect-dashboard" element={<ComingSoonPage platform="HOP Connect" />} />
        <Route path="hop-wellness-dashboard" element={<ComingSoonPage platform="HOP Wellness" />} />
      </Route>
      
      {/* Catch all route - redirect to main platform */}
      <Route path="*" element={<Navigate to="/main-platform" />} />
    </Routes>
  );
}

// Coming Soon Page Component for future platforms
function ComingSoonPage({ platform }: { platform: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🚀</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {platform} Coming Soon!
        </h1>
        
        <p className="text-gray-600 mb-8">
          We're working hard to bring you this amazing platform. Stay tuned for updates!
        </p>
        
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
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
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
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