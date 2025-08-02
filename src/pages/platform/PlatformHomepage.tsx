import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Award, 
  Calendar, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/Auth0Context';
import { isSuperAdmin } from '../../utils/helpers';

interface PlatformCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  comingSoon?: boolean;
  featured?: boolean;
}

const platformCards: PlatformCard[] = [
  {
    id: 'hop-huddles',
    title: 'HOP Huddles',
    description: 'AI-powered micro-education platform for healthcare teams',
    icon: BookOpen,
    route: '/dashboard',
    featured: true,
  },
  {
    id: 'team-chat',
    title: 'Orientation',
    description: 'Test description for orientation Test description for orientation',
    icon: MessageSquare,
    route: '/communication',
    comingSoon: true,
  },
  {
    id: 'quality-metrics',
    title: 'HOP A3',
    description: 'Test description for orientation Test description for orientation',
    icon: BarChart3,
    route: '/quality',
    comingSoon: true,
  },
  {
    id: 'compliance',
    title: 'Test',
    description: 'Test description for orientation Test description for orientation',
    icon: Award,
    route: '/compliance',
    comingSoon: true,
  },
  {
    id: 'scheduling',
    title: 'Test ',
    description: 'Test description for orientation Test description for orientation',
    icon: Calendar,
    route: '/scheduling',
    comingSoon: true,
  },
  {
    id: 'workforce',
    title: 'Test',
    description: 'Test description for orientation Test description for orientation',
    icon: Users,
    route: '/workforce',
    comingSoon: true,
  },
];

export const PlatformHomepage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentAgency } = useApp();
  const { user } = useAuth();

  const handleCardClick = (card: PlatformCard) => {
    console.log('Card clicked:', card.title, 'Route:', card.route);
    if (card.comingSoon) {
      console.log('Card is coming soon, not navigating');
      return;
    }
    
    // Special handling for superadmin - redirect to superadmin dashboard
    if (isSuperAdmin(currentUser, user) && card.route === '/dashboard') {
      console.log('Redirecting superadmin to superadmin dashboard');
      navigate('/superadmin');
      return;
    }
    
    console.log('Navigating to:', card.route);
    try {
      navigate(card.route);
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback: try to navigate anyway
      window.location.href = card.route;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Healthcare Platform
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Hello, {user?.name || currentUser?.name}!
          </p>
          
          <p className="text-lg text-gray-500">
            {currentAgency?.name} • Comprehensive Healthcare Solutions
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {platformCards.map((card) => (
            <Card
              key={card.id}
              className={`relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                card.featured 
                  ? 'ring-2 ring-blue-600 bg-gradient-to-br from-blue-50 to-purple-50' 
                  : ''
              } ${
                card.comingSoon 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
              }`}
              onClick={() => handleCardClick(card)}
            >
              {/* Coming Soon Badge */}
              {card.comingSoon && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Featured Badge */}
              {card.featured && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Available Now
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    card.featured 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                  </div>
                  {!card.comingSoon && (
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>

                {card.featured && !card.comingSoon && (
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={(e) => {
                      console.log('Get Started button clicked for:', card.title);
                      e.stopPropagation();
                      handleCardClick(card);
                    }}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Agency at a Glance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-500">Huddles Completed</div>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-500">Assessments Passed</div>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">--%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Transform Your Team's Learning?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start with HOP Huddles to deliver personalized, AI-powered micro-education 
              that adapts to each team member's role and discipline.
            </p>
            <Button 
              onClick={() => {
                console.log('Launch HOP Huddles button clicked');
                // Special handling for superadmin - redirect to superadmin dashboard
                if (isSuperAdmin(currentUser, user)) {
                  console.log('Redirecting superadmin to superadmin dashboard');
                  try {
                    navigate('/superadmin');
                  } catch (error) {
                    console.error('Navigation failed:', error);
                    window.location.href = '/superadmin';
                  }
                } else {
                  try {
                    navigate('/dashboard');
                  } catch (error) {
                    console.error('Navigation failed:', error);
                    window.location.href = '/dashboard';
                  }
                }
              }}
              className="bg-white text-blue-600 hover:bg-gray-100"
              size="lg"
            >
              Launch HOP Huddles
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            {/* Test button for debugging */}
            {isSuperAdmin(currentUser, user) && (
              <Button 
                onClick={() => {
                  console.log('Test button: Direct navigation to /superadmin');
                  navigate('/superadmin');
                }}
                className="bg-red-600 text-white hover:bg-red-700 mt-4"
                size="sm"
              >
                Test Direct Navigation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};