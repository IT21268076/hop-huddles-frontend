// pages/superadmin/SuperAdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  Shield,
  Plus,
  Search,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { InviteAgencyModal } from './InviteAgencyModal';
import { useApi } from '../../hooks/useApi';
import { getActiveStatus } from '../../utils/helpers';

export const SuperAdminDashboard: React.FC = () => {
  console.log('SuperAdminDashboard component rendered');
  const api = useApi();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalSequences: 0,
    totalHuddles: 0,
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading agencies and system stats...');
      
      // Load agencies
      const agenciesData = await api.getAllAgencies();
      console.log('Loaded agencies:', agenciesData);
      
      // Ensure agenciesData is an array
      const safeAgenciesData = Array.isArray(agenciesData) ? agenciesData : [];
      setAgencies(safeAgenciesData);

      // Calculate stats with safe data
      setSystemStats({
        totalAgencies: safeAgenciesData.length,
        activeAgencies: safeAgenciesData.filter((a: any) => getActiveStatus(a)).length,
        totalUsers: safeAgenciesData.reduce((sum: number, a: any) => sum + (a?.userCount || 0), 0),
        activeUsers: safeAgenciesData.reduce((sum: number, a: any) => sum + (a?.activeUserCount || 0), 0),
        totalSequences: 0, // Would need separate API call
        totalHuddles: 0, // Would need separate API call
      });

      console.log('Successfully loaded agencies and stats');
    } catch (error) {
      console.error('Failed to load agencies:', error);
      // Set safe fallback state
      setAgencies([]);
      setSystemStats({
        totalAgencies: 0,
        activeAgencies: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalSequences: 0,
        totalHuddles: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSuccess = () => {
    loadData(); // Refresh data after successful invitation
  };

  const filteredAgencies = agencies.filter(agency =>
    agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency?.type || agency?.agencyType || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="SuperAdmin Dashboard"
        description="Manage all agencies and system-wide settings for HOP Huddles platform"
        action={{
          label: 'Invite Agency',
          onClick: () => setIsInviteModalOpen(true),
          icon: <Mail className="h-4 w-4" />,
        }}
      />

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Agencies</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.totalAgencies}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Agencies</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.activeAgencies}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Users</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Sequences</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.totalSequences}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Huddles</div>
              <div className="text-2xl font-bold text-gray-900">{systemStats.totalHuddles}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agency Management */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Agency Management</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search agencies..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={loadData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Agency
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading agencies...</p>
                </div>
              ) : filteredAgencies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No agencies match your search' : 'No agencies found'}
                  </p>
                </div>
              ) : (
                filteredAgencies.map((agency) => (
                <div
                  key={agency.agencyId || agency.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{agency.name}</h4>
                      <Badge variant={getActiveStatus(agency) ? 'success' : 'error'}>
                        {getActiveStatus(agency) ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="default">
                        {(agency.type || agency.agencyType || 'Unknown')?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {agency.userCount || 0} users
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Settings
                    </Button>
                  </div>
                </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions & System Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Agency Invitation
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage System Users
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                System Analytics
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </div>
          </Card>

          {/* System Status */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">API Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Database</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Background Jobs</span>
                <Badge variant="success">Running</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Notifications</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900">New agency registered</div>
                <div className="text-gray-500">Quality Care Services • 2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">System update deployed</div>
                <div className="text-gray-500">Version 1.2.3 • 1 day ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Bulk user invitation sent</div>
                <div className="text-gray-500">ABC Home Health • 2 days ago</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Invitation Modal */}
      <InviteAgencyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      {/* Coming Soon Notice */}
      <div className="mt-8">
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-yellow-800">
                SuperAdmin Features In Development
              </h3>
              <p className="text-yellow-700 mt-1">
                This is a placeholder for the SuperAdmin dashboard. Full functionality including 
                agency invitation workflows, system-wide analytics, and administrative controls 
                will be implemented in the next phase of development.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};