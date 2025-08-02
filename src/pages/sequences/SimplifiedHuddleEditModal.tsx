// pages/sequences/SimplifiedHuddleEditModal.tsx
import React, { useState } from 'react';
import { FileText, Volume2, Save, Eye, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../services/api';
import { Huddle } from '../../types';

interface SimplifiedHuddleEditModalProps {
  huddle: Huddle;
  mode?: 'view' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

interface HuddleEditForm {
  voiceScript: string;
}

export const SimplifiedHuddleEditModal: React.FC<SimplifiedHuddleEditModalProps> = ({
  huddle,
  mode = 'edit',
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('pdf');
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<HuddleEditForm>({
    defaultValues: {
      voiceScript: huddle.voiceScript || '',
    },
  });

  const onSubmit = async (data: HuddleEditForm) => {
    if (!isDirty) {
      onCancel();
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.updateHuddleVoiceScript(huddle.huddleId, {
        voiceScript: data.voiceScript,
      });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update voice script:', error);
      // Show error to user
      alert('Failed to update voice script. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="text-lg font-medium text-gray-900">{huddle.title}</h4>
        <div className="flex items-center space-x-3 mt-2">
          <Badge variant="info">{huddle.getRoleDisciplineDisplay?.() || 'Role/Discipline'}</Badge>
          <Badge variant="default">Order: {huddle.orderIndex}</Badge>
          {huddle.durationMinutes && (
            <Badge variant="default">{huddle.durationMinutes} min</Badge>
          )}
          <Badge 
            variant={mode === 'view' ? 'secondary' : 'success'}
          >
            {mode === 'view' ? 'View Mode' : 'Edit Mode'}
          </Badge>
        </div>
        {huddle.description && (
          <p className="text-sm text-gray-600 mt-2">{huddle.description}</p>
        )}
      </div>

      {/* Simplified Tabs - Only PDF and Voice Script */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pdf" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            PDF Viewer
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice Script
          </TabsTrigger>
        </TabsList>

        {/* PDF Viewer Tab */}
        <TabsContent value="pdf" className="mt-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-medium text-gray-900">Generated PDF</h5>
              <div className="flex items-center space-x-2">
                {huddle.hasPdf ? (
                  <Badge variant="success" size="sm">PDF Ready</Badge>
                ) : (
                  <Badge variant="destructive" size="sm">PDF Not Generated</Badge>
                )}
              </div>
            </div>

            {huddle.hasPdf ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* PDF Embed - View Only */}
                <div className="bg-gray-50 p-4 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    PDF content is currently view-only. 
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-blue-800">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-xs font-medium">FUTURE FEATURE</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      PDF editing functionality will be added in a future release
                    </p>
                  </div>
                  
                  {/* PDF Preview */}
                  <div className="bg-white border border-gray-200 rounded p-8 text-left">
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-gray-900">{huddle.title}</div>
                      <div className="text-sm text-gray-600">
                        Role: <span className="font-medium">{huddle.combination?.userRole}</span> | 
                        Discipline: <span className="font-medium">{huddle.combination?.discipline}</span>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          [AI-generated content for {huddle.getRoleDisciplineDisplay?.() || 'Role/Discipline'}]
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                          This is a preview of the generated PDF content. The actual PDF contains 
                          structured learning materials, visual elements, and interactive components 
                          tailored for {huddle.combination?.discipline} professionals in {huddle.combination?.userRole} roles.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PDF Actions */}
                  <div className="mt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(huddle.pdfUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">PDF Not Available</p>
                <p className="text-sm">The PDF is still being generated or an error occurred.</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Future Enhancement</p>
                  <p className="text-blue-800">
                    PDF editing functionality will be added in future updates. Currently, 
                    only viewing and downloading are supported.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Voice Script Tab - Editable */}
        <TabsContent value="voice" className="mt-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-medium text-gray-900">Voice Over Script</h5>
              <div className="flex items-center space-x-2">
                {huddle.hasVoiceScript ? (
                  <Badge variant="success" size="sm">Script Available</Badge>
                ) : (
                  <Badge variant="destructive" size="sm">No Script</Badge>
                )}
                {!huddle.canEdit && (
                  <Badge variant="destructive" size="sm">Read Only</Badge>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Textarea
                  label="Voice Script for TTS Generation"
                  placeholder="Enter the voice-over script that will be converted to audio..."
                  {...register('voiceScript', mode === 'edit' ? {
                    required: 'Voice script is required',
                    minLength: { 
                      value: 10, 
                      message: 'Script must be at least 10 characters long' 
                    },
                  } : {})}
                  error={errors.voiceScript?.message}
                  rows={12}
                  disabled={mode === 'view'}
                  className="font-mono text-sm"
                />

                {/* Voice Script Guidelines */}
                {mode === 'edit' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h6 className="text-sm font-medium text-blue-900 mb-2">
                      Voice Script Guidelines
                    </h6>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Write in a conversational, professional tone</li>
                      <li>• Include natural pauses with punctuation</li>
                      <li>• Emphasize key points with clear, simple language</li>
                      <li>• Keep sentences concise and easy to understand</li>
                      <li>• Tailor content for {huddle.getRoleDisciplineDisplay?.() || 'Role/Discipline'}</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                      <Eye className="h-4 w-4 inline mr-1" />
                      Voice Script Preview
                    </h6>
                    <p className="text-sm text-gray-600">
                      This is the voice script that will be converted to audio for {huddle.getRoleDisciplineDisplay?.() || 'Role/Discipline'} professionals.
                    </p>
                  </div>
                )}

                {/* Word Count */}
                {watch('voiceScript') && (
                  <div className="text-sm text-gray-500">
                    Word count: {watch('voiceScript').split(' ').filter((word: string) => word.length > 0).length}
                  </div>
                )}
              </div>

              {/* Voice Script Actions */}
              {mode === 'edit' && (
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    loading={isSaving}
                    disabled={!isDirty}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Voice Script
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Main Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={handleCancel}>
          {mode === 'view' ? 'Close' : (isDirty ? 'Cancel' : 'Close')}
        </Button>
        {mode === 'edit' && isDirty && (
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
};