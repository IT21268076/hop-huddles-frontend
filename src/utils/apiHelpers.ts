// utils/apiHelpers.ts
import { useToast } from '../contexts/ToastContext';

export interface StatusUpdateResponse {
  sequence: any;
  message: string;
  messageType: 'success' | 'info' | 'warning' | 'error';
  success: boolean;
}

export const useApiWithToast = () => {
  const { success, info, warning, error: showError } = useToast();

  const handleStatusUpdateResponse = (response: StatusUpdateResponse) => {
    const { message, messageType } = response;
    
    switch (messageType) {
      case 'success':
        success(message);
        break;
      case 'info':
        info(message);
        break;
      case 'warning':
        warning(message);
        break;
      case 'error':
        showError(message);
        break;
      default:
        info(message);
    }
    
    return response.sequence;
  };

  const saveDraftWithToast = async (apiClient: any, sequenceId: number) => {
    try {
      const response = await apiClient.saveDraft(sequenceId);
      return handleStatusUpdateResponse(response);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save draft';
      showError(errorMessage);
      throw error;
    }
  };

  const updateStatusWithToast = async (apiClient: any, sequenceId: number, status: string, userId?: number) => {
    try {
      // Use the branch-specific method if available, fallback to general method
      const response = apiClient.updateBranchSequenceStatus 
        ? await apiClient.updateBranchSequenceStatus(sequenceId, status, userId)
        : await apiClient.updateSequenceStatus(sequenceId, status, userId);
      return handleStatusUpdateResponse(response);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      showError(errorMessage);
      throw error;
    }
  };

  return {
    saveDraftWithToast,
    updateStatusWithToast,
    handleStatusUpdateResponse,
  };
};