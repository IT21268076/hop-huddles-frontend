// pages/my-huddles/EnhancedHuddlePlayerModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Award,
  AlertCircle,
  Clock,
  BookOpen,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiClient } from '../../services/api';
import { Huddle, Assessment, UserAssessmentAttempt } from '../../types';
import { formatDuration } from '../../utils/helpers';
import { SmartEngagementTracker } from '../../components/learning/SmartEngagementTracker';

interface EnhancedHuddlePlayerModalProps {
  huddle: Huddle;
  userId: number;
  onComplete: () => void;
  onClose: () => void;
}

type LearningPhase = 'content' | 'assessment' | 'completed';

export const EnhancedHuddlePlayerModal: React.FC<EnhancedHuddlePlayerModalProps> = ({
  huddle,
  userId,
  onComplete,
  onClose,
}) => {
  // Audio and content state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [contentData, setContentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Learning workflow state
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('content');
  const [canProceedToAssessment, setCanProceedToAssessment] = useState(false);
  
  // Assessment state
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assessmentAttempt, setAssessmentAttempt] = useState<UserAssessmentAttempt | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, string>>({});
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    passed: boolean;
    feedback?: string;
  } | null>(null);
  
  // Smart engagement tracking state
  const [engagementData, setEngagementData] = useState({
    activeTime: 0,
    totalTime: 0,
    interactionCount: 0,
    engagementScore: 0,
    isIdle: false,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize content and assessment data
  useEffect(() => {
    const initializeHuddle = async () => {
      try {
        setIsLoading(true);
        
        // Parse huddle content
        if (huddle.contentJson) {
          const parsed = JSON.parse(huddle.contentJson);
          setContentData(parsed);
        }

        // Load assessment if this is an assessment huddle
        if (huddle.huddleType === 'ASSESSMENT') {
          console.log('🎯 ASSESSMENT: Loading assessment for huddle', huddle.huddleId);
          try {
            const assessmentData = await apiClient.getAssessmentByHuddle(huddle.huddleId);
            setAssessment(assessmentData);
            console.log('🎯 ASSESSMENT: Loaded assessment with', assessmentData.questions?.length || 0, 'questions');
          } catch (error) {
            console.error('🚨 ASSESSMENT: Failed to load assessment:', error);
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize huddle:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeHuddle();
  }, [huddle]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateProgress(audio.currentTime, audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCanProceedToAssessment(true);
      console.log('🎯 AUDIO: Audio completed, can proceed to assessment');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Progress tracking with smart engagement detection
  const updateProgress = async (current: number, total: number) => {
    if (total === 0) return;
    
    const percentage = (current / total) * 100;
    setProgress(percentage);

    // Enhanced engagement-based readiness check
    const isEngagementSufficient = engagementData.engagementScore >= 60; // At least 60% engagement
    const isContentProgress = percentage >= 70; // At least 70% audio progress
    const hasMinimalInteraction = engagementData.interactionCount >= 5; // Some interaction required
    
    if (isEngagementSufficient && isContentProgress && hasMinimalInteraction && !canProceedToAssessment) {
      setCanProceedToAssessment(true);
      console.log('🎯 SMART ENGAGEMENT: User ready for assessment - Score:', engagementData.engagementScore, 'Progress:', percentage);
    }

    // Update progress in backend with engagement data
    if (percentage > 0 && (percentage % 25 === 0 || current % 30 === 0)) {
      try {
        await apiClient.updateProgress({
          userId,
          huddleId: huddle.huddleId,
          completionPercentage: percentage,
          timeSpentMinutes: engagementData.activeTime / 60000, // Use actual active time instead of audio time
        });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  // Handle engagement updates from the smart tracker
  const handleEngagementUpdate = (data: {
    activeTime: number;
    totalTime: number;
    interactionCount: number;
    engagementScore: number;
    isIdle: boolean;
  }) => {
    setEngagementData(data);
    
    // Check if user is now ready for assessment based on engagement
    if (!canProceedToAssessment && data.engagementScore >= 60 && progress >= 70 && data.interactionCount >= 5) {
      setCanProceedToAssessment(true);
      console.log('🎯 ENGAGEMENT UPDATE: User now ready for assessment');
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCompleteContent = async () => {
    console.log('🎯 CONTENT: Content phase completed for huddle', huddle.huddleId);
    
    if (huddle.huddleType === 'ASSESSMENT' && assessment) {
      // Move to assessment phase
      setCurrentPhase('assessment');
      await startAssessmentAttempt();
    } else {
      // Complete the huddle directly for non-assessment huddles
      await completeHuddle();
    }
  };

  const startAssessmentAttempt = async () => {
    if (!assessment) return;
    
    try {
      console.log('🎯 ASSESSMENT: Starting assessment attempt for assessment', assessment.assessmentId);
      const attempt = await apiClient.startAssessment(assessment.assessmentId, userId);
      setAssessmentAttempt(attempt);
      console.log('🎯 ASSESSMENT: Started attempt', attempt.attemptId);
    } catch (error) {
      console.error('🚨 ASSESSMENT: Failed to start assessment:', error);
    }
  };

  const handleAssessmentAnswer = (questionId: number, answer: string) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAssessment = async () => {
    if (!assessmentAttempt || !assessment) return;
    
    setIsSubmittingAssessment(true);
    
    try {
      console.log('🎯 ASSESSMENT: Submitting assessment with answers:', assessmentAnswers);
      const result = await apiClient.submitAssessment(assessmentAttempt.attemptId, assessmentAnswers);
      
      const passed = result.score >= (assessment.passingScore || 70);
      setAssessmentResult({
        score: result.score,
        passed,
        feedback: passed ? 'Congratulations! You passed the assessment.' : `You need ${assessment.passingScore || 70}% to pass. You can try again.`
      });
      
      console.log('🎯 ASSESSMENT: Assessment result:', result.score, 'passed:', passed);
      
      if (passed) {
        // Complete the huddle if assessment passed
        await completeHuddle();
      } else {
        // Allow retry if not passed
        console.log('🎯 ASSESSMENT: Assessment failed, allowing retry');
      }
      
    } catch (error) {
      console.error('🚨 ASSESSMENT: Failed to submit assessment:', error);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const completeHuddle = async () => {
    try {
      console.log('🎯 COMPLETION: Completing huddle', huddle.huddleId);
      await apiClient.completeHuddle(userId, huddle.huddleId);
      setCurrentPhase('completed');
      console.log('🎯 COMPLETION: Huddle marked as completed');
    } catch (error) {
      console.error('🚨 COMPLETION: Failed to complete huddle:', error);
    }
  };

  const handleRetryAssessment = () => {
    setAssessmentResult(null);
    setAssessmentAnswers({});
    setCurrentPhase('assessment');
    startAssessmentAttempt();
  };

  const handleDownloadPdf = () => {
    if (huddle.pdfUrl) {
      window.open(apiClient.getFileUrl(huddle.pdfUrl), '_blank');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading huddle content..." />;
  }

  return (
    <SmartEngagementTracker
      isActive={currentPhase === 'content'}
      contentType={huddle.audioUrl ? 'audio' : 'text'}
      onEngagementUpdate={handleEngagementUpdate}
    >
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{huddle.title}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="info">{huddle.huddleType}</Badge>
            {huddle.durationMinutes && (
              <span className="text-sm text-gray-500">
                {formatDuration(huddle.durationMinutes)}
              </span>
            )}
            {currentPhase === 'assessment' && assessment && (
              <Badge variant="warning">
                <Award className="h-3 w-3 mr-1" />
                Assessment Required
              </Badge>
            )}
          </div>
        </div>
        
        {huddle.pdfUrl && (
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Phase Progress Indicator */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentPhase === 'content' ? 'text-blue-600' : currentPhase === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentPhase === 'content' ? 'bg-blue-100' : 'bg-green-100'}`}>
            {currentPhase === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          </div>
          <span className="text-sm font-medium">Content Learning</span>
        </div>
        
        {huddle.huddleType === 'ASSESSMENT' && (
          <>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${currentPhase === 'assessment' ? 'text-blue-600' : currentPhase === 'completed' && assessmentResult?.passed ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentPhase === 'assessment' ? 'bg-blue-100' : currentPhase === 'completed' && assessmentResult?.passed ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentPhase === 'completed' && assessmentResult?.passed ? <CheckCircle2 className="h-5 w-5" /> : <Award className="h-5 w-5" />}
              </div>
              <span className="text-sm font-medium">Assessment</span>
            </div>
          </>
        )}
      </div>

      {/* Content Phase */}
      {currentPhase === 'content' && (
        <>
          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Content */}
            <Card>
              <div className="h-96 overflow-y-auto">
                {contentData ? (
                  <div className="prose prose-sm max-w-none">
                    {contentData.sections?.map((section: any, index: number) => (
                      <div key={index} className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h4>
                        <div className="text-gray-700 leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No content available for this huddle.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Audio Player & Controls */}
            <Card>
              <div className="space-y-6">
                {/* Audio Controls */}
                {huddle.audioUrl ? (
                  <>
                    <audio ref={audioRef} src={apiClient.getFileUrl(huddle.audioUrl)} preload="metadata" />
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handlePlayPause}
                          className="w-16 h-16 rounded-full"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Seek Bar */}
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={duration > 0 ? (currentTime / duration) * 100 : 0}
                          onChange={handleSeek}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Volume2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No audio available for this huddle</p>
                  </div>
                )}

                {/* Voice Script Preview */}
                {huddle.voiceScript && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Voice Script</h5>
                    <div className="text-sm text-blue-800 max-h-32 overflow-y-auto">
                      {huddle.voiceScript.substring(0, 200)}
                      {huddle.voiceScript.length > 200 && '...'}
                    </div>
                  </div>
                )}

                {/* Enhanced Progress Info with Engagement Data */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-green-900 mb-2">Learning Progress</h5>
                  
                  {/* Progress and Engagement Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-green-700">Content Progress</div>
                      <div className="text-lg font-semibold text-green-900">{Math.round(progress)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700">Engagement Score</div>
                      <div className="text-lg font-semibold text-green-900">{engagementData.engagementScore}%</div>
                    </div>
                  </div>

                  {/* Active Time Display */}
                  <div className="flex items-center text-xs text-green-700 mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Active Learning: {Math.floor(engagementData.activeTime / 60000)}m of {Math.floor(engagementData.totalTime / 60000)}m</span>
                    {engagementData.isIdle && (
                      <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                        Currently Idle
                      </span>
                    )}
                  </div>

                  {/* Status Message */}
                  <p className="text-sm text-green-800">
                    {canProceedToAssessment ? (
                      "🎉 Excellent engagement! You're ready for the assessment."
                    ) : progress >= 70 ? (
                      engagementData.engagementScore >= 60 ? (
                        engagementData.interactionCount >= 5 ? (
                          "Almost ready! Continue engaging with the content."
                        ) : (
                          "Good progress! Try interacting more with the content (click, scroll, etc.)"
                        )
                      ) : (
                        "Keep focused! Your engagement score needs to reach 60% to proceed."
                      )
                    ) : (
                      `Continue learning - need 70% content progress and 60% engagement (${Math.round(progress)}% content, ${engagementData.engagementScore}% engagement)`
                    )}
                  </p>

                  {/* Engagement Tips */}
                  {!canProceedToAssessment && engagementData.totalTime > 30000 && (
                    <div className="mt-2 text-xs text-green-600">
                      💡 Tip: Stay focused, interact with content, and avoid switching tabs for better engagement
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Content Phase Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <div className="flex space-x-3">
              {!canProceedToAssessment ? (
                <Button disabled variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  {progress < 70 ? "Need 70% Progress" : 
                   engagementData.engagementScore < 60 ? "Need 60% Engagement" : 
                   engagementData.interactionCount < 5 ? "More Interaction Needed" : 
                   "Continue Learning"}
                </Button>
              ) : (
                <Button onClick={handleCompleteContent}>
                  {huddle.huddleType === 'ASSESSMENT' ? (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Take Assessment
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Huddle
                    </>
                  )}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Assessment Phase */}
      {currentPhase === 'assessment' && assessment && (
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">{assessment.title}</h3>
              <p className="text-gray-600 mt-2">{assessment.description}</p>
              
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
                <span>{assessment.questions?.length || 0} Questions</span>
                <span>Passing Score: {assessment.passingScore || 70}%</span>
                {assessment.timeLimit && <span>Time Limit: {assessment.timeLimit} minutes</span>}
              </div>
            </div>

            {/* Assessment Questions */}
            {assessment.questions && assessment.questions.length > 0 && (
              <div className="space-y-6">
                {assessment.questions.map((question, index) => (
                  <div key={question.questionId} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Question {index + 1}: {question.questionText}
                    </h4>
                    
                    <div className="space-y-3">
                      {question.options?.map((option) => (
                        <label key={option.optionId} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.questionId}`}
                            value={option.optionText}
                            checked={assessmentAnswers[question.questionId] === option.optionText}
                            onChange={(e) => handleAssessmentAnswer(question.questionId, e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option.optionText}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assessment Actions */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentPhase('content')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Content
              </Button>
              
              <Button 
                onClick={submitAssessment}
                loading={isSubmittingAssessment}
                disabled={Object.keys(assessmentAnswers).length !== (assessment.questions?.length || 0)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Assessment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Assessment Result */}
      {assessmentResult && (
        <Card>
          <div className="text-center space-y-4">
            {assessmentResult.passed ? (
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
            ) : (
              <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            )}
            
            <div>
              <h3 className={`text-xl font-semibold ${assessmentResult.passed ? 'text-green-900' : 'text-red-900'}`}>
                {assessmentResult.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
              </h3>
              <p className="text-lg font-medium text-gray-900 mt-2">
                Your Score: {assessmentResult.score}%
              </p>
              <p className="text-gray-600 mt-2">{assessmentResult.feedback}</p>
            </div>

            <div className="flex justify-center space-x-4">
              {assessmentResult.passed ? (
                <Button onClick={onComplete}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to Next Huddle
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleRetryAssessment}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Assessment
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Completed Phase */}
      {currentPhase === 'completed' && !assessmentResult && (
        <Card>
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
            <div>
              <h3 className="text-xl font-semibold text-green-900">Huddle Completed!</h3>
              <p className="text-gray-600 mt-2">
                Great job! You've successfully completed this learning module.
              </p>
            </div>
            <Button onClick={onComplete}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue to Next Huddle
            </Button>
          </div>
        </Card>
      )}
      </div>
    </SmartEngagementTracker>
  );
};