import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Users, Award, Clock, BookOpen } from 'lucide-react';
import type { CourseAnalytics } from '../types';

interface CourseAnalyticsProps {
  analytics: CourseAnalytics;
}

export default function CourseAnalytics({ analytics }: CourseAnalyticsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">{analytics.total_students}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.completion_rate}%</p>
            </div>
            <Award className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Quiz Score</p>
              <p className="text-2xl font-bold text-white">{analytics.avg_quiz_score}%</p>
            </div>
            <BookOpen className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Today</p>
              <p className="text-2xl font-bold text-white">
                {analytics.daily_activity[analytics.daily_activity.length - 1]?.active_students || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Daily Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.daily_activity}>
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
                  dataKey="active_students"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completed_lessons"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Lesson Engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.lesson_engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="lesson_id" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar dataKey="views" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}