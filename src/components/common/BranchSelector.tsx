import React, { useState } from 'react';
import { ChevronDownIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useBranchContext } from '../../contexts/BranchContext';
import { useApp } from '../../contexts/AppContext';
import type { Branch } from '../../types';

interface BranchSelectorProps {
  className?: string;
  showFullDetails?: boolean;
  compact?: boolean;
}

export function BranchSelector({ 
  className = '', 
  showFullDetails = true,
  compact = false
}: BranchSelectorProps) {
  const { currentUser } = useApp();
  const { 
    currentBranch, 
    availableBranches, 
    isMultiBranch, 
    isLoading, 
    switchBranch 
  } = useBranchContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Don't show selector if user has no branches or only one branch
  if (!currentUser || isLoading || !isMultiBranch || availableBranches.length <= 1) {
    if (currentBranch && !compact) {
      return (
        <div className={`flex items-center space-x-2 text-gray-700 ${className}`}>
          <BuildingOfficeIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{currentBranch.name}</span>
          {showFullDetails && (
            <span className="text-xs text-gray-500">
              {currentBranch.city}, {currentBranch.state}
            </span>
          )}
        </div>
      );
    }
    return null;
  }

  const handleBranchSwitch = async (branch: Branch) => {
    if (branch.branchId === currentBranch?.branchId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await switchBranch(branch.branchId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch branch:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          disabled={isSwitching}
        >
          <BuildingOfficeIcon className="h-3 w-3" />
          <span className="truncate max-w-20">
            {currentBranch?.name || 'Select Branch'}
          </span>
          <ChevronDownIcon className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {availableBranches.map((branch) => (
                <button
                  key={branch.branchId}
                  onClick={() => handleBranchSwitch(branch)}
                  disabled={isSwitching}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-gray-500">
                        {branch.city}, {branch.state}
                      </div>
                    </div>
                  </div>
                  {currentBranch?.branchId === branch.branchId && (
                    <CheckIcon className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-gray-50 transition-colors"
          disabled={isSwitching}
        >
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">
              {currentBranch?.name || 'Select Branch'}
            </div>
            {currentBranch && showFullDetails && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MapPinIcon className="h-3 w-3" />
                <span>{currentBranch.city}, {currentBranch.state} {currentBranch.zipCode}</span>
                {currentBranch.disciplines && currentBranch.disciplines.length > 0 && (
                  <span className="ml-2 text-xs">
                    ({currentBranch.disciplines.join(', ')})
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                  Available Branches ({availableBranches.length})
                </div>
                {availableBranches.map((branch) => (
                  <button
                    key={branch.branchId}
                    onClick={() => handleBranchSwitch(branch)}
                    disabled={isSwitching}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      <div className="text-left">
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                          <MapPinIcon className="h-3 w-3" />
                          <span>{branch.city}, {branch.state} {branch.zipCode}</span>
                        </div>
                        {branch.disciplines && branch.disciplines.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            Disciplines: {branch.disciplines.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentBranch?.branchId === branch.branchId && (
                        <div className="flex items-center space-x-1">
                          <CheckIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs text-indigo-600 font-medium">Current</span>
                        </div>
                      )}
                      {isSwitching && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {availableBranches.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No branches available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}