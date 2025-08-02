// components/learning/SmartEngagementTracker.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Clock, Activity, Pause } from 'lucide-react';

interface SmartEngagementTrackerProps {
  isActive: boolean;
  contentType: 'audio' | 'pdf' | 'text';
  onEngagementUpdate: (data: {
    activeTime: number;
    totalTime: number;
    interactionCount: number;
    engagementScore: number;
    isIdle: boolean;
  }) => void;
  children: React.ReactNode;
}

interface EngagementData {
  activeTime: number;
  totalTime: number;
  interactionCount: number;
  lastInteraction: number;
  isIdle: boolean;
  visibilityChanges: number;
  audioPlayTime: number;
  pauseEvents: number;
}

export const SmartEngagementTracker: React.FC<SmartEngagementTrackerProps> = ({
  isActive,
  contentType,
  onEngagementUpdate,
  children,
}) => {
  const [engagementData, setEngagementData] = useState<EngagementData>({
    activeTime: 0,
    totalTime: 0,
    interactionCount: 0,
    lastInteraction: Date.now(),
    isIdle: false,
    visibilityChanges: 0,
    audioPlayTime: 0,
    pauseEvents: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);
  const lastMouseMoveRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Idle detection threshold (30 seconds of no interaction)
  const IDLE_THRESHOLD = 30000;
  
  // Update engagement data
  const updateEngagement = () => {
    const now = Date.now();
    const isCurrentlyIdle = (now - lastMouseMoveRef.current) > IDLE_THRESHOLD;
    
    setEngagementData(prev => {
      const newTotalTime = prev.totalTime + 1000; // Add 1 second
      const newActiveTime = isCurrentlyIdle ? prev.activeTime : prev.activeTime + 1000;
      const engagementScore = calculateEngagementScore({
        ...prev,
        activeTime: newActiveTime,
        totalTime: newTotalTime,
        isIdle: isCurrentlyIdle,
      });

      const updatedData = {
        ...prev,
        activeTime: newActiveTime,
        totalTime: newTotalTime,
        isIdle: isCurrentlyIdle,
      };

      // Notify parent component
      onEngagementUpdate({
        activeTime: newActiveTime,
        totalTime: newTotalTime,
        interactionCount: prev.interactionCount,
        engagementScore,
        isIdle: isCurrentlyIdle,
      });

      return updatedData;
    });
  };

  // Calculate engagement score (0-100)
  const calculateEngagementScore = (data: EngagementData): number => {
    if (data.totalTime === 0) return 0;

    const activeRatio = data.activeTime / data.totalTime;
    const interactionFrequency = data.interactionCount / (data.totalTime / 60000); // interactions per minute
    const consistencyScore = Math.max(0, 1 - (data.visibilityChanges / 10)); // Penalty for too many tab switches
    
    // Weighted score calculation
    const baseScore = activeRatio * 0.6; // 60% weight on active time
    const interactionScore = Math.min(interactionFrequency / 5, 1) * 0.3; // 30% weight on interactions (max 5 per minute)
    const consistencyWeight = consistencyScore * 0.1; // 10% weight on consistency
    
    return Math.round((baseScore + interactionScore + consistencyWeight) * 100);
  };

  // Handle user interactions
  const handleInteraction = () => {
    const now = Date.now();
    lastMouseMoveRef.current = now;
    
    setEngagementData(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      lastInteraction: now,
    }));
  };

  // Handle visibility changes (tab switching, window focus)
  const handleVisibilityChange = () => {
    const isVisible = !document.hidden;
    isVisibleRef.current = isVisible;
    
    if (!isVisible) {
      setEngagementData(prev => ({
        ...prev,
        visibilityChanges: prev.visibilityChanges + 1,
      }));
    }
  };

  // Handle audio-specific events (when content type is audio)
  const handleAudioPlay = () => {
    if (contentType === 'audio') {
      const now = Date.now();
      setEngagementData(prev => ({
        ...prev,
        audioPlayTime: prev.audioPlayTime + (now - prev.lastInteraction),
        lastInteraction: now,
      }));
    }
  };

  const handleAudioPause = () => {
    if (contentType === 'audio') {
      setEngagementData(prev => ({
        ...prev,
        pauseEvents: prev.pauseEvents + 1,
      }));
    }
  };

  // Set up event listeners and tracking
  useEffect(() => {
    if (!isActive) return;

    // Start tracking
    startTimeRef.current = Date.now();
    
    // Set up interval for regular updates
    intervalRef.current = setInterval(updateEngagement, 1000);

    // Add event listeners
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleInteraction);
      container.addEventListener('click', handleInteraction);
      container.addEventListener('scroll', handleInteraction);
      container.addEventListener('keydown', handleInteraction);
    }

    // Global event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Audio-specific listeners (if parent provides audio element)
    if (contentType === 'audio') {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.addEventListener('play', handleAudioPlay);
        audio.addEventListener('pause', handleAudioPause);
      });
    }

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (container) {
        container.removeEventListener('mousemove', handleInteraction);
        container.removeEventListener('click', handleInteraction);
        container.removeEventListener('scroll', handleInteraction);
        container.removeEventListener('keydown', handleInteraction);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (contentType === 'audio') {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.removeEventListener('play', handleAudioPlay);
          audio.removeEventListener('pause', handleAudioPause);
        });
      }
    };
  }, [isActive, contentType]);

  // Reset tracking when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setEngagementData({
        activeTime: 0,
        totalTime: 0,
        interactionCount: 0,
        lastInteraction: Date.now(),
        isIdle: false,
        visibilityChanges: 0,
        audioPlayTime: 0,
        pauseEvents: 0,
      });
    }
  }, [isActive]);

  const engagementScore = calculateEngagementScore(engagementData);
  const activeTimeMinutes = Math.floor(engagementData.activeTime / 60000);
  const totalTimeMinutes = Math.floor(engagementData.totalTime / 60000);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
      
      {/* Engagement Indicator (only show if active and has some data) */}
      {isActive && engagementData.totalTime > 5000 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black bg-opacity-75 rounded-lg p-3 text-white text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-3 w-3" />
              <span>Engagement: {engagementScore}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Active: {activeTimeMinutes}m / {totalTimeMinutes}m</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {engagementData.isIdle ? (
                <>
                  <Pause className="h-3 w-3 text-yellow-400" />
                  <span className="text-yellow-400">Idle</span>
                </>
              ) : isVisibleRef.current ? (
                <>
                  <Eye className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Active</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 text-orange-400" />
                  <span className="text-orange-400">Background</span>
                </>
              )}
            </div>

            {/* Content-specific indicators */}
            {contentType === 'audio' && engagementData.audioPlayTime > 0 && (
              <div className="text-xs text-gray-300">
                Audio: {Math.floor(engagementData.audioPlayTime / 60000)}m
              </div>
            )}
            
            {engagementData.visibilityChanges > 2 && (
              <div className="text-xs text-orange-300">
                Tab switches: {engagementData.visibilityChanges}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};