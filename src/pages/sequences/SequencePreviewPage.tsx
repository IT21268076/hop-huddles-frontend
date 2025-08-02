// pages/sequences/SequencePreviewPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Eye, 
  Calendar, 
  Save, 
  Send, 
  FileText,
  Volume2,
  Clock,
  Users,
  MapPin,
  Plus,
  Award
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { useApiWithToast } from '../../utils/apiHelpers';
import { apiClient } from '../../services/api';
import { HuddleSequence, HuddleCombination, Huddle, UserRole, Discipline, SequenceStatus, SequenceStatusEnum } from '../../types';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { SimplifiedHuddleEditModal } from './SimplifiedHuddleEditModal';
import { CreateAssessmentForm } from '../assessments/CreateAssessmentForm';

export const SequencePreviewPage: React.FC = () => {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { updateStatusWithToast } = useApiWithToast();
  
  // Tab navigation state
  const [activeRoleTab, setActiveRoleTab] = useState<string>('');
  const [activeDisciplineTab, setActiveDisciplineTab] = useState<string>('');
  const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit');
  
  // Assessment creation state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedHuddleForAssessment, setSelectedHuddleForAssessment] = useState<number | null>(null);

  // Load sequence with combinations and huddles
  const {
    data: sequence,
    loading: sequenceLoading,
    refetch: refetchSequence,
  } = useAsync(
    async () => {
      if (!sequenceId) return null;
      return await apiClient.getBranchSequenceWithCombinations(Number(sequenceId));
    },
    [sequenceId]
  );

  // Group combinations by role for tab structure
  const combinationsByRole = React.useMemo(() => {
    if (!sequence?.combinations) return {};

    const grouped: Record<string, HuddleCombination[]> = {};
    
    sequence.combinations.forEach(combination => {
      const roleKey = combination.userRole;
      if (!grouped[roleKey]) {
        grouped[roleKey] = [];
      }
      grouped[roleKey].push(combination);
    });

    return grouped;
  }, [sequence?.combinations]);

  // Set initial active tabs
  React.useEffect(() => {
    if (Object.keys(combinationsByRole).length > 0 && !activeRoleTab) {
      const firstRole = Object.keys(combinationsByRole)[0];
      setActiveRoleTab(firstRole);
      
      if (combinationsByRole[firstRole]?.length > 0) {
        const firstDiscipline = combinationsByRole[firstRole][0].discipline;
        setActiveDisciplineTab(`${firstRole}-${firstDiscipline}`);
      }
    }
  }, [combinationsByRole, activeRoleTab]);

  // Get current combination based on active tabs
  const currentCombination = React.useMemo(() => {
    if (!activeRoleTab || !activeDisciplineTab) return null;
    
    const [role, discipline] = activeDisciplineTab.split('-');
    return sequence?.combinations?.find(c => 
      c.userRole === role && c.discipline === discipline
    ) || null;
  }, [sequence?.combinations, activeRoleTab, activeDisciplineTab]);

  const handleStatusUpdate = async (newStatus: SequenceStatus) => {
    if (!sequence || !currentUser) return;

    setIsUpdating(true);
    try {
      await updateStatusWithToast(apiClient, sequence.sequenceId, newStatus, currentUser.userId);
      await refetchSequence();
    } catch (error) {
      // Error already shown via toast in updateStatusWithToast
      console.error('Failed to update sequence status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewHuddle = (huddle: Huddle) => {
    setSelectedHuddle(huddle);
    setModalMode('view');
    setIsEditModalOpen(true);
  };

  const handleEditHuddle = (huddle: Huddle) => {
    setSelectedHuddle(huddle);
    setModalMode('edit');
    setIsEditModalOpen(true);
  };

  const handleHuddleUpdated = async () => {
    await refetchSequence();
    setIsEditModalOpen(false);
    setSelectedHuddle(null);
  };

  const handleCreateAssessment = (huddle: Huddle) => {
    setSelectedHuddleForAssessment(huddle.huddleId);
    setIsAssessmentModalOpen(true);
  };

  const handleAssessmentCreated = () => {
    setIsAssessmentModalOpen(false);
    setSelectedHuddleForAssessment(null);
    // Could add a toast notification here
  };

  const getStatusActions = (status: SequenceStatus) => {
    switch (status) {
      case SequenceStatusEnum.DRAFT:
        return [
          { 
            label: 'Save as Draft', 
            action: () => handleStatusUpdate(SequenceStatusEnum.DRAFT),
            variant: 'outline' as const,
            icon: Save
          },
          { 
            label: 'Set to Review', 
            action: () => handleStatusUpdate(SequenceStatusEnum.REVIEW),
            variant: 'primary' as const,
            icon: Send
          },
        ];
      case SequenceStatusEnum.REVIEW:
        return [
          { 
            label: 'Back to Draft', 
            action: () => handleStatusUpdate(SequenceStatusEnum.DRAFT),
            variant: 'outline' as const,
            icon: ArrowLeft
          },
          { 
            label: 'Publish', 
            action: () => handleStatusUpdate(SequenceStatusEnum.PUBLISHED),
            variant: 'primary' as const,
            icon: Send
          },
        ];
      case SequenceStatusEnum.PUBLISHED:
        return [
          { 
            label: 'Archive', 
            action: () => handleStatusUpdate(SequenceStatusEnum.ARCHIVED),
            variant: 'destructive' as const,
            icon: ArrowLeft
          },
        ];
      default:
        return [];
    }
  };

  if (sequenceLoading) {
    return <LoadingSpinner text="Loading sequence preview..." className="py-12" />;
  }

  if (!sequence) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sequence not found.</p>
        <Button variant="outline" onClick={() => navigate('/sequences')} className="mt-4">
          Back to Sequences
        </Button>
      </div>
    );
  }

  const statusActions = getStatusActions(sequence.sequenceStatus);

  return (
    <>
      <PageHeader
        title={sequence.title}
        description={`Preview generated content and manage sequence status`}
        breadcrumbs={[
          { label: 'Huddle Sequences', href: '/sequences' },
          { label: sequence.title },
        ]}
        action={
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(sequence.sequenceStatus)}>
              {sequence.sequenceStatus}
            </Badge>
            {statusActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                loading={isUpdating}
                size="sm"
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sequence Info Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Branch Context */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Context</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{sequence.branchDisplayName}</span>
              </div>
              {sequence.branchCcn && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">CCN:</span>
                  <span className="text-gray-900 ml-1">{sequence.branchCcn}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Generation Settings */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Settings</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Topic:</span>
                <p className="text-gray-900 mt-1">{sequence.topic}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Combinations:</span>
                <span className="text-gray-900 ml-1">{sequence.totalCombinations}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-900 ml-1">{sequence.estimatedDurationMinutes} min</span>
              </div>
            </div>
          </Card>

          {/* Target Audience */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Roles</div>
                <div className="flex flex-wrap gap-1">
                  {sequence.targetRoles?.map((role) => (
                    <Badge key={role} variant="info" size="sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Disciplines</div>
                <div className="flex flex-wrap gap-1">
                  {sequence.targetDisciplines?.map((discipline) => (
                    <Badge key={discipline} variant="success" size="sm">
                      {discipline}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Sequence Details */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Created by</div>
                <div className="text-gray-900">{sequence.createdByUserName}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Created on</div>
                <div className="text-gray-900">{formatDate(sequence.createdAt)}</div>
              </div>
              {sequence.publishedAt && (
                <div>
                  <div className="font-medium text-gray-700">Published on</div>
                  <div className="text-gray-900">{formatDate(sequence.publishedAt)}</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content - Nested Tabs */}
        <div className="xl:col-span-3">
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900">Generated Content Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                Navigate through role-discipline combinations to view and edit generated huddles
              </p>
            </div>

            {/* Parent Tabs - Roles */}
            <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {Object.keys(combinationsByRole).map((role) => (
                  <TabsTrigger key={role} value={role} className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {role}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(combinationsByRole).map(([role, combinations]) => (
                <TabsContent key={role} value={role}>
                  {/* Child Tabs - Disciplines */}
                  <Tabs value={activeDisciplineTab} onValueChange={setActiveDisciplineTab}>
                    <TabsList className="grid grid-cols-4 mb-6">
                      {combinations.map((combination) => (
                        <TabsTrigger 
                          key={`${role}-${combination.discipline}`}
                          value={`${role}-${combination.discipline}`}
                          className="flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {combination.discipline}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {combinations.map((combination) => (
                      <TabsContent 
                        key={`${role}-${combination.discipline}`}
                        value={`${role}-${combination.discipline}`}
                      >
                        {/* Combination Content */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-gray-900">
                              {combination.title || `${role} - ${combination.discipline}`}
                            </h4>
                            <Badge variant="info">
                              {combination.totalHuddles} huddles
                            </Badge>
                          </div>

                          {combination.description && (
                            <p className="text-gray-600">{combination.description}</p>
                          )}

                          {/* Huddles List */}
                          <div className="space-y-3">
                            {combination.huddles?.map((huddle) => (
                              <div
                                key={huddle.huddleId}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                                      {huddle.orderIndex}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{huddle.title}</div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      {huddle.durationMinutes && (
                                        <span className="flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          {huddle.durationMinutes} min
                                        </span>
                                      )}
                                      {huddle.hasPdf && (
                                        <span className="flex items-center">
                                          <FileText className="h-4 w-4 mr-1" />
                                          PDF Ready
                                        </span>
                                      )}
                                      {huddle.hasVoiceScript && (
                                        <span className="flex items-center">
                                          <Volume2 className="h-4 w-4 mr-1" />
                                          Voice Script
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleViewHuddle(huddle)}
                                    title="View huddle content"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {sequence.canEdit && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditHuddle(huddle)}
                                      title="Edit huddle content"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {/* ✅ Enhanced Create Assessment Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreateAssessment(huddle)}
                                    title="Create assessment for this huddle"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Assessment
                                  </Button>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-8 text-gray-500">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No huddles generated for this combination yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Simplified Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHuddle(null);
        }}
        title={selectedHuddle?.title ? `${modalMode === 'view' ? 'View' : 'Edit'}: ${selectedHuddle.title}` : `${modalMode === 'view' ? 'View' : 'Edit'} Huddle`}
        size="xl"
      >
        {selectedHuddle && (
          <SimplifiedHuddleEditModal
            huddle={selectedHuddle}
            mode={modalMode}
            onSuccess={handleHuddleUpdated}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedHuddle(null);
            }}
          />
        )}
      </Modal>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => {
          setIsAssessmentModalOpen(false);
          setSelectedHuddleForAssessment(null);
        }}
        title="Create Assessment"
        size="xl"
      >
        {selectedHuddleForAssessment && (
          <CreateAssessmentForm
            huddleId={selectedHuddleForAssessment}
            onSuccess={handleAssessmentCreated}
            onCancel={() => {
              setIsAssessmentModalOpen(false);
              setSelectedHuddleForAssessment(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};