// pages/MainPlatform/Homepage.tsx - Enhanced role-aware main platform homepage
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
  Shield,
  Clock,
  Target,
  Award,
  BarChart3,
  Plus,
  User,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveRole } from '../../hooks/useActiveRole';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import RoleSwitcher from '../../components/Common/RoleSwitcher';
import EducatorDashboard from '../../components/Dashboard/EducatorDashboard';
import DirectorDashboard from '../../components/Dashboard/DirectorDashboard';
import ClinicianDashboard from '../../components/Dashboard/ClinicianDashboard';
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
  badge?: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  permission?: string;
  roles?: string[];
}

const MainPlatformHomepage: React.FC = () => {
  const { user, currentAgency, getUserAgencyStatus } = useAuth();
  const { activeRole, capabilities, roleBasedData } = useActiveRole();
  const navigate = useNavigate();
  const [needsAgencySetup, setNeedsAgencySetup] = useState(false);
  const [checkingAgencyStatus, setCheckingAgencyStatus] = useState(true);
  const [viewMode, setViewMode] = useState<'platform' | 'dashboard'>('platform');

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

  // Platform cards with role-based filtering
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

  // Filter platform cards based on role and permissions
  const availablePlatformCards = platformCards.filter(card => {
    if (card.requiredPermission && user) {
      return hasPermission(user.assignments, card.requiredPermission);
    }
    return true;
  });

  // Role-based quick actions
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (capabilities.showEducatorFeatures) {
      actions.push(
        {
          title: 'Create Sequence',
          description: 'Build new educational content',
          href: '/sequences/create',
          icon: Plus,
          color: 'text-white',
          bgColor: 'bg-blue-600',
          permission: PERMISSIONS.HUDDLE_CREATE
        },
        {
          title: 'Manage Content',
          description: 'Review and publish sequences',
          href: '/sequences',
          icon: BookOpen,
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          permission: PERMISSIONS.HUDDLE_VIEW
        }
      );
    }

    if (capabilities.showAdminFeatures || capabilities.showManagerFeatures) {
      actions.push(
        {
          title: 'Manage Users',
          description: 'Add and organize team members',
          href: '/users',
          icon: Users,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          permission: PERMISSIONS.USER_VIEW
        }
      );
    }

    if (capabilities.canViewUserProgress) {
      actions.push(
        {
          title: 'View Analytics',
          description: 'Track learning progress',
          href: '/progress',
          icon: BarChart3,
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
          permission: PERMISSIONS.PROGRESS_VIEW_OWN
        }
      );
    }

    if (capabilities.showClinicianFeatures) {
      actions.push(
        {
          title: 'My Learning',
          description: 'Continue your education',
          href: '/my-huddles',
          icon: PlayCircle,
          color: 'text-blue-700',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Take Assessment',
          description: 'Complete pending assessments',
          href: '/my-assessments',
          icon: CheckCircle,
          color: 'text-green-700',
          bgColor: 'bg-green-100'
        }
      );
    }

    return actions.filter(action => {
      if (action.permission && user) {
        return hasPermission(user.assignments, action.permission);
      }
      return true;
    });
  };

  const quickActions = getQuickActions();

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

  const getDashboardGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const name = user?.name?.split(' ')[0] || 'there';
    return `${greeting}, ${name}!`;
  };

  const renderRoleSpecificDashboard = () => {
    switch (roleBasedData.defaultDashboardView) {
      case 'EDUCATOR':
        return <EducatorDashboard />;
      case 'MANAGER':
        return activeRole === 'DIRECTOR' ? <DirectorDashboard /> : <DirectorDashboard />;
      case 'CLINICIAN':
        return <ClinicianDashboard />;
      default:
        return <EducatorDashboard />; // Fallback to admin-like view
    }
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
            Welcome to your HOP Platform! • {currentAgency?.name || 'Your Agency'}
          </h1>
          
          <p className="text-gray-600 mb-8">
            To get started, please set up your agency. This will enable access to all platform features.
          </p>
          
          <button
            onClick={handleAgencySetupClick}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Settings className="mr-2 h-5 w-5" />
            Set Up Agency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getDashboardGreeting()}
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to your HOP Platform • {currentAgency?.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('platform')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'platform' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Platform View
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard View
              </button>
            </div>

            {/* Role Switcher */}
            {activeRole && (
              <div className="hidden sm:block">
                <RoleSwitcher variant="header" />
              </div>
            )}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'dashboard' ? (
          // Role-specific dashboard
          renderRoleSpecificDashboard()
        ) : (
          // Platform view
          <div className="space-y-8">
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const isPrimary = index === 0;
                    
                    return (
                      <button
                        key={action.title}
                        onClick={() => navigate(action.href)}
                        className={`p-4 rounded-lg border-2 border-transparent hover:border-gray-200 transition-all text-left ${
                          isPrimary ? action.bgColor : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${isPrimary ? 'bg-blue-700' : action.bgColor}`}>
                            <Icon className={`h-5 w-5 ${isPrimary ? 'text-white' : action.color}`} />
                          </div>
                          <h3 className={`font-medium ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
                            {action.title}
                          </h3>
                        </div>
                        <p className={`text-sm ${isPrimary ? 'text-blue-100' : 'text-gray-600'}`}>
                          {action.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Platform Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Platforms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlatformCards.map((card) => {
                  const Icon = card.icon;
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`relative bg-white p-6 rounded-xl border-2 ${card.borderColor} hover:shadow-lg transition-all duration-200 text-left group ${
                        card.isComingSoon ? 'opacity-75' : 'hover:scale-105'
                      }`}
                    >
                      <div className={`inline-flex p-3 ${card.bgColor} rounded-lg mb-4`}>
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                        {card.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {card.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${card.color}`}>
                          {card.isComingSoon ? 'Coming Soon' : 'Access Platform'}
                        </span>
                        <ChevronRight className={`h-4 w-4 ${card.color} group-hover:translate-x-1 transition-transform`} />
                      </div>
                      
                      {card.isComingSoon && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Soon
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role-specific information panel */}
            {activeRole && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Role: {activeRole.replace('_', ' ')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Access Level</h3>
                    <p className="text-gray-600">{capabilities.accessScope?.toLowerCase() || 'Limited'} access</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Actions</h3>
                    <p className="text-gray-600">
                      {roleBasedData.primaryActions.slice(0, 2).join(', ')}
                      {roleBasedData.primaryActions.length > 2 && '...'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Platform Features</h3>
                    <p className="text-gray-600">
                      {[
                        capabilities.showEducatorFeatures && 'Content Creation',
                        capabilities.showAdminFeatures && 'Administration',
                        capabilities.showManagerFeatures && 'Team Management',
                        capabilities.showClinicianFeatures && 'Learning'
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPlatformHomepage;