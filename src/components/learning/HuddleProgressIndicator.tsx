// components/learning/HuddleProgressIndicator.tsx
import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  Timer, 
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { UserProgress, ProgressStatus } from '../../types';
import { formatDate, formatDuration } from '../../utils/helpers';

interface HuddleProgressIndicatorProps {
  progress: UserProgress;
  isCompleted: boolean;
  assessmentRequired: boolean;
  durationMinutes?: number;
  className?: string;
}

export const HuddleProgressIndicator: React.FC<HuddleProgressIndicatorProps> = ({
  progress,
  isCompleted,
  assessmentRequired,
  durationMinutes,
  className = ''
}) => {
  // Calculate engagement score (mock calculation based on time spent vs expected time)
  const calculateEngagementScore = () => {
    if (!progress.timeSpentMinutes || !durationMinutes) return 0;
    
    // Expected engagement: user spent reasonable time relative to content duration
    const timeRatio = progress.timeSpentMinutes / durationMinutes;
    
    // Ideal engagement: 0.8 to 1.5x the expected duration
    if (timeRatio >= 0.8 && timeRatio <= 1.5) return 85 + Math.random() * 10; // 85-95%
    if (timeRatio >= 0.5 && timeRatio < 0.8) return 65 + Math.random() * 15; // 65-80%
    if (timeRatio >= 1.5 && timeRatio <= 2.0) return 70 + Math.random() * 15; // 70-85%
    return 40 + Math.random() * 25; // 40-65%
  };

  const engagementScore = calculateEngagementScore();
  
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
          <span className="font-medium">Progress</span>
          <div className="flex items-center space-x-3">
            <span className="text-blue-600 font-semibold">
              {Math.round(progress.completionPercentage)}%
            </span>
            {progress.timeSpentMinutes > 0 && (
              <span className="text-gray-500 flex items-center">
                <Timer className="h-3 w-3 mr-1" />
                {formatDuration(progress.timeSpentMinutes)}
              </span>
            )}
          </div>
        </div>
        
        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            {/* Completed Progress */}
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${isCompleted ? 100 : progress.completionPercentage}%` }}
            />
            {/* Engagement Quality Indicator */}
            {!isCompleted && progress.completionPercentage > 0 && engagementScore > 0 && (
              <div
                className={`h-full transition-all duration-300 ${
                  engagementScore >= 80 ? 'bg-green-400' : 
                  engagementScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: '2px' }} // Thin quality indicator line
              />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-xs">
          {/* Assessment Results */}
          {assessmentRequired && progress.assessmentAttempts > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-amber-600 flex items-center">
                <Award className="h-3 w-3 mr-1" />
                {progress.assessmentAttempts} attempt{progress.assessmentAttempts !== 1 ? 's' : ''}
              </span>
              
              {progress.assessmentScore && (
                <Badge 
                  variant={progress.assessmentScore >= 70 ? 'success' : 'destructive'}
                  size="sm"
                >
                  {Math.round(progress.assessmentScore)}%
                </Badge>
              )}
            </div>
          )}
          
          {/* Engagement Score */}
          {engagementScore > 0 && progress.completionPercentage > 20 && (
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1 text-gray-400" />
              <span className={`text-xs ${getEngagementColor(engagementScore)}`}>
                {Math.round(engagementScore)}% engaged
              </span>
            </div>
          )}
        </div>
        
        {/* Last Activity */}
        {progress.lastAccessed && (
          <span className="text-xs text-gray-400">
            {formatDate(progress.lastAccessed)}
          </span>
        )}
      </div>

      {/* Status Messages & Insights */}
      {isCompleted && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            <span>Completed {formatDate(progress.completedAt || progress.lastAccessed)}</span>
          </div>
          
          {/* Completion Insights */}
          {engagementScore > 0 && (
            <div className="flex items-center space-x-2">
              {engagementScore >= 80 && (
                <Badge variant="success" size="sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High Engagement
                </Badge>
              )}
              {progress.assessmentScore && progress.assessmentScore >= 90 && (
                <Badge variant="success" size="sm">
                  <Award className="h-3 w-3 mr-1" />
                  Excellent
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Performance Warnings */}
      {!isCompleted && progress.completionPercentage > 0 && engagementScore < 60 && (
        <div className="flex items-center text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>Consider taking more time to engage with the content</span>
        </div>
      )}
    </div>
  );
};