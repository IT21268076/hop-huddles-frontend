// pages/auth/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { BookOpen, Users, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/Auth0Context';
import { apiClient } from '../../services/api';

export const LoginPage: React.FC = () => {
  const { loginWithRedirect } = useAuth();
  const [email, setEmail] = useState('');
  const [isValidatingInvitation, setIsValidatingInvitation] = useState(false);
  const [invitationError, setInvitationError] = useState('');

  // Check for invitation token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationToken = urlParams.get('invitation');
    
    if (invitationToken) {
      validateInvitation(invitationToken);
    }
  }, []);

  const validateInvitation = async (token: string) => {
    try {
      setIsValidatingInvitation(true);
      const validation = await apiClient.validateInvitation(token);
      
      if (validation.isValid) {
        setEmail(validation.email);
        // Store invitation info for after login
        localStorage.setItem('pendingInvitation', JSON.stringify({
          token,
          email: validation.email,
          agencyName: validation.agencyName,
          roleName: validation.roleName,
        }));
      } else {
        setInvitationError('This invitation is invalid or has expired.');
      }
    } catch (error) {
      setInvitationError('Failed to validate invitation. Please contact your administrator.');
    } finally {
      setIsValidatingInvitation(false);
    }
  };

  const handleLogin = async () => {
    const pendingInvitation = localStorage.getItem('pendingInvitation');
    
    try {
      if (pendingInvitation) {
        const invitation = JSON.parse(pendingInvitation);
        // Pass email as login hint to Auth0
        await loginWithRedirect({
          authorizationParams: {
            login_hint: invitation.email,
          }
        });
      } else if (email) {
        await loginWithRedirect({
          authorizationParams: {
            login_hint: email,
          }
        });
      } else {
        await loginWithRedirect();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'AI-Powered Huddles',
      description: 'Personalized micro-learning content tailored to your role and discipline'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Organize users by branches and teams with role-based access control'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track learning progress and compliance across your organization'
    },
    {
      icon: Shield,
      title: 'Compliance Ready',
      description: 'Stay up-to-date with CMS guidelines and healthcare regulations'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding & Features */}
        <div className="lg:w-1/2 px-8 py-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto lg:max-w-lg">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">HOP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Huddles</h1>
                <p className="text-sm text-gray-600">AI-Powered Healthcare Education</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to the Future of Healthcare Training
              </h2>
              <p className="text-lg text-gray-600">
                Transform your team's learning experience with personalized, AI-generated micro-education content.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 bg-white px-8 py-12 lg:px-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Invitation Validation */}
            {isValidatingInvitation && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">Validating your invitation...</p>
              </div>
            )}

            {/* Invitation Error */}
            {invitationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{invitationError}</p>
              </div>
            )}

            {/* Login Form */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h3>
              <p className="text-gray-600">
                Enter your email address to continue to HOP Huddles
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@agency.com"
                disabled={isValidatingInvitation}
              />

              <Button
                onClick={handleLogin}
                className="w-full"
                size="lg"
                disabled={isValidatingInvitation}
              >
                {isValidatingInvitation ? 'Validating...' : 'Continue with Auth0'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Secure authentication powered by Auth0
                </p>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Need help?</h4>
              <p className="text-sm text-gray-600">
                If you were invited to join an agency, make sure to use the email address 
                that received the invitation. Contact your administrator if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};