import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Clock, BookOpen } from 'lucide-react';
import type { CourseProgress, Certificate } from '../types';

interface StudentProgressProps {
  progress: CourseProgress[];
  certificates: Certificate[];
  totalHoursSpent: number;
  completedCourses: number;
}

export default function StudentProgress({ 
  progress, 
  certificates, 
  totalHoursSpent,
  completedCourses 
}: StudentProgressProps) {
  const stats = [
    {
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      label: 'Certificates Earned',
      value: certificates.length,
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      label: 'Courses Completed',
      value: completedCourses,
    },
    {
      icon: <Clock className="h-6 w-6 text-green-500" />,
      label: 'Hours Spent Learning',
      value: Math.round(totalHoursSpent),
    },
    {
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      label: 'Courses In Progress',
      value: progress.length - completedCourses,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Learning Journey</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface border border-surface-light rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              {stat.icon}
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {certificates.length > 0 && (
        <div className="bg-surface border border-surface-light rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Achievements
          </h3>
          <div className="space-y-4">
            {certificates.slice(0, 3).map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-surface-light rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {cert.template_data.course_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Completed on {cert.template_data.completion_date}
                  </p>
                </div>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}