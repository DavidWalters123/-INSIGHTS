import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Star } from 'lucide-react';
import type { User } from '../types';

interface CreatorStatsProps {
  creator: User;
}

export default function CreatorStats({ creator }: CreatorStatsProps) {
  // Sample data - in a real app, this would come from your backend
  const monthlyData = [
    { month: 'Jan', students: 120, revenue: 2400 },
    { month: 'Feb', students: 150, revenue: 3000 },
    { month: 'Mar', students: 180, revenue: 3600 },
    { month: 'Apr', students: 220, revenue: 4400 },
    { month: 'May', students: 280, revenue: 5600 },
    { month: 'Jun', students: 350, revenue: 7000 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${creator.metrics?.monthly_revenue?.toLocaleString() || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Students</p>
              <p className="text-2xl font-bold text-white">
                {creator.metrics?.active_students?.toLocaleString() || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-white">
                {creator.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-surface-light rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Growth Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.375rem',
                }}
              />
              <Bar dataKey="students" name="Students" fill="#3B82F6" />
              <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}