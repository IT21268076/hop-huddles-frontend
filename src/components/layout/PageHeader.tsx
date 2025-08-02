// components/layout/PageHeader.tsx
import React from 'react';
import { Button } from '../ui/Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  } | React.ReactNode; // Allow JSX elements
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  rightContent?: React.ReactNode; // Alternative to action
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  action,
  secondaryAction,
  rightContent,
  breadcrumbs,
}) => {
  const displayDescription = subtitle || description;
  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="text-gray-400 mx-2">/</span>
                )}
                {breadcrumb.href ? (
                  <a
                    href={breadcrumb.href}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {breadcrumb.label}
                  </a>
                ) : (
                  <span className="text-sm text-gray-900 font-medium">
                    {breadcrumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {displayDescription && (
            <p className="mt-2 text-gray-600">{displayDescription}</p>
          )}
        </div>
        
        {(action || secondaryAction || rightContent) && (
          <div className="flex space-x-3">
            {rightContent && rightContent}
            {!rightContent && secondaryAction && (
              <Button 
                variant="outline"
                onClick={secondaryAction.onClick} 
                className="flex items-center"
              >
                {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </Button>
            )}
            {!rightContent && action && (
              typeof action === 'object' && 'onClick' in action ? (
                <Button onClick={action.onClick} className="flex items-center">
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ) : (
                action
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};