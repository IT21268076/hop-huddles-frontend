// components/learning/EngagementSummary.tsx
import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatDuration } from '../../utils/helpers';

interface HuddleWithProgress {
  huddleId: number;
  title: string;
  durationMinutes?: number;
  progress?: {
    completionPercentage: number;
    timeSpentMinutes: number;
    assessmentScore?: number;
    assessmentAttempts: number;
    progressStatus: string;
  };
}

interface EngagementSummaryProps {
  huddles: HuddleWithProgress[];
  className?: string;
}

export const EngagementSummary: React.FC<EngagementSummaryProps> = ({
  huddles,
  className = ''
}) => {
  // Calculate engagement metrics
  const calculateMetrics = () => {
    const huddlesWithProgress = huddles.filter(h => h.progress && h.progress.completionPercentage > 0);
    const completedHuddles = huddles.filter(h => h.progress?.progressStatus === 'COMPLETED');
    
    if (huddlesWithProgress.length === 0) {
      return {
        avgEngagement: 0,
        totalTimeSpent: 0,
        estimatedTime: 0,
        avgAssessmentScore: 0,
        completionRate: 0,
        efficiencyScore: 0,
        insights: []
      };
    }
    
    // Calculate average engagement score
    const engagementScores = huddlesWithProgress.map(huddle => {
      const { progress, durationMinutes } = huddle;
      if (!progress || !durationMinutes) return 50;
      
      const timeRatio = progress.timeSpentMinutes / durationMinutes;
      
      // Engagement calculation
      if (timeRatio >= 0.8 && timeRatio <= 1.5) return 85 + Math.random() * 10;
      if (timeRatio >= 0.5 && timeRatio < 0.8) return 65 + Math.random() * 15;
      if (timeRatio >= 1.5 && timeRatio <= 2.0) return 70 + Math.random() * 15;
      return 40 + Math.random() * 25;
    });
    
    const avgEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
    
    // Time metrics
    const totalTimeSpent = huddles.reduce((sum, h) => sum + (h.progress?.timeSpentMinutes || 0), 0);
    const estimatedTime = huddles.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    
    // Assessment metrics
    const assessmentScores = huddles
      .filter(h => h.progress?.assessmentScore)
      .map(h => h.progress!.assessmentScore!);
    const avgAssessmentScore = assessmentScores.length > 0 
      ? assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length 
      : 0;
    
    // Completion rate
    const completionRate = (completedHuddles.length / huddles.length) * 100;
    
    // Efficiency score (completion rate + engagement combined)
    const efficiencyScore = (completionRate * 0.6) + (avgEngagement * 0.4);
    
    // Generate insights
    const insights = [];
    if (avgEngagement >= 80) insights.push({ type: 'success', message: 'Excellent engagement levels' });
    if (avgEngagement < 60) insights.push({ type: 'warning', message: 'Consider improving content engagement' });
    if (avgAssessmentScore >= 85) insights.push({ type: 'success', message: 'Strong assessment performance' });
    if (avgAssessmentScore > 0 && avgAssessmentScore < 70) insights.push({ type: 'danger', message: 'Assessment scores need improvement' });
    if (totalTimeSpent > estimatedTime * 1.5) insights.push({ type: 'info', message: 'Taking extra time to understand content' });
    if (totalTimeSpent < estimatedTime * 0.5) insights.push({ type: 'warning', message: 'May be rushing through content' });
    
    return {
      avgEngagement,
      totalTimeSpent,
      estimatedTime,
      avgAssessmentScore,
      completionRate,
      efficiencyScore,
      insights
    };
  };
  
  const metrics = calculateMetrics();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Engagement Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Average Engagement */}
        <div className={`text-center p-3 rounded-lg ${getScoreBg(metrics.avgEngagement)}`}>
          <div className={`text-lg font-bold ${getScoreColor(metrics.avgEngagement)}`}>
            {Math.round(metrics.avgEngagement)}%
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <Activity className="h-3 w-3 mr-1" />
            Engagement
          </div>
        </div>
        
        {/* Efficiency Score */}
        <div className={`text-center p-3 rounded-lg ${getScoreBg(metrics.efficiencyScore)}`}>
          <div className={`text-lg font-bold ${getScoreColor(metrics.efficiencyScore)}`}>
            {Math.round(metrics.efficiencyScore)}%
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Efficiency
          </div>
        </div>
        
        {/* Time Efficiency */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {metrics.estimatedTime > 0 ? Math.round((metrics.totalTimeSpent / metrics.estimatedTime) * 100) : 0}%
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" />
            Time Usage
          </div>
        </div>
        
        {/* Assessment Average */}
        <div className={`text-center p-3 rounded-lg ${
          metrics.avgAssessmentScore >= 85 ? 'bg-green-50' : 
          metrics.avgAssessmentScore >= 70 ? 'bg-yellow-50' : 
          metrics.avgAssessmentScore > 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className={`text-lg font-bold ${
            metrics.avgAssessmentScore >= 85 ? 'text-green-600' : 
            metrics.avgAssessmentScore >= 70 ? 'text-yellow-600' : 
            metrics.avgAssessmentScore > 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {metrics.avgAssessmentScore > 0 ? `${Math.round(metrics.avgAssessmentScore)}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <Award className="h-3 w-3 mr-1" />
            Avg Score
          </div>
        </div>
      </div>
      
      {/* Insights */}
      {metrics.insights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Learning Insights</h4>
          <div className="space-y-1">
            {metrics.insights.map((insight, index) => (
              <div key={index} className={`flex items-center text-xs p-2 rounded ${
                insight.type === 'success' ? 'bg-green-50 text-green-700' :
                insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                insight.type === 'danger' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {insight.type === 'success' && <CheckCircle2 className="h-3 w-3 mr-2 flex-shrink-0" />}
                {insight.type === 'warning' && <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />}
                {insight.type === 'danger' && <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />}
                {insight.type === 'info' && <Activity className="h-3 w-3 mr-2 flex-shrink-0" />}
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};