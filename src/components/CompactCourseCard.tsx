import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, User, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Course, User as UserType } from '../types';

interface CompactCourseCardProps {
  course: Course & { instructor?: UserType };
}

export default function CompactCourseCard({ course }: CompactCourseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Link 
        to={`/communities/${course.community_id}/courses/${course.id}`}
        className="flex bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200"
      >
        <div className="w-48 h-32 flex-shrink-0 relative overflow-hidden">
          {course.thumbnail_url ? (
            <motion.img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-surface-light flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 rounded-full bg-surface flex items-center justify-center"
              >
                <BookOpen className="h-6 w-6 text-gray-400" />
              </motion.div>
            </div>
          )}
          {course.type === 'course' && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded-full">
              Course
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {course.category && (
                <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-surface-light rounded-full">
                  {course.level}
                </span>
              )}
            </div>
            {course.price !== undefined && (
              <motion.span 
                className="text-sm font-medium text-white bg-surface-light px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </motion.span>
            )}
          </div>

          <h3 className="text-white font-medium mb-1 line-clamp-1">{course.title}</h3>

          <div className="flex items-center text-sm text-gray-400 mb-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {course.instructor?.full_name || 'Unknown Instructor'}
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration || 0} mins
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-white">
                {course.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
              </span>
              <span className="mx-1 text-sm text-gray-400">
                ({course.metrics?.total_reviews || 0})
              </span>
            </div>
            <motion.div 
              className="flex items-center text-sm text-gray-400"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="h-4 w-4 mr-1" />
              {course.enrollment_count || 0} students
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}