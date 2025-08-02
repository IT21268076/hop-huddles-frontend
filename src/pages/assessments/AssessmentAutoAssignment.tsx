import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Eye, 
  FileText, 
  Target,
  Calendar,
  PlayCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../contexts/AppContext';
import { useApi } from '../../hooks/useApi';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatDuration } from '../../utils/helpers';

interface AssessmentAssignment {
  assignmentId: number;
  assessmentId: number;
  huddleId: number;
  userId: number;
  title: string;
  description: string;
  huddleTitle: string;
  sequenceTitle: string;
  questionsCount: number;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  assignedDate: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'OVERDUE';
  attempts: AssessmentAttempt[];
  isRequired: boolean;
  triggerType: 'POST_HUDDLE' | 'SCHEDULED' | 'MANUAL';
  huddleCompletedAt?: string;
}

interface AssessmentAttempt {
  attemptId: number;
  startedAt: string;
  completedAt?: string;
  score?: number;
  passed: boolean;
  answers: any;
  timeSpent: number;
}

interface AssessmentWorkflowStats {
  totalAssignments: number;
  pending: number;
  inProgress: number;
  passed: number;
  failed: number;
  overdue: number;
  averageScore: number;
  totalTimeSpent: number;
}

export const AssessmentAutoAssignment: React.FC = () => {
  const { currentUser } = useApp();
  const api = useApi();
  
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Fetch user's assessment assignments
  const {
    data: assignments,
    loading,
    refetch,
  } = useAsync(
    async (): Promise<AssessmentAssignment[]> => {
      if (!currentUser) return [];
      
      try {
        // Get all assessment assignments for the current user
        const assessmentAssignments = await api.getUserAssessmentAttempts(currentUser.userId);
        
        // Enrich with additional data
        const enrichedAssignments = await Promise.all(
          assessmentAssignments.map(async (assignment) => {
            const [assessment, huddle, sequence, userAttempts] = await Promise.all([
              api.getAssessmentById(assignment.assessmentId),
              assignment.huddleId ? api.getHuddleById(assignment.huddleId) : Promise.resolve(null),
              assignment.sequenceId ? api.getSequenceById(assignment.sequenceId) : Promise.resolve(null),
              api.getUserAssessmentAttempts(currentUser.userId, assignment.assessmentId)
            ]);

            // Convert UserAssessmentAttempt[] to AssessmentAttempt[]
            const attempts: AssessmentAttempt[] = userAttempts.map(attempt => ({
              attemptId: attempt.attemptId,
              startedAt: attempt.startedAt,
              completedAt: attempt.completedAt,
              score: attempt.score,
              passed: attempt.passed || false,
              answers: attempt.answers,
              timeSpent: attempt.timeSpent || 0,
            }));

            const assessmentData: AssessmentAssignment = {
              assignmentId: assignment.attemptId || 0,
              assessmentId: assignment.assessmentId,
              huddleId: assignment.huddleId || 0,
              userId: currentUser.userId,
              title: assessment.title,
              description: assessment.description || '',
              huddleTitle: huddle?.title || 'Unknown Huddle',
              sequenceTitle: sequence?.title || 'Unknown Sequence',
              questionsCount: assessment.questions?.length || 0,
              passingScore: assessment.passingScore,
              maxAttempts: assessment.maxAttempts,
              timeLimit: assessment.timeLimit,
              assignedDate: assignment.startedAt,
              isRequired: true,
              triggerType: 'POST_HUDDLE',
              status: getAssessmentStatus({ dueDate: undefined, maxAttempts: assessment.maxAttempts }, attempts),
              attempts: attempts,
            };
            
            return assessmentData;
          })
        );

        return enrichedAssignments;
      } catch (error) {
        console.error('Failed to load assessment assignments:', error);
        return [];
      }
    },
    [currentUser?.userId]
  );

  // Calculate statistics
  const stats: AssessmentWorkflowStats = React.useMemo(() => {
    if (!assignments) {
      return {
        totalAssignments: 0,
        pending: 0,
        inProgress: 0,
        passed: 0,
        failed: 0,
        overdue: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      };
    }
    
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'PENDING').length;
    const inProgress = assignments.filter(a => a.status === 'IN_PROGRESS').length;
    const passed = assignments.filter(a => a.status === 'PASSED').length;
    const failed = assignments.filter(a => a.status === 'FAILED').length;
    const overdue = assignments.filter(a => a.status === 'OVERDUE').length;
    
    const totalScore = assignments
      .filter(a => a.attempts.length > 0)
      .reduce((sum, a) => {
        const bestScore = Math.max(...a.attempts.map(att => att.score || 0));
        return sum + bestScore;
      }, 0);
    
    const averageScore = assignments.filter(a => a.attempts.length > 0).length > 0 
      ? totalScore / assignments.filter(a => a.attempts.length > 0).length 
      : 0;
    
    const totalTimeSpent = assignments.reduce((sum, a) => 
      sum + a.attempts.reduce((attemptSum, att) => attemptSum + att.timeSpent, 0), 0
    );

    return {
      totalAssignments: total,
      pending,
      inProgress,
      passed,
      failed,
      overdue,
      averageScore,
      totalTimeSpent,
    };
  }, [assignments]);

  const getAssessmentStatus = (assignment: { dueDate?: string; maxAttempts: number }, attempts: AssessmentAttempt[]): AssessmentAssignment['status'] => {
    if (attempts.length === 0) {
      if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
        return 'OVERDUE';
      }
      return 'PENDING';
    }

    const latestAttempt = attempts[attempts.length - 1];
    if (!latestAttempt.completedAt) {
      return 'IN_PROGRESS';
    }

    if (latestAttempt.passed) {
      return 'PASSED';
    }

    if (attempts.length >= assignment.maxAttempts) {
      return 'FAILED';
    }

    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return 'OVERDUE';
    }

    return 'PENDING';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'IN_PROGRESS': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'OVERDUE': return <Clock className="h-4 w-4 text-red-600" />;
      default: return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'success';
      case 'FAILED': return 'error';
      case 'IN_PROGRESS': return 'default';
      case 'OVERDUE': return 'error';
      default: return 'secondary';
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'POST_HUDDLE': return 'Auto-assigned after huddle completion';
      case 'SCHEDULED': return 'Scheduled assignment';
      case 'MANUAL': return 'Manually assigned';
      default: return 'Unknown';
    }
  };

  const getTriggerTypeColor = (type: string) => {
    switch (type) {
      case 'POST_HUDDLE': return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED': return 'bg-purple-100 text-purple-800';
      case 'MANUAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartAssessment = async (assignmentId: number) => {
    try {
      const attempt = await api.startAssessmentAttempt(assignmentId);
      window.location.href = `/assessments/${assignmentId}/take/${attempt.attemptId}`;
    } catch (error) {
      console.error('Failed to start assessment:', error);
    }
  };

  const handleRetakeAssessment = async (assignmentId: number) => {
    if (window.confirm('Are you sure you want to retake this assessment? You will need to complete the associated huddle again first.')) {
      try {
        // Redirect to huddle first
        const assignment = assignments && assignments.find(a => a.assignmentId === assignmentId);
        if (assignment) {
          window.location.href = `/huddles/${assignment.huddleId}/play?retake=true`;
        }
      } catch (error) {
        console.error('Failed to initiate retake:', error);
      }
    }
  };

  const handleViewResults = (assignmentId: number) => {
    window.location.href = `/assessments/${assignmentId}/results`;
  };

  const filteredAssignments = (assignments || []).filter(assignment => {
    const matchesStatus = !filterStatus || assignment.status === filterStatus;
    const matchesType = !filterType || assignment.triggerType === filterType;
    return matchesStatus && matchesType;
  });

  const renderAssignmentCard = (assignment: AssessmentAssignment) => {
    const latestAttempt = assignment.attempts[assignment.attempts.length - 1];
    const canRetake = assignment.status === 'FAILED' && assignment.attempts.length < assignment.maxAttempts;
    const needsHuddleReview = assignment.triggerType === 'POST_HUDDLE' && assignment.status !== 'PASSED';

    return (
      <Card key={assignment.assignmentId} className="group hover:shadow-lg transition-all duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(assignment.status)}
                <h3 className="font-semibold text-gray-900">
                  {assignment.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                From: <span className="font-medium">{assignment.huddleTitle}</span>
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Sequence: {assignment.sequenceTitle}
              </p>
              <p className="text-sm text-gray-500">
                {assignment.description}
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={getStatusColor(assignment.status) as any}>
                {assignment.status.replace('_', ' ')}
              </Badge>
              <span className={`px-2 py-1 rounded-full text-xs ${getTriggerTypeColor(assignment.triggerType)}`}>
                {assignment.triggerType === 'POST_HUDDLE' ? 'Auto' : 
                 assignment.triggerType === 'SCHEDULED' ? 'Scheduled' : 'Manual'}
              </span>
            </div>
          </div>

          {/* Assessment Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{assignment.questionsCount} Questions</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Target className="h-4 w-4" />
              <span>{assignment.passingScore}% to Pass</span>
            </div>
            {assignment.timeLimit && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(assignment.timeLimit)} Limit</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-600">
              <RotateCcw className="h-4 w-4" />
              <span>{assignment.attempts.length}/{assignment.maxAttempts} Attempts</span>
            </div>
          </div>

          {/* Trigger Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Assignment Trigger:</div>
            <div className="text-sm text-gray-700">
              {getTriggerTypeLabel(assignment.triggerType)}
            </div>
            {assignment.huddleCompletedAt && (
              <div className="text-xs text-gray-500 mt-1">
                Triggered after completing huddle on {formatDate(assignment.huddleCompletedAt)}
              </div>
            )}
          </div>

          {/* Latest Attempt Results */}
          {latestAttempt && (
            <div className="mb-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {latestAttempt.completedAt ? 'Latest Result' : 'In Progress'}
                </span>
                {latestAttempt.score !== undefined && (
                  <span className={`text-sm font-bold ${
                    latestAttempt.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {latestAttempt.score}%
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                {latestAttempt.completedAt ? (
                  <>
                    <div>Completed: {formatDate(latestAttempt.completedAt)}</div>
                    <div>Time spent: {formatDuration(latestAttempt.timeSpent)}</div>
                  </>
                ) : (
                  <div>Started: {formatDate(latestAttempt.startedAt)}</div>
                )}
              </div>
            </div>
          )}

          {/* Due Date Warning */}
          {assignment.dueDate && assignment.status !== 'PASSED' && (
            <div className={`mb-4 p-3 rounded-lg ${
              assignment.status === 'OVERDUE' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Calendar className={`h-4 w-4 ${
                  assignment.status === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <span className={`text-sm ${
                  assignment.status === 'OVERDUE' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {assignment.status === 'OVERDUE' ? 'Overdue:' : 'Due:'} {formatDate(assignment.dueDate)}
                </span>
              </div>
            </div>
          )}

          {/* Retake Warning */}
          {needsHuddleReview && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <div className="font-medium mb-1">Review Required</div>
                  <div>You must review the huddle content again before retaking this assessment.</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Assigned {formatDate(assignment.assignedDate)}
            </div>
            
            <div className="flex space-x-2">
              {assignment.status === 'PENDING' && (
                <Button
                  size="sm"
                  onClick={() => handleStartAssessment(assignment.assignmentId)}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              )}

              {assignment.status === 'IN_PROGRESS' && (
                <Button
                  size="sm"
                  onClick={() => handleStartAssessment(assignment.assignmentId)}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              )}

              {(assignment.status === 'PASSED' || assignment.status === 'FAILED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewResults(assignment.assignmentId)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              )}

              {canRetake && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetakeAssessment(assignment.assignmentId)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageHeader
        title="My Assessments"
        description="Auto-assigned assessments based on your huddle completions"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <PlayCircle className="h-6 w-6 text-blue-600" />
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
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.passed}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.averageScore)}%
                </div>
                <div className="text-sm text-gray-500">Avg Score</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="POST_HUDDLE">Auto-assigned</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assessments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!assignments || assignments.length === 0 ? 'No assessments assigned yet' : 'No assessments match your filters'}
            </h3>
            <p className="text-gray-500">
              {!assignments || assignments.length === 0 
                ? 'Complete huddles to automatically receive assessments, or wait for scheduled assignments.'
                : 'Try adjusting your filters to see more assessments.'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssignments.map(renderAssignmentCard)}
        </div>
      )}
    </>
  );
};