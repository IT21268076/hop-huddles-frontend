// src/pages/Branch/LeaderAssignmentModal.tsx
import React from 'react';
import { X, User, Shield } from 'lucide-react';
import type { Branch, User as UserType } from '../../types';

interface LeaderAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: number) => void;
  branch: Branch | null;
  availableUsers: UserType[];
  isLoading: boolean;
}

const LeaderAssignmentModal: React.FC<LeaderAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  branch,
  availableUsers,
  isLoading
}) => {
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Branch Director
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Select a user with Director role to lead <strong>{branch.name}</strong>
            </p>

            {availableUsers.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => onAssign(user.userId)}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <User className="h-8 w-8 text-gray-400" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex space-x-2 mt-1">
                        {user.assignments.map((assignment, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                          >
                            {assignment.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Directors Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create users with Director role first to assign as branch leaders.
                </p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderAssignmentModal;