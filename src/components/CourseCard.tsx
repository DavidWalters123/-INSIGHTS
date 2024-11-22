import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/communities/${course.community_id}/courses/${course.id}`}
        className="block h-full bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200"
      >
        <div className="relative h-48">
          {course.thumbnail_url ? (
            <motion.img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <BookOpen className="h-12 w-12 text-primary" />
              </motion.div>
            </div>
          )}
          {course.level && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-white text-sm font-medium rounded-full">
              {course.level}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              {course.category || 'General'}
            </span>
            {course.price !== undefined && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-surface-light rounded-full">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {course.title}
          </h3>
          
          <p className="text-gray-400 line-clamp-2 mb-4">
            {course.description}
          </p>

          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-gray-400">Students</p>
              <p className="text-lg font-semibold text-white">
                {course.enrollment_count?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-lg font-semibold text-white">
                {course.duration || 0}m
              </p>
            </motion.div>

            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Rating</p>
              <p className="text-lg font-semibold text-white">
                {course.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
              </p>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}