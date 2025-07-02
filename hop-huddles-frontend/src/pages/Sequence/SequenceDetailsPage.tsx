// // pages/Sequence/SequenceDetailPage.tsx - Main sequence details page
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from 'react-query';
// import { 
//   ArrowLeft, 
//   Edit3, 
//   Share2, 
//   MoreVertical,
//   Play,
//   Users,
//   Clock,
//   Target,
//   Zap
// } from 'lucide-react';
// import { apiClient } from '../../api/client';
// import { useAuth } from '../../contexts/AuthContext';
// import SequenceInfoCard from '../../components/Sequence/SequenceInfoCard';
// import type { HuddleSequence, Huddle } from '../../types';
// import { hasPermission, PERMISSIONS } from '../../utils/permissions';
// import SequenceMetricsCard from '../../components/Sequence/SequenceMetricsCard';
// import HuddleListCard from '../../components/Sequence/HuddleListCard';

// const SequenceDetailPage: React.FC = () => {
//   const { sequenceId } = useParams<{ sequenceId: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);
//   const [isHuddleModalOpen, setIsHuddleModalOpen] = useState(false);

//   // Fetch sequence details
//   const { data: sequence, isLoading, refetch } = useQuery(
//     ['sequence', sequenceId],
//     () => sequenceId ? apiClient.getSequence(parseInt(sequenceId)) : Promise.reject('No sequence ID'),
//     { enabled: !!sequenceId }
//   );

//   const canEditSequence = hasPermission(user?.assignments || [], PERMISSIONS.HUDDLE_UPDATE);

//   const handleEditSequence = () => {
//     setIsEditModalOpen(true);
//   };

//   const handleHuddleClick = (huddle: Huddle) => {
//     setSelectedHuddle(huddle);
//     setIsHuddleModalOpen(true);
//   };

//   const handleSequenceUpdated = () => {
//     refetch();
//     setIsEditModalOpen(false);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="relative">
//           <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
//           <div className="absolute inset-0 w-20 h-20 border-4 border-blue-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!sequence) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-center text-white">
//           <h2 className="text-2xl font-bold mb-4">Sequence Not Found</h2>
//           <button
//             onClick={() => navigate('/sequences')}
//             className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
//           >
//             Back to Sequences
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Header */}
//       <div className="relative z-10 border-b border-gray-800/50 backdrop-blur-xl bg-slate-900/30">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => navigate('/sequences')}
//                 className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
//               >
//                 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//                 <span className="text-sm font-medium">Back to Sequences</span>
//               </button>
              
//               <div className="h-6 w-px bg-gray-700"></div>
              
//               <div className="flex items-center space-x-3">
//                 <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
//                   <Zap size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-semibold text-white">{sequence.title}</h1>
//                   <p className="text-sm text-gray-400">{sequence.totalHuddles} huddles</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
//                 <Share2 size={18} />
//               </button>
              
//               {canEditSequence && (
//                 <button
//                   onClick={handleEditSequence}
//                   className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
//                 >
//                   <Edit3 size={16} />
//                   <span>Edit Sequence</span>
//                 </button>
//               )}
              
//               <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
//                 <MoreVertical size={18} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Sequence Info & Metrics */}
//           <div className="lg:col-span-1 space-y-6">
//             <SequenceInfoCard sequence={sequence} />
//             <SequenceMetricsCard sequence={sequence} />
//           </div>

//           {/* Right Column - Huddle List */}
//           <div className="lg:col-span-2">
//             <HuddleListCard 
//               sequence={sequence} 
//               onHuddleClick={handleHuddleClick}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {isEditModalOpen && (
//         <EditSequenceModal
//           sequence={sequence}
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           onSuccess={handleSequenceUpdated}
//         />
//       )}

//       {selectedHuddle && (
//         <HuddleDetailModal
//           huddle={selectedHuddle}
//           sequence={sequence}
//           isOpen={isHuddleModalOpen}
//           onClose={() => {
//             setIsHuddleModalOpen(false);
//             setSelectedHuddle(null);
//           }}
//         />
//       )}

//       {/* Custom Styles */}
//       <style>{`
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
        
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
        
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
        
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }

//         .animate-reverse {
//           animation-direction: reverse;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SequenceDetailPage;