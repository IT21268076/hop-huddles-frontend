// pages/Auth/LoginPage.tsx - Enhanced with invitation system integration
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingInvitation, setCheckingInvitation] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<{
    checked: boolean;
    isInvited: boolean;
    agencyName?: string;
    invitedBy?: string;
    role?: string;
  }>({ checked: false, isInvited: false });

  const { login, isAuthenticated, checkUserInvitation } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>();

  const watchedEmail = watch('email');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/main-platform" />;
  }

  const handleEmailBlur = async () => {
    const email = watchedEmail?.trim();
    if (!email || !email.includes('@')) return;

    setCheckingInvitation(true);
    try {
      const result = await checkUserInvitation(email);
      setInvitationStatus({
        checked: true,
        isInvited: result.isInvited,
        agencyName: result.agencyId ? 'Premier Healthcare Network' : undefined, // In production, get from agency lookup
        invitedBy: result.invitedBy,
        role: result.role
      });

      if (!result.isInvited) {
        toast.error('This email is not invited to the platform. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error checking invitation:', error);
      toast.error('Failed to verify invitation status');
    } finally {
      setCheckingInvitation(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    if (!invitationStatus.isInvited && invitationStatus.checked) {
      toast.error('Cannot login: User not invited to platform');
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/main-platform');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HOP Platform</h1>
          <p className="text-gray-600">Sign in to access your healthcare education platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  onBlur={handleEmailBlur}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.email ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Enter your work email"
                  disabled={isLoading}
                />
                
                {/* Invitation Status Indicator */}
                {checkingInvitation && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {invitationStatus.checked && !checkingInvitation && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {invitationStatus.isInvited ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              
              {/* Invitation Status Message */}
              {invitationStatus.checked && !checkingInvitation && (
                <div className={`mt-2 p-3 rounded-lg text-sm ${
                  invitationStatus.isInvited 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {invitationStatus.isInvited ? (
                    <div>
                      <p className="font-medium">✓ Invitation verified</p>
                      {invitationStatus.agencyName && (
                        <p className="text-xs mt-1">
                          Agency: {invitationStatus.agencyName} • Role: {invitationStatus.role}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">⚠ Not invited</p>
                      <p className="text-xs mt-1">Please contact your administrator for access</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`
                    w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (invitationStatus.checked && !invitationStatus.isInvited)}
              className={`
                w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isLoading || (invitationStatus.checked && !invitationStatus.isInvited)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Educator:</strong> educator@premierhealthcare.com / password</p>
              <p><strong>Admin:</strong> monika@premierhealthcare.com / password</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              system administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;