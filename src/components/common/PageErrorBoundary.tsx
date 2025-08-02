// components/common/PageErrorBoundary.tsx
import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ErrorBoundary } from './ErrorBoundary';

interface PageErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export const PageErrorFallback: React.FC<PageErrorFallbackProps> = ({
  error,
  resetError,
  title = "Page Error",
  description = "Something went wrong while loading this page.",
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={handleRefresh}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <div className="p-3 bg-gray-100 rounded">
              <div className="text-xs font-mono text-red-600 break-all">
                <div className="font-semibold">Message:</div>
                <div className="mb-2">{error.message}</div>
                
                {error.stack && (
                  <>
                    <div className="font-semibold">Stack:</div>
                    <pre className="whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </details>
        )}
      </Card>
    </div>
  );
};

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <PageErrorFallback
          title={title}
          description={description}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};