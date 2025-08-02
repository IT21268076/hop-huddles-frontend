// pages/scheduling/CombinationSchedulingPage.tsx
// ⭐ NEW SERIES-EPISODE SCHEDULING PAGE
// Manages combination-aware scheduling where each role-discipline pair is a series

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Play, Pause, Settings, Users, Plus, Edit, Trash2, Save, X, BarChart3, TrendingUp } from 'lucide-react';
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
import { 
  CombinationSchedule, 
  CreateCombinationScheduleRequest,
  UpdateCombinationScheduleRequest,
  HuddleSequence, 
  HuddleCombination,
  ScheduleStatistics,
  FrequencyType,
  ScheduleStatus,
  UserRole,
  Discipline
} from '../../types';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { getTimezoneStringForState, getTimezoneAbbreviationForState, getUSTimezones } from '../../utils/timezoneUtils';

export const CombinationSchedulingPage: React.FC = () => {
  const { currentAgency, currentUser } = useApp();
  const { success, error, warning, info } = useToast();
  
  // State management
  const [selectedSequence, setSelectedSequence] = useState<string>('');
  const [selectedCombination, setSelectedCombination] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CombinationSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateCombinationScheduleRequest>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'all' | 'sequence' | 'combination'>('all');

  // Load sequences for the agency
  const {
    data: sequences,
    loading: sequencesLoading,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      try {
        const seqs = await apiClient.getSequencesByAgency(currentAgency.agencyId);
        return seqs.filter(seq => seq.sequenceStatus === 'PUBLISHED'); // Only show published sequences
      } catch (error) {
        console.error('Error loading sequences:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  // Load combinations for selected sequence
  const {
    data: combinations,
    loading: combinationsLoading,
  } = useAsync(
    async () => {
      if (!selectedSequence) return [];
      try {
        const seq = await apiClient.getSequence(Number(selectedSequence));
        return seq.combinations || [];
      } catch (error) {
        console.error('Error loading combinations:', error);
        return [];
      }
    },
    [selectedSequence]
  );

  // Load combination schedules based on view mode
  const {
    data: schedules,
    loading: schedulesLoading,
    refetch: refetchSchedules,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      
      try {
        if (viewMode === 'all') {
          // Show all combination schedules for the agency
          return await apiClient.getAgencyCombinationSchedules(currentAgency.agencyId);
        } else if (viewMode === 'sequence' && selectedSequence) {
          // Show all combination schedules for a specific sequence
          return await apiClient.getSequenceCombinationSchedules(Number(selectedSequence));
        } else if (viewMode === 'combination' && selectedCombination) {
          // Show schedules for a specific combination
          return await apiClient.getCombinationSchedules(Number(selectedCombination));
        }
        return [];
      } catch (error) {
        console.error('Error loading combination schedules:', error);
        return [];
      }
    },
    [viewMode, selectedSequence, selectedCombination, currentAgency?.agencyId]
  );

  // Load agency schedule statistics
  const {
    data: statistics,
    loading: statisticsLoading,
  } = useAsync(
    async () => {
      if (!currentAgency) return null;
      try {
        return await apiClient.getAgencyScheduleStatistics(currentAgency.agencyId);
      } catch (error) {
        console.error('Error loading schedule statistics:', error);
        return null;
      }
    },
    [currentAgency?.agencyId]
  );

  // Enhanced schedule data with combination details
  const enrichedSchedules = useMemo(() => {
    if (!schedules || !combinations.length) return schedules || [];
    
    return schedules.map(schedule => {
      const combination = combinations.find(c => c.combinationId === schedule.combinationId);
      return {
        ...schedule,
        // Add display-friendly fields
        seriesTitle: combination ? `${combination.userRole} - ${combination.discipline}` : 'Unknown Series',
        currentEpisodeTitle: `Episode ${schedule.currentHuddleIndex + 1}`,
        episodeProgress: `Episode ${schedule.currentHuddleIndex + 1} of ${schedule.totalHuddlesInCombination}`,
        hasAllEpisodesReleased: schedule.currentHuddleIndex >= schedule.totalHuddlesInCombination,
        completionPercentage: schedule.totalHuddlesInCombination > 0 
          ? Math.round((schedule.currentHuddleIndex / schedule.totalHuddlesInCombination) * 100) 
          : 0,
        userRole: combination?.userRole,
        discipline: combination?.discipline,
        combinationKey: combination ? `${combination.userRole}_${combination.discipline}` : 'unknown'
      };
    });
  }, [schedules, combinations]);

  // Handle schedule operations
  const handleCreateSchedule = async () => {
    if (!selectedCombination || !formData.frequencyType) {
      error('Please select a combination and frequency type');
      return;
    }

    setIsSaving(true);
    try {
      const scheduleRequest: CreateCombinationScheduleRequest = {
        combinationId: Number(selectedCombination),
        frequencyType: formData.frequencyType as FrequencyType,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate,
        releaseTime: formData.releaseTime || '09:00',
        timeZone: formData.timeZone || 'America/Los_Angeles',
        daysOfWeek: formData.daysOfWeek,
        autoPublish: formData.autoPublish ?? true,
        sendNotifications: formData.sendNotifications ?? true,
        notificationHoursBefore: formData.notificationHoursBefore ?? 24,
        reminderHoursBefore: formData.reminderHoursBefore ?? 1,
      };

      await apiClient.createCombinationSchedule(Number(selectedCombination), scheduleRequest);
      success('Series schedule created successfully');
      setIsCreating(false);
      setFormData({});
      await refetchSchedules();
    } catch (err: any) {
      console.error('Error creating schedule:', err);
      error(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    setIsSaving(true);
    try {
      const updateRequest: UpdateCombinationScheduleRequest = {
        frequencyType: formData.frequencyType as FrequencyType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        releaseTime: formData.releaseTime,
        timeZone: formData.timeZone,
        daysOfWeek: formData.daysOfWeek,
        autoPublish: formData.autoPublish,
        sendNotifications: formData.sendNotifications,
        notificationHoursBefore: formData.notificationHoursBefore,
        reminderHoursBefore: formData.reminderHoursBefore,
      };

      await apiClient.updateCombinationSchedule(editingSchedule.combinationScheduleId, updateRequest);
      success('Series schedule updated successfully');
      setEditingSchedule(null);
      setFormData({});
      await refetchSchedules();
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      error(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSchedule = async (schedule: CombinationSchedule) => {
    try {
      if (schedule.scheduleStatus === 'ACTIVE') {
        await apiClient.pauseCombinationSchedule(schedule.combinationScheduleId);
        success(`Series "${schedule.seriesTitle}" paused successfully`);
      } else if (schedule.scheduleStatus === 'PAUSED') {
        await apiClient.resumeCombinationSchedule(schedule.combinationScheduleId);
        success(`Series "${schedule.seriesTitle}" resumed successfully`);
      }
      await refetchSchedules();
    } catch (err: any) {
      console.error('Failed to toggle schedule:', err);
      error(`Failed to ${schedule.scheduleStatus === 'ACTIVE' ? 'pause' : 'resume'} series schedule`);
    }
  };

  const handleRestartSchedule = async (schedule: CombinationSchedule) => {
    try {
      await apiClient.restartCombinationSchedule(schedule.combinationScheduleId);
      success(`Series "${schedule.seriesTitle}" restarted from episode 1`);
      await refetchSchedules();
    } catch (err: any) {
      console.error('Failed to restart schedule:', err);
      error('Failed to restart series schedule');
    }
  };

  const handleDeleteSchedule = async (schedule: CombinationSchedule) => {
    if (!confirm(`Are you sure you want to delete the schedule for "${schedule.seriesTitle}"?`)) {
      return;
    }

    try {
      await apiClient.deleteCombinationSchedule(schedule.combinationScheduleId);
      success(`Series schedule deleted successfully`);
      await refetchSchedules();
    } catch (err: any) {
      console.error('Failed to delete schedule:', err);
      error('Failed to delete series schedule');
    }
  };

  // Bulk operations
  const handleCreateAllSchedules = async () => {
    if (!selectedSequence || !formData.frequencyType) {
      error('Please select a sequence and configure schedule settings');
      return;
    }

    try {
      const templateSchedule: CreateCombinationScheduleRequest = {
        combinationId: 0, // Will be overridden for each combination
        frequencyType: formData.frequencyType as FrequencyType,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate,
        releaseTime: formData.releaseTime || '09:00',
        timeZone: formData.timeZone || 'America/Los_Angeles',
        daysOfWeek: formData.daysOfWeek,
        autoPublish: formData.autoPublish ?? true,
        sendNotifications: formData.sendNotifications ?? true,
        notificationHoursBefore: formData.notificationHoursBefore ?? 24,
        reminderHoursBefore: formData.reminderHoursBefore ?? 1,
      };

      const createdSchedules = await apiClient.createSchedulesForAllCombinations(
        Number(selectedSequence), 
        templateSchedule
      );

      success(`Created schedules for ${createdSchedules.length} series in the sequence`);
      setIsCreating(false);
      setFormData({});
      await refetchSchedules();
    } catch (err: any) {
      console.error('Error creating bulk schedules:', err);
      error(err.response?.data?.message || 'Failed to create schedules for all combinations');
    }
  };

  // Render schedule status badge
  const renderStatusBadge = (schedule: CombinationSchedule) => {
    const statusConfig = {
      ACTIVE: { color: 'green', text: 'Active' },
      PAUSED: { color: 'yellow', text: 'Paused' },
      COMPLETED: { color: 'blue', text: 'Completed' },
      CANCELLED: { color: 'gray', text: 'Cancelled' },
      FAILED: { color: 'red', text: 'Failed' }
    };

    const config = statusConfig[schedule.scheduleStatus as keyof typeof statusConfig] || 
                  { color: 'gray', text: schedule.scheduleStatus };

    return <Badge color={config.color}>{config.text}</Badge>;
  };

  // Render progress indicator
  const renderProgressIndicator = (schedule: CombinationSchedule) => {
    const percentage = schedule.completionPercentage || 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {schedule.episodeProgress}
        </span>
      </div>
    );
  };

  // Table columns for combination schedules
  const scheduleColumns = [
    {
      header: 'Series (Role-Discipline)',
      accessor: 'seriesTitle' as keyof CombinationSchedule,
      render: (schedule: CombinationSchedule) => (
        <div className="font-medium">
          {schedule.seriesTitle}
          <div className="text-sm text-gray-500">
            {sequences?.find(s => s.sequenceId === schedule.sequenceId)?.title || 'Unknown Sequence'}
          </div>
        </div>
      )
    },
    {
      header: 'Episode Progress',
      accessor: 'episodeProgress' as keyof CombinationSchedule,
      render: renderProgressIndicator
    },
    {
      header: 'Schedule Pattern',
      accessor: 'frequencyType' as keyof CombinationSchedule,
      render: (schedule: CombinationSchedule) => (
        <div>
          <div className="font-medium">{schedule.frequencyType}</div>
          {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
            <div className="text-sm text-gray-500">
              {schedule.daysOfWeek.join(', ')}
            </div>
          )}
          {schedule.releaseTime && (
            <div className="text-sm text-gray-500">
              at {schedule.releaseTime}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'scheduleStatus' as keyof CombinationSchedule,
      render: renderStatusBadge
    },
    {
      header: 'Next Episode',
      accessor: 'nextExecutionTime' as keyof CombinationSchedule,
      render: (schedule: CombinationSchedule) => (
        <div>
          {schedule.hasAllEpisodesReleased ? (
            <span className="text-green-600 font-medium">Series Complete</span>
          ) : schedule.nextExecutionTime ? (
            <span>{formatDateTime(schedule.nextExecutionTime)}</span>
          ) : (
            <span className="text-gray-500">Not scheduled</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as keyof CombinationSchedule,
      render: (schedule: CombinationSchedule) => (
        <div className="flex space-x-2">
          {!schedule.hasAllEpisodesReleased && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleSchedule(schedule)}
            >
              {schedule.scheduleStatus === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingSchedule(schedule);
              setFormData({
                frequencyType: schedule.frequencyType,
                startDate: schedule.startDate?.split('T')[0],
                endDate: schedule.endDate?.split('T')[0],
                releaseTime: schedule.releaseTime,
                timeZone: schedule.timeZone,
                daysOfWeek: schedule.daysOfWeek,
                autoPublish: schedule.autoPublish,
                sendNotifications: schedule.sendNotifications,
                notificationHoursBefore: schedule.notificationHoursBefore,
                reminderHoursBefore: schedule.reminderHoursBefore,
              });
            }}
          >
            <Edit size={16} />
          </Button>

          {schedule.currentHuddleIndex > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRestartSchedule(schedule)}
            >
              Restart
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteSchedule(schedule)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  if (!currentAgency) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please select an agency to manage schedules.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="⭐ Series-Episode Scheduling"
        subtitle="Manage episode release schedules for each role-discipline combination"
      />

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Series</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeSeries}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Episodes</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.totalEpisodes}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Released Episodes</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.releasedEpisodes}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(statistics.completionPercentage)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </Card>
        </div>
      )}

      {/* View Mode and Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <Select
              value={viewMode}
              onChange={(value) => setViewMode(value as 'all' | 'sequence' | 'combination')}
              options={[
                { value: 'all', label: 'All Series' },
                { value: 'sequence', label: 'By Sequence' },
                { value: 'combination', label: 'By Combination' }
              ]}
            />
          </div>

          {viewMode !== 'all' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sequence:</label>
              <Select
                value={selectedSequence}
                onChange={setSelectedSequence}
                options={[
                  { value: '', label: 'Select a sequence...' },
                  ...(sequences || []).map(seq => ({
                    value: seq.sequenceId.toString(),
                    label: seq.title
                  }))
                ]}
                placeholder="Select sequence"
              />
            </div>
          )}

          {viewMode === 'combination' && selectedSequence && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Combination:</label>
              <Select
                value={selectedCombination}
                onChange={setSelectedCombination}
                options={[
                  { value: '', label: 'Select a combination...' },
                  ...(combinations || []).map(combo => ({
                    value: combo.combinationId.toString(),
                    label: `${combo.userRole} - ${combo.discipline}`
                  }))
                ]}
                placeholder="Select combination"
              />
            </div>
          )}

          <div className="ml-auto">
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={viewMode === 'combination' && !selectedCombination}
            >
              <Plus size={16} className="mr-2" />
              {viewMode === 'sequence' && selectedSequence ? 'Schedule All Series' : 'New Schedule'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedules Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {viewMode === 'all' ? 'All Series Schedules' : 
             viewMode === 'sequence' ? `Series in ${sequences?.find(s => s.sequenceId.toString() === selectedSequence)?.title || 'Selected Sequence'}` :
             'Selected Combination Schedule'}
          </h3>
        </div>
        
        <DataTable
          columns={scheduleColumns}
          data={enrichedSchedules}
          loading={schedulesLoading}
          emptyMessage={
            viewMode === 'all' 
              ? "No series schedules found. Create your first episode schedule!"
              : viewMode === 'sequence' && !selectedSequence
              ? "Please select a sequence to view its series schedules."
              : viewMode === 'combination' && !selectedCombination
              ? "Please select a combination to view its schedule."
              : `No schedules found for the selected ${viewMode}.`
          }
        />
      </Card>

      {/* Create/Edit Schedule Modal */}
      <Modal
        isOpen={isCreating || editingSchedule !== null}
        onClose={() => {
          setIsCreating(false);
          setEditingSchedule(null);
          setFormData({});
          setFormErrors({});
        }}
        title={editingSchedule ? 'Edit Series Schedule' : 'Create Series Schedule'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Combination Selection (only for create) */}
          {isCreating && viewMode !== 'combination' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sequence
                </label>
                <Select
                  value={selectedSequence}
                  onChange={setSelectedSequence}
                  options={[
                    { value: '', label: 'Select a sequence...' },
                    ...(sequences || []).map(seq => ({
                      value: seq.sequenceId.toString(),
                      label: seq.title
                    }))
                  ]}
                  placeholder="Select sequence"
                />
              </div>

              {selectedSequence && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Series (Role-Discipline Combination)
                  </label>
                  <Select
                    value={selectedCombination}
                    onChange={setSelectedCombination}
                    options={[
                      { value: '', label: 'Select a combination...' },
                      ...(combinations || []).map(combo => ({
                        value: combo.combinationId.toString(),
                        label: `${combo.userRole} - ${combo.discipline} (${combo.totalHuddles || 0} episodes)`
                      }))
                    ]}
                    placeholder="Select combination"
                  />
                </div>
              )}
            </>
          )}

          {/* Schedule Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release Frequency
              </label>
              <Select
                value={formData.frequencyType || ''}
                onChange={(value) => setFormData({...formData, frequencyType: value as FrequencyType})}
                options={[
                  { value: '', label: 'Select frequency...' },
                  { value: 'DAILY', label: 'Daily' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'MONTHLY', label: 'Monthly' }
                ]}
                placeholder="Select frequency"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release Time
              </label>
              <Input
                type="time"
                value={formData.releaseTime || ''}
                onChange={(e) => setFormData({...formData, releaseTime: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Weekly Days Selection */}
          {formData.frequencyType === 'WEEKLY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                  <label key={day} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.daysOfWeek?.includes(day) || false}
                      onChange={(checked) => {
                        const current = formData.daysOfWeek || [];
                        const updated = checked 
                          ? [...current, day]
                          : current.filter(d => d !== day);
                        setFormData({...formData, daysOfWeek: updated});
                      }}
                    />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={formData.autoPublish ?? true}
                onChange={(checked) => setFormData({...formData, autoPublish: checked})}
              />
              <span className="text-sm">Auto-publish episodes</span>
            </label>

            <label className="flex items-center space-x-2">
              <Checkbox
                checked={formData.sendNotifications ?? true}
                onChange={(checked) => setFormData({...formData, sendNotifications: checked})}
              />
              <span className="text-sm">Send notifications</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingSchedule(null);
                setFormData({});
              }}
            >
              Cancel
            </Button>
            
            {isCreating && viewMode === 'sequence' && selectedSequence ? (
              <Button
                onClick={handleCreateAllSchedules}
                disabled={isSaving}
              >
                {isSaving ? 'Creating...' : 'Create All Series Schedules'}
              </Button>
            ) : editingSchedule ? (
              <Button
                onClick={handleUpdateSchedule}
                disabled={isSaving}
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Updating...' : 'Update Schedule'}
              </Button>
            ) : (
              <Button
                onClick={handleCreateSchedule}
                disabled={isSaving || !selectedCombination}
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Creating...' : 'Create Schedule'}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};