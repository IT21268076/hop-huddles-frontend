// api/index.ts - API Client Export Configuration
import { MockApiClient } from './mockClient';
// import { ApiClient } from './client';

// Environment configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || 
                    import.meta.env.VITE_ENVIRONMENT === 'development';

// Export the appropriate client based on environment
// export const apiClient = USE_MOCK_API ? new MockApiClient() : new ApiClient();
export const apiClient = USE_MOCK_API ? new MockApiClient() : new MockApiClient(); // For now, using mock client for all environments

// Type exports for components
export type {
  User,
  UserAssignment,
  CreateUserRequest,
  CreateAssignmentRequest,
  Agency,
  Branch,
  Team
} from '../types';

// Export specific methods for easier imports
export const {
  // User Management
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUsersByAgency,
  
  // Assignment Management
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByUser,
  getAssignmentsByAgency,
  
  // Context Data
  getTeamsByAgency,
  getBranchesByAgency,
  
  // Agency Management
  createAgency,
  getAgencies,
  updateAgency,
  
  // Branch Management
  createBranch,
  getBranch,
  updateBranch,
  deleteBranch,
  
  // Team Management
  createTeam,
  getTeam,
  getTeamsByBranch,
  updateTeam,
  deleteTeam,
} = apiClient;

// Environment status helper
export const getApiInfo = () => ({
  isMockMode: USE_MOCK_API,
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development'
});

// Development helper to switch API modes
export const switchToMockMode = () => {
  if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    localStorage.setItem('FORCE_MOCK_API', 'true');
    window.location.reload();
  }
};

export const switchToRealMode = () => {
  if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    localStorage.removeItem('FORCE_MOCK_API');
    window.location.reload();
  }
};

// Export default client
export default apiClient;