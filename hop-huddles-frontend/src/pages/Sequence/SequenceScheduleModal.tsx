import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X, Calendar, Clock, Repeat } from 'lucide-react';
import type { HuddleSequence, CreateScheduleRequest, FrequencyType } from '../../types';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface SequenceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: HuddleSequence | null;
  onSuccess: () => void;
}

const frequencyTypes: { value: FrequencyType; label: string; description: string }[] = [
  { value: 'DAILY', label: 'Daily', description: 'Release every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Release once per week' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Release once per month' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom schedule' },
];

const daysOfWeek = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

const timeZones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
];

const SequenceScheduleModal: React.FC<SequenceScheduleModalProps> = ({
  isOpen,
  onClose,
  sequence,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateScheduleRequest>({
    defaultValues: {
      frequencyType: 'WEEKLY',
      releaseTime: '09:00',
      timeZone: 'America/New_York',
      autoPublish: true,
      sendNotifications: true,
      daysOfWeek: ['MONDAY'],
    },
  });

  const selectedFrequency = watch('frequencyType');

  // Create schedule mutation
  const createScheduleMutation = useMutation(
    (data: CreateScheduleRequest) => {
      if (!sequence) throw new Error('No sequence selected');
      return apiClient.createSchedule(sequence.sequenceId, data);
    },
    {
      onSuccess: () => {
        onSuccess();
        reset();
      },
      onError: () => {
        toast.error('Failed to create schedule');
      }
    }
  );

  const handleFormSubmit = (data: CreateScheduleRequest) => {
    // Format the start date to ISO string
    const startDate = new Date(data.startDate);
    const [hours, minutes] = data.releaseTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const scheduleData: CreateScheduleRequest = {
      ...data,
      startDate: startDate.toISOString(),
      daysOfWeek: selectedFrequency === 'WEEKLY' || selectedFrequency === 'CUSTOM' 
        ? data.daysOfWeek 
        : undefined,
    };

    createScheduleMutation.mutate(scheduleData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !sequence) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Schedule Delivery: {sequence.title}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Frequency Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Repeat size={16} className="inline mr-2" />
                    Frequency *
                  </label>
                  <div className="space-y-2">
                    {frequencyTypes.map((freq) => (
                      <label key={freq.value} className="flex items-center">
                        <input
                          type="radio"
                          value={freq.value}
                          {...register('frequencyType', { required: 'Frequency is required' })}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{freq.label}</div>
                          <div className="text-xs text-gray-500">{freq.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.frequencyType && (
                    <p className="mt-1 text-sm text-red-600">{errors.frequencyType.message}</p>
                  )}
                </div>

                {/* Days of Week (for Weekly and Custom) */}
                {(selectedFrequency === 'WEEKLY' || selectedFrequency === 'CUSTOM') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map((day) => (
                        <label key={day.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={day.value}
                            {...register('daysOfWeek', { 
                              required: 'At least one day must be selected' 
                            })}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.daysOfWeek && (
                      <p className="mt-1 text-sm text-red-600">{errors.daysOfWeek.message}</p>
                    )}
                  </div>
                )}

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    <Calendar size={16} className="inline mr-2" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    {...register('startDate', { required: 'Start date is required' })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                {/* Release Time */}
                <div>
                  <label htmlFor="releaseTime" className="block text-sm font-medium text-gray-700">
                    <Clock size={16} className="inline mr-2" />
                    Release Time *
                  </label>
                  <input
                    type="time"
                    id="releaseTime"
                    {...register('releaseTime', { required: 'Release time is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.releaseTime ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.releaseTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.releaseTime.message}</p>
                  )}
                </div>

                {/* Time Zone */}
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                    Time Zone *
                  </label>
                  <select
                    id="timeZone"
                    {...register('timeZone', { required: 'Time zone is required' })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.timeZone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    {timeZones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  {errors.timeZone && (
                    <p className="mt-1 text-sm text-red-600">{errors.timeZone.message}</p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoPublish"
                      {...register('autoPublish')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoPublish" className="text-sm text-gray-900">
                      Automatically publish huddles when scheduled
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendNotifications"
                      {...register('sendNotifications')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sendNotifications" className="text-sm text-gray-900">
                      Send notifications to target users
                    </label>
                  </div>
                </div>

                {/* Schedule Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Schedule Preview</h4>
                  <p className="text-sm text-blue-700">
                    This sequence will be delivered {selectedFrequency.toLowerCase()} 
                    {selectedFrequency === 'WEEKLY' && ' on selected days'}
                    {selectedFrequency === 'MONTHLY' && ' on the same date each month'}
                    . Total of {sequence.totalHuddles} huddles will be released according to this schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={createScheduleMutation.isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createScheduleMutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Schedule...
                  </div>
                ) : (
                  'Create Schedule'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SequenceScheduleModal;