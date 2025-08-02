import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { apiClient } from '../../services/api';
import { UserHuddleDashboard, UserHuddle, UserRole } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MyHuddlesDashboardProps {
  className?: string;
}

export function MyHuddlesDashboard({ className = '' }: MyHuddlesDashboardProps) {
  const { user } = useAuth();
  const { currentRole } = useRole();
  const [dashboardData, setDashboardData] = useState<UserHuddleDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSequences, setExpandedSequences] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.userId && currentRole) {
      fetchDashboardData();
    }
  }, [user?.userId, currentRole]);

  const fetchDashboardData = async () => {
    if (!user?.userId || !currentRole) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRoleDashboardData(user.userId, currentRole);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load huddle dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSequenceExpansion = (sequenceId: number) => {
    const newExpanded = new Set(expandedSequences);
    if (newExpanded.has(sequenceId)) {
      newExpanded.delete(sequenceId);
    } else {
      newExpanded.add(sequenceId);
    }
    setExpandedSequences(newExpanded);
  };

  const getProgressColor = (progressStatus: string) => {
    switch (progressStatus) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const HuddleCard = ({ huddle }: { huddle: UserHuddle }) => {
    const isExpanded = expandedSequences.has(huddle.sequenceId);
    
    return (
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => toggleSequenceExpansion(huddle.sequenceId)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                  {huddle.title}
                </button>
                <Badge className={getProgressColor(huddle.progressStatus)}>
                  {huddle.progressStatus.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(huddle.priority)}>
                  {huddle.priority}
                </Badge>
                {huddle.isRequired && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Required
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{huddle.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  {huddle.completedHuddles} / {huddle.totalHuddles} huddles
                </span>
                <span>
                  {Math.round(huddle.completionPercentage)}% complete
                </span>
                <span>
                  {huddle.estimatedDurationMinutes} min
                </span>
                {huddle.dueDate && (
                  <span className={huddle.isOverdue ? 'text-red-600' : ''}>
                    Due: {formatDate(huddle.dueDate)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-4">
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - huddle.completionPercentage / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">
                    {Math.round(huddle.completionPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Category:</span> {huddle.category}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span> {huddle.userRole}
                    </div>
                    <div>
                      <span className="font-medium">Discipline:</span> {huddle.userDiscipline}
                    </div>
                    <div>
                      <span className="font-medium">Last Accessed:</span> {formatDate(huddle.lastAccessed)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/huddles/${huddle.sequenceId}`}
                  >
                    View Details
                  </Button>
                  {huddle.progressStatus !== 'COMPLETED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = `/huddles/${huddle.sequenceId}/continue`}
                    >
                      Continue Learning
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const StatCard = ({ title, value, subtitle, color = 'blue' }: {
    title: string;
    value: number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      red: 'bg-red-50 text-red-700',
      yellow: 'bg-yellow-50 text-yellow-700'
    };

    return (
      <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <EmptyState
        title="No Dashboard Data"
        message="Unable to load your huddle dashboard."
        actionLabel="Refresh"
        onAction={fetchDashboardData}
      />
    );
  }

  const { huddles, statistics } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Huddles</h2>
          <p className="text-gray-600">
            Role: <span className="font-medium">{currentRole}</span>
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sequences"
          value={statistics.totalSequences}
          subtitle="Available to you"
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={statistics.inProgressSequences}
          subtitle="Currently learning"
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={statistics.completedSequences}
          subtitle="Finished learning"
          color="green"
        />
        <StatCard
          title="Overdue"
          value={statistics.overdueSequences}
          subtitle="Need attention"
          color="red"
        />
      </div>

      {/* Overall Progress */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${statistics.overallCompletionPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {statistics.completedHuddles} / {statistics.totalHuddles} huddles
              ({Math.round(statistics.overallCompletionPercentage)}%)
            </div>
          </div>
        </div>
      </Card>

      {/* Huddle Sections */}
      {huddles.overdue.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4">
            Overdue ({huddles.overdue.length})
          </h3>
          <div className="space-y-4">
            {huddles.overdue.map((huddle) => (
              <HuddleCard key={huddle.sequenceId} huddle={huddle} />
            ))}
          </div>
        </div>
      )}

      {huddles.inProgress.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4">
            In Progress ({huddles.inProgress.length})
          </h3>
          <div className="space-y-4">
            {huddles.inProgress.map((huddle) => (
              <HuddleCard key={huddle.sequenceId} huddle={huddle} />
            ))}
          </div>
        </div>
      )}

      {huddles.notStarted.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Not Started ({huddles.notStarted.length})
          </h3>
          <div className="space-y-4">
            {huddles.notStarted.map((huddle) => (
              <HuddleCard key={huddle.sequenceId} huddle={huddle} />
            ))}
          </div>
        </div>
      )}

      {huddles.completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            Completed ({huddles.completed.length})
          </h3>
          <div className="space-y-4">
            {huddles.completed.map((huddle) => (
              <HuddleCard key={huddle.sequenceId} huddle={huddle} />
            ))}
          </div>
        </div>
      )}

      {huddles.all.length === 0 && (
        <EmptyState
          title="No Huddles Available"
          message={`There are no huddle sequences available for your current role (${currentRole}).`}
          actionLabel="Switch Role"
          onAction={() => {
            // This would open role switcher
            console.log('Switch role clicked');
          }}
        />
      )}
    </div>
  );
}