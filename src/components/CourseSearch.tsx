import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Course } from '../types';

interface CourseSearchProps {
  onSearch: (filters: CourseFilters) => void;
}

export interface CourseFilters {
  search: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: 'short' | 'medium' | 'long';
  tags?: string[];
}

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Personal Development'];
const DURATIONS = [
  { value: 'short', label: '< 1 hour' },
  { value: 'medium', label: '1-3 hours' },
  { value: 'long', label: '> 3 hours' }
];

export default function CourseSearch({ onSearch }: CourseSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    category: undefined,
    level: undefined,
    duration: undefined,
    tags: []
  });

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      category: undefined,
      level: undefined,
      duration: undefined,
      tags: []
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-md border ${
            showFilters
              ? 'border-primary text-primary'
              : 'border-surface-light text-gray-400 hover:text-white'
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-surface border border-surface-light rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level
              </label>
              <select
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={filters.duration || ''}
                onChange={(e) => handleFilterChange('duration', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Any Duration</option>
                {DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}