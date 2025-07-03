// components/Common/RoleSwitcher.tsx - Role switching component
import React, { useState } from 'react';
import { ChevronDown, UserCheck, Users, Building, Shield, Stethoscope, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

interface RoleInfo {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const roleDefinitions: Record<UserRole, RoleInfo> = {
  EDUCATOR: {
    role: 'EDUCATOR',
    label: 'Educator',
    description: 'Full agency access + huddle management',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrator',
    description: 'Full agency access (no huddle creation)',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  DIRECTOR: {
    role: 'DIRECTOR',
    label: 'Director',
    description: 'Branch leader with management capabilities',
    icon: Building,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  CLINICAL_MANAGER: {
    role: 'CLINICAL_MANAGER',
    label: 'Clinical Manager',
    description: 'Team leader with management capabilities',
    icon: UserCheck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  FIELD_CLINICIAN: {
    role: 'FIELD_CLINICIAN',
    label: 'Field Clinician',
    description: 'Access to assigned huddles and personal progress',
    icon: Stethoscope,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  },
  SUPERADMIN: {
    role: 'SUPERADMIN',
    label: 'Super Admin',
    description: 'System-wide administrative access',
    icon: Settings,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
};

interface RoleSwitcherProps {
  variant?: 'header' | 'sidebar' | 'compact';
  className?: string;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { activeRole, availableRoles, switchRole, getCurrentAccessScope } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeRole || availableRoles.length <= 1) {
    // Don't show role switcher if user has only one role
    if (activeRole && variant !== 'compact') {
      const roleInfo = roleDefinitions[activeRole];
      const Icon = roleInfo.icon;
      
      return (
        <div className={`flex items-center ${roleInfo.bgColor} px-3 py-2 rounded-lg ${className}`}>
          <Icon className={`h-4 w-4 ${roleInfo.color} mr-2`} />
          <span className="text-sm font-medium text-gray-700">{roleInfo.label}</span>
        </div>
      );
    }
    return null;
  }

  const currentRoleInfo = roleDefinitions[activeRole];
  const CurrentIcon = currentRoleInfo.icon;
  const accessScope = getCurrentAccessScope();

  const handleRoleSwitch = (newRole: UserRole) => {
    try {
      switchRole(newRole);
      const newRoleInfo = roleDefinitions[newRole];
      toast.success(`Switched to ${newRoleInfo.label} role`, {
        icon: '🔄',
        duration: 2000
      });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch role');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg ${currentRoleInfo.bgColor} ${currentRoleInfo.color} hover:opacity-80 transition-opacity ${className}`}
          title={`Current role: ${currentRoleInfo.label}`}
        >
          <CurrentIcon className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Switch Role</h3>
            </div>
            <div className="py-1">
              {availableRoles.map((role) => {
                const roleInfo = roleDefinitions[role];
                const Icon = roleInfo.icon;
                const isActive = role === activeRole;

                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    disabled={isActive}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                      isActive ? 'bg-gray-50 cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-3 ${roleInfo.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{roleInfo.label}</div>
                      <div className="text-xs text-gray-500">{roleInfo.description}</div>
                    </div>
                    {isActive && (
                      <div className="ml-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          variant === 'sidebar' ? 'mb-2' : ''
        }`}
      >
        <div className="flex items-center">
          <CurrentIcon className={`h-4 w-4 mr-2 ${currentRoleInfo.color}`} />
          <div className="text-left">
            <div className="font-medium text-gray-900">{currentRoleInfo.label}</div>
            {variant === 'sidebar' && (
              <div className="text-xs text-gray-500">
                {accessScope?.toLowerCase()} access
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Available Roles</h3>
              <p className="text-xs text-gray-500 mt-1">
                Switch between your assigned roles
              </p>
            </div>
            
            <div className="py-1 max-h-64 overflow-y-auto">
              {availableRoles.map((role) => {
                const roleInfo = roleDefinitions[role];
                const Icon = roleInfo.icon;
                const isActive = role === activeRole;

                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    disabled={isActive}
                    className={`w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors flex items-start ${
                      isActive ? 'bg-blue-50 cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${roleInfo.bgColor} mr-3 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${roleInfo.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{roleInfo.label}</div>
                        {isActive && (
                          <div className="flex items-center text-xs text-blue-600">
                            <div className="h-2 w-2 bg-blue-400 rounded-full mr-1"></div>
                            Active
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{roleInfo.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {availableRoles.length > 1 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-500">
                  💡 Your interface will adapt based on your active role
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;