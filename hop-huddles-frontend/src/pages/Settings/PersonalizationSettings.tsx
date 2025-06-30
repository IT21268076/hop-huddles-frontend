// pages/Settings/PersonalizationSettings.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { 
  User, 
  Bell, 
  Eye, 
  Clock, 
  Palette, 
  Layout, 
  Volume2,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageCircle,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { UserPreferences } from '../../types';
import toast from 'react-hot-toast';

interface PersonalizationData {
  // Notification Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    huddleReleases: boolean;
    completionReminders: boolean;
    achievementUnlocks: boolean;
    weeklyDigest: boolean;
    reminderTiming: number; // hours before
  };
  
  // Huddle Preferences
  huddles: {
    autoPlay: boolean;
    playbackSpeed: number;
    preferredLanguage: string;
    showTranscripts: boolean;
    enableCaptions: boolean;
    playbackQuality: 'low' | 'medium' | 'high';
  };
  
  // Dashboard Preferences
  dashboard: {
    layout: 'compact' | 'detailed' | 'cards';
    showQuickStats: boolean;
    showRecentProgress: boolean;
    showUpcomingHuddles: boolean;
    defaultView: 'overview' | 'progress' | 'sequences';
    widgetOrder: string[];
  };
  
  // Appearance Preferences
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  
  // Privacy Preferences
  privacy: {
    shareProgressWithTeam: boolean;
    allowPerformanceComparisons: boolean;
    shareAchievements: boolean;
    dataAnalyticsOptIn: boolean;
  };
}

const PersonalizationSettings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'huddles' | 'dashboard' | 'appearance' | 'privacy'>('profile');

  // Fetch current preferences
  const { data: currentPreferences, isLoading } = useQuery(
    ['user-preferences', user?.userId],
    () => user ? apiClient.getUserPreferences(user.userId) : Promise.resolve(null),
    { enabled: !!user }
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
    } = useForm<PersonalizationData>({
    defaultValues: {
        notifications: {
        email: currentPreferences?.notificationSettings?.email ?? true,
        sms: currentPreferences?.notificationSettings?.sms ?? false,
        inApp: currentPreferences?.notificationSettings?.inApp ?? true,
        huddleReleases: true,
        completionReminders: true,
        achievementUnlocks: true,
        weeklyDigest: true,
        reminderTiming: 24
        },
        huddles: {
        autoPlay: currentPreferences?.huddleSettings?.autoPlay ?? false,
        playbackSpeed: currentPreferences?.huddleSettings?.playbackSpeed ?? 1.0,
        preferredLanguage: currentPreferences?.huddleSettings?.preferredLanguage ?? 'en',
        showTranscripts: true,
        enableCaptions: false,
        playbackQuality: 'medium' as const
        },
        dashboard: {
        layout: currentPreferences?.dashboardLayout ?? 'cards',
        showQuickStats: true,
        showRecentProgress: true,
        showUpcomingHuddles: true,
        defaultView: 'overview' as const,
        widgetOrder: ['stats', 'progress', 'upcoming', 'achievements']
        },
        appearance: {
        theme: 'auto' as const,
        colorScheme: 'blue' as const,
        fontSize: 'medium' as const,
        density: 'comfortable' as const
        },
        privacy: {
        shareProgressWithTeam: true,
        allowPerformanceComparisons: false,
        shareAchievements: true,
        dataAnalyticsOptIn: true
        }
    }
    });

    // UPDATE the onSubmit function typing
    const onSubmit = (data: PersonalizationData) => {
    updatePreferencesMutation.mutate(data);
    };

  const updatePreferencesMutation = useMutation(
    (preferences: PersonalizationData) => 
      user ? apiClient.updateUserPreferences(user.userId, preferences) : Promise.reject(),
    {
      onSuccess: () => {
        toast.success('Preferences updated successfully');
        queryClient.invalidateQueries(['user-preferences']);
      },
      onError: () => {
        toast.error('Failed to update preferences');
      }
    }
  );

  const resetToDefaultsMutation = useMutation(
    () => user ? apiClient.resetUserPreferencesToDefaults(user.userId) : Promise.reject(),
    {
      onSuccess: () => {
        toast.success('Preferences reset to defaults');
        queryClient.invalidateQueries(['user-preferences']);
      },
      onError: () => {
        toast.error('Failed to reset preferences');
      }
    }
  );

//   const onSubmit = (data: PersonalizationData) => {
//     updatePreferencesMutation.mutate(data);
//   };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all preferences to defaults? This cannot be undone.')) {
      resetToDefaultsMutation.mutate();
    }
  };

  const watchedTheme = watch('appearance.theme');
  const watchedLayout = watch('dashboard.layout');

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Profile Information</h3>
        <p className="text-sm text-blue-700">
          Your basic profile information is managed through your organization's user management system.
        </p>
      </div>

      {user && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.assignments.map(a => a.role).join(', ')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Login</label>
              <p className="text-sm text-gray-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('notifications.email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive text message alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('notifications.sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-600">Show notifications within the app</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('notifications.inApp')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        
        <div className="space-y-4">
          {[
            { key: 'huddleReleases', label: 'New Huddle Releases', description: 'When new huddles are published' },
            { key: 'completionReminders', label: 'Completion Reminders', description: 'Reminders for incomplete huddles' },
            { key: 'achievementUnlocks', label: 'Achievement Unlocks', description: 'When you earn new achievements' },
            { key: 'weeklyDigest', label: 'Weekly Progress Digest', description: 'Weekly summary of your progress' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{notification.label}</p>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`notifications.${notification.key}` as any)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Timing</h3>
        <div className="flex items-center space-x-4">
          <Clock className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send reminders this many hours before deadlines
            </label>
            <select
              {...register('notifications.reminderTiming')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 hour</option>
              <option value={4}>4 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHuddlesTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Playback Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-play Huddles</p>
              <p className="text-sm text-gray-600">Automatically start playing when opened</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('huddles.autoPlay')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Playback Speed
            </label>
            <select
              {...register('huddles.playbackSpeed')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x (Normal)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Playback Quality
            </label>
            <select
              {...register('huddles.playbackQuality')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low (Faster loading)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Best quality)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Show Transcripts</p>
              <p className="text-sm text-gray-600">Display text transcripts alongside audio</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('huddles.showTranscripts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Captions</p>
              <p className="text-sm text-gray-600">Show closed captions for audio content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('huddles.enableCaptions')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Layout</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { value: 'compact', label: 'Compact', description: 'Dense information view' },
            { value: 'detailed', label: 'Detailed', description: 'Comprehensive view with details' },
            { value: 'cards', label: 'Cards', description: 'Card-based layout' }
          ].map((layout) => (
            <label key={layout.value} className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
              watchedLayout === layout.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                value={layout.value}
                {...register('dashboard.layout')}
                className="sr-only"
              />
              <div className="text-center">
                <Layout className={`mx-auto h-8 w-8 mb-2 ${
                  watchedLayout === layout.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900">{layout.label}</p>
                <p className="text-xs text-gray-600 mt-1">{layout.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default View
          </label>
          <select
            {...register('dashboard.defaultView')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="progress">My Progress</option>
            <option value="sequences">Huddle Sequences</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Widgets</h3>
        
        <div className="space-y-4">
          {[
            { key: 'showQuickStats', label: 'Quick Statistics', description: 'Show progress and completion stats' },
            { key: 'showRecentProgress', label: 'Recent Progress', description: 'Display recently completed huddles' },
            { key: 'showUpcomingHuddles', label: 'Upcoming Huddles', description: 'Show scheduled and assigned huddles' }
          ].map((widget) => (
            <div key={widget.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{widget.label}</p>
                <p className="text-sm text-gray-600">{widget.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`dashboard.${widget.key}` as any)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'auto', label: 'Auto', icon: Monitor }
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <label key={theme.value} className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                watchedTheme === theme.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value={theme.value}
                  {...register('appearance.theme')}
                  className="sr-only"
                />
                <div className="text-center">
                  <Icon className={`mx-auto h-8 w-8 mb-2 ${
                    watchedTheme === theme.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">{theme.label}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: 'blue', color: 'bg-blue-500' },
            { value: 'green', color: 'bg-green-500' },
            { value: 'purple', color: 'bg-purple-500' },
            { value: 'orange', color: 'bg-orange-500' }
          ].map((scheme) => (
            <label key={scheme.value} className="cursor-pointer">
              <input
                type="radio"
                value={scheme.value}
                {...register('appearance.colorScheme')}
                className="sr-only peer"
              />
              <div className={`w-full h-12 rounded-lg ${scheme.color} peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:ring-blue-300`} />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Font Size</h4>
          <select
            {...register('appearance.fontSize')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Interface Density</h4>
          <select
            {...register('appearance.density')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'shareProgressWithTeam', 
              label: 'Share Progress with Team', 
              description: 'Allow team members to see your progress and achievements' 
            },
            { 
              key: 'allowPerformanceComparisons', 
              label: 'Performance Comparisons', 
              description: 'Include your data in team performance comparisons' 
            },
            { 
              key: 'shareAchievements', 
              label: 'Share Achievements', 
              description: 'Make your achievements visible to other team members' 
            },
            { 
              key: 'dataAnalyticsOptIn', 
              label: 'Analytics Participation', 
              description: 'Allow your anonymized data to be used for platform improvements' 
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`privacy.${setting.key}` as any)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personalization</h1>
          <p className="text-gray-600">
            Customize your experience to match your preferences and workflow.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'huddles', label: 'Huddles', icon: Volume2 },
              { id: 'dashboard', label: 'Dashboard', icon: Layout },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'privacy', label: 'Privacy', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
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
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'huddles' && renderHuddlesTab()}
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>

        {/* Save Button */}
        {isDirty && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              type="submit"
              disabled={updatePreferencesMutation.isLoading}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalizationSettings;