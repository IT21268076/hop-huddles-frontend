import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { UserRole } from '../../types';
import { PageHeader } from '../layout/PageHeader';
import { MyHuddlesDashboard } from './MyHuddlesDashboard';
import { HuddleRoleSwitcher } from './HuddleRoleSwitcher';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

interface MyHuddlesPageProps {
  className?: string;
}

export function MyHuddlesPage({ className = '' }: MyHuddlesPageProps) {
  const { user } = useAuth();
  const { currentRole } = useRole();
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'calendar' | 'analytics'>('dashboard');

  const handleRoleChange = (role: UserRole) => {
    // Dashboard will automatically refresh when role changes
    console.log('Role changed to:', role);
  };


  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <PageHeader
        title="My Huddles"
        subtitle={`Learning dashboard for ${user?.name || 'User'}`}
        rightContent={
          <HuddleRoleSwitcher
            onRoleChange={handleRoleChange}
            className="ml-auto"
          />
        }
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value as 'dashboard' | 'calendar' | 'analytics')}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">My Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="p-6">
            <MyHuddlesDashboard />
          </TabsContent>
          
          <TabsContent value="calendar" className="p-6">
            <div className="p-8 text-center text-gray-500">Calendar view coming soon...</div>
          </TabsContent>
          
          <TabsContent value="analytics" className="p-6">
            <div className="p-8 text-center text-gray-500">Personal analytics coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MyHuddlesPage;