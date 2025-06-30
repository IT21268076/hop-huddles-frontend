import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';

// Page Components
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
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" /> : <LoginPage />
        }
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Agency Management */}
        <Route path="agencies" element={<AgencyManagement />} />
        
        {/* Branch Management */}
        <Route path="branches" element={<BranchManagement />} />
        
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
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
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