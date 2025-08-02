import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { apiClient } from '../../services/api';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface HuddleRoleSwitcherProps {
  onRoleChange?: (role: UserRole) => void;
  className?: string;
}

export function HuddleRoleSwitcher({ onRoleChange, className = '' }: HuddleRoleSwitcherProps) {
  const { user } = useAuth();
  const { currentRole, setCurrentRole } = useRole();
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      fetchAvailableRoles();
    }
  }, [user?.userId]);

  const fetchAvailableRoles = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const roles = await apiClient.getUserRolesWithHuddles(user.userId);
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error fetching available roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsOpen(false);
    onRoleChange?.(role);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'EDUCATOR':
        return 'Educator';
      case 'ADMIN':
        return 'Administrator';
      case 'DIRECTOR':
        return 'Director';
      case 'CLINICAL_MANAGER':
        return 'Clinical Manager';
      case 'FIELD_CLINICIAN':
        return 'Field Clinician';
      case 'PRECEPTOR':
        return 'Preceptor';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'EDUCATOR':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'DIRECTOR':
        return 'bg-green-100 text-green-800';
      case 'CLINICAL_MANAGER':
        return 'bg-orange-100 text-orange-800';
      case 'FIELD_CLINICIAN':
        return 'bg-teal-100 text-teal-800';
      case 'PRECEPTOR':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (availableRoles.length <= 1) {
    return (
      <div className={className}>
        <Badge className={currentRole ? getRoleColor(currentRole) : 'bg-gray-100 text-gray-600'}>
          {currentRole ? getRoleDisplayName(currentRole) : 'No Role'}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Badge className={currentRole ? getRoleColor(currentRole) : 'bg-gray-100 text-gray-600'}>
          {currentRole ? getRoleDisplayName(currentRole) : 'No Role'}
        </Badge>
        <ChevronDownIcon className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Switch Role for Huddles
            </div>
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                  currentRole === role ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getRoleDisplayName(role)}</span>
                  {currentRole === role && (
                    <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getRoleDescription(role)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'EDUCATOR':
      return 'Create and manage all huddle sequences';
    case 'ADMIN':
      return 'Access all huddles except sequence creation';
    case 'DIRECTOR':
      return 'Access branch-level huddles and team management';
    case 'CLINICAL_MANAGER':
      return 'Access team-level huddles and user management';
    case 'FIELD_CLINICIAN':
      return 'Access assigned huddles for learning';
    case 'PRECEPTOR':
      return 'Access huddles for mentoring and learning';
    default:
      return 'Access role-specific huddles';
  }
}