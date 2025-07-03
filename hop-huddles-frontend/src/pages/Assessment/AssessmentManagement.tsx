// pages/Assessment/AssessmentManagement.tsx - Assessment management for educators
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MoreHorizontal,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  Copy,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import toast from 'react-hot-toast';

interface Assessment {
  assessmentId: number;
  title: string;
  description: string;
  huddleId: number;
  huddleTitle: string;
  sequenceId: number;
  sequenceTitle: string;
  questionCount: number;
  timeLimit: number; // minutes
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  totalAssigned: number;
  totalCompleted: number;
  averageScore: number;
  assessmentType: 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED';
  autoAssign: boolean;
  dueDate?: string;
}

const AssessmentManagement: React.FC = () => {
  // const { user, currentAgency } = useAuth();
  const { capabilities } = useActiveRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'QUIZ' | 'PRACTICAL' | 'SCENARIO' | 'MIXED'>('ALL');
  const [selectedAssessments, setSelectedAssessments] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data - in production this would come from API
  const assessments: Assessment[] = [
    {
      assessmentId: 1,
      title: 'Pain Management Fundamentals Quiz',
      description: 'Assessment covering basic pain assessment and management principles',
      huddleId: 101,
      huddleTitle: 'Pain Assessment Techniques',
      sequenceId: 1,
      sequenceTitle: 'Pain Management Basics',
      questionCount: 15,
      timeLimit: 20,
      passingScore: 80,
      maxAttempts: 3,
      isActive: true,
      createdAt: '2024-01-05T10:00:00Z',
      createdBy: 'Dr. Sarah Johnson',
      totalAssigned: 45,
      totalCompleted: 38,
      averageScore: 87,
      assessmentType: 'QUIZ',
      autoAssign: true,
      dueDate: '2024-01-20'
    },
    {
      assessmentId: 2,
      title: 'Wound Care Practical Assessment',
      description: 'Hands-on assessment of wound cleaning and dressing techniques',
      huddleId: 102,
      huddleTitle: 'Advanced Wound Care',
      sequenceId: 2,
      sequenceTitle: 'Wound Care Certification',
      questionCount: 8,
      timeLimit: 45,
      passingScore: 85,
      maxAttempts: 2,
      isActive: true,
      createdAt: '2024-01-03T14:30:00Z',
      createdBy: 'Nurse Manager Lisa Chen',
      totalAssigned: 28,
      totalCompleted: 22,
      averageScore: 91,
      assessmentType: 'PRACTICAL',
      autoAssign: true
    },
    {
      assessmentId: 3,
      title: 'HIPAA Compliance Scenarios',
      description: 'Scenario-based assessment on privacy and security compliance',
      huddleId: 103,
      huddleTitle: 'Privacy Compliance Update',
      sequenceId: 3,
      sequenceTitle: 'HIPAA Compliance Training',
      questionCount: 12,
      timeLimit: 30,
      passingScore: 90,
      maxAttempts: 2,
      isActive: false,
      createdAt: '2024-01-01T09:15:00Z',
      createdBy: 'Compliance Officer Mike Davis',
      totalAssigned: 67,
      totalCompleted: 45,
      averageScore: 82,
      assessmentType: 'SCENARIO',
      autoAssign: false,
      dueDate: '2024-01-15'
    },
    {
      assessmentId: 4,
      title: 'Medication Safety Mixed Assessment',
      description: 'Comprehensive assessment combining multiple question types',
      huddleId: 104,
      huddleTitle: 'Safe Medication Practices',
      sequenceId: 4,
      sequenceTitle: 'Medication Safety Protocol',
      questionCount: 20,
      timeLimit: 40,
      passingScore: 85,
      maxAttempts: 3,
      isActive: true,
      createdAt: '2023-12-28T16:45:00Z',
      createdBy: 'Pharmacist Dr. James Wilson',
      totalAssigned: 52,
      totalCompleted: 49,
      averageScore: 89,
      assessmentType: 'MIXED',
      autoAssign: true
    }
  ];

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.huddleTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'ACTIVE' && assessment.isActive) ||
                         (statusFilter === 'INACTIVE' && !assessment.isActive);
    const matchesType = typeFilter === 'ALL' || assessment.assessmentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAssessment = (assessmentId: number) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssessments.length === filteredAssessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(filteredAssessments.map(a => a.assessmentId));
    }
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'activate':
        toast.success(`Activated ${selectedAssessments.length} assessments`);
        break;
      case 'deactivate':
        toast.success(`Deactivated ${selectedAssessments.length} assessments`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedAssessments.length} assessments?`)) {
          toast.success(`Deleted ${selectedAssessments.length} assessments`);
        }
        break;
      case 'export':
        toast.success('Exporting assessment data...');
        break;
    }
    setSelectedAssessments([]);
    setShowBulkActions(false);
  };

  const handleToggleStatus = (assessmentId: number) => {
    const assessment = assessments.find(a => a.assessmentId === assessmentId);
    if (assessment) {
      toast.success(`Assessment ${assessment.isActive ? 'deactivated' : 'activated'}`);
    }
  };

  const handleDeleteAssessment = (assessmentId: number) => {
    const assessment = assessments.find(a => a.assessmentId === assessmentId);
    if (assessment && window.confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
      toast.success('Assessment deleted successfully');
    }
  };

  const handleDuplicateAssessment = (assessmentId: number) => {
    const assessment = assessments.find(a => a.assessmentId === assessmentId);
    if (assessment) {
      toast.success(`Created copy of "${assessment.title}"`);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      QUIZ: 'bg-blue-100 text-blue-800',
      PRACTICAL: 'bg-green-100 text-green-800',
      SCENARIO: 'bg-purple-100 text-purple-800',
      MIXED: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCompletionRate = (completed: number, assigned: number) => {
    return assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
  };

  if (!capabilities.canCreateAssessments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage assessments linked to your huddle content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/assessments/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="QUIZ">Quiz</option>
            <option value="PRACTICAL">Practical</option>
            <option value="SCENARIO">Scenario</option>
            <option value="MIXED">Mixed</option>
          </select>

          {/* Bulk Actions */}
          <div className="relative">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedAssessments.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bulk Actions ({selectedAssessments.length})
            </button>
            {showBulkActions && selectedAssessments.length > 0 && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export Data
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.filter(a => a.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.reduce((sum, a) => sum + a.totalAssigned, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Assessments ({filteredAssessments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>

        {filteredAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.assessmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAssessments.includes(assessment.assessmentId)}
                          onChange={() => handleSelectAssessment(assessment.assessmentId)}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assessment.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            From: {assessment.huddleTitle}
                          </div>
                          <div className="text-xs text-gray-400">
                            {assessment.questionCount} questions • {assessment.timeLimit}min
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(assessment.assessmentType)}`}>
                        {assessment.assessmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getCompletionRate(assessment.totalCompleted, assessment.totalAssigned)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {assessment.totalCompleted}/{assessment.totalAssigned}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assessment.averageScore}% avg</div>
                      <div className="text-xs text-gray-500">
                        Pass: {assessment.passingScore}% • {assessment.maxAttempts} attempts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assessment.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assessment.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {assessment.autoAssign && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Auto-assign
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/assessments/${assessment.assessmentId}/results`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Results"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/assessments/${assessment.assessmentId}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Assessment"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicateAssessment(assessment.assessmentId)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Duplicate Assessment"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(assessment.assessmentId)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Assessment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first assessment.'}
            </p>
            <Link
              to="/assessments/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentManagement;