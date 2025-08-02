// components/layout/Header.tsx
import React from 'react';
import { Bell, Settings, LogOut, Menu } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/Auth0Context';
import { Button } from '../ui/Button';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import { isSuperAdmin } from '../../utils/helpers';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser, currentAgency } = useApp();
  const { logout, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo and Agency Info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HOP</span>
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">Huddles</span>
            </div>
          
            {currentAgency && !isSuperAdmin(currentUser, user) && (
              <>
                <div className="hidden sm:block h-6 w-px bg-gray-300" />
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Agency:</span>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {currentAgency.name}
                  </span>
                </div>
              </>
            )}
            {isSuperAdmin(currentUser, user) && (
              <>
                <div className="hidden sm:block h-6 w-px bg-gray-300" />
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Platform:</span>
                  <span className="text-sm font-medium text-gray-900">System Admin</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Notifications - Hidden on small screens */}
          <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Settings - Hidden on small screens */}
          <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* Role Switcher */}
          <div className="flex-shrink-0">
            <RoleSwitcher />
          </div>

          {/* Logout */}
          <button 
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
