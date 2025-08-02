// pages/agencies/AgenciesPage.tsx
import React, { useState } from 'react';
import { Plus, Building2, Search } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
// import { useAsync } from '../../contexts/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { apiClient } from '../../services/api';
import { Agency, AgencyType, SubscriptionPlan } from '../../types';
import { formatDate } from '../../utils/helpers';
import { CreateAgencyForm } from './CreateAgencyForm';

export const AgenciesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgencyType, setSelectedAgencyType] = useState<AgencyType | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: agenciesResponse,
    loading,
    refetch,
  } = useAsync(
    async () => {
      return await apiClient.searchAgencies({
        name: searchTerm || undefined,
        agencyType: selectedAgencyType || undefined,
        page: currentPage - 1,
        size: pageSize,
      });
    },
    [searchTerm, selectedAgencyType, currentPage]
  );

  const handleCreateAgency = async () => {
    await refetch();
    setIsCreateModalOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getSubscriptionPlanBadge = (plan: SubscriptionPlan) => {
    const variants = {
      TRIAL: 'warning' as const,
      BASIC: 'default' as const,
      PREMIUM: 'info' as const,
      ENTERPRISE: 'success' as const,
    };
    return <Badge variant={variants[plan]}>{plan}</Badge>;
  };

  const getAgencyTypeBadge = (type: AgencyType) => {
    return <Badge variant="default">{type.replace('_', ' ')}</Badge>;
  };

  const columns = [
    {
      key: 'name',
      header: 'Agency Name',
      render: (agency: Agency) => (
        <div>
          <div className="font-medium text-gray-900">{agency.name}</div>
          <div className="text-sm text-gray-500">CCN: {agency.ccn}</div>
        </div>
      ),
    },
    {
      key: 'agencyType',
      header: 'Type',
      render: (agency: Agency) => getAgencyTypeBadge(agency.agencyType),
    },
    {
      key: 'subscriptionPlan',
      header: 'Plan',
      render: (agency: Agency) => getSubscriptionPlanBadge(agency.subscriptionPlan),
    },
    {
      key: 'userCount',
      header: 'Users',
      render: (agency: Agency) => (
        <span className="text-gray-900">{agency.userCount}</span>
      ),
    },
    {
      key: 'contactEmail',
      header: 'Contact',
      render: (agency: Agency) => (
        <div>
          {agency.contactEmail && (
            <div className="text-sm text-gray-900">{agency.contactEmail}</div>
          )}
          {agency.contactPhone && (
            <div className="text-sm text-gray-500">{agency.contactPhone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (agency: Agency) => (
        <span className="text-sm text-gray-500">{formatDate(agency.createdAt)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Agencies"
        description="Manage healthcare agencies and their configurations"
        action={{
          label: 'New Agency',
          onClick: () => setIsCreateModalOpen(true),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedAgencyType}
            onChange={(e) => setSelectedAgencyType(e.target.value as AgencyType | '')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="HOME_HEALTH">Home Health</option>
            <option value="HOME_CARE">Home Care</option>
            <option value="HOSPICE">Hospice</option>
            <option value="SKILLED_NURSING">Skilled Nursing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={agenciesResponse?.content || []}
        columns={columns}
        loading={loading}
        emptyMessage="No agencies found. Create your first agency to get started."
        emptyIcon={<Building2 className="h-6 w-6" />}
        pagination={
          agenciesResponse && agenciesResponse.totalPages > 1
            ? {
                currentPage,
                totalPages: agenciesResponse.totalPages,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
      />

      {/* Create Agency Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Agency"
        size="lg"
      >
        <CreateAgencyForm
          onSuccess={handleCreateAgency}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </>
  );
};