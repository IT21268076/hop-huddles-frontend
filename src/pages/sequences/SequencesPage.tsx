
// pages/sequences/SequencesPage.tsx
import React, { useState } from 'react';
import { Plus, BookOpen, Search, Filter, Calendar, Users, Clock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { HuddleSequence, SequenceStatus } from '../../types';
import { formatDate, formatDuration, getStatusColor } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export const SequencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAgency, currentAssignment } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SequenceStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: sequencesResponse,
    loading,
    refetch,
  } = useAsync(
    async () => {
      if (!currentAgency) return { content: [], totalElements: 0, totalPages: 0 };
      
      // Get sequences based on current user role
      const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
      let allSequences;
      
      if (activeRole === 'EDUCATOR') {
        // EDUCATOR: Get sequences they created (creator-based filtering)
        console.log('🎯 SEQUENCES PAGE - EDUCATOR: Loading sequences they created');
        console.log('🎯 API CALL: Using getSequencesCreatedByMe() for creator-based filtering');
        allSequences = await apiClient.getSequencesCreatedByMe();
        console.log('🎯 CREATOR ISOLATION: EDUCATOR loaded', allSequences.length, 'sequences they created');
      } else {
        // OTHER ROLES: Get sequences from their agency (assignment-based)
        console.log('🎯 SEQUENCES PAGE - Non-EDUCATOR: Loading agency sequences');
        allSequences = await apiClient.getSequencesByAgency(currentAgency.agencyId);
        console.log('🎯 ASSIGNMENT-BASED: Non-EDUCATOR loaded', allSequences.length, 'agency sequences');
      }
      
      // Apply client-side filtering
      let filteredSequences = allSequences;
      
      if (searchTerm) {
        filteredSequences = filteredSequences.filter(seq => 
          seq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (seq.description && seq.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (selectedStatus) {
        filteredSequences = filteredSequences.filter(seq => seq.sequenceStatus === selectedStatus);
      }
      
      // Apply pagination
      const totalElements = filteredSequences.length;
      const totalPages = Math.ceil(totalElements / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const content = filteredSequences.slice(startIndex, endIndex);
      
      return { content, totalElements, totalPages };
    },
    [currentAgency?.agencyId, currentAssignment?.activeRole, currentAssignment?.role, searchTerm, selectedStatus, currentPage]
  );

  // Get summary statistics
  const {
    data: allSequences,
  } = useAsync(
    async () => {
      if (!currentAgency) return [];
      
      const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
      
      if (activeRole === 'EDUCATOR') {
        // EDUCATOR: Get sequences they created for summary stats
        return await apiClient.getSequencesCreatedByMe();
      } else {
        // OTHER ROLES: Get agency sequences for summary stats
        return await apiClient.getSequencesByAgency(currentAgency.agencyId);
      }
    },
    [currentAgency?.agencyId, currentAssignment?.activeRole, currentAssignment?.role]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: SequenceStatus | '') => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleRowClick = (sequence: HuddleSequence) => {
    // Navigate to preview page for branch-based sequences
    navigate(`/sequences/${sequence.sequenceId}/preview`);
  };

  const getStatusBadge = (status: SequenceStatus) => {
    const statusConfig = {
      DRAFT: { variant: 'default' as const, label: 'Draft' },
      GENERATING: { variant: 'info' as const, label: 'Generating' },
      REVIEW: { variant: 'warning' as const, label: 'Review' },
      PUBLISHED: { variant: 'success' as const, label: 'Published' },
      ARCHIVED: { variant: 'error' as const, label: 'Archived' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'title',
      header: 'Sequence',
      render: (sequence: HuddleSequence) => (
        <div>
          <div className="font-medium text-gray-900">{sequence.title}</div>
          {sequence.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {sequence.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'sequenceStatus',
      header: 'Status',
      render: (sequence: HuddleSequence) => getStatusBadge(sequence.sequenceStatus),
    },
    {
      key: 'totalCombinations',
      header: 'Combinations',
      render: (sequence: HuddleSequence) => (
        <div className="flex items-center text-sm text-gray-900">
          <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
          {sequence.totalCombinations || 0}
        </div>
      ),
    },
    {
      key: 'estimatedDurationMinutes',
      header: 'Duration',
      render: (sequence: HuddleSequence) => (
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {sequence.estimatedDurationMinutes 
            ? formatDuration(sequence.estimatedDurationMinutes)
            : 'N/A'
          }
        </div>
      ),
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (sequence: HuddleSequence) => (
        <div className="text-sm text-gray-900">
          {sequence.branchName || 'N/A'}
        </div>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Target Audience',
      render: (sequence: HuddleSequence) => (
        <div className="flex flex-wrap gap-1">
          {sequence.targetRoles && sequence.targetRoles.slice(0, 2).map((role) => (
            <Badge key={role} variant="info" size="sm">
              {role}
            </Badge>
          ))}
          {sequence.targetDisciplines && sequence.targetDisciplines.slice(0, 2).map((discipline) => (
            <Badge key={discipline} variant="success" size="sm">
              {discipline}
            </Badge>
          ))}
          {((sequence.targetRoles?.length || 0) + (sequence.targetDisciplines?.length || 0)) > 4 && (
            <Badge variant="default" size="sm">
              +{((sequence.targetRoles?.length || 0) + (sequence.targetDisciplines?.length || 0)) - 4} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdByUserName',
      header: 'Created By',
      render: (sequence: HuddleSequence) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {sequence.createdByUserName}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(sequence.createdAt)}
          </div>
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const totalSequences = allSequences?.length || 0;
  const publishedSequences = allSequences?.filter(s => s.sequenceStatus === 'PUBLISHED').length || 0;
  const draftSequences = allSequences?.filter(s => s.sequenceStatus === 'DRAFT').length || 0;

  const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isEducator = activeRole === 'EDUCATOR';

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to manage huddle sequences.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Huddle Sequences"
        description={
          isEducator 
            ? `Manage AI-generated micro-learning sequences you created for ${currentAgency.name}`
            : `Manage AI-generated micro-learning sequences for ${currentAgency.name}`
        }
        action={{
          label: 'New Sequence',
          onClick: () => navigate('/sequences/new'),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Sequences</div>
              <div className="text-2xl font-bold text-gray-900">{totalSequences}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Published</div>
              <div className="text-2xl font-bold text-gray-900">{publishedSequences}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Filter className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Drafts</div>
              <div className="text-2xl font-bold text-gray-900">{draftSequences}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Learners</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sequences..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value as SequenceStatus | '')}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'GENERATING', label: 'Generating' },
              { value: 'REVIEW', label: 'Review' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={sequencesResponse?.content || []}
        columns={columns}
        loading={loading}
        emptyMessage={
          isEducator 
            ? "No huddle sequences found that you created. Create your first sequence to get started."
            : "No huddle sequences found. Create your first sequence to get started."
        }
        emptyIcon={<BookOpen className="h-6 w-6" />}
        onRowClick={handleRowClick}
        pagination={
          sequencesResponse && sequencesResponse.totalPages > 1
            ? {
                currentPage,
                totalPages: sequencesResponse.totalPages,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
      />
    </>
  );
};
