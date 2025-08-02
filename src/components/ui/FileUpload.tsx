// components/ui/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { apiClient } from '../../services/api';

interface FileUploadProps {
  onUpload: (fileInfo: { fileName: string; url: string }) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  category?: string;
  label?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  acceptedTypes = ['.pdf', '.docx', '.txt'],
  maxSizeMB = 10,
  category = 'uploads',
  label = 'Upload File',
  description = 'Upload files for your huddle content',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; url: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      onError?.(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    try {
      setUploading(true);
      const result = await apiClient.uploadFile(file, category);
      setUploadedFile(result);
      onUpload(result);
    } catch (error: any) {
      onError?.(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {uploadedFile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFile}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {uploadedFile ? (
        <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <div className="text-sm font-medium text-green-800">
              File uploaded successfully
            </div>
            <div className="text-sm text-green-600">
              {uploadedFile.fileName}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(',')}
          />

          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              ) : (
                <Upload className="h-12 w-12" />
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Drop your file here, or'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2"
              >
                <File className="h-4 w-4 mr-1" />
                Browse Files
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>Accepted formats: {acceptedTypes.join(', ')}</p>
              <p>Maximum file size: {maxSizeMB}MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};