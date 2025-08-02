// components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send error to monitoring service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Something went wrong
                </h2>
                
                <p className="text-sm text-gray-500 mb-6">
                  We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="flex-1"
                  >
                    Reload Page
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {this.props.showDetails && this.state.error && (
                  <details className="mt-6 w-full">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                      Error Details (for developers)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-left">
                      <div className="text-xs font-mono text-red-600 break-all">
                        <div className="font-semibold">Error:</div>
                        <div className="mb-2">{this.state.error.message}</div>
                        
                        {this.state.error.stack && (
                          <>
                            <div className="font-semibold">Stack Trace:</div>
                            <pre className="whitespace-pre-wrap text-xs">
                              {this.state.error.stack}
                            </pre>
                          </>
                        )}
                        
                        {this.state.errorInfo?.componentStack && (
                          <>
                            <div className="font-semibold mt-2">Component Stack:</div>
                            <pre className="whitespace-pre-wrap text-xs">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Error handled by useErrorHandler:', error, errorInfo);
    
    // In a real app, you might want to show a toast notification
    // or send the error to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service
    }
  };
};