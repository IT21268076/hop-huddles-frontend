import React, { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Settings,
  Target,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { useApi } from '../../hooks/useApi';
import { HuddleSequence, SequenceStatus, UserRole, Discipline } from '../../types';
import { formatDate, formatDuration, getStatusColor } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface SequenceWithStats extends HuddleSequence {
  huddleCount: number;
  assignedUserCount: number;
  completionRate: number;
  totalDuration: number;
}

export const EnhancedSequencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAgency, currentAssignment, currentUser } = useApp();
  const permissions = usePermissions();
  const api = useApi();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SequenceStatus | ''>('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch sequences with enhanced data
  const {
    data: sequences = [],
    loading,
    refetch,
  } = useAsync(
    async (): Promise<SequenceWithStats[]> => {
      if (!currentAgency) return [];
      
      try {
        const sequencesData = await api.getSequencesByAgency(currentAgency.agencyId);
        
        // Enhance sequences with statistics
        const enhancedSequences = await Promise.all(
          sequencesData.map(async (sequence) => {
            const [huddles, assignments, progress] = await Promise.all([
              api.getHuddlesBySequence(sequence.sequenceId),
              api.getSequenceAssignments(sequence.sequenceId),
              api.getSequenceProgressBySequence(sequence.sequenceId)
            ]);
            
            // Calculate assignment count from assignments data
            const assignmentCount = assignments.length;

            return {
              ...sequence,
              huddleCount: huddles.length,
              assignedUserCount: assignmentCount,
              completionRate: progress.length > 0 ? progress.reduce((sum, p) => sum + p.completionPercentage, 0) / progress.length : 0,
              totalDuration: huddles.reduce((sum: number, h: any) => sum + (h.durationMinutes || 0), 0),
            };
          })
        );

        return enhancedSequences;
      } catch (error) {
        console.error('Failed to load sequences:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  // Filter sequences based on search and filters
  const filteredSequences = sequences?.filter(sequence => {
    const matchesSearch = !searchTerm || 
      sequence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || sequence.status === selectedStatus;
    
    const matchesRole = !selectedRole || 
      sequence.targetRoles?.includes(selectedRole);
    
    const matchesDiscipline = !selectedDiscipline || 
      sequence.targetDisciplines?.includes(selectedDiscipline);

    return matchesSearch && matchesStatus && matchesRole && matchesDiscipline;
  }) || [];

  // Summary statistics
  const stats = {
    total: sequences?.length || 0,
    published: sequences?.filter(s => s.status === 'PUBLISHED').length || 0,
    draft: sequences?.filter(s => s.status === 'DRAFT').length || 0,
    generating: sequences?.filter(s => s.status === 'GENERATING').length || 0,
    avgCompletionRate: sequences?.length ? sequences.reduce((sum, s) => sum + s.completionRate, 0) / sequences.length
      : 0,
  };

  const handleCreateSequence = () => {
    navigate('/sequences/new');
  };

  const handleSequenceAction = async (action: string, sequenceId: number) => {
    try {
      switch (action) {
        case 'publish':
          await api.updateSequenceStatus(sequenceId, 'PUBLISHED', currentUser?.userId);
          break;
        case 'draft':
          await api.updateSequenceStatus(sequenceId, 'DRAFT', currentUser?.userId);
          break;
        case 'archive':
          await api.updateSequenceStatus(sequenceId, 'ARCHIVED', currentUser?.userId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this sequence?')) {
            await api.deleteSequence(sequenceId);
          }
          break;
        case 'duplicate':
          const originalSequence = sequences?.find(s => s.sequenceId === sequenceId);
          const newTitle = `${originalSequence?.title || 'Sequence'} (Copy)`;
          await api.duplicateSequence(sequenceId, newTitle);
          break;
      }
      refetch();
    } catch (error) {
      console.error(`Failed to ${action} sequence:`, error);
    }
  };

  const getStatusIcon = (status: SequenceStatus) => {
    switch (status) {
      case 'PUBLISHED': return <Play className="h-4 w-4" />;
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      case 'GENERATING': return <Zap className="h-4 w-4 animate-pulse" />;
      case 'REVIEW': return <Eye className="h-4 w-4" />;
      case 'ARCHIVED': return <Pause className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderSequenceCard = (sequence: SequenceWithStats) => (
    <Card key={sequence.sequenceId} className="group hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              sequence.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' :
              sequence.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-600' :
              sequence.status === 'GENERATING' ? 'bg-blue-100 text-blue-600' :
              sequence.status === 'REVIEW' ? 'bg-purple-100 text-purple-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {getStatusIcon(sequence.status)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {sequence.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {sequence.description?.substring(0, 100)}...
              </p>
            </div>
          </div>
          
          <Badge variant={getStatusColor(sequence.status) as any} className="flex-shrink-0">
            {sequence.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{sequence.huddleCount} Huddles</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{sequence.assignedUserCount} Assigned</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(sequence.totalDuration)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4" />
            <span>{Math.round(sequence.completionRate)}% Complete</span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Target Audience:</div>
          <div className="flex flex-wrap gap-1">
            {sequence.targetRoles?.map(role => (
              <Badge key={role} variant="outline" className="text-xs">
                {role.replace('_', ' ')}
              </Badge>
            ))}
            {sequence.targetDisciplines?.map(discipline => (
              <Badge key={discipline} variant="outline" className="text-xs">
                {discipline}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Updated {formatDate(sequence.updatedAt)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/sequences/${sequence.sequenceId}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {permissions.canManageHuddleSequences && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/sequences/${sequence.sequenceId}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSequenceAction('duplicate', sequence.sequenceId)}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {sequence.status === 'DRAFT' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSequenceAction('publish', sequence.sequenceId)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}

                {sequence.status === 'PUBLISHED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSequenceAction('draft', sequence.sequenceId)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'GENERATING', label: 'Generating' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'FIELD_CLINICIAN', label: 'Field Clinician' },
    { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const disciplineOptions = [
    { value: '', label: 'All Disciplines' },
    { value: 'RN', label: 'Registered Nurse' },
    { value: 'LPN', label: 'Licensed Practical Nurse' },
    { value: 'PT', label: 'Physical Therapist' },
    { value: 'OT', label: 'Occupational Therapist' },
    { value: 'SLP', label: 'Speech Language Pathologist' },
    { value: 'HHA', label: 'Home Health Aide' },
    { value: 'MSW', label: 'Medical Social Worker' },
  ];

  return (
    <>
      <PageHeader
        title="Huddle Sequences"
        description="Manage AI-powered micro-education sequences for your team"
        action={permissions.canManageHuddleSequences ? {
          label: 'Create Sequence',
          onClick: handleCreateSequence,
          icon: <Plus className="h-4 w-4" />,
        } : undefined}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Sequences</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.avgCompletionRate)}%
                </div>
                <div className="text-sm text-gray-500">Avg Completion</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sequences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as SequenceStatus | '')}
                options={statusOptions}
                className="w-40"
              />
              
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                options={roleOptions}
                className="w-40"
              />
              
              <Select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value as Discipline | '')}
                options={disciplineOptions}
                className="w-40"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sequences Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSequences.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {(sequences?.length || 0) === 0 ? 'No sequences yet' : 'No sequences match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {(sequences?.length || 0) === 0 
                ? 'Create your first huddle sequence to get started.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {permissions.canManageHuddleSequences && (sequences?.length || 0) === 0 && (
              <Button onClick={handleCreateSequence}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sequence
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSequences.map(renderSequenceCard)}
        </div>
      )}
    </>
  );
};