// examples/StatusUpdateExample.tsx
// This is an example of how to use the new toast system with status updates

import React from 'react';
import { Button } from '../components/ui/Button';
import { useApiWithToast } from '../utils/apiHelpers';
import { apiClient } from '../services/api';

interface StatusUpdateExampleProps {
  sequenceId: number;
  currentStatus: string;
}

export const StatusUpdateExample: React.FC<StatusUpdateExampleProps> = ({ 
  sequenceId, 
  currentStatus 
}) => {
  const { saveDraftWithToast, updateStatusWithToast } = useApiWithToast();

  const handleSaveDraft = async () => {
    try {
      const updatedSequence = await saveDraftWithToast(apiClient, sequenceId);
      console.log('Sequence updated:', updatedSequence);
      // Handle success - maybe refresh data, etc.
    } catch (error) {
      // Error already shown via toast
    }
  };

  const handleMoveToReview = async () => {
    try {
      const updatedSequence = await updateStatusWithToast(apiClient, sequenceId, 'REVIEW');
      console.log('Sequence moved to review:', updatedSequence);
    } catch (error) {
      // Error already shown via toast
    }
  };

  return (
    <div className="flex space-x-3">
      <Button 
        variant="outline" 
        onClick={handleSaveDraft}
        disabled={currentStatus === 'DRAFT'}
      >
        Save as Draft
      </Button>
      
      <Button 
        onClick={handleMoveToReview}
        disabled={currentStatus !== 'DRAFT'}
      >
        Move to Review
      </Button>
    </div>
  );
};

// How to integrate this into existing components:
// 
// 1. Import the useApiWithToast hook:
//    import { useApiWithToast } from '../utils/apiHelpers';
//
// 2. Use it in your component:
//    const { saveDraftWithToast } = useApiWithToast();
//
// 3. Replace your existing API calls:
//    // OLD:
//    const result = await apiClient.saveDraft(sequenceId);
//    
//    // NEW:
//    const result = await saveDraftWithToast(apiClient, sequenceId);
//
// This will automatically show appropriate toast messages based on the API response!