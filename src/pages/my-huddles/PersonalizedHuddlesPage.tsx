import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Target, 
  Calendar,
  Filter,
  Search,
  BarChart3,
  Award,
  User,
  FileText
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../contexts/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useApi } from '../../hooks/useApi';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatDuration } from '../../utils/helpers';

interface PersonalHuddle {
  huddleId: number;
  sequenceId: number;
  title: string;
  description: string;
  sequenceTitle: string;
  estimatedDuration: number;
  isRequired: boolean;
  dueDate?: string;
  assignedDate: string;
  completedAt?: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  hasAssessment: boolean;
  assessmentCompleted: boolean;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  targetRoles: string[];
  targetDisciplines: string[];
}

interface HuddleStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  totalTimeSpent: number;
  completionRate: number;
}

export const PersonalizedHuddlesPage: React.FC = () => {
  const { currentUser, currentAssignment } = useApp();
  const permissions = usePermissions();
  const api = useApi();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'completed'>('assigned');

  // Fetch personalized huddles
  const {
    data: huddles,
    loading,
    refetch,
  } = useAsync(
    async (): Promise<PersonalHuddle[]> => {
      if (!currentUser || !currentAssignment) return [];
      
      try {
        // Get user's sequence progress
        const sequenceProgress = await api.getUserSequenceProgressOverview(currentUser.userId);
        
        // Get progress for each sequence and its huddles
        const huddlesWithProgress = await Promise.all(
          sequenceProgress.map(async (progress) => {
            const sequence = await api.getSequenceById(progress.sequenceId);
            const huddles = await api.getHuddlesBySequence(progress.sequenceId);
            
            // Create PersonalHuddle objects for each huddle in the sequence
            return Promise.all(
              huddles.map(async (huddle) => {
            
                const personalHuddle: PersonalHuddle = {
                  huddleId: huddle.huddleId,
                  sequenceId: huddle.sequenceId,
                  title: huddle.title,
                  description: huddle.contentJson || huddle.title, // Use contentJson as description fallback
                  sequenceTitle: sequence.title,
                  estimatedDuration: huddle.durationMinutes || sequence.estimatedDurationMinutes || 15,
                  isRequired: true, // Default to required since it's assigned
                  assignedDate: progress.startedAt || progress.lastAccessed,
                  dueDate: undefined, // SequenceProgress doesn't have dueDate
                  progress: progress.completionPercentage || 0,
                  completedAt: progress.completedAt,
                  status: getHuddleStatus({ dueDate: undefined }, { completedAt: progress.completedAt, progressPercentage: progress.completionPercentage }),
                  hasAssessment: huddle.huddleType === 'ASSESSMENT',
                  assessmentCompleted: !!progress.averageScore, // If there's a score, assessment was completed
                  difficulty: sequence.difficulty || 'BEGINNER',
                  targetRoles: sequence.targetRoles || [],
                  targetDisciplines: sequence.targetDisciplines || [],
                };
                
                return personalHuddle;
              })
            );
          })
        );
        
        // Flatten the array of arrays
        const flattenedHuddles = huddlesWithProgress.flat();

        return flattenedHuddles;
      } catch (error) {
        console.error('Failed to load personalized huddles:', error);
        return [];
      }
    },
    [currentUser?.userId, currentAssignment?.assignmentId]
  );

  // Calculate statistics
  const stats: HuddleStats = React.useMemo(() => {
    if (!huddles) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overdue: 0,
        totalTimeSpent: 0,
        completionRate: 0,
      };
    }
    
    const total = huddles.length;
    const completed = huddles.filter(h => h.status === 'COMPLETED').length;
    const inProgress = huddles.filter(h => h.status === 'IN_PROGRESS').length;
    const notStarted = huddles.filter(h => h.status === 'NOT_STARTED').length;
    const overdue = huddles.filter(h => h.status === 'OVERDUE').length;
    
    const totalTimeSpent = huddles
      .filter(h => h.completedAt)
      .reduce((sum, h) => sum + h.estimatedDuration, 0);
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      totalTimeSpent,
      completionRate,
    };
  }, [huddles]);

  // Filter huddles
  const filteredHuddles = (huddles || []).filter(huddle => {
    const matchesSearch = !searchTerm || 
      huddle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      huddle.sequenceTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || huddle.status === statusFilter;
    const matchesDifficulty = !difficultyFilter || huddle.difficulty === difficultyFilter;
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'assigned' && huddle.status !== 'COMPLETED') ||
      (viewMode === 'completed' && huddle.status === 'COMPLETED');

    return matchesSearch && matchesStatus && matchesDifficulty && matchesView;
  });

  const getHuddleStatus = (assignment: { dueDate?: string }, progress: { completedAt?: string; progressPercentage: number }): PersonalHuddle['status'] => {
    if (progress.completedAt) return 'COMPLETED';
    if (progress.progressPercentage > 0) return 'IN_PROGRESS';
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return 'OVERDUE';
    return 'NOT_STARTED';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS': return <Play className="h-4 w-4 text-blue-600" />;
      case 'OVERDUE': return <Clock className="h-4 w-4 text-red-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'default';
      case 'OVERDUE': return 'error';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartHuddle = (huddleId: number) => {
    // Navigate to huddle player
    window.location.href = `/huddles/${huddleId}/play`;
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'OVERDUE', label: 'Overdue' },
  ];

  const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const viewModeOptions = [
    { value: 'assigned', label: 'My Assignments' },
    { value: 'completed', label: 'Completed' },
    { value: 'all', label: 'All Huddles' },
  ];

  const renderHuddleCard = (huddle: PersonalHuddle) => (
    <Card key={huddle.huddleId} className="group hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(huddle.status)}
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {huddle.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              From: <span className="font-medium">{huddle.sequenceTitle}</span>
            </p>
            <p className="text-sm text-gray-500">
              {huddle.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusColor(huddle.status) as any}>
              {huddle.status.replace('_', ' ')}
            </Badge>
            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(huddle.difficulty)}`}>
              {huddle.difficulty}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {huddle.progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{huddle.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${huddle.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Info Row */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(huddle.estimatedDuration)}</span>
            </div>
            {huddle.isRequired && (
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600">Required</span>
              </div>
            )}
            {huddle.hasAssessment && (
              <div className="flex items-center space-x-1">
                <Award className={`h-4 w-4 ${huddle.assessmentCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={huddle.assessmentCompleted ? 'text-green-600' : 'text-gray-400'}>
                  Assessment
                </span>
              </div>
            )}
          </div>
          
          {huddle.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Due {formatDate(huddle.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Assigned to:</div>
          <div className="flex flex-wrap gap-1">
            {huddle.targetRoles.slice(0, 2).map(role => (
              <Badge key={role} variant="outline" className="text-xs">
                {role.replace('_', ' ')}
              </Badge>
            ))}
            {huddle.targetDisciplines.slice(0, 2).map(discipline => (
              <Badge key={discipline} variant="outline" className="text-xs">
                {discipline}
              </Badge>
            ))}
            {(huddle.targetRoles.length + huddle.targetDisciplines.length) > 4 && (
              <span className="text-xs text-gray-500">
                +{(huddle.targetRoles.length + huddle.targetDisciplines.length) - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {huddle.completedAt ? (
              `Completed ${formatDate(huddle.completedAt)}`
            ) : (
              `Assigned ${formatDate(huddle.assignedDate)}`
            )}
          </div>
          
          <Button
            size="sm"
            onClick={() => handleStartHuddle(huddle.huddleId)}
            disabled={huddle.status === 'COMPLETED'}
          >
            {huddle.status === 'COMPLETED' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : huddle.status === 'IN_PROGRESS' ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Continue
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="My Huddles"
        description="Personalized learning path based on your role and discipline"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Assigned</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Play className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.overdue}</div>
                <div className="text-sm text-gray-500">Overdue</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.completionRate)}%
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search huddles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                options={viewModeOptions}
                className="w-40"
              />
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="w-40"
              />
              
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                options={difficultyOptions}
                className="w-40"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Huddles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredHuddles.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!huddles || huddles.length === 0 ? 'No huddles assigned yet' : 'No huddles match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {!huddles || huddles.length === 0 
                ? `Check back soon! Huddles will appear here when they're assigned to your role (${currentAssignment?.role}) and discipline (${currentAssignment?.discipline}).`
                : 'Try adjusting your search terms or filters.'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHuddles.map(renderHuddleCard)}
        </div>
      )}
    </>
  );
};