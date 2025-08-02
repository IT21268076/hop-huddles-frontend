// components/management/EducatorBranchAssignmentManager.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MultiSelect } from '../ui/MultiSelect';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { apiClient, type EducatorBranchAssignment } from '../../services/api';
import { User, Branch, UserRole } from '../../types';
import { createSelectOptionsFromObjects } from '../../utils/selectUtils';

interface EducatorBranchAssignmentManagerProps {
  agencyId: number;
  onAssignmentChange?: () => void;
}

interface AssignmentRequest {
  userId: number;
  branchIds: number[];
  notes?: string;
}

export const EducatorBranchAssignmentManager: React.FC<EducatorBranchAssignmentManagerProps> = ({
  agencyId,
  onAssignmentChange,
}) => {
  const [assignments, setAssignments] = useState<EducatorBranchAssignment[]>([]);
  const [educators, setEducators] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEducator, setSelectedEducator] = useState<number | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [agencyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignmentsResponse, educatorsResponse, branchesResponse] = await Promise.all([
        apiClient.getEducatorBranchAssignments(agencyId),
        apiClient.getEducatorsByAgency(agencyId),
        apiClient.getBranchesByAgency(agencyId),
      ]);

      setAssignments(assignmentsResponse);
      setEducators(educatorsResponse);
      setBranches(branchesResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEducator = async () => {
    if (!selectedEducator || selectedBranches.length === 0) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await apiClient.assignEducatorToBranches({
        educatorId: selectedEducator,
        branchIds: selectedBranches,
        notes,
      });

      await loadData();
      setIsAssignModalOpen(false);
      resetForm();
      onAssignmentChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to assign educator to branches');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (userId: number, branchId: number) => {
    try {
      setError(null);
      await apiClient.removeEducatorFromBranch(userId, branchId);
      await loadData();
      onAssignmentChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to remove assignment');
    }
  };

  const resetForm = () => {
    setSelectedEducator(null);
    setSelectedBranches([]);
    setNotes('');
  };

  const getEducatorAssignments = (userId: number) => {
    return assignments.filter(assignment => assignment.educatorId === userId);
  };

  const getBranchAssignments = (branchId: number) => {
    return assignments.filter(assignment => assignment.branchId === branchId);
  };

  const getUnassignedEducators = () => {
    return educators.filter(educator => 
      educator.assignments.some(assignment => assignment.roles.includes('EDUCATOR' as UserRole))
    );
  };

  const getAvailableBranches = (educatorId: number) => {
    const assignedBranchIds = getEducatorAssignments(educatorId).map(assignment => assignment.branchId);
    return branches.filter(branch => !assignedBranchIds.includes(branch.branchId));
  };

  const branchOptions = branches.map(branch => ({
    value: branch.branchId.toString(),
    label: `${branch.name} (${branch.city}, ${branch.state})`,
  }));

  const educatorOptions = getUnassignedEducators().map(educator => ({
    value: educator.userId.toString(),
    label: `${educator.name} (${educator.email})`,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Educator Branch Assignments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage which branches each educator can access and create content for
          </p>
        </div>
        <Button onClick={() => setIsAssignModalOpen(true)}>
          Assign Educator to Branches
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <EmptyState
          title="No Educator Assignments"
          description="Educators need to be assigned to branches to create branch-specific content."
          actionLabel="Assign Educator"
          onAction={() => setIsAssignModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Educators View */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">By Educator</h3>
              <div className="space-y-4">
                {getUnassignedEducators().map(educator => {
                  const educatorAssignments = getEducatorAssignments(educator.userId);
                  return (
                    <div key={educator.userId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{educator.name}</h4>
                          <p className="text-sm text-gray-500">{educator.email}</p>
                        </div>
                        <Badge variant={educatorAssignments.length > 0 ? 'success' : 'secondary'}>
                          {educatorAssignments.length} branch{educatorAssignments.length !== 1 ? 'es' : ''}
                        </Badge>
                      </div>
                      
                      {educatorAssignments.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {educatorAssignments.map(assignment => (
                            <div key={assignment.assignmentId} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                              <div>
                                <span className="text-sm font-medium">{assignment.branchName}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAssignment(educator.userId, assignment.branchId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mt-2">No branch assignments</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Branches View */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">By Branch</h3>
              <div className="space-y-4">
                {branches.map(branch => {
                  const branchAssignments = getBranchAssignments(branch.branchId);
                  return (
                    <div key={branch.branchId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{branch.name}</h4>
                          <p className="text-sm text-gray-500">{branch.city}, {branch.state}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {branch.disciplines.map(discipline => (
                              <Badge key={discipline} variant="outline" className="text-xs">
                                {discipline}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant={branchAssignments.length > 0 ? 'success' : 'secondary'}>
                          {branchAssignments.length} educator{branchAssignments.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {branchAssignments.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {branchAssignments.map(assignment => (
                            <div key={assignment.assignmentId} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                              <div>
                                <span className="text-sm font-medium">{assignment.educatorName}</span>
                                <span className="text-xs text-gray-500 ml-2">Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAssignment(assignment.educatorId, branch.branchId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mt-2">No educator assignments</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          resetForm();
        }}
        title="Assign Educator to Branches"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Educator
            </label>
            <select
              value={selectedEducator || ''}
              onChange={(e) => {
                const userId = parseInt(e.target.value);
                setSelectedEducator(userId || null);
                setSelectedBranches([]); // Reset branch selection
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an educator</option>
              {educatorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedEducator && (
            <div>
              <MultiSelect
                label="Available Branches"
                options={getAvailableBranches(selectedEducator).map((branch, index) => ({
                  value: branch.branchId?.toString() || `branch-${index}`,
                  label: `${branch.name || 'Unknown Branch'} (${branch.city || ''}, ${branch.state || ''})`,
                }))}
                value={selectedBranches.map(id => id.toString())}
                onChange={(values) => setSelectedBranches(values.map(v => parseInt(v)))}
                placeholder="Select branches to assign"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignEducator}
              loading={isSubmitting}
              disabled={!selectedEducator || selectedBranches.length === 0}
            >
              Assign to Branches
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};