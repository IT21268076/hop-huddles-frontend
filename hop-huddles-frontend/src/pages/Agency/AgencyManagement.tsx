import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Building, Phone, Mail, MapPin } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Agency, CreateAgencyRequest, AgencyType, SubscriptionPlan } from '../../types';
import AgencyModal from './AgencyModal';
import toast from 'react-hot-toast';

const AgencyManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const queryClient = useQueryClient();

  // Fetch agencies
  const { data: agencies, isLoading, error } = useQuery(
    'agencies',
    apiClient.getAgencies,
    {
      onError: (error: any) => {
        toast.error('Failed to fetch agencies');
      }
    }
  );

  // Create agency mutation
  const createMutation = useMutation(apiClient.createAgency, {
    onSuccess: () => {
      queryClient.invalidateQueries('agencies');
      setIsModalOpen(false);
      toast.success('Agency created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create agency');
    }
  });

  // Update agency mutation
  const updateMutation = useMutation(
    ({ agencyId, data }: { agencyId: number; data: Partial<CreateAgencyRequest> }) =>
      apiClient.updateAgency(agencyId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agencies');
        setIsModalOpen(false);
        setEditingAgency(null);
        toast.success('Agency updated successfully');
      },
      onError: (error: any) => {
        toast.error('Failed to update agency');
      }
    }
  );

  // Delete agency mutation
  const deleteMutation = useMutation(apiClient.deleteAgency, {
    onSuccess: () => {
      queryClient.invalidateQueries('agencies');
      toast.success('Agency deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete agency');
    }
  });

  const handleCreate = (data: CreateAgencyRequest | Partial<CreateAgencyRequest>) => {
    // Ensure all required fields are present before creating
    if (
      typeof data.name === 'string' &&
      typeof data.ccn === 'string' &&
      typeof data.agencyType === 'string' &&
      typeof data.subscriptionPlan === 'string'
    ) {
      createMutation.mutate(data as CreateAgencyRequest);
    } else {
      toast.error('Missing required fields for creating agency');
    }
  };

  const handleUpdate = (data: Partial<CreateAgencyRequest>) => {
    if (editingAgency) {
      updateMutation.mutate({ agencyId: editingAgency.agencyId, data });
    }
  };

  const handleDelete = (agencyId: number) => {
    if (window.confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
      deleteMutation.mutate(agencyId);
    }
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setIsModalOpen(true);
  };

  const getAgencyTypeDisplay = (type: AgencyType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSubscriptionPlanBadge = (plan: SubscriptionPlan) => {
    const colors = {
      TRIAL: 'bg-gray-100 text-gray-800',
      BASIC: 'bg-blue-100 text-blue-800',
      PREMIUM: 'bg-green-100 text-green-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800',
    };
    return colors[plan] || colors.BASIC;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Management</h1>
          <p className="text-gray-600">
            Manage healthcare agencies and their configurations in the platform.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={16} className="mr-2" />
          Create Agency
        </button>
      </div>

      {/* Agency Grid */}
      {agencies && agencies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.agencyId}
              className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                      <p className="text-sm text-gray-500">CCN: {agency.ccn}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(agency)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(agency.agencyId)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Agency Type and Plan */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getAgencyTypeDisplay(agency.agencyType)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionPlanBadge(agency.subscriptionPlan)}`}>
                    {agency.subscriptionPlan}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 text-sm text-gray-600">
                  {agency.contactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{agency.contactEmail}</span>
                    </div>
                  )}
                  {agency.contactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{agency.contactPhone}</span>
                    </div>
                  )}
                  {agency.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5" />
                      <span className="text-xs leading-relaxed">{agency.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Users</span>
                    <span className="font-medium text-gray-900">{agency.userCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first agency.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Create Agency
            </button>
          </div>
        </div>
      )}

      {/* Agency Modal */}
      <AgencyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAgency(null);
        }}
        onSubmit={editingAgency ? handleUpdate : handleCreate}
        agency={editingAgency}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default AgencyManagement;