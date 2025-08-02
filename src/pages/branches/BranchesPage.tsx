// pages/branches/BranchesPage.tsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PageHeader } from '../../components/layout/PageHeader';
import { BranchManagement } from '../agencies/BranchManagement';
import { DirectorBranchDashboard } from './DirectorBranchDashboard';

export const BranchesPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const permissions = usePermissions({
    userRole: currentAssignment?.activeRole || currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });

  const currentRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isDirector = currentRole === 'DIRECTOR';

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agency Selected</h2>
        <p className="text-gray-600">Please select an agency to manage branches.</p>
      </div>
    );
  }

  if (!permissions.canManageBranch && !permissions.canCreateAgencyBranches) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage branches.</p>
      </div>
    );
  }

  // Check if agency is not enterprise - single agencies don't need branch management
  if (currentAgency.subscriptionPlan !== 'ENTERPRISE') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Branch Management Not Available</h2>
        <p className="text-gray-600 mb-4">
          Your agency operates as a single entity and doesn't require branch management.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Current plan: {currentAgency.subscriptionPlan}
        </p>
        <p className="text-sm text-gray-500">
          To use branch management, please upgrade to an Enterprise subscription plan.
        </p>
      </div>
    );
  }

  // Director gets their own specialized dashboard
  if (isDirector && currentAssignment?.branchId) {
    return (
      <>
        <PageHeader
          title="My Branch"
          description={`Branch management dashboard for ${currentAssignment.branchName || 'your branch'}`}
        />
        
        <div className="space-y-6">
          <DirectorBranchDashboard branchId={currentAssignment.branchId} />
        </div>
      </>
    );
  }

  // Educators and Admins get the full branch management interface
  return (
    <>
      <PageHeader
        title="Branch Management"
        description={`Manage branches for ${currentAgency.name}`}
      />
      
      <div className="space-y-6">
        <BranchManagement agencyId={currentAgency.agencyId} />
      </div>
    </>
  );
};