import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    history: Array<{ date: string; amount: number }>;
  };
  students: {
    total: number;
    active: number;
    growth: number;
    byProduct: Array<{ name: string; count: number }>;
  };
  engagement: {
    completionRate: number;
    averageRating: number;
    reviewCount: number;
    categories: Array<{ name: string; value: number }>;
  };
}

interface CreatorAnalyticsProps {
  data: AnalyticsData;
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
}

const COLORS = ['#335EF7', '#10B981', '#F59E0B', '#EC4899'];

export default function CreatorAnalytics({ data, timeRange, onTimeRangeChange }: CreatorAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            <div className={`flex items-center ${data.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.revenue.growth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="text-sm">{Math.abs(data.revenue.growth)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-white">
            ${data.revenue.total.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="h-6 w-6 text-blue-500" />
            <div className={`flex items-center ${data.students.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.students.growth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="text-sm">{Math.abs(data.students.growth)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Active Students</p>
          <p className="text-2xl font-bold text-white">
            {data.students.active.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span className="text-sm text-gray-400">
              {data.engagement.reviewCount} reviews
            </span>
          </div>
          <p className="text-sm text-gray-400">Average Rating</p>
          <p className="text-2xl font-bold text-white">
            {data.engagement.averageRating.toFixed(1)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <span className="text-sm text-gray-400">
              Course Completion
            </span>
          </div>
          <p className="text-sm text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-white">
            {data.engagement.completionRate}%
          </p>
        </motion.div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {(['week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === range
                ? 'bg-primary text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#335EF7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Students by Product</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.students.byProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar dataKey="count" fill="#335EF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-6">Category Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.engagement.categories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {data.engagement.categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}