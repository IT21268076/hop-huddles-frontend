// components/ui/MultiSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Badge } from './Badge';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  maxHeight?: string;
  required?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = "Select options...",
  options,
  value,
  onChange,
  error,
  disabled = false,
  maxHeight = "200px",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveOption = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            min-h-[42px] w-full rounded-md border px-3 py-2 cursor-pointer
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
              : 'bg-white border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
            }
            ${error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-wrap gap-1 min-h-[26px] items-center">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="default"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{option.label}</span>
                    {!disabled && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={(e) => handleRemoveOption(option.value, e)}
                      />
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">{placeholder}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              {selectedOptions.length > 0 && !disabled && (
                <X
                  className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={handleClearAll}
                />
              )}
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            
            <div className={`max-h-[${maxHeight}] overflow-y-auto`}>
              {filteredOptions.length > 0 ? (
                <div className="py-1">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => !option.disabled && handleToggleOption(option.value)}
                      className={`
                        px-3 py-2 cursor-pointer flex items-center justify-between text-sm
                        ${option.disabled 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'hover:bg-gray-50 text-gray-900'
                        }
                        ${value.includes(option.value) ? 'bg-blue-50' : ''}
                      `}
                    >
                      <span>{option.label}</span>
                      {value.includes(option.value) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              )}
            </div>
            
            {selectedOptions.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-600">
                  {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};