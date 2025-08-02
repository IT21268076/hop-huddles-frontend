// pages/assessments/AssessmentsPage.tsx
import React, { useState } from 'react';
import { Plus, FileText, Search, Clock, Award, Users, ChevronDown, ChevronRight, BookOpen, Play, Edit3, Calendar, Target, Filter, Grid, List } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { Assessment, HuddleSequence, Huddle } from '../../types';
import { formatDate } from '../../utils/helpers';
import { CreateAssessmentForm } from './CreateAssessmentForm';

export const AssessmentsPage: React.FC = () => {
  const { currentAgency, currentAssignment } = useApp();
  const permissions = usePermissions({
    userRole: currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHuddleId, setSelectedHuddleId] = useState<number | null>(null);
  const [expandedSequences, setExpandedSequences] = useState<Set<number>>(new Set());
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(null);
  const [sequenceHuddles, setSequenceHuddles] = useState<Record<number, Huddle[]>>({});
  
  // ✅ New UI state
  const [activeTab, setActiveTab] = useState<'browse' | 'manage'>('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'draft' | 'published'>('all');

  // Get all assessments for the agency
  const {
    data: assessments,
    loading,
    refetch,
  } = useAsync(
    async (): Promise<Assessment[]> => {
      if (!currentAgency) return [];
      try {
        const result = await apiClient.getAssessmentsByAgency(currentAgency.agencyId);
        return result.content || [];
      } catch (error) {
        console.error('Failed to load assessments:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  // ✅ Get sequences created by current EDUCATOR only
  const {
    data: sequences,
    loading: sequencesLoading,
  } = useAsync(
    async (): Promise<HuddleSequence[]> => {
      if (!currentAgency) return [];
      try {
        // Use EDUCATOR-specific endpoint to show only their created sequences
        const sequences = await apiClient.getSequencesCreatedByMe();
        
        // ✅ Preload huddle counts for all sequences to update stats immediately
        if (sequences && sequences.length > 0) {
          const huddleCounts: Record<number, Huddle[]> = {};
          
          // Load huddles for all sequences to get accurate count
          const huddlePromises = sequences.map(async (sequence) => {
            try {
              const fullSequence = await apiClient.getBranchSequenceWithCombinations(sequence.sequenceId);
              const allHuddles: Huddle[] = [];
              
              if (fullSequence.combinations) {
                fullSequence.combinations.forEach(combination => {
                  if (combination.huddles) {
                    combination.huddles.forEach(huddle => {
                      allHuddles.push({
                        ...huddle,
                        sequenceTitle: fullSequence.title,
                        sequenceId: sequence.sequenceId,
                        combination: combination
                      });
                    });
                  }
                });
              }
              
              huddleCounts[sequence.sequenceId] = allHuddles;
            } catch (error) {
              console.error(`Failed to load huddles for sequence ${sequence.sequenceId}:`, error);
              huddleCounts[sequence.sequenceId] = [];
            }
          });
          
          // Wait for all huddle loading to complete
          await Promise.all(huddlePromises);
          
          // Update state with all loaded huddles
          setSequenceHuddles(huddleCounts);
        }
        
        return sequences;
      } catch (error) {
        console.error('Failed to load educator sequences:', error);
        return [];
      }
    },
    [currentAgency?.agencyId]
  );

  const handleCreateAssessment = async () => {
    await refetch();
    setIsCreateModalOpen(false);
    setSelectedHuddleId(null);
  };

  const handleCreateAssessmentForHuddle = (huddleId: number) => {
    setSelectedHuddleId(huddleId);
    setIsCreateModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const toggleSequenceExpansion = async (sequenceId: number) => {
    const newExpanded = new Set(expandedSequences);
    if (newExpanded.has(sequenceId)) {
      newExpanded.delete(sequenceId);
    } else {
      newExpanded.add(sequenceId);
      // ✅ Huddles should already be loaded, but handle edge case if not
      if (!sequenceHuddles[sequenceId]) {
        try {
          const sequenceWithHuddles = await apiClient.getBranchSequenceWithCombinations(sequenceId);
          const allHuddles: Huddle[] = [];
          
          // Extract huddles from all combinations
          if (sequenceWithHuddles.combinations) {
            sequenceWithHuddles.combinations.forEach(combination => {
              if (combination.huddles) {
                combination.huddles.forEach(huddle => {
                  allHuddles.push({
                    ...huddle,
                    sequenceTitle: sequenceWithHuddles.title,
                    sequenceId: sequenceId,
                    combination: combination
                  });
                });
              }
            });
          }
          
          setSequenceHuddles(prev => ({
            ...prev,
            [sequenceId]: allHuddles
          }));
        } catch (error) {
          console.error('Failed to load huddles for sequence:', sequenceId, error);
          setSequenceHuddles(prev => ({
            ...prev,
            [sequenceId]: []
          }));
        }
      }
    }
    setExpandedSequences(newExpanded);
  };

  const filterAssessmentsBySequence = (assessments: Assessment[], sequenceId: number | null) => {
    if (!sequenceId) return assessments;
    return assessments.filter(assessment => assessment.sequenceId === sequenceId);
  };

  let filteredAssessments = assessments?.filter((assessment: Assessment) =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Apply sequence filter if a sequence is selected
  filteredAssessments = filterAssessmentsBySequence(filteredAssessments, selectedSequenceId);

  const columns = [
    {
      key: 'title',
      header: 'Assessment',
      render: (assessment: Assessment) => (
        <div>
          <div className="font-medium text-gray-900">{assessment.title}</div>
          {assessment.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {assessment.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (assessment: Assessment) => (
        <div className="flex items-center text-sm text-gray-900">
          <FileText className="h-4 w-4 mr-1 text-gray-400" />
          {assessment.questions.length}
        </div>
      ),
    },
    {
      key: 'passingScore',
      header: 'Passing Score',
      render: (assessment: Assessment) => (
        <div className="flex items-center text-sm text-gray-900">
          <Award className="h-4 w-4 mr-1 text-yellow-500" />
          {assessment.passingScore}%
        </div>
      ),
    },
    {
      key: 'maxAttempts',
      header: 'Max Attempts',
      render: (assessment: Assessment) => (
        <span className="text-sm text-gray-900">{assessment.maxAttempts}</span>
      ),
    },
    {
      key: 'timeLimit',
      header: 'Time Limit',
      render: (assessment: Assessment) => (
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {assessment.timeLimit ? `${assessment.timeLimit} min` : 'No limit'}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (assessment: Assessment) => (
        <Badge variant={assessment.isActive ? 'success' : 'default'}>
          {assessment.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (assessment: Assessment) => (
        <span className="text-sm text-gray-500">{formatDate(assessment.createdAt)}</span>
      ),
    },
  ];

  if (!permissions.canEditHuddles) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to manage assessments.
        </p>
      </div>
    );
  }

  if (!currentAgency) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an agency to manage assessments.</p>
      </div>
    );
  }


  // ✅ New enhanced UI components
  const renderSequenceCard = (sequence: HuddleSequence) => {
    const isExpanded = expandedSequences.has(sequence.sequenceId);
    const huddles = sequenceHuddles[sequence.sequenceId] || [];
    
    return (
      <Card key={sequence.sequenceId} className="overflow-hidden">
        <div className="p-4">
          {/* Sequence Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate" title={sequence.title}>
                {sequence.title}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  {sequence.branchName || 'Unknown Branch'}
                </span>
                <Badge variant="info" size="sm">
                  {sequence.totalCombinations || 0} combinations
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSequenceExpansion(sequence.sequenceId)}
              className="ml-2"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'} Huddles
            </Button>
          </div>

          {/* Expanded Huddles */}
          {isExpanded && (
            <div className="border-t pt-4 mt-4">
              {!sequenceHuddles[sequence.sequenceId] ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading huddles...</span>
                </div>
              ) : huddles.length > 0 ? (
                <div className="space-y-3">
                  {huddles.map((huddle) => (
                    <div key={huddle.huddleId} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate" title={huddle.title}>
                            {huddle.title}
                          </h4>
                          {huddle.combination && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="default" size="sm">
                                {huddle.combination.userRole}
                              </Badge>
                              <Badge variant="secondary" size="sm">
                                {huddle.combination.discipline}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateAssessmentForHuddle(huddle.huddleId)}
                          className="ml-3 flex-shrink-0"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Assessment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No huddles found in this sequence</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderAssessmentCard = (assessment: Assessment) => (
    <Card key={assessment.assessmentId} className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate" title={assessment.title}>
              {assessment.title}
            </h3>
            {assessment.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={assessment.description}>
                {assessment.description}
              </p>
            )}
          </div>
          <Badge variant={assessment.isActive ? 'success' : 'default'}>
            {assessment.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {assessment.questions?.length || 0} questions
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {assessment.timeLimit ? `${assessment.timeLimit}m` : 'No limit'}
            </span>
            <span className="flex items-center">
              <Award className="h-3 w-3 mr-1" />
              {assessment.passingScore}% pass
            </span>
          </div>
          <span>{formatDate(assessment.createdAt)}</span>
        </div>
      </div>
    </Card>
  );

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Your Sequences</div>
              <div className="text-2xl font-bold text-gray-900">{sequences?.length || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Total Assessments</div>
              <div className="text-2xl font-bold text-gray-900">{assessments?.length || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Active Assessments</div>
              <div className="text-2xl font-bold text-gray-900">
                {assessments?.filter((a: Assessment) => a.isActive).length || 0}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Available Huddles</div>
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(sequenceHuddles).flat().length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sequences List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Sequences</h2>
          <div className="text-sm text-gray-500">
            Click "Show Huddles" to create assessments
          </div>
        </div>
        
        {sequencesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading your sequences...</p>
          </div>
        ) : sequences && sequences.length > 0 ? (
          <div className="space-y-4">
            {sequences.map(renderSequenceCard)}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sequences Found</h3>
            <p className="text-gray-500 mb-4">
              Create huddle sequences first to enable assessment creation.
            </p>
            <Button variant="outline">
              Go to Sequences
            </Button>
          </Card>
        )}
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assessments Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading assessments...</p>
        </div>
      ) : filteredAssessments && filteredAssessments.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessments.map(renderAssessmentCard)}
          </div>
        ) : (
          <DataTable
            data={filteredAssessments}
            columns={columns}
            loading={loading}
            emptyMessage="No assessments found"
            emptyIcon={<FileText className="h-6 w-6" />}
          />
        )
      ) : (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No assessments match your search.' : 'Create your first assessment to get started.'}
          </p>
          <Button onClick={() => setActiveTab('browse')}>
            Browse Sequences
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Assessment Center"
        description="Create and manage assessments for your huddle sequences"
        action={{
          label: 'Quick Create',
          onClick: () => setIsCreateModalOpen(true),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Browse Sequences
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Manage Assessments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' ? renderBrowseTab() : renderManageTab()}
      </div>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedHuddleId(null);
        }}
        title="Create New Assessment"
        size="xl"
      >
        <CreateAssessmentForm
          huddleId={selectedHuddleId}
          onSuccess={handleCreateAssessment}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedHuddleId(null);
          }}
        />
      </Modal>
    </div>
  );
};