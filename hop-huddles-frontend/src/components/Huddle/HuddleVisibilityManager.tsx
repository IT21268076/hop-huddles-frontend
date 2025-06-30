// components/Huddle/HuddleVisibilityManager.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  Calendar, 
  Users, 
  Shield, 
  Play,
  Pause,
  Settings
} from 'lucide-react';
import type { 
  HuddleSequence, 
  SequenceTarget, 
  UserAssignment,
  DeliverySchedule 
} from '../../types';
import { canAccessHuddle } from '../../utils/permissions';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface HuddleVisibilityManagerProps {
  sequence: HuddleSequence;
  onUpdateTargets: (targets: SequenceTarget[]) => void;
  onUpdateSchedule: (schedule: DeliverySchedule) => void;
}

interface VisibilityRule {
  id: string;
  name: string;
  targetType: 'DISCIPLINE' | 'ROLE' | 'BRANCH' | 'TEAM' | 'CUSTOM';
  targetValues: string[];
  conditions?: {
    minExperience?: number;
    requiredCertifications?: string[];
    excludeRoles?: string[];
  };
  isActive: boolean;
}

const HuddleVisibilityManager: React.FC<HuddleVisibilityManagerProps> = ({
  sequence,
  onUpdateTargets,
  onUpdateSchedule
}) => {
  const { currentAgency, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'targeting' | 'scheduling' | 'preview'>('targeting');
  const [visibilityRules, setVisibilityRules] = useState<VisibilityRule[]>([]);

  // Fetch all users to preview visibility
  const { data: allUsers } = useQuery(
    ['users', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Fetch current schedule
  const { data: currentSchedule } = useQuery(
    ['schedule', sequence.sequenceId],
    () => apiClient.getSequenceSchedule(sequence.sequenceId),
    { enabled: !!sequence.sequenceId }
  );

  const updateTargetsMutation = useMutation(
    (targets: SequenceTarget[]) => apiClient.updateSequenceTargets(sequence.sequenceId, targets),
    {
      onSuccess: (updatedTargets) => {
        onUpdateTargets(updatedTargets);
      }
    }
  );

  const createScheduleMutation = useMutation(
    (scheduleData: Partial<DeliverySchedule>) => 
      apiClient.createOrUpdateSchedule(sequence.sequenceId, scheduleData),
    {
      onSuccess: (schedule) => {
        onUpdateSchedule(schedule);
      }
    }
  );

  // Calculate which users can see this huddle
  const getVisibleUsers = () => {
    if (!allUsers) return [];
    
    return allUsers.filter(user => 
      canAccessHuddle(user.assignments, sequence.targets)
    );
  };

  const getUsersByTargetType = (targetType: string) => {
    if (!allUsers) return [];
    
    switch (targetType) {
      case 'DISCIPLINE':
        return allUsers.filter(user => 
          user.assignments.some(assignment => 
            assignment.disciplines?.length && assignment.disciplines.length > 0
          )
        );
      case 'ROLE':
        return allUsers.filter(user => 
          user.assignments.some(assignment => 
            assignment.roles?.length && assignment.roles.length > 0
          )
        );
      case 'BRANCH':
        return allUsers.filter(user => 
          user.assignments.some(assignment => assignment.branchId)
        );
      case 'TEAM':
        return allUsers.filter(user => 
          user.assignments.some(assignment => assignment.teamId)
        );
      default:
        return allUsers;
    }
  };

  const renderTargetingTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Targeting Overview</h3>
        <p className="text-sm text-blue-700">
          Configure who can see and access this huddle sequence. Users must match at least one targeting rule to view the content.
        </p>
      </div>

      {/* Current Targets */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Current Targeting Rules</h4>
        {sequence.targets.length > 0 ? (
          <div className="space-y-2">
            {sequence.targets.map((target, index) => (
              <div key={target.targetId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${
                    target.targetType === 'DISCIPLINE' ? 'bg-green-100 text-green-600' :
                    target.targetType === 'ROLE' ? 'bg-blue-100 text-blue-600' :
                    target.targetType === 'BRANCH' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {target.targetType === 'DISCIPLINE' ? <Shield size={16} /> :
                     target.targetType === 'ROLE' ? <Users size={16} /> :
                     <Eye size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{target.targetType}</p>
                    <p className="text-sm text-gray-600">{target.targetDisplayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeTarget(target.targetId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <EyeOff size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No targeting rules defined. This huddle is visible to all users.</p>
          </div>
        )}
      </div>

      {/* Add New Target */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Add Targeting Rule</h4>
        <TargetingRuleForm 
          onAddTarget={addTarget}
          availableBranches={[]} // Pass from props
          availableTeams={[]} // Pass from props
        />
      </div>
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Scheduling & Release</h3>
        <p className="text-sm text-yellow-700">
          Configure when huddles are automatically released and notifications are sent.
        </p>
      </div>

      <HuddleSchedulingForm 
        currentSchedule={currentSchedule ?? undefined}
        onSaveSchedule={createScheduleMutation.mutate}
        isLoading={createScheduleMutation.isLoading}
      />
    </div>
  );

  const renderPreviewTab = () => {
    const visibleUsers = getVisibleUsers();
    const totalUsers = allUsers?.length || 0;
    const visibilityPercentage = totalUsers > 0 ? (visibleUsers.length / totalUsers) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Visibility Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">{visibleUsers.length}</p>
                <p className="text-sm text-green-700">Can View</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <EyeOff className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-900">{totalUsers - visibleUsers.length}</p>
                <p className="text-sm text-red-700">Cannot View</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{visibilityPercentage.toFixed(0)}%</p>
                <p className="text-sm text-blue-700">Visibility Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">User Access Preview</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {allUsers?.map((user) => {
                const canView = canAccessHuddle(user.assignments, sequence.targets);
                return (
                  <div key={user.userId} className={`flex items-center justify-between p-3 border-b border-gray-100 ${
                    canView ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${canView ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.assignments.map((assignment, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {assignment.role}
                          {assignment.disciplines && assignment.disciplines.length > 0 && 
                            ` (${assignment.disciplines.join(', ')})`
                          }
                        </span>
                      ))}
                      
                      {canView ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const addTarget = (target: Omit<SequenceTarget, 'targetId'>) => {
    const newTargets = [...sequence.targets, { ...target, targetId: Date.now() }];
    updateTargetsMutation.mutate(newTargets);
  };

  const removeTarget = (targetId: number) => {
    const newTargets = sequence.targets.filter(t => t.targetId !== targetId);
    updateTargetsMutation.mutate(newTargets);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'targeting', label: 'Targeting', icon: Users },
            { id: 'scheduling', label: 'Scheduling', icon: Calendar },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'targeting' && renderTargetingTab()}
        {activeTab === 'scheduling' && renderSchedulingTab()}
        {activeTab === 'preview' && renderPreviewTab()}
      </div>
    </div>
  );
};

// Supporting Components
const TargetingRuleForm: React.FC<{
  onAddTarget: (target: Omit<SequenceTarget, 'targetId'>) => void;
  availableBranches: any[];
  availableTeams: any[];
}> = ({ onAddTarget, availableBranches, availableTeams }) => {
  // Implementation for targeting rule form
  return (
    <div>
      {/* Form implementation */}
    </div>
  );
};

const HuddleSchedulingForm: React.FC<{
  currentSchedule?: DeliverySchedule;
  onSaveSchedule: (schedule: Partial<DeliverySchedule>) => void;
  isLoading: boolean;
}> = ({ currentSchedule, onSaveSchedule, isLoading }) => {
  // Implementation for scheduling form
  return (
    <div>
      {/* Scheduling form implementation */}
    </div>
  );
};

export default HuddleVisibilityManager;