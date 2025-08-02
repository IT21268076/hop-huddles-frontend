// pages/sequences/HuddleEditModal.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Eye, Edit3, Volume2, Save, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../services/api';
import { Huddle } from '../../types';

interface HuddleEditModalProps {
  huddle: Huddle;
  onSuccess: () => void;
  onCancel: () => void;
}

interface HuddleContentForm {
  title: string;
  contentJson: string;
  voiceScript: string;
  durationMinutes?: number;
}

export const HuddleEditModal: React.FC<HuddleEditModalProps> = ({
  huddle,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<HuddleContentForm>({
    defaultValues: {
      title: huddle.title,
      contentJson: huddle.contentJson || '',
      voiceScript: huddle.voiceScript || '',
      durationMinutes: huddle.durationMinutes,
    },
  });

  const watchedContent = watch('contentJson');

  // Parse JSON content for preview
  React.useEffect(() => {
    try {
      if (watchedContent) {
        setPreviewContent(JSON.parse(watchedContent));
      }
    } catch (e) {
      setPreviewContent(null);
    }
  }, [watchedContent]);

  const onSubmit = async (data: HuddleContentForm) => {
    try {
      await apiClient.updateHuddleContent(huddle.huddleId, {
        contentJson: data.contentJson,
        voiceScript: data.voiceScript,
      });
      onSuccess();
    } catch (error: any) {
      setError('contentJson', {
        type: 'server',
        message: error.response?.data?.message || 'Failed to update huddle',
      });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // In a real implementation, this would call an AI regeneration endpoint
      setTimeout(() => {
        setIsRegenerating(false);
        // Simulate new content
        setValue('contentJson', JSON.stringify({
          sections: [
            {
              title: "Introduction",
              content: "Updated AI-generated content for " + huddle.title
            }
          ]
        }, null, 2));
      }, 3000);
    } catch (error) {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{huddle.title}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="default">{huddle.huddleType}</Badge>
            <span className="text-sm text-gray-500">Order: {huddle.orderIndex}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          loading={isRegenerating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate AI Content
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Content
          </TabsTrigger>
          <TabsTrigger value="script" className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice Script
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="content" className="space-y-4">
            <Input
              label="Huddle Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />

            <Textarea
              label="Content JSON"
              {...register('contentJson')}
              error={errors.contentJson?.message}
              rows={12}
              placeholder="JSON content structure..."
              className="font-mono text-sm"
            />

            <Input
              label="Duration (minutes)"
              type="number"
              {...register('durationMinutes', { valueAsNumber: true })}
              error={errors.durationMinutes?.message}
            />
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <Textarea
              label="Voice Over Script"
              {...register('voiceScript')}
              error={errors.voiceScript?.message}
              rows={15}
              placeholder="Enter the voice over script that will be converted to audio..."
            />

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Voice Script Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Write in a conversational, professional tone</li>
                <li>• Include natural pauses with punctuation</li>
                <li>• Emphasize key points with clear language</li>
                <li>• Keep sentences concise and easy to understand</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Content Preview</h4>
              
              {isRegenerating ? (
                <LoadingSpinner text="Regenerating content with AI..." />
              ) : previewContent ? (
                <div className="prose prose-sm max-w-none">
                  {previewContent.sections?.map((section: any, index: number) => (
                    <div key={index} className="mb-6">
                      <h5 className="text-md font-semibold text-gray-900 mb-2">
                        {section.title}
                      </h5>
                      <p className="text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No content to preview. Add JSON content to see preview.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};