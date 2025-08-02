// pages/my-huddles/MyHuddlesPage.tsx
import React, { useState } from 'react';
import { Play, Clock, BookOpen, CheckCircle2, Lock, Download, Volume2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { HuddleSequence, UserProgress, Huddle } from '../../types';
import { formatDate, formatDuration, getStatusColor } from '../../utils/helpers';
import { HuddlePlayerModal } from './HuddlePlayerModal';

export const MyHuddlesPage: React.FC = () => {
  const { currentUser, currentAssignment } = useApp();
  const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Get user's sequences based on their role and discipline
  const {
    data: availableSequences,
    loading: sequencesLoading,
    refetch: refetchSequences,
  } = useAsync(
    async () => {
      if (!currentUser) {
        console.log('MyHuddlesPage - No current user, returning empty array');
        return [];
      }
      
      console.log('MyHuddlesPage - Loading sequences for user:', currentUser.userId);
      try {
        // Get sequences that are visible to this user based on their role, discipline, and assignments
        const sequences = await apiClient.getBranchVisibleSequencesForUser(currentUser.userId);
        console.log('MyHuddlesPage - Sequences loaded:', sequences);
        return sequences;
      } catch (error) {
        console.error('MyHuddlesPage - Error loading sequences:', error);
        throw error;
      }
    },
    [currentUser?.userId]
  );

  // Get user's progress for all sequences
  const {
    data: userProgress,
    loading: progressLoading,
    refetch: refetchProgress,
  } = useAsync(
    async () => {
      if (!currentUser) return [];
      return await apiClient.getUserSequenceProgressOverview(currentUser.userId);
    },
    [currentUser?.userId]
  );

  const handleStartHuddle = async (huddle: Huddle) => {
    if (!currentUser) return;
    
    try {
      await apiClient.startHuddle(currentUser.userId, huddle.huddleId);
      setSelectedHuddle(huddle);
      setIsPlayerOpen(true);
      await refetchProgress();
    } catch (error) {
      console.error('Failed to start huddle:', error);
    }
  };

  const handleHuddleComplete = async () => {
    await refetchProgress();
    setIsPlayerOpen(false);
    setSelectedHuddle(null);
  };

  const getUserSequenceProgress = (sequenceId: number) => {
    return userProgress?.find(p => p.sequenceId === sequenceId);
  };

  const getSequenceStatus = (sequence: HuddleSequence) => {
    const progress = getUserSequenceProgress(sequence.sequenceId);
    if (!progress) return 'not-started';
    return progress.sequenceStatus.toLowerCase().replace('_', '-');
  };

  const getSequenceCompletionPercentage = (sequence: HuddleSequence) => {
    const progress = getUserSequenceProgress(sequence.sequenceId);
    return progress?.completionPercentage || 0;
  };

  if (!currentUser || !currentAssignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have an assignment.</p>
      </div>
    );
  }

  if (sequencesLoading || progressLoading) {
    return <LoadingSpinner text="Loading your huddles..." className="py-12" />;
  }

  return (
    <>
      <PageHeader
        title="My Huddles"
        description="Access your personalized micro-learning content and track your progress"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Available Sequences</div>
              <div className="text-2xl font-bold text-gray-900">
                {availableSequences?.length || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-gray-900">
                {userProgress?.filter(p => p.sequenceStatus === 'COMPLETED').length || 0}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">In Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {userProgress?.filter(p => p.sequenceStatus === 'IN_PROGRESS').length || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sequences Grid */}
      {availableSequences && availableSequences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSequences.map((sequence) => {
            const status = getSequenceStatus(sequence);
            const completionPercentage = getSequenceCompletionPercentage(sequence);
            const progress = getUserSequenceProgress(sequence.sequenceId);

            return (
              <Card key={sequence.sequenceId} className="hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {sequence.title}
                    </h3>
                    <Badge className={getStatusColor(status)}>
                      {status === 'not-started' ? 'New' : 
                       status === 'in-progress' ? 'In Progress' :
                       status === 'completed' ? 'Completed' : status}
                    </Badge>
                  </div>
                  
                  {sequence.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {sequence.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  {status !== 'not-started' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completionPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {sequence.totalHuddles} huddles
                    </span>
                    {sequence.estimatedDurationMinutes && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(sequence.estimatedDurationMinutes)}
                      </span>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {sequence.targets && sequence.targets.length > 0 ? (
                      <>
                        {sequence.targets.slice(0, 3).map((target) => (
                          <Badge key={target.targetId} variant="info" size="sm">
                            {target.targetDisplayName}
                          </Badge>
                        ))}
                        {sequence.targets.length > 3 && (
                          <Badge variant="default" size="sm">
                            +{sequence.targets.length - 3}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="default" size="sm">
                        No targets specified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {status === 'not-started' ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        // Start first huddle
                        if (sequence.huddles && sequence.huddles.length > 0) {
                          handleStartHuddle(sequence.huddles[0]);
                        }
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Navigate to sequence detail or continue
                        window.location.href = `/sequences/${sequence.sequenceId}`;
                      }}
                    >
                      Continue Learning
                    </Button>
                  )}

                  {/* Additional Info */}
                  {progress && (
                    <div className="text-xs text-gray-500 text-center">
                      Last accessed {formatDate(progress.lastAccessed)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Huddles Available</h3>
          <p className="text-gray-500 mb-4">
            There are no published huddle sequences available for your role and discipline yet.
          </p>
          <p className="text-sm text-gray-400">
            Contact your educator or administrator to get sequences assigned to you.
          </p>
        </Card>
      )}

      {/* Huddle Player Modal */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedHuddle(null);
        }}
        title={selectedHuddle?.title || ''}
        size="xl"
      >
        {selectedHuddle && currentUser && (
          <HuddlePlayerModal
            huddle={selectedHuddle}
            userId={currentUser.userId}
            onComplete={handleHuddleComplete}
            onClose={() => {
              setIsPlayerOpen(false);
              setSelectedHuddle(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};