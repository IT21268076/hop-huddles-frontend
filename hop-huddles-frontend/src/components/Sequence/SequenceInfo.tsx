// components/Sequence/SequenceInfoCard.tsx - Futuristic sequence information display
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Edit3, 
  Zap, 
  Brain,
  Activity,
  TrendingUp,
  PlayCircle,
  Star,
  Shield
} from 'lucide-react';
import type { HuddleSequence, Discipline, UserRole } from '../../types';

interface SequenceInfoCardProps {
  sequence: HuddleSequence;
  onEdit: () => void;
  canEdit: boolean;
}

const disciplineLabels: Record<Discipline, string> = {
  'RN': 'Registered Nurse',
  'PT': 'Physical Therapist', 
  'OT': 'Occupational Therapist',
  'SLP': 'Speech-Language Pathologist',
  'LPN': 'Licensed Practical Nurse',
  'HHA': 'Home Health Aide',
  'MSW': 'Medical Social Worker',
  'OTHER': 'Other'
};

const roleLabels: Record<UserRole, string> = {
  'EDUCATOR': 'Educator',
  'ADMIN': 'Administrator',
  'DIRECTOR': 'Director',
  'CLINICAL_MANAGER': 'Clinical Manager',
  'FIELD_CLINICIAN': 'Field Clinician',
  'SUPERADMIN': 'Super Administrator'
};

const SequenceInfoCard: React.FC<SequenceInfoCardProps> = ({ 
  sequence, 
  onEdit, 
  canEdit 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'from-green-500 to-emerald-600';
      case 'DRAFT': return 'from-yellow-500 to-orange-600';
      case 'REVIEW': return 'from-blue-500 to-indigo-600';
      case 'ARCHIVED': return 'from-gray-500 to-gray-600';
      default: return 'from-purple-500 to-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <PlayCircle className="h-4 w-4" />;
      case 'DRAFT': return <Edit3 className="h-4 w-4" />;
      case 'REVIEW': return <Star className="h-4 w-4" />;
      case 'ARCHIVED': return <Shield className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getDisciplines = () => {
    return sequence.targets
      .filter(target => target.targetType === 'DISCIPLINE')
      .map(target => target.targetValue as Discipline);
  };

  const getRoles = () => {
    return sequence.targets
      .filter(target => target.targetType === 'ROLE')
      .map(target => target.targetValue as UserRole);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border border-blue-200/50 shadow-xl transition-all duration-500 ${
        isHovered ? 'shadow-2xl scale-[1.01]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {sequence.title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm">{sequence.description}</p>
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={onEdit}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Edit Sequence</span>
              </div>
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(sequence.sequenceStatus)} text-white text-sm font-medium shadow-lg`}>
            {getStatusIcon(sequence.sequenceStatus)}
            <span className="capitalize">{sequence.sequenceStatus.toLowerCase()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Release Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {sequence.publishedAt ? new Date(sequence.publishedAt).toLocaleDateString() : 'Not Published'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Duration</p>
                <p className="text-lg font-bold text-gray-900">
                  {sequence.estimatedDurationMinutes || 0} min
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Huddles</p>
                <p className="text-lg font-bold text-gray-900">
                  {sequence.totalHuddles}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Engagement</p>
                <p className="text-lg font-bold text-gray-900">
                  {sequence.analytics?.engagementMetrics?.totalViews || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Targets Section */}
        <div className="space-y-6">
          {/* Disciplines */}
          {getDisciplines().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Target Disciplines
              </h3>
              <div className="flex flex-wrap gap-2">
                {getDisciplines().map((discipline) => (
                  <div
                    key={discipline}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transform group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold">{discipline}</span>
                      <div className="text-xs opacity-90">{disciplineLabels[discipline]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roles */}
          {getRoles().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Target Roles
              </h3>
              <div className="flex flex-wrap gap-2">
                {getRoles().map((role) => (
                  <div
                    key={role}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transform group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold">{role.replace('_', ' ')}</span>
                      <div className="text-xs opacity-90">{roleLabels[role]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Creator Info */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {sequence.createdByUserName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">Created by {sequence.createdByUserName}</p>
                <p className="text-xs">{new Date(sequence.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {sequence.publishedByUserName && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <PlayCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Published by {sequence.publishedByUserName}</p>
                  <p className="text-xs">{sequence.publishedAt ? new Date(sequence.publishedAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl border border-blue-300/30 transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};

export default SequenceInfoCard;