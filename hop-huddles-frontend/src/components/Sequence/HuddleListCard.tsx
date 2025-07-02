// components/Sequence/HuddleListCard.tsx - Futuristic huddle list with AI aesthetics
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Eye, 
  TrendingUp, 
  Star, 
  MoreVertical,
  Activity,
  Target,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import type { HuddleSequence, Huddle } from '../../types';

interface HuddleListCardProps {
  sequence: HuddleSequence;
  onHuddleClick: (huddle: Huddle) => void;
  onToggleHuddle?: (huddleId: number, isActive: boolean) => void;
  canEdit?: boolean;
}

const HuddleListCard: React.FC<HuddleListCardProps> = ({ 
  sequence, 
  onHuddleClick, 
  onToggleHuddle,
  canEdit = true 
}) => {
  const [activeToggles, setActiveToggles] = useState<Record<number, boolean>>(
    sequence.huddles.reduce((acc, huddle) => ({
      ...acc,
      [huddle.huddleId]: huddle.visibility?.isReleased || false
    }), {})
  );

  const handleToggle = (huddleId: number) => {
    const newState = !activeToggles[huddleId];
    setActiveToggles(prev => ({ ...prev, [huddleId]: newState }));
    onToggleHuddle?.(huddleId, newState);
  };

  const getHuddleTypeIcon = (type: string) => {
    switch (type) {
      case 'INTRO': return <Play className="h-4 w-4" />;
      case 'ASSESSMENT': return <Target className="h-4 w-4" />;
      case 'SUMMARY': return <CheckCircle className="h-4 w-4" />;
      case 'INTERACTIVE': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getHuddleTypeColor = (type: string) => {
    switch (type) {
      case 'INTRO': return 'from-green-500 to-emerald-600';
      case 'ASSESSMENT': return 'from-orange-500 to-red-600';
      case 'SUMMARY': return 'from-blue-500 to-indigo-600';
      case 'INTERACTIVE': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEngagementLevel = (analytics: any) => {
    if (!analytics) return { level: 'No Data', color: 'text-gray-500', percentage: 0 };
    
    const rate = analytics.engagementRate || 0;
    if (rate >= 90) return { level: 'Excellent', color: 'text-green-600', percentage: rate };
    if (rate >= 75) return { level: 'Good', color: 'text-blue-600', percentage: rate };
    if (rate >= 60) return { level: 'Average', color: 'text-yellow-600', percentage: rate };
    return { level: 'Needs Attention', color: 'text-red-600', percentage: rate };
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Huddle Sequence</h2>
              <p className="text-blue-100 text-sm">{sequence.huddles.length} Learning Modules</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm font-medium">Total Duration</p>
              <p className="text-white text-lg font-bold">
                {sequence.huddles.reduce((total, huddle) => total + (huddle.durationMinutes || 0), 0)} min
              </p>
            </div>
            
            {canEdit && (
              <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm">
                <Plus className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Huddle List */}
      <div className="p-6">
        {sequence.huddles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Huddles Yet</h3>
            <p className="text-gray-600 text-sm">Start building your sequence by adding the first huddle.</p>
            {canEdit && (
              <button className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Add First Huddle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sequence.huddles
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((huddle, index) => {
                const engagement = getEngagementLevel(huddle.analytics);
                const isActive = activeToggles[huddle.huddleId];
                
                return (
                  <div
                    key={huddle.huddleId}
                    className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => onHuddleClick(huddle)}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        {/* Left side - Huddle info */}
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Order number and type icon */}
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getHuddleTypeColor(huddle.huddleType)} rounded-xl flex items-center justify-center shadow-lg`}>
                              <div className="text-white font-bold text-sm">{index + 1}</div>
                            </div>
                            <div className="mt-1 flex justify-center">
                              <div className={`p-1 bg-gradient-to-br ${getHuddleTypeColor(huddle.huddleType)} rounded-md`}>
                                {getHuddleTypeIcon(huddle.huddleType)}
                              </div>
                            </div>
                          </div>

                          {/* Huddle details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {huddle.title}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{huddle.durationMinutes || 0} min</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{huddle.analytics?.totalViews || 0} views</span>
                                  </div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                                    {huddle.huddleType.toLowerCase()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Engagement metrics */}
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium">Engagement</p>
                                    <p className={`text-sm font-bold ${engagement.color}`}>
                                      {engagement.percentage}%
                                    </p>
                                  </div>
                                  <TrendingUp className={`h-4 w-4 ${engagement.color}`} />
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full bg-gradient-to-r ${
                                      engagement.percentage >= 75 ? 'from-green-400 to-green-600' :
                                      engagement.percentage >= 50 ? 'from-yellow-400 to-yellow-600' :
                                      'from-red-400 to-red-600'
                                    }`}
                                    style={{ width: `${engagement.percentage}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium">Avg Score</p>
                                    <p className="text-sm font-bold text-purple-600">
                                      {huddle.analytics?.averageScore || 0}%
                                    </p>
                                  </div>
                                  <Star className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="mt-2 flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`h-2 w-2 ${
                                        star <= Math.round((huddle.analytics?.averageScore || 0) / 20) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Toggle and actions */}
                        <div className="flex items-center space-x-3 ml-4">
                          {canEdit && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 font-medium">
                                {isActive ? 'Released' : 'Draft'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggle(huddle.huddleId);
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                    : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                    isActive ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle menu click
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Status indicators */}
                      <div className="absolute top-2 right-2">
                        {huddle.isComplete ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HuddleListCard;