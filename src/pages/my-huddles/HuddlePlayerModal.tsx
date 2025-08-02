// pages/my-huddles/HuddlePlayerModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiClient } from '../../services/api';
import { Huddle } from '../../types';
import { formatDuration } from '../../utils/helpers';

interface HuddlePlayerModalProps {
  huddle: Huddle;
  userId: number;
  onComplete: () => void;
  onClose: () => void;
}

export const HuddlePlayerModal: React.FC<HuddlePlayerModalProps> = ({
  huddle,
  userId,
  onComplete,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [contentData, setContentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Parse huddle content
  useEffect(() => {
    try {
      if (huddle.contentJson) {
        const parsed = JSON.parse(huddle.contentJson);
        setContentData(parsed);
      }
    } catch (error) {
      console.error('Failed to parse huddle content:', error);
    }
    setIsLoading(false);
  }, [huddle.contentJson]);

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
      handleComplete();
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

  // Progress tracking
  const updateProgress = async (current: number, total: number) => {
    if (total === 0) return;
    
    const percentage = (current / total) * 100;
    setProgress(percentage);

    // Update progress in backend every 30 seconds or significant progress changes
    if (percentage > 0 && (percentage % 25 === 0 || current % 30 === 0)) {
      try {
        await apiClient.updateProgress({
          userId,
          huddleId: huddle.huddleId,
          completionPercentage: percentage,
          timeSpentMinutes: current / 60,
        });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
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

  const handleComplete = async () => {
    try {
      await apiClient.completeHuddle(userId, huddle.huddleId);
      setIsCompleted(true);
      
      // Record assessment if this is an assessment huddle
      if (huddle.huddleType === 'ASSESSMENT') {
        // Simulate assessment score for demo
        const score = Math.floor(Math.random() * 30) + 70; // 70-100%
        await apiClient.recordAssessment(userId, huddle.huddleId, score);
        setAssessmentScore(score);
      }
    } catch (error) {
      console.error('Failed to complete huddle:', error);
    }
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
          </div>
        </div>
        
        {huddle.pdfUrl && (
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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

            {/* Assessment Results */}
            {isCompleted && huddle.huddleType === 'ASSESSMENT' && assessmentScore && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h5 className="text-sm font-medium text-green-900">Assessment Complete</h5>
                    <p className="text-sm text-green-700">
                      Your score: {assessmentScore}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        <div className="flex space-x-3">
          {!isCompleted ? (
            <>
              <Button variant="outline" onClick={handleComplete}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              {progress >= 80 && (
                <Button onClick={handleComplete}>
                  Complete & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Continue to Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};