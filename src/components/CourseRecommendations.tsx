import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Users, Clock } from 'lucide-react';
import type { Course } from '../types';

interface CourseRecommendationsProps {
  recommendations: Course[];
  userInterests: string[];
}

export default function CourseRecommendations({ 
  recommendations, 
  userInterests 
}: CourseRecommendationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="text-gray-400">Based on your interests</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {userInterests.map((interest) => (
          <span
            key={interest}
            className="px-3 py-1 text-sm text-primary bg-primary/10 rounded-full"
          >
            {interest}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/communities/${course.community_id}/courses/${course.id}`}
              className="block h-full bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    {course.category || 'Uncategorized'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-surface-light rounded-full">
                    {course.level || 'All Levels'}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 line-clamp-2 mb-4">
                  {course.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration || 0} mins
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollment_count || 0} enrolled
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}