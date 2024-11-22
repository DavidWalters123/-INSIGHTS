import type { Course } from '../types';
import type { CourseFilters } from '../components/CourseSearch';

export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  return courses.filter((course) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && course.category !== filters.category) {
      return false;
    }

    // Level filter
    if (filters.level && course.level !== filters.level) {
      return false;
    }

    // Duration filter
    if (filters.duration) {
      const duration = course.duration || 0;
      switch (filters.duration) {
        case 'short':
          if (duration >= 60) return false; // > 1 hour
          break;
        case 'medium':
          if (duration < 60 || duration > 180) return false; // 1-3 hours
          break;
        case 'long':
          if (duration <= 180) return false; // > 3 hours
          break;
      }
    }

    return true;
  });
}