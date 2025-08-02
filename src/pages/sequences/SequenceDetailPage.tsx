// pages/sequences/SequenceDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Play, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Settings,
  Eye,
  Download,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { HuddleSequence, Huddle, SequenceStatus } from '../../types';
import { formatDate, formatDuration, getStatusColor } from '../../utils/helpers';
import { HuddleEditModal } from './HuddleEditModal';
import { SequenceScheduleModal } from './SequenceScheduleModal';

export const SequenceDetailPage: React.FC = () => {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { currentAssignment } = useApp();
  const permissions = usePermissions({ 
    userRole: currentAssignment?.role,
    userDiscipline: currentAssignment?.discipline 
  });

  const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    data: sequence,
    loading: sequenceLoading,
    refetch: refetchSequence,
  } = useAsync(
    async () => {
      if (!sequenceId) return null;
      return await apiClient.getSequenceById(Number(sequenceId));
    },
    [sequenceId]
  );

  const {
    data: huddles,
    loading: huddlesLoading,
    refetch: refetchHuddles,
  } = useAsync(
    async () => {
      if (!sequenceId) return [];
      return await apiClient.getHuddlesBySequence(Number(sequenceId));
    },
    [sequenceId]
  );

  const handleEditHuddle = (huddle: Huddle) => {
    setSelectedHuddle(huddle);
    setIsEditModalOpen(true);
  };

  const handleHuddleUpdated = async () => {
    await refetchHuddles();
    await refetchSequence();
    setIsEditModalOpen(false);
    setSelectedHuddle(null);
  };

  const handleStatusChange = async (newStatus: SequenceStatus) => {
    if (!sequence || !currentAssignment) return;

    try {
      if (newStatus === 'PUBLISHED') {
        setIsPublishing(true);
        await apiClient.publishSequence(sequence.sequenceId, currentAssignment.userId);
      } else {
        await apiClient.updateSequenceStatus(sequence.sequenceId, newStatus, currentAssignment.userId);
      }
      await refetchSequence();
    } catch (error) {
      console.error('Failed to update sequence status:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusActions = (status: SequenceStatus) => {
    if (!permissions.canPublishSequences) return [];

    switch (status) {
      case 'DRAFT':
        return [
          { label: 'Move to Review', status: 'REVIEW' as SequenceStatus, variant: 'outline' as const },
        ];
      case 'REVIEW':
        return [
          { label: 'Publish', status: 'PUBLISHED' as SequenceStatus, variant: 'primary' as const },
          { label: 'Back to Draft', status: 'DRAFT' as SequenceStatus, variant: 'ghost' as const },
        ];
      case 'PUBLISHED':
        return [
          { label: 'Archive', status: 'ARCHIVED' as SequenceStatus, variant: 'destructive' as const },
        ];
      default:
        return [];
    }
  };

  if (sequenceLoading) {
    return <LoadingSpinner text="Loading sequence..." className="py-12" />;
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
        description={sequence.description}
        breadcrumbs={[
          { label: 'Huddle Sequences', href: '/sequences' },
          { label: sequence.title },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Sequence Overview */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Sequence Overview</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(sequence.sequenceStatus)}>
                  {sequence.sequenceStatus}
                </Badge>
                {statusActions.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleStatusChange(action.status)}
                    loading={isPublishing && action.status === 'PUBLISHED'}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{sequence.totalHuddles}</div>
                <div className="text-sm text-gray-500">Huddles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sequence.estimatedDurationMinutes 
                    ? formatDuration(sequence.estimatedDurationMinutes)
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{sequence.targets?.length || 0}</div>
                <div className="text-sm text-gray-500">Targets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {huddles?.filter(h => h.isComplete).length || 0}
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>

            {sequence.topic && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Learning Topic</h4>
                <p className="text-sm text-blue-800">{sequence.topic}</p>
              </div>
            )}
          </Card>

          {/* Huddles List */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Huddles</h3>
              {permissions.canEditHuddles && (
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Huddle
                </Button>
              )}
            </div>

            {huddlesLoading ? (
              <LoadingSpinner text="Loading huddles..." />
            ) : huddles && huddles.length > 0 ? (
              <div className="space-y-3">
                {huddles
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((huddle) => (
                    <div
                      key={huddle.huddleId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            huddle.isComplete 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {huddle.isComplete ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              huddle.orderIndex
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-gray-900">{huddle.title}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {huddle.huddleType}
                            </span>
                            {huddle.durationMinutes && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDuration(huddle.durationMinutes)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {huddle.pdfUrl && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {huddle.audioUrl && (
                          <Button variant="ghost" size="sm">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions.canEditHuddles && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditHuddle(huddle)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No huddles generated yet.</p>
                {sequence.sequenceStatus === 'GENERATING' && (
                  <p className="text-sm mt-2">AI is currently generating content...</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Target Audience */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
            <div className="space-y-3">
              {sequence.targets?.map((target) => (
                <div key={target.targetId} className="flex items-center space-x-2">
                  <Badge variant={target.targetType === 'DISCIPLINE' ? 'info' : 'success'}>
                    {target.targetType}
                  </Badge>
                  <span className="text-sm text-gray-900">{target.targetDisplayName}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {permissions.canScheduleHuddles && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Release
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Progress
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </Card>

          {/* Metadata */}
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
              {sequence.publishedByUserName && (
                <div>
                  <div className="font-medium text-gray-700">Published by</div>
                  <div className="text-gray-900">{sequence.publishedByUserName}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHuddle(null);
        }}
        title={`Edit ${selectedHuddle?.title}`}
        size="xl"
      >
        {selectedHuddle && (
          <HuddleEditModal
            huddle={selectedHuddle}
            onSuccess={handleHuddleUpdated}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedHuddle(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Sequence Release"
        size="lg"
      >
        {sequence && (
          <SequenceScheduleModal
            sequence={sequence}
            onSuccess={() => setIsScheduleModalOpen(false)}
            onCancel={() => setIsScheduleModalOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};