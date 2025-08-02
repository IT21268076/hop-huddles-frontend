// pages/agencies/CreateBranchForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { apiClient } from '../../services/api';
import { CreateBranchRequest, Discipline, CertificationType, CertificationDisplayNames } from '../../types';

interface CreateBranchFormProps {
  agencyId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Discipline options with display names
const disciplineOptions = [
  { value: 'RN', label: 'Registered Nurse (RN)' },
  { value: 'PT', label: 'Physical Therapist (PT)' },
  { value: 'OT', label: 'Occupational Therapist (OT)' },
  { value: 'SLP', label: 'Speech Language Pathologist (SLP)' },
  { value: 'MSW', label: 'Medical Social Worker (MSW)' },
  { value: 'LPN', label: 'Licensed Practical Nurse (LPN)' },
  { value: 'HHA', label: 'Home Health Aide (HHA)' },
  { value: 'OTA', label: 'Occupational Therapy Assistant (OTA)' },
  { value: 'PTA', label: 'Physical Therapy Assistant (PTA)' },
];

// ✅ CERTIFICATION OPTIONS
const certificationOptions = [
  { value: 'OPTION1' as CertificationType, label: CertificationDisplayNames.OPTION1 },
  { value: 'OPTION2' as CertificationType, label: CertificationDisplayNames.OPTION2 },
  { value: 'OPTION3' as CertificationType, label: CertificationDisplayNames.OPTION3 },
];

// US States for dropdown
const stateOptions = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export const CreateBranchForm: React.FC<CreateBranchFormProps> = ({
  agencyId,
  onSuccess,
  onCancel,
}) => {
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  // ✅ CERTIFICATION STATE
  const [hasCertifications, setHasCertifications] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState<CertificationType[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<CreateBranchRequest>({
    defaultValues: { 
      agencyId,
      selectedDisciplines: [] 
    },
  });

  const onSubmit = async (data: CreateBranchRequest) => {
    // Validate at least one discipline is selected
    if (selectedDisciplines.length === 0) {
      setError('selectedDisciplines' as any, {
        type: 'validation',
        message: 'At least one discipline must be selected',
      });
      return;
    }

    try {
      const requestData = {
        ...data,
        selectedDisciplines,
        ccn: data.ccnNumber, // Map ccnNumber to ccn for backend compatibility
        // ✅ CERTIFICATION DATA
        hasCertifications: hasCertifications,
        selectedCertifications: hasCertifications ? selectedCertifications : [],
      };
      
      await apiClient.createBranch(requestData);
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        // Handle field-specific validation errors
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateBranchRequest, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        setError('name', {
          type: 'server',
          message: error.response?.data?.message || 'Failed to create branch',
        });
      }
    }
  };

  const handleDisciplineChange = (disciplines: string[]) => {
    setSelectedDisciplines(disciplines as Discipline[]);
    if (disciplines.length > 0) {
      clearErrors('selectedDisciplines' as any);
    }
  };

  // ✅ CERTIFICATION HANDLERS
  const handleCertificationChange = (certifications: string[]) => {
    setSelectedCertifications(certifications as CertificationType[]);
  };

  const handleCertificationsToggle = (enabled: boolean) => {
    setHasCertifications(enabled);
    if (!enabled) {
      setSelectedCertifications([]); // Clear selections when disabled
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Branch</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add a new branch location with geographic details and discipline assignments.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Branch Name"
              {...register('name', { required: 'Branch name is required' })}
              error={errors.name?.message}
              placeholder="Enter branch name (e.g., Downtown Office, North Location)"
              className="w-full"
            />

            <Input
              label="CCN Number (CMS Certification Number)"
              {...register('ccnNumber', { 
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'CCN must be exactly 6 digits'
                }
              })}
              error={errors.ccnNumber?.message}
              placeholder="Enter 6-digit CCN number"
              maxLength={6}
              className="w-full"
            />
          </div>

          {/* Geographic Information */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Geographic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  {...register('address')}
                  error={errors.address?.message}
                  placeholder="Enter complete street address"
                  className="w-full"
                />
              </div>

              <Input
                label="City"
                {...register('city', { required: 'City is required' })}
                error={errors.city?.message}
                placeholder="Enter city name"
                className="w-full"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('state', { required: 'State is required' })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <Input
                label="ZIP Code"
                {...register('zipCode', { 
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: 'Enter a valid ZIP code (12345 or 12345-6789)'
                  }
                })}
                error={errors.zipCode?.message}
                placeholder="Enter ZIP code"
                maxLength={10}
                className="w-full"
              />
            </div>
          </div>

          {/* Discipline Selection */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Branch Disciplines</h4>
            <p className="text-sm text-gray-600 mb-4">
              Select all healthcare disciplines that will be served by this branch. This determines which 
              discipline-specific training content will be available to users at this location.
            </p>
            
            <div>
              <MultiSelect
                label="Available Disciplines"
                options={disciplineOptions}
                value={selectedDisciplines}
                onChange={handleDisciplineChange}
                placeholder="Select one or more disciplines"
                required
                error={errors.selectedDisciplines?.message}
              />
              {selectedDisciplines.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  At least one discipline must be selected
                </p>
              )}
            </div>

            {selectedDisciplines.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h5 className="text-sm font-medium text-blue-800 mb-2">Selected Disciplines:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedDisciplines.map((discipline) => {
                    const option = disciplineOptions.find(opt => opt.value === discipline);
                    return (
                      <span
                        key={discipline}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {option?.label || discipline}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ✅ CERTIFICATION SECTION */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium text-gray-900">Branch Certifications</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Enable certifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertifications}
                    onChange={(e) => handleCertificationsToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enable certifications to provide additional context for AI-generated content. 
              Selected certifications will be considered when creating sequences for this branch.
            </p>

            {hasCertifications ? (
              <div>
                <MultiSelect
                  label="Available Certifications"
                  options={certificationOptions}
                  value={selectedCertifications}
                  onChange={handleCertificationChange}
                  placeholder="Select one or more certifications"
                />

                {selectedCertifications.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <h5 className="text-sm font-medium text-green-800 mb-2">Selected Certifications:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCertifications.map((certification) => {
                        const option = certificationOptions.find(opt => opt.value === certification);
                        return (
                          <span
                            key={certification}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {option?.label || certification}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                <p className="text-sm text-gray-500">
                  Certifications are disabled for this branch. Toggle the switch above to enable certification selection.
                </p>
              </div>
            )}
          </div>

          {/* Legacy fields for compatibility */}
          <input type="hidden" {...register('location')} value="" />

          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={isSubmitting}
              disabled={selectedDisciplines.length === 0}
            >
              Create Branch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};