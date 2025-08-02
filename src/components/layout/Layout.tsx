// components/layout/Layout.tsx
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}
/*Okay, now I want you to complete a critical functionality in this product which is user management. currently users can add and create assignments. So as an example take the invited user,        │
│   currently he is a Educator. the system should allow him to assign multiple roles and diciplines for that single user(same as other users). So according to assigned roles access is vary so we     │
│   need a role switcher in the layout header so user can easily switch the roles. according to the role selected permission, functionality changes. If in assignement, one of selected role is        │
│   Director it is required to select a branch for them as a leader for that branch and if one of role is clinical manager selecting a team as a leader is must. Field clinicians are the normal       │
│   users who are under those.   */

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  //console.log('Layout component rendered');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};