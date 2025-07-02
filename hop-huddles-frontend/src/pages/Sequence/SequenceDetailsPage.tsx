// pages/Sequence/SequenceDetailsPage.tsx - Complete sequence details page with AI aesthetics
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical,
  Play,
  Pause,
  Settings,
  Eye,
  Download,
  Zap,
  Brain,
  Activity,
  TrendingUp,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { HuddleSequence, Huddle } from '../../types';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import SequenceInfoCard from '../../components/Sequence/SequenceInfo';
import HuddleListCard from '../../components/Sequence/HuddleListCard';
import HuddleDetailModal from '../../components/Huddle/HuddleDetailModal';
import EditSequenceModal from '../../components/Sequence/EditSequenceModal';
import toast from 'react-hot-toast';

const SequenceDetailsPage: React.FC = () => {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
  const [isHuddleModalOpen, setIsHuddleModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch sequence details
  const { data: sequence, isLoading, error } = useQuery(
    ['sequence', sequenceId],
    () => sequenceId ? apiClient.getSequence(parseInt(sequenceId)) : Promise.reject('No sequence ID'),
    { enabled: !!sequenceId }
  );

  // Permission checks
  const canEdit = hasPermission(user?.assignments || [], PERMISSIONS.HUDDLE_UPDATE);
  const canPublish = hasPermission(user?.assignments || [], PERMISSIONS.HUDDLE_PUBLISH);

  // Update huddle visibility mutation
  const updateHuddleVisibilityMutation = useMutation(
    ({ huddleId, isReleased }: { huddleId: number; isReleased: boolean }) =>
      apiClient.updateHuddleVisibility(huddleId, { isReleased }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sequence', sequenceId]);
        toast.success('Huddle visibility updated');
      },
      onError: () => {
        toast.error('Failed to update huddle visibility');
      }
    }
  );

  // Handlers
  const handleHuddleClick = (huddle: Huddle) => {
    setSelectedHuddle(huddle);
    setIsHuddleModalOpen(true);
  };

  const handleToggleHuddle = (huddleId: number, isActive: boolean) => {
    updateHuddleVisibilityMutation.mutate({ huddleId, isReleased: isActive });
  };

  const handleSequenceUpdated = () => {
    queryClient.invalidateQueries(['sequence', sequenceId]);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Sequence link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-b-purple-600 rounded-full animate-spin animation-delay-1000 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading sequence details...</p>
        </div>
      </div>
    );
  }

  if (error || !sequence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sequence Not Found</h1>
          <p className="text-gray-600 mb-6">The sequence you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/sequences')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sequences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/sequences')}
                className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Sequences</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">Sequence Details</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white/80 hover:bg-white hover:shadow-sm transition-all"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>

              {canPublish && sequence.sequenceStatus === 'DRAFT' && (
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105">
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </button>
              )}

              {canPublish && sequence.sequenceStatus === 'PUBLISHED' && (
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all">
                  <Pause className="h-4 w-4 mr-2" />
                  Unpublish
                </button>
              )}

              {/* Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/80 transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Eye className="h-4 w-4 mr-3" />
                      Preview Full Sequence
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-3" />
                      Export Sequence
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4 mr-3" />
                      Advanced Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-purple-600 hover:bg-purple-50">
                      <Zap className="h-4 w-4 mr-3" />
                      Optimize with AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sequence Info */}
          <div className="lg:col-span-1">
            <SequenceInfoCard 
              sequence={sequence} 
              onEdit={() => setIsEditModalOpen(true)}
              canEdit={canEdit}
            />

            {/* Quick Stats Card */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Total Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sequence.analytics?.engagementMetrics?.totalViews || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Enrolled Users</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sequence.analytics?.totalUsers || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Completion Rate</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {Math.round((sequence.analytics?.completionRate || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI Insights
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Performance:</strong> This sequence is performing above average with high engagement rates.
                  </p>
                </div>
                
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Recommendation:</strong> Consider adding an interactive assessment to boost completion rates.
                  </p>
                </div>
              </div>
              
              <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all">
                View Full Analysis
              </button>
            </div>
          </div>

          {/* Right Column - Huddle List */}
          <div className="lg:col-span-2">
            <HuddleListCard 
              sequence={sequence} 
              onHuddleClick={handleHuddleClick}
              onToggleHuddle={handleToggleHuddle}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditSequenceModal
          sequence={sequence}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleSequenceUpdated}
        />
      )}

      {selectedHuddle && (
        <HuddleDetailModal
          huddle={selectedHuddle}
          sequence={sequence}
          isOpen={isHuddleModalOpen}
          onClose={() => {
            setIsHuddleModalOpen(false);
            setSelectedHuddle(null);
          }}
          canEdit={canEdit}
        />
      )}

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SequenceDetailsPage;