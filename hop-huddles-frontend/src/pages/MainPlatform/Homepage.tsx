// pages/MainPlatform/Homepage.tsx - Main platform homepage with platform cards
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  PlayCircle, 
  TrendingUp, 
  Building, 
  Settings,
  ChevronRight,
  Sparkles,
  Heart,
  Activity,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

interface PlatformCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isComingSoon?: boolean;
  requiredPermission?: string;
}

const platformCards: PlatformCard[] = [
  {
    id: 'hop-huddles',
    title: 'HOP Huddles',
    description: 'Micro-education platform for healthcare professionals. Create, manage, and track educational content.',
    icon: PlayCircle,
    route: '/hop-huddles-dashboard',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    requiredPermission: PERMISSIONS.HUDDLE_VIEW
  },
  {
    id: 'hop-care',
    title: 'HOP Care',
    description: 'Comprehensive care management system for coordinating patient care across your organization.',
    icon: Heart,
    route: '/hop-care-dashboard',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    isComingSoon: true
  },
  {
    id: 'hop-analytics',
    title: 'HOP Analytics',
    description: 'Advanced analytics and reporting platform for data-driven insights and decision making.',
    icon: TrendingUp,
    route: '/hop-analytics-dashboard',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    isComingSoon: true
  },
  {
    id: 'hop-compliance',
    title: 'HOP Compliance',
    description: 'Compliance management and regulatory tracking system for healthcare organizations.',
    icon: Shield,
    route: '/hop-compliance-dashboard',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    isComingSoon: true
  },
  {
    id: 'hop-connect',
    title: 'HOP Connect',
    description: 'Communication and collaboration platform connecting healthcare teams and stakeholders.',
    icon: Users,
    route: '/hop-connect-dashboard',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    isComingSoon: true
  },
  {
    id: 'hop-wellness',
    title: 'HOP Wellness',
    description: 'Employee wellness and engagement platform promoting work-life balance and team health.',
    icon: Activity,
    route: '/hop-wellness-dashboard',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    isComingSoon: true
  }
];

const MainPlatformHomepage: React.FC = () => {
  const { user, currentAgency, getUserAgencyStatus } = useAuth();
  const navigate = useNavigate();
  const [needsAgencySetup, setNeedsAgencySetup] = useState(false);
  const [checkingAgencyStatus, setCheckingAgencyStatus] = useState(true);

  useEffect(() => {
    const checkAgencyRegistration = async () => {
      if (!user) return;
      
      try {
        const agencyStatus = await getUserAgencyStatus(user.userId);
        
        if (!agencyStatus.hasRegisteredAgency) {
          setNeedsAgencySetup(true);
        }
      } catch (error) {
        console.error('Error checking agency status:', error);
        toast.error('Failed to check agency status');
      } finally {
        setCheckingAgencyStatus(false);
      }
    };

    checkAgencyRegistration();
  }, [user, getUserAgencyStatus]);

  const handleCardClick = (card: PlatformCard) => {
    if (card.isComingSoon) {
      toast.success('This platform is coming soon! Stay tuned for updates.', {
        duration: 3000,
        icon: '🚀'
      });
      return;
    }

    // Check permissions if required
    if (card.requiredPermission && user) {
      const hasAccess = hasPermission(user.assignments, card.requiredPermission);
      if (!hasAccess) {
        toast.error('You do not have permission to access this platform');
        return;
      }
    }

    navigate(card.route);
  };

  const handleAgencySetupClick = () => {
    navigate('/agency-wizard');
  };

  if (checkingAgencyStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show agency setup wizard if needed
  if (needsAgencySetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to HOP Platform!
          </h1>
          
          <p className="text-gray-600 mb-8">
            To get started, please set up your agency. This will enable access to all platform features.
          </p>
          
          <button
            onClick={handleAgencySetupClick}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Set Up Agency
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  const filteredCards = platformCards.filter(card => {
    if (!card.requiredPermission) return true;
    return user ? hasPermission(user.assignments, card.requiredPermission) : false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">HOP Platform</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{currentAgency?.name}</p>
              </div>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Choose a platform to continue your work with {currentAgency?.name}
          </p>
        </div>

        {/* Agency Info Card */}
        {currentAgency && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentAgency.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{currentAgency.agencyType.replace('_', ' ')}</span>
                  {currentAgency.ccn && <span>CCN: {currentAgency.ccn}</span>}
                  <span className="capitalize">{currentAgency.subscriptionPlan} Plan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`
                  relative bg-white rounded-lg border-2 ${card.borderColor} p-6 cursor-pointer
                  transition-all duration-200 hover:shadow-lg hover:scale-105
                  ${card.isComingSoon ? 'opacity-75' : ''}
                `}
              >
                {card.isComingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className={`${card.bgColor} rounded-lg p-3 w-fit mb-4`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {card.description}
                </p>
                
                <div className="flex items-center text-sm font-medium text-blue-600">
                  {card.isComingSoon ? 'Learn More' : 'Open Platform'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainPlatformHomepage;