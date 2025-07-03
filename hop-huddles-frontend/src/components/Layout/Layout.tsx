// components/Layout/Layout.tsx - Enhanced with role switching
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import RoleSwitcher from '../Common/RoleSwitcher';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, currentAgency, logout } = useAuth();
  const { activeRole, capabilities, getRoleDisplayInfo } = useActiveRole();
  const location = useLocation();

  const roleInfo = getRoleDisplayInfo();

  // Determine layout context based on current route
  const getLayoutContext = () => {
    if (location.pathname.startsWith('/hop-huddles')) return 'hop-huddles';
    if (location.pathname === '/main-platform') return 'main-platform';
    return 'legacy';
  };

  const layoutContext = getLayoutContext();

  const getPageTitle = () => {
    switch (layoutContext) {
      case 'hop-huddles':
        return 'HOP Huddles';
      case 'main-platform':
        return 'HOP Platform';
      default:
        return 'HOP Platform';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Enhanced Sidebar with Role Context */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        context={layoutContext}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header with Role Switcher */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 rounded-md p-1 lg:hidden"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
                
                {/* Agency Info */}
                {currentAgency && (
                  <div className="hidden sm:flex items-center text-sm text-gray-600">
                    <span className="text-gray-400">•</span>
                    <span className="ml-2">{currentAgency.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Role Switcher (Desktop) */}
            <div className="hidden lg:flex items-center">
              {roleInfo && roleInfo.hasMultipleRoles && (
                <div className="max-w-xs">
                  <RoleSwitcher variant="header" />
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Role Indicator (Mobile) */}
              {roleInfo && (
                <div className="flex lg:hidden">
                  <RoleSwitcher variant="compact" />
                </div>
              )}

              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md p-1">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md p-1">
                <Settings size={20} />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md p-2"
                >
                  <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {roleInfo && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                              {roleInfo.label}
                            </span>
                            {roleInfo.accessScope && (
                              <span className="ml-2 text-xs text-gray-500">
                                {roleInfo.accessScope.toLowerCase()} access
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Role Switcher Section (Mobile) */}
                      {roleInfo?.hasMultipleRoles && (
                        <div className="lg:hidden px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-700 mb-2">Switch Role</p>
                          <RoleSwitcher variant="sidebar" />
                        </div>
                      )}
                      
                      {/* Menu Items */}
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <User size={16} />
                        <span>Profile</span>
                      </button>
                      
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Role Capabilities Indicator (Optional - for debugging/admin) */}
          {process.env.NODE_ENV === 'development' && capabilities && (
            <div className="mt-2 text-xs text-gray-500">
              Access: {capabilities.accessLevel} | 
              Scope: {capabilities.accessScope} | 
              Features: {[
                capabilities.showEducatorFeatures && 'Educator',
                capabilities.showAdminFeatures && 'Admin',
                capabilities.showManagerFeatures && 'Manager',
                capabilities.showClinicianFeatures && 'Clinician'
              ].filter(Boolean).join(', ')}
            </div>
          )}
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;