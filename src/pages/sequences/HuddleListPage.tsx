// pages/sequences/HuddleListPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  BookOpen,
  Award,
  Timer,
  Users
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { HuddleSequence, Huddle, UserProgress, HuddleReleaseStatus } from '../../types';
import { formatDate, formatDuration } from '../../utils/helpers';
import { EnhancedHuddlePlayerModal } from '../my-huddles/EnhancedHuddlePlayerModal';
import { HuddleProgressIndicator } from '../../components/learning/HuddleProgressIndicator';
import { EngagementSummary } from '../../components/learning/EngagementSummary';

// Enhanced Huddle interface with release status
interface HuddleWithStatus extends Huddle {
  releaseStatus: HuddleReleaseStatus;
  isUnlocked: boolean;
  unlockReason?: string;
  progress?: UserProgress;
  scheduledReleaseTime?: string;
  assessmentRequired: boolean;
  assessmentPassed: boolean;
  assessmentAttempts: number;
  maxAssessmentAttempts: number;
}

type HuddleState = 'not-released' | 'released-locked' | 'released-unlocked' | 'completed';

export const HuddleListPage: React.FC = () => {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { currentUser, currentAssignment } = useApp();
  
  const [selectedHuddle, setSelectedHuddle] = useState<HuddleWithStatus | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Get sequence details
  const {
    data: sequence,
    loading: sequenceLoading,
  } = useAsync(
    async () => {
      if (!sequenceId) return null;
      return await apiClient.getSequenceById(Number(sequenceId));
    },
    [sequenceId]
  );

  // Get huddles with enhanced status information (filtered by user's role-discipline combination)
  const {
    data: huddlesWithStatus,
    loading: huddlesLoading,
    refetch: refetchHuddles,
  } = useAsync(
    async () => {
      if (!sequenceId || !currentUser || !currentAssignment) return [];
      
      // Get user's active role and discipline for combination filtering
      const activeRole = currentAssignment.activeRole || currentAssignment.role;
      const userDiscipline = currentAssignment.discipline;
      
      if (!activeRole || !userDiscipline) {
        console.error('🚨 LEARNING: Missing role or discipline for user', currentUser.userId);
        return [];
      }
      
      console.log('🎯 LEARNING: Loading combination-filtered huddles for sequence', sequenceId);
      console.log('🎯 LEARNING: User role-discipline:', activeRole, '-', userDiscipline);
      
      try {
        // Get sequence with combinations, progress, and release schedules in parallel
        const [sequenceWithCombinations, userProgress, releaseSchedules] = await Promise.all([
          apiClient.getBranchSequenceWithCombinations(Number(sequenceId)),
          apiClient.getUserSequenceProgressOverview(currentUser.userId),
          apiClient.getHuddleReleaseSchedules(Number(sequenceId)) // This API might not exist yet
            .catch(() => []) // Graceful fallback if API doesn't exist
        ]);

        // Find the combination that matches user's active role and discipline
        const matchingCombination = sequenceWithCombinations.combinations?.find(combination => 
          combination.userRole === activeRole && combination.discipline === userDiscipline
        );

        if (!matchingCombination) {
          console.warn('🔍 LEARNING: No matching combination found for', activeRole, '-', userDiscipline);
          console.warn('🔍 LEARNING: Available combinations:', sequenceWithCombinations.combinations?.map(c => `${c.userRole}-${c.discipline}`));
          return [];
        }

        const huddles = matchingCombination.huddles || [];
        console.log('🎯 LEARNING: Found matching combination:', matchingCombination.combinationId);
        console.log('🎯 LEARNING: Filtered to', huddles.length, 'huddles for', activeRole, '-', userDiscipline);
        console.log('🎯 LEARNING: Loaded', userProgress.length, 'progress records');

        // Create progress lookup
        const progressMap = new Map();
        userProgress.forEach((progress: any) => {
          if (progress.huddleId) {
            progressMap.set(progress.huddleId, progress);
          }
        });

        // Sort huddles by order and enhance with status
        const sortedHuddles = huddles
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((huddle, index): HuddleWithStatus => {
            const progress = progressMap.get(huddle.huddleId);
            const isCompleted = progress?.progressStatus === 'COMPLETED';
            const assessmentPassed = progress?.assessmentScore && progress.assessmentScore >= 70;
            
            // Determine if huddle is released (for now, assume all are released - will enhance with real schedule data)
            const isReleased = true; // TODO: Check against release schedules
            
            // Determine if huddle is unlocked (first huddle always unlocked if released, others need previous completed)
            let isUnlocked = false;
            let unlockReason = '';
            
            if (!isReleased) {
              unlockReason = 'Not yet released';
            } else if (index === 0) {
              // First huddle is always unlocked if released
              isUnlocked = true;
            } else {
              // Check if previous huddle is completed with assessment passed
              const previousHuddle = huddles[index - 1];
              const previousProgress = progressMap.get(previousHuddle.huddleId);
              const previousCompleted = previousProgress?.progressStatus === 'COMPLETED';
              const previousAssessmentPassed = previousHuddle.huddleType !== 'ASSESSMENT' || 
                (previousProgress?.assessmentScore && previousProgress.assessmentScore >= 70);
              
              isUnlocked = previousCompleted && previousAssessmentPassed;
              if (!isUnlocked) {
                if (!previousCompleted) {
                  unlockReason = `Complete "${previousHuddle.title}" first`;
                } else if (!previousAssessmentPassed) {
                  unlockReason = `Pass assessment for "${previousHuddle.title}" first`;
                }
              }
            }

            return {
              ...huddle,
              releaseStatus: isReleased ? 'RELEASED' : 'NOT_RELEASED',
              isUnlocked,
              unlockReason,
              progress,
              assessmentRequired: huddle.huddleType === 'ASSESSMENT',
              assessmentPassed: assessmentPassed || false,
              assessmentAttempts: progress?.assessmentAttempts || 0,
              maxAssessmentAttempts: 3, // TODO: Get from assessment config
            };
          });

        console.log('🎯 LEARNING: Enhanced huddles with status:', sortedHuddles.map(h => ({
          title: h.title,
          isUnlocked: h.isUnlocked,
          unlockReason: h.unlockReason,
          completed: h.progress?.progressStatus
        })));

        return sortedHuddles;
      } catch (error) {
        console.error('🚨 LEARNING: Error loading huddles:', error);
        return [];
      }
    },
    [sequenceId, currentUser?.userId, currentAssignment?.activeRole, currentAssignment?.role, currentAssignment?.discipline]
  );

  const handleStartHuddle = async (huddle: HuddleWithStatus) => {
    if (!currentUser || !huddle.isUnlocked) return;
    
    console.log('🎯 LEARNING: Starting huddle', huddle.huddleId, 'for user', currentUser.userId);
    
    try {
      // Start the huddle progress tracking
      await apiClient.startHuddle(currentUser.userId, huddle.huddleId);
      setSelectedHuddle(huddle);
      setIsPlayerOpen(true);
    } catch (error) {
      console.error('🚨 LEARNING: Failed to start huddle:', error);
    }
  };

  const handleHuddleComplete = async () => {
    console.log('🎯 LEARNING: Huddle completed, refreshing status');
    await refetchHuddles();
    setIsPlayerOpen(false);
    setSelectedHuddle(null);
  };

  const getHuddleState = (huddle: HuddleWithStatus): HuddleState => {
    if (huddle.progress?.progressStatus === 'COMPLETED') {
      return 'completed';
    }
    if (huddle.releaseStatus === 'NOT_RELEASED') {
      return 'not-released';
    }
    if (huddle.isUnlocked) {
      return 'released-unlocked';
    }
    return 'released-locked';
  };

  const getStateConfig = (state: HuddleState) => {
    switch (state) {
      case 'completed':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-900',
          actionLabel: 'Review',
          canInteract: true,
        };
      case 'released-unlocked':
        return {
          icon: Play,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-900',
          actionLabel: 'Start Learning',
          canInteract: true,
        };
      case 'released-locked':
        return {
          icon: Lock,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-500',
          actionLabel: 'Locked',
          canInteract: false,
        };
      case 'not-released':
        return {
          icon: Calendar,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-900',
          actionLabel: 'Coming Soon',
          canInteract: false,
        };
    }
  };

  if (!currentUser || !currentAssignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have an assignment.</p>
      </div>
    );
  }

  if (sequenceLoading || huddlesLoading) {
    return <LoadingSpinner text="Loading learning content..." className="py-12" />;
  }

  if (!sequence) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sequence not found.</p>
        <Button variant="outline" onClick={() => navigate('/my-huddles')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Huddles
        </Button>
      </div>
    );
  }

  const huddles = huddlesWithStatus || [];
  
  // Check if we have no huddles due to no matching combination
  if (currentUser && currentAssignment && huddles.length === 0) {
    const activeRole = currentAssignment.activeRole || currentAssignment.role;
    const userDiscipline = currentAssignment.discipline;
    
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Learning Content Available</h3>
        <div className="text-gray-600 space-y-2">
          <p>This sequence doesn't have content for your current role and discipline combination:</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
            <p className="font-semibold text-yellow-800">
              {activeRole} - {userDiscipline}
            </p>
          </div>
          <p className="text-sm mt-4">
            Please contact your administrator to add content for your role-discipline combination,
            <br />or switch to a different role if you have multiple assignments.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/my-huddles')} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Huddles
        </Button>
      </div>
    );
  }

  const completedCount = huddles.filter(h => getHuddleState(h) === 'completed').length;
  const inProgressCount = huddles.filter(h => getHuddleState(h) === 'released-unlocked' && (h.progress?.completionPercentage || 0) > 0).length;
  const totalTime = huddles.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
  const spentTime = huddles.reduce((sum, h) => sum + (h.progress?.timeSpentMinutes || 0), 0);
  const avgAssessmentScore = huddles
    .filter(h => h.progress?.assessmentScore)
    .reduce((sum, h, _, arr) => sum + (h.progress?.assessmentScore || 0) / arr.length, 0);
  const overallProgress = huddles.length > 0 ? (completedCount / huddles.length) * 100 : 0;

  return (
    <>
      <PageHeader
        title={sequence.title}
        description={
          currentAssignment ? (
            <>
              Complete huddles in sequence to unlock the next learning module
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="info" size="sm">
                  {currentAssignment.activeRole || currentAssignment.role}
                </Badge>
                <span>•</span>
                <Badge variant="secondary" size="sm">
                  {currentAssignment.discipline}
                </Badge>
                <span className="text-sm text-gray-500">
                  (Showing content for your role-discipline combination)
                </span>
              </div>
            </>
          ) : (
            "Complete huddles in sequence to unlock the next learning module"
          )
        }
        breadcrumbs={[
          { label: 'My Huddles', href: '/my-huddles' },
          { label: sequence.title },
        ]}
        action={
          <Button variant="outline" onClick={() => navigate('/my-huddles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Huddles
          </Button>
        }
      />

      {/* Enhanced Sequence Overview */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Learning Progress</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {sequence.branchName && (
                <>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {sequence.branchName}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {sequence.sequenceStatus}
              </span>
            </div>
          </div>
          
          {/* Progress Bar for Overall Sequence */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Sequence Progress</span>
              <span className="font-semibold">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{huddles.length}</div>
              <div className="text-xs text-gray-500">Total Huddles</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{inProgressCount}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-xl font-bold text-amber-600">
                {spentTime > 0 ? formatDuration(spentTime) : '0m'}
              </div>
              <div className="text-xs text-gray-500">Time Spent</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {avgAssessmentScore > 0 ? `${Math.round(avgAssessmentScore)}%` : '—'}
              </div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">
                {formatDuration(totalTime)}
              </div>
              <div className="text-xs text-gray-500">Total Duration</div>
            </div>
          </div>
          
          {/* Engagement Analytics Section */}
          {huddles.some(h => h.progress && h.progress.completionPercentage > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-900 mb-2">Learning Analytics</h3>
                <p className="text-sm text-gray-600">Track your engagement and learning effectiveness</p>
              </div>
              <EngagementSummary huddles={huddles} />
            </div>
          )}
        </div>
      </Card>

      {/* Huddles List */}
      <div className="space-y-4">
        {huddles.map((huddle, index) => {
          const state = getHuddleState(huddle);
          const config = getStateConfig(state);
          const Icon = config.icon;
          const progress = huddle.progress;

          return (
            <Card 
              key={huddle.huddleId} 
              className={`transition-all duration-200 ${config.bgColor} ${config.canInteract ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
              onClick={() => config.canInteract ? handleStartHuddle(huddle) : undefined}
            >
              <div className="flex items-center space-x-4">
                {/* Order Number & Status Icon */}
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${config.bgColor}`}>
                    {state === 'completed' ? (
                      <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    ) : (
                      <div className="text-center">
                        <Icon className={`h-4 w-4 ${config.iconColor} mx-auto`} />
                        <div className={`text-xs font-medium ${config.textColor}`}>
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Huddle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${config.textColor} truncate`}>
                      {huddle.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {huddle.assessmentRequired && (
                        <Badge variant={huddle.assessmentPassed ? 'success' : 'warning'} size="sm">
                          <Award className="h-3 w-3 mr-1" />
                          Assessment
                        </Badge>
                      )}
                      {huddle.durationMinutes && (
                        <Badge variant="default" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(huddle.durationMinutes)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Progress Tracking */}
                  {progress && (
                    <HuddleProgressIndicator
                      progress={progress}
                      isCompleted={state === 'completed'}
                      assessmentRequired={huddle.assessmentRequired}
                      durationMinutes={huddle.durationMinutes}
                      className="mb-3"
                    />
                  )}

                  {/* Status Message */}
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${config.textColor}`}>
                      {state === 'completed' && progress ? (
                        <>
                          Completed {formatDate(progress.completedAt || progress.lastAccessed)}
                          {huddle.assessmentPassed && (
                            <span className="ml-2 text-green-600">• Assessment Passed</span>
                          )}
                        </>
                      ) : state === 'released-locked' ? (
                        <span className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {huddle.unlockReason}
                        </span>
                      ) : state === 'not-released' ? (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {huddle.scheduledReleaseTime ? (
                            `Releases ${formatDate(huddle.scheduledReleaseTime)}`
                          ) : (
                            'Release date to be announced'
                          )}
                        </span>
                      ) : (
                        `Ready to start • ${huddle.huddleType.toLowerCase()} module`
                      )}
                    </p>

                    {/* Action Button */}
                    {config.canInteract && (
                      <Button
                        variant={state === 'completed' ? 'outline' : 'default'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartHuddle(huddle);
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {config.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {huddles.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Huddles Available</h3>
          <p className="text-gray-500 mb-4">
            This sequence doesn't have any huddles yet, or they haven't been released.
          </p>
          <Button variant="outline" onClick={() => navigate('/my-huddles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Huddles
          </Button>
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
        size="full"
      >
        {selectedHuddle && currentUser && (
          <EnhancedHuddlePlayerModal
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