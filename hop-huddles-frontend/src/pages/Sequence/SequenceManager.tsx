import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Play, 
  Pause, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { HuddleSequence, SequenceStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import SequenceScheduleModal from './SequenceScheduleModal';
import toast from 'react-hot-toast';

const SequenceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SequenceStatus | 'ALL'>('ALL');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<HuddleSequence | null>(null);
  const { currentAgency, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sequences
  const { data: sequences, isLoading } = useQuery(
    ['sequences', currentAgency?.agencyId],
    () => currentAgency ? apiClient.getSequencesByAgency(currentAgency.agencyId) : Promise.resolve([]),
    { enabled: !!currentAgency }
  );

  // Update sequence status mutation
  const updateStatusMutation = useMutation(
    ({ sequenceId, status }: { sequenceId: number; status: SequenceStatus }) =>
      apiClient.updateSequenceStatus(sequenceId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sequences', currentAgency?.agencyId]);
        toast.success('Sequence status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update sequence status');
      }
    }
  );

  // Publish sequence mutation
  const publishMutation = useMutation(
    (sequenceId: number) => apiClient.publishSequence(sequenceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sequences', currentAgency?.agencyId]);
        toast.success('Sequence published successfully');
      },
      onError: () => {
        toast.error('Failed to publish sequence');
      }
    }
  );

  // Delete sequence mutation
  const deleteMutation = useMutation(apiClient.deleteSequence, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sequences', currentAgency?.agencyId]);
      toast.success('Sequence deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete sequence');
    }
  });

  const handlePublish = (sequenceId: number) => {
    if (window.confirm('Are you sure you want to publish this sequence? It will become available to users.')) {
      publishMutation.mutate(sequenceId);
    }
  };

  const handleArchive = (sequenceId: number) => {
    if (window.confirm('Are you sure you want to archive this sequence?')) {
      updateStatusMutation.mutate({ sequenceId, status: 'ARCHIVED' });
    }
  };

  const handleDelete = (sequenceId: number) => {
    if (window.confirm('Are you sure you want to delete this sequence? This action cannot be undone.')) {
      deleteMutation.mutate(sequenceId);
    }
  };

  const handleSchedule = (sequence: HuddleSequence) => {
    setSelectedSequence(sequence);
    setScheduleModalOpen(true);
  };

  const getStatusBadgeColor = (status: SequenceStatus) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATING: 'bg-yellow-100 text-yellow-800',
      REVIEW: 'bg-blue-100 text-blue-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800',
      SCHEDULED: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getStatusDisplay = (status: SequenceStatus) => {
    const displays = {
      DRAFT: 'Draft',
      GENERATING: 'Generating',
      REVIEW: 'Under Review',
      PUBLISHED: 'Published',
      ARCHIVED: 'Archived',
      SCHEDULED: 'Scheduled'
    };
    return displays[status];
  };

  // Filter sequences
  const filteredSequences = sequences?.filter(sequence => {
    const matchesSearch = sequence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sequence.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sequence.sequenceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const userRole = user?.assignments[0]?.role;
  const canManageContent = ['ADMIN', 'BRANCH_MANAGER', 'EDUCATOR'].includes(userRole || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Huddle Sequences</h1>
          <p className="text-gray-600">
            Create and manage AI-powered micro-education sequences for your teams.
          </p>
        </div>
        {canManageContent && (
          <Link
            to="/sequences/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Create Sequence
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sequences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SequenceStatus | 'ALL')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Under Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Sequences Grid */}
      {filteredSequences.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSequences.map((sequence) => (
            <div
              key={sequence.sequenceId}
              className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {sequence.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(sequence.sequenceStatus)}`}>
                      {getStatusDisplay(sequence.sequenceStatus)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/sequences/${sequence.sequenceId}`}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    {canManageContent && (
                      <>
                        <button
                          onClick={() => handleSchedule(sequence)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Schedule Delivery"
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sequence.sequenceId)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {sequence.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {sequence.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen size={14} className="text-gray-400" />
                    <span>{sequence.totalHuddles} huddles</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>{sequence.estimatedDurationMinutes || 0} min</span>
                  </div>
                </div>

                {/* Targets */}
                {sequence.targets.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-1 mb-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">Targets:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sequence.targets.slice(0, 3).map((target, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {target.targetDisplayName}
                        </span>
                      ))}
                      {sequence.targets.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{sequence.targets.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {canManageContent && (
                  <div className="flex space-x-2">
                    {sequence.sequenceStatus === 'DRAFT' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ sequenceId: sequence.sequenceId, status: 'REVIEW' })}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 size={12} className="mr-1" />
                        Review
                      </button>
                    )}
                    {sequence.sequenceStatus === 'REVIEW' && (
                      <button
                        onClick={() => handlePublish(sequence.sequenceId)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <Play size={12} className="mr-1" />
                        Publish
                      </button>
                    )}
                    {sequence.sequenceStatus === 'PUBLISHED' && (
                      <button
                        onClick={() => handleArchive(sequence.sequenceId)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Pause size={12} className="mr-1" />
                        Archive
                      </button>
                    )}
                  </div>
                )}

                {/* Creator Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div>Created by {sequence.createdByUserName}</div>
                  <div>{new Date(sequence.createdAt).toLocaleDateString()}</div>
                  {sequence.publishedAt && (
                    <div>Published: {new Date(sequence.publishedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'ALL' ? 'No sequences match your filters' : 'No sequences found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by creating your first huddle sequence.'
            }
          </p>
          {canManageContent && (!searchTerm && statusFilter === 'ALL') && (
            <div className="mt-6">
              <Link
                to="/sequences/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Create Sequence
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <SequenceScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedSequence(null);
        }}
        sequence={selectedSequence}
        onSuccess={() => {
          setScheduleModalOpen(false);
          setSelectedSequence(null);
          toast.success('Schedule created successfully');
        }}
      />
    </div>
  );
};

export default SequenceManagement;