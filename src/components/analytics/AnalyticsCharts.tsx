// components/analytics/AnalyticsCharts.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface EngagementChartProps {
  data: Array<[string, number]>;
  title: string;
}

export const EngagementLineChart: React.FC<EngagementChartProps> = ({ data, title }) => {
  const chartData = data.map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    engagement: count,
  }));

  return (
    <div className="h-80">
      <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="engagement" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ProgressDistributionProps {
  completed: number;
  inProgress: number;
  notStarted: number;
}

export const ProgressPieChart: React.FC<ProgressDistributionProps> = ({ 
  completed, 
  inProgress, 
  notStarted 
}) => {
  const data = [
    { name: 'Completed', value: completed, color: '#10B981' },
    { name: 'In Progress', value: inProgress, color: '#F59E0B' },
    { name: 'Not Started', value: notStarted, color: '#EF4444' },
  ].filter(item => item.value > 0);

  return (
    <div className="h-80">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Progress Distribution</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center space-x-4 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EngagementMetricsProps {
  views: number;
  downloads: number;
  assessments: number;
  interactions: number;
}

export const EngagementBarChart: React.FC<EngagementMetricsProps> = ({
  views,
  downloads,
  assessments,
  interactions,
}) => {
  const data = [
    { name: 'Views', value: views, fill: '#3B82F6' },
    { name: 'Downloads', value: downloads, fill: '#10B981' },
    { name: 'Assessments', value: assessments, fill: '#F59E0B' },
    { name: 'Interactions', value: interactions, fill: '#8B5CF6' },
  ];

  return (
    <div className="h-80">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface UserActivityProps {
  data: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export const UserActivityChart: React.FC<UserActivityProps> = ({ data }) => {
  return (
    <div className="h-80">
      <h4 className="text-lg font-medium text-gray-900 mb-4">User Activity Trends</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="activeUsers"
            stackId="1"
            stroke="#3B82F6"
            fill="url(#activeUsers)"
          />
          <Area
            type="monotone"
            dataKey="newUsers"
            stackId="1"
            stroke="#10B981"
            fill="url(#newUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CompletionRateProps {
  data: Array<{
    sequence: string;
    completionRate: number;
    totalUsers: number;
  }>;
}

export const CompletionRateChart: React.FC<CompletionRateProps> = ({ data }) => {
  return (
    <div className="h-80">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Completion Rates by Sequence</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="sequence" type="category" width={120} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Completion Rate']}
            labelFormatter={(label) => `Sequence: ${label}`}
          />
          <Bar 
            dataKey="completionRate" 
            fill="#10B981" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};