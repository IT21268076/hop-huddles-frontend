// // pages/Progress/ProgressManagement.tsx
// import React, { useState, useMemo } from 'react';
// import { useQuery } from 'react-query';
// import { 
//   TrendingUp, 
//   Users, 
//   BookOpen, 
//   Clock, 
//   Award, 
//   Target,
//   Filter,
//   Download,
//   Eye,
//   BarChart3,
//   PieChart,
//   Calendar,
//   User,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   UserCheck,
//   X
// } from 'lucide-react';
// import { apiClient } from '../../api/client';
// import { useAuth } from '../../contexts/AuthContext';
// import { hasPermission, PERMISSIONS } from '../../utils/permissions';
// import type { 
//   UserProgress, 
//   UserAnalytics, 
//   HuddleSequence, 
//   User as UserType,
//   ProgressStatus,
//   Discipline,
//   UserRole
// } from '../../types';

// interface ProgressFilters {
//   userId?: number;
//   sequenceId?: number;
//   branchId?: number;
//   teamId?: number;
//   discipline?: string;
//   role?: string;
//   status?: ProgressStatus;
//   dateRange?: {
//     start: string;
//     end: string;
//   };
// }

// const ProgressManagement: React.FC = () => {
//   const { currentAgency, user } = useAuth();
//   const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'huddles' | 'analytics'>('overview');
//   const [filters, setFilters] = useState<ProgressFilters>({});
//   const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
//   const [selectedSequence, setSelectedSequence] = useState<HuddleSequence | null>(null);

//   // Check permissions
//   const canViewAgencyProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_AGENCY);
//   const canViewBranchProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_BRANCH);
//   const canViewTeamProgress = hasPermission(user?.assignments || [], PERMISSIONS.PROGRESS_VIEW_TEAM);

//   // Fetch progress data
//   const { data: allProgress, isLoading: progressLoading } = useQuery(
//     ['progress', currentAgency?.agencyId, filters],
//     () => currentAgency ? apiClient.getProgressByAgency(currentAgency.agencyId, filters) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   // Fetch users for filtering
//   const { data: allUsers } = useQuery(
//     ['users', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   // Fetch sequences for filtering
//   const { data: allSequences } = useQuery(
//     ['sequences', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getSequencesByAgency(currentAgency.agencyId) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   // Fetch user analytics
//   const { data: userAnalytics } = useQuery(
//     ['user-analytics', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getUserAnalytics(currentAgency.agencyId) : Promise.resolve({}),
//     { enabled: !!currentAgency && canViewAgencyProgress }
//   );

//   // Fetch huddle analytics
//   const { data: huddleAnalytics } = useQuery(
//     ['huddle-analytics', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getHuddleAnalytics(currentAgency.agencyId) : Promise.resolve({}),
//     { enabled: !!currentAgency && canViewAgencyProgress }
//   );

//   // Calculate derived metrics
//   const progressMetrics = useMemo(() => {
//     if (!allProgress) return null;

//     const totalProgress = allProgress.length;
//     const completedProgress = allProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//     const inProgressCount = allProgress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
//     const notStartedCount = allProgress.filter(p => p.progressStatus === 'NOT_STARTED').length;
    
//     const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
//     const averageScore = allProgress
//       .filter(p => p.assessmentScore !== null)
//       .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);

//     const uniqueUsers = new Set(allProgress.map(p => p.userId)).size;
//     const activeUsers = new Set(
//       allProgress
//         .filter(p => p.progressStatus === 'IN_PROGRESS' || p.progressStatus === 'COMPLETED')
//         .map(p => p.userId)
//     ).size;

//     return {
//       totalProgress,
//       completedProgress,
//       inProgressCount,
//       notStartedCount,
//       totalTimeSpent,
//       averageScore,
//       uniqueUsers,
//       activeUsers,
//       completionRate: totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0,
//       engagementRate: uniqueUsers > 0 ? (activeUsers / uniqueUsers) * 100 : 0
//     };
//   }, [allProgress]);

//   const renderOverviewTab = () => (
//     <div className="space-y-6">
//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-blue-100 text-sm">Total Progress Records</p>
//               <p className="text-3xl font-bold">{progressMetrics?.totalProgress || 0}</p>
//             </div>
//             <BarChart3 className="h-10 w-10 text-blue-200" />
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-100 text-sm">Completion Rate</p>
//               <p className="text-3xl font-bold">{progressMetrics?.completionRate.toFixed(1) || 0}%</p>
//             </div>
//             <CheckCircle className="h-10 w-10 text-green-200" />
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-purple-100 text-sm">Active Users</p>
//               <p className="text-3xl font-bold">{progressMetrics?.activeUsers || 0}</p>
//             </div>
//             <Users className="h-10 w-10 text-purple-200" />
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-orange-100 text-sm">Avg. Score</p>
//               <p className="text-3xl font-bold">{progressMetrics?.averageScore.toFixed(1) || 0}%</p>
//             </div>
//             <Award className="h-10 w-10 text-orange-200" />
//           </div>
//         </div>
//       </div>

//       {/* Progress Distribution */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Status Distribution</h3>
//           <ProgressStatusChart data={progressMetrics} />
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
//           <EngagementChart data={allProgress} />
//         </div>
//       </div>

//       {/* Top Performers */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <TopPerformersCard users={allUsers} progress={allProgress} />
//         <TopSequencesCard sequences={allSequences} progress={allProgress} />
//       </div>
//     </div>
//   );

//   const renderUsersTab = () => (
//     <div className="space-y-6">
//       {/* User Progress Table */}
//       <div className="bg-white shadow rounded-lg">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-900">User Progress Overview</h3>
//         </div>
        
//         <UserProgressTable 
//           users={allUsers || []}
//           progress={allProgress || []}
//           onSelectUser={setSelectedUser}
//           canViewDetails={canViewAgencyProgress || canViewBranchProgress}
//         />
//       </div>

//       {/* User Detail Modal */}
//       {selectedUser && (
//         <UserProgressDetailModal
//           user={selectedUser}
//           progress={allProgress?.filter(p => p.userId === selectedUser.userId) || []}
//           onClose={() => setSelectedUser(null)}
//         />
//       )}
//     </div>
//   );

//   const renderHuddlesTab = () => (
//     <div className="space-y-6">
//       {/* Huddle Performance Table */}
//       <div className="bg-white shadow rounded-lg">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-900">Huddle Performance Analysis</h3>
//         </div>
        
//         <HuddleProgressTable
//           sequences={allSequences || []}
//           progress={allProgress || []}
//           onSelectSequence={setSelectedSequence}
//           canViewDetails={canViewAgencyProgress || canViewBranchProgress}
//         />
//       </div>

//       {/* Huddle Detail Modal */}
//       {selectedSequence && (
//         <HuddleProgressDetailModal
//           sequence={selectedSequence}
//           progress={allProgress?.filter(p => p.sequenceId === selectedSequence.sequenceId) || []}
//           onClose={() => setSelectedSequence(null)}
//         />
//       )}
//     </div>
//   );

//   const renderAnalyticsTab = () => (
//     <div className="space-y-6">
//       {/* Advanced Analytics Dashboard */}
//       <AdvancedAnalyticsDashboard
//         userAnalytics={userAnalytics || {}}
//         huddleAnalytics={huddleAnalytics || {}}
//         progress={allProgress || []}
//         users={allUsers || []}
//         sequences={allSequences || []}
//       />
//     </div>
//   );

//   if (progressLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Progress Management</h1>
//           <p className="text-gray-600">
//             Track user progress, engagement metrics, and performance analytics across all huddles.
//           </p>
//         </div>
        
//         <div className="flex items-center space-x-3">
//           <ProgressFilters onFiltersChange={setFilters} />
//           <button
//             onClick={() => {/* Export functionality */}}
//             className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//           >
//             <Download size={16} className="mr-2" />
//             Export
//           </button>
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: 'overview', label: 'Overview', icon: TrendingUp },
//             { id: 'users', label: 'Users', icon: Users },
//             { id: 'huddles', label: 'Huddles', icon: BookOpen },
//             { id: 'analytics', label: 'Analytics', icon: BarChart3 }
//           ].map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as any)}
//                 className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
//                   activeTab === tab.id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <Icon size={16} />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div>
//         {activeTab === 'overview' && renderOverviewTab()}
//         {activeTab === 'users' && renderUsersTab()}
//         {activeTab === 'huddles' && renderHuddlesTab()}
//         {activeTab === 'analytics' && renderAnalyticsTab()}
//       </div>
//     </div>
//   );
// };

// // Supporting Components
// const ProgressStatusChart: React.FC<{ data: any }> = ({ data }) => {
//   if (!data) return <div>No data available</div>;
  
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-gray-600">Completed</span>
//         <span className="text-sm font-medium text-gray-900">{data.completedProgress}</span>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2">
//         <div 
//           className="bg-green-500 h-2 rounded-full" 
//           style={{ width: `${(data.completedProgress / data.totalProgress) * 100}%` }}
//         />
//       </div>
      
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-gray-600">In Progress</span>
//         <span className="text-sm font-medium text-gray-900">{data.inProgressCount}</span>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2">
//         <div 
//           className="bg-blue-500 h-2 rounded-full" 
//           style={{ width: `${(data.inProgressCount / data.totalProgress) * 100}%` }}
//         />
//       </div>
      
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-gray-600">Not Started</span>
//         <span className="text-sm font-medium text-gray-900">{data.notStartedCount}</span>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2">
//         <div 
//           className="bg-gray-400 h-2 rounded-full" 
//           style={{ width: `${(data.notStartedCount / data.totalProgress) * 100}%` }}
//         />
//       </div>
//     </div>
//   );
// };

// const EngagementChart: React.FC<{ data: UserProgress[] | undefined }> = ({ data }) => {
//   // Implementation for engagement chart
//   return <div className="h-64 flex items-center justify-center text-gray-500">Engagement Chart Placeholder</div>;
// };

// const TopPerformersCard: React.FC<{ users: UserType[] | undefined; progress: UserProgress[] | undefined }> = ({ users, progress }) => {
//   const topPerformers = useMemo(() => {
//     if (!users || !progress) return [];
    
//     return users
//       .map(user => {
//         const userProgress = progress.filter(p => p.userId === user.userId);
//         const completedCount = userProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//         const averageScore = userProgress
//           .filter(p => p.assessmentScore !== null)
//           .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);
        
//         return {
//           user,
//           completedCount,
//           averageScore,
//           totalProgress: userProgress.length
//         };
//       })
//       .sort((a, b) => b.completedCount - a.completedCount)
//       .slice(0, 5);
//   }, [users, progress]);

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
//       <div className="space-y-3">
//         {topPerformers.map((performer, index) => (
//           <div key={performer.user.userId} className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
//                 index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
//               }`}>
//                 {index + 1}
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900">{performer.user.name}</p>
//                 <p className="text-xs text-gray-600">{performer.completedCount} completed</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-medium text-gray-900">{performer.averageScore.toFixed(1)}%</p>
//               <p className="text-xs text-gray-600">avg score</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // TopSequencesCard Component Implementation
// const TopSequencesCard: React.FC<{ sequences: HuddleSequence[] | undefined; progress: UserProgress[] | undefined }> = ({ sequences, progress }) => {
//   const topSequences = useMemo(() => {
//     if (!sequences || !progress) return [];
    
//     return sequences
//       .map(sequence => {
//         const sequenceProgress = progress.filter(p => p.sequenceId === sequence.sequenceId);
//         const completedCount = sequenceProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//         const totalAssigned = sequenceProgress.length;
//         const averageScore = sequenceProgress
//           .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//           .reduce((sum, p, _, arr) => sum + (p.assessmentScore || 0) / arr.length, 0);
//         const completionRate = totalAssigned > 0 ? (completedCount / totalAssigned) * 100 : 0;
        
//         return {
//           sequence,
//           completedCount,
//           totalAssigned,
//           averageScore,
//           completionRate,
//           totalViews: sequenceProgress.length
//         };
//       })
//       .filter(item => item.totalAssigned > 0)
//       .sort((a, b) => b.completionRate - a.completionRate)
//       .slice(0, 5);
//   }, [sequences, progress]);

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sequences</h3>
//       {topSequences.length > 0 ? (
//         <div className="space-y-3">
//           {topSequences.map((item, index) => (
//             <div key={item.sequence.sequenceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
//                   index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
//                 }`}>
//                   {index + 1}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-gray-900 truncate">{item.sequence.title}</p>
//                   <p className="text-xs text-gray-600">
//                     {item.completedCount}/{item.totalAssigned} completed • {item.sequence.totalHuddles} huddles
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right flex-shrink-0">
//                 <p className="text-sm font-medium text-gray-900">{item.completionRate.toFixed(1)}%</p>
//                 <p className="text-xs text-gray-600">completion</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-8 text-gray-500">
//           <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//           <p className="text-sm">No sequence data available</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // REPLACE these placeholder implementations:
// const UserProgressTable: React.FC<any> = ({ users, progress, onSelectUser, canViewDetails }) => {
//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {users.map((user: any) => {
//             const userProgress = progress.filter((p: any) => p.userId === user.userId);
//             const completedCount = userProgress.filter((p: any) => p.progressStatus === 'COMPLETED').length;
            
//             return (
//               <tr key={user.userId}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                   <div className="text-sm text-gray-500">{user.email}</div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">{userProgress.length} assigned</div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">{completedCount} completed</div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {canViewDetails && (
//                     <button
//                       onClick={() => onSelectUser(user)}
//                       className="text-blue-600 hover:text-blue-900 text-sm"
//                     >
//                       View Details
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// // HuddleProgressTable Component Implementation
// const HuddleProgressTable: React.FC<{
//   sequences: HuddleSequence[];
//   progress: UserProgress[];
//   onSelectSequence: (sequence: HuddleSequence) => void;
//   canViewDetails: boolean;
// }> = ({ sequences, progress, onSelectSequence, canViewDetails }) => {
//   const sequenceStats = useMemo(() => {
//     return sequences.map(sequence => {
//       const sequenceProgress = progress.filter(p => p.sequenceId === sequence.sequenceId);
//       const completedCount = sequenceProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//       const inProgressCount = sequenceProgress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
//       const notStartedCount = sequenceProgress.filter(p => p.progressStatus === 'NOT_STARTED').length;
//       const totalAssigned = sequenceProgress.length;
      
//       const averageScore = sequenceProgress
//         .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//         .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
      
//       const averageTimeSpent = sequenceProgress.length > 0 
//         ? sequenceProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0) / sequenceProgress.length 
//         : 0;
      
//       const completionRate = totalAssigned > 0 ? (completedCount / totalAssigned) * 100 : 0;
      
//       return {
//         sequence,
//         totalAssigned,
//         completedCount,
//         inProgressCount,
//         notStartedCount,
//         completionRate,
//         averageScore,
//         averageTimeSpent
//       };
//     });
//   }, [sequences, progress]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'PUBLISHED': return 'bg-green-100 text-green-800';
//       case 'DRAFT': return 'bg-gray-100 text-gray-800';
//       case 'REVIEW': return 'bg-yellow-100 text-yellow-800';
//       case 'ARCHIVED': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Sequence
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Status
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Assigned
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Progress
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Completion Rate
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Avg. Score
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Avg. Time
//             </th>
//             {canViewDetails && (
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             )}
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {sequenceStats.map((stats) => (
//             <tr key={stats.sequence.sequenceId} className="hover:bg-gray-50">
//               <td className="px-6 py-4">
//                 <div className="flex items-center">
//                   <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
//                   <div>
//                     <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
//                       {stats.sequence.title}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {stats.sequence.totalHuddles} huddles • {stats.sequence.estimatedDurationMinutes || 0} min
//                     </div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stats.sequence.sequenceStatus)}`}>
//                   {stats.sequence.sequenceStatus}
//                 </span>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 {stats.totalAssigned} users
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex flex-col space-y-1">
//                   <div className="flex items-center text-xs">
//                     <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
//                     <span className="text-gray-600">{stats.completedCount} completed</span>
//                   </div>
//                   <div className="flex items-center text-xs">
//                     <Clock className="h-3 w-3 text-blue-500 mr-1" />
//                     <span className="text-gray-600">{stats.inProgressCount} in progress</span>
//                   </div>
//                   <div className="flex items-center text-xs">
//                     <XCircle className="h-3 w-3 text-gray-400 mr-1" />
//                     <span className="text-gray-600">{stats.notStartedCount} not started</span>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="flex-1">
//                     <div className="text-sm font-medium text-gray-900">
//                       {stats.completionRate.toFixed(1)}%
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                       <div
//                         className="bg-green-500 h-2 rounded-full"
//                         style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : '-'}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 {stats.averageTimeSpent > 0 ? `${Math.round(stats.averageTimeSpent)} min` : '-'}
//               </td>
//               {canViewDetails && (
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     onClick={() => onSelectSequence(stats.sequence)}
//                     className="text-blue-600 hover:text-blue-900"
//                   >
//                     View Details
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
      
//       {sequences.length === 0 && (
//         <div className="text-center py-8">
//           <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-medium text-gray-900">No sequences found</h3>
//           <p className="mt-1 text-sm text-gray-500">Create your first huddle sequence to see progress data.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // UserProgressDetailModal Component Implementation
// const UserProgressDetailModal: React.FC<{
//   user: UserType;
//   progress: UserProgress[];
//   onClose: () => void;
// }> = ({ user, progress, onClose }) => {
//   const [activeTab, setActiveTab] = useState<'overview' | 'sequences' | 'achievements'>('overview');

//   const userStats = useMemo(() => {
//     const completed = progress.filter(p => p.progressStatus === 'COMPLETED').length;
//     const inProgress = progress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
//     const notStarted = progress.filter(p => p.progressStatus === 'NOT_STARTED').length;
//     const totalTime = progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
//     const averageScore = progress
//       .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//       .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
    
//     const completionRate = progress.length > 0 ? (completed / progress.length) * 100 : 0;
    
//     return {
//       completed,
//       inProgress,
//       notStarted,
//       totalTime,
//       averageScore,
//       completionRate,
//       totalAssigned: progress.length
//     };
//   }, [progress]);

//   const recentActivity = useMemo(() => {
//     return progress
//       .filter(p => p.lastAccessed)
//       .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
//       .slice(0, 5);
//   }, [progress]);

//   const getStatusIcon = (status: ProgressStatus) => {
//     switch (status) {
//       case 'COMPLETED':
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case 'IN_PROGRESS':
//         return <Clock className="h-4 w-4 text-blue-500" />;
//       case 'NOT_STARTED':
//         return <XCircle className="h-4 w-4 text-gray-400" />;
//       default:
//         return <AlertCircle className="h-4 w-4 text-yellow-500" />;
//     }
//   };

//   const getStatusColor = (status: ProgressStatus) => {
//     switch (status) {
//       case 'COMPLETED':
//         return 'bg-green-100 text-green-800';
//       case 'IN_PROGRESS':
//         return 'bg-blue-100 text-blue-800';
//       case 'NOT_STARTED':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-yellow-100 text-yellow-800';
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-screen items-center justify-center p-4">
//         <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
//         <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between p-6 border-b border-gray-200">
//             <div className="flex items-center space-x-4">
//               <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <User className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
//                 <p className="text-sm text-gray-600">{user.email}</p>
//                 <div className="flex space-x-2 mt-1">
//                   {user.assignments.map((assignment, idx) => (
//                     <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
//                       {assignment.role}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Tab Navigation */}
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6">
//               {[
//                 { id: 'overview', label: 'Overview', icon: BarChart3 },
//                 { id: 'sequences', label: 'Sequences', icon: BookOpen },
//                 { id: 'achievements', label: 'Achievements', icon: Award }
//               ].map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id as any)}
//                     className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                   >
//                     <Icon size={16} />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-green-900">{userStats.completed}</div>
//                     <div className="text-sm text-green-700">Completed</div>
//                   </div>
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-blue-900">{userStats.inProgress}</div>
//                     <div className="text-sm text-blue-700">In Progress</div>
//                   </div>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-gray-900">{Math.round(userStats.totalTime / 60)}h</div>
//                     <div className="text-sm text-gray-700">Total Time</div>
//                   </div>
//                   <div className="bg-purple-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-purple-900">{userStats.averageScore.toFixed(1)}%</div>
//                     <div className="text-sm text-purple-700">Avg Score</div>
//                   </div>
//                 </div>

//                 {/* Progress Chart */}
//                 <div className="bg-white border border-gray-200 rounded-lg p-4">
//                   <h4 className="text-lg font-medium text-gray-900 mb-4">Overall Progress</h4>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Completion Rate</span>
//                       <span className="text-sm font-medium text-gray-900">{userStats.completionRate.toFixed(1)}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-3">
//                       <div
//                         className="bg-green-500 h-3 rounded-full transition-all duration-300"
//                         style={{ width: `${userStats.completionRate}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Recent Activity */}
//                 <div className="bg-white border border-gray-200 rounded-lg p-4">
//                   <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
//                   <div className="space-y-3">
//                     {recentActivity.map((activity) => (
//                       <div key={activity.progressId} className="flex items-center justify-between py-2">
//                         <div className="flex items-center space-x-3">
//                           {getStatusIcon(activity.progressStatus)}
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{activity.huddleTitle}</p>
//                             <p className="text-xs text-gray-500">{activity.sequenceTitle}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-xs text-gray-500">
//                             {new Date(activity.lastAccessed).toLocaleDateString()}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             {activity.timeSpentMinutes} min
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'sequences' && (
//               <div className="space-y-4">
//                 <h4 className="text-lg font-medium text-gray-900">All Sequences</h4>
//                 <div className="space-y-2">
//                   {progress.map((item) => (
//                     <div key={item.progressId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                       <div className="flex items-center space-x-3">
//                         {getStatusIcon(item.progressStatus)}
//                         <div>
//                           <p className="font-medium text-gray-900">{item.huddleTitle}</p>
//                           <p className="text-sm text-gray-600">{item.sequenceTitle}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-4">
//                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.progressStatus)}`}>
//                           {item.progressStatus.replace('_', ' ')}
//                         </span>
//                         <div className="text-right">
//                           <p className="text-sm font-medium text-gray-900">{item.completionPercentage}%</p>
//                           <p className="text-xs text-gray-500">{item.timeSpentMinutes} min</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'achievements' && (
//               <div className="text-center py-12">
//                 <Award className="mx-auto h-12 w-12 text-gray-400" />
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">Achievements Coming Soon</h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Achievement tracking will be available in a future update.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // HuddleProgressDetailModal Component Implementation
// const HuddleProgressDetailModal: React.FC<{
//   sequence: HuddleSequence;
//   progress: UserProgress[];
//   onClose: () => void;
// }> = ({ sequence, progress, onClose }) => {
//   const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

//   const sequenceStats = useMemo(() => {
//     const completed = progress.filter(p => p.progressStatus === 'COMPLETED').length;
//     const inProgress = progress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
//     const notStarted = progress.filter(p => p.progressStatus === 'NOT_STARTED').length;
//     const totalTime = progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
//     const averageScore = progress
//       .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//       .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
    
//     const completionRate = progress.length > 0 ? (completed / progress.length) * 100 : 0;
//     const averageTimeSpent = progress.length > 0 ? totalTime / progress.length : 0;
    
//     return {
//       completed,
//       inProgress,
//       notStarted,
//       totalTime,
//       averageScore,
//       completionRate,
//       averageTimeSpent,
//       totalUsers: progress.length
//     };
//   }, [progress]);

//   const huddleBreakdown = useMemo(() => {
//     if (!sequence.huddles) return [];
    
//     return sequence.huddles.map(huddle => {
//       const huddleProgress = progress.filter(p => p.huddleId === huddle.huddleId);
//       const completed = huddleProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//       const inProgress = huddleProgress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
//       const completionRate = huddleProgress.length > 0 ? (completed / huddleProgress.length) * 100 : 0;
      
//       return {
//         huddle,
//         totalUsers: huddleProgress.length,
//         completed,
//         inProgress,
//         completionRate
//       };
//     });
//   }, [sequence.huddles, progress]);

//   const userPerformance = useMemo(() => {
//     const userMap = new Map();
    
//     progress.forEach(p => {
//       if (!userMap.has(p.userId)) {
//         userMap.set(p.userId, {
//           userId: p.userId,
//           userName: p.userName,
//           completed: 0,
//           inProgress: 0,
//           notStarted: 0,
//           totalTime: 0,
//           averageScore: 0,
//           scoreCount: 0
//         });
//       }
      
//       const user = userMap.get(p.userId);
//       if (p.progressStatus === 'COMPLETED') user.completed++;
//       else if (p.progressStatus === 'IN_PROGRESS') user.inProgress++;
//       else user.notStarted++;
      
//       user.totalTime += p.timeSpentMinutes;
      
//       if (p.assessmentScore !== null && p.assessmentScore !== undefined) {
//         user.averageScore = (user.averageScore * user.scoreCount + p.assessmentScore) / (user.scoreCount + 1);
//         user.scoreCount++;
//       }
//     });
    
//     return Array.from(userMap.values()).sort((a, b) => b.completed - a.completed);
//   }, [progress]);

//   const getStatusColor = (status: ProgressStatus) => {
//     switch (status) {
//       case 'COMPLETED':
//         return 'bg-green-100 text-green-800';
//       case 'IN_PROGRESS':
//         return 'bg-blue-100 text-blue-800';
//       case 'NOT_STARTED':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-yellow-100 text-yellow-800';
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-screen items-center justify-center p-4">
//         <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
//         <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between p-6 border-b border-gray-200">
//             <div className="flex items-center space-x-4">
//               <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <BookOpen className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">{sequence.title}</h3>
//                 <p className="text-sm text-gray-600">{sequence.description}</p>
//                 <div className="flex items-center space-x-4 mt-1">
//                   <span className="text-xs px-2 py-1 bg-gray-100 rounded">
//                     {sequence.totalHuddles} huddles
//                   </span>
//                   <span className="text-xs px-2 py-1 bg-gray-100 rounded">
//                     {sequence.estimatedDurationMinutes || 0} min
//                   </span>
//                   <span className={`text-xs px-2 py-1 rounded ${
//                     sequence.sequenceStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {sequence.sequenceStatus}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Tab Navigation */}
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6">
//               {[
//                 { id: 'overview', label: 'Overview', icon: BarChart3 },
//                 { id: 'users', label: 'User Progress', icon: Users },
//                 { id: 'analytics', label: 'Analytics', icon: TrendingUp }
//               ].map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id as any)}
//                     className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                   >
//                     <Icon size={16} />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-blue-900">{sequenceStats.totalUsers}</div>
//                     <div className="text-sm text-blue-700">Total Users</div>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-green-900">{sequenceStats.completed}</div>
//                     <div className="text-sm text-green-700">Completed</div>
//                   </div>
//                   <div className="bg-yellow-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-yellow-900">{sequenceStats.completionRate.toFixed(1)}%</div>
//                     <div className="text-sm text-yellow-700">Completion Rate</div>
//                   </div>
//                   <div className="bg-purple-50 p-4 rounded-lg">
//                     <div className="text-2xl font-bold text-purple-900">{sequenceStats.averageScore.toFixed(1)}%</div>
//                     <div className="text-sm text-purple-700">Avg Score</div>
//                   </div>
//                 </div>

//                 {/* Progress Breakdown */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div className="bg-white border border-gray-200 rounded-lg p-4">
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">Progress Distribution</h4>
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">Completed</span>
//                         <span className="text-sm font-medium text-gray-900">{sequenceStats.completed}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div 
//                           className="bg-green-500 h-2 rounded-full" 
//                           style={{ width: `${(sequenceStats.completed / sequenceStats.totalUsers) * 100}%` }}
//                         />
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">In Progress</span>
//                         <span className="text-sm font-medium text-gray-900">{sequenceStats.inProgress}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div 
//                           className="bg-blue-500 h-2 rounded-full" 
//                           style={{ width: `${(sequenceStats.inProgress / sequenceStats.totalUsers) * 100}%` }}
//                         />
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">Not Started</span>
//                         <span className="text-sm font-medium text-gray-900">{sequenceStats.notStarted}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div 
//                           className="bg-gray-400 h-2 rounded-full" 
//                           style={{ width: `${(sequenceStats.notStarted / sequenceStats.totalUsers) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white border border-gray-200 rounded-lg p-4">
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h4>
//                     <div className="space-y-4">
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600">Average Time Spent</span>
//                         <span className="text-sm font-medium text-gray-900">{Math.round(sequenceStats.averageTimeSpent)} min</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600">Total Time Invested</span>
//                         <span className="text-sm font-medium text-gray-900">{Math.round(sequenceStats.totalTime / 60)} hours</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600">Estimated vs Actual</span>
//                         <span className="text-sm font-medium text-gray-900">
//                           {sequence.estimatedDurationMinutes ? 
//                             `${((sequenceStats.averageTimeSpent / sequence.estimatedDurationMinutes) * 100).toFixed(0)}%` : 
//                             'N/A'
//                           }
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Huddle Breakdown */}
//                 <div className="bg-white border border-gray-200 rounded-lg p-4">
//                   <h4 className="text-lg font-medium text-gray-900 mb-4">Huddle Performance</h4>
//                   <div className="space-y-2">
//                     {huddleBreakdown.map((item, index) => (
//                       <div key={item.huddle.huddleId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
//                         <div className="flex items-center space-x-3">
//                           <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
//                           <div>
//                             <p className="font-medium text-gray-900">{item.huddle.title}</p>
//                             <p className="text-xs text-gray-500">{item.huddle.huddleType}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm font-medium text-gray-900">{item.completionRate.toFixed(1)}%</p>
//                           <p className="text-xs text-gray-500">{item.completed}/{item.totalUsers} completed</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'users' && (
//               <div className="space-y-4">
//                 <h4 className="text-lg font-medium text-gray-900">User Performance</h4>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {userPerformance.map((user) => (
//                         <tr key={user.userId}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm font-medium text-gray-900">{user.userName}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.completed}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.inProgress}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalTime} min</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {user.scoreCount > 0 ? `${user.averageScore.toFixed(1)}%` : '-'}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'analytics' && (
//               <div className="text-center py-12">
//                 <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">Advanced Analytics Coming Soon</h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Detailed analytics including engagement patterns, drop-off points, and performance trends will be available soon.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // AdvancedAnalyticsDashboard Component Implementation
// const AdvancedAnalyticsDashboard: React.FC<{
//   userAnalytics: Record<number, any>;
//   huddleAnalytics: Record<number, any>;
//   progress: UserProgress[];
//   users: UserType[];
//   sequences: HuddleSequence[];
// }> = ({ userAnalytics, huddleAnalytics, progress, users, sequences }) => {
//   const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
//   const [selectedMetric, setSelectedMetric] = useState<'completion' | 'engagement' | 'performance'>('completion');

//   const analyticsData = useMemo(() => {
//     const now = new Date();
//     const timeRanges = {
//       '7d': 7,
//       '30d': 30,
//       '90d': 90,
//       '1y': 365
//     };
    
//     const daysBack = timeRanges[selectedTimeRange];
//     const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
//     // Filter progress within time range
//     const recentProgress = progress.filter(p => 
//       p.lastAccessed && new Date(p.lastAccessed) >= cutoffDate
//     );
    
//     // Calculate metrics
//     const totalUsers = users.length;
//     const activeUsers = new Set(recentProgress.map(p => p.userId)).size;
//     const completedHuddles = recentProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//     const totalAssignments = recentProgress.length;
    
//     const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
//     const completionRate = totalAssignments > 0 ? (completedHuddles / totalAssignments) * 100 : 0;
    
//     const averageScore = recentProgress
//       .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//       .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
    
//     const totalTimeSpent = recentProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    
//     return {
//       totalUsers,
//       activeUsers,
//       engagementRate,
//       completionRate,
//       averageScore,
//       totalTimeSpent,
//       completedHuddles,
//       totalAssignments
//     };
//   }, [progress, users, selectedTimeRange]);

//   const trendData = useMemo(() => {
//     const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365;
//     const data = [];
    
//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0];
      
//       const dayProgress = progress.filter(p => {
//         if (!p.lastAccessed) return false;
//         const progressDate = new Date(p.lastAccessed).toISOString().split('T')[0];
//         return progressDate === dateStr;
//       });
      
//       const completed = dayProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//       const activeUsers = new Set(dayProgress.map(p => p.userId)).size;
//       const avgScore = dayProgress
//         .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//         .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
      
//       data.push({
//         date: dateStr,
//         completed,
//         activeUsers,
//         avgScore: avgScore || 0,
//         label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//       });
//     }
    
//     return data;
//   }, [progress, selectedTimeRange]);

//   const topPerformers = useMemo(() => {
//     return users
//       .map(user => {
//         const userProgress = progress.filter(p => p.userId === user.userId);
//         const completed = userProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//         const avgScore = userProgress
//           .filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined)
//           .reduce((sum, p, _, arr) => arr.length > 0 ? sum + (p.assessmentScore || 0) / arr.length : 0, 0);
        
//         return {
//           user,
//           completed,
//           avgScore,
//           totalTime: userProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0)
//         };
//       })
//       .filter(item => item.completed > 0)
//       .sort((a, b) => b.completed - a.completed)
//       .slice(0, 10);
//   }, [users, progress]);

//   const disciplineBreakdown = useMemo(() => {
//     const breakdown = new Map();
    
//     users.forEach(user => {
//       user.assignments.forEach(assignment => {
//         if (assignment.disciplines) {
//           assignment.disciplines.forEach(discipline => {
//             if (!breakdown.has(discipline)) {
//               breakdown.set(discipline, { 
//                 discipline, 
//                 userCount: 0, 
//                 completed: 0, 
//                 inProgress: 0,
//                 averageScore: 0,
//                 scoreCount: 0
//               });
//             }
            
//             const data = breakdown.get(discipline);
//             data.userCount++;
            
//             const userProgress = progress.filter(p => p.userId === user.userId);
//             data.completed += userProgress.filter(p => p.progressStatus === 'COMPLETED').length;
//             data.inProgress += userProgress.filter(p => p.progressStatus === 'IN_PROGRESS').length;
            
//             const userScores = userProgress.filter(p => p.assessmentScore !== null && p.assessmentScore !== undefined);
//             if (userScores.length > 0) {
//               const userAvgScore = userScores.reduce((sum, p) => sum + (p.assessmentScore || 0), 0) / userScores.length;
//               data.averageScore = (data.averageScore * data.scoreCount + userAvgScore) / (data.scoreCount + 1);
//               data.scoreCount++;
//             }
//           });
//         }
//       });
//     });
    
//     return Array.from(breakdown.values());
//   }, [users, progress]);

//   const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ComponentType<any>, color: string) => (
//     <div className={`${color} rounded-lg p-6`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium opacity-75">{title}</p>
//           <p className="text-3xl font-bold mt-1">{value}</p>
//           <p className="text-sm opacity-75 mt-1">{subtitle}</p>
//         </div>
//         <div className="opacity-75">
//           {React.createElement(icon, { size: 32 })}
//         </div>
//       </div>
//     </div>
//   );

//   const renderTrendChart = () => (
//     <div className="bg-white border border-gray-200 rounded-lg p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-medium text-gray-900">Trends Over Time</h3>
//         <div className="flex space-x-2">
//           {['7d', '30d', '90d', '1y'].map((range) => (
//             <button
//               key={range}
//               onClick={() => setSelectedTimeRange(range as any)}
//               className={`px-3 py-1 text-sm rounded ${
//                 selectedTimeRange === range
//                   ? 'bg-blue-100 text-blue-700'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {range}
//             </button>
//           ))}
//         </div>
//       </div>
      
//       <div className="h-64 flex items-end space-x-2">
//         {trendData.map((point, index) => {
//           const maxValue = Math.max(...trendData.map(p => {
//             switch (selectedMetric) {
//               case 'completion': return p.completed;
//               case 'engagement': return p.activeUsers;
//               case 'performance': return p.avgScore;
//               default: return p.completed;
//             }
//           }));
          
//           const value = selectedMetric === 'completion' ? point.completed :
//                        selectedMetric === 'engagement' ? point.activeUsers :
//                        point.avgScore;
          
//           const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
//           return (
//             <div key={index} className="flex-1 flex flex-col items-center">
//               <div
//                 className="w-full bg-blue-500 rounded-t"
//                 style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
//                 title={`${point.label}: ${value}`}
//               />
//               <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
//                 {point.label}
//               </span>
//             </div>
//           );
//         })}
//       </div>
      
//       <div className="flex justify-center space-x-6 mt-4">
//         {[
//           { id: 'completion', label: 'Completions' },
//           { id: 'engagement', label: 'Active Users' },
//           { id: 'performance', label: 'Avg Score' }
//         ].map((metric) => (
//           <button
//             key={metric.id}
//             onClick={() => setSelectedMetric(metric.id as any)}
//             className={`text-sm ${
//               selectedMetric === metric.id
//                 ? 'text-blue-600 font-medium'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             {metric.label}
//           </button>
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {renderMetricCard(
//           'Total Users',
//           analyticsData.totalUsers,
//           'in your agency',
//           Users,
//           'bg-blue-500 text-white'
//         )}
//         {renderMetricCard(
//           'Active Users',
//           analyticsData.activeUsers,
//           `${analyticsData.engagementRate.toFixed(1)}% engagement`,
//           UserCheck,
//           'bg-green-500 text-white'
//         )}
//         {renderMetricCard(
//           'Completion Rate',
//           `${analyticsData.completionRate.toFixed(1)}%`,
//           `${analyticsData.completedHuddles} completed`,
//           CheckCircle,
//           'bg-purple-500 text-white'
//         )}
//         {renderMetricCard(
//           'Avg Performance',
//           `${analyticsData.averageScore.toFixed(1)}%`,
//           'assessment scores',
//           Award,
//           'bg-orange-500 text-white'
//         )}
//       </div>

//       {/* Trend Chart */}
//       {renderTrendChart()}

//       {/* Performance Tables */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Performers */}
//         <div className="bg-white border border-gray-200 rounded-lg p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
//           <div className="space-y-3">
//             {topPerformers.slice(0, 5).map((performer, index) => (
//               <div key={performer.user.userId} className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
//                     index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
//                   }`}>
//                     {index + 1}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{performer.user.name}</p>
//                     <p className="text-xs text-gray-600">{performer.completed} completed</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-gray-900">{performer.avgScore.toFixed(1)}%</p>
//                   <p className="text-xs text-gray-600">{Math.round(performer.totalTime / 60)}h spent</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Discipline Breakdown */}
//         <div className="bg-white border border-gray-200 rounded-lg p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Discipline</h3>
//           <div className="space-y-3">
//             {disciplineBreakdown.map((item) => (
//               <div key={item.discipline} className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium text-gray-900">{item.discipline}</p>
//                   <p className="text-xs text-gray-600">{item.userCount} users</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-gray-900">{item.averageScore.toFixed(1)}%</p>
//                   <p className="text-xs text-gray-600">{item.completed} completed</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Insights */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h4 className="font-medium text-blue-900">Engagement</h4>
//             <p className="text-sm text-blue-700 mt-1">
//               {analyticsData.engagementRate > 75 ? 'Excellent engagement!' : 
//                analyticsData.engagementRate > 50 ? 'Good engagement levels' : 
//                'Consider strategies to boost engagement'}
//             </p>
//           </div>
//           <div className="bg-green-50 p-4 rounded-lg">
//             <h4 className="font-medium text-green-900">Completion</h4>
//             <p className="text-sm text-green-700 mt-1">
//               {analyticsData.completionRate > 80 ? 'High completion rates!' : 
//                analyticsData.completionRate > 60 ? 'Moderate completion rates' : 
//                'Focus on improving completion rates'}
//             </p>
//           </div>
//           <div className="bg-purple-50 p-4 rounded-lg">
//             <h4 className="font-medium text-purple-900">Performance</h4>
//             <p className="text-sm text-purple-700 mt-1">
//               {analyticsData.averageScore > 85 ? 'Outstanding performance!' : 
//                analyticsData.averageScore > 70 ? 'Good performance levels' : 
//                'Consider additional support for learners'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ProgressFilters: React.FC<{ onFiltersChange: (filters: ProgressFilters) => void }> = ({ onFiltersChange }) => {
//   const { currentAgency } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [filters, setFilters] = useState<ProgressFilters>({});

//   // Fetch filter options
//   const { data: users } = useQuery(
//     ['users', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getUsersByAgency(currentAgency.agencyId) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   const { data: sequences } = useQuery(
//     ['sequences', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getSequencesByAgency(currentAgency.agencyId) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   const { data: branches } = useQuery(
//     ['branches', currentAgency?.agencyId],
//     () => currentAgency ? apiClient.getBranchesByAgency(currentAgency.agencyId) : Promise.resolve([]),
//     { enabled: !!currentAgency }
//   );

//   const { data: teams } = useQuery(
//     ['teams', filters.branchId],
//     () => filters.branchId ? apiClient.getTeamsByBranch(filters.branchId) : Promise.resolve([]),
//     { enabled: !!filters.branchId }
//   );

//   const statusOptions: { value: ProgressStatus; label: string; color: string }[] = [
//     { value: 'NOT_STARTED', label: 'Not Started', color: 'text-gray-600' },
//     { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-600' },
//     { value: 'COMPLETED', label: 'Completed', color: 'text-green-600' },
//     { value: 'SKIPPED', label: 'Skipped', color: 'text-yellow-600' },
//     { value: 'FAILED', label: 'Failed', color: 'text-red-600' },
//   ];

//   const roleOptions: { value: UserRole; label: string }[] = [
//     { value: 'EDUCATOR', label: 'Educator' },
//     { value: 'ADMIN', label: 'Administrator' },
//     { value: 'DIRECTOR', label: 'Director' },
//     { value: 'CLINICAL_MANAGER', label: 'Clinical Manager' },
//     { value: 'FIELD_CLINICIAN', label: 'Field Clinician' }
//   ];

//   const disciplineOptions: { value: Discipline; label: string }[] = [
//     { value: 'RN', label: 'Registered Nurse' },
//     { value: 'PT', label: 'Physical Therapist' },
//     { value: 'OT', label: 'Occupational Therapist' },
//     { value: 'SLP', label: 'Speech-Language Pathologist' },
//     { value: 'LPN', label: 'Licensed Practical Nurse' },
//     { value: 'HHA', label: 'Home Health Aide' },
//     { value: 'MSW', label: 'Medical Social Worker' },
//     { value: 'OTHER', label: 'Other' },
//   ];

//   const updateFilter = (key: keyof ProgressFilters, value: any) => {
//     const newFilters = { ...filters, [key]: value };
//     if (!value) {
//       delete newFilters[key];
//     }
//     setFilters(newFilters);
//     onFiltersChange(newFilters);
//   };

//   const clearAllFilters = () => {
//     setFilters({});
//     onFiltersChange({});
//   };

//   const getActiveFilterCount = () => {
//     return Object.keys(filters).length;
//   };

//   if (!isOpen) {
//     return (
//       <button
//         onClick={() => setIsOpen(true)}
//         className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//       >
//         <Filter size={16} className="mr-2" />
//         Filters
//         {getActiveFilterCount() > 0 && (
//           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//             {getActiveFilterCount()}
//           </span>
//         )}
//       </button>
//     );
//   }

//   return (
//     <div className="relative">
//       <div className="absolute right-0 top-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//         <div className="p-4">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">Filter Progress</h3>
//             <div className="flex items-center space-x-2">
//               {getActiveFilterCount() > 0 && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="text-sm text-blue-600 hover:text-blue-800"
//                 >
//                   Clear All
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//           </div>

//           <div className="space-y-4">
//             {/* User Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Users size={14} className="inline mr-1" />
//                 User
//               </label>
//               <select
//                 value={filters.userId || ''}
//                 onChange={(e) => updateFilter('userId', e.target.value ? parseInt(e.target.value) : undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Users</option>
//                 {users?.map((user) => (
//                   <option key={user.userId} value={user.userId}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Sequence Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <BookOpen size={14} className="inline mr-1" />
//                 Huddle Sequence
//               </label>
//               <select
//                 value={filters.sequenceId || ''}
//                 onChange={(e) => updateFilter('sequenceId', e.target.value ? parseInt(e.target.value) : undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Sequences</option>
//                 {sequences?.map((sequence) => (
//                   <option key={sequence.sequenceId} value={sequence.sequenceId}>
//                     {sequence.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Branch Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
//               <select
//                 value={filters.branchId || ''}
//                 onChange={(e) => updateFilter('branchId', e.target.value ? parseInt(e.target.value) : undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Branches</option>
//                 {branches?.map((branch) => (
//                   <option key={branch.branchId} value={branch.branchId}>
//                     {branch.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Team Filter */}
//             {filters.branchId && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
//                 <select
//                   value={filters.teamId || ''}
//                   onChange={(e) => updateFilter('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 >
//                   <option value="">All Teams</option>
//                   {teams?.map((team) => (
//                     <option key={team.teamId} value={team.teamId}>
//                       {team.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Role Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//               <select
//                 value={filters.role || ''}
//                 onChange={(e) => updateFilter('role', e.target.value || undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Roles</option>
//                 {roleOptions.map((role) => (
//                   <option key={role.value} value={role.value}>
//                     {role.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Discipline Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
//               <select
//                 value={filters.discipline || ''}
//                 onChange={(e) => updateFilter('discipline', e.target.value || undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Disciplines</option>
//                 {disciplineOptions.map((discipline) => (
//                   <option key={discipline.value} value={discipline.value}>
//                     {discipline.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={filters.status || ''}
//                 onChange={(e) => updateFilter('status', e.target.value as ProgressStatus || undefined)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Statuses</option>
//                 {statusOptions.map((status) => (
//                   <option key={status.value} value={status.value}>
//                     {status.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Date Range Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Calendar size={14} className="inline mr-1" />
//                 Date Range
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 <input
//                   type="date"
//                   value={filters.dateRange?.start || ''}
//                   onChange={(e) => updateFilter('dateRange', {
//                     ...filters.dateRange,
//                     start: e.target.value
//                   })}
//                   className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder="Start Date"
//                 />
//                 <input
//                   type="date"
//                   value={filters.dateRange?.end || ''}
//                   onChange={(e) => updateFilter('dateRange', {
//                     ...filters.dateRange,
//                     end: e.target.value
//                   })}
//                   className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder="End Date"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Active Filters Summary */}
//           {getActiveFilterCount() > 0 && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
//               <div className="flex flex-wrap gap-1">
//                 {Object.entries(filters).map(([key, value]) => {
//                   if (!value) return null;
                  
//                   let displayValue = value;
//                   if (key === 'userId') {
//                     displayValue = users?.find(u => u.userId === value)?.name || value;
//                   } else if (key === 'sequenceId') {
//                     displayValue = sequences?.find(s => s.sequenceId === value)?.title || value;
//                   } else if (key === 'branchId') {
//                     displayValue = branches?.find(b => b.branchId === value)?.name || value;
//                   } else if (key === 'teamId') {
//                     displayValue = teams?.find(t => t.teamId === value)?.name || value;
//                   } else if (key === 'dateRange') {
//                     displayValue = `${(value as any).start || ''} - ${(value as any).end || ''}`;
//                   }
                  
//                   return (
//                     <span
//                       key={key}
//                       className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                     >
//                       {displayValue}
//                       <button
//                         onClick={() => updateFilter(key as keyof ProgressFilters, undefined)}
//                         className="ml-1 text-blue-600 hover:text-blue-800"
//                       >
//                         <X size={12} />
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProgressManagement;


// pages/Progress/ProgressManagement.tsx - Enhanced progress tracking with role-based views
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Award,
  Filter,
  Download,
  Search,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Building,
  GitBranch,
  User,
  FileText,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';

interface ProgressData {
  userId: number;
  userName: string;
  userEmail: string;
  branchId?: number;
  branchName?: string;
  teamId?: number;
  teamName?: string;
  role: string;
  discipline: string;
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  totalOverdue: number;
  completionRate: number;
  averageScore: number;
  timeSpent: number; // hours
  lastActivity: string;
  recentSequences: SequenceProgress[];
  upcomingDeadlines: AssessmentDeadline[];
}

interface SequenceProgress {
  sequenceId: number;
  sequenceTitle: string;
  completedHuddles: number;
  totalHuddles: number;
  lastAccessed: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

interface AssessmentDeadline {
  assessmentId: number;
  assessmentTitle: string;
  huddleTitle: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  attempts: number;
  maxAttempts: number;
}

interface BranchAnalytics {
  branchId: number;
  branchName: string;
  totalUsers: number;
  averageCompletion: number;
  topPerformers: string[];
  strugglingUsers: string[];
  trendsData: { month: string; completion: number }[];
}

interface TeamAnalytics {
  teamId: number;
  teamName: string;
  branchName: string;
  memberCount: number;
  averageCompletion: number;
  averageScore: number;
  recentActivity: number;
  topSequences: { title: string; completion: number }[];
}

const ProgressManagement: React.FC = () => {
  // const { user, currentAgency } = useAuth();
  const { activeRole, capabilities, dataContext } = useActiveRole();
  const [viewLevel, setViewLevel] = useState<'AGENCY' | 'BRANCH' | 'TEAM' | 'USER'>('USER');
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TRACK' | 'STRUGGLING' | 'COMPLETED'>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  // Mock data - in production this would come from API based on role and access
  const mockProgressData: ProgressData[] = [
    {
      userId: 1,
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@healthcare.com',
      branchId: 1,
      branchName: 'North Branch',
      teamId: 1,
      teamName: 'Home Health Team A',
      role: 'FIELD_CLINICIAN',
      discipline: 'NURSING',
      totalAssigned: 12,
      totalCompleted: 9,
      totalInProgress: 2,
      totalOverdue: 1,
      completionRate: 75,
      averageScore: 89,
      timeSpent: 15.5,
      lastActivity: '2024-01-08T14:30:00Z',
      recentSequences: [
        { sequenceId: 1, sequenceTitle: 'Pain Management', completedHuddles: 4, totalHuddles: 5, lastAccessed: '2024-01-08T14:30:00Z', status: 'IN_PROGRESS' },
        { sequenceId: 2, sequenceTitle: 'Wound Care', completedHuddles: 6, totalHuddles: 6, lastAccessed: '2024-01-07T10:15:00Z', status: 'COMPLETED' }
      ],
      upcomingDeadlines: [
        { assessmentId: 1, assessmentTitle: 'Pain Assessment Quiz', huddleTitle: 'Pain Management Module 5', dueDate: '2024-01-15', status: 'PENDING', attempts: 0, maxAttempts: 3 }
      ]
    },
    {
      userId: 2,
      userName: 'Michael Chen',
      userEmail: 'michael.c@healthcare.com',
      branchId: 1,
      branchName: 'North Branch',
      teamId: 2,
      teamName: 'PT/OT Team',
      role: 'FIELD_CLINICIAN',
      discipline: 'PHYSICAL_THERAPY',
      totalAssigned: 8,
      totalCompleted: 8,
      totalInProgress: 0,
      totalOverdue: 0,
      completionRate: 100,
      averageScore: 94,
      timeSpent: 12.3,
      lastActivity: '2024-01-08T16:45:00Z',
      recentSequences: [
        { sequenceId: 3, sequenceTitle: 'Mobility Assessment', completedHuddles: 4, totalHuddles: 4, lastAccessed: '2024-01-08T16:45:00Z', status: 'COMPLETED' }
      ],
      upcomingDeadlines: []
    },
    {
      userId: 3,
      userName: 'Emily Rodriguez',
      userEmail: 'emily.r@healthcare.com',
      branchId: 2,
      branchName: 'South Branch',
      teamId: 3,
      teamName: 'Wound Care Specialists',
      role: 'CLINICAL_MANAGER',
      discipline: 'NURSING',
      totalAssigned: 15,
      totalCompleted: 11,
      totalInProgress: 3,
      totalOverdue: 1,
      completionRate: 73,
      averageScore: 85,
      timeSpent: 22.1,
      lastActivity: '2024-01-08T11:20:00Z',
      recentSequences: [
        { sequenceId: 2, sequenceTitle: 'Advanced Wound Care', completedHuddles: 5, totalHuddles: 8, lastAccessed: '2024-01-08T11:20:00Z', status: 'IN_PROGRESS' }
      ],
      upcomingDeadlines: [
        { assessmentId: 2, assessmentTitle: 'Wound Care Practical', huddleTitle: 'Advanced Techniques', dueDate: '2024-01-12', status: 'OVERDUE', attempts: 1, maxAttempts: 2 }
      ]
    }
  ];

  const mockBranchAnalytics: BranchAnalytics[] = [
    {
      branchId: 1,
      branchName: 'North Branch',
      totalUsers: 28,
      averageCompletion: 82,
      topPerformers: ['Michael Chen', 'Sarah Johnson', 'Lisa Wang'],
      strugglingUsers: ['John Davis', 'Amy Wilson'],
      trendsData: [
        { month: 'Oct', completion: 75 },
        { month: 'Nov', completion: 78 },
        { month: 'Dec', completion: 80 },
        { month: 'Jan', completion: 82 }
      ]
    },
    {
      branchId: 2,
      branchName: 'South Branch',
      totalUsers: 22,
      averageCompletion: 78,
      topPerformers: ['Maria Garcia', 'David Kim', 'Rachel Brown'],
      strugglingUsers: ['Tom Anderson'],
      trendsData: [
        { month: 'Oct', completion: 72 },
        { month: 'Nov', completion: 74 },
        { month: 'Dec', completion: 76 },
        { month: 'Jan', completion: 78 }
      ]
    }
  ];

  const mockTeamAnalytics: TeamAnalytics[] = [
    {
      teamId: 1,
      teamName: 'Home Health Team A',
      branchName: 'North Branch',
      memberCount: 8,
      averageCompletion: 85,
      averageScore: 88,
      recentActivity: 95,
      topSequences: [
        { title: 'Pain Management', completion: 92 },
        { title: 'Medication Safety', completion: 87 },
        { title: 'HIPAA Compliance', completion: 83 }
      ]
    },
    {
      teamId: 2,
      teamName: 'PT/OT Team',
      branchName: 'North Branch',
      memberCount: 6,
      averageCompletion: 91,
      averageScore: 92,
      recentActivity: 88,
      topSequences: [
        { title: 'Mobility Assessment', completion: 95 },
        { title: 'Fall Prevention', completion: 89 },
        { title: 'Therapy Protocols', completion: 87 }
      ]
    }
  ];

  // Determine available view levels based on role
  const availableViewLevels = useMemo(() => {
    const levels = ['USER'];
    if (capabilities.canViewTeamAnalytics) levels.unshift('TEAM');
    if (capabilities.canViewBranchAnalytics) levels.unshift('BRANCH');
    if (capabilities.canViewAgencyAnalytics) levels.unshift('AGENCY');
    return levels as Array<'AGENCY' | 'BRANCH' | 'TEAM' | 'USER'>;
  }, [capabilities]);

  // Filter data based on access scope and current view
  const filteredProgressData = useMemo(() => {
    let filtered = mockProgressData;

    // Apply access scope filtering
    if (dataContext.accessScope === 'BRANCH' && dataContext.branchIds.length > 0) {
      filtered = filtered.filter(p => p.branchId && dataContext.branchIds.includes(p.branchId));
    } else if (dataContext.accessScope === 'TEAM' && dataContext.teamIds.length > 0) {
      filtered = filtered.filter(p => p.teamId && dataContext.teamIds.includes(p.teamId));
    }

    // Apply view level filtering
    if (viewLevel === 'BRANCH' && selectedBranch) {
      filtered = filtered.filter(p => p.branchId === selectedBranch);
    } else if (viewLevel === 'TEAM' && selectedTeam) {
      filtered = filtered.filter(p => p.teamId === selectedTeam);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => {
        switch (statusFilter) {
          case 'ON_TRACK':
            return p.completionRate >= 80 && p.totalOverdue === 0;
          case 'STRUGGLING':
            return p.completionRate < 70 || p.totalOverdue > 0;
          case 'COMPLETED':
            return p.completionRate === 100;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [mockProgressData, dataContext, viewLevel, selectedBranch, selectedTeam, searchTerm, statusFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (filteredProgressData.length === 0) {
      return {
        totalUsers: 0,
        averageCompletion: 0,
        averageScore: 0,
        totalHoursSpent: 0,
        strugglingUsers: 0,
        onTrackUsers: 0
      };
    }

    const totalUsers = filteredProgressData.length;
    const averageCompletion = Math.round(
      filteredProgressData.reduce((sum, p) => sum + p.completionRate, 0) / totalUsers
    );
    const averageScore = Math.round(
      filteredProgressData.reduce((sum, p) => sum + p.averageScore, 0) / totalUsers
    );
    const totalHoursSpent = filteredProgressData.reduce((sum, p) => sum + p.timeSpent, 0);
    const strugglingUsers = filteredProgressData.filter(p => p.completionRate < 70 || p.totalOverdue > 0).length;
    const onTrackUsers = filteredProgressData.filter(p => p.completionRate >= 80 && p.totalOverdue === 0).length;

    return {
      totalUsers,
      averageCompletion,
      averageScore,
      totalHoursSpent: Math.round(totalHoursSpent * 10) / 10,
      strugglingUsers,
      onTrackUsers
    };
  }, [filteredProgressData]);

  const getStatusColor = (completionRate: number, overdue: number) => {
    if (overdue > 0) return 'text-red-600 bg-red-100';
    if (completionRate >= 90) return 'text-green-600 bg-green-100';
    if (completionRate >= 70) return 'text-blue-600 bg-blue-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStatusLabel = (completionRate: number, overdue: number) => {
    if (overdue > 0) return 'Needs Attention';
    if (completionRate >= 90) return 'Excellent';
    if (completionRate >= 70) return 'On Track';
    return 'Struggling';
  };

  const renderAgencyView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockBranchAnalytics.map((branch) => (
          <div key={branch.branchId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{branch.branchName}</h3>
              <button
                onClick={() => {
                  setViewLevel('BRANCH');
                  setSelectedBranch(branch.branchId);
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                View Details →
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">{branch.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900">{branch.averageCompletion}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-1">Top Performers</p>
                <p className="text-sm text-green-600">{branch.topPerformers.slice(0, 2).join(', ')}</p>
              </div>
              {branch.strugglingUsers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Needs Support</p>
                  <p className="text-sm text-orange-600">{branch.strugglingUsers.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBranchView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTeamAnalytics
          .filter(team => !selectedBranch || team.branchName === mockBranchAnalytics.find(b => b.branchId === selectedBranch)?.branchName)
          .map((team) => (
          <div key={team.teamId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{team.teamName}</h3>
              <button
                onClick={() => {
                  setViewLevel('TEAM');
                  setSelectedTeam(team.teamId);
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                View Details →
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-xl font-bold text-gray-900">{team.memberCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-xl font-bold text-gray-900">{team.averageCompletion}%</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-600">Top Sequences</p>
              {team.topSequences.slice(0, 2).map((seq, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{seq.title}</span>
                  <span className="text-green-600">{seq.completion}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserTable = () => (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Individual Progress ({filteredProgressData.length} users)
        </h3>
      </div>

      {filteredProgressData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team/Role
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
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProgressData.map((progress) => (
                <tr key={progress.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{progress.userName}</div>
                        <div className="text-sm text-gray-500">{progress.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{progress.teamName || 'No Team'}</div>
                    <div className="text-sm text-gray-500">
                      {progress.role.replace('_', ' ')} • {progress.discipline}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${progress.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{progress.completionRate}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progress.totalCompleted}/{progress.totalAssigned} completed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{progress.averageScore}% avg</div>
                    <div className="text-xs text-gray-500">{progress.timeSpent}h spent</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(progress.completionRate, progress.totalOverdue)
                    }`}>
                      {getStatusLabel(progress.completionRate, progress.totalOverdue)}
                    </span>
                    {progress.totalOverdue > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {progress.totalOverdue} overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(progress.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/progress/user/${progress.userId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your filters to see more results.'
              : 'Progress data will appear here as users complete huddles.'}
          </p>
        </div>
      )}
    </div>
  );

  if (!capabilities.canViewUserProgress && !capabilities.canViewOwnProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view progress data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track learning progress across your {dataContext.accessScope?.toLowerCase() || 'organization'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* View Level Selector */}
      {availableViewLevels.length > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">View Level:</span>
            <div className="flex items-center space-x-2">
              {availableViewLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setViewLevel(level);
                    if (level !== 'BRANCH') setSelectedBranch(null);
                    if (level !== 'TEAM') setSelectedTeam(null);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewLevel === level 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {level === 'AGENCY' && <Building className="h-4 w-4 mr-1 inline" />}
                  {level === 'BRANCH' && <GitBranch className="h-4 w-4 mr-1 inline" />}
                  {level === 'TEAM' && <Users className="h-4 w-4 mr-1 inline" />}
                  {level === 'USER' && <User className="h-4 w-4 mr-1 inline" />}
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.averageCompletion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalHoursSpent}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters (for USER view) */}
      {viewLevel === 'USER' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ON_TRACK">On Track</option>
              <option value="STRUGGLING">Struggling</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="QUARTER">This Quarter</option>
              <option value="YEAR">This Year</option>
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {summaryStats.onTrackUsers} on track, {summaryStats.strugglingUsers} struggling
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view level */}
      {viewLevel === 'AGENCY' && renderAgencyView()}
      {viewLevel === 'BRANCH' && renderBranchView()}
      {(viewLevel === 'TEAM' || viewLevel === 'USER') && renderUserTable()}
    </div>
  );
};

export default ProgressManagement;