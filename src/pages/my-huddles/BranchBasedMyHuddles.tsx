// pages/my-huddles/BranchBasedMyHuddles.tsx
import React, { useState } from 'react';
import { Play, Clock, BookOpen, CheckCircle2, MapPin, Users, Filter } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { HuddleSequence, UserProgress, Huddle, UserRole, Discipline } from '../../types';
import { formatDate, formatDuration, getStatusColor } from '../../utils/helpers';
import { HuddlePlayerModal } from './HuddlePlayerModal';
import { createSelectOptionsWithAll } from '../../utils/selectUtils';

interface BranchBasedMyHuddlesProps {
  // Branch-based visibility for all user roles
}

export const BranchBasedMyHuddles: React.FC<BranchBasedMyHuddlesProps> = () => {
  const { currentUser, currentAssignment } = useApp();
  const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'ALL'>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  // Get sequences visible to user based on their role, discipline, and branch assignments
  const {
    data: visibilityData,
    loading: sequencesLoading,
    refetch: refetchSequences,
  } = useAsync(
    async () => {
      if (!currentUser || !currentAssignment) return { sequences: [], userProgress: [], branches: [] };
      
      // Get current active role and discipline for precise filtering
      const activeRole = currentAssignment.activeRole || currentAssignment.role;
      const userDiscipline = currentAssignment.discipline;
      
      console.log('🎯 MY HUDDLES RELOAD: Loading for user:', currentUser.userId, 'role:', activeRole, 'discipline:', userDiscipline);
      console.log('🎯 ROLE CONTEXT: activeRole =', activeRole, 'role =', currentAssignment.role, 'assignmentId =', currentAssignment.assignmentId);
      
      // Validate that we have the required data
      if (!activeRole) {
        console.error('🚨 MISSING ACTIVE ROLE: currentAssignment has no activeRole or role');
        console.error('🚨 ASSIGNMENT DATA:', currentAssignment);
        return { sequences: [], userProgress: [], branches: [] };
      }
      
      if (!userDiscipline) {
        console.error('🚨 MISSING DISCIPLINE: currentAssignment has no discipline');
        console.error('🚨 ASSIGNMENT DATA:', currentAssignment);
        return { sequences: [], userProgress: [], branches: [] };
      }
      
      // Handle different access patterns based on role
      let sequences, progress, branches;
      
      console.log('🔥 ROLE DECISION POINT: activeRole =', activeRole, 'typeof =', typeof activeRole);
      console.log('🔥 ROLE COMPARISON: activeRole === "EDUCATOR" =', activeRole === 'EDUCATOR');
      
      // ✅ CRITICAL FIX: Use explicit role-based logic with strict string comparison
      if (activeRole === 'EDUCATOR') {
        // EDUCATOR: Should see sequences matching their role-discipline combination, but ONLY from branches they created
        console.log('🎯 EDUCATOR PATH: Loading branch-filtered + role-discipline sequences for user:', currentUser.userId);
        console.log('🎯 EDUCATOR PARAMS: role =', activeRole, 'discipline =', userDiscipline);
        
        [sequences, progress, branches] = await Promise.all([
          apiClient.getSequencesForSpecificRole(activeRole, userDiscipline), // Get role-discipline matching sequences
          apiClient.getUserSequenceProgressOverview(currentUser.userId),
          apiClient.getBranchesCreatedByMe(), // Get branches created by this EDUCATOR
        ]);
        
        // ✅ ADDITIONAL EDUCATOR FILTERING: Only show sequences from branches the EDUCATOR created
        const createdBranchIds = new Set(branches.map(branch => branch.branchId));
        const originalSequenceCount = sequences.length;
        
        sequences = sequences.filter(sequence => {
          // Keep sequences from branches this EDUCATOR created
          const belongsToCreatedBranch = sequence.branchId && createdBranchIds.has(sequence.branchId);
          return belongsToCreatedBranch;
        });
        
        console.log('🎯 EDUCATOR BRANCH FILTERING: User', currentUser.userId, 'created', branches.length, 'branches');
        console.log('🎯 EDUCATOR BRANCH FILTERING: Filtered from', originalSequenceCount, 'to', sequences.length, 'sequences');
        console.log('🎯 EDUCATOR BRANCH FILTERING: Branch IDs:', Array.from(createdBranchIds));
        
        if (sequences.length === 0 && originalSequenceCount > 0) {
          console.warn('🔍 EDUCATOR: No sequences found in created branches - role-discipline sequences exist but not in EDUCATOR branches');
        }
        
      } else if (activeRole === 'DIRECTOR' || activeRole === 'CLINICAL_MANAGER' || activeRole === 'FIELD_CLINICIAN') {
        // SPECIFIC ROLE-BASED ACCESS: Only see sequences targeting their specific role + discipline
        console.log('🎯 ROLE-SPECIFIC PATH: Loading role-specific sequences for user:', currentUser.userId);
        console.log('🎯 ROLE-SPECIFIC DETAILS: role =', activeRole, 'discipline =', userDiscipline);
        
        // Validate required data
        if (!userDiscipline) {
          console.error('🚨 MISSING DISCIPLINE: User has no discipline assigned');
          return { sequences: [], userProgress: [], branches: [] };
        }
        
        const userBranchId = currentAssignment.branchId;
        if (!userBranchId) {
          console.error('🚨 MISSING BRANCH: User has no branch assigned for role:', activeRole);
          return { sequences: [], userProgress: [], branches: [] };
        }
        
        console.log('🔥 USING NEW API METHOD: getSequencesForSpecificRole');
        console.log('🔥 PARAMS: activeRole =', activeRole, 'discipline =', userDiscipline);
        console.log('🔥 PARAM TYPES: activeRole type =', typeof activeRole, 'discipline type =', typeof userDiscipline);
        console.log('🔥 PARAM VALUES: activeRole =', JSON.stringify(activeRole), 'discipline =', JSON.stringify(userDiscipline));
        
        [sequences, progress] = await Promise.all([
          apiClient.getSequencesForSpecificRole(activeRole, userDiscipline), // ✅ NEW ROBUST API
          apiClient.getUserSequenceProgressOverview(currentUser.userId),
        ]);
        
        console.log('🔥 ROLE-SPECIFIC RESULT: User', currentUser.userId, 'with role', activeRole, 'loaded', sequences.length, 'sequences');
        sequences.forEach((seq, index) => {
          console.log(`🔥 Role-Specific Sequence ${index + 1}:`, seq.title, 'targets roles:', seq.targetRoles, 'disciplines:', seq.targetDisciplines);
        });
        
        // For role-specific access, branches array contains only their assigned branch
        branches = currentAssignment.branchName ? [{
          branchId: userBranchId,
          name: currentAssignment.branchName,
          city: '', // Not needed for display
          state: '', // Not needed for display
        }] : [];
        
      } else {
        // FALLBACK: Unknown role
        console.error('🚨 UNKNOWN ROLE:', activeRole, 'type:', typeof activeRole);
        console.error('🚨 ASSIGNMENT:', currentAssignment);
        return { sequences: [], userProgress: [], branches: [] };
      }

      console.log('🎯 FINAL RESULT FOR ROLE SWITCH: User', currentUser.userId, 'as', activeRole, 'loaded', sequences.length, 'sequences,', branches.length, 'branches');
      console.log('🎯 ROLE-SPECIFIC CONTEXT: role =', activeRole, 'branchIds =', branches.map(b => b.branchId));
      
      return {
        sequences,
        userProgress: progress,
        branches,
      };
    },
    [currentUser?.userId, currentAssignment?.assignmentId, currentAssignment?.activeRole, currentAssignment?.role, currentAssignment?.discipline, currentAssignment?.branchId]
  );

  // Filter sequences based on current active role and filters
  // Note: Backend now handles precise role-discipline matching, so frontend filtering is simplified
  const filteredSequences = React.useMemo(() => {
    if (!visibilityData?.sequences || !currentAssignment) return [];

    return visibilityData.sequences.filter(sequence => {
      // Branch filter only (role-discipline matching is now handled by backend)
      if (branchFilter !== 'ALL' && sequence.branchId?.toString() !== branchFilter) {
        return false;
      }

      // Optional additional filters (mostly for debugging/admin purposes)
      if (roleFilter !== 'ALL' && !sequence.targetRoles?.includes(roleFilter)) {
        return false;
      }

      if (disciplineFilter !== 'ALL' && !sequence.targetDisciplines?.includes(disciplineFilter)) {
        return false;
      }

      return true;
    });
  }, [visibilityData?.sequences, currentAssignment, roleFilter, disciplineFilter, branchFilter]);

  const handleStartHuddle = async (huddle: Huddle) => {
    if (!currentUser) return;
    
    try {
      await apiClient.startHuddle(currentUser.userId, huddle.huddleId);
      setSelectedHuddle(huddle);
      setIsPlayerOpen(true);
      await refetchSequences();
    } catch (error) {
      console.error('Failed to start huddle:', error);
    }
  };

  const handleHuddleComplete = async () => {
    await refetchSequences();
    setIsPlayerOpen(false);
    setSelectedHuddle(null);
  };

  const getUserSequenceProgress = (sequenceId: number) => {
    return visibilityData?.userProgress?.find(p => p.sequenceId === sequenceId);
  };

  const getSequenceStatus = (sequence: HuddleSequence) => {
    const progress = getUserSequenceProgress(sequence.sequenceId);
    if (!progress) return 'not-started';
    return progress.sequenceStatus.toLowerCase().replace('_', '-');
  };

  const getSequenceCompletionPercentage = (sequence: HuddleSequence) => {
    const progress = getUserSequenceProgress(sequence.sequenceId);
    return progress?.completionPercentage || 0;
  };

  // Get unique filter options from current user's assignments
  const filterOptions = React.useMemo(() => {
    if (!currentAssignment) return { roles: [], disciplines: [] };

    // Only show current active role in filter options (for single-role filtering)
    const activeRole = currentAssignment.activeRole || currentAssignment.role;
    return {
      roles: activeRole ? [activeRole] : [],
      disciplines: currentAssignment.discipline ? [currentAssignment.discipline] : [],
    };
  }, [currentAssignment]);

  // Check if user's ACTIVE role is EDUCATOR to show branch names
  const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
  const isEducator = activeRole === 'EDUCATOR';

  if (!currentUser || !currentAssignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please ensure you're logged in and have an assignment.</p>
      </div>
    );
  }

  if (sequencesLoading) {
    const activeRole = currentAssignment?.activeRole || currentAssignment?.role;
    return <LoadingSpinner text={`Loading your huddles as ${activeRole}...`} className="py-12" />;
  }

  const sequences = filteredSequences || [];
  const userProgress = visibilityData?.userProgress || [];
  const branches = visibilityData?.branches || [];

  return (
    <>
      <PageHeader
        title={`My Huddles - ${activeRole}`}
        description={
          activeRole === 'EDUCATOR' 
            ? "Access your micro-learning content from branches you created"
            : `Access your micro-learning content as ${activeRole}${currentAssignment?.branchName ? ` in ${currentAssignment.branchName}` : ''}`
        }
        action={
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {activeRole === 'EDUCATOR' ? 'Creator-based access' : 'Assignment-based access'}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Role: {activeRole}
            </span>
          </div>
        }
      />

      {/* Filters - Only show if user has multiple options */}
      {(filterOptions.roles.length > 1 || filterOptions.disciplines.length > 1 || branches.length > 1) && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filter Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRoleFilter('ALL');
                setDisciplineFilter('ALL');
                setBranchFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filterOptions.roles.length > 1 && (
              <Select
                label="Filter by Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                options={createSelectOptionsWithAll(filterOptions.roles, 'All Roles')}
              />
            )}

            {filterOptions.disciplines.length > 1 && (
              <Select
                label="Filter by Discipline"
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value as Discipline | 'ALL')}
                options={createSelectOptionsWithAll(filterOptions.disciplines, 'All Disciplines')}
              />
            )}

            {branches.length > 1 && (
              <Select
                label="Filter by Branch"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Branches' },
                  ...branches.map(branch => ({ 
                    value: branch.branchId.toString(), 
                    label: `${branch.name} - ${branch.city}, ${branch.state}` 
                  }))
                ]}
              />
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Available Sequences</div>
              <div className="text-2xl font-bold text-gray-900">
                {sequences.length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.filter(p => p.sequenceStatus === 'COMPLETED').length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">In Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.filter(p => p.sequenceStatus === 'IN_PROGRESS').length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Branches</div>
              <div className="text-2xl font-bold text-gray-900">
                {branches.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sequences Grid */}
      {sequences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => {
            const status = getSequenceStatus(sequence);
            const completionPercentage = getSequenceCompletionPercentage(sequence);
            const progress = getUserSequenceProgress(sequence.sequenceId);

            return (
              <Card key={sequence.sequenceId} className="hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {sequence.title}
                    </h3>
                    <Badge className={getStatusColor(status)}>
                      {status === 'not-started' ? 'New' : 
                       status === 'in-progress' ? 'In Progress' :
                       status === 'completed' ? 'Completed' : status}
                    </Badge>
                  </div>
                  
                  {/* Branch Information - Show for EDUCATORs only */}
                  {isEducator && sequence.branchDisplayName && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{sequence.branchDisplayName}</span>
                    </div>
                  )}
                  
                  {sequence.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {sequence.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  {status !== 'not-started' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completionPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {sequence.totalCombinations} combinations
                    </span>
                    {sequence.estimatedDurationMinutes && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(sequence.estimatedDurationMinutes)}
                      </span>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {sequence.targetRoles?.slice(0, 2).map((role) => (
                      <Badge key={role} variant="info" size="sm">
                        {role}
                      </Badge>
                    ))}
                    {sequence.targetDisciplines?.slice(0, 2).map((discipline) => (
                      <Badge key={discipline} variant="success" size="sm">
                        {discipline}
                      </Badge>
                    ))}
                    {((sequence.targetRoles?.length || 0) + (sequence.targetDisciplines?.length || 0)) > 4 && (
                      <Badge variant="default" size="sm">
                        +{(sequence.targetRoles?.length || 0) + (sequence.targetDisciplines?.length || 0) - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {status === 'not-started' ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        // Navigate to dedicated learning page with huddle list
                        window.location.href = `/sequences/${sequence.sequenceId}/learn`;
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Navigate to learning page to continue where left off
                        window.location.href = `/sequences/${sequence.sequenceId}/learn`;
                      }}
                    >
                      Continue Learning
                    </Button>
                  )}

                  {/* Additional Info */}
                  {progress && (
                    <div className="text-xs text-gray-500 text-center">
                      Last accessed {formatDate(progress.lastAccessed)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Huddles Available</h3>
          <p className="text-gray-500 mb-4">
            {activeRole === 'EDUCATOR' 
              ? 'No published huddle sequences are available in branches you created yet.'
              : `No published huddle sequences are available for ${activeRole} role with ${currentAssignment?.discipline || 'your'} discipline${currentAssignment?.branchName ? ` in ${currentAssignment.branchName}` : ''}.`
            }
          </p>
          <p className="text-sm text-gray-400">
            {activeRole === 'EDUCATOR' 
              ? 'Create branches and sequences to see content here.'
              : 'Contact your educator or administrator to get sequences assigned to you.'
            }
          </p>
          {currentAssignment?.roles && currentAssignment.roles.length > 1 && (
            <p className="text-xs text-blue-600 mt-2">
              💡 You have multiple roles ({currentAssignment.roles.join(', ')}). Try switching roles using the role selector.
            </p>
          )}
        </Card>
      )}

      {/* Huddle Player Modal */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedHuddle(null);
        }}
        title={selectedHuddle?.title || ''}
        size="xl"
      >
        {selectedHuddle && currentUser && (
          <HuddlePlayerModal
            huddle={selectedHuddle}
            userId={currentUser.userId}
            onComplete={handleHuddleComplete}
            onClose={() => {
              setIsPlayerOpen(false);
              setSelectedHuddle(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};