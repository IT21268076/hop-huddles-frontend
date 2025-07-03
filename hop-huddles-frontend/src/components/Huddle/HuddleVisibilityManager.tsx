// components/Huddle/HuddleVisibilityManager.tsx - Enhanced visibility and assignment management
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Target,
  Filter,
  Search,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Settings,
  GitBranch,
  User,
  Building,
  UserCheck,
  PlayCircle,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import toast from 'react-hot-toast';

interface VisibilityRule {
  ruleId: string;
  name: string;
  type: 'INCLUDE' | 'EXCLUDE';
  targetType: 'ROLE' | 'DISCIPLINE' | 'BRANCH' | 'TEAM' | 'USER';
  targetValues: string[];
  conditions?: {
    minExperience?: number;
    requiredCertifications?: string[];
    departmentRestrictions?: string[];
    completionRequirements?: string[];
  };
  priority: number;
  isActive: boolean;
}

interface AssignmentSchedule {
  scheduleId: string;
  name: string;
  releasePattern: 'IMMEDIATE' | 'SEQUENTIAL' | 'SCHEDULED' | 'CONDITIONAL';
  startDate?: string;
  endDate?: string;
  intervalDays?: number;
  timeOfDay?: string;
  timezone: string;
  conditions?: {
    prerequisiteSequences?: number[];
    minimumScore?: number;
    requiredCompletions?: number;
  };
}

interface HuddleAssignment {
  assignmentId: string;
  userId: number;
  userName: string;
  userEmail: string;
  branchName?: string;
  teamName?: string;
  role: string;
  discipline: string;
  assignedAt: string;
  dueDate?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'EXEMPTED';
  progress: number;
  lastAccessed?: string;
  completedAt?: string;
  score?: number;
  attempts: number;
  assignedBy: string;
}

interface HuddleVisibilityProps {
  sequenceId: number;
  sequenceTitle: string;
  huddles: Array<{
    huddleId: number;
    title: string;
    orderIndex: number;
    isRequired: boolean;
  }>;
  onSave: (visibilitySettings: any) => void;
  onClose: () => void;
}

const HuddleVisibilityManager: React.FC<HuddleVisibilityProps> = ({
  sequenceId,
  sequenceTitle,
  huddles,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  // const { capabilities, dataContext } = useActiveRole();
  const [activeTab, setActiveTab] = useState<'RULES' | 'SCHEDULE' | 'ASSIGNMENTS'>('RULES');
  const [visibilityRules, setVisibilityRules] = useState<VisibilityRule[]>([]);
  const [assignmentSchedule, setAssignmentSchedule] = useState<AssignmentSchedule>({
    scheduleId: 'default',
    name: 'Default Schedule',
    releasePattern: 'IMMEDIATE',
    timezone: 'America/New_York'
  });
  const [currentAssignments, setCurrentAssignments] = useState<HuddleAssignment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [assignmentFilters, setAssignmentFilters] = useState({
    search: '',
    status: 'ALL',
    branch: 'ALL',
    team: 'ALL',
    role: 'ALL'
  });

  // Mock data for available users - in production, this would come from API
  const availableUsers = [
    {
      userId: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@healthcare.com',
      branchId: 1,
      branchName: 'North Branch',
      teamId: 1,
      teamName: 'Home Health Team A',
      role: 'FIELD_CLINICIAN',
      discipline: 'NURSING',
      experience: 3,
      certifications: ['RN', 'CHPN']
    },
    {
      userId: 2,
      name: 'Michael Chen',
      email: 'michael.c@healthcare.com',
      branchId: 1,
      branchName: 'North Branch',
      teamId: 2,
      teamName: 'PT/OT Team',
      role: 'FIELD_CLINICIAN',
      discipline: 'PHYSICAL_THERAPY',
      experience: 5,
      certifications: ['PT', 'LSVT']
    },
    {
      userId: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@healthcare.com',
      branchId: 2,
      branchName: 'South Branch',
      teamId: 3,
      teamName: 'Wound Care Specialists',
      role: 'CLINICAL_MANAGER',
      discipline: 'NURSING',
      experience: 8,
      certifications: ['RN', 'CWCN', 'WCC']
    }
  ];

  const roleOptions = [
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  const disciplineOptions = [
    { value: 'NURSING', label: 'Nursing' },
    { value: 'PHYSICAL_THERAPY', label: 'Physical Therapy' },
    { value: 'OCCUPATIONAL_THERAPY', label: 'Occupational Therapy' },
    { value: 'SPEECH_THERAPY', label: 'Speech Therapy' },
    { value: 'SOCIAL_WORK', label: 'Social Work' },
    { value: 'HOME_HEALTH_AIDE', label: 'Home Health Aide' }
  ];

  const addVisibilityRule = () => {
    const newRule: VisibilityRule = {
      ruleId: `rule_${Date.now()}`,
      name: `Rule ${visibilityRules.length + 1}`,
      type: 'INCLUDE',
      targetType: 'ROLE',
      targetValues: [],
      priority: visibilityRules.length + 1,
      isActive: true
    };
    setVisibilityRules([...visibilityRules, newRule]);
  };

  const updateVisibilityRule = (ruleId: string, updates: Partial<VisibilityRule>) => {
    setVisibilityRules(prev => prev.map(rule => 
      rule.ruleId === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const removeVisibilityRule = (ruleId: string) => {
    setVisibilityRules(prev => prev.filter(rule => rule.ruleId !== ruleId));
  };

  const calculateTargetUsers = () => {
    // Apply visibility rules to determine target users
    let targetUsers = [...availableUsers];

    visibilityRules.forEach(rule => {
      if (!rule.isActive) return;

      const matchingUsers = availableUsers.filter(user => {
        switch (rule.targetType) {
          case 'ROLE':
            return rule.targetValues.includes(user.role);
          case 'DISCIPLINE':
            return rule.targetValues.includes(user.discipline);
          case 'BRANCH':
            return rule.targetValues.includes(user.branchName || '');
          case 'TEAM':
            return rule.targetValues.includes(user.teamName || '');
          default:
            return false;
        }
      });

      if (rule.type === 'INCLUDE') {
        targetUsers = targetUsers.filter(user => matchingUsers.includes(user));
      } else {
        targetUsers = targetUsers.filter(user => !matchingUsers.includes(user));
      }
    });

    return targetUsers;
  };

  const targetUsers = useMemo(() => calculateTargetUsers(), [visibilityRules, availableUsers]);

  const handleBulkAssign = () => {
    const usersToAssign = selectedUsers.length > 0 
      ? availableUsers.filter(u => selectedUsers.includes(u.userId))
      : targetUsers;

    const newAssignments: HuddleAssignment[] = usersToAssign.map(user => ({
      assignmentId: `assign_${user.userId}_${Date.now()}`,
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      branchName: user.branchName,
      teamName: user.teamName,
      role: user.role,
      discipline: user.discipline,
      assignedAt: new Date().toISOString(),
      dueDate: assignmentSchedule.endDate,
      status: 'ASSIGNED',
      progress: 0,
      attempts: 0,
      assignedBy: user?.name || 'System'
    }));

    setCurrentAssignments(prev => [...prev, ...newAssignments]);
    setSelectedUsers([]);
    toast.success(`Assigned sequence to ${usersToAssign.length} users`);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setCurrentAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
    toast.success('Assignment removed');
  };

  const handleSave = () => {
    const visibilitySettings = {
      rules: visibilityRules,
      schedule: assignmentSchedule,
      assignments: currentAssignments,
      targetUserCount: targetUsers.length
    };

    onSave(visibilitySettings);
    toast.success('Visibility settings saved successfully');
  };

  const renderVisibilityRules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Visibility Rules</h3>
          <p className="text-sm text-gray-600">Define who can see and access this sequence</p>
        </div>
        <button
          onClick={addVisibilityRule}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {visibilityRules.length > 0 ? (
        <div className="space-y-4">
          {visibilityRules.map((rule, index) => (
            <div key={rule.ruleId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => updateVisibilityRule(rule.ruleId, { name: e.target.value })}
                  className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                />
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={(e) => updateVisibilityRule(rule.ruleId, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Active</span>
                  </label>
                  <button
                    onClick={() => removeVisibilityRule(rule.ruleId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                  <select
                    value={rule.type}
                    onChange={(e) => updateVisibilityRule(rule.ruleId, { type: e.target.value as 'INCLUDE' | 'EXCLUDE' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="INCLUDE">Include</option>
                    <option value="EXCLUDE">Exclude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                  <select
                    value={rule.targetType}
                    onChange={(e) => updateVisibilityRule(rule.ruleId, { 
                      targetType: e.target.value as any,
                      targetValues: [] // Reset values when type changes
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ROLE">Role</option>
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="BRANCH">Branch</option>
                    <option value="TEAM">Team</option>
                    <option value="USER">Specific Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Values</label>
                  <select
                    multiple
                    value={rule.targetValues}
                    onChange={(e) => updateVisibilityRule(rule.ruleId, { 
                      targetValues: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    size={3}
                  >
                    {rule.targetType === 'ROLE' && roleOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                    {rule.targetType === 'DISCIPLINE' && disciplineOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                    {rule.targetType === 'BRANCH' && Array.from(new Set(availableUsers.map(u => u.branchName))).filter(Boolean).map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                    {rule.targetType === 'TEAM' && Array.from(new Set(availableUsers.map(u => u.teamName))).filter(Boolean).map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                    {rule.targetType === 'USER' && availableUsers.map(user => (
                      <option key={user.userId} value={user.userId.toString()}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No visibility rules defined</h3>
          <p className="text-gray-600 mb-4">Add rules to control who can see this sequence</p>
          <button
            onClick={addVisibilityRule}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Rule
          </button>
        </div>
      )}

      {/* Target Users Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Target Users Preview</h4>
        <p className="text-sm text-gray-600 mb-3">
          Based on current rules, this sequence will be visible to <strong>{targetUsers.length}</strong> users
        </p>
        {targetUsers.length > 0 && (
          <div className="space-y-2">
            {targetUsers.slice(0, 5).map(user => (
              <div key={user.userId} className="flex items-center text-sm">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-500 ml-2">({user.role}, {user.teamName})</span>
              </div>
            ))}
            {targetUsers.length > 5 && (
              <p className="text-sm text-gray-500">...and {targetUsers.length - 5} more users</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderScheduleSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Schedule</h3>
        <p className="text-sm text-gray-600">Configure when and how this sequence is released to users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Release Pattern</label>
          <select
            value={assignmentSchedule.releasePattern}
            onChange={(e) => setAssignmentSchedule(prev => ({ 
              ...prev, 
              releasePattern: e.target.value as any 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="IMMEDIATE">Immediate - Release all huddles at once</option>
            <option value="SEQUENTIAL">Sequential - Release huddles one by one</option>
            <option value="SCHEDULED">Scheduled - Release on specific dates</option>
            <option value="CONDITIONAL">Conditional - Release based on completion</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={assignmentSchedule.timezone}
            onChange={(e) => setAssignmentSchedule(prev => ({ 
              ...prev, 
              timezone: e.target.value 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        {assignmentSchedule.releasePattern !== 'IMMEDIATE' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={assignmentSchedule.startDate || ''}
                onChange={(e) => setAssignmentSchedule(prev => ({ 
                  ...prev, 
                  startDate: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
              <input
                type="datetime-local"
                value={assignmentSchedule.endDate || ''}
                onChange={(e) => setAssignmentSchedule(prev => ({ 
                  ...prev, 
                  endDate: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {assignmentSchedule.releasePattern === 'SEQUENTIAL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Release Interval (days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={assignmentSchedule.intervalDays || 7}
              onChange={(e) => setAssignmentSchedule(prev => ({ 
                ...prev, 
                intervalDays: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentAssignments = () => {
    const filteredAssignments = currentAssignments.filter(assignment => {
      const matchesSearch = assignmentFilters.search === '' ||
        assignment.userName.toLowerCase().includes(assignmentFilters.search.toLowerCase()) ||
        assignment.userEmail.toLowerCase().includes(assignmentFilters.search.toLowerCase());
      
      const matchesStatus = assignmentFilters.status === 'ALL' || assignment.status === assignmentFilters.status;
      const matchesBranch = assignmentFilters.branch === 'ALL' || assignment.branchName === assignmentFilters.branch;
      const matchesTeam = assignmentFilters.team === 'ALL' || assignment.teamName === assignmentFilters.team;
      const matchesRole = assignmentFilters.role === 'ALL' || assignment.role === assignmentFilters.role;

      return matchesSearch && matchesStatus && matchesBranch && matchesTeam && matchesRole;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Assignments</h3>
            <p className="text-sm text-gray-600">Manage who has access to this sequence</p>
          </div>
          <button
            onClick={handleBulkAssign}
            disabled={targetUsers.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Assign to Target Users ({targetUsers.length})
          </button>
        </div>

        {/* Assignment Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={assignmentFilters.search}
              onChange={(e) => setAssignmentFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={assignmentFilters.status}
            onChange={(e) => setAssignmentFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select
            value={assignmentFilters.branch}
            onChange={(e) => setAssignmentFilters(prev => ({ ...prev, branch: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Branches</option>
            {Array.from(new Set(currentAssignments.map(a => a.branchName))).filter(Boolean).map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          <select
            value={assignmentFilters.team}
            onChange={(e) => setAssignmentFilters(prev => ({ ...prev, team: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Teams</option>
            {Array.from(new Set(currentAssignments.map(a => a.teamName))).filter(Boolean).map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          <select
            value={assignmentFilters.role}
            onChange={(e) => setAssignmentFilters(prev => ({ ...prev, role: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Assignments Table */}
        {filteredAssignments.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team/Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.assignmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{assignment.userName}</div>
                          <div className="text-sm text-gray-500">{assignment.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.teamName}</div>
                      <div className="text-sm text-gray-500">{assignment.role.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{assignment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveAssignment(assignment.assignmentId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-4">Assign this sequence to users to track their progress</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Visibility & Assignments</h3>
                <p className="text-sm text-gray-600">{sequenceTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8">
                {[
                  { key: 'RULES', label: 'Visibility Rules', icon: Eye },
                  { key: 'SCHEDULE', label: 'Schedule', icon: Calendar },
                  { key: 'ASSIGNMENTS', label: 'Assignments', icon: Users }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'RULES' && renderVisibilityRules()}
            {activeTab === 'SCHEDULE' && renderScheduleSettings()}
            {activeTab === 'ASSIGNMENTS' && renderCurrentAssignments()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {activeTab === 'RULES' && `${targetUsers.length} users will have access`}
              {activeTab === 'ASSIGNMENTS' && `${currentAssignments.length} current assignments`}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuddleVisibilityManager;