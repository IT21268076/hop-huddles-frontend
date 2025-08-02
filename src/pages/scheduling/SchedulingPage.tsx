// pages/scheduling/SchedulingPage.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Play, Pause, Settings, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/api';
import { DeliverySchedule, HuddleSequence } from '../../types';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { getTimezoneStringForState, getTimezoneAbbreviationForState, getUSTimezones } from '../../utils/timezoneUtils';

export const SchedulingPage: React.FC = () => {
  const { currentAgency } = useApp();
  const { toasts, success, error, warning, info, removeToast } = useToast();
  const [selectedSequence, setSelectedSequence] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DeliverySchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<DeliverySchedule>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    data: sequences,
    loading: sequencesLoading,
  } = useAsync(
    async () => {
      if (!currentAgency) {
        console.log('SchedulingPage - No current agency');
        return [];
      }
      console.log('SchedulingPage - Loading sequences for agency:', currentAgency.agencyId);
      try {
        const seqs = await apiClient.getSequencesByAgency(currentAgency.agencyId);
        console.log('SchedulingPage - Sequences loaded:', seqs);
        return seqs;
      } catch (error) {
        console.error('SchedulingPage - Error loading sequences:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  const {
    data: schedules,
    loading,
    refetch,
  } = useAsync(
    async () => {
      if (!currentAgency) {
        console.log('SchedulingPage - No agency for schedules');
        return [];
      }
      
      try {
        if (!selectedSequence) {
          // Show all schedules for the agency
          console.log('SchedulingPage - Loading all schedules for agency:', currentAgency.agencyId);
          const allSchedules = await apiClient.getAgencySchedules(currentAgency.agencyId);
          console.log('SchedulingPage - All schedules loaded:', allSchedules);
          return allSchedules;
        } else {
          // Show schedules for specific sequence
          console.log('SchedulingPage - Loading schedules for sequence:', selectedSequence);
          const seqSchedules = await apiClient.getSequenceSchedules(Number(selectedSequence));
          console.log('SchedulingPage - Sequence schedules loaded:', seqSchedules);
          return seqSchedules;
        }
      } catch (error) {
        console.error('SchedulingPage - Error loading schedules:', error);
        return [];
      }
    },
    [selectedSequence, currentAgency?.agencyId]
  );

  const handleToggleSchedule = async (schedule: DeliverySchedule) => {
    try {
      if (schedule.scheduleStatus === 'ACTIVE') {
        await apiClient.pauseSchedule(schedule.scheduleId);
        success(`Schedule paused successfully`);
      } else {
        await apiClient.resumeSchedule(schedule.scheduleId);
        success(`Schedule resumed successfully`);
      }
      await refetch();
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
      error(`Failed to ${schedule.scheduleStatus === 'ACTIVE' ? 'pause' : 'resume'} schedule. Please try again.`);
    }
  };

  // ⭐ RENDER HUDDLE PROGRESS
  const renderHuddleProgress = (schedule: DeliverySchedule) => {
    const currentHuddle = (schedule.currentHuddleIndex || 0) + 1; // 1-based for display
    const totalHuddles = schedule.maxExecutions || 0;
    const progressPercentage = totalHuddles > 0 ? Math.round((currentHuddle - 1) / totalHuddles * 100) : 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          Huddle {currentHuddle} of {totalHuddles}
        </span>
      </div>
    );
  };

  const resetForm = () => {
    setFormData({});
    setFormErrors({});
    setIsCreating(false);
    setEditingSchedule(null);
  };

  const handleEditSchedule = (schedule: DeliverySchedule) => {
    setFormData({
      frequencyType: schedule.frequencyType,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      releaseTime: schedule.releaseTime,
      timeZone: schedule.timeZone,
      daysOfWeek: schedule.daysOfWeek,
      intervalDays: schedule.intervalDays,
      autoPublish: schedule.autoPublish,
      sendNotifications: schedule.sendNotifications,
      isActive: schedule.isActive
    });
    setEditingSchedule(schedule);
  };

  const handleCreateSchedule = () => {
    if (!selectedSequence) return;
    
    // Check if sequence already has active schedules
    const existingActiveSchedules = schedules?.filter(s => 
      s.sequenceId === Number(selectedSequence) && 
      s.scheduleStatus === 'ACTIVE' &&
      s.isActive !== false
    ) || [];
    
    if (existingActiveSchedules.length > 0) {
      warning(`This sequence already has ${existingActiveSchedules.length} active schedule(s). Please edit the existing schedule or pause it first.`);
      return;
    }
    
    const now = new Date();
    const defaultTime = '09:00';
    const defaultStartDate = now.toISOString().split('T')[0];
    
    // Get the selected sequence to determine branch state for timezone
    const selectedSeq = sequences?.find(s => s.sequenceId.toString() === selectedSequence);
    let detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // If we have branch state information, use it to detect timezone
    if (selectedSeq?.branchState) {
      detectedTimezone = getTimezoneStringForState(selectedSeq.branchState);
    }
    
    setFormData({
      frequencyType: 'WEEKLY',
      startDate: defaultStartDate,
      releaseTime: defaultTime,
      timeZone: detectedTimezone,
      daysOfWeek: ['MONDAY'],
      autoPublish: true,
      sendNotifications: true,
      isActive: true
    });
    setIsCreating(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.frequencyType) {
      errors.frequencyType = 'Frequency type is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (!formData.releaseTime) {
      errors.releaseTime = 'Release time is required';
    }
    
    if (formData.frequencyType === 'WEEKLY' && (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
      errors.daysOfWeek = 'At least one day of the week is required for weekly schedules';
    }
    
    if (formData.frequencyType === 'INTERVAL' && (!formData.intervalDays || formData.intervalDays < 1)) {
      errors.intervalDays = 'Interval days must be at least 1';
    }
    
    if (formData.endDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSchedule = async () => {
    if (!validateForm()) {
      warning('Please fix the form errors before saving.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Prepare schedule data with proper timezone handling
      const scheduleData = { ...formData };
      
      // If no timezone selected, use auto-detected one
      if (!scheduleData.timeZone) {
        const selectedSeq = sequences?.find(s => s.sequenceId.toString() === selectedSequence);
        scheduleData.timeZone = selectedSeq?.branchState 
          ? getTimezoneStringForState(selectedSeq.branchState)
          : Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      
      if (editingSchedule) {
        // Update existing schedule
        await apiClient.updateSchedule(editingSchedule.scheduleId, scheduleData as DeliverySchedule);
        success('Schedule updated successfully!');
      } else {
        // Create new schedule
        if (!selectedSequence) throw new Error('No sequence selected');
        await apiClient.createSchedule(Number(selectedSequence), scheduleData as DeliverySchedule);
        success('Schedule created successfully!');
      }
      
      await refetch();
      resetForm();
    } catch (err: any) {
      console.error('Failed to save schedule:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
      error(`Failed to ${editingSchedule ? 'update' : 'create'} schedule: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiClient.cancelSchedule(scheduleId);
      success('Schedule deleted successfully!');
      await refetch();
    } catch (err: any) {
      console.error('Failed to delete schedule:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
      error(`Failed to delete schedule: ${errorMessage}`);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleInputChange('daysOfWeek', newDays);
  };

  // Helper function to get existing active schedule for selected sequence
  const getExistingActiveSchedule = (): DeliverySchedule | null => {
    if (!selectedSequence || !schedules) return null;
    
    // Debug logging to understand the data structure
    if (selectedSequence && schedules.length > 0) {
      console.log('🔍 DEBUG: Schedule detection for sequence', selectedSequence, 'type:', typeof selectedSequence);
      console.log('📊 Available schedules:', schedules);
      console.log('🔍 Individual schedule details:');
      schedules.forEach((s, index) => {
        console.log(`  Schedule ${index} - ALL PROPERTIES:`, s);
        console.log(`  Schedule ${index} - KEY PROPERTIES:`, {
          scheduleId: s.scheduleId,
          sequenceId: s.sequenceId,
          sequenceIdType: typeof s.sequenceId,
          scheduleStatus: s.scheduleStatus,
          isActive: s.isActive,
          allKeys: Object.keys(s)
        });
        console.log(`  Schedule ${index} - COMPARISON TEST:`, {
          'sequenceId == 3': s.sequenceId == 3,
          'sequenceId === 3': s.sequenceId === 3,
          'sequenceId == "3"': String(s.sequenceId) == "3",
          'Number(sequenceId) === 3': Number(s.sequenceId) === 3,
          'String(sequenceId) === "3"': String(s.sequenceId) === "3",
          rawSequenceId: s.sequenceId
        });
        
        // Check for nested or alternative properties
        console.log(`  Schedule ${index} - DEEP PROPERTY SEARCH:`);
        Object.keys(s).forEach(key => {
          const value = (s as any)[key];
          if (value === 3 || value === "3" || String(value) === "3" || Number(value) === 3) {
            console.log(`    FOUND MATCH: ${key} = ${value} (type: ${typeof value})`);
          }
          if (key.toLowerCase().includes('sequence')) {
            console.log(`    SEQUENCE-RELATED: ${key} = ${value} (type: ${typeof value})`);
          }
        });
      });
      
      console.log('🧪 Testing different filter approaches:');
      console.log('  Number(selectedSequence):', Number(selectedSequence));
      console.log('  String(selectedSequence):', String(selectedSequence));
      
      const sequenceSchedules = schedules.filter(s => s?.sequenceId === Number(selectedSequence));
      console.log('🎯 Schedules for this sequence (Number comparison):', sequenceSchedules);
      
      const sequenceSchedulesString = schedules.filter(s => String(s?.sequenceId) === String(selectedSequence));
      console.log('🎯 Schedules for this sequence (String comparison):', sequenceSchedulesString);
      
      sequenceSchedules.forEach(s => {
        console.log(`📅 Schedule ${s.scheduleId}: status="${s.scheduleStatus}", isActive="${s.isActive}", sequenceId=${s.sequenceId}`);
      });
    }
    
    const targetSequenceId = Number(selectedSequence);
    const targetSequenceStr = String(selectedSequence);
    
    const existingSchedule = schedules.find(s => 
      s?.sequenceId == targetSequenceId && 
      s?.scheduleStatus === 'ACTIVE' &&
      s?.isActive !== false
    );
    
    console.log('✅ Found active schedule:', existingSchedule);
    return existingSchedule || null;
  };

  // Helper function to get existing paused schedule for selected sequence
  const getExistingPausedSchedule = (): DeliverySchedule | null => {
    if (!selectedSequence || !schedules) return null;
    
    const targetSequenceId = Number(selectedSequence);
    const targetSequenceStr = String(selectedSequence);
    
    console.log('🔍 PAUSED SCHEDULE DEBUG:', { targetSequenceId, targetSequenceStr, schedulesLength: schedules.length });
    
    const pausedSchedule = schedules.find(s => 
      s?.sequenceId == targetSequenceId && 
      s?.scheduleStatus === 'PAUSED' &&
      s?.isActive !== false
    );
    
    console.log('🎯 PAUSED SCHEDULE RESULT:', pausedSchedule);
    return pausedSchedule || null;
  };

  // Helper function to get count of existing active schedules
  const getExistingActiveScheduleCount = (): number => {
    if (!selectedSequence || !schedules) return 0;
    
    return schedules.filter(s => 
      s.sequenceId === Number(selectedSequence) && 
      s.scheduleStatus === 'ACTIVE' &&
      s.isActive !== false
    ).length;
  };

  // Helper function to determine the appropriate schedule action
  const getScheduleAction = () => {
    const activeSchedule = getExistingActiveSchedule();
    const pausedSchedule = getExistingPausedSchedule();
    
    if (activeSchedule) {
      return { 
        action: 'edit' as const, 
        schedule: activeSchedule, 
        text: 'Edit Active Schedule',
        icon: 'edit' as const
      };
    } else if (pausedSchedule) {
      const remainingHuddles = pausedSchedule.maxExecutions 
        ? pausedSchedule.maxExecutions - pausedSchedule.executionCount 
        : 'unknown';
      return { 
        action: 'resume' as const, 
        schedule: pausedSchedule, 
        text: 'Resume Paused Schedule',
        icon: 'play' as const,
        info: `${pausedSchedule.executionCount} of ${pausedSchedule.maxExecutions} huddles already released. ${remainingHuddles} remaining.`
      };
    } else {
      return { 
        action: 'create' as const, 
        schedule: null, 
        text: 'Create Schedule',
        icon: 'plus' as const
      };
    }
  };

  // Handler to resume a paused schedule
  const handleResumeSchedule = async (schedule: DeliverySchedule) => {
    try {
      await apiClient.resumeSchedule(schedule.scheduleId);
      success(`Schedule resumed successfully! Will continue from huddle ${schedule.executionCount + 1}.`);
      await refetch();
    } catch (err: any) {
      console.error('Failed to resume schedule:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
      error(`Failed to resume schedule: ${errorMessage}`);
    }
  };

  // Enhanced smart handler that creates, edits, or resumes based on existing schedules
  const handleSmartScheduleAction = () => {
    const scheduleAction = getScheduleAction();
    
    switch (scheduleAction.action) {
      case 'edit':
        handleEditSchedule(scheduleAction.schedule!);
        info('Editing existing active schedule for this sequence.');
        break;
      case 'resume':
        handleResumeSchedule(scheduleAction.schedule!);
        break;
      case 'create':
        handleCreateSchedule();
        break;
    }
  };

  const columns = [
    {
      key: 'frequencyType',
      header: 'Frequency',
      render: (schedule: DeliverySchedule) => (
        <Badge variant="info">{schedule.frequencyType}</Badge>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (schedule: DeliverySchedule) => (
        <span className="text-sm text-gray-900">
          {formatDate(schedule.startDate)}
        </span>
      ),
    },
    {
      key: 'releaseTime',
      header: 'Release Time',
      render: (schedule: DeliverySchedule) => (
        <span className="text-sm text-gray-900">
          {schedule.releaseTime} ({schedule.timeZone})
        </span>
      ),
    },
    {
      key: 'daysOfWeek',
      header: 'Days',
      render: (schedule: DeliverySchedule) => (
        <div className="flex flex-wrap gap-1">
          {schedule.daysOfWeek?.map((day) => (
            <Badge key={day} variant="default" size="sm">
              {day.slice(0, 3)}
            </Badge>
          )) || 'All days'}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (schedule: DeliverySchedule) => (
        <Badge variant={schedule.isActive ? 'success' : 'error'}>
          {schedule.isActive ? 'Active' : 'Paused'}
        </Badge>
      ),
    },
    {
      key: 'options',
      header: 'Options',
      render: (schedule: DeliverySchedule) => (
        <div className="flex items-center space-x-2 text-sm">
          {schedule.autoPublish && (
            <Badge variant="info" size="sm">Auto Publish</Badge>
          )}
          {schedule.sendNotifications && (
            <Badge variant="warning" size="sm">Notifications</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (schedule: DeliverySchedule) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditSchedule(schedule)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleSchedule(schedule)}
          >
            {schedule.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteSchedule(schedule.scheduleId)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to manage schedules.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Scheduling"
        description={`Manage automated huddle release schedules for ${currentAgency.name}`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Schedules</div>
              <div className="text-2xl font-bold text-gray-900">
                {schedules?.filter(s => s.isActive).length || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Scheduled Sequences</div>
              <div className="text-2xl font-bold text-gray-900">
                {sequences?.filter(s => s.sequenceStatus === 'PUBLISHED').length || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Schedules</div>
              <div className="text-2xl font-bold text-gray-900">
                {schedules?.length || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="w-full sm:w-64">
          <Select
            label="Select Sequence"
            value={selectedSequence}
            onChange={(e) => setSelectedSequence(e.target.value)}
            options={[
              { value: '', label: 'All Sequences' },
              ...(sequences?.map(seq => ({
                value: seq.sequenceId.toString(),
                label: seq.title,
              })) || []),
            ]}
          />
          {/* Schedule Status Information */}
          {selectedSequence && (
            <div className="mt-2">
              {(() => {
                // Debug logging right before checking schedules
                console.log('🔍 STATUS CHECK: selectedSequence =', selectedSequence);
                console.log('📊 STATUS CHECK: schedules =', schedules);
                if (schedules && schedules.length > 0) {
                  console.log('🎯 STATUS CHECK: All schedule data:', JSON.stringify(schedules, null, 2));
                  // Enhanced filtering with multiple approaches
                  const targetSequenceId = Number(selectedSequence);
                  const targetSequenceStr = String(selectedSequence);
                  
                  console.log('🎯 TARGET VALUES:', { targetSequenceId, targetSequenceStr });
                  
                  // Filter schedules for the selected sequence
                  const sequenceSchedules = schedules.filter(s => s?.sequenceId == targetSequenceId);
                  
                  console.log('🎯 STATUS CHECK: Filtered schedules for sequence:', sequenceSchedules);
                  
                  // Test different filtering approaches
                  console.log('🧪 TEST 1: Direct sequenceId:', schedules.filter(s => s?.sequenceId == Number(selectedSequence)));
                  console.log('🧪 TEST 2: Direct sequenceId match:', schedules.filter(s => s?.sequenceId == Number(selectedSequence)));
                  console.log('🧪 TEST 3: Nested sequence.id:', schedules.filter(s => (s as any)?.sequence?.id == selectedSequence));
                  console.log('🧪 TEST 4: Snake case sequence_id:', schedules.filter(s => (s as any)?.sequence_id == selectedSequence));
                  console.log('🧪 TEST 5: Just id:', schedules.filter(s => (s as any)?.id == selectedSequence));
                  console.log('🧪 TEST 6: Active schedules:', schedules.filter(s => s?.scheduleStatus === 'ACTIVE'));
                  console.log('🧪 TEST 7: Paused schedules:', schedules.filter(s => s?.scheduleStatus === 'PAUSED'));
                }
                
                const activeSchedule = getExistingActiveSchedule();
                const pausedSchedule = getExistingPausedSchedule();
                const scheduleAction = getScheduleAction();
                
                if (activeSchedule) {
                  return (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-green-700">Has active schedule</span>
                      </div>
                      <span className="text-gray-500">
                        • {activeSchedule.frequencyType} • 
                        Next: {activeSchedule.nextExecutionTime ? 
                          formatDateTime(activeSchedule.nextExecutionTime) : 'Not scheduled'}
                      </span>
                    </div>
                  );
                } else if (pausedSchedule) {
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                          <span className="text-yellow-700">Has paused schedule</span>
                        </div>
                        <span className="text-gray-500">
                          • {pausedSchedule.frequencyType} • 
                          Progress: {pausedSchedule.executionCount}/{pausedSchedule.maxExecutions}
                        </span>
                      </div>
                      {scheduleAction.info && (
                        <div className="text-xs text-yellow-600 ml-3">
                          {scheduleAction.info}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center space-x-1 text-sm">
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                      <span className="text-gray-600">No schedules</span>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleSmartScheduleAction}
            disabled={!selectedSequence}
          >
            {(() => {
              const scheduleAction = getScheduleAction();
              switch (scheduleAction.icon) {
                case 'edit':
                  return (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      {scheduleAction.text}
                    </>
                  );
                case 'play':
                  return (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {scheduleAction.text}
                    </>
                  );
                case 'plus':
                default:
                  return (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {scheduleAction.text}
                    </>
                  );
              }
            })()}
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Schedules Table */}
      <DataTable
        data={schedules || []}
        columns={columns}
        loading={loading}
        emptyMessage={
          selectedSequence 
            ? (() => {
                const scheduleAction = getScheduleAction();
                return `No schedules found for the selected sequence. Click '${scheduleAction.text}' to ${
                  scheduleAction.action === 'edit' ? 'modify the existing schedule' :
                  scheduleAction.action === 'resume' ? 'continue from where you left off' :
                  'add one'
                }.`;
              })()
            : sequences && sequences.length > 0 
              ? "Showing all schedules for the agency. Select a specific sequence to filter or create new schedules."
              : "No sequences available. Create a sequence first to manage schedules."
        }
        emptyIcon={<Calendar className="h-6 w-6" />}
      />

      {/* Create/Edit Schedule Modal */}
      {(isCreating || editingSchedule) && (
        <Modal
          isOpen={true}
          onClose={resetForm}
          title={editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
          size="lg"
        >
          <div className="p-6">
            <div className="space-y-6">
              {/* Sequence Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Sequence</h4>
                <p className="text-sm text-gray-900">
                  {editingSchedule 
                    ? `Editing schedule for: ${editingSchedule.scheduleId}`
                    : sequences?.find(s => s.sequenceId.toString() === selectedSequence)?.title || 'None selected'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frequency Type */}
                <div>
                  <Select
                    label="Frequency Type *"
                    value={formData.frequencyType || ''}
                    onChange={(e) => handleInputChange('frequencyType', e.target.value)}
                    options={[
                      { value: 'DAILY', label: 'Daily' },
                      { value: 'WEEKLY', label: 'Weekly' },
                      { value: 'MONTHLY', label: 'Monthly' },
                      { value: 'INTERVAL', label: 'Custom Interval' }
                    ]}
                    error={formErrors.frequencyType}
                  />
                </div>

                {/* Release Time */}
                <div>
                  <Input
                    type="time"
                    label="Release Time *"
                    value={formData.releaseTime || ''}
                    onChange={(e) => handleInputChange('releaseTime', e.target.value)}
                    error={formErrors.releaseTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <Input
                    type="date"
                    label="Start Date *"
                    value={formData.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={formErrors.startDate}
                  />
                </div>

                {/* End Date */}
                <div>
                  <Input
                    type="date"
                    label="End Date (Optional)"
                    value={formData.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={formErrors.endDate}
                    placeholder="Leave empty for indefinite"
                  />
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <div className="space-y-2">
                  <Select
                    value={formData.timeZone || ''}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    options={[
                      { 
                        value: '', 
                        label: sequences?.find(s => s.sequenceId.toString() === selectedSequence)?.branchState 
                          ? `Auto-detected: ${getTimezoneAbbreviationForState(sequences.find(s => s.sequenceId.toString() === selectedSequence)?.branchState || '')} (${sequences.find(s => s.sequenceId.toString() === selectedSequence)?.branchState})` 
                          : 'Auto-detected (Local)'
                      },
                      ...getUSTimezones().map(tz => ({
                        value: tz.timezone,
                        label: tz.label
                      }))
                    ]}
                  />
                  <p className="text-xs text-gray-500">
                    {sequences?.find(s => s.sequenceId.toString() === selectedSequence)?.branchState
                      ? `Automatically detected based on branch state: ${sequences.find(s => s.sequenceId.toString() === selectedSequence)?.branchState}`
                      : 'Select a timezone or use auto-detected setting'
                    }
                  </p>
                </div>
              </div>

              {/* Days of Week - Only show for weekly frequency */}
              {formData.frequencyType === 'WEEKLY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Days of Week *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={(formData.daysOfWeek || []).includes(day)}
                          onChange={() => handleDayToggle(day)}
                        />
                        <span className="text-sm text-gray-700">
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formErrors.daysOfWeek && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.daysOfWeek}</p>
                  )}
                </div>
              )}

              {/* Interval Days - Only show for interval frequency */}
              {formData.frequencyType === 'INTERVAL' && (
                <div>
                  <Input
                    type="number"
                    label="Interval (Days) *"
                    value={formData.intervalDays || ''}
                    onChange={(e) => handleInputChange('intervalDays', parseInt(e.target.value))}
                    error={formErrors.intervalDays}
                    min="1"
                    placeholder="Number of days between releases"
                  />
                </div>
              )}

              {/* Total Huddles Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Schedule Information</h4>
                <p className="text-sm text-blue-600">
                  This schedule will automatically stop after releasing all huddles in the sequence.
                  {sequences?.find(s => s.sequenceId.toString() === selectedSequence)?.totalHuddles && (
                    <> Total huddles to release: <strong>{sequences.find(s => s.sequenceId.toString() === selectedSequence)?.totalHuddles}</strong></>
                  )}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Options</h4>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.autoPublish || false}
                    onChange={(checked) => handleInputChange('autoPublish', checked)}
                  />
                  <span className="text-sm text-gray-700">
                    Auto-publish huddles when released
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.sendNotifications || false}
                    onChange={(checked) => handleInputChange('sendNotifications', checked)}
                  />
                  <span className="text-sm text-gray-700">
                    Send notifications to users
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.isActive !== false}
                    onChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <span className="text-sm text-gray-700">
                    Schedule is active
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSchedule}
                  disabled={isSaving || !formData.frequencyType}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </>
  );
};