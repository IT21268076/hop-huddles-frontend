// components/Huddle/HuddleDetailModal.tsx - Comprehensive huddle detail viewer
import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Volume2, 
  Play, 
  Pause, 
  Eye, 
  Edit3, 
  RefreshCw, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Mic,
  Share2,
  BookOpen,
  Zap,
  Brain
} from 'lucide-react';
import type { Huddle, HuddleSequence } from '../../types';

interface HuddleDetailModalProps {
  huddle: Huddle;
  sequence: HuddleSequence;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
}

const HuddleDetailModal: React.FC<HuddleDetailModalProps> = ({
  huddle,
  sequence,
  isOpen,
  onClose,
  canEdit = true
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'script'>('document');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control audio playback
  };

  const handlePreviewFull = () => {
    setIsPreviewMode(true);
    // In a real implementation, this would open full preview mode
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getHuddleTypeColor(huddle.huddleType)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{huddle.title}</h2>
                    <p className="text-blue-100 text-sm">{sequence.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviewFull}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview Full Huddle</span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Release Date</p>
                      <p className="text-white text-sm font-bold">
                        {huddle.visibility?.releaseDate 
                          ? new Date(huddle.visibility.releaseDate).toLocaleDateString()
                          : 'Mar 15, 2024'
                        }
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 text-blue-200" />
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Views</p>
                      <p className="text-white text-sm font-bold">
                        {huddle.analytics?.totalViews || 132}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-blue-200" />
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Engagement</p>
                      <p className="text-white text-sm font-bold">
                        {huddle.analytics?.engagementRate || 72}%
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-blue-200" />
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Avg Score</p>
                      <p className="text-white text-sm font-bold">
                        {huddle.analytics?.averageScore || 86}%
                      </p>
                    </div>
                    <Target className="h-5 w-5 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('document')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'document'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Document View</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'script'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Voiceover Script</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'document' && (
              <div className="space-y-4">
                {/* Document Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Document View</h3>
                  <div className="flex items-center space-x-2">
                    {canEdit && (
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refine
                      </button>
                    )}
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>

                {/* PDF Viewer Placeholder */}
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-dashed border-blue-200 min-h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {huddle.title}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                      Learn essential techniques for safely moving from bed to chair, 
                      preventing falls and maintaining independence in your daily activities.
                    </p>
                    
                    {/* Simulated PDF Content Preview */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border p-6 text-left max-w-2xl mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-3">Introduction</h4>
                      <p className="text-gray-700 text-sm mb-4">
                        Welcome to our first huddle on fall prevention. Today, we'll focus on one of the most critical skills for maintaining independence.
                      </p>
                      <h4 className="font-semibold text-gray-900 mb-3">Main Script</h4>
                      <p className="text-gray-700 text-sm mb-4">
                        Falls at home can be life-altering events. Simple, but doing it safely requires proper technique and awareness. First, always ensure your path is clear of obstacles like loose rugs or clutter...
                      </p>
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Page 1 of 3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="space-y-4">
                {/* Script Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Voiceover Script</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePlayPause}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                        isPlaying 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Listen
                        </>
                      )}
                    </button>
                    
                    {canEdit && (
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Script
                      </button>
                    )}
                    
                    {canEdit && (
                      <button className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-purple-600 hover:to-blue-700 transition-all">
                        <Zap className="h-4 w-4 mr-2" />
                        Refine with AI
                      </button>
                    )}
                  </div>
                </div>

                {/* Script Content */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Mic className="h-4 w-4 mr-2 text-blue-600" />
                        Introduction
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        "Welcome to our first huddle on fall prevention. Today, we'll focus on one of the most critical skills for maintaining independence - safe transfers from bed to chair. This might seem simple, but doing it safely requires proper technique and awareness."
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Mic className="h-4 w-4 mr-2 text-green-600" />
                        Main Script
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        "Falls at home can be life-altering events, dramatically impacting quality of life and independence. First, always ensure your path is clear of obstacles like loose rugs or clutter. Position your chair close to the bed at a slight angle - this gives you the best mechanical advantage."
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        "In this huddle, we introduced the essentials of safe transfer techniques. Remember, the key points: clear pathways, positioning support equipment properly, maintaining three points of contact, and taking your time. Mastering these habits builds confidence and independence."
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        "In our next huddle, we'll explore advanced techniques for bathroom safety. Remember: slow, steady, and safe always wins over speed. Thank you for your attention to fall prevention - your independence depends on it."
                      </p>
                    </div>

                    {/* Audio waveform visualization placeholder */}
                    {isPlaying && (
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Volume2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Now Playing</span>
                        </div>
                        <div className="flex items-center space-x-1 h-12">
                          {[...Array(40)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-full animate-pulse"
                              style={{
                                width: '3px',
                                height: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>0:45</span>
                          <span>3:24</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Last updated: {new Date(huddle.updatedAt).toLocaleDateString()} • 
                Duration: {huddle.durationMinutes || 0} minutes
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuddleDetailModal;