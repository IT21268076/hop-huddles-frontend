// utils/sequenceUtils.ts - Utility functions for sequence management
import type { HuddleSequence, Huddle, SequenceTarget, Discipline, UserRole, User } from '../types';

// Sequence status utilities
export const getSequenceStatusInfo = (status: string) => {
  const statusMap = {
    'DRAFT': {
      label: 'Draft',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      description: 'Sequence is being created and edited'
    },
    'GENERATING': {
      label: 'Generating',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      description: 'AI is generating content for this sequence'
    },
    'REVIEW': {
      label: 'In Review',
      color: 'from-purple-500 to-blue-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      description: 'Sequence is ready for review before publishing'
    },
    'PUBLISHED': {
      label: 'Published',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      description: 'Sequence is live and available to users'
    },
    'SCHEDULED': {
      label: 'Scheduled',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
      description: 'Sequence is scheduled for future release'
    },
    'ARCHIVED': {
      label: 'Archived',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      description: 'Sequence is no longer active'
    }
  };

  return statusMap[status as keyof typeof statusMap] || statusMap.DRAFT;
};

// Huddle type utilities
export const getHuddleTypeInfo = (type: string) => {
  const typeMap = {
    'INTRO': {
      label: 'Introduction',
      color: 'from-green-500 to-emerald-600',
      icon: '🌟',
      description: 'Opening huddle that introduces the topic'
    },
    'STANDARD': {
      label: 'Standard',
      color: 'from-blue-500 to-indigo-600',
      icon: '📚',
      description: 'Regular educational content'
    },
    'ASSESSMENT': {
      label: 'Assessment',
      color: 'from-orange-500 to-red-600',
      icon: '🎯',
      description: 'Knowledge check or evaluation'
    },
    'SUMMARY': {
      label: 'Summary',
      color: 'from-purple-500 to-blue-600',
      icon: '📋',
      description: 'Recap and key takeaways'
    },
    'INTERACTIVE': {
      label: 'Interactive',
      color: 'from-pink-500 to-purple-600',
      icon: '⚡',
      description: 'Hands-on learning experience'
    }
  };

  return typeMap[type as keyof typeof typeMap] || typeMap.STANDARD;
};

// Discipline and role utilities
export const getDisciplineInfo = (discipline: Discipline) => {
  const disciplineMap: Record<Discipline, { label: string; category: string; color: string }> = {
    'RN': { label: 'Registered Nurse', category: 'Nursing', color: 'bg-blue-100 text-blue-800' },
    'LPN': { label: 'Licensed Practical Nurse', category: 'Nursing', color: 'bg-blue-100 text-blue-800' },
    'PT': { label: 'Physical Therapist', category: 'Therapy', color: 'bg-green-100 text-green-800' },
    'OT': { label: 'Occupational Therapist', category: 'Therapy', color: 'bg-green-100 text-green-800' },
    'SLP': { label: 'Speech-Language Pathologist', category: 'Therapy', color: 'bg-green-100 text-green-800' },
    'HHA': { label: 'Home Health Aide', category: 'Support', color: 'bg-purple-100 text-purple-800' },
    'MSW': { label: 'Medical Social Worker', category: 'Social Services', color: 'bg-orange-100 text-orange-800' },
    'OTHER': { label: 'Other', category: 'Other', color: 'bg-gray-100 text-gray-800' }
  };

  return disciplineMap[discipline] || disciplineMap.OTHER;
};

export const getRoleInfo = (role: UserRole) => {
  const roleMap: Record<UserRole, { label: string; description: string; color: string; level: number }> = {
    'EDUCATOR': { 
      label: 'Educator', 
      description: 'Full system access including huddle creation',
      color: 'bg-purple-100 text-purple-800',
      level: 5
    },
    'ADMIN': { 
      label: 'Administrator', 
      description: 'Full system access except huddle creation',
      color: 'bg-indigo-100 text-indigo-800',
      level: 4
    },
    'DIRECTOR': { 
      label: 'Director', 
      description: 'Branch leader with management capabilities',
      color: 'bg-blue-100 text-blue-800',
      level: 3
    },
    'CLINICAL_MANAGER': { 
      label: 'Clinical Manager', 
      description: 'Team leader with management capabilities',
      color: 'bg-green-100 text-green-800',
      level: 2
    },
    'FIELD_CLINICIAN': { 
      label: 'Field Clinician', 
      description: 'Clinical staff providing direct patient care',
      color: 'bg-yellow-100 text-yellow-800',
      level: 1
    },
    'SUPERADMIN': { 
      label: 'Super Administrator', 
      description: 'System-wide administrative access',
      color: 'bg-red-100 text-red-800',
      level: 6
    }
  };

  return roleMap[role];
};

// Sequence targeting utilities
export const getSequenceTargets = (sequence: HuddleSequence) => {
  const disciplines = sequence.targets
    ?.filter(target => target.targetType === 'DISCIPLINE')
    .map(target => target.targetValue as Discipline) || [];
    
  const roles = sequence.targets
    ?.filter(target => target.targetType === 'ROLE')
    .map(target => target.targetValue as UserRole) || [];

  return { disciplines, roles };
};

export const isUserTargetedForSequence = (user: User, sequence: HuddleSequence): boolean => {
  const { disciplines, roles } = getSequenceTargets(sequence);
  
  // Check if user has any of the target disciplines
  const userDisciplines = user.assignments.flatMap(a => a.disciplines || [a.discipline].filter(Boolean));
  const hasDisciplineMatch = disciplines.length === 0 || disciplines.some(d => userDisciplines.includes(d));
  
  // Check if user has any of the target roles
  const userRoles = user.assignments.flatMap(a => a.roles || [a.role]);
  const hasRoleMatch = roles.length === 0 || roles.some(r => userRoles.includes(r));
  
  return hasDisciplineMatch && hasRoleMatch;
};

// Engagement level utilities
export const getEngagementLevel = (rate: number) => {
  if (rate >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (rate >= 75) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (rate >= 60) return { level: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  return { level: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-100' };
};

// Completion rate utilities
export const getCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Duration formatting utilities
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Sequence analytics utilities
export const calculateSequenceMetrics = (sequence: HuddleSequence) => {
  const totalHuddles = sequence.huddles?.length || 0;
  const completedHuddles = sequence.huddles?.filter(h => h.isComplete).length || 0;
  const releasedHuddles = sequence.huddles?.filter(h => h.visibility?.isReleased).length || 0;
  
  const totalViews = sequence.huddles?.reduce((sum, h) => sum + (h.analytics?.totalViews || 0), 0) || 0;
  const totalCompletions = sequence.huddles?.reduce((sum, h) => sum + (h.analytics?.totalCompletions || 0), 0) || 0;
  const averageEngagement = sequence.huddles?.length > 0 
    ? sequence.huddles.reduce((sum, h) => sum + (h.analytics?.engagementRate || 0), 0) / sequence.huddles.length 
    : 0;

  return {
    totalHuddles,
    completedHuddles,
    releasedHuddles,
    totalViews,
    totalCompletions,
    averageEngagement: Math.round(averageEngagement),
    completionRate: getCompletionRate(completedHuddles, totalHuddles),
    releaseRate: getCompletionRate(releasedHuddles, totalHuddles)
  };
};

// Sequence sorting utilities
export const sortSequencesByStatus = (sequences: HuddleSequence[]) => {
  const statusOrder = ['PUBLISHED', 'REVIEW', 'DRAFT', 'GENERATING', 'SCHEDULED', 'ARCHIVED'];
  
  return [...sequences].sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.sequenceStatus);
    const bIndex = statusOrder.indexOf(b.sequenceStatus);
    
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    
    // If same status, sort by updated date (newest first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

export const sortHuddlesByOrder = (huddles: Huddle[]) => {
  return [...huddles].sort((a, b) => a.orderIndex - b.orderIndex);
};

// Validation utilities
export const validateSequenceTargets = (disciplines: Discipline[], roles: UserRole[]): string[] => {
  const errors: string[] = [];
  
  if (disciplines.length === 0 && roles.length === 0) {
    errors.push('At least one discipline or role must be selected');
  }
  
  return errors;
};

export const validateSequenceForm = (data: {
  title: string;
  disciplines: Discipline[];
  roles: UserRole[];
  estimatedDurationMinutes?: number;
}): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (data.estimatedDurationMinutes && data.estimatedDurationMinutes < 0) {
    errors.push('Duration must be positive');
  }
  
  errors.push(...validateSequenceTargets(data.disciplines, data.roles));
  
  return errors;
};

// Search and filter utilities
export const filterSequencesByDiscipline = (sequences: HuddleSequence[], discipline: Discipline) => {
  return sequences.filter(sequence => {
    const { disciplines } = getSequenceTargets(sequence);
    return disciplines.includes(discipline);
  });
};

export const filterSequencesByRole = (sequences: HuddleSequence[], role: UserRole) => {
  return sequences.filter(sequence => {
    const { roles } = getSequenceTargets(sequence);
    return roles.includes(role);
  });
};

export const searchSequences = (sequences: HuddleSequence[], query: string) => {
  const lowercaseQuery = query.toLowerCase();
  
  return sequences.filter(sequence => 
    sequence.title.toLowerCase().includes(lowercaseQuery) ||
    sequence.description?.toLowerCase().includes(lowercaseQuery) ||
    sequence.topic?.toLowerCase().includes(lowercaseQuery) ||
    sequence.createdByUserName.toLowerCase().includes(lowercaseQuery)
  );
};

// Export utility object for easy importing
export const SequenceUtils = {
  getSequenceStatusInfo,
  getHuddleTypeInfo,
  getDisciplineInfo,
  getRoleInfo,
  getSequenceTargets,
  isUserTargetedForSequence,
  getEngagementLevel,
  getCompletionRate,
  formatDuration,
  calculateSequenceMetrics,
  sortSequencesByStatus,
  sortHuddlesByOrder,
  validateSequenceTargets,
  validateSequenceForm,
  filterSequencesByDiscipline,
  filterSequencesByRole,
  searchSequences
};

export default SequenceUtils;