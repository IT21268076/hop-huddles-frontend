// components/analytics/EngagementVisualization.tsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, Clock, Users, Award, Activity, Target } from 'lucide-react';

interface EngagementData {
  sequenceTitle: string;
  totalHuddles: number;
  completedHuddles: number;
  totalTimeSpent: number;
  averageProgress: number;
  status: string;
}

interface AssessmentData {
  assessmentTitle: string;
  attempts: number;
  averageScore: number;
  passRate: number;
  totalTime: number;
}

interface Props {
  engagementData: EngagementData[];
  assessmentData: AssessmentData[];
  loading?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const EngagementVisualization: React.FC<Props> = ({
  engagementData,
  assessmentData,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const completionRateData = engagementData.map(item => ({
    name: item.sequenceTitle.substring(0, 20) + (item.sequenceTitle.length > 20 ? '...' : ''),
    completed: item.completedHuddles,
    total: item.totalHuddles,
    rate: item.totalHuddles > 0 ? Math.round((item.completedHuddles / item.totalHuddles) * 100) : 0,
  }));

  const timeSpentData = engagementData.map(item => ({
    name: item.sequenceTitle.substring(0, 15) + (item.sequenceTitle.length > 15 ? '...' : ''),
    timeSpent: item.totalTimeSpent,
    progress: item.averageProgress,
  }));

  const progressDistributionData = engagementData.map((item, index) => ({
    name: item.sequenceTitle.substring(0, 20) + (item.sequenceTitle.length > 20 ? '...' : ''),
    value: item.averageProgress,
    fill: COLORS[index % COLORS.length],
  }));

  const assessmentPerformanceData = assessmentData.map(item => ({
    name: item.assessmentTitle.substring(0, 15) + (item.assessmentTitle.length > 15 ? '...' : ''),
    averageScore: item.averageScore,
    passRate: item.passRate,
    attempts: item.attempts,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total Sequences</div>
              <div className="text-xl font-bold text-gray-900">{engagementData.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Avg. Completion</div>
              <div className="text-xl font-bold text-gray-900">
                {engagementData.length > 0 
                  ? Math.round(engagementData.reduce((sum, item) => sum + item.averageProgress, 0) / engagementData.length)
                  : 0}%
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total Time</div>
              <div className="text-xl font-bold text-gray-900">
                {Math.round(engagementData.reduce((sum, item) => sum + item.totalTimeSpent, 0) / 60)}h
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Assessments</div>
              <div className="text-xl font-bold text-gray-900">{assessmentData.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completion Rate by Sequence</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'rate' ? `${value}%` : value,
                  name === 'rate' ? 'Completion Rate' : name === 'completed' ? 'Completed' : 'Total'
                ]}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="total" fill="#E5E7EB" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Time Spent vs Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Spent vs Progress</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSpentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'timeSpent' ? `${value} min` : `${value}%`,
                  name === 'timeSpent' ? 'Time Spent' : 'Progress'
                ]}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="timeSpent" 
                stroke="#F59E0B" 
                fill="#FEF3C7"
                name="Time Spent (min)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="progress" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Progress (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Progress Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Distribution</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={progressDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${Math.round(value)}%`}
              >
                {progressDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, 'Progress']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Assessment Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assessment Performance</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assessmentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'attempts' ? value : `${value}%`,
                  name === 'averageScore' ? 'Avg Score' : name === 'passRate' ? 'Pass Rate' : 'Attempts'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Average Score (%)"
              />
              <Line 
                type="monotone" 
                dataKey="passRate" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Pass Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Engagement Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sequence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Huddles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {engagementData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.sequenceTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.averageProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(item.averageProgress)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.completedHuddles} / {item.totalHuddles}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(item.totalTimeSpent / 60)}h {item.totalTimeSpent % 60}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        item.status === 'COMPLETED' ? 'success' : 
                        item.status === 'IN_PROGRESS' ? 'info' : 
                        'default'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};