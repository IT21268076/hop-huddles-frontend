import React from 'react';
import { Menu, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, currentAgency, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 rounded-md p-1 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">HOP Huddles</h1>
            {currentAgency && (
              <div className="hidden sm:block">
                <span className="text-gray-500">•</span>
                <span className="ml-2 text-sm text-gray-600">{currentAgency.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
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
          <div className="relative group">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md p-2">
              <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
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
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;