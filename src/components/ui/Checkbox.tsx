// components/ui/Checkbox.tsx
import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helper?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  helper,
  className,
  id,
  onChange,
  checked,
  ...props
}, ref) => {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <div className="relative">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className={cn(
              'h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
              error && 'border-red-300 focus:ring-red-500',
              'sr-only'
            )}
            {...props}
          />
          <div
            className={cn(
              'h-4 w-4 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer transition-colors',
              checked && 'bg-blue-600 border-blue-600',
              error && 'border-red-300',
              className
            )}
            onClick={() => onChange?.(!checked)}
          >
            {checked && (
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helper && !error && <p className="text-sm text-gray-500">{helper}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';