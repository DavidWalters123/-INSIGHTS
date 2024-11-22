import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import type { User } from '../types';

interface ProfileMetricsProps {
  metrics: NonNullable<User['metrics']>;
}

export default function ProfileMetrics({ metrics }: ProfileMetricsProps) {
  const items = [
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      label: 'Total Students',
      value: metrics.total_students?.toLocaleString() || '0',
    },
    {
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      label: 'Total Courses',
      value: metrics.total_courses || '0',
    },
    {
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      label: 'Avg. Rating',
      value: metrics.avg_course_rating?.toFixed(1) || '0.0',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      label: 'Engagement',
      value: `${metrics.engagement_score || 0}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-surface-light rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <div>
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-2xl font-bold text-white">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}