// pages/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { Settings, User, Building2, Bell, Lock, Palette } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useApp } from '../../contexts/AppContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, currentAgency } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings"
      />

      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="agency" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Agency
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    defaultValue={currentUser?.name || ''}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={currentUser?.email || ''}
                    placeholder="Enter your email"
                  />
                  <Input
                    label="Phone Number"
                    defaultValue={currentUser?.phone || ''}
                    placeholder="Enter your phone number"
                  />
                  <Input
                    label="Profile Picture URL"
                    defaultValue={currentUser?.profilePictureUrl || ''}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agency">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Agency Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Agency Name"
                    defaultValue={currentAgency?.name || ''}
                    placeholder="Agency name"
                    disabled
                  />
                  <Input
                    label="CCN"
                    defaultValue={currentAgency?.ccn || ''}
                    placeholder="CMS Certification Number"
                    disabled
                  />
                  <Input
                    label="Agency Type"
                    defaultValue={currentAgency?.agencyType || ''}
                    disabled
                  />
                  <Input
                    label="Subscription Plan"
                    defaultValue={currentAgency?.subscriptionPlan || ''}
                    disabled
                  />
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Contact your administrator to modify agency settings.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">New Huddle Notifications</div>
                      <div className="text-sm text-gray-500">
                        Get notified when new huddles are published
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Progress Reminders</div>
                      <div className="text-sm text-gray-500">
                        Reminder notifications for incomplete huddles
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Weekly Digest</div>
                      <div className="text-sm text-gray-500">
                        Weekly summary of your learning progress
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">
                        Receive notifications via email
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Application Preferences</h3>
                <div className="space-y-6">
                  <Select
                    label="Language"
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                    ]}
                    defaultValue="en"
                  />

                  <Select
                    label="Time Zone"
                    options={[
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Chicago', label: 'Central Time' },
                      { value: 'America/Denver', label: 'Mountain Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    ]}
                    defaultValue="America/New_York"
                  />

                  <Select
                    label="Theme"
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' },
                    ]}
                    defaultValue="light"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Auto-play Audio</div>
                      <div className="text-sm text-gray-500">
                        Automatically play audio when opening huddles
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Reduced Motion</div>
                      <div className="text-sm text-gray-500">
                        Reduce animations and motion effects
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};