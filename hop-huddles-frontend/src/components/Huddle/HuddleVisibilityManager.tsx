// components/Huddle/HuddleVisibilityManager.tsx
import React, { useEffect, useState } from 'react';
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
  Settings,
  Building,
  Building2,
  Plus,
  Target,
  AlertCircle,
  Bell,
  Check,
  Mail,
  MessageSquare,
  Repeat
} from 'lucide-react';
import type { 
  HuddleSequence, 
  SequenceTarget, 
  UserAssignment,
  DeliverySchedule, 
  TargetType,
  Discipline,
  UserRole,
  FrequencyType
} from '../../types';
import { canAccessHuddle } from '../../utils/permissions';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';

interface HuddleVisibilityManagerProps {
  sequence: HuddleSequence;
  onUpdateTargets: (targets: SequenceTarget[]) => void;
  onUpdateSchedule: (schedule: DeliverySchedule) => void;
}

interface TargetingRuleFormData {
  targetType: TargetType;
  targetValue: string;
  priority: number;
  isRequired: boolean;
}

interface ScheduleFormData {
  frequencyType: FrequencyType;
  startDate: string;
  endDate?: string;
  releaseTime: string;
  daysOfWeek?: string[];
  timeZone: string;
  autoPublish: boolean;
  sendNotifications: boolean;
  notificationSettings: {
    emailReminders: boolean;
    smsReminders: boolean;
    inAppNotifications: boolean;
    reminderTiming: number;
  };
  customSettings?: {
    intervalDays?: number;
    releaseCount?: number;
  };
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<TargetingRuleFormData>({
    defaultValues: {
      targetType: 'DISCIPLINE',
      targetValue: '',
      priority: 1,
      isRequired: false
    }
  });

  const watchedTargetType = watch('targetType');

  const targetTypes: { value: TargetType; label: string; icon: React.ComponentType<any>; description: string }[] = [
    { 
      value: 'DISCIPLINE', 
      label: 'Discipline', 
      icon: Shield, 
      description: 'Target users by their professional discipline' 
    },
    { 
      value: 'ROLE', 
      label: 'Role', 
      icon: Users, 
      description: 'Target users by their assigned role' 
    },
    { 
      value: 'BRANCH', 
      label: 'Branch', 
      icon: Building, 
      description: 'Target all users in a specific branch' 
    },
    { 
      value: 'TEAM', 
      label: 'Team', 
      icon: Building2, 
      description: 'Target all users in a specific team' 
    },
  ];

  const disciplineOptions: { value: Discipline; label: string }[] = [
    { value: 'RN', label: 'Registered Nurse' },
    { value: 'PT', label: 'Physical Therapist' },
    { value: 'OT', label: 'Occupational Therapist' },
    { value: 'SLP', label: 'Speech-Language Pathologist' },
    { value: 'LPN', label: 'Licensed Practical Nurse' },
    { value: 'HHA', label: 'Home Health Aide' },
    { value: 'MSW', label: 'Medical Social Worker' },
    { value: 'OTHER', label: 'Other' },
  ];

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
    { value: 'PRECEPTOR', label: 'Preceptor' },
    { value: 'LEARNER', label: 'Learner' },
    { value: 'SCHEDULER', label: 'Scheduler' },
    { value: 'INTAKE_COORDINATOR', label: 'Intake Coordinator' },
  ];

  const getTargetOptions = () => {
    switch (watchedTargetType) {
      case 'DISCIPLINE':
        return disciplineOptions;
      case 'ROLE':
        return roleOptions;
      case 'BRANCH':
        return availableBranches?.map(branch => ({ 
          value: branch.branchId.toString(), 
          label: branch.name 
        })) || [];
      case 'TEAM':
        return availableTeams?.map(team => ({ 
          value: team.teamId.toString(), 
          label: team.name 
        })) || [];
      default:
        return [];
    }
  };

  const getTargetDisplayName = (targetType: TargetType, targetValue: string) => {
    switch (targetType) {
      case 'DISCIPLINE':
        return disciplineOptions.find(d => d.value === targetValue)?.label || targetValue;
      case 'ROLE':
        return roleOptions.find(r => r.value === targetValue)?.label || targetValue;
      case 'BRANCH':
        return availableBranches?.find(b => b.branchId.toString() === targetValue)?.name || targetValue;
      case 'TEAM':
        return availableTeams?.find(t => t.teamId.toString() === targetValue)?.name || targetValue;
      default:
        return targetValue;
    }
  };

  const onSubmit = (data: TargetingRuleFormData) => {
    if (!data.targetValue) {
      return;
    }

    const target = {
      targetType: data.targetType,
      targetValue: data.targetValue,
      targetDisplayName: getTargetDisplayName(data.targetType, data.targetValue),
      priority: data.priority,
      isRequired: data.isRequired
    };

    onAddTarget(target);
    reset();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Add Targeting Rule
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-blue-600" />
        <h4 className="text-lg font-medium text-gray-900">Add Targeting Rule</h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Target Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {targetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`cursor-pointer flex items-center p-3 border rounded-lg transition-colors ${
                    watchedTargetType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    {...register('targetType', { required: 'Target type is required' })}
                    className="sr-only"
                  />
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.targetType && (
            <p className="mt-1 text-sm text-red-600">{errors.targetType.message}</p>
          )}
        </div>

        {/* Target Value Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Value *
          </label>
          <select
            {...register('targetValue', { required: 'Target value is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select {watchedTargetType.toLowerCase()}...</option>
            {getTargetOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.targetValue && (
            <p className="mt-1 text-sm text-red-600">{errors.targetValue.message}</p>
          )}
        </div>

        {/* Priority and Required Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>High (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>Low (3)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Higher priority rules are evaluated first
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isRequired')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Required Rule</span>
            </label>
            <div className="ml-2 group relative">
              <div className="text-gray-400 cursor-help">ⓘ</div>
              <div className="invisible group-hover:visible absolute bottom-6 left-0 w-48 bg-black text-white text-xs rounded p-2 z-10">
                Required rules must match for users to see this huddle. Optional rules expand visibility.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              reset();
              setIsExpanded(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Rule
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-800 mb-1">Targeting Rules Help</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Discipline:</strong> Show to users with specific professional disciplines</li>
          <li>• <strong>Role:</strong> Show to users with specific organizational roles</li>
          <li>• <strong>Branch:</strong> Show to all users assigned to a specific branch</li>
          <li>• <strong>Team:</strong> Show to all users assigned to a specific team</li>
          <li>• <strong>Required rules:</strong> ALL must match for visibility</li>
          <li>• <strong>Optional rules:</strong> ANY can match to expand visibility</li>
        </ul>
      </div>
    </div>
  );
};

const HuddleSchedulingForm: React.FC<{
  currentSchedule?: DeliverySchedule;
  onSaveSchedule: (schedule: Partial<DeliverySchedule>) => void;
  isLoading: boolean;
}> = ({ currentSchedule, onSaveSchedule, isLoading }) => {
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ScheduleFormData>({
    defaultValues: {
      frequencyType: currentSchedule?.frequencyType || 'ONE_TIME',
      startDate: currentSchedule?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: currentSchedule?.endDate?.split('T')[0] || '',
      releaseTime: currentSchedule?.releaseTime || '09:00',
      daysOfWeek: currentSchedule?.daysOfWeek || [],
      timeZone: currentSchedule?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      autoPublish: currentSchedule?.autoPublish ?? true,
      sendNotifications: currentSchedule?.sendNotifications ?? true,
      notificationSettings: {
        emailReminders: currentSchedule?.notificationSettings?.emailReminders ?? true,
        smsReminders: currentSchedule?.notificationSettings?.smsReminders ?? false,
        inAppNotifications: currentSchedule?.notificationSettings?.inAppNotifications ?? true,
        reminderTiming: currentSchedule?.notificationSettings?.reminderTiming || 24,
      },
      customSettings: {
        intervalDays: 7,
        releaseCount: 5
      }
    }
  });

  const watchedValues = watch();

  const frequencyOptions: { value: FrequencyType; label: string; description: string }[] = [
    { value: 'ONE_TIME', label: 'One Time', description: 'Release once on the specified date' },
    { value: 'DAILY', label: 'Daily', description: 'Release every day' },
    { value: 'WEEKLY', label: 'Weekly', description: 'Release on selected days each week' },
    { value: 'MONTHLY', label: 'Monthly', description: 'Release once per month' },
    { value: 'CUSTOM', label: 'Custom', description: 'Custom interval between releases' },
  ];

  const daysOfWeekOptions = [
    { value: 'MONDAY', label: 'Mon' },
    { value: 'TUESDAY', label: 'Tue' },
    { value: 'WEDNESDAY', label: 'Wed' },
    { value: 'THURSDAY', label: 'Thu' },
    { value: 'FRIDAY', label: 'Fri' },
    { value: 'SATURDAY', label: 'Sat' },
    { value: 'SUNDAY', label: 'Sun' },
  ];

  const timeZoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  // Generate preview dates based on current settings
  useEffect(() => {
    const generatePreviewDates = () => {
      const { frequencyType, startDate, releaseTime, daysOfWeek, customSettings } = watchedValues;
      if (!startDate) return [];

      const dates: string[] = [];
      const start = new Date(startDate + 'T' + releaseTime);
      
      switch (frequencyType) {
        case 'ONE_TIME':
          dates.push(start.toLocaleString());
          break;
          
        case 'DAILY':
          for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            dates.push(date.toLocaleString());
          }
          break;
          
        case 'WEEKLY':
          if (daysOfWeek && daysOfWeek.length > 0) {
            const dayMap = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
            for (let week = 0; week < 4; week++) {
              daysOfWeek.forEach(day => {
                const date = new Date(start);
                const dayIndex = dayMap[day as keyof typeof dayMap];
                const daysToAdd = (dayIndex - date.getDay() + 7) % 7 + (week * 7);
                date.setDate(date.getDate() + daysToAdd);
                dates.push(date.toLocaleString());
              });
            }
          }
          break;
          
        case 'MONTHLY':
          for (let i = 0; i < 6; i++) {
            const date = new Date(start);
            date.setMonth(date.getMonth() + i);
            dates.push(date.toLocaleString());
          }
          break;
          
        case 'CUSTOM':
          if (customSettings?.intervalDays) {
            for (let i = 0; i < (customSettings?.releaseCount || 5); i++) {
              const date = new Date(start);
              date.setDate(date.getDate() + (i * customSettings.intervalDays));
              dates.push(date.toLocaleString());
            }
          }
          break;
      }
      
      return dates.slice(0, 10); // Limit to 10 preview dates
    };

    setPreviewDates(generatePreviewDates());
  }, [watchedValues]);

  const onSubmit = (data: ScheduleFormData) => {
    const scheduleData: Partial<DeliverySchedule> = {
      frequencyType: data.frequencyType,
      startDate: data.startDate + 'T' + data.releaseTime,
      endDate: data.endDate ? data.endDate + 'T23:59:59' : undefined,
      releaseTime: data.releaseTime,
      daysOfWeek: data.frequencyType === 'WEEKLY' ? data.daysOfWeek : undefined,
      timeZone: data.timeZone,
      autoPublish: data.autoPublish,
      sendNotifications: data.sendNotifications,
      notificationSettings: data.sendNotifications ? {
        emailReminders: data.notificationSettings.emailReminders,
        smsReminders: data.notificationSettings.smsReminders,
        inAppNotifications: data.notificationSettings.inAppNotifications,
        reminderTiming: data.notificationSettings.reminderTiming,
      } : undefined,
    };

    onSaveSchedule(scheduleData);
  };

  const toggleDayOfWeek = (day: string) => {
    const currentDays = watchedValues.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('daysOfWeek', newDays);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Frequency Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Repeat className="inline h-4 w-4 mr-1" />
            Release Frequency *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {frequencyOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer flex flex-col p-4 border rounded-lg transition-colors ${
                  watchedValues.frequencyType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('frequencyType', { required: 'Frequency type is required' })}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900">{option.label}</span>
                <span className="text-xs text-gray-600 mt-1">{option.description}</span>
              </label>
            ))}
          </div>
          {errors.frequencyType && (
            <p className="mt-1 text-sm text-red-600">{errors.frequencyType.message}</p>
          )}
        </div>

        {/* Date and Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date *
            </label>
            <input
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {watchedValues.frequencyType !== 'ONE_TIME' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline h-4 w-4 mr-1" />
              Release Time *
            </label>
            <input
              type="time"
              {...register('releaseTime', { required: 'Release time is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.releaseTime && (
              <p className="mt-1 text-sm text-red-600">{errors.releaseTime.message}</p>
            )}
          </div>
        </div>

        {/* Days of Week Selection (for weekly frequency) */}
        {watchedValues.frequencyType === 'WEEKLY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days of Week *
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeekOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOfWeek(day.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    watchedValues.daysOfWeek?.includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Frequency Settings */}
        {watchedValues.frequencyType === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interval (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                {...register('customSettings.intervalDays')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Releases
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...register('customSettings.releaseCount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="5"
              />
            </div>
          </div>
        )}

        {/* Time Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Zone
          </label>
          <select
            {...register('timeZone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {timeZoneOptions.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-publish and Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('autoPublish')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <Play className="inline h-4 w-4 mr-1" />
                Auto-publish huddles
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('sendNotifications')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <Bell className="inline h-4 w-4 mr-1" />
                Send notifications
              </span>
            </label>
          </div>

          {/* Notification Settings (conditional) */}
          {watchedValues.sendNotifications && (
            <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">Notification Options</h4>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('notificationSettings.emailReminders')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Email reminders</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('notificationSettings.smsReminders')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">SMS reminders</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('notificationSettings.inAppNotifications')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">In-app notifications</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send reminders
                </label>
                <select
                  {...register('notificationSettings.reminderTiming')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 hour before</option>
                  <option value={4}>4 hours before</option>
                  <option value={24}>24 hours before</option>
                  <option value={48}>48 hours before</option>
                  <option value={168}>1 week before</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Preview */}
        {previewDates.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Upcoming Releases Preview
            </h4>
            <div className="space-y-1">
              {previewDates.slice(0, 5).map((date, index) => (
                <div key={index} className="text-xs text-blue-700">
                  {index + 1}. {date}
                </div>
              ))}
              {previewDates.length > 5 && (
                <div className="text-xs text-blue-600 italic">
                  ...and {previewDates.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="inline h-4 w-4 mr-2" />
                Save Schedule
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Information */}
      <div className="p-4 bg-amber-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Scheduling Tips</h4>
            <ul className="text-xs text-amber-700 mt-1 space-y-1">
              <li>• Auto-publish will make huddles available immediately at scheduled times</li>
              <li>• Notifications help ensure users don't miss new releases</li>
              <li>• Weekly schedules require at least one day to be selected</li>
              <li>• Custom intervals allow flexible release patterns</li>
              <li>• Times are shown in the selected time zone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuddleVisibilityManager;