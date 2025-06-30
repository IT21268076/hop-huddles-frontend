import React from 'react';
import { BookOpen, PlayCircle, Plus } from 'lucide-react';

// Sequence Detail Page
export const SequenceDetail: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sequence Details</h1>
        <p className="text-gray-600">
          View and manage individual huddle sequences and their content.
        </p>
      </div>
      
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sequence details coming soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          This page will show detailed information about a specific huddle sequence.
        </p>
      </div>
    </div>
  );
};

// Huddle Detail Page
export const HuddleDetail: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Huddle Details</h1>
        <p className="text-gray-600">
          View and edit individual huddle content, voice scripts, and settings.
        </p>
      </div>
      
      <div className="text-center py-12">
        <PlayCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Huddle editor coming soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          This page will provide tools to edit huddle content, voice scripts, and assessments.
        </p>
      </div>
    </div>
  );
};