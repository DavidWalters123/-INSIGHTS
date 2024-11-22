import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, Clock, BarChart } from 'lucide-react';
import type { Course } from '../types';
import CourseSearch, { CourseFilters } from './CourseSearch';
import { filterCourses } from '../utils/courseFilters';

interface CourseListProps {
  courses: Course[];
  communityId: string;
  isAdmin: boolean;
  onCourseCreated: () => void;
}

export default function CourseList({ courses = [], communityId, isAdmin, onCourseCreated }: CourseListProps) {
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
  });

  const filteredCourses = useMemo(() => 
    filterCourses(courses, filters),
    [courses, filters]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Courses</h2>
        {isAdmin && (
          <Link
            to={`/communities/${communityId}/courses/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Course
          </Link>
        )}
      </div>

      <CourseSearch onSearch={setFilters} />

      <div className="grid grid-cols-1 gap-6">
        {filteredCourses.map((course) => (
          <Link
            key={course.id}
            to={`/communities/${communityId}/courses/${course.id}`}
            className="block bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
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
              
              <h3 className="text-xl font-semibold text-white">{course.title}</h3>
              <p className="mt-2 text-gray-300 line-clamp-2">{course.description}</p>
              
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration || 0} mins
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrollment_count || 0} enrolled
                </div>
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-1" />
                  {course.level || 'All Levels'}
                </div>
              </div>

              {course.tags && course.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium text-gray-400 bg-surface-light rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
        {filteredCourses.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No courses found matching your criteria.
            {isAdmin && " Click 'Create Course' to add your first course."}
          </div>
        )}
      </div>
    </div>
  );
}