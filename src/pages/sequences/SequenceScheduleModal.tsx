// pages/sequences/SequenceScheduleModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Repeat, Bell } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';
import { HuddleSequence, CreateScheduleRequest, FrequencyType } from '../../types';

interface SequenceScheduleModalProps {
  sequence: HuddleSequence;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SequenceScheduleModal: React.FC<SequenceScheduleModalProps> = ({
  sequence,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
  } = useForm<CreateScheduleRequest>({
    defaultValues: {
      frequencyType: 'WEEKLY',
      startDate: new Date().toISOString().split('T')[0],
      releaseTime: '09:00',
      timeZone: 'America/New_York',
      autoPublish: true,
      sendNotifications: true,
    },
  });

  const watchedFrequency = watch('frequencyType');

  const onSubmit = async (data: CreateScheduleRequest) => {
    try {
      // Format the datetime properly for backend LocalDateTime format
      const scheduleData = {
        ...data,
        startDate: new Date(data.startDate + 'T' + data.releaseTime + ':00').toISOString().slice(0, -1), // Remove 'Z' for LocalDateTime
        daysOfWeek: watchedFrequency === 'WEEKLY' ? data.daysOfWeek : undefined,
      };

      await apiClient.createSchedule(sequence.sequenceId, scheduleData);
      onSuccess();
    } catch (error: any) {
      setError('startDate', {
        type: 'server',
        message: error.response?.data?.message || 'Failed to create schedule',
      });
    }
  };

  const frequencyOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
  ];

  const dayOptions = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900">{sequence.title}</h4>
        <p className="text-sm text-gray-500 mt-1">
          Schedule automatic release and notifications for this sequence
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Schedule Settings */}
        <Card>
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Schedule Settings
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Frequency"
              {...register('frequencyType', { required: 'Frequency is required' })}
              error={errors.frequencyType?.message}
              options={frequencyOptions}
            />

            <Input
              label="Start Date"
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              error={errors.startDate?.message}
            />

            <Input
              label="Release Time"
              type="time"
              {...register('releaseTime', { required: 'Release time is required' })}
              error={errors.releaseTime?.message}
            />

            <Input
              label="Time Zone"
              {...register('timeZone')}
              error={errors.timeZone?.message}
              placeholder="America/New_York"
            />
          </div>

          {/* Weekly Day Selection */}
          {watchedFrequency === 'WEEKLY' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {dayOptions.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={day.value}
                      {...register('daysOfWeek')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Advanced Options */}
        <Card>
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-600" />
              Options
            </h5>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoPublish"
                {...register('autoPublish')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoPublish" className="ml-2 block text-sm text-gray-900">
                Automatically publish huddles when released
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendNotifications"
                {...register('sendNotifications')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendNotifications" className="ml-2 block text-sm text-gray-900">
                Send notifications to target users
              </label>
            </div>
          </div>
        </Card>

        {/* Huddle Release Strategy */}
        <Card>
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-900 flex items-center">
              <Repeat className="h-4 w-4 mr-2 text-purple-600" />
              Release Strategy
            </h5>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h6 className="text-sm font-medium text-gray-900 mb-2">How Huddles Will Be Released:</h6>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Sequential Release:</strong> Huddles are released one at a time according to schedule</li>
              <li>• <strong>Progressive Unlock:</strong> Users must complete current huddle to access the next one</li>
              <li>• <strong>Automatic Assessments:</strong> Assessments are assigned upon huddle completion</li>
              <li>• <strong>Role-based Visibility:</strong> Content is shown only to targeted roles and disciplines</li>
              <li>• <strong>Progress Tracking:</strong> Individual and team progress is monitored in real-time</li>
            </ul>
          </div>
        </Card>

        {/* Preview */}
        <Card className="bg-blue-50">
          <div className="mb-4">
            <h5 className="text-md font-medium text-blue-900 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Schedule Preview
            </h5>
          </div>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Sequence:</strong> {sequence.title} ({sequence.totalHuddles} huddles)
            </p>
            <p>
              <strong>Release Frequency:</strong> {watchedFrequency.toLowerCase()}
              {watchedFrequency === 'WEEKLY' && ' on selected days'}
            </p>
            <p>
              <strong>Target Audience:</strong> {sequence.targets?.map(t => t.targetDisplayName).join(', ') || 'Not specified'}
            </p>
            <p>
              <strong>Estimated Duration:</strong> {sequence.estimatedDurationMinutes || 'Not specified'} minutes per huddle
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Schedule
          </Button>
        </div>
      </form>
    </div>
  );
};