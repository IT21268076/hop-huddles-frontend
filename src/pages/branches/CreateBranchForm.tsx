// pages/branches/CreateBranchForm.tsx
import React, { useState } from 'react';
import { MapPin, Users, Save, X, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { Discipline, CertificationType, CertificationDisplayNames } from '../../types';

interface CreateBranchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface BranchFormData {
  name: string;
  state: string;
  city: string;
  zipCode: string;
  ccn?: string;
  selectedDisciplines: Discipline[];
  hasCertifications: boolean;
  selectedCertifications: CertificationType[];
}

// Predefined disciplines as per requirements
const AVAILABLE_DISCIPLINES: { value: Discipline; label: string; description: string }[] = [
  { value: 'RN' as Discipline, label: 'RN', description: 'Registered Nurse' },
  { value: 'PT' as Discipline, label: 'PT', description: 'Physical Therapist' },
  { value: 'OT' as Discipline, label: 'OT', description: 'Occupational Therapist' },
  { value: 'SLP' as Discipline, label: 'SLP', description: 'Speech Language Pathologist' },
  { value: 'MSW' as Discipline, label: 'MSW', description: 'Medical Social Worker' },
  { value: 'LPN' as Discipline, label: 'LPN', description: 'Licensed Practical Nurse' },
  { value: 'HHA' as Discipline, label: 'HHA', description: 'Home Health Aide' },
  { value: 'OTA' as Discipline, label: 'OTA', description: 'Occupational Therapy Assistant' },
  { value: 'PTA' as Discipline, label: 'PTA', description: 'Physical Therapy Assistant' },
];

// ✅ CERTIFICATION OPTIONS
const AVAILABLE_CERTIFICATIONS: { value: CertificationType; label: string }[] = [
  { value: 'OPTION1', label: CertificationDisplayNames.OPTION1 },
  { value: 'OPTION2', label: CertificationDisplayNames.OPTION2 },
  { value: 'OPTION3', label: CertificationDisplayNames.OPTION3 },
];

export const CreateBranchForm: React.FC<CreateBranchFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { currentUser, currentAgency } = useApp();
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [hasCertifications, setHasCertifications] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState<CertificationType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<BranchFormData>({
    defaultValues: {
      selectedDisciplines: [],
      hasCertifications: false,
      selectedCertifications: [],
    },
  });

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines(prev => {
      if (prev.includes(discipline)) {
        return prev.filter(d => d !== discipline);
      } else {
        return [...prev, discipline];
      }
    });
    
    // Clear discipline validation error when user selects disciplines
    if (selectedDisciplines.length >= 0) {
      clearErrors('selectedDisciplines');
    }
  };

  // ✅ CERTIFICATION HANDLERS
  const handleCertificationToggle = (certification: CertificationType) => {
    setSelectedCertifications(prev => {
      if (prev.includes(certification)) {
        return prev.filter(c => c !== certification);
      } else {
        return [...prev, certification];
      }
    });
  };

  const handleCertificationsToggle = (enabled: boolean) => {
    setHasCertifications(enabled);
    if (!enabled) {
      setSelectedCertifications([]); // Clear selections when disabled
    }
  };

  const onSubmit = async (data: BranchFormData) => {
    // Validate at least one discipline is selected
    if (selectedDisciplines.length === 0) {
      setError('selectedDisciplines', {
        type: 'required',
        message: 'Please select at least one discipline for this branch',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating branch with current user:', currentUser);
      const createdBranch = await apiClient.createBranch({
        agencyId: currentAgency?.agencyId || 1,
        name: data.name,
        state: data.state,
        city: data.city,
        zipCode: data.zipCode,
        ccn: data.ccn || undefined,
        selectedDisciplines: selectedDisciplines,
        hasCertifications: hasCertifications,
        selectedCertifications: hasCertifications ? selectedCertifications : [],
      });
      
      console.log('Branch created successfully:', createdBranch);
      
      // Add a small delay to allow auto-assignment to complete, then verify
      setTimeout(async () => {
        try {
          console.log('Checking educator access to created branch...');
          const hasAccess = await apiClient.checkBranchAccess(createdBranch.branchId);
          console.log('Educator has access to created branch:', hasAccess);
          
          if (!hasAccess) {
            console.warn('⚠️ Auto-assignment may have failed - educator does not have access to created branch');
          }
        } catch (error) {
          console.error('Failed to check branch access:', error);
        }
      }, 1000);

      onSuccess();
    } catch (error: any) {
      console.error('Failed to create branch:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.message) {
        setError('root', {
          type: 'server',
          message: error.response.data.message,
        });
      } else {
        setError('root', {
          type: 'server',
          message: 'Failed to create branch. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Branch Basic Information */}
      <Card>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Branch Information</h4>
        
        <div className="space-y-4">
          <Input
            label="Branch Name"
            placeholder="Enter branch name (e.g., Downtown Office, North Campus)"
            {...register('name', {
              required: 'Branch name is required',
              minLength: { value: 3, message: 'Branch name must be at least 3 characters' },
              maxLength: { value: 255, message: 'Branch name must not exceed 255 characters' }
            })}
            error={errors.name?.message}
            required
          />

          <Input
            label="CCN Number (Optional)"
            placeholder="CMS Certification Number"
            {...register('ccn', {
              maxLength: { value: 20, message: 'CCN must not exceed 20 characters' }
            })}
            error={errors.ccn?.message}
          />
        </div>
      </Card>

      {/* Geographic Information */}
      <Card>
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-gray-500 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Geographic Location</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="State"
            placeholder="State (e.g., CA, NY, TX)"
            {...register('state', {
              required: 'State is required',
              minLength: { value: 2, message: 'State must be at least 2 characters' },
              maxLength: { value: 50, message: 'State must not exceed 50 characters' }
            })}
            error={errors.state?.message}
            required
          />

          <Input
            label="City"
            placeholder="City name"
            {...register('city', {
              required: 'City is required',
              minLength: { value: 2, message: 'City must be at least 2 characters' },
              maxLength: { value: 100, message: 'City must not exceed 100 characters' }
            })}
            error={errors.city?.message}
            required
          />

          <Input
            label="ZIP Code"
            placeholder="ZIP Code"
            {...register('zipCode', {
              required: 'ZIP code is required',
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
              }
            })}
            error={errors.zipCode?.message}
            required
          />
        </div>
      </Card>

      {/* Discipline Selection */}
      <Card>
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-gray-500 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Branch-Specific Disciplines</h4>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Select the disciplines that will be available in this branch. Only selected disciplines 
          will be available for huddle sequence creation in this branch.
        </p>

        {errors.selectedDisciplines && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.selectedDisciplines.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_DISCIPLINES.map((discipline) => {
            const isSelected = selectedDisciplines.includes(discipline.value);
            
            return (
              <div
                key={discipline.value}
                onClick={() => handleDisciplineToggle(discipline.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant={isSelected ? 'info' : 'default'}
                    className="font-medium"
                  >
                    {discipline.label}
                  </Badge>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600">{discipline.description}</p>
              </div>
            );
          })}
        </div>

        {selectedDisciplines.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Selected Disciplines ({selectedDisciplines.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDisciplines.map((discipline) => (
                <Badge key={discipline} variant="info" size="sm">
                  {discipline}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ✅ CERTIFICATION SECTION */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-gray-500 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Branch Certifications</h4>
          </div>
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

        {hasCertifications && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AVAILABLE_CERTIFICATIONS.map((certification) => {
                const isSelected = selectedCertifications.includes(certification.value);
                
                return (
                  <div
                    key={certification.value}
                    onClick={() => handleCertificationToggle(certification.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={isSelected ? 'success' : 'default'}
                        className="font-medium"
                      >
                        {certification.label}
                      </Badge>
                      {isSelected && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCertifications.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Selected Certifications ({selectedCertifications.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCertifications.map((certification) => (
                    <Badge key={certification} variant="success" size="sm">
                      {CertificationDisplayNames[certification]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasCertifications && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
            <p className="text-sm text-gray-500">
              Certifications are disabled for this branch. Toggle the switch above to enable certification selection.
            </p>
          </div>
        )}
      </Card>

      {/* Error Display */}
      {errors.root && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          Create Branch
        </Button>
      </div>
    </form>
  );
};