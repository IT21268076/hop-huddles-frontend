// components/Debug/PermissionDebugger.tsx - For testing and debugging permissions
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS, debugUserPermissions, getUserEffectivePermissions } from '../../utils/permissions';

const PermissionDebugger: React.FC = () => {
  const { user, currentAgency } = useAuth();
  const [selectedPermission, setSelectedPermission] = useState<string>('');
  const [testContext, setTestContext] = useState({
    agencyId: currentAgency?.agencyId || undefined,
    branchId: undefined as number | undefined,
    teamId: undefined as number | undefined,
  });

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">No user logged in</p>
      </div>
    );
  }

  const testPermission = () => {
    if (!selectedPermission) return;
    
    console.log('=== Manual Permission Test ===');
    const result = hasPermission(user.assignments, selectedPermission, testContext);
    console.log('Permission:', selectedPermission);
    console.log('Context:', testContext);
    console.log('Result:', result);
    return result;
  };

  const allPermissions = Object.values(PERMISSIONS);
  const effectivePermissions = getUserEffectivePermissions(user.assignments);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Permission System Debugger</h2>
        
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Current User</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Assignments:</strong> {user.assignments.length}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Current Agency</h3>
            <p><strong>Name:</strong> {currentAgency?.name || 'None'}</p>
            <p><strong>ID:</strong> {currentAgency?.agencyId || 'None'}</p>
            <p><strong>Structure:</strong> {currentAgency?.agencyStructure || 'None'}</p>
          </div>
        </div>

        {/* User Assignments */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">User Assignments</h3>
          <div className="space-y-2">
            {user.assignments.map((assignment, index) => (
              <div key={assignment.assignmentId} className="bg-blue-50 p-3 rounded border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Assignment {index + 1}</strong></div>
                  <div>Role: {assignment.role}</div>
                  <div>Roles: [{assignment.roles?.join(', ') || 'None'}]</div>
                  <div>Scope: {assignment.accessScope}</div>
                  <div>Agency: {assignment.agencyId}</div>
                  <div>Branch: {assignment.branchId || 'None'}</div>
                  <div>Team: {assignment.teamId || 'None'}</div>
                  <div>Leader: {assignment.isLeader ? 'Yes' : 'No'}</div>
                  <div>Disciplines: [{assignment.disciplines?.join(', ') || 'None'}]</div>
                  <div>Primary: {assignment.isPrimary ? 'Yes' : 'No'}</div>
                  <div>Active: {assignment.isActive ? 'Yes' : 'No'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Tester */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Permission Tester</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Permission</label>
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Choose a permission...</option>
                {allPermissions.map(permission => (
                  <option key={permission} value={permission}>{permission}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Context Agency ID</label>
                <input
                  type="number"
                  value={testContext.agencyId || ''}
                  onChange={(e) => setTestContext(prev => ({ 
                    ...prev, 
                    agencyId: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Agency ID"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Branch ID</label>
                  <input
                    type="number"
                    value={testContext.branchId || ''}
                    onChange={(e) => setTestContext(prev => ({ 
                      ...prev, 
                      branchId: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Branch ID"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Team ID</label>
                  <input
                    type="number"
                    value={testContext.teamId || ''}
                    onChange={(e) => setTestContext(prev => ({ 
                      ...prev, 
                      teamId: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Team ID"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {selectedPermission && (
            <div className="mt-4">
              <button
                onClick={testPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Permission
              </button>
              
              <div className="mt-2 p-3 bg-gray-100 rounded">
                <strong>Result: </strong>
                <span className={testPermission() ? 'text-green-600' : 'text-red-600'}>
                  {testPermission() ? '✓ ALLOWED' : '✗ DENIED'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Effective Permissions */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Effective Permissions</h3>
          <div className="bg-green-50 p-4 rounded max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {effectivePermissions.map((permission, index) => (
                <div key={index} className="text-sm">
                  <span className="text-green-700">{permission.action}</span>
                  {permission.scope && (
                    <span className="text-gray-500 ml-1">({permission.scope})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => debugUserPermissions(user.assignments)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Debug to Console
          </button>
          
          <button
            onClick={() => console.log('User Object:', user)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Log User Object
          </button>
          
          <button
            onClick={() => console.log('Agency Object:', currentAgency)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Log Agency Object
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDebugger;